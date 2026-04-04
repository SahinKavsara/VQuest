import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout & Auth
import { Navbar } from './components/Navbar';
import { AdminSidebar } from './components/AdminSidebar';
import { ProtectedRoute } from './components/ProtectedRoute';

// User Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LobbyPage from './pages/LobbyPage';
import GameRoomPage from './pages/GameRoomPage';
import ProfilePage from './pages/ProfilePage';
import PackagesPage from './pages/PackagesPage';
import SuggestPage from './pages/SuggestPage';
import NotificationsPage from './pages/NotificationsPage';
import AnalysisPage from './pages/AnalysisPage';

// Admin Pages

import AdminUsers from './pages/admin/AdminUsers';
import AdminQuestions from './pages/admin/AdminQuestions';
import AdminCategories from './pages/admin/AdminCategories';
import AdminRooms from './pages/admin/AdminRooms';
import AdminSuggestions from './pages/admin/AdminSuggestions';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminAiPrompt from './pages/admin/AdminAiPrompt';

// Layout wrappers
const UserLayout = ({ children }) => (
  <div className="app-layout" style={{ flexDirection: 'column' }}>
    <Navbar />
    <main className="main-content">
      <div className="page-container">{children}</div>
    </main>
  </div>
);

const AdminLayout = ({ children }) => (
  <div className="app-layout">
    <AdminSidebar />
    <main className="main-content">
      <div className="page-container">{children}</div>
    </main>
  </div>
);

import { useState, useEffect } from 'react';

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  if (!isReady) return <div className="loading-center"><span className="spinner-lg spinner" /></div>;

  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1c2040', color: '#e8eaf6', border: '1px solid rgba(108,71,255,0.4)' } }} />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected User Routes */}
        <Route path="/" element={<ProtectedRoute><UserLayout><LobbyPage /></UserLayout></ProtectedRoute>} />
        <Route path="/rooms/:roomId" element={<ProtectedRoute><UserLayout><GameRoomPage /></UserLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><UserLayout><ProfilePage /></UserLayout></ProtectedRoute>} />
        <Route path="/packages" element={<ProtectedRoute><UserLayout><PackagesPage /></UserLayout></ProtectedRoute>} />
        <Route path="/suggest" element={<ProtectedRoute><UserLayout><SuggestPage /></UserLayout></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><UserLayout><NotificationsPage /></UserLayout></ProtectedRoute>} />
        <Route path="/analysis" element={<ProtectedRoute><UserLayout><AnalysisPage /></UserLayout></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout><AdminQuestions /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminLayout><AdminUsers /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/categories" element={<ProtectedRoute adminOnly><AdminLayout><AdminCategories /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/rooms" element={<ProtectedRoute adminOnly><AdminLayout><AdminRooms /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/suggestions" element={<ProtectedRoute adminOnly><AdminLayout><AdminSuggestions /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/notifications" element={<ProtectedRoute adminOnly><AdminLayout><AdminNotifications /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/ai-prompt" element={<ProtectedRoute adminOnly><AdminLayout><AdminAiPrompt /></AdminLayout></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
