import { useState } from 'react';
import { Sparkles, ArrowDown, Play, Activity } from 'lucide-react';
import axios from 'axios';

interface Track {
  track_id: string;
  track_name: string;
  artists: string;
  genre: string;
  energy: number;
}

export default function MoodProgression() {
  const [startQuery, setStartQuery] = useState('');
  const [endQuery, setEndQuery] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startQuery || !endQuery) return;
    
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:3000/api/recommendations/progression', 
        { startQuery, endQuery, steps: 10 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setTracks(res.data.tracks);
    } catch (err) {
      setError('Failed to generate journey. Ensure ML engine is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white p-6 lg:p-12">
      <div className="max-w-4xl mx-auto space-y-12">
        
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Mood Progression</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Define your starting state and your desired destination. Our neural network will calculate a smooth path through the acoustic latent space.
          </p>
        </div>

        <form onSubmit={handleGenerate} className="bg-white dark:bg-zinc-900/50 p-8 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm relative">
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Starting Vibe (Vector A)</label>
              <input 
                type="text" required
                value={startQuery} onChange={(e) => setStartQuery(e.target.value)}
                className="w-full p-4 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-700 rounded-xl focus:border-amber-500 outline-none transition"
                placeholder="e.g. Stressed from exams, need to calm down"
              />
            </div>

            <div className="flex justify-center -my-2 relative z-10">
              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 p-2 rounded-full shadow-sm">
                <ArrowDown className="text-amber-500" size={24} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Ending Vibe (Vector B)</label>
              <input 
                type="text" required
                value={endQuery} onChange={(e) => setEndQuery(e.target.value)}
                className="w-full p-4 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-700 rounded-xl focus:border-rose-500 outline-none transition"
                placeholder="e.g. High energy workout motivation"
              />
            </div>
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full mt-8 py-4 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-black font-bold rounded-xl transition flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Calculating Path...' : 'Interpolate Journey'} <Sparkles size={20} />
          </button>
          
          {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
        </form>

        {tracks.length > 0 && (
          <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-[27px] before:w-0.5 before:bg-gradient-to-b before:from-amber-500 before:to-rose-600">
            {tracks.map((track, idx) => (
              <div key={idx} className="flex items-center gap-6 relative z-10">
                <div className="w-14 h-14 rounded-full bg-zinc-900 border-4 border-black dark:border-black flex items-center justify-center text-amber-500 font-bold shrink-0">
                  {idx + 1}
                </div>
                
                <div className="flex-1 bg-white dark:bg-zinc-900/80 p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 flex justify-between items-center group hover:border-amber-500/50 transition cursor-pointer">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{track.track_name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{track.artists}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-gray-400 flex items-center gap-1">
                      <Activity size={14}/> {track.energy.toFixed(2)} Energy
                    </span>
                    <button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition">
                      <Play size={16} className="ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}