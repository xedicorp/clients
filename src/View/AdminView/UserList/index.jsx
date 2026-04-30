import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { Wrapper } from './style';
import axiosInstance from '../../../utilities/axiosInstance';
import API_ENDPOINTS from '../../../utilities/apiConfig';
import SmallModal from '../../../components/Modal/SmallModal';
import ReminderPopup from '../../../components/ReminderPopup';
import Search from '../../../Components/NewComponent/Search';
import Table from "../../../Components/NewComponent/Table";
import XediLoader from '../../../components/XediLoader';
import { 
    
    Plus, 
    RefreshCw, 
    User, 
    Shield, 
    CheckCircle, 
    XCircle,
    Edit2,
    Filter,
    ArrowLeft,
    MapPin,
    Eye, EyeOff 
} from 'lucide-react';
 

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [roleList, setRoleList] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [townshipList, setTownshipList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showReminderPopup, setShowReminderPopup] = useState(false);
  const [showAddPassword, setShowAddPassword] = useState(false);
    const [staffs, setStaffs] = useState([]);
  const [newUser, setNewUser] = useState({
    userName: '',
    password: '',
    roleId: null,
    staffId: null,
    isActive: true
  });
 // Assign Township State
  const [showTownshipModal, setShowTownshipModal] = useState(false);
  const [selectedUserForTownship, setSelectedUserForTownship] = useState(null);
  const [selectedTownships, setSelectedTownships] = useState([]);
  const [availableTownships, setAvailableTownships] = useState([]);
  const [loadingTownships, setLoadingTownships] = useState(false);
  const staffHeaders = ["__select__", "Name" ];
  const navigate = useNavigate();
  const [addStaffTeamForm, setAddStaffTeamForm] = useState({
        
        townshipIds: []
    });
    const renderStaffRow = (s) => {
         const isChecked = addStaffTeamForm.townshipIds.includes(s.townshipId);

        const handleToggle = () => {

            setAddStaffTeamForm((prev) => {
              
                const exists = prev.townshipIds.includes(s.townshipId);

                return {
                    ...prev,
                    townshipIds: exists
                        ? prev.townshipIds.filter((id) => id !== s.townshipId)
                        : [...prev.townshipIds, s.townshipId],
                };
            });
        };

        return (
            <>
                <td>
                    <input
                        type="checkbox"
                        className="checkbox"
                        checked={isChecked}
                        onChange={handleToggle}
                    />
                </td>

                <td>{s.townshipName}</td>
               
            </>
        );
    };
    const handleAssignTownship = async (user) => {
    setSelectedUserForTownship(user);
    setSelectedTownships([]); // Reset selection
    setAvailableTownships([]); // Reset available townships
    setShowTownshipModal(true);
    
    // Fetch townships for this user
     await fetchUserTownships(user.id);
    
  };
  const isAllStaffSelected =
        staffs.length > 0 &&
        addStaffTeamForm.townshipIds.length === townshipList.length;

    const handleSelectAllStaff = () => {
        setAddStaffTeamForm((prev) => ({
            ...prev,
            townshipIds: isAllStaffSelected ? [] : townshipList.map((s) => s.townshipId),
        }));
    };
 

  const handleTownshipSelection = (township) => {
    setSelectedTownships(prev => {
      const isSelected = prev.find(t => t.id === township.id);
      if (isSelected) {
        return prev.filter(t => t.id !== township.id);
      } else {
        return [...prev, township];
      }
    });
  };

  const handleSaveTownshipAssignment = async () => {
    try {

      let assigned  = false;
      let selectedTownshipIds= addStaffTeamForm.townshipIds ;
       const elements = [];
       townshipList.forEach((t) => {
        let isFound= selectedTownshipIds.find(p=>p === t.townshipId)
        if(isFound)
        {
          assigned=true;
        }
        else
        {
           assigned=false;
        }
        elements.push(
        {
            townshipId : t.townshipId,
            isAssigned:assigned
        }
        );
        });  
     
      setIsSubmitting(true); 
      const assignmentData = {
        userId: selectedUserForTownship.id,
        userTownships: elements,
      }; 
      
      const response = await axiosInstance.post(API_ENDPOINTS.ASSIGN_USER_TOWNSHIPS, assignmentData, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });  
      
       Swal.fire("Success", "Selected townships  assigned successfully", "success")
                      .then(() => {
                           
                      });
     
      
      // Close modal and reset state
      setShowTownshipModal(false);
      setSelectedUserForTownship(null);
      setSelectedTownships([]);
      setAvailableTownships([]);
      
    } catch (err) {
       
      const errorMessage = err.response?.data?.message || 
                         err.response?.data?.error ||
                         err.message || 
                         'Failed to assign townships. Please try again.';
    
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(API_ENDPOINTS.USER_LIST);
      const list = res.data.map(u => ({
        id: u.id,
        userName: u.userName,
        mobileNo: u.mobileNo, 
        roleId: u.roleId,
        roleName: u.roleName,
        staffId: u.staffId,
        isActive: u.isActive ?? true
      }));
      setUsers(list);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Failed to load users';
      toast.error(`❌ ${message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.ROLE_LIST);
      const raw = response?.data;
      setRoleList(raw);
      console.log(raw)
    } catch (err) {
      console.log(err?.message)
    }
  }, []);

  const fetchStaff = useCallback(async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.STAFF_LIST);
      const raw = response?.data;;
      setStaffList(raw);
    } catch (err) {
      console.log(err?.message)
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchStaff();
  }, [fetchUsers, fetchRoles, fetchStaff]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setNewUser(prev => ({
      ...prev,
      [name]:
        name === "roleId" || name === "staffId"
          ? Number(value)
          : type === 'checkbox'
            ? checked ?? prev[name]
            : value
    }));
  };


  const onStaffSelectionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddUser = async () => {
    if (!newUser.userName || !newUser.roleId || !newUser.password) {
      alert("Please fill in all required fields");
      return;
    }
    setIsSubmitting(true);
    try {
      await axiosInstance.post(API_ENDPOINTS.CREATE_USER, newUser);
      alert("User added successfully");
      setShowAddModal(false);
      setNewUser({
        userName: '',
        password: '',
        roleId: null,
        staffId: null,
        isActive: true
      })
      fetchUsers();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        "Failed to create user";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleEditClick = (user) => {
    setEditingUser({
      id: user.id,
      userName: user.userName,
      roleId: user.roleId,
      staffId: user.staffId || null,
      isActive: user.isActive
    });

    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setEditingUser(prev => ({
      ...prev,
      [name]:
        name === "roleId" || name === "staffId" ? Number(value) : type === "checkbox"
            ? checked ?? prev[name]  : value
    }));
  };
  
  const fetchUserTownships = useCallback(async (userId) => {
    try {
      setLoadingTownships(true); 
      const response = await axiosInstance.get(`${API_ENDPOINTS.USER_TOWNSHIPS}?userId=${userId}`, {
        timeout: 10000 
      });  
        const raw = response?.data; 
        setTownshipList(raw); 
        addStaffTeamForm.townshipIds=[];
        raw.forEach((t) => {
        
            if(t.isAssigned)
            {
                 addStaffTeamForm.townshipIds.push(t.townshipId);
            }
        });


    } catch (err) {
      
      
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         'Failed to load township data from API. Please check your connection.';

      toast.error(`❌ ${errorMessage}`);
      setAvailableTownships([]);
      setSelectedTownships([]);
    } finally {
      setLoadingTownships(false);
    }
  }, []);
  const handleUpdateUser = async () => {
    if (!editingUser || isSubmitting) return;

    if (!editingUser.userName?.trim() || !editingUser.roleId) {
      toast.warning("Please fill required fields");
      return;
    }

    const payload = {
      id: Number(editingUser.id),
      userName: editingUser.userName.trim(),
      roleId: Number(editingUser.roleId),
      staffId: editingUser.staffId ? Number(editingUser.staffId) : null,
      isActive: Boolean(editingUser.isActive)
    };

    setIsSubmitting(true);

    try {
      await axiosInstance.put(API_ENDPOINTS.UPDATE_USER, payload);

      toast.success("User updated successfully");

      setShowEditModal(false);
      setEditingUser(null);

      fetchUsers();
    } catch (err) {
      console.error("Update user error:", err.response?.data);

      toast.error(
        err.response?.data?.title ||
        err.response?.data?.message ||
        "Failed to update user"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await axiosInstance.put(
        `${API_ENDPOINTS.TOGGLE_USER}?userId=${user.id}&isActive=${!user.isActive}`
      );

      setUsers(prev =>
        prev.map(u =>
          u.id === user.id ? { ...u, isActive: !u.isActive } : u
        )
      );
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        "Failed to toggle user status";
      alert(message);
    }
  };

  const filterUsers = useMemo(() => {
    if (!searchTerm) return users;
    const s = searchTerm.toLowerCase();
    return users.filter(t =>
      t.userName?.toLowerCase().includes(s) ||
      t.roleName?.toLowerCase().includes(s)
    );
  }, [users, searchTerm]);

  const selectedRole = roleList.find(
    r => r.id === Number(newUser.roleId)
  );

  const editingRole = roleList.find(r => r.id === editingUser?.roleId);
const handleEditUserNameChange = (e) => {
  setEditingUser({ ...editingUser, userName: e.target.value });
};


  return (
    <Wrapper className='dashboard-container'>
      <div className="dashboard-header">
        <div>
          <h1 className='dashboard-title'>User Management</h1>
          <p className="dashboard-subtitle">Manage system users, roles, and access permissions</p>
        </div>
        <div className="dashboard-header-actions">

          <button
            className="primary-btn"
            onClick={() => navigate('/property')}
            style={{ backgroundColor: 'var(--primary-color)', color: 'black' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              <path d="M9 12h6m-6 4h6"></path>
            </svg>
            <span>Booking List</span>
          </button>
          <button
            className="primary-btn"
            onClick={() => setShowReminderPopup(true)}
            style={{ backgroundColor: 'var(--primary-color)', color: 'black' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span>Reminder</span>
          </button>
          <button
            className="primary-btn"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={18} />
            <span>Add User</span>
          </button>
        </div>
      </div>

      <div className="card">
        <div className="dashboard-table-header">
          <div className="search-box">
            <Search
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by name..."
              debounce={500}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th width="80">ID</th>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th width="100">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filterUsers.length > 0 ? (
                filterUsers.map((user) => (
                  <tr key={`user-${user.id || user.userName}`} className={!user.isActive ? 'inactive-row' : ''}>
                    <td>
                      <span>{user.id}</span>
                    </td>
                    <td>
                      <div className="user-info-cell">
                        <div className="user-details">
                          <span>
                            {user?.userName || user?.mobileNo || 'N/A'}
                          </span>
 
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <span>{user.roleName}</span>
                      </div>
                    </td>
                    <td>
                      <div className="status-switch-container">
                        <label className="status-switch">
                          <input
                            type="checkbox"
                            checked={user.isActive}
                            onChange={() => handleToggleStatus(user)}
                          />
                          <span className="switch-slider"></span>
                        </label>
                        <span className={`status-text ${user.isActive ? 'active' : 'inactive'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="text-right">
                      <div className="row-actions">
                        <button
                          className="primary-btn"
                          title="Edit"
                          onClick={() => handleEditClick(user)}
                        >
                          <span>Edit</span>
                        </button>
                          <button
                          className="primary-btn"
                          title="Assign Township"
                          onClick={() => handleAssignTownship(user)}
                        >
                          <span>Assign Township</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">
                    <div className="empty-state">
                      <User size={48} />
                      <h3>No users found</h3>
                      <p>Try adjusting your search or add a new user.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <div className="result-count">
            Showing <strong>{filterUsers.length}</strong> users
          </div>
        </div>
      </div>

      <SmallModal
        title="Add New User"
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        actions={
          <>
            <button className="primary-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
            <button
              className="primary-btn"
              onClick={handleAddUser}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Create User'}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label>Username <span className="required">*</span></label>
          <div className="input-with-icon">
            <User size={18} />
            <input
              type="text"
              name="userName"
              value={newUser.userName}
              onChange={handleInputChange}
              placeholder="e.g. john_doe"
              className="form-control"
            />
          </div>
        </div>
        <div className="form-group">
          <label>Password <span className="required">*</span></label>
          <div className="input-with-icon" style={{ position: "relative" }}>
            <User size={18} />
            <input
              type={showAddPassword ? "text" : "password"}
              name="password"
              value={newUser.password}
              onChange={handleInputChange}
              style={{ paddingRight: "3rem" }}
              className="form-control"
            />

            <button
              type="button"
              onClick={() => setShowAddPassword(prev => !prev)}
              className="toggle-password-btn"
            >
              {showAddPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
        </div>
        <div className="form-group">
          <label>Role <span className="required">*</span></label>
          <div className="input-with-icon">
            <Shield size={18} />
            <select
              name="roleId"
              value={newUser.roleId}
              onChange={handleInputChange}
              className="form-control"
            >
              <option value="">Select Role</option>
              {roleList.map(role => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        {selectedRole?.name.toLowerCase() === "staff" && <div className="form-group">
          <label>Staff <span className="required">*</span></label>
          <div className="input-with-icon">
            <Shield size={18} />
            <select
              name="staffId"
              value={newUser.staffId}
              onChange={onStaffSelectionChange}
              className="form-control"
            >
              <option value="">Select a Staff</option>
              {
                staffList.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {[staff?.firstName, staff?.lastName].filter(Boolean).join(" ")}
                  </option>
                ))
              }
            </select>
          </div>
        </div>
        }
        <label className="toggle-switch">
          <input
            type="checkbox"
            name="isActive"
            checked={newUser.isActive}
            onChange={handleInputChange}
          />
          <span className="slider round"></span>
          <span className="label-text">Active Account</span>
        </label>
      </SmallModal>

      {editingUser && (
        <SmallModal
          title={`Edit User - ${editingUser.userName}`}
          show={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingUser(null);
          }}
          actions={
            <>
              <button
                className="primary-btn"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                className="primary-btn"
                onClick={handleUpdateUser}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          }
        >
          <div className="modal-form">
            <div className="form-group">
              <label>Username</label>
              <div className="input-with-icon">
                <User size={18} />
                <input
                  type="text"
                  name="userName"
                  value={editingUser.userName}
                  onChange={handleEditInputChange}
                  className="form-control"
                 
                />
              </div>
            </div>
            <div className="form-group">
              <label>Role <span className="required">*</span></label>
              <div className="input-with-icon">
                <Shield size={18} />
                <select
                  name="roleId"
                  value={editingUser.roleId}
                  onChange={handleEditInputChange}
                >
                  <option value="">Select a Role</option>
                  {roleList.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {editingRole?.name?.toLowerCase() === "staff" && (<div className="form-group">
              <label>Staff <span className="required">*</span></label>
              <div className="input-with-icon">
                <Shield size={18} />
                <select
                  name="staffId"
                  value={editingUser.staffId || ""}
                  onChange={handleEditInputChange}
                  className="form-control"
                >
                  <option value="">Select a Staff</option>
                  {staffList.map(staff => (
                    <option key={staff.id} value={staff.id}>
                      {staff.firstName} {staff.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>)}
            <label className="toggle-switch">
              <input
                type="checkbox"
                name="isActive"
                checked={editingUser.isActive}
                onChange={handleEditInputChange}
              />
              <span className="slider round"></span>
              <span className="label-text">Active Account</span>
            </label>
          </div>
        </SmallModal>
      )}

  {/* Assign Township Modal */}
      {selectedUserForTownship && (
        <SmallModal
          title={`Assign Townships - ${selectedUserForTownship.userName}`}
          show={showTownshipModal}
          onClose={() => {
            setShowTownshipModal(false);
            setSelectedUserForTownship(null);
            setSelectedTownships([]);
            setAvailableTownships([]);
          }}
          actions={
            <>
              <button
                className="primary-btn"
                onClick={() => {
                  setShowTownshipModal(false);
                  setSelectedUserForTownship(null);
                  setSelectedTownships([]);
                  setAvailableTownships([]);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                className="primary-btn"
                onClick={handleSaveTownshipAssignment}
                disabled={isSubmitting || loadingTownships}
              >
                {isSubmitting ? 'Saving...' : selectedTownships.length > 0 ? `Assign ${selectedTownships.length} Township${selectedTownships.length !== 1 ? 's' : ''}` : 'Save Changes'}
              </button>
            </>
          }
        >
          <div className="modal-form">
            <div className="form-group">
              <label>Select Townships for {selectedUserForTownship.userName}</label>
               
            </div>
            
            {loadingTownships ? (
              <div className="loading-container">
                <XediLoader />
                <p>Loading townships...</p>
              </div>
            ) : (
               <div className="staff-save--modal-details">
                    <Table
                        headers={staffHeaders}
                        data={townshipList}
                        renderRow={renderStaffRow}
                        rowKey={(s) => s.id}
                        isAllSelected={isAllStaffSelected}
                        handleSelectAll={handleSelectAllStaff}
                        emptyMessage="No township found."
                        compact
                    />
                </div>
              // <div className="township-selection">
              //   <div className="selected-count">
              //     {selectedTownships.length > 0 && (
              //       <div className="selection-summary">
              //         <CheckCircle size={16} />
              //         <span>{selectedTownships.length} township{selectedTownships.length !== 1 ? 's' : ''} selected</span>
              //       </div>
              //     )}
              //   </div>
                
              //   {availableTownships.length > 0 ? (
              //     <div className="township-dropdown-container">
              //       <div className="form-group">
              //         <label>Available Townships</label>
              //         <div className="input-with-icon">
              //           <MapPin size={18} />
              //           <select 
              //             className="form-control township-dropdown"
              //             onChange={(e) => {
              //               const townshipId = parseInt(e.target.value);
              //               if (townshipId) {
              //                 const township = availableTownships.find(t => t.id === townshipId);
              //                 if (township) {
              //                   handleTownshipSelection(township);
              //                 }
              //               }
              //             }}
              //             value=""
              //           >
              //             <option value="">Select a township to assign...</option>
              //             {availableTownships
              //               // .filter(township => !selectedTownships.some(t => t.id === township.id)) // Modified: Show all townships
              //               .map((township) => {
              //               const isSelected = selectedTownships.some(t => t.id === township.id);
              //               return (
              //                 <option 
              //                   key={township.id} 
              //                   value={township.id}
              //                   style={{ fontWeight: isSelected ? 'bold' : 'normal' }}
              //                 >
              //                   {township.name} (ID: {township.id}) {township.isAssigned ? '(Currently Assigned)' : ''} {isSelected ? '✓' : ''}
              //                 </option>
              //               );
              //             })}
              //           </select>
              //         </div>
              //         <p className="help-text">
              //           Select townships from the dropdown to assign to this user. 
              //           {availableTownships.filter(t => t.isAssigned).length > 0 && 
              //             ` ${availableTownships.filter(t => t.isAssigned).length} township(s) are currently assigned.`
              //           }
              //         </p>
              //       </div>
              //     </div>
              //   ) : (
              //     <div className="empty-state">
              //       <MapPin size={48} />
              //       <h3>No townships available</h3>
              //       <p>No township data found for this user.</p>
              //     </div>
              //   )}
                
              //   {selectedTownships.length > 0 && (
              //     <div className="selected-townships">
              //       <h4>Selected Townships:</h4>
              //       <div className="selected-list">
              //         {selectedTownships.map((township) => (
              //           <div key={township.id} className="selected-item">
              //             <span>{township.name} (ID: {township.id})</span>
              //             <button
              //               type="button"
              //               className="remove-btn"
              //               onClick={() => handleTownshipSelection(township)}
              //               title="Remove"
              //             >
              //               <XCircle size={14} />
              //             </button>
              //           </div>
              //         ))}
              //       </div>
              //     </div>
              //   )}
              // </div>
            )}
          </div>
        </SmallModal>
      )}

      {/* Reminder Popup */}
      <ReminderPopup
        isOpen={showReminderPopup}
        onClose={() => setShowReminderPopup(false)}
        title="Reminder List"
      // bookingId={selectedUserId}
      />
    </Wrapper>
  );
}

export default UserList;
