import { useState } from 'react';
import { Search, Play, Sparkles } from 'lucide-react';
import axios from 'axios';

interface Track {
  track_id: string;
  track_name: string;
  artists: string;
  genre: string;
}

export default function Dashboard() {
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    } catch (error: unknown) {
      if (axios.isAxiosError<{ error?: string; message?: string }>(error)) {
        const status = error.response?.status;
        const responseMessage = error.response?.data?.error || error.response?.data?.message;
        setError(
          responseMessage ||
          (status === 401
            ? 'Your session has expired. Please log in again.'
            : error.response
              ? 'The recommendation request failed. Check the server logs for details.'
              : 'Could not reach the SongPro API. Make sure the backend is running.')
        );
      } else {
        setError('An unexpected error occurred while fetching recommendations.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50 text-gray-900 transition-colors dark:bg-black dark:text-white">
      {/* Background Glow */}
      <div className="pointer-events-none absolute left-1/4 top-0 h-96 w-96 rounded-full bg-rose-300/30 mix-blend-multiply blur-[100px] dark:bg-rose-600/20 dark:mix-blend-screen"></div>
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-purple-300/30 mix-blend-multiply blur-[100px] dark:bg-purple-600/20 dark:mix-blend-screen"></div>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        {/* Search / Vibe Input */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">What's your vibe right now?</h1>
          <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">Describe your mood, activity, or the aesthetic you want.</p>
          
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Sparkles className="text-amber-400" size={20} />
            </div>
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-full border border-gray-300 bg-white/90 py-4 pl-12 pr-32 text-lg text-gray-900 shadow-xl backdrop-blur-sm transition placeholder:text-gray-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-white dark:placeholder:text-gray-500"
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
            <h2 className="mb-6 border-b border-gray-200 pb-2 text-2xl font-semibold dark:border-zinc-800">Your AI Playlist</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tracks.map((track, idx) => (
                <div key={idx} className="group flex cursor-pointer items-center gap-4 rounded-xl border border-gray-200 bg-white/80 p-4 transition hover:bg-gray-100 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:bg-zinc-800">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gray-100 transition group-hover:bg-amber-500 group-hover:text-black dark:bg-zinc-800">
                    <Play size={20} className="ml-1" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-gray-900 dark:text-white">{track.track_name}</p>
                    <p className="truncate text-sm text-gray-600 dark:text-gray-400">{track.artists}</p>
                  </div>
                  <div className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-zinc-800 dark:text-gray-300">
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