import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

export default function Quiz() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [traits, setTraits] = useState({
    openness: 50,
    conscientiousness: 50,
    extraversion: 50,
    agreeableness: 50,
    neuroticism: 50
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const oceanScores = {
      openness: traits.openness / 100,
      conscientiousness: traits.conscientiousness / 100,
      extraversion: traits.extraversion / 100,
      agreeableness: traits.agreeableness / 100,
      neuroticism: traits.neuroticism / 100,
    };

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:3000/api/auth/personality', 
        { oceanScores },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      navigate('/dashboard');
    } catch (error: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      setError(message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-amber-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 pointer-events-none"></div>
      
      <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 p-8 md:p-12 rounded-3xl z-10 shadow-2xl">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 text-3xl font-bold text-amber-400">
            <Music size={32} /> SongPro
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-3">Acoustic Profiler</h1>
          <p className="text-gray-400">Set your Big Five baseline to map your musical DNA before entering the dashboard.</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-6 text-center">{error}</div>}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <TraitSlider 
            label="Openness" desc="Adventurous, Experimental, Curious"
            value={traits.openness} onChange={(v) => setTraits({...traits, openness: v})} 
          />
          <TraitSlider 
            label="Conscientiousness" desc="Structured, Focused, Disciplined"
            value={traits.conscientiousness} onChange={(v) => setTraits({...traits, conscientiousness: v})} 
          />
          <TraitSlider 
            label="Extraversion" desc="Outgoing, Energetic, Social"
            value={traits.extraversion} onChange={(v) => setTraits({...traits, extraversion: v})} 
          />
          <TraitSlider 
            label="Agreeableness" desc="Empathetic, Harmonious, Warm"
            value={traits.agreeableness} onChange={(v) => setTraits({...traits, agreeableness: v})} 
          />
          <TraitSlider 
            label="Neuroticism" desc="Intense, Emotionally Driven, Sensitive"
            value={traits.neuroticism} onChange={(v) => setTraits({...traits, neuroticism: v})} 
          />
          
          <button 
            type="submit" disabled={loading}
            className="w-full py-4 mt-8 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-black font-bold rounded-xl transition flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Analyzing Profile...' : 'Complete Setup & Enter Dashboard'} <CheckCircle2 size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}

function TraitSlider({ label, desc, value, onChange }: { label: string, desc: string, value: number, onChange: (v: number) => void }) {
  return (
    <div className="bg-zinc-900/50 p-4 md:p-5 rounded-xl border border-zinc-800">
      <div className="flex justify-between items-end mb-3">
        <div>
          <h3 className="text-white font-medium text-lg">{label}</h3>
          <p className="text-sm text-gray-400">{desc}</p>
        </div>
        <span className="text-amber-400 font-mono font-bold">{value}%</span>
      </div>
      <input 
        type="range" min="0" max="100" 
        value={value} onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
      />
    </div>
  );
}