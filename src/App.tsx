import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Complaints from './pages/Complaints';
import LostFound from './pages/LostFound';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import AdminComplaints from './pages/AdminComplaints';
import AdminLostFound from './pages/AdminLostFound';
import StaffComplaints from './pages/StaffComplaints';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />}
      />

      {/* Protected Routes - All Users */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Profile />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Analytics />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* User Routes */}
      <Route
        path="/complaints"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <AppLayout>
              <Complaints />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/lost-found"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <AppLayout>
              <LostFound />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/complaints"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AppLayout>
              <AdminComplaints />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/lost-found"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AppLayout>
              <AdminLostFound />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Staff Routes */}
      <Route
        path="/staff/complaints"
        element={
          <ProtectedRoute allowedRoles={['staff']}>
            <AppLayout>
              <StaffComplaints />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Default Route */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
