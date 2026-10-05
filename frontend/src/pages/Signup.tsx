import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Music } from 'lucide-react';
import axios from 'axios';

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      // Calls your Node.js backend registration route
      const res = await axios.post('http://localhost:3000/api/auth/register', formData);
      
      // Save token and navigate
      localStorage.setItem('token', res.data.token);
      navigate('/login'); // You can change this to navigate('/quiz') later when you build the personality quiz
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex bg-black flex-row-reverse">
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-bl from-purple-900 to-black items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516280440502-85f2694a5e30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
        <div className="relative z-10 text-center p-12">
          <h2 className="text-4xl font-bold text-amber-400 mb-4">Discover Your Sound</h2>
          <p className="text-xl text-purple-200">Join the next generation of music discovery.</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-zinc-950">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 text-2xl font-bold text-amber-400 mb-10">
            <Music /> SongPro
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-400 mb-8">Tell us about yourself to begin.</p>

          {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-6">{error}</div>}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-amber-500 text-white"
                placeholder="Kabir Singh"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-amber-500 text-white"
                placeholder="kabir@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <input 
                type="password" 
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-amber-500 text-white"
                placeholder="••••••••"
              />
            </div>
            
            <button type="submit" className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-black font-bold rounded-lg transition transform hover:scale-[1.02] mt-4">
              Create Account
            </button>
          </form>

          <p className="mt-8 text-center text-gray-400">
            Already have an account? <Link to="/login" className="text-amber-400 hover:text-amber-300 font-medium">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}