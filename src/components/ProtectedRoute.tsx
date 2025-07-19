'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Shield, AlertTriangle, Crown, Users, Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'super-admin' | 'any';
  dashboardId?: string;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole = 'any',
  dashboardId,
  fallback 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isAdmin, isSuperAdmin, checkAdminAccess, checkDashboardAccess, loading } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    checkAccess();
  }, [user, isAuthenticated, loading]);

  const checkAccess = async () => {
    if (loading) return;

    if (!isAuthenticated || !user) {
      setHasAccess(false);
      setCheckingAccess(false);
      return;
    }

    try {
      let accessGranted = false;

      // Check role-based access
      if (requiredRole === 'super-admin') {
        accessGranted = isSuperAdmin;
        console.log('🔐 Super Admin access check:', { 
          user: user.email, 
          isSuperAdmin, 
          accessGranted 
        });
      } else if (requiredRole === 'admin') {
        accessGranted = isAdmin || isSuperAdmin;
        console.log('🔐 Admin access check:', { 
          user: user.email, 
          isAdmin, 
          isSuperAdmin, 
          accessGranted 
        });
      } else {
        accessGranted = true; // 'any' role
      }

      // Check dashboard-specific access if provided
      if (dashboardId && accessGranted) {
        const dashboardAccess = await checkDashboardAccess(dashboardId);
        accessGranted = dashboardAccess;
        console.log('🔐 Dashboard access check:', { 
          dashboardId, 
          accessGranted, 
          user: user.email 
        });
      }

      setHasAccess(accessGranted);
    } catch (error) {
      console.error('❌ Access check failed:', error);
      setHasAccess(false);
    } finally {
      setCheckingAccess(false);
    }
  };

  // Show loading state
  if (loading || checkingAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4 text-lg">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Show fallback or default access denied
  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return <AccessDenied user={user} requiredRole={requiredRole} dashboardId={dashboardId} />;
  }

  // Access granted
  return <>{children}</>;
}

function AccessDenied({ 
  user, 
  requiredRole, 
  dashboardId 
}: { 
  user: any; 
  requiredRole: string; 
  dashboardId?: string; 
}) {
  const getAccessDeniedMessage = () => {
    if (requiredRole === 'super-admin') {
      return {
        title: 'Super Admin Access Required',
        message: 'This area is restricted to Super Administrators only.',
        icon: <Crown className="w-12 h-12 text-yellow-400" />
      };
    } else if (requiredRole === 'admin') {
      return {
        title: 'Admin Access Required',
        message: 'This area is restricted to Administrators only.',
        icon: <Shield className="w-12 h-12 text-blue-400" />
      };
    } else if (dashboardId) {
      return {
        title: 'Dashboard Access Denied',
        message: `You don't have permission to access the ${dashboardId} dashboard.`,
        icon: <Lock className="w-12 h-12 text-red-400" />
      };
    } else {
      return {
        title: 'Access Denied',
        message: 'You don\'t have permission to access this area.',
        icon: <AlertTriangle className="w-12 h-12 text-red-400" />
      };
    }
  };

  const { title, message, icon } = getAccessDeniedMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 border border-white/20 max-w-md w-full mx-4">
        <div className="text-center">
          {icon}
          <h1 className="text-2xl font-bold text-white mt-4">{title}</h1>
          <p className="text-gray-300 mt-2">{message}</p>
          
          {user && (
            <div className="mt-6 p-4 bg-white/5 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-gray-400 text-sm">Current User</span>
              </div>
              <p className="text-white font-medium">{user.email}</p>
              <p className="text-gray-400 text-sm capitalize">{user.role.replace('_', ' ')}</p>
            </div>
          )}
          
          <div className="mt-6">
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 