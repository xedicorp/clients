/**
 * Centralized role-based permissions utility
 * ROLE HIERARCHY (Higher number = More permissions)
 */

export const ROLE_HIERARCHY = {
  superadmin: 10,
  admin: 9,
  loan_admin: 8,
  loan_manager: 7,
  accountant: 6,
  loan_operator_t1: 5,
  loan_operator_t2: 4,
  jda_file_admin: 2,
  user: 1
};

/**
 * Role descriptions
 */
export const ROLE_DESCRIPTIONS = {
  superadmin: {
    name: 'Super Administrator',
    description: 'Complete system access',
    color: '#e74c3c',
    permissions: ['All system permissions']
  },
  admin: {
    name: 'Administrator',
    description: 'Administrative access',
    color: '#3498db',
    permissions: ['User management', 'Booking management', 'Reports']
  },
  loan_admin: {
    name: 'Loan Administrator',
    description: 'Loan operations admin',
    color: '#9b59b6',
    permissions: ['Loan management', 'Documents', 'Agreements']
  },
  loan_manager: {
    name: 'Loan Manager',
    description: 'Loan team management',
    color: '#f39c12',
    permissions: ['Team management', 'Loan oversight']
  },
  accountant: {
    name: 'Accountant',
    description: 'Financial operations',
    color: '#27ae60',
    permissions: ['Payments', 'Reports', 'Transactions']
  },
  loan_operator_t1: {
    name: 'Senior Loan Operator',
    description: 'Senior processing role',
    color: '#16a085',
    permissions: ['Loan processing', 'Verification']
  },
  loan_operator_t2: {
    name: 'Junior Loan Operator',
    description: 'Junior processing role',
    color: '#95a5a6',
    permissions: ['Data entry', 'Documents']
  },
  jda_file_admin: {
    name: 'JDA File Admin',
    description: 'View booking list only',
    color: '#7f8c8d',
    permissions: ['View booking list']
  },
  user: {
    name: 'User',
    description: 'Basic access',
    color: '#bdc3c7',
    permissions: ['View only']
  }
};

// ========================
// BASIC UTILITIES
// ========================

export const getCurrentUserRole = () => {
  const role = (localStorage.getItem("spendwise_role") || "").toLowerCase();
  return role;
};

export const getCurrentUserRoleInfo = () => {
  const role = getCurrentUserRole();
  return {
    role,
    level: ROLE_HIERARCHY[role] || 0,
    info: ROLE_DESCRIPTIONS[role] || ROLE_DESCRIPTIONS.user,
    isAdmin: ['admin', 'superadmin'].includes(role),
    isSuperAdmin: role === 'superadmin',
    isLoanStaff: ['loan_admin', 'loan_manager', 'loan_operator_t1', 'loan_operator_t2'].includes(role),
    isJDAFileAdmin: role === 'jda_file_admin'
  };
};

export const hasRoleHierarchy = (userRole, requiredRole) => {
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
  return userLevel >= requiredLevel;
};

export const hasAnyRole = (roles, userRole = null) => {
  const currentRole = userRole || getCurrentUserRole();
  const roleArray = Array.isArray(roles) ? roles : [roles];
  return roleArray.includes(currentRole);
};

export const hasMinimumRole = (minimumRole, userRole = null) => {
  const currentRole = userRole || getCurrentUserRole();
  return hasRoleHierarchy(currentRole, minimumRole);
};

// ========================
// PERMISSION FUNCTIONS
// ========================

export const canMarkFileCompleted = (role = null) => {
  const r = role || getCurrentUserRole();
  return hasAnyRole(['admin', 'superadmin', 'loan_admin'], r);
};

export const canEditAgreementValue = (role = null) =>
  hasAnyRole(['admin', 'superadmin'], role || getCurrentUserRole());

export const canSaveBooking = (role = null) => {
  return true;
  const r = role || getCurrentUserRole();
  if (r === 'jda_file_admin') return false;
  return hasAnyRole(['admin', 'superadmin', 'loan_admin', 'loan_manager'], r);
};

export const canSaveAndConfirmBooking = (role = null) =>
  hasAnyRole(['admin', 'superadmin', 'loan_admin'], role || getCurrentUserRole());

export const canCreateReminder = (role = null) => {
  const r = role || getCurrentUserRole();
  if (r === 'jda_file_admin') return false;
  return hasAnyRole(['admin','superadmin','loan_admin','loan_manager','loan_operator_t1','loan_operator_t2'], r);
};

export const canViewPaymentHistory = (role = null) => {
  const r = role || getCurrentUserRole();
  if (!r) return true;
  if (r === 'jda_file_admin') return false;
  return hasAnyRole(['admin','superadmin','loan_admin','loan_manager','accountant'], r);
};

export const canProcessRefund = (role = null) => {
  return hasAnyRole(['admin','superadmin','loan_admin','accountant'], role || getCurrentUserRole());
};

export const canCreateFollowUpReminder = (role = null) => {
  const r = role || getCurrentUserRole();
  if (!r) return true;
  if (r === 'jda_file_admin') return false;
  return hasAnyRole(['admin','superadmin','loan_admin','loan_manager','loan_operator_t1','loan_operator_t2'], r);
};

export const canAccessAdmin = (role = null) => {
  const r = role || getCurrentUserRole();
  if (r === 'jda_file_admin') return false;
  return hasAnyRole(['admin','superadmin'], r);
};

export const canManageUsers = (role = null) =>
  hasAnyRole(['superadmin', 'admin'], role || getCurrentUserRole());

export const canManageRolePermissions = (role = null) =>
  hasAnyRole(['superadmin', 'admin'], role || getCurrentUserRole());

export const canViewReports = (role = null) =>
  hasMinimumRole('accountant', role || getCurrentUserRole());

export const canManageTownships = (role = null) =>
  hasMinimumRole('admin', role || getCurrentUserRole());

export const canManagePlots = (role = null) =>
  hasMinimumRole('admin', role || getCurrentUserRole());

export const canUploadDocuments = (role = null) =>
  hasMinimumRole('loan_operator_t2', role || getCurrentUserRole());

export const canDeleteBooking = (role = null) =>
  hasAnyRole(['superadmin'], role || getCurrentUserRole());

export const canViewAllBookings = (role = null) =>
  hasMinimumRole('loan_manager', role || getCurrentUserRole());

export const canAccessDashboardNavigation = (role = null) => {
  const r = role || getCurrentUserRole();
  if (r === 'jda_file_admin') return false;
  return hasMinimumRole('loan_operator_t2', r);
};

export const canViewFileProgress = (role = null) => {
  const r = role || getCurrentUserRole();
  if (!r) return true;
  if (r === 'jda_file_admin') return false;
  return hasMinimumRole('loan_operator_t2', r);
};

export const canCreateDraft = (role = null) => {
  // Permission should come from API/backend
  return false; // Default deny, backend will assign permission
};

export const canSendForAgreement = (role = null) => {
  // Permission should come from API/backend
  return false; // Default deny, backend will assign permission
};

export const canViewAllotmentLetterRequests = (role = null) => {
  const r = role || getCurrentUserRole();
  return hasAnyRole(['admin', 'superadmin'], r);
};

export const canVerifyReceipts = (role = null) => {
  const r = role || getCurrentUserRole();
  return hasAnyRole(['admin', 'superadmin'], r);
};

export const canReceivePayment = (role = null) => {
    const r = role || getCurrentUserRole();
    if (!r) return true;
    if (r === 'jda_file_admin') return false;
    return hasAnyRole(['admin','superadmin','loan_admin','loan_manager','accountant'], r);
};

// ========================
// AGGREGATORS
// ========================

export const getAllPermissions = (role = null) => {
  const r = role || getCurrentUserRole();

  // No special handling - all permissions come from API
  // Backend should assign appropriate permissions to each user

  return {
    role: r,
    hierarchyLevel: ROLE_HIERARCHY[r] || 0,

    canAccessAdmin: canAccessAdmin(r),
    canManageUsers: canManageUsers(r),
    canManageRolePermissions: canManageRolePermissions(r),

    canMarkFileCompleted: canMarkFileCompleted(r),
    canSaveBooking: canSaveBooking(r),
    canSaveAndConfirmBooking: canSaveAndConfirmBooking(r),
    canDeleteBooking: canDeleteBooking(r),
    canViewAllBookings: canViewAllBookings(r),
    canEditAgreementValue: canEditAgreementValue(r),

    canViewPaymentHistory: canViewPaymentHistory(r),
    canProcessRefund: canProcessRefund(r),
    canViewReports: canViewReports(r),
    canVerifyReceipts: canVerifyReceipts(r),

    canCreateDraft: canCreateDraft(r),
    canUploadDocuments: canUploadDocuments(r),

    canCreateReminder: canCreateReminder(r),
    canCreateFollowUpReminder: canCreateFollowUpReminder(r),

    canManageTownships: canManageTownships(r),
    canManagePlots: canManagePlots(r),

    canAccessDashboardNavigation: canAccessDashboardNavigation(r),
    canViewFileProgress: canViewFileProgress(r),
    canReceivePayment: canReceivePayment(r)
  };
};

export const hasPermission = (action, role = null) => {
  const permissions = getAllPermissions(role);
  return !!permissions[action];
};

export const validateMultiplePermissions = (actions, role = null) => {
  const permissions = getAllPermissions(role);
  const results = {};

  actions.forEach(action => {
    results[action] = !!permissions[action];
  });

  return {
    results,
    allGranted: Object.values(results).every(Boolean),
    anyGranted: Object.values(results).some(Boolean),
    grantedCount: Object.values(results).filter(Boolean).length,
    deniedCount: Object.values(results).filter(v => !v).length
  };
};
