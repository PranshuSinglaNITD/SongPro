import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Search, LogOut, Play, Sparkles } from 'lucide-react';
import axios from 'axios';

interface Track {
  track_id: string;
  track_name: string;
  artists: string;
  genre: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      // Request recommendations from Node.js, sending the current hour
      const res = await axios.post(
        'http://localhost:3000/api/recommendations', 
        { query, hourOfDay: new Date().getHours() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setTracks(res.data.tracks);
    } catch (err: any) {
      setError('Failed to fetch recommendations. Is the Python AI engine running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-600/20 rounded-full mix-blend-screen filter blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full mix-blend-screen filter blur-[100px] pointer-events-none"></div>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        {/* Search / Vibe Input */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">What's your vibe right now?</h1>
          <p className="text-gray-400 text-lg mb-8">Describe your mood, activity, or the aesthetic you want.</p>
          
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Sparkles className="text-amber-400" size={20} />
            </div>
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-32 py-4 bg-zinc-900/80 border border-zinc-700 rounded-full focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white placeholder-gray-500 text-lg backdrop-blur-sm transition shadow-xl"
              placeholder="e.g. 'Late night driving' or 'Energetic gym beats'"
            />
            <button 
              type="submit"
              disabled={loading}
              className="absolute inset-y-2 right-2 px-6 bg-gradient-to-r from-amber-500 to-rose-600 text-black font-bold rounded-full hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Thinking...' : 'Match'} <Search size={18} />
            </button>
          </form>
          {error && <p className="text-red-400 mt-4">{error}</p>}
        </div>

        {/* Results Grid */}
        {tracks.length > 0 && (
          <div className="animate-fade-in-up">
            <h2 className="text-2xl font-semibold mb-6 border-b border-zinc-800 pb-2">Your AI Playlist</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tracks.map((track, idx) => (
                <div key={idx} className="group flex items-center gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800 transition cursor-pointer">
                  <div className="w-12 h-12 rounded-md bg-zinc-800 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition">
                    <Play size={20} className="ml-1" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{track.track_name}</p>
                    <p className="text-gray-400 text-sm truncate">{track.artists}</p>
                  </div>
                  <div className="text-xs px-2 py-1 rounded-full bg-zinc-800 text-gray-300">
                    {track.genre}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}