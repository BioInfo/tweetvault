import React from 'react';
import { Navigate, Outlet, RouteObject, useLocation } from 'react-router-dom';
import { useAuth } from './auth';
import AuthForm from '../components/AuthForm';
import App from '../App';

// Protected route wrapper component
export const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render the protected content
  return <Outlet />;
};

// Auth route wrapper component (redirects to dashboard if already logged in)
export const AuthRoute = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

// Define the routes
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/',
    element: <AuthRoute />,
    children: [
      {
        path: 'login',
        element: <AuthForm />,
      },
      {
        path: 'signup',
        element: <AuthForm isSignUp />,
      },
    ],
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        path: 'dashboard',
        element: <App view='dashboard' />,
      },
      {
        path: 'search',
        element: <App view='search' />,
      },
      {
        path: 'collections',
        element: <App view='collections' />,
      },
      {
        path: 'insights',
        element: <App view='insights' />,
      },
      {
        path: 'auth/callback',
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
];