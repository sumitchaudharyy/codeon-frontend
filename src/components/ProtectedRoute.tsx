import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { API_URL } from '../utils/api';

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      
      // No token = not logged in
      if (!token) {
        setIsAuthenticated(false);
        setIsChecking(false);
        return;
      }

      // Verify token with backend
      try {
        const res = await fetch(`${API_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          // Token invalid - clear it
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setIsAuthenticated(false);
        }
      } catch (err) {
        // Network error - keep user logged in (backend might be down)
        console.error("Auth check failed:", err);
        setIsAuthenticated(true); // Trust localStorage if backend down
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [location.pathname]);

  // Show loading while checking
  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#7c5cff]/30 border-t-[#7c5cff] rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated - show page
  return <>{children}</>;
}