
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './layouts/MainLayout';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ProfilePage from './components/ProfilePage';
import BrowseEvents from './components/BrowseEvents';
import PrivateRoute from './components/PrivateRoute';
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

              <Route element={<PrivateRoute roles={['participant', 'organizer', 'admin']} />}>
                <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
                <Route path="/profile" element={<MainLayout><ProfilePage /></MainLayout>} />
                <Route path="/events" element={<MainLayout><BrowseEvents /></MainLayout>} />
              </Route>

              <Route path="/" element={
                <MainLayout>
                  <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <h1 className="neon-text" style={{ fontSize: '3rem', marginBottom: '2rem' }}>WELCOME TO NEON MERN</h1>
                    <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
                      <Link to="/login"><button className="neon-button">Login</button></Link>
                      <Link to="/register"><button className="neon-button secondary">Register</button></Link>
                    </div>
                  </div>
                </MainLayout>
              } />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
