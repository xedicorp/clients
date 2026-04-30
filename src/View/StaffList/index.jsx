import { use, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Button from "../../components/NewComponent/Button";
import Icon from "../../Components/NewComponent/Icons";
import SmallModal from "../../components/NewComponent/Modal/SmallModal";
import Search from "../../Components/NewComponent/Search";
import Table from "../../Components/NewComponent/Table";
import ToggleSlider from "../../Components/NewComponent/ToggleSlider";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from '../../utilities/apiConfig';
import DropdownSearch from "../../components/NewComponent/DropdownList";
import Wrapper from "./style";
import { FiX } from "react-icons/fi";
import GeneratePayslip from "../../components/GeneratePayslip";
import { FaEdit, FaTrash, FaFileInvoiceDollar } from "react-icons/fa";

const StaffList = () => {
    // const user = getCurrentUser();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [teamList, setTeamList] = useState([]);
    const [showSmallModal, setShowSmallModal] = useState(false);
    const [showPayslipModal, setShowPayslipModal] = useState(false);
    const [openMenuId, setOpenMenuId] = useState(null);
    
    const toggleMenu = (id, target) => {
  setOpenMenuId((prev) => (prev === id ? null : id));
};
    const [staffForm, setStaffForm] = useState({
        id: null,
        firstName: "",
        lastName: "",
        address: "",
        contactNo: "",
        teamId: null,
        role: "-",
        designationName: "",
    });

    const designationOptions = [
  { value: 1, label: "Manager" },
  { value: 2, label: "Supervisor" },
    { value: 3, label: "Accountant" },    
    { value: 4, label: "Sales Executive" }, 
];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setStaffForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSaveStaff = async () => {
        try {
            const payload = {
    ...staffForm,
    designationId: Number(staffForm.designationId) 
};
            if (!payload.id) delete payload.id;

            await axiosInstance.post(API_ENDPOINTS.SAVE_STAFF, payload);

            Swal.fire({
    icon: "success",
    title: staffForm.id ? "Updated!" : "Created!",
    text: staffForm.id
        ? "Employee updated successfully"
        : "Employee created successfully",
    confirmButtonColor: "#3085d6",
});

            setShowSmallModal(false);

            setStaffForm({
                id: null,
                firstName: "",
                lastName: "",
                address: "",
                contactNo: "",
                teamId: null,
                role: "-",
                designationName: "",
            });

            fetchUsers();
        } catch (err) {
            console.error(err);

            Swal.fire({
    icon: "error",
    title: "Error",
    text: staffForm.id
        ? "Failed to update employee"
        : "Failed to create employee",
    confirmButtonColor: "#d33",
});
        }
    };
useEffect(() => {
  const handleClickOutside = () => {
    setOpenMenuId(null);
  };

  document.addEventListener("click", handleClickOutside);
  return () => document.removeEventListener("click", handleClickOutside);
}, []);


    const headers = ["Name", "Designation", "Contact No.", "Address", "Status", "Actions"];

    const fetchTeams = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get(API_ENDPOINTS.TEAM_LIST);
            const teamsData = response?.data || [];
            setTeamList(teamsData);
            console.log(teamsData);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get(API_ENDPOINTS.STAFF_LIST);

            const usersData = response?.data || [];
            console.log("USERS 👉", usersData);

            const normalized = usersData.map((u) => ({
                id: u.id,
                firstName: u.firstName,
                lastName: u.lastName,
                name: [u?.firstName, u?.lastName].filter(Boolean).join(" "),
                role: u.role,
                address: u.address,
                contactNo: u.contactNo,
                status: u.isActive,
                teamId: u.teamId,
                designationName: u.designationName,
                designationId: u.designationId,
            }));

            setUsers(normalized);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchTeams();
    }, []);


    const filteredUsers = useMemo(() => {
        if (!search) return users;

        const s = search.toLowerCase();

        return users.filter(u =>
            u.name?.toLowerCase().includes(s)
        );
    }, [users, search]);


    const handleAddStaff = () => {
        setStaffForm({
            id: null,
            firstName: "",
            lastName: "",
            address: "",
            role: "",
            contactNo: "",
            teamId: null,
            designationId: null,
           
        });
        setShowSmallModal(true);
    };

    const handleEditClick = (user) => {
        setShowSmallModal(true);
        setStaffForm({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            address: user.address,
            teamId: user.teamId,
            contactNo: user.contactNo,
            role: user.role,
            designationName: user.designationName,
            designationId: user.designationId,
        });
    };

    const handleUserDelete = (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This user will be permanently deleted.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Delete",
        }).then(async (result) => {
            if (!result.isConfirmed) return;

            try {
                await axiosInstance.delete(`${API_ENDPOINTS.DELETE_STAFF}/${id}`);
                setUsers((prev) => prev.filter((u) => u.id !== id));

                Swal.fire({
    icon: "success",
    title: "Deleted!",
    text: "Employee deleted successfully",
});
            } catch (err) {
                console.error(err);
                Swal.fire({
    icon: "error",
    title: "Delete Failed",
    text: err?.response?.data?.message || "Error deleting employee",
});
            }
        });
    };

    const teamListOptions = teamList.map((t) => ({
        value: t.id,
        label: t.name,
    }));

    const selectedTeamListName =
        teamList.find(t => t.id === staffForm.teamId)?.name || "";

    const selectedDesignation =
  designationOptions.find(
    d => Number(d.value) === Number(staffForm.designationId)
  )?.label || "";
  
    const handleTeamSelect = (option) => {
        const id = Number(option.value);
        setStaffForm(prev => ({
            ...prev,
            teamId: id
        }));
    };

    const handleTeamClear = () => {
        setStaffForm(prev => ({
            ...prev,
            teamId: null
        }));
    };


    const renderRow = (u) => (
        <>
            <td>{u.name}</td>
            <td>{u.designationName}</td>
            <td>{u.contactNo}</td>
            <td>{u.address}</td>
            <td>{u.status === true ? "Active" : "Inactive"}</td>
            <td>
                <div
  className="booking-menu-container"
  style={{ position: "relative", display: "inline-block" }}
>
  <button
    className="primary-btn"
    onClick={(e) => {
      e.stopPropagation();
      toggleMenu(u.id);
    }}
  >
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      style={{ width: "16px", height: "16px" }}
    >
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  </button>

  {openMenuId === u.id && (
    <div
      className="booking-dropdown-menu"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="dropdown-item"
        onClick={() => {
          handleEditClick(u);
          setOpenMenuId(null);
        }}
      >
        <FaEdit style={{ marginRight: "8px" }} />
         Edit
      </div>

      <div
        className="dropdown-item"
        onClick={() => {
          handleUserDelete(u.id);
          setOpenMenuId(null);
        }}
      >
        <FaTrash style={{ marginRight: "8px" }} />
         Delete
      </div>

      <div
        className="dropdown-item"
        onClick={() => {
          setShowPayslipModal(true);
          setOpenMenuId(null);
        }}
      ><FaFileInvoiceDollar style={{ marginRight: "8px" }} />
         Payslip
      </div>
    </div>
  )}
</div>
            </td>
        </>
    );

    return (
        <Wrapper className="dashboard-container">
            <div className="dashboard-header">
                <div className="dashboard-header-content">
                    <div className="dashboard-header-icon">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                    </div>
                    <div>
                        <h1 className="dashboard-title">
                            Employee Management
                        </h1>
                        <p className="dashboard-subtitle">
                            Manage and monitor all employees across the system
                        </p>
                    </div>
                </div>
                <div className="dashboard-header-actions">
                    <Button
                        onClick={handleAddStaff}
                    >
                        <Icon name="addCircle" />
                        Add Employee
                    </Button>
                </div>
            </div>
            <div className="card">
                <div className="dashboard-table-header">
                    <Search
                        value={search}
                        onChange={setSearch}
                        placeholder="Search Employee name..."
                    />
                </div>
                <Table
                    headers={headers}
                    data={filteredUsers}
                    renderRow={renderRow}
                    emptyMessage={"No Employee found."}
                    rowKey={(u) => u.id}
                />
            </div>
            <SmallModal
                show={showSmallModal}
                onClose={() => setShowSmallModal(false)}
                title={staffForm.id ? "Edit Employee" : "Create Employee"}
                actions={
                    <Button
                        variant="primary"
                        onClick={handleSaveStaff}
                    >
                        {staffForm.id ? "Update" : "Create"}
                    </Button>
                }

            >
                <div className="staff-save--modal-details">
                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group">
                                <label>First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    placeholder="Enter first name"
                                    value={staffForm.firstName}
                                    onChange={handleChange}
                                    className="form-control"
                                />
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="form-group">
                                <label>Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    placeholder="Enter last name"
                                    value={staffForm.lastName}
                                    onChange={handleChange}
                                    className="form-control"
                                />
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="form-group full">
                                <label>Designation</label>
                                <DropdownSearch
                                    options={designationOptions}
                                    displayValue={
                                        selectedDesignation
                                    }
                                    onSelect={(option) =>
                                        setStaffForm(prev => ({
                                        ...prev,
                                        designationId: Number(option.value)
                                        }))
                                    }
                                    onClear={() =>
                                        setStaffForm(prev => ({
                                        ...prev,
                                        designationId: null
                                        }))
                                    }
                                    />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group full">
                                <label>Contact No</label>
                                <input
                                    type="text"
                                    name="contactNo"
                                    placeholder="Enter contact number"
                                    value={staffForm.contactNo}
                                    onChange={(e) => {
                                        const value = e.target.value;

                                        // ✅ Only digits + max 10 length
                                        if (/^\d{0,10}$/.test(value)) {
                                        handleChange(e);
                                        }
                                    }}
                                    className="form-control"
                                    />
                                                                </div>
                        </div>

                        <div className="col-md-12">
                            <div className="form-group full">
                                <label>Team Name</label>
                                <DropdownSearch
                                    options={teamListOptions}
                                    displayValue={selectedTeamListName}
                                    onSelect={handleTeamSelect}
                                    onClear={handleTeamClear}
                                />
                            </div>
                        </div>

                        <div className="col-md-12">
                            <div className="form-group full mb-0">
                                <label>Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    placeholder="Enter address"
                                    value={staffForm.address}
                                    onChange={handleChange}
                                    className="form-control"
                                />
                            </div>
                        </div>
                    </div>
                </div>

            </SmallModal>
            
 {showPayslipModal && (
  <div className="modal-overlay">
    <div className="modal-content print-payslip-modal">

      <div className="modal-header">
        <h3>Payslip</h3>
        <button
          className="modal-close-btn"
          onClick={() => setShowPayslipModal(false)}
        >
          <FiX size={20} />
        </button>
      </div>

      <div className="card">
        <GeneratePayslip />
      </div>

    </div>
  </div>
)}
            
        </Wrapper>
    );
};

export default StaffList;
