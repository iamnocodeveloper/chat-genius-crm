import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import AppLayout from '@/components/layout/AppLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import SuperAdminImpersonationLayout from '@/components/layout/SuperAdminImpersonationLayout';
import { logger } from '@/lib/logger';
import { supabase } from '@/integrations/supabase/client';
import ErrorBoundary from '@/components/ErrorBoundary';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireSuperAdmin = false }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, error: profileError, retrying, retryCount, isSuperAdmin, isClient, isImpersonating, refetchProfile } = useProfile();
  const location = useLocation();

  logger.debug('ProtectedRoute - authLoading:', authLoading, 'profileType:', profile?.profile_type);

  // Show loading while auth or profile is loading.
  // If we're auto-retrying after a transient failure, show a "Reconnecting…" message
  // instead of the generic spinner — keeps the user informed without forcing manual action.
  if (authLoading || profileLoading) {
    const reconnecting = retrying && retryCount > 0;
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">
            {reconnecting
              ? `Reconectando con el servidor… (intento ${retryCount})`
              : 'Cargando...'}
          </p>
          {reconnecting && (
            <p className="mt-1 text-xs text-muted-foreground/70">
              Esto puede tardar unos segundos si el servidor está saturado.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Redirect to login if no user
  if (!user) {
    logger.debug('No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Profile failed to load with a NON-recoverable error (profile not found, 401/403, etc.)
  // Transient errors (timeout/network/5xx) never reach this branch — the hook keeps retrying.
  if (profileError && !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-4">
          <h2 className="text-xl font-semibold text-foreground">No pudimos cargar tu perfil</h2>
          <p className="text-sm text-muted-foreground">{profileError}</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={refetchProfile}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition"
            >
              Reintentar
            </button>
            <button
              onClick={async () => { await supabase.auth.signOut(); window.location.href = '/login'; }}
              className="px-4 py-2 rounded-md bg-muted text-foreground hover:opacity-90 transition"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If profile is not loaded yet, show loading
  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  // Handle super admin routes
  if (requireSuperAdmin && !isSuperAdmin) {
    logger.debug('Access denied: Super admin required');
    return <Navigate to="/" replace />;
  }

  // Redirect super admin to admin panel if trying to access regular routes (unless impersonating)
  if (isSuperAdmin && !location.pathname.startsWith('/admin') && !requireSuperAdmin && !isImpersonating) {
    logger.debug('Super admin detected, redirecting to admin panel');
    return <Navigate to="/admin" replace />;
  }

  // Redirect regular clients to main panel if trying to access admin routes
  if ((isClient || profile?.profile_type === 'cajero') && location.pathname.startsWith('/admin')) {
    logger.debug('Regular client or cajero trying to access admin, redirecting to main panel');
    return <Navigate to="/" replace />;
  }

  // Choose the appropriate layout based on user type and impersonation status
  // Each route is wrapped in ErrorBoundary so a render error in one page doesn't crash the entire app
  if (requireSuperAdmin) {
    return <AdminLayout><ErrorBoundary>{children}</ErrorBoundary></AdminLayout>;
  } else if (isSuperAdmin && isImpersonating) {
    return <SuperAdminImpersonationLayout><ErrorBoundary>{children}</ErrorBoundary></SuperAdminImpersonationLayout>;
  } else {
    return <AppLayout><ErrorBoundary>{children}</ErrorBoundary></AppLayout>;
  }
};

export default ProtectedRoute;