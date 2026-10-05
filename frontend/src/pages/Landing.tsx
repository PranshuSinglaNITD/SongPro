import { Link } from 'react-router-dom';
import { Play, Music, Sparkles, Mic2 } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-950 via-purple-950 to-black relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-rose-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-50"></div>
      
      <nav className="relative z-10 flex justify-between items-center p-6 lg:px-12">
        <div className="flex items-center gap-2 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400">
          <Music className="text-amber-400" />
          SongPro
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="px-6 py-2 rounded-full font-medium text-white hover:bg-white/10 transition">Log In</Link>
          <Link to="/signup" className="px-6 py-2 rounded-full font-medium bg-gradient-to-r from-amber-500 to-rose-500 text-black hover:opacity-90 transition">Sign Up</Link>
        </div>
      </nav>

      <main className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-24 pb-16">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          Your Vibe. <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400">Your Rhythm.</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mb-12">
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
      <div className="h-full p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 hover:border-amber-400/50 transition duration-300">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400/20 to-rose-400/20 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
        <p className="text-gray-400 text-sm">{desc}</p>
      </div>
    </Link>
  );
}