import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from './useAuth';

// Public routes that don't require authentication
const publicRoutes = ['/login'];

// Routes that require admin privileges
const adminRoutes = ['/settings'];

export const useRouteGuard = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait until auth state is determined
    if (loading) return;

    // Current path
    const path = router.pathname;

    // If not authenticated and route requires auth
    if (!isAuthenticated && !publicRoutes.includes(path)) {
      router.push('/login');
      return;
    }

    // If authenticated but trying to access login page
    if (isAuthenticated && publicRoutes.includes(path)) {
      router.push('/');
      return;
    }

    // If not admin but trying to access admin route
    if (isAuthenticated && !isAdmin && adminRoutes.some(route => path.startsWith(route))) {
      // Redirect to home page
      router.push('/');
      return;
    }
  }, [isAuthenticated, isAdmin, router.pathname, loading, router]);

  return { isLoading: loading };
}; 