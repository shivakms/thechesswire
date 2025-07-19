export enum UserRole {
  FREE_USER = 'free_user',
  PREMIUM_USER = 'premium_user',
  TITLED_PLAYER = 'titled_player',
  CONTENT_CREATOR = 'content_creator',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin' // You - full access
}

export const DashboardAccess = {
  // Free user dashboards (basic features)
  FREE_DASHBOARDS: [
    'main-dashboard',
    'memory-archive',
    'personalization',
    'analytics'
  ],

  // Premium user dashboards (advanced features)
  PREMIUM_DASHBOARDS: [
    'main-dashboard',
    'memory-archive',
    'personalization',
    'analytics',
    'soulcinema',
    'echosage',
    'voice-narration'
  ],

  // Titled player dashboards (monetization features)
  TITLED_PLAYER_DASHBOARDS: [
    'main-dashboard',
    'memory-archive',
    'personalization',
    'analytics',
    'soulcinema',
    'echosage',
    'voice-narration',
    'earnings',
    'premium-infrastructure'
  ],

  // Content creator dashboards (social and viral features)
  CONTENT_CREATOR_DASHBOARDS: [
    'main-dashboard',
    'memory-archive',
    'personalization',
    'analytics',
    'soulcinema',
    'echosage',
    'voice-narration',
    'social-media',
    'social-virality',
    'earnings'
  ],

  // Admin dashboards (management features)
  ADMIN_DASHBOARDS: [
    'main-dashboard',
    'memory-archive',
    'personalization',
    'analytics',
    'soulcinema',
    'echosage',
    'voice-narration',
    'social-media',
    'social-virality',
    'earnings',
    'premium-infrastructure',
    'security',
    'user-management',
    'system-monitoring',
    'content-moderation',
    'revenue-analytics'
  ],

  // Super admin dashboards (you - full access)
  SUPER_ADMIN_DASHBOARDS: [
    'main-dashboard',
    'memory-archive',
    'personalization',
    'analytics',
    'soulcinema',
    'echosage',
    'voice-narration',
    'social-media',
    'social-virality',
    'earnings',
    'premium-infrastructure',
    'security',
    'user-management',
    'system-monitoring',
    'content-moderation',
    'revenue-analytics',
    'admin-panel',
    'database-management',
    'api-management',
    'deployment-control',
    'backup-restore',
    'system-logs',
    'performance-monitoring',
    'security-audit',
    'crisis-management'
  ]
} as const;

export interface DashboardPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManage: boolean;
  canExport: boolean;
  canShare: boolean;
}

export const getDashboardPermissions = (userRole: UserRole, dashboardId: string): DashboardPermissions => {
  const accessibleDashboards = getAccessibleDashboards(userRole);
  const hasAccess = accessibleDashboards.indexOf(dashboardId) !== -1;
  
  switch (userRole) {
    case UserRole.SUPER_ADMIN:
      return {
        canView: true,
        canEdit: true,
        canDelete: true,
        canManage: true,
        canExport: true,
        canShare: true
      };
    
    case UserRole.ADMIN:
      return {
        canView: hasAccess,
        canEdit: hasAccess,
        canDelete: hasAccess,
        canManage: hasAccess,
        canExport: hasAccess,
        canShare: hasAccess
      };
    
    case UserRole.CONTENT_CREATOR:
      return {
        canView: hasAccess,
        canEdit: hasAccess,
        canDelete: false,
        canManage: dashboardId === 'social-media' || dashboardId === 'social-virality',
        canExport: hasAccess,
        canShare: hasAccess
      };
    
    case UserRole.TITLED_PLAYER:
      return {
        canView: hasAccess,
        canEdit: hasAccess,
        canDelete: false,
        canManage: dashboardId === 'earnings',
        canExport: hasAccess,
        canShare: dashboardId !== 'earnings'
      };
    
    case UserRole.PREMIUM_USER:
      return {
        canView: hasAccess,
        canEdit: hasAccess,
        canDelete: false,
        canManage: false,
        canExport: hasAccess,
        canShare: true
      };
    
    case UserRole.FREE_USER:
    default:
      return {
        canView: hasAccess,
        canEdit: false,
        canDelete: false,
        canManage: false,
        canExport: false,
        canShare: false
      };
  }
};

export const getAccessibleDashboards = (userRole: UserRole): readonly string[] => {
  switch (userRole) {
    case UserRole.SUPER_ADMIN:
      return DashboardAccess.SUPER_ADMIN_DASHBOARDS;
    case UserRole.ADMIN:
      return DashboardAccess.ADMIN_DASHBOARDS;
    case UserRole.CONTENT_CREATOR:
      return DashboardAccess.CONTENT_CREATOR_DASHBOARDS;
    case UserRole.TITLED_PLAYER:
      return DashboardAccess.TITLED_PLAYER_DASHBOARDS;
    case UserRole.PREMIUM_USER:
      return DashboardAccess.PREMIUM_DASHBOARDS;
    case UserRole.FREE_USER:
    default:
      return DashboardAccess.FREE_DASHBOARDS;
  }
};

export const isAdmin = (userRole: UserRole): boolean => {
  return userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN;
};

export const isSuperAdmin = (userRole: UserRole): boolean => {
  return userRole === UserRole.SUPER_ADMIN;
};

export const canAccessDashboard = (userRole: UserRole, dashboardId: string): boolean => {
  const accessibleDashboards = getAccessibleDashboards(userRole);
  return accessibleDashboards.indexOf(dashboardId) !== -1;
}; 