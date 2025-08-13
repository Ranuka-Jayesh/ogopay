import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import ProfilePage from './components/Admin/ProfilePage';
import { FriendDashboard } from './components/Friend/FriendDashboard';
import LandingPage from './components/Shared/LandingPage';
import BlogPage from './components/Shared/BlogPage';
import ContactPage from './components/Shared/ContactPage';
import { TrackingPage } from './components/Shared/TrackingPage';
import LoadingPage from './components/Shared/LoadingPage';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';

// Tracking page wrapper component
const TrackingPageWrapper: React.FC = () => {
  const { trackingUrl } = useParams<{ trackingUrl: string }>();
  return trackingUrl ? <TrackingPage trackingUrl={trackingUrl} /> : <Navigate to="/" />;
};

const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    // Show loading page for 3 seconds on initial load
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Show loading page first
  if (showLoading) {
    return <LoadingPage onLoadingComplete={() => setShowLoading(false)} />;
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/track/:trackingUrl" element={<TrackingPageWrapper />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={user?.role === 'admin' ? <AdminDashboard /> : <FriendDashboard />} />
      <Route path="/profile" element={user?.role === 'admin' ? <ProfilePage /> : <Navigate to="/" />} />
      <Route path="/track/:trackingUrl" element={<TrackingPageWrapper />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <Router>
            <AppContent />
          </Router>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;