import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  getCurrentUserRoleInfo, 
  getAllPermissions, 
  getPermissionsByCategory,
  getPermissionSummary,
  hasPermission,
  validateMultiplePermissions
} from '../../utilities/rolePermissions';
import { Shield, User, CheckCircle, XCircle, Info, Eye } from 'lucide-react';

const DemoContainer = styled.div`
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
`;

const Section = styled.div`
  background: white;
  margin-bottom: 20px;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  
  h3 {
    margin: 0 0 15px 0;
    color: #2c3e50;
    display: flex;
    align-items: center;
    gap: 10px;
  }
`;

const RoleCard = styled.div`
  background: linear-gradient(135deg, ${props => props.color || '#3498db'} 0%, ${props => props.color || '#2980b9'} 100%);
  color: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  
  .role-header {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 10px;
    
    .role-name {
      font-size: 24px;
      font-weight: 700;
    }
    
    .role-level {
      background: rgba(255,255,255,0.2);
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
  }
  
  .role-description {
    opacity: 0.9;
    line-height: 1.5;
  }
`;

const PermissionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
  margin-top: 15px;
`;

const PermissionCard = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 15px;
  
  .category-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
    
    .category-name {
      font-weight: 600;
      color: ${props => props.color || '#2c3e50'};
    }
  }
  
  .permission-list {
    list-style: none;
    padding: 0;
    margin: 0;
    
    li {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 0;
      font-size: 14px;
      
      &.granted {
        color: #28a745;
      }
      
      &.denied {
        color: #dc3545;
      }
    }
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 15px;
`;

const StatCard = styled.div`
  background: ${props => props.bgColor || '#f8f9fa'};
  border: 1px solid ${props => props.borderColor || '#e9ecef'};
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  
  .stat-number {
    font-size: 24px;
    font-weight: 700;
    color: ${props => props.textColor || '#2c3e50'};
    margin-bottom: 5px;
  }
  
  .stat-label {
    font-size: 12px;
    color: #7f8c8d;
    text-transform: uppercase;
    font-weight: 600;
  }
`;

const RolePermissionDemo = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [categorizedPermissions, setCategorizedPermissions] = useState({});
  const [summary, setSummary] = useState({});

  useEffect(() => {
    // Get current user role info
    const roleInfo = getCurrentUserRoleInfo();
    setUserInfo(roleInfo);

    // Get all permissions
    const allPermissions = getAllPermissions();
    setPermissions(allPermissions);

    // Get categorized permissions
    const categorized = getPermissionsByCategory();
    setCategorizedPermissions(categorized);

    // Get permission summary
    const permissionSummary = getPermissionSummary();
    setSummary(permissionSummary);
  }, []);

  if (!userInfo) {
    return <div>Loading role information...</div>;
  }

  return (
    <DemoContainer>
      <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#2c3e50' }}>
        <Shield size={32} style={{ verticalAlign: 'middle', marginRight: '10px' }} />
        Role & Permissions Demo
      </h2>

      {/* Current User Role */}
      <Section>
        <h3>
          <User size={20} />
          Current User Role
        </h3>
        <RoleCard color={userInfo.info.color}>
          <div className="role-header">
            <Shield size={24} />
            <span className="role-name">{userInfo.info.name}</span>
            <span className="role-level">Level {userInfo.level}</span>
          </div>
          <div className="role-description">
            {userInfo.info.description}
          </div>
        </RoleCard>
      </Section>

      {/* Permission Summary Stats */}
      <Section>
        <h3>
          <Info size={20} />
          Permission Summary
        </h3>
        <StatsGrid>
          <StatCard 
            bgColor="#e8f5e8" 
            borderColor="#c3e6cb" 
            textColor="#155724"
          >
            <div className="stat-number">{summary.totalPermissions}</div>
            <div className="stat-label">Total Permissions</div>
          </StatCard>
          
          <StatCard 
            bgColor={userInfo.isAdmin ? "#d1ecf1" : "#f8d7da"} 
            borderColor={userInfo.isAdmin ? "#bee5eb" : "#f5c6cb"} 
            textColor={userInfo.isAdmin ? "#0c5460" : "#721c24"}
          >
            <div className="stat-number">{userInfo.isAdmin ? "Yes" : "No"}</div>
            <div className="stat-label">Admin Access</div>
          </StatCard>
          
          <StatCard 
            bgColor={userInfo.isSuperAdmin ? "#d4edda" : "#fff3cd"} 
            borderColor={userInfo.isSuperAdmin ? "#c3e6cb" : "#ffeaa7"} 
            textColor={userInfo.isSuperAdmin ? "#155724" : "#856404"}
          >
            <div className="stat-number">{userInfo.isSuperAdmin ? "Yes" : "No"}</div>
            <div className="stat-label">Super Admin</div>
          </StatCard>
          
          <StatCard 
            bgColor={userInfo.isLoanStaff ? "#e2e3f1" : "#f8f9fa"} 
            borderColor={userInfo.isLoanStaff ? "#c8cad3" : "#e9ecef"} 
            textColor={userInfo.isLoanStaff ? "#383d41" : "#6c757d"}
          >
            <div className="stat-number">{userInfo.isLoanStaff ? "Yes" : "No"}</div>
            <div className="stat-label">Loan Staff</div>
          </StatCard>
        </StatsGrid>
      </Section>

      {/* Permissions by Category */}
      <Section>
        <h3>
          <Eye size={20} />
          Permissions by Category
        </h3>
        <PermissionGrid>
          {Object.entries(categorizedPermissions).map(([key, category]) => (
            <PermissionCard key={key} color={category.color}>
              <div className="category-header">
                <div className="category-name">{category.name}</div>
              </div>
              <div style={{ fontSize: '12px', color: '#7f8c8d', marginBottom: '10px' }}>
                {category.description}
              </div>
              <ul className="permission-list">
                {Object.entries(category.permissions).map(([permKey, hasAccess]) => (
                  <li key={permKey} className={hasAccess ? 'granted' : 'denied'}>
                    {hasAccess ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    {permKey.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                  </li>
                ))}
              </ul>
            </PermissionCard>
          ))}
        </PermissionGrid>
      </Section>

      {/* Permission Testing */}
      <Section>
        <h3>
          <Shield size={20} />
          Permission Testing Examples
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
          {[
            'canSaveBooking',
            'canDeleteBooking',
            'canManageUsers',
            'canViewReports',
            'canUploadDocuments',
            'canCreateReminder'
          ].map(permission => (
            <div 
              key={permission}
              style={{
                padding: '15px',
                background: hasPermission(permission) ? '#e8f5e8' : '#fce8e6',
                border: `1px solid ${hasPermission(permission) ? '#c3e6cb' : '#f5c6cb'}`,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              {hasPermission(permission) ? (
                <CheckCircle size={16} style={{ color: '#28a745' }} />
              ) : (
                <XCircle size={16} style={{ color: '#dc3545' }} />
              )}
              <span style={{ fontSize: '14px', fontWeight: '500' }}>
                {permission.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </div>
          ))}
        </div>
      </Section>
    </DemoContainer>
  );
};

export default RolePermissionDemo;