/**
 * Authentication Service
 * Handles user authentication state and role management
 */

class AuthService {
    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    static isAuthenticated() {
        const token = localStorage.getItem('userToken');
        return token && token.trim() !== '';
    }

    /**
     * Get current user's role
     * @returns {string}
     */
    static getRole() {
        const role = (localStorage.getItem('spendwise_role') || '').toLowerCase();
        const username = (localStorage.getItem('userName') || '').toLowerCase();
        
        // Debug logging for ITAdmin
        if (username === 'itadmin') {
            // console.log('🔍 AuthService.getRole() for ITAdmin:', { role, username });
        }
        
        return role;
    }

    /**
     * Get current user's token
     * @returns {string|null}
     */
    static getToken() {
        return localStorage.getItem('spendwise_token');
    }

    /**
     * Get current user's email
     * @returns {string}
     */
    static getEmail() {
        return localStorage.getItem('spendwise_email') || '';
    }

    /**
     * Get current user's phone
     * @returns {string}
     */
    static getPhone() {
        return localStorage.getItem('spendwise_phone') || '';
    }

    /**
     * Get current user's ID
     * @returns {number}
     */
    static getUserId() {
        const stored = localStorage.getItem('userId');
        const parsed = stored ? Number(stored) : NaN;
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
    }

    /**
     * Set authentication data
     * @param {Object} authData - Authentication data
     * @param {string} authData.token - JWT token
     * @param {string} authData.role - User role
     * @param {string} authData.email - User email
     * @param {string} authData.phone - User phone
     * @param {number} authData.userId - User ID
     */
    static setAuthData({ token, role, email, phone, userId }) {
        if (token) localStorage.setItem('spendwise_token', token);
        if (role) localStorage.setItem('spendwise_role', role);
        if (email) localStorage.setItem('spendwise_email', email);
        if (phone) localStorage.setItem('spendwise_phone', phone);
        if (userId) localStorage.setItem('userId', String(userId));
    }

    /**
     * Clear all authentication data
     */
    static logout() {
        localStorage.removeItem('spendwise_token');
        localStorage.removeItem('spendwise_role');
        localStorage.removeItem('spendwise_email');
        localStorage.removeItem('spendwise_phone');
        localStorage.removeItem('userId');
        localStorage.removeItem('spendwise_userId');
        localStorage.removeItem('spendwise_roleId');
        localStorage.removeItem('user_permissions');
        localStorage.removeItem('spendwise_user');
        localStorage.removeItem('spendwise_permissions');
    }

    /**
     * Check if user has specific role
     * @param {string} requiredRole - Required role
     * @returns {boolean}
     */
    static hasRole(requiredRole) {
        const userRole = this.getRole();
        return userRole === requiredRole.toLowerCase();
    }

    /**
     * Check if user has any of the specified roles
     * @param {Array<string>} roles - Array of roles to check
     * @returns {boolean}
     */
    static hasAnyRole(roles) {
        const userRole = this.getRole();
        return roles.some(role => userRole === role.toLowerCase());
    }

    /**
     * Check if user is admin (admin or superadmin)
     * @returns {boolean}
     */
    static isAdmin() {
        return this.hasAnyRole(['admin', 'superadmin']);
    }

    /**
     * Check if user is super admin
     * @returns {boolean}
     */
    static isSuperAdmin() {
        return this.hasRole('superadmin');
    }

    /**
     * Check if user is loan staff
     * @returns {boolean}
     */
    static isLoanStaff() {
        return this.hasAnyRole(['loan_admin', 'loan_manager', 'loan_operator_t1', 'loan_operator_t2']);
    }

    /**
     * Check if user is JDA File Admin
     * @returns {boolean}
     */
    static isJDAFileAdmin() {
        return this.hasRole('jda_file_admin');
    }
}

export default AuthService;