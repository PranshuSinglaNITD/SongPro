import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Edit3 } from 'lucide-react';
import axios from 'axios';

interface UserProfile {
  name: string;
  email: string;
  oceanScores: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
}

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Standard fetch for user data
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        // Note: You will need a simple GET /api/auth/me route on your Node backend to return this data
        const res = await axios.get('http://localhost:3000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white p-6 md:p-12 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex items-center gap-6 p-8 bg-white dark:bg-zinc-900/50 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
            {profile?.name.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{profile?.name || 'User'}</h1>
            <p className="text-gray-500 dark:text-gray-400">{profile?.email}</p>
          </div>
        </div>

        {/* Acoustic Personality Dashboard */}
        <div className="bg-white dark:bg-zinc-900/50 p-8 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="text-amber-500"/> Acoustic DNA Baseline
            </h2>
            <button 
              onClick={() => navigate('/quiz')}
              className="flex items-center gap-2 text-sm font-medium text-rose-500 hover:text-rose-600 bg-rose-50 dark:bg-rose-500/10 px-4 py-2 rounded-full transition"
            >
              <Edit3 size={16}/> Retake Quiz
            </button>
          </div>

          <div className="space-y-6">
            {profile?.oceanScores && Object.entries(profile.oceanScores).map(([trait, score]) => (
              <div key={trait}>
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span className="capitalize">{trait}</span>
                  <span className="text-amber-500">{Math.round(score * 100)}%</span>
                </div>
                <div className="w-full h-3 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-rose-500 rounded-full"
                    style={{ width: `${score * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}