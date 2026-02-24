import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './layouts/MainLayout';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ProfilePage from './components/ProfilePage';
import OrganizerProfilePage from './components/OrganizerProfilePage';
import EventDetailPage from './components/EventDetailPage';
import BrowseEvents from './components/BrowseEvents';
import ClubsPage from './components/ClubsPage';
import ClubDetailPage from './components/ClubDetailPage';
import ForgotPassword from './components/ForgotPassword';
import PrivateRoute from './components/PrivateRoute';
import LandingPage from './components/LandingPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
              <Route path="/register" element={<MainLayout><Register /></MainLayout>} />
              <Route path="/forgot-password" element={<MainLayout><ForgotPassword /></MainLayout>} />

              <Route element={<PrivateRoute roles={['participant', 'organizer', 'admin']} />}>
                <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
                <Route path="/profile" element={<MainLayout><ProfilePage /></MainLayout>} />
                <Route path="/organizer/profile" element={<MainLayout><OrganizerProfilePage /></MainLayout>} />
                <Route path="/organizer/event/:id" element={<MainLayout><EventDetailPage /></MainLayout>} />
                <Route path="/events" element={<MainLayout><BrowseEvents /></MainLayout>} />
                <Route path="/clubs" element={<MainLayout><ClubsPage /></MainLayout>} />
                <Route path="/clubs/:id" element={<MainLayout><ClubDetailPage /></MainLayout>} />
              </Route>

              <Route path="/" element={<MainLayout><LandingPage /></MainLayout>} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
