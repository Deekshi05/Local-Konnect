import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/common.css';

// Layout Components
import CustomerLayout from './components/Layout/CustomerLayout';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';

// Common Components
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';

// Custom Hooks
import { useAuth } from './hooks/useAuth';

// Auth Components
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Unauthorized from './pages/Auth/Unauthorized';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Existing Pages
import About from './pages/About/About';
import Home from './pages/Home/Home';
import Visualize from './pages/visualizer/Visualize';

const PublicRoutes = () => (
  <>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/visualize" element={<Visualize />} />
    </Routes>
    <Footer />
  </>
);

const App = () => {
  return (
    <ErrorBoundary>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/about" element={<About />} />
          <Route path="/visualize" element={<Visualize />} />

          {/* Customer Protected Routes */}
          <Route
            path="/customer/*"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <CustomerLayout />
              </ProtectedRoute>
            }
          />

          {/* Redirect from old routes to new ones */}
          <Route path="/services" element={<Navigate to="/customer/services" replace />} />
          <Route path="/appointments" element={<Navigate to="/customer/appointments" replace />} />
          <Route path="/tenders" element={<Navigate to="/customer/tenders" replace />} />
          <Route path="/profile" element={<Navigate to="/customer/profile" replace />} />

          {/* Logout Route */}
          <Route 
            path="/logout" 
            element={
              (() => {
                localStorage.clear();
                return <Navigate to="/login" replace />;
              })()
            } 
          />

          {/* Home Route */}
          <Route path="/" element={<Home />} />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;
