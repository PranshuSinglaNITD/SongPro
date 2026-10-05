import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Music } from 'lucide-react';
import axios from 'axios';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      // Calls your Node.js backend running on port 3000
      const res = await axios.post('http://localhost:3000/api/auth/login', formData);
      
      // Save the JWT token to local storage for future authenticated requests
      localStorage.setItem('token', res.data.token);
      
      // Redirect to the dashboard/home after login
      navigate('/dashboard'); 
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex bg-black">
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-rose-900 to-black items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1605722243979-fc057c79e6bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
        <div className="relative z-10 text-center p-12">
          <h2 className="text-4xl font-bold text-amber-400 mb-4">Welcome Back</h2>
          <p className="text-xl text-rose-100">The soundtrack to your life is waiting.</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-zinc-950">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 text-2xl font-bold text-amber-400 mb-10">
            <Music /> SongPro
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">Log in</h1>
          <p className="text-gray-400 mb-8">Enter your details to access your personalized vibes.</p>

          {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-6">{error}</div>}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-amber-500 text-white"
                placeholder="shahrukh@example.com"
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
            
            <button type="submit" className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-black font-bold rounded-lg transition transform hover:scale-[1.02]">
              Sign In
            </button>
          </form>

          <p className="mt-8 text-center text-gray-400">
            Don't have an account? <Link to="/signup" className="text-amber-400 hover:text-amber-300 font-medium">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}