import { useState, useEffect } from 'react';
import axiosInstance from '../../../utilities/axiosInstance';
import API_ENDPOINTS from '../../../utilities/apiConfig';
import { Shield, ArrowLeft, Users, Info, ChevronRight, Save, CheckCircle, XCircle, Settings, AlertTriangle } from 'lucide-react';
import Swal from 'sweetalert2';
import styled, { createGlobalStyle } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { ROLE_HIERARCHY } from '../../../utilities/rolePermissions';
import ReminderPopup from '../../../components/ReminderPopup';

const GlobalSwalStyles = createGlobalStyle`
  .swal2-confirm,
  .swal2-cancel,
  .swal-confirm-button,
  .swal-cancel-button {
    color: black !important;
  }
  
  .swal2-styled.swal2-confirm {
    background-color: var(--primary-color) !important;
    color: black !important;
  }
  
  .swal2-styled.swal2-confirm:hover {
    background-color: #1a8287 !important;
    color: black !important;
  }
  
  .swal2-styled.swal2-cancel {
    background-color: var(--primary-color) !important;
    color: black !important;
  }
  
  .swal2-styled.swal2-cancel:hover {
    background-color: #1a8287 !important;
    color: black !important;
  }
`;

const Container = styled.div`
  padding: 0;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100vh;
`;

const ContentWrapper = styled.div`
  width: 100%;
  margin: 0;
  background: white;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  background: white;
  border-bottom: 1px solid #eef2f7;
  
  .left-section {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .icon-wrapper {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      svg {
        color: white;
      }
    }
    
    .title-section {
      h2 {
        margin: 0;
        color: #1e293b;
        font-size: 28px;
        font-weight: 700;
        letter-spacing: -0.5px;
      }
      
      .subtitle {
        color: #64748b;
        font-size: 14px;
        margin-top: 4px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }
  }
  
  .right-section {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .back-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background: var(--primary-color) !important;
      border: none;
      border-radius: 10px;
      color: black !important;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.2s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      
      &:hover {
        background: #1a8287 !important;
        color: black !important;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }
    }
  }
`;

const RoleInfoSection = styled.div`
  padding: 24px 32px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-bottom: 1px solid #e0f2fe;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .role-info {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .role-icon {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      svg {
        color: white;
      }
    }
    
    .role-details {
      h3 {
        margin: 0;
        color: #0c4a6e;
        font-size: 20px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .role-level {
        background: #0ea5e9;
        color: white;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
      }
      
      .role-description {
        color: #0369a1;
        font-size: 14px;
        margin-top: 4px;
        max-width: 600px;
      }
    }
  }
`;

const RoleSelectorSection = styled.div`
  padding: 20px 32px;
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  border-bottom: 1px solid #bae6fd;
  display: flex;
  align-items: center;
  gap: 20px;
  
  .selector-label {
    font-size: 16px;
    font-weight: 600;
    color: #0c4a6e;
    white-space: nowrap;
  }
  
  .selector-wrapper {
    flex: 1;
    max-width: 400px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 24px 32px;
  border-bottom: 1px solid #eef2f7;
`;

const StatCard = styled.div`
  background: ${props => props.$bgColor || '#f8fafc'};
  border: 1px solid ${props => props.$borderColor || '#e2e8f0'};
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => props.$borderColor || '#e2e8f0'};
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
  
  .stat-content {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      background: ${props => props.$iconBg || '#f1f5f9'};
      display: flex;
      align-items: center;
      justify-content: center;
      
      svg {
        color: ${props => props.$iconColor || '#64748b'};
      }
    }
    
    .stat-text {
      flex: 1;
      
      .stat-number {
        font-size: 28px;
        font-weight: 800;
        color: ${props => props.$textColor || '#1e293b'};
        line-height: 1;
        margin-bottom: 4px;
      }
      
      .stat-label {
        font-size: 12px;
        color: #64748b;
        text-transform: uppercase;
        font-weight: 600;
        letter-spacing: 0.5px;
      }
    }
  }
`;

const PermissionsSection = styled.div`
  padding: 32px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f1f5f9;
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
    
    h3 {
      margin: 0;
      color: #1e293b;
      font-size: 20px;
      font-weight: 700;
    }
    
    svg {
      color: #3b82f6;
    }
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .section-info {
    color: #64748b;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const PermissionsTable = styled.div`
  overflow: hidden;
  background: white;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 80px 1fr 200px;
  gap: 24px;
  padding: 20px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  
  .header-cell {
    font-size: 12px;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const ToggleButton = styled.button`
  position: relative;
  width: 60px;
  height: 30px;
  border-radius: 15px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.$isActive ? '#10b981' : '#ef4444'};
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${props => props.$isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
  }
  
  .toggle-knob {
    position: absolute;
    top: 3px;
    left: ${props => props.$isActive ? '33px' : '3px'};
    width: 24px;
    height: 24px;
    background: white;
    border-radius: 50%;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 80px 1fr 200px;
  gap: 24px;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s ease;
  align-items: center;
  
  &:hover {
    background: #f8fafc;
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  .id-cell {
    .id-number {
     
      font-size: 14px;
      font-weight: 600;
      color: #475569;
      background: #f1f5f9;
      padding: 6px 12px;
      border-radius: 6px;
      display: inline-block;
    }
  }
  
  .permission-cell {
    .permission-name {
      font-size: 15px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 6px;
    }
    
    .permission-description {
      font-size: 13px;
      color: #64748b;
      line-height: 1.5;
    }
  }
  
  .status-cell {
    .toggle-switch {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      
      .toggle-label {
        font-size: 14px;
        font-weight: 500;
        color: #475569;
        min-width: 60px;
      }
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  
  .empty-icon {
    margin-bottom: 24px;
    opacity: 0.3;
    
    svg {
      color: #94a3b8;
    }
  }
  
  .empty-title {
    font-size: 18px;
    font-weight: 600;
    color: #475569;
    margin-bottom: 12px;
  }
  
  .empty-description {
    font-size: 14px;
    color: #94a3b8;
    line-height: 1.6;
    max-width: 400px;
    margin: 0 auto;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 80px 20px;
  
  .spinner {
    width: 48px;
    height: 48px;
    border: 3px solid #f1f5f9;
    border-top: 3px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Select = styled.select`
min-width:300px;
  
  &:focus {
    outline: none;
    border-color: #0ea5e9;
    box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.2);
  }
  
  &:hover {
    border-color: #0ea5e9;
    box-shadow: 0 4px 12px rgba(14, 165, 233, 0.15);
  }
  
  option {
    padding: 12px;
    background: white;
    color: #0c4a6e;
  }
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--primary-color) !important;
  color: var(--white);
  border: none;
  border-radius: 0px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background: var(--secondary-color) !important;
    color: var(--white) !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background: #9cc5c7 !important;
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const RolePermissions = () => {
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);
    const [selectedRoleId, setSelectedRoleId] = useState('');
    const [selectedRole, setSelectedRole] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [rolesLoading, setRolesLoading] = useState(true);
    const [showReminderPopup, setShowReminderPopup] = useState(false);
    const [stats, setStats] = useState({
        assignedPermissions: 0,
        unassignedPermissions: 0,
        totalPermissions: 0,
        permissionCoverage: '0%'
    });
    const [hasChanges, setHasChanges] = useState(false);
    const permissionDescriptions = {
        'View Dashboard': 'Access to main dashboard and overview statistics',
        'Manage Users': 'Create, edit, and delete user accounts',
        'Manage Roles': 'Create and modify user roles and permissions',
        'View Bookings': 'Access to view booking information',
        'Create Booking': 'Permission to create new bookings',
        'Edit Booking': 'Modify existing booking details',
        'Delete Booking': 'Remove bookings from the system',
        'View Reports': 'Access to various system reports',
        'Manage Townships': 'Add, edit, and manage township information',
        'Manage Plots': 'Handle plot information and assignments',
        'View Financial Data': 'Access to financial reports and payment information',
        'Upload Documents': 'Upload and manage document attachments',
        'Manage Reminders': 'Create and manage system reminders',
        'Admin Access': 'Full administrative access to the system'
    };

    const getRoleDescription = (roleName) => {
        const descriptions = {
            'superadmin': 'Complete system access with all permissions. Can manage users, roles, and system settings.',
            'admin': 'Administrative access with most permissions. Can manage bookings, users, and reports.',
            'loan_admin': 'Specialized admin for loan-related operations. Can manage loan processes and documentation.',
            'loan_manager': 'Manages loan operations and team coordination. Has oversight of loan processes.',
            'accountant': 'Financial operations access. Can view and manage payment-related information.',
            'loan_operator_t1': 'Senior loan operator with extended permissions for loan processing.',
            'loan_operator_t2': 'Junior loan operator with basic loan processing permissions.',
            'user': 'Basic user access with limited permissions for viewing and basic operations.'
        };
        return descriptions[roleName?.toLowerCase()] || '';
    };

    useEffect(() => {
        // console.log('🔵 RolePermissions component mounted, fetching roles...');
        fetchRoles();
    }, []);

    useEffect(() => {
        if (selectedRoleId) {
            const role = roles.find(r => r.id === parseInt(selectedRoleId));
            setSelectedRole(role);
            fetchPermissions(selectedRoleId);
        } else {
            setPermissions([]);
            setSelectedRole(null);
            setStats({
                assignedPermissions: 0,
                unassignedPermissions: 0,
                totalPermissions: 0,
                permissionCoverage: '0%'
            });
        }
    }, [selectedRoleId, roles]);

    useEffect(() => {
        if (permissions.length > 0) {
            const assigned = permissions.filter(p => p.isAssigned).length;
            const total = permissions.length;
            const unassigned = total - assigned;
            const coverage = total > 0 ? Math.round((assigned / total) * 100) + '%' : '0%';
            
            setStats({
                assignedPermissions: assigned,
                unassignedPermissions: unassigned,
                totalPermissions: total,
                permissionCoverage: coverage
            });
        }
    }, [permissions]);

    const fetchRoles = async () => {
        setRolesLoading(true);
        try {
            // console.log('🔵 Fetching roles from:', API_ENDPOINTS.ROLE_LIST);
            const response = await axiosInstance.get(API_ENDPOINTS.ROLE_LIST);
            // console.log('🟢 Roles API Response:', response);
            
            const raw = response?.data;
            let rolesData = [];
            
            if (Array.isArray(raw)) rolesData = raw;
            else if (Array.isArray(raw?.value)) rolesData = raw.value;
            else if (Array.isArray(raw?.data)) rolesData = raw.data;

            // console.log('🟢 Processed roles data:', rolesData);
            setRoles(rolesData);
            
            if (rolesData.length > 0) {
                const defaultRole = rolesData.find(r => r.id === 2) || rolesData[0];
                setSelectedRoleId(defaultRole.id.toString());
                // console.log('🟢 Default role selected:', defaultRole);
            }
        } catch (err) {
            // console.error('🔴 Error fetching roles:', err);
            // console.error('🔴 Error details:', {
            //     message: err.message,
            //     status: err?.response?.status,
            //     statusText: err?.response?.statusText,
            //     data: err?.response?.data
            // });
            Swal.fire({
                title: 'Error',
                text: 'Failed to fetch roles. Please try again.',
                icon: 'error',
                confirmButtonColor: 'var(--primary-color)'
            });
        } finally {
            setRolesLoading(false);
        }
    };

    const fetchPermissions = async (roleId) => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`${API_ENDPOINTS.ROLE_PERMISSIONS}?roleId=${roleId}`);
            
            let permsData = [];
            if (Array.isArray(response.data)) {
                permsData = response.data;
            } else if (response.data && Array.isArray(response.data.value)) {
                permsData = response.data.value;
            } else if (response.data && Array.isArray(response.data.data)) {
                permsData = response.data.data;
            }

            const normalizedPermissions = permsData.map(p => ({
    ...p,
    isAssigned: Boolean(p.isAssigned) // force true/false
}));

setPermissions(normalizedPermissions);
        } catch (err) {
            // console.error('Error fetching permissions:', err);
            Swal.fire({
                title: 'Error',
                text: 'Failed to fetch permissions. Please check your connection and try again.',
                icon: 'error',
                confirmButtonColor: 'var(--primary-color)'
            });
        } finally {
            setLoading(false);
        }
    };

    const getRoleHierarchyLevel = (roleName) => {
        return ROLE_HIERARCHY[roleName?.toLowerCase()] || 0;
    };

    const handleSaveAllPermissions = async () => {
        try {
            // Show confirmation dialog
            const result = await Swal.fire({
                title: 'Save All Permissions?',
                text: 'This will save all current permission settings for this role.',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, Save All',
                cancelButtonText: 'Cancel',
                
            });

            if (!result.isConfirmed) return;

            // Show loading state
            Swal.fire({
                title: 'Saving Permissions...',
                text: 'Please wait while we save all permissions.',
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // Prepare the request payload with all permissions
            const payload = {
                roleId: parseInt(selectedRoleId),
                permissions: permissions.map(perm => ({
                    permissionId: perm.id,
                    isAssigned: perm.isAssigned
                }))
            };

            // console.log('🔵 SaveRolePermissions (Bulk) API Request:', {
            //     url: API_ENDPOINTS.SAVE_ROLE_PERMISSIONS,
            //     payload: payload
            // });

            // Make API call to save all role permissions
            const response = await axiosInstance.post(API_ENDPOINTS.SAVE_ROLE_PERMISSIONS, payload);

            // console.log('🟢 SaveRolePermissions (Bulk) API Response:', response);

            // Update cached permissions for current user if they have this role
            // updateUserPermissionsCache();

            // Show success message
           Swal.fire({
    title: "Success",
    text: "Permissions updated. Please re-login to apply changes.",
    icon: "success"
});

        } catch (error) {
            // console.error('🔴 Error saving all permissions:', error);
            
            // Show error message
            Swal.fire({
                title: 'Error',
                text: 'Failed to save permissions. Please try again.',
                icon: 'error',
                confirmButtonColor: 'var(--primary-color)'
            });
        }
    };

    const handleTogglePermission = (permissionId) => {
    setPermissions(prev =>
        prev.map(perm =>
            perm.id === permissionId
                ? { ...perm, isAssigned: !perm.isAssigned }
                : perm
        )
    );
    setHasChanges(true);
};

    const updateUserPermissionsCache = () => {
        // Get current user's role ID
        const currentUserRoleId = localStorage.getItem('spendwise_roleId');
        
        // Only update cache if we are editing the current user's role
        if (selectedRoleId && currentUserRoleId && selectedRoleId.toString() !== currentUserRoleId.toString()) {
            // console.log(`Skipping cache update: Editing role ${selectedRoleId} but current user is role ${currentUserRoleId}`);
            return;
        }

        // Create permissions object from current permissions state
        const permissionsObj = {};
        permissions.forEach(perm => {
            permissionsObj[perm.name] = perm.isAssigned;
        });
        
        // Cache the permissions (Map format for menuPermissions)
        localStorage.setItem('user_permissions', JSON.stringify(permissionsObj));
        
        // Cache the permissions (Array format for HasPermission/PermissionProtected)
        localStorage.setItem('spendwise_permissions', JSON.stringify(permissions));

        // Dispatch event to notify other components
        window.dispatchEvent(new Event('permissionsUpdated'));
    };

    return (
        <div className='dashboard-container'>
                <div className='dashboard-header'>
                    <div className="dashboard-header-content">
                        
                        <div>
                            <h1 className="dashboard-title">Role & Permissions Management</h1>
                            <p className="dashboard-subtitle">
                                Manage user roles and their system permissions
                            </p>
                        </div>
                    </div>
                    <div className="dashboard-header-actions">
                        
                        <button 
                            className="primary-btn"
                            onClick={() => navigate('/property')}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                                <path d="M9 12h6m-6 4h6"></path>
                            </svg>
                            Booking List
                        </button>
                        <button 
                            className="primary-btn"
                            onClick={() => setShowReminderPopup(true)}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                            </svg>
                            Reminder
                        </button>
                    </div>
                </div>

                <div className='card'>
                    <div className="d-flex align-items-center gap-3">
<label>Select Role:</label>
                    <div className="selector-wrapper">
                        <Select 
                            value={selectedRoleId} 
                            onChange={(e) => setSelectedRoleId(e.target.value)}
                            disabled={rolesLoading}
                            className='form-control'
                        >
                            {rolesLoading ? (
                                <option value="">Loading roles...</option>
                            ) : (
                                <>
                                    <option value="">-- Choose a Role --</option>
                                    {roles.map(role => (
                                        <option key={role.id} value={role.id}>
                                            {role.name}
                                        </option>
                                    ))}
                                </>
                            )}
                        </Select>
                    </div>
                    </div>
                    
                </div>

                {/* {selectedRole && (
                    <div className='card'>
                        <div className="role-info">
                            <div className="role-details">
                                <h3>
                                    {selectedRole.name}
                                </h3>
                                <div className="role-description">
                                    {getRoleDescription(selectedRole.name)}
                                </div>
                            </div>
                        </div>
                    </div>
                )} */}
                <div className='card'>
                    
                        <div className="dashboard-table-header">
                            <div>
<h3 className='dashboard-table-title'>Role Permissions for {selectedRole && selectedRole.name}</h3>
                            </div>
                            
                             <div className="header-right">
                            
                            {selectedRoleId && permissions.length > 0 && (
                                <button className="primary-btn" 
                                    onClick={handleSaveAllPermissions}
                                    disabled={!hasChanges}
                                >
                                    {/* <Save size={16} /> */}
                                    Save All Changes
                                </button>
                            )}
                        </div>
                        </div>
                       
                    

                    {loading ? (
                        <LoadingSpinner>
                            <div className="spinner"></div>
                        </LoadingSpinner>
                    ) : (
                        <PermissionsTable>
                            <TableHeader>
                                <div className="header-cell">ID</div>
                                <div className="header-cell">Permission Details</div>
                                <div className="header-cell">Status</div>
                            </TableHeader>
                            
                            {permissions.length > 0 ? (
                                permissions.map(perm => (
                                    <TableRow key={perm.id} $isActive={perm.isAssigned}>
                                        <div className="id-cell">
                                            <span>{perm.id}</span>
                                        </div>
                                        <div className="permission-cell">
                                            <div className="permission-name">{perm.displayName}</div>
                                            <div className="permission-description">
                                                {permissionDescriptions[perm.name] || ''}
                                            </div>
                                        </div>
                                        <div className="status-cell">
                                            <div className="toggle-switch">
                                                <span className="toggle-label">
                                                    {perm.isAssigned ? 'Granted' : 'Revoked'}
                                                </span>
                                                <ToggleButton 
                                                    $isActive={perm.isAssigned}
                                                    onClick={() => handleTogglePermission(perm.id, perm.isAssigned)}
                                                >
                                                    <div className="toggle-knob" />
                                                </ToggleButton>
                                            </div>
                                        </div>
                                    </TableRow>
                                ))
                            ) : (
                                <div style={{ padding: '48px 24px' }}>
                                    <EmptyState>
                                        {selectedRoleId ? (
                                            <>
                                                <div className="empty-icon">
                                                    <Shield size={64} />
                                                </div>
                                                <div className="empty-title">No Permissions Found</div>
                                                <div className="empty-description">
                                                    This role doesn't have any permissions configured yet.
                                                    Contact your system administrator to set up permissions.
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="empty-icon">
                                                    <Users size={64} />
                                                </div>
                                                <div className="empty-title">Select a Role</div>
                                                <div className="empty-description">
                                                    Please select a role from the dropdown above to view its permissions.
                                                </div>
                                            </>
                                        )}
                                    </EmptyState>
                                </div>
                            )}
                        </PermissionsTable>
                    )}
                </div>

            {/* Reminder Popup */}
            <ReminderPopup 
                isOpen={showReminderPopup}
                onClose={() => setShowReminderPopup(false)}
                title="Reminder List"
            />
        </div>
    );
};

export default RolePermissions;
