import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, createRoutesFromElements, Route } from 'react-router-dom';
import './index.css';
import { AuthProvider } from './lib/auth';
import { routes, ProtectedRoute, AuthRoute } from './lib/router';
import { SettingsProvider } from './lib/settings-context';
import { ThemeProvider } from './components/ThemeProvider';
import { ToastProvider } from './components/Toast';
import App from './App';
import AuthForm from './components/AuthForm';
import { Navigate } from 'react-router-dom';

// Create a router that doesn't use the SettingsProvider
const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AuthProvider>
        <ToastProvider>
          <SettingsProvider>
            <ThemeProvider>
              <ProtectedRoute />
            </ThemeProvider>
          </SettingsProvider>
        </ToastProvider>
      </AuthProvider>
    ),
    children: [
      {
        path: '/',
        element: <Navigate to="/dashboard" replace />,
      },
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
    path: '/',
    element: (
      <AuthProvider>
        <ToastProvider>
          <AuthRoute />
        </ToastProvider>
      </AuthProvider>
    ),
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
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
