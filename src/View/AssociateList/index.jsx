import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Wrapper from './style';
import axiosInstance from '../../utilities/axiosInstance';
import API_ENDPOINTS from '../../utilities/apiConfig';
import Lottie from 'lottie-react';
import Loading from '../../assets/Loading.json';
import SmallModal from '../../components/NewComponent/Modal/SmallModal';
import Button from '../../components/NewComponent/Button';
import { HiPencilSquare } from "react-icons/hi2";
import Swal from "sweetalert2";
import XediLoader  from '../../components/XediLoader';

const AssociateList = () => {
  const [associateList, setAssociateList] = useState([]);
  const [filteredAssociates, setFilteredAssociates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [showAssociateModal, setShowAssociateModal] = useState(false);
  const [addAssociateForm, setAddAssociateForm] = useState({
  id: null,
  firstName: '',
  contactNo: '',
  reraNo: '',
  leaderName: '',
  leaderContactNo: '',

  dob: '',
  anniversaryDate: '',
  panNo: '',
  aadhaarNo: '',
  passportNo: '',

  address: '',
  city: '',
  state: '',
  pinCode: '',

  accountNumber: '',
  accountName: '',
  bankName: '',
  bankIFSC: ''
});

  const resetForm = () => {
  setAddAssociateForm({
    id: null,
    firstName: '',
    contactNo: '',
    reraNo: '',
    leaderName: '',
    leaderContactNo: ''
  });
};

  const navigate = useNavigate();

  // Fetch associates from API
  const fetchAssociates = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_ENDPOINTS.ASSOCIATE_LIST, {
        timeout: 10000
      });

      const raw = response?.data;
      console.log("Raw API response:", raw);
      const listData = Array.isArray(raw)
        ? raw
        : raw?.value || raw?.data || [];

      setAssociateList(listData);
      setFilteredAssociates(listData);
      setHasSearched(true);
      // toast.success(`✅ Loaded ${listData.length} associates`);
    } catch (error) {
      toast.error('Failed to load associate list');
      console.error('Associate fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle Search button click
  const handleSearch = () => {
    if (!hasSearched) {
      fetchAssociates();
    } else {
      // If already fetched, just filter
      if (!searchTerm) {
        setFilteredAssociates(associateList);
      } else {
        const lower = searchTerm.toLowerCase();
        const filtered = associateList.filter(associate =>
          associate.id?.toString().includes(lower) ||
          associate.userName?.toLowerCase().includes(lower) ||
          associate.firstName?.toLowerCase().includes(lower) ||
          associate.contactNo?.toLowerCase().includes(lower) ||
          associate.reraNo?.toLowerCase().includes(lower) ||
          associate.leaderName?.toLowerCase().includes(lower)
        );
        setFilteredAssociates(filtered);
      }
    }
  };

  // Handle Search on Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle Delete Associate

const handleDelete = async (associateId, associateName) => {

  const result = await Swal.fire({
    title: "Are you sure?",
    html: `
      You are about to delete <b>${associateName}</b> (ID: ${associateId})<br/><br/>
      This action cannot be undone.
    `,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Yes, delete it"
  });

  if (!result.isConfirmed) return;

  try {
    setDeleteLoading(associateId);

    const response = await axiosInstance.delete(
      `${API_ENDPOINTS.ASSOCIATE_DELETE}/${associateId}`,
      { timeout: 10000 }   // 🔥 IMPORTANT (same as your working code)
    );

    if (response.status === 200) {

      await Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Associate deleted successfully",
        timer: 1500,
        showConfirmButton: false
      });

      const updatedList = associateList.filter(
        a => a.id !== associateId
      );

      setAssociateList(updatedList);
      setFilteredAssociates(updatedList);
    }

  } catch (error) {

    console.error("Delete error:", error);

    Swal.fire({
      icon: "error",
      title: "Failed",
      text: error.response?.data?.message || "Failed to delete associate"
    });

  } finally {
    setDeleteLoading(null);
  }
};

  // Handle Search filter when data is already loaded
  useEffect(() => {
    if (!hasSearched) return;

    if (!searchTerm) {
      setFilteredAssociates(associateList);
      return;
    }
    const lower = searchTerm.toLowerCase();
    const filtered = associateList.filter(associate =>
      associate.id?.toString().includes(lower) ||
      associate.userName?.toLowerCase().includes(lower) ||
      associate.firstName?.toLowerCase().includes(lower) ||
      associate.contactNo?.toLowerCase().includes(lower) ||
      associate.reraNo?.toLowerCase().includes(lower) ||
      associate.leaderName?.toLowerCase().includes(lower)
    );
    setFilteredAssociates(filtered);
  }, [searchTerm, associateList, hasSearched]);

  if (loading) {
    return (
      <Wrapper>
        <div className="loading-container h-100">
          {/* <Lottie animationData={Loading} style={{ height: 120 }} /> */}
          <XediLoader />
          <p>Loading associates...</p>
        </div>
      </Wrapper>
    );
  }

  const handleAssociateChange = (e) => {
    const { name, value } = e.target;
    setAddAssociateForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddAssociate = () => {
    setShowAssociateModal(true);
  };
  const handleSaveAssociate = async (e) => {
  e.preventDefault();

  const isEdit = !!addAssociateForm.id;

  const payload = {
    id: addAssociateForm.id || 0,  // update hole id jabe
    firstName: addAssociateForm.firstName?.trim(),
    contactNo: addAssociateForm.contactNo?.trim(),
    reraNo: addAssociateForm.reraNo?.trim(),
    leaderName: addAssociateForm.leaderName?.trim(),
    leaderContactNo: addAssociateForm.leaderContactNo?.trim()
  };
  const formData = new FormData();
      formData.append('Id', addAssociateForm.id || 0);
formData.append('FirstName', addAssociateForm.firstName);
formData.append('ContactNo', addAssociateForm.contactNo);
formData.append('ReraNo', addAssociateForm.reraNo);

formData.append('LeaderName', addAssociateForm.leaderName);
formData.append('LeaderContactNo', addAssociateForm.leaderContactNo);

formData.append('DOB', addAssociateForm.dob);
formData.append('AnniversaryDate', addAssociateForm.anniversaryDate);

formData.append('PANNo', addAssociateForm.panNo);
formData.append('AadhaarNo', addAssociateForm.aadhaarNo);
formData.append('PassportNo', addAssociateForm.passportNo);

formData.append('Address', addAssociateForm.address);
formData.append('City', addAssociateForm.city);
formData.append('State', addAssociateForm.state);
formData.append('PinCode', addAssociateForm.pinCode);

formData.append('AccountNumber', addAssociateForm.accountNumber);
formData.append('AccountName', addAssociateForm.accountName);
formData.append('BankName', addAssociateForm.bankName);
formData.append('BankIFSC', addAssociateForm.bankIFSC);


  const confirm = await Swal.fire({
    title: isEdit ? "Update Associate?" : "Create Associate?",
    text: isEdit
      ? "Are you sure you want to update this associate?"
      : "Are you sure you want to create this associate?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes",
  });

  if (!confirm.isConfirmed) return;

  try {

    const response = await axiosInstance.post(
      API_ENDPOINTS.ASSOCIATE_CREATE,   // same save endpoint
    formData,
      { timeout: 20000 }
    );

    console.log("Full API response:", response);

    // 🔥 Strict success check
    if (response.status !== 200) {
      throw new Error("Server did not return success status");
    }

    if (response.data?.success === false) {
      throw new Error(response.data?.message || "Operation failed");
    }

    await Swal.fire({
      icon: "success",
      title: response.data?.message || 
             (isEdit ? "Updated successfully" : "Created successfully"),
      timer: 1500,
      showConfirmButton: false
    });

    setShowAssociateModal(false);
    resetForm();

    await fetchAssociates();   // wait for fresh data

  } catch (error) {

  console.error("Save error:", error);

  let message = "Something went wrong";

  if (error.response) {
    message =
      error.response.data?.message ||
      error.response.data ||
      "Server error occurred";
  } else if (error.message) {
    message = error.message;
  }

  await Swal.fire({
    icon: "error",
    title: "Failed",
    text: message
  });
}
};
  const handleEditAssociate = (a) => {
  setAddAssociateForm({
    id: a.id,
    firstName: a.firstName || '',
    contactNo: a.contactNo || '',
    reraNo: a.reraNo || '',
    leaderName: a.leaderName || '',
    leaderContactNo: a.leaderContactNo || '',

    dob: a.dob || '',
    anniversaryDate: a.anniversaryDate || '',
    panNo: a.panNo || '',
    aadhaarNo: a.aadhaarNo || '',
    passportNo: a.passportNo || '',

    address: a.address || '',
    city: a.city || '',
    state: a.state || '',
    pinCode: a.pinCode || '',

    accountNumber: a.accountNumber || '',
    accountName: a.accountName || '',
    bankName: a.bankName || '',
    bankIFSC: a.bankIFSC || ''
  });

  setShowAssociateModal(true);
};

const handleResetFilters = () => {
  setSearchTerm('');
  setFilteredAssociates([]);
  setAssociateList([]);
  setHasSearched(false);
};

const handleToggleStatus = async (associate) => {
  const currentStatus = associate.isActive ? "Active" : "Inactive";
  const nextStatus = associate.isActive ? "Inactive" : "Active";

  const confirm = await Swal.fire({
    title: "Change Status?",
    html: `
      Current Status: <b>${currentStatus}</b> <br/>
      New Status: <b>${nextStatus}</b>
    `,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes, Change",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#3085d6"
  });

  if (!confirm.isConfirmed) return;

  try {
    // 🔥 Loading state
    Swal.fire({
      title: "Updating Status...",
      text: "Please wait",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    await axiosInstance.put(
      `${API_ENDPOINTS.ASSOCIATE_TOGGLE_STATUS}/${associate.id}`
    );

    // 🔥 UI instantly update (NO full reload feel)
    const updatedList = associateList.map((a) =>
      a.id === associate.id ? { ...a, isActive: !a.isActive } : a
    );

    setAssociateList(updatedList);
    setFilteredAssociates(updatedList);

    // 🔥 Success swal
    await Swal.fire({
      icon: "success",
      title: "Status Updated",
      text: `${associate.firstName} is now ${nextStatus}`,
      timer: 1500,
      showConfirmButton: false
    });

  } catch (error) {

    console.error("Status update error:", error);

    Swal.fire({
      icon: "error",
      title: "Failed",
      text:
        error.response?.data?.message ||
        "Failed to update status"
    });
  }
};


  return (
    <Wrapper className='dashboard-container'>
      <div className="dashboard-header">
        <div className="dashboard-content">
          <h1 className="dashboard-title">Associate Management</h1>
          <p className="dashboard-subtitle">View and manage associates</p>
        </div>
        <div className="dashboard-header-actions">
          <button
            className="primary-btn"
            onClick={() => navigate('/associate-management')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Add Associate </span>
          </button>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="form-control"
          />
        </div>
        <div style={{ display: "flex", gap: "10px" }}>

  <button
    className="primary-btn"
    onClick={handleSearch}
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
      <circle cx="11" cy="11" r="8"></circle>
      <path d="m21 21-4.35-4.35"></path>
    </svg>
    Search
  </button>

  <button
    className="primary-btn"
    onClick={handleResetFilters}
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12a9 9 0 1 0 3-6.7"></path>
      <polyline points="3 3 3 9 9 9"></polyline>
    </svg>
    Reset
  </button>

</div>
        {/* {hasSearched && (
          <button
            className="btn-primary refresh-btn"
            onClick={fetchAssociates}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
            </svg>
            Refresh
          </button>
        )} */}
      </div>

      {!hasSearched ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="64" height="64">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <h3>Search Associates</h3>
          <p>Click the search button to load and view all associates</p>
        </div>
      ) : (
        <div className="card">
            <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                {/* <th>Username</th> */}
                <th>Name</th>
                <th>Contact No</th>
                <th>RERA No</th>
                <th>Leader Name</th>
                <th>Leader Contact</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssociates.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                    No associates found
                  </td>
                </tr>
              ) : (
                filteredAssociates.map((associate) => (
                  <tr key={associate.id}>
                    <td>{associate.id}</td>
                    {/* <td>{associate.userName || '-'}</td> */}
                    <td>{associate.firstName || '-'}</td>
                    <td>{associate.contactNo || '-'}</td>
                    <td>{associate.reraNo || '-'}</td>
                    <td>{associate.leaderName || '-'}</td>
                    <td>{associate.leaderContactNo || '-'}</td>
                    <td>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={associate.isActive}
                          onChange={() => handleToggleStatus(associate)}
                        />
                        <span className="slider round"></span>
                      </label>
                    </td>
                    <td className='actions'>
                      <div className="d-flex gap-2">
                          <button
                        className="primary-btn"
                        onClick={() => handleDelete(associate.id, associate.firstName)}
                        disabled={deleteLoading === associate.id}
                        title="Delete Associate"
                      >
                        {deleteLoading === associate.id ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" className="spinner">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        )}
                      </button>
                      <button
                        className="primary-btn"
                        onClick={() => handleEditAssociate(associate)}
                        title="Edit Associate"
                      >
                       <HiPencilSquare size={22}/>
                      </button>
                      
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        </div>
        
      )}

      <SmallModal
        title="Edit Associate"
        show={showAssociateModal}
        onClose={() => {
          setShowAssociateModal(false);
          resetForm();
        }}
        actions={
          <>
            <div className="d-flex gap-2 justify-content-end">
              <Button onClick={() => {
              setAddAssociateForm({
                id: null,
                firstName: '',
                contactNo: '',
                reraNo: '',
                leaderName: '',
                leaderContactNo: ''
              })
              setShowAssociateModal(false)
            }}>Cancel</Button>
            <Button onClick={handleSaveAssociate}>
              {addAssociateForm.id ? "Update" : "Create"}
            </Button>
            </div>
            
          </>
        }
      >
        <div className="row">
          
          <div className="col-md-6">
            <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="firstName"
              placeholder="Enter name"
              className='form-control'
              value={addAssociateForm.firstName}
              onChange={(e) => {
                const value = e.target.value;
                if (/^[a-zA-Z\s]*$/.test(value)) {
                  handleAssociateChange(e);
                }
              }}
            />
          </div>
          </div>

          
              <div className="col-md-6">
                <div className="form-group">
            <label>Contact No</label>
            <input
              type="tel"
              name="contactNo"
              className='form-control'
              placeholder="Enter contact"
              value={addAssociateForm.contactNo}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                setAddAssociateForm(prev => ({
                  ...prev,
                  contactNo: cleaned
                }));
              }}
            />
          </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
            <label>RERA No</label>
            <input
              type="text"
              name="reraNo"
              className='form-control'
              placeholder="Enter RERA"
              value={addAssociateForm.reraNo}
              onChange={(e) => {
                const value = e.target.value.toUpperCase();
                if (/^[A-Z0-9/]*$/.test(value)) {
                  setAddAssociateForm(prev => ({
                    ...prev,
                    reraNo: value
                  }));
                }
              }}
            />
          </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
            <label>Date of Birth</label>
            <input
  type="date"
  name="dob"
  value={addAssociateForm.dob}
  onChange={handleAssociateChange}
  className="form-control"
/>
          </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
            <label>Leader Name</label>
            <input
              type='text'
              name="leaderName"
              className='form-control'
              placeholder="Enter leader name"
              value={addAssociateForm.leaderName}
              onChange={(e) => {
                const value = e.target.value;
                if (/^[a-zA-Z\s]*$/.test(value)) {
                  handleAssociateChange(e);
                }
              }}
            />
          </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
            <label>Leader Contact</label>
            <input
              type="tel"
              name="leaderContactNo"
              className='form-control'
              placeholder="Enter leader contact"
              value={addAssociateForm.leaderContactNo}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/\D/g, '').slice(0,10);
                setAddAssociateForm(prev => ({
                  ...prev,
                  leaderContactNo: cleaned
                }));
              }}
            />
          </div>
              </div>
              
              <div className="col-md-6">
                 <div className="form-group">
            <label>PAN No</label>
            <input
  type="text"
  name="panNo"
  value={addAssociateForm.panNo}
  onChange={handleAssociateChange}
  className="form-control"
/>
          </div>
              </div>
              <div className="col-md-6">
                 <div className="form-group">
            <label>Aadhar No</label>
            <input
              type="text"
              name=""
              className='form-control'
              placeholder=""
              
            />
          </div>
              </div>
              <div className="col-md-6">
                 <div className="form-group">
            <label>Passport No</label>
            <input
              type="text"
              name=""
              className='form-control'
              placeholder=""
              
            />
          </div>
              </div>
              <div className="col-md-6">
                 <div className="form-group">
            <label>Date of Anniversary</label>
            <input
              type="text"
              name=""
              className='form-control'
              placeholder=""
              
            />
          </div>
              </div>
        </div>
      </SmallModal>
    </Wrapper >
  );
}

export default AssociateList;
