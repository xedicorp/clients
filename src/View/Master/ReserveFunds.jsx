import { useState, useEffect  } from "react";
import { FiX } from "react-icons/fi";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from '../../utilities/apiConfig';
import Swal from "sweetalert2";

export default function ReserveFunds() {

    const [showAddFundModal, setShowAddFundModal] = useState(false);

    const [fundName, setFundName] = useState("");
    const [month, setMonth] = useState("");
    const [targetAmount, setTargetAmount] = useState("");

    const [fundList, setFundList] = useState([]);

    useEffect(() => {
    getAllFunds();
}, []);
    
   const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fundName.trim()) {
        Swal.fire("Error", "Please enter fund name", "error");
        return;
    }

    // 🔥 Duplicate check
    const isDuplicate = fundList.some(
        f => f.name.toLowerCase().trim() === fundName.toLowerCase().trim()
    );

    if (isDuplicate) {
        Swal.fire("Error", "This fund name already exists", "error");
        return;
    }

    const payload = {
        id: 0,
        name: fundName
    };

    try {
        const response = await axiosInstance.post(
            API_ENDPOINTS.RESERVEFUND_SAVE,
            payload
        );

        Swal.fire("Success", "Fund saved successfully", "success");

        setShowAddFundModal(false);
        setFundName("");

        getAllFunds();

    } catch (error) {
        console.error(error);

        const message =
            error.response?.data?.message ||
            error.response?.data ||
            "Something went wrong";

        if (message.toLowerCase().includes("already")) {
            Swal.fire("Error", "This fund already exists", "error");
        } else {
            Swal.fire("Error", message, "error");
        }
    }
};

    const getAllFunds = async () => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.RESERVEFUND_LIST);

        if (response.data) {
            setFundList(response.data);
        }
        console.log(response.data);

    } catch (error) {
        console.error("Error fetching funds:", error);
    }
    };

    const handleDelete = async (id) => {
    const confirm = await Swal.fire({
        title: "Are you sure?",
        text: "This fund will be deleted permanently",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Delete",
    });

    if (!confirm.isConfirmed) return;

    try {
        await axiosInstance.delete(
            `${API_ENDPOINTS.RESERVEFUND_DELETE}/${id}`
        );

        Swal.fire("Deleted!", "Fund deleted successfully", "success");

        getAllFunds();

    } catch (error) {
        console.error(error.response);
        Swal.fire("Error", "Delete failed", "error");
    }
};

    return (
        <div className="dashboard-container">

            {/* Header */}
            <div className="dashboard-header">
                <div className="dashboard-header-content">
                    <div>
                        <h1 className="dashboard-title">Reserve Funds</h1>
                        <p className="dashboard-subtitle">
                            Manage and add funds
                        </p>
                    </div>
                </div>

                <div className="dashboard-header-actions">
                    <button
                        className="primary-btn"
                        onClick={() => setShowAddFundModal(true)}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="16" />
                            <line x1="8" y1="12" x2="16" y2="12" />
                        </svg>
                        <span>Add Fund</span>
                    </button>
                </div>
            </div>

            {/* Table Section */}
            <div className="card">
                <div className="dashboard-table-header">
                        <h3 className="dashboard-table-title">All Funds</h3>
                    <p className="subtitle">
                            Showing {fundList.length} records
                        </p>
                </div>

                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Fund Name</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {fundList.map((item) => (
                                <tr key={item.id} className="table-row">
                                    <td>{item.name}</td>
                                    <td>
                                        <button
                                            className="primary-btn"
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                </div>
            </div>

            {/* Add Fund Modal */}
            {showAddFundModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Add Funds</h3>
                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={() => setShowAddFundModal(false)}
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Fund Name *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={fundName}
                                    onChange={(e) => setFundName(e.target.value)}
                                    placeholder="Enter fund name"
                                />
                            </div>

                            {/* <div className="form-group">
                                <label>Month *</label>
                                <select
                                    className="form-control"
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                    required
                                >
                                    <option value="">Select Month</option>
                                    <option>January</option>
                                    <option>February</option>
                                    <option>March</option>
                                    <option>April</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Set Target Amount *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter amount"
                                    value={targetAmount}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, "");
                                        setTargetAmount(value);
                                    }}
                                    maxLength={10}
                                    required
                                />
                            </div> */}

                            <div className="modal-actions">
                                <button
                                    type="submit"
                                    className="primary-btn"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}