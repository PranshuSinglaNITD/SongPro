import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, X, Music, Sparkles, Mic2, Play, 
  User, LogOut, Moon, Sun, Home, LogIn
} from 'lucide-react';

export default function SidebarLayout() {
  const [isOpen, setIsOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true); // Placeholder for theme logic
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if user is logged in
  const isAuthenticated = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { name: 'Home', icon: <Home size={20} />, path: '/' },
    { name: 'AI Vibe Match', icon: <Sparkles size={20} />, path: '/dashboard' },
    { name: 'Personality Profiler', icon: <Mic2 size={20} />, path: '/profile' }, // Future route
    { name: 'Smart Player', icon: <Play size={20} />, path: '/player' }, // Future route
  ];

  return (
    <div className="flex h-screen bg-black overflow-hidden font-sans text-white">
      {/* Sidebar */}
      <aside 
        className={`${
          isOpen ? 'w-64' : 'w-20'
        } transition-all duration-300 ease-in-out bg-zinc-950 border-r border-white/10 flex flex-col relative z-20`}
      >
        {/* Sidebar Header */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-white/10">
          <Link to="/" className={`flex items-center gap-2 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400 ${!isOpen && 'hidden'}`}>
            <Music className="text-amber-400 min-w-[24px]" />
            SongPro
          </Link>
          {/* Show just the icon if closed */}
          {!isOpen && <Music className="text-amber-400 mx-auto min-w-[24px]" />}
          
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="text-gray-400 hover:text-white absolute -right-3 top-6 bg-zinc-800 rounded-full p-1 border border-white/10"
          >
            {isOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {/* Features Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2">
          {navItems.map((item) => (
            <Link 
              key={item.name}
              to={item.path}
              className={`flex items-center gap-4 px-3 py-3 rounded-xl transition group ${
                location.pathname === item.path 
                  ? 'bg-gradient-to-r from-amber-500/20 to-rose-600/20 text-amber-400 border border-amber-500/30' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="min-w-[20px]">{item.icon}</div>
              {isOpen && <span className="font-medium whitespace-nowrap">{item.name}</span>}
            </Link>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-full flex items-center gap-4 px-3 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition"
          >
            <div className="min-w-[20px]">{isDarkMode ? <Sun size={20} /> : <Moon size={20} />}</div>
            {isOpen && <span className="font-medium whitespace-nowrap">Theme</span>}
          </button>

          {isAuthenticated ? (
            <>
              <Link 
                to="/profile"
                className="w-full flex items-center gap-4 px-3 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition"
              >
                <div className="min-w-[20px]"><User size={20} /></div>
                {isOpen && <span className="font-medium whitespace-nowrap">My Profile</span>}
              </Link>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition"
              >
                <div className="min-w-[20px]"><LogOut size={20} /></div>
                {isOpen && <span className="font-medium whitespace-nowrap">Logout</span>}
              </button>
            </>
          ) : (
            <Link 
              to="/login"
              className="w-full flex items-center gap-4 px-3 py-3 rounded-xl text-amber-400 hover:bg-amber-400/10 transition"
            >
              <div className="min-w-[20px]"><LogIn size={20} /></div>
              {isOpen && <span className="font-medium whitespace-nowrap">Log In</span>}
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto bg-black">
        <Outlet /> {/* This injects Landing or Dashboard depending on the route */}
      </main>
    </div>
  );
}