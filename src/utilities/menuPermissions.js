/**
 * Menu Permissions Utility
 * Handles menu item visibility based on user permissions
 */

/**
 * Get user permissions from localStorage
 * @returns {Object} - User permissions object
 */
export const getUserPermissions = () => {
  try {
    const username = (localStorage.getItem("userName") || "").toLowerCase();
    
    // Special handling for loanmgr user - only return their assigned permissions
    if (username === 'loanmgr') {
      return {
        "CanCreateBooking": true,
        "CanEditBooking": true,
        "CanReceivePayment": true,
        "CanCancelBooking": true,
        "CanViewFileProgress": true,
        // All other permissions are false/undefined
        "CanMarkFileCompleted": false,
        "CanManageTownships": false,
        "CanManageUsers": false,
        "CanManageRolePermissions": false,
        "CanManageRefunds": false,
        "CanCreateDraft": false,
        "CanVerifyReceipts": false,
        "CanViewAllotmentLetterRequests": false,
        "CanChangePlot": false,
        "CanViewReports": false,
        "CanViewPaymentHistory": false,
        "CanViewReminder": false,
        "CanUpdateJDAFile": false
      };
    }

    // Special handling for user10 user - only return their assigned permissions
    if (username === 'user10') {
      return {
        // NO permissions are assigned for user10 (all are false in JSON data)
        "CanMarkFileCompleted": false,
        "CanCreateBooking": false,
        "CanManageTownships": false,
        "CanEditBooking": false,
        "CanManageUsers": false,
        "CanManageRolePermissions": false,
        "CanManageRefunds": false,
        "CanCreateDraft": false,
        "CanReceivePayment": false,
        "CanCancelBooking": false,
        "CanChangePlot": false,
        "CanViewReports": false,
        "CanViewFileProgress": false,
        "CanViewPaymentHistory": false,
        "CanViewReminder": false,
        "CanUpdateJDAFile": false,
        "CanVerifyReceipts": false,
        "CanViewAllotmentLetterRequests": false
      };
    }

    // Special handling for user9 user - only return their assigned permissions
    if (username === 'user9') {
      return {
        "CanViewFileProgress": true,
        // All other permissions are false/undefined
        "CanMarkFileCompleted": false,
        "CanCreateBooking": false,
        "CanManageTownships": false,
        "CanEditBooking": false,
        "CanManageUsers": false,
        "CanManageRolePermissions": false,
        "CanManageRefunds": false,
        "CanCreateDraft": false,
        "CanReceivePayment": false,
        "CanCancelBooking": false,
        "CanChangePlot": false,
        "CanViewReports": false,
        "CanViewPaymentHistory": false,
        "CanViewReminder": false,
        "CanUpdateJDAFile": false,
        "CanVerifyReceipts": false,
        "CanViewAllotmentLetterRequests": false
      };
    }

    // Special handling for user7 user - only return their assigned permissions
    if (username === 'user7') {
      return {
        "CanViewPaymentHistory": true,
        "CanVerifyReceipts": true,
        // All other permissions are false/undefined
        "CanMarkFileCompleted": false,
        "CanCreateBooking": false,
        "CanManageTownships": false,
        "CanEditBooking": false,
        "CanManageUsers": false,
        "CanManageRolePermissions": false,
        "CanManageRefunds": false,
        "CanCreateDraft": false,
        "CanReceivePayment": false,
        "CanCancelBooking": false,
        "CanChangePlot": false,
        "CanViewReports": false,
        "CanViewFileProgress": false,
        "CanViewReminder": false,
        "CanUpdateJDAFile": false,
        "CanViewAllotmentLetterRequests": false
      };
    }
    
    // Special handling for itadmin user - only return their assigned permissions
    if (username === 'itadmin') {
      return {
        "CanCreateBooking": true,
        "CanManageTownships": true,
        "CanReceivePayment": true,
        // All other permissions are false/undefined
        "CanMarkFileCompleted": false,
        "CanEditBooking": false,
        "CanManageUsers": false,
        "CanManageRolePermissions": false,
        "CanManageRefunds": false,
        "CanCreateDraft": false,
        "CanVerifyReceipts": false,
        "CanViewAllotmentLetterRequests": false,
        "CanCancelBooking": false,
        "CanChangePlot": false,
        "CanViewReports": false,
        "CanViewFileProgress": false,
        "CanViewPaymentHistory": false,
        "CanViewReminder": false,
        "CanUpdateJDAFile": false
      };
    }

    // Special handling for draftadmin user - only return their assigned permissions
    if (username === 'draftadmin') {
      return {
        "CanCreateDraft": true,
        // All other permissions are false/undefined
        "CanMarkFileCompleted": false,
        "CanCreateBooking": false,
        "CanManageTownships": false,
        "CanEditBooking": false,
        "CanManageUsers": false,
        "CanManageRolePermissions": false,
        "CanManageRefunds": false,
        "CanReceivePayment": false,
        "CanCancelBooking": false,
        "CanChangePlot": false,
        "CanViewReports": false,
        "CanViewFileProgress": false,
        "CanViewPaymentHistory": false,
        "CanViewReminder": false,
        "CanUpdateJDAFile": false,
        "CanVerifyReceipts": false,
        "CanViewAllotmentLetterRequests": false
      };
    }

    // Special handling for fileadmin user - only return their assigned permissions
    if (username === 'fileadmin') {
      return {
        "CanMarkFileCompleted": true,
        "CanManageRefunds": true,
        // All other permissions are false/undefined
        "CanCreateBooking": false,
        "CanManageTownships": false,
        "CanEditBooking": false,
        "CanManageUsers": false,
        "CanManageRolePermissions": false,
        "CanCreateDraft": false,
        "CanReceivePayment": false,
        "CanCancelBooking": false,
        "CanChangePlot": false,
        "CanViewReports": false,
        "CanViewFileProgress": false,
        "CanViewPaymentHistory": false,
        "CanViewReminder": false,
        "CanUpdateJDAFile": false,
        "CanVerifyReceipts": false,
        "CanViewAllotmentLetterRequests": false
      };
    }

    const cachedPermissions = localStorage.getItem("user_permissions");
    if (cachedPermissions) {
      return JSON.parse(cachedPermissions);
    }
    
    // Return empty object if no permissions found
    return {};
  } catch (error) {
    return {};
  }
};

/**
 * Filter menu items based on user permissions
 * @param {Array} menuItems - Array of menu items to filter
 * @param {Object} userPermissions - User permissions object
 * @returns {Array} - Filtered menu items
 */
export const filterMenuByPermissions = (menuItems, userPermissions) => {
  if (!Array.isArray(menuItems)) {
    return [];
  }

  if (!userPermissions || typeof userPermissions !== 'object') {
    return menuItems; // Return all items if permissions are invalid
  }

  return menuItems.filter(item => {
    // If no permission specified, show the item
    if (!item.permission) {
      return true;
    }
    
    // Check if user has the required permission
    const hasPermission = userPermissions[item.permission] === true;
    
    if (!hasPermission) {
    }
    
    return hasPermission;
  });
};

/**
 * Map menu permission names to actual permission names
 * This helps maintain backward compatibility while using new permission structure
 */
export const mapMenuPermissionToActualPermission = (menuPermission) => {
  const permissionMap = {
    "Mark File Check": "CanMarkFileCompleted",
    "New Booking": "CanCreateBooking", 
    "Edit Booking": "CanEditBooking",
    "Townships": "CanManageTownships",
    "Users": "CanManageUsers",
    "Refund Management": "CanManageRefunds",
    "Role Permissions": "CanManageRolePermissions",
    "View File Progress": "CanViewFileProgress"
  };
  
  return permissionMap[menuPermission] || menuPermission;
};

/**
 * Check if user has a specific permission (with mapping support)
 * @param {string} permissionName - Name of the permission to check
 * @returns {boolean} - True if user has the permission
 */
export const hasPermission = (permissionName) => {
  const permissions = getUserPermissions();
  const actualPermissionName = mapMenuPermissionToActualPermission(permissionName);
  
  // Check both the mapped permission and the original permission name
  return permissions[actualPermissionName] === true || permissions[permissionName] === true;
};

/**
 * Get all granted permissions for the current user
 * @returns {Array} - Array of permission names that are granted
 */
export const getGrantedPermissions = () => {
  const permissions = getUserPermissions();
  return Object.keys(permissions).filter(key => permissions[key] === true);
};

/**
 * Cache user permissions in localStorage
 * @param {Object} permissions - Permissions object to cache
 */
export const cacheUserPermissions = (permissions) => {
  try {
    localStorage.setItem("user_permissions", JSON.stringify(permissions));
    
    // Dispatch event to notify components of permission update
    window.dispatchEvent(new Event('permissionsUpdated'));
  } catch (error) {
  }
};

/**
 * Clear cached permissions
 */
export const clearCachedPermissions = () => {
  try {
    localStorage.removeItem("user_permissions");
    
    // Dispatch event to notify components of permission update
    window.dispatchEvent(new Event('permissionsUpdated'));
  } catch (error) {
  }
};

/**
 * Initialize default permissions for a role
 * This is a fallback when API permissions are not available
 * @param {string} role - User role
 * @returns {Object} - Default permissions for the role
 */
export const getDefaultPermissionsForRole = (role) => {
  const roleLower = (role || '').toLowerCase();
  
  
  
  return defaultPermissions[roleLower]  ;
};

/**
 * Load and cache permissions for current user
 * Call this on login or app initialization
 */
export const initializeUserPermissions = () => {
  const role = localStorage.getItem("spendwise_role");
  
  // if (!role) {
  //   console.warn('No role found in localStorage');
  //   return;
  // }
  
  // Check if we already have cached permissions
  const cachedPermissions = getUserPermissions();
  if (Object.keys(cachedPermissions).length > 0) {
    // console.log('✅ Using cached permissions:', cachedPermissions);
    return cachedPermissions;
  }
  
  // Load default permissions for the role
  const defaultPermissions = getDefaultPermissionsForRole(role);
  cacheUserPermissions(defaultPermissions);
  
  // console.log('✅ Initialized default permissions for role:', role, defaultPermissions);
  return defaultPermissions;
};
