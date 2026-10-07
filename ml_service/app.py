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
from fastapi import APIRouter
import math

app = FastAPI(title="RecEngine ML Service")
def encode_time(hour: float):
    """
    Converts a 24-hour format time into a cyclic 2D vector.
    """
    # Map the hour (0-24) to a full circle (0 to 2π radians)
    radians = (hour / 24.0) * (2 * math.pi)
    
    # Return the sine and cosine coordinates
    return np.array([math.sin(radians), math.cos(radians)], dtype=np.float32)

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

class ProgressionRequest(BaseModel):
    start_query: str
    end_query: str
    ocean: list[float]
    hour_of_day: float
    steps: int = 10

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
text_encoder=SentenceTransformer('all-MiniLM-L6-v2')
def get_track_metadata(idx):
    """
    Takes a Faiss vector index and returns the track details.
    """
    # Convert numpy integer to standard Python integer for JSON lookup
    track = song_metadata[int(idx)]
    
    # Ensure it returns the format React is expecting
    return {
        "track_id": track.get("track_id", str(idx)),
        "track_name": track.get("track_name", "Unknown Track"),
        "artists": track.get("artists", "Unknown Artist"),
        "genre": track.get("genre", "Unknown"),
        "energy": track.get("energy", 0.5),
        "valence": track.get("valence", 0.5),
        "similarity_score": 0.0 # Placeholder for the progression route
    }
def get_target_energy(query: str, default: float = 0.5) -> float:
    """
    NLP Heuristic rule-base to anchor the start and end points of the vector space.
    """
    q = query.lower()
    if any(w in q for w in ["sad", "broken", "sleep", "calm", "relax", "chill", "cry"]):
        return 0.2
    if any(w in q for w in ["motivation", "workout", "gym", "party", "hype", "run"]):
        return 0.85
    if any(w in q for w in ["focus", "study", "work", "read"]):
        return 0.4
    return default
@app.post("/recommend/progression")
async def recommend_progression(req: ProgressionRequest):
    # 1. Encode text, time, and personality
    start_text_emb = text_encoder.encode([req.start_query])
    end_text_emb = text_encoder.encode([req.end_query])
    
    time_emb = np.array([encode_time(req.hour_of_day)], dtype=np.float32)
    ocean_emb = np.array([req.ocean], dtype=np.float32)
    
    start_input = torch.tensor(np.hstack([start_text_emb, ocean_emb, time_emb]), dtype=torch.float32)
    end_input = torch.tensor(np.hstack([end_text_emb, ocean_emb, time_emb]), dtype=torch.float32)
    
    with torch.no_grad():
        z_start = user_tower(start_input).numpy()[0]
        z_end = user_tower(end_input).numpy()[0]
        
    # 2. Establish Acoustic Anchors
    start_energy_target = get_target_energy(req.start_query, 0.3)
    end_energy_target = get_target_energy(req.end_query, 0.8)
        
    # 3. Two-Pass Interpolation & Reranking
    playlist = []
    seen_track_ids = set()
    
    for i in range(req.steps):
        alpha = i / max(1, (req.steps - 1))
        
        # Calculate ideal mathematical state for this exact step
        z_interp = (1.0 - alpha) * z_start + alpha * z_end
        z_interp = np.array([z_interp], dtype=np.float32)
        target_energy = start_energy_target + alpha * (end_energy_target - start_energy_target)
        
        # PASS 1: Broad Neural Retrieval (Get top 20 instead of 1)
        distances, indices = faiss_index.search(z_interp, 20)
        
        candidates = []
        for idx in indices[0]:
            track = get_track_metadata(idx)
            if track['track_id'] not in seen_track_ids:
                # PASS 2: Deterministic Penalty Scoring
                # Calculate how far the actual track is from our perfect energy curve
                energy_penalty = abs(track['energy'] - target_energy)
                candidates.append((energy_penalty, track))
                
        # Sort by lowest penalty (closest to target energy)
        candidates.sort(key=lambda x: x[0])
        
        if candidates:
            best_track = candidates[0][1]
            seen_track_ids.add(best_track['track_id'])
            playlist.append(best_track)
            
    return playlist

if __name__=="__main__":
    import uvicorn
    uvicorn.run(app,host="127.0.0.1",port=8000)