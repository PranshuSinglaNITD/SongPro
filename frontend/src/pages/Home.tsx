import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Activity, Mic2, ArrowRight, Play, Database } from 'lucide-react';
import axios from 'axios';

export default function Home() {
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    // Fetch user name for a personalized greeting
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('http://localhost:3000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setUserName(res.data.name.split(' ')[0]))
      .catch(() => console.error("Could not fetch user name"));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white p-6 lg:p-12 transition-colors duration-300 relative overflow-hidden">
      
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-amber-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-12">
        
        {/* Welcome Section */}
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-rose-500">{userName}</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Your SongPro Control Center. System models are loaded and ready.
          </p>
        </div>

        {/* System Status Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard 
            icon={<Database className="text-blue-500" />}
            title="Faiss Index Status"
            value="Online"
            subtitle="114,000 vectors loaded (sub-10ms)"
          />
          <MetricCard 
            icon={<Activity className="text-rose-500" />}
            title="Acoustic Baseline"
            value="Calibrated"
            subtitle="Based on your Big Five traits"
          />
          <MetricCard 
            icon={<Play className="text-green-500" />}
            title="Engine Telemetry"
            value="Active"
            subtitle="Listening for implicit feedback"
          />
        </div>

        {/* Quick Launch Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Launchpad</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <Link to="/vibe-match" className="group block p-8 rounded-3xl bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 hover:border-amber-500/50 dark:hover:border-amber-500/50 transition shadow-sm hover:shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-full transition-transform group-hover:scale-110"></div>
              <Sparkles className="text-amber-500 mb-6" size={32} />
              <h3 className="text-2xl font-bold mb-2">AI Vibe Match</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Launch the Two-Tower recommendation engine. Map your chat queries and time of day to acoustic vectors.
              </p>
              <span className="flex items-center gap-2 text-amber-500 font-medium group-hover:translate-x-2 transition-transform">
                Launch Engine <ArrowRight size={18} />
              </span>
            </Link>

            <Link to="/profile" className="group block p-8 rounded-3xl bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 hover:border-rose-500/50 dark:hover:border-rose-500/50 transition shadow-sm hover:shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-bl-full transition-transform group-hover:scale-110"></div>
              <Mic2 className="text-rose-500 mb-6" size={32} />
              <h3 className="text-2xl font-bold mb-2">Acoustic Profiler</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                View your mathematical musical DNA and recalibrate your Big Five (OCEAN) personality traits.
              </p>
              <span className="flex items-center gap-2 text-rose-500 font-medium group-hover:translate-x-2 transition-transform">
                View Profile <ArrowRight size={18} />
              </span>
            </Link>

          </div>
        </div>

      </div>
    </div>
  );
}

function MetricCard({ icon, title, value, subtitle }: any) {
  return (
    <div className="bg-white dark:bg-zinc-900/50 p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm flex items-start gap-4">
      <div className="p-3 bg-gray-50 dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-800">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
        <p className="text-xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </div>
    </div>
  );
}