import json
import faiss
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from sentence_transformers import SentenceTransformer
from typing import List, Optional

app = FastAPI(title="RecEngine ML Service")

# 1. Re-declare UserTower architecture identical to training
class UserTower(nn.Module):
    def __init__(self, input_dim=391, embedding_dim=64):
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(input_dim, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.Linear(128, embedding_dim)
        )

    def forward(self, x):
        return F.normalize(self.network(x), p=2, dim=-1)

# 2. State & Asset Initialization
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

user_tower = UserTower(input_dim=391, embedding_dim=64)
user_tower.load_state_dict(torch.load("user_tower.pt", map_location=device))
user_tower.to(device)
user_tower.eval()

faiss_index = faiss.read_index("song_index.bin")
sentence_model = SentenceTransformer("all-MiniLM-L6-v2", device=str(device))

with open("song_metadata.json", "r") as f:
    song_metadata = json.load(f)

class RecommendRequest(BaseModel):
    chat_query: str = Field(..., json_schema_extra={"example": "Late night studying beats"})
    ocean: List[float] = Field(..., json_schema_extra={"example": [0.8, 0.6, 0.2, 0.7, 0.3]}) # [O, C, E, A, N]
    hour_of_day: float = Field(..., ge=0.0, le=24.0, json_schema_extra={"example": 23.5})
    top_k: Optional[int] = 10
    max_per_artist: Optional[int] = 2

class TrackResponse(BaseModel):
    track_id: str
    track_name: str
    artists: str
    genre: str
    energy: float
    valence: float
    similarity_score: float

@app.post("/recommend", response_model=List[TrackResponse])
def get_recommendations(req: RecommendRequest):
    try:
        # A. Encode chat string
        chat_emb = sentence_model.encode([req.chat_query], convert_to_numpy=True).astype(np.float32)

        # B. Calculate cyclic time
        sin_t = np.sin(2 * np.pi * req.hour_of_day / 24.0).astype(np.float32)
        cos_t = np.cos(2 * np.pi * req.hour_of_day / 24.0).astype(np.float32)
        time_vec = np.array([[sin_t, cos_t]], dtype=np.float32)

        # C. User feature vector: [5 OCEAN] + [2 Time] + [384 Chat] = 391D
        ocean_vec = np.array([req.ocean], dtype=np.float32)
        user_input = np.hstack([ocean_vec, time_vec, chat_emb]).astype(np.float32)

        # D. User Tower inference (O(1))
        with torch.no_grad():
            user_tensor = torch.tensor(user_input, dtype=torch.float32).to(device)
            user_emb = user_tower(user_tensor).cpu().numpy()

        # E. Faiss MIPS search (O(log N) to O(N))
        # Fetch 4x candidates to enable artist diversity and deduplication filtering
        fetch_k = req.top_k * 4
        distances, indices = faiss_index.search(user_emb, fetch_k)

        # F. Post-filtering with Artist Diversity Guardrail
        results = []
        artist_counts = {}
        seen_tracks = set()

        for dist, idx in zip(distances[0], indices[0]):
            meta = song_metadata[idx]
            track_name = meta["track_name"].strip().lower()
            artist = meta["artists"].strip().lower()
            track_sig = (track_name, artist)

            if track_sig in seen_tracks:
                continue

            current_artist_count = artist_counts.get(artist, 0)
            if current_artist_count >= req.max_per_artist:
                continue

            seen_tracks.add(track_sig)
            artist_counts[artist] = current_artist_count + 1

            results.append(TrackResponse(
                track_id=meta["track_id"],
                track_name=meta["track_name"],
                artists=meta["artists"],
                genre=meta.get("track_genre", "unknown"),
                energy=float(meta["energy"]),
                valence=float(meta["valence"]),
                similarity_score=float(dist)
            ))

            if len(results) == req.top_k:
                break

        return results

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__=="__main__":
    import uvicorn
    uvicorn.run(app,host="127.0.0.1",port=8000)