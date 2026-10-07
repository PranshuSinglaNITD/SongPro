import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import SidebarLayout from './components/SidebarLayout';
import Quiz from './pages/Quiz';
import Profile from './pages/Profile';
import { ThemeProvider } from './context/ThemeContext';
import MoodProgression from './pages/MoodProgression';
import { PlayerProvider } from './context/PlayerContext';

function App() {
  return (
    <ThemeProvider>
    <Router>
      <Routes>
        {/* Auth routes without sidebar */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route 
          path="/quiz" 
          element={
            <ProtectedRoute>
              <Quiz />
            </ProtectedRoute>
          } 
        />
        {/* Routes wrapped in the Sidebar Layout */}
        <Route element={<PlayerProvider><SidebarLayout /></PlayerProvider>}>
          <Route path="/" element={<Landing />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/moodprogression"
            element={
              <ProtectedRoute>
                <MoodProgression />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </Router>
    </ThemeProvider>
  );
}

export default App;