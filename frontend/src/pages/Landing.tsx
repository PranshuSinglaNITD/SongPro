import { Link } from 'react-router-dom';
import { Play, Music, Sparkles, Mic2 } from 'lucide-react';

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-rose-50 via-purple-50 to-white text-gray-900 dark:from-rose-950 dark:via-purple-950 dark:to-black dark:text-white">
      {/* Background decoration */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-rose-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-50"></div>
      
      <nav className="relative z-10 flex justify-between items-center p-6 lg:px-12">
        <div className="flex items-center gap-2 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400">
          <Music className="text-amber-400" />
          SongPro
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="rounded-full px-6 py-2 font-medium text-gray-800 transition hover:bg-black/5 dark:text-white dark:hover:bg-white/10">Log In</Link>
          <Link to="/signup" className="px-6 py-2 rounded-full font-medium bg-gradient-to-r from-amber-500 to-rose-500 text-black hover:opacity-90 transition">Sign Up</Link>
        </div>
      </nav>

      <main className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-24 pb-16">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          Your Vibe. <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400">Your Rhythm.</span>
        </h1>
        <p className="mb-12 max-w-2xl text-lg text-gray-600 dark:text-gray-300 md:text-xl">
          From soulful Sufi melodies to high-energy Bollywood anthems. Let our AI map your mood and personality to the perfect track.
        </p>

        {/* Feature Hyperlinks Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
          <FeatureCard 
            icon={<Sparkles />} 
            title="AI Vibe Match" 
            desc="Chat with our engine to find the exact Bollywood or indie track for your current mood."
            link="/login"
          />
          <FeatureCard 
            icon={<Mic2 />} 
            title="Personality Profiler" 
            desc="Take the TIPI test to build your unique acoustic profile baseline."
            link="/signup"
          />
          <FeatureCard 
            icon={<Play />} 
            title="Smart Player" 
            desc="Listen instantly. Our engine learns from your skips and replays."
            link="/login"
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, desc, link }: { icon: React.ReactNode, title: string, desc: string, link: string }) {
  return (
    <Link to={link} className="block group">
      <div className="h-full rounded-2xl border border-gray-200 bg-white/70 p-6 backdrop-blur-md transition duration-300 hover:border-amber-400/50 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400/20 to-rose-400/20 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition">
          {icon}
        </div>
        <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
      </div>
    </Link>
  );
}