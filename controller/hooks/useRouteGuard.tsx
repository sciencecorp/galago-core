import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from './useAuth';
import { useSession } from 'next-auth/react';

// Public routes that don't require authentication
const publicRoutes = ['/login', '/auth/signin', '/auth/error', '/auth/signup'];

// Routes that require admin privileges
const adminRoutes = ['/settings'];

export const useRouteGuard = () => {
  const { isAuthenticated: customAuthAuthenticated, isAdmin: customAuthAdmin, loading: customAuthLoading } = useAuth();
  const { data: session, status: nextAuthStatus } = useSession();
  const [isProcessing, setIsProcessing] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Combine authentication statuses
  const isAuthenticated = customAuthAuthenticated || !!session;
  const isAdmin = customAuthAdmin || (session?.isAdmin === true);
  const loading = customAuthLoading || nextAuthStatus === 'loading' || isProcessing;

  // Safety timeout to ensure we never get stuck loading
  useEffect(() => {
    // Force exit loading state after 3 seconds max
    timeoutRef.current = setTimeout(() => {
      if (isProcessing) {
        setIsProcessing(false);
      }
    }, 3000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Set isProcessing to false when auth checks complete
  useEffect(() => {
    // Even if NextAuth is authenticated but has no token, still consider auth checks complete
    const authChecksDone = 
      !customAuthLoading && 
      (nextAuthStatus !== 'loading') && 
      (nextAuthStatus === 'authenticated' || nextAuthStatus === 'unauthenticated');
    
    if (authChecksDone) {
      setIsProcessing(false);
    }
  }, [customAuthLoading, nextAuthStatus]);

  // Handle routing based on authentication state
  useEffect(() => {
    // Wait until auth state is determined
    if (customAuthLoading || nextAuthStatus === 'loading') {
      return;
    }
    
    // Current path
    const path = router.pathname;

    // If not authenticated and route requires auth
    if (!isAuthenticated && !publicRoutes.some(route => path === route || path.startsWith(route))) {
      router.push('/auth/signin');
      return;
    }

    // If authenticated but trying to access login page
    if (isAuthenticated && publicRoutes.some(route => path === route)) {
      router.push('/');
      return;
    }

    // If not admin but trying to access admin route
    if (isAuthenticated && !isAdmin && adminRoutes.some(route => path.startsWith(route))) {
      // Redirect to home page
      router.push('/');
      return;
    }
  }, [
    customAuthAuthenticated, 
    customAuthAdmin, 
    customAuthLoading, 
    session, 
    nextAuthStatus, 
    router.pathname, 
    router,
    isAuthenticated,
    isAdmin,
    isProcessing
  ]);

  return { isLoading: loading };
}; 