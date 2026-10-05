import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import SidebarLayout from './components/SidebarLayout';
import Quiz from './pages/Quiz';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth routes without sidebar */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Landing />} />
        <Route 
          path="/quiz" 
          element={
            <ProtectedRoute>
              <Quiz />
            </ProtectedRoute>
          } 
        />
        {/* Routes wrapped in the Sidebar Layout */}
        <Route element={<SidebarLayout />}>
          <Route path="/" element={<Landing />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;