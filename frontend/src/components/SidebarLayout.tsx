import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu, X, Music, Sparkles, Mic2, Play,
  User, LogOut, Moon, Sun, Home, LogIn
} from 'lucide-react';
import { useTheme } from '../context/useTheme';
import SmartPlayer from './SmartPlayer';

export default function SidebarLayout() {
  const [isOpen, setIsOpen] = useState(true);
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is logged in
  const isAuthenticated = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { name: 'Home', icon: <Home size={20} />, path: '/home' },
    { name: 'AI Vibe Match', icon: <Sparkles size={20} />, path: '/dashboard' },
    { name: 'Mood Regressor', icon: <Play size={20} />, path: '/moodprogression' },
    { name: 'Personality Profiler', icon: <Mic2 size={20} />, path: '/profile' }, // Future route
    { name: 'Smart Player', icon: <Play size={20} />, path: '/player' }, // Future route
  ];

  return (
    <>
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans text-gray-900 transition-colors dark:bg-black dark:text-white">
      {/* Sidebar */}
      <aside
        className={`${isOpen ? 'w-64' : 'w-20'
          } relative z-20 flex flex-col border-r border-gray-200 bg-white transition-all duration-300 ease-in-out dark:border-white/10 dark:bg-zinc-950`}
      >
        {/* Sidebar Header */}
        <div className="flex h-20 items-center justify-between border-b border-gray-200 px-4 dark:border-white/10">
          <Link to="/" className={`flex items-center gap-2 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400 ${!isOpen && 'hidden'}`}>
            <Music className="text-amber-400 min-w-[24px]" />
            SongPro
          </Link>
          {/* Show just the icon if closed */}
          {!isOpen && <Music className="text-amber-400 mx-auto min-w-[24px]" />}

          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            className="absolute -right-3 top-6 rounded-full border border-gray-200 bg-gray-100 p-1 text-gray-500 hover:text-gray-900 dark:border-white/10 dark:bg-zinc-800 dark:text-gray-400 dark:hover:text-white"
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
              className={`flex items-center gap-4 px-3 py-3 rounded-xl transition group ${location.pathname === item.path
                  ? 'bg-gradient-to-r from-amber-500/20 to-rose-600/20 text-amber-400 border border-amber-500/30'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
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
            onClick={toggleTheme}
            aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} theme`}
            aria-pressed={isDarkMode}
            className="flex w-full items-center gap-4 rounded-xl px-3 py-3 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
          >
            <div className="min-w-[20px]">{isDarkMode ? <Sun size={20} /> : <Moon size={20} />}</div>
            {isOpen && <span className="font-medium whitespace-nowrap">{isDarkMode ? 'Light theme' : 'Dark theme'}</span>}
          </button>

          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="flex w-full items-center gap-4 rounded-xl px-3 py-3 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
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
              className="flex w-full items-center gap-4 rounded-xl px-3 py-3 text-amber-500 transition hover:bg-amber-400/10 dark:text-amber-400"
            >
              <div className="min-w-[20px]"><LogIn size={20} /></div>
              {isOpen && <span className="font-medium whitespace-nowrap">Log In</span>}
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="relative flex-1 overflow-y-auto bg-gray-50 pb-24 dark:bg-black">
        <Outlet /> {/* This injects Landing or Dashboard depending on the route */}
      </main>
    </div>
    <SmartPlayer />
    </>
  );
}