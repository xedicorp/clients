import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_ENDPOINTS from "../../utilities/apiConfig";
import axiosInstance from "../../utilities/axiosInstance";
import "./TownshipList.css";
import { MapContainer, TileLayer, useMapEvents, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import Swal from "sweetalert2";
import { FiX } from "react-icons/fi";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

export default function TownshipList() {
    const navigate = useNavigate();

    const [townships, setTownships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Form States
    const [newTownshipName, setNewTownshipName] = useState("");
    const [newTownshipAddress, setNewTownshipAddress] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [reraNo, setReraNo] = useState("");
    const [editTownship, setEditTownship] = useState(null);
    const [deleteTownship, setDeleteTownship] = useState(null);
    const [bankName, setBankName] = useState("");
    const [ifscCode, setIfscCode] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [accountName, setAccountName] = useState("");

    // Buttons loading 
    const [addingTownship, setAddingTownship] = useState(false);
    const [updatingTownship, setUpdatingTownship] = useState(false);

    //edit township
    const [isEditMode, setIsEditMode] = useState(false);
const [editingId, setEditingId] = useState(null);

function LocationPicker({ setLatitude, setLongitude, initialPosition }) {
    const [position, setPosition] = useState(initialPosition || null);

    useEffect(() => {
        if (initialPosition) {
            setPosition(initialPosition);
        }
    }, [initialPosition]);

    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setPosition([lat, lng]);
            setLatitude(lat);
            setLongitude(lng);
        }
    });

    return position ? <Marker position={position} /> : null;
}


    const fetchTownships = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await axiosInstance.get(API_ENDPOINTS.TOWNSHIP_LIST);

            let list = [];
            console.log('Raw township data:', res.data);

            if (Array.isArray(res.data)) list = res.data;
            else if (Array.isArray(res.data?.value)) list = res.data.value;
            else if (Array.isArray(res.data?.data)) list = res.data.data;
            else if (Array.isArray(res.data?.result)) list = res.data.result;

         const normalized = list.map(t => ({
            id: t.id ?? t.townshipId ?? t.TownshipId,
            name: t.name ?? t.townshipName ?? t.TownshipName,
            address: t.address ?? t.townshipAddress ?? t.TownshipAddress ?? "-",
            rerAno: t.rerAno ?? t.RerAno ?? t.reraNo ?? "-",
            latitude: t.latitude ?? t.Latitude ?? "",
            longitude: t.longitude ?? t.Longitude ?? ""
        }));

            setTownships(normalized);
        } catch (err) {
            setError(err.message || "Failed to load townships");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTownships();
    }, [fetchTownships]);

    

    // Add Township
    const handleSaveTownship = async (e) => {
        e.preventDefault();

        if (!newTownshipName.trim()) {
            Swal.fire("Error", "Please enter name", "error");
            return;
        }

        if (/^\d+$/.test(newTownshipName.trim())) {
            Swal.fire("Error", "Township name cannot contain only numbers", "error");
            return;
        }

        if (!newTownshipAddress.trim()) {
            Swal.fire("Error", "Please enter address", "error");
            return;
        }

        if (/^\d+$/.test(newTownshipAddress.trim())) {
            Swal.fire("Error", "Township address cannot contain only numbers", "error");
            return;
        }

        if (/^[^a-zA-Z0-9]+$/.test(newTownshipAddress.trim())) {
            Swal.fire("Error", "Township address cannot contain only special characters", "error");
            return;
        }

        if (townships.some(t =>
    t.name.toLowerCase() === newTownshipName.toLowerCase() &&
    t.id !== editingId
)) {
    Swal.fire("Error", "Township name already exists", "error");
    return;
}

        if (townships.some(t => t.address.toLowerCase() === newTownshipAddress.toLowerCase() &&
    t.id !== editingId)) {
            Swal.fire("Error", "Township address already exists", "error");
            return;
        }

        if (!latitude || !longitude) {
            Swal.fire("Error", "Please select location from map", "error");
            return;
        }

        if (!reraNo.trim()) {
            Swal.fire("Error", "Please enter RERA No", "error");
            return;
        }

        setAddingTownship(true);

        try {
            const payload = {
                id: isEditMode ? editingId : 0,
    name: newTownshipName.trim(),
    address: newTownshipAddress.trim(),
    latitude: Number(latitude),
    longitude: Number(longitude),
    rerAno: reraNo.trim(),
    bankName: bankName.trim(),
    ifscCode: ifscCode.trim(),
    accountNumber: Number(accountNumber),
    accountName: accountName.trim(),
};


            await axiosInstance.post(API_ENDPOINTS.TOWNSHIP_SAVE, payload);

            await fetchTownships();

            setShowAddModal(false);
            setNewTownshipName("");
            setNewTownshipAddress("");
            setLatitude("");
            setLongitude("");
            setReraNo("");
            setBankName("");
            setIfscCode("");
            setAccountNumber("");
            setAccountName("");


            Swal.fire({
                icon: "success",
    title: "Success",
    text: isEditMode
        ? "Township updated successfully!"
        : "Township added successfully!",
    timer: 2000,
    showConfirmButton: false
});

        } catch (err) {
            console.error("Failed to save township:", err);

            Swal.fire(
                "Error",
                err.response?.data?.message || "Failed to save township. Please try again.",
                "error"
            );
        } finally {
            setAddingTownship(false);
        }
    };

    

    const confirmDeleteTownship = async () => {
        try {
            await axiosInstance.delete(`${API_ENDPOINTS.TOWNSHIP_DELETE}?id=${deleteTownship.id}`);

            // Refresh the list from server
            await fetchTownships();

            setShowDeleteModal(false);
            setDeleteTownship(null);
            alert("Township deleted successfully!");
        } catch (err) {
            console.error("Error deleting township:", err);
            alert(err.response?.data?.message || "Failed to delete township. Please try again.");
        }
    };

    const handleRetry = () => {
        fetchTownships();
    };

    // Navigate Inventory
    const handleInventoryClick = (id) => {
        navigate(`/property/inventory-management?townshipId=${id}`);
    };
    const handleReserveFundClick = (id) => {
        navigate(`/property/township-funds?townshipId=${id}`);
    };

    const handleEditClick = (t) => {
    setIsEditMode(true);
    setEditingId(t.id);

    setNewTownshipName(t.name);
    setNewTownshipAddress(t.address);
    setReraNo(t.rerAno || "");
    setBankName(t.bankName || "");
    setIfscCode(t.ifscCode || "");
    setAccountNumber(t.accountNumber || "");
    setAccountName(t.accountName || "");

    // optional (jodi backend e thake)
    setLatitude(t.latitude || "");
    setLongitude(t.longitude || "");

    setShowAddModal(true);
};
const resetForm = () => {
    setNewTownshipName("");
    setNewTownshipAddress("");
    setLatitude("");
    setLongitude("");
    setReraNo("");
    setBankName("");
    setIfscCode("");
    setAccountNumber("");
    setAccountName("");
    setIsEditMode(false);
    setEditingId(null);
};

    return (
        <div className="dashboard-container">

            {/* Header */}
            <div className="dashboard-header">
                <div className="dashboard-header-content">

                    <div>
                        <h1 className="dashboard-title">Township Management</h1>
                        <p className="dashboard-subtitle">Manage townships and navigate to inventory details</p>

                    </div>
                </div>
                <div className="dashboard-header-actions">

                    <button
                        className="primary-btn"
                        onClick={() => navigate("/township/add")}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="16" />
                            <line x1="8" y1="12" x2="16" y2="12" />
                        </svg>
                        <span>Add Township</span>
                    </button>
                </div>

            </div>

            {/* Table Section */}
            <div className="card">
                <div className="table-header">
                    <div className="table-header-left">
                        <h3>All Townships</h3>
                        <p className="subtitle">
                            Showing {townships.length} townships
                        </p>
                    </div>
                    {/* <div className="table-header-actions">
                        <div className="view-toggle">
                             <button className="view-btn active">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="4" width="18" height="14" rx="2"/>
                                    <path d="M3 10h18"/>
                                </svg>
                                Table View
                            </button> 
                        </div>
                    </div> */}
                </div>
                <div>
                    {error ? (
                        <div className="error-state card">
                            {/* <div className="error-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="13" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                            </div> */}
                            <h4>Unable to load townships</h4>
                            <p>{error}</p>
                            <button className="primary-btn" onClick={handleRetry}>
                                Retry
                            </button>
                        </div>
                    ) : townships.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                    <polyline points="9,22 9,12 15,12 15,22" />
                                </svg>
                            </div>
                            <h4>No townships found</h4>
                            <p>Add a new township to get started</p>
                            <button
                                className="primary-btn"
                                onClick={() => setShowAddModal(true)}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="16" />
                                    <line x1="8" y1="12" x2="16" y2="12" />
                                </svg>
                                Add First Township
                            </button>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Township Name</th>
                                        <th>Address</th>
                                        <th>RERA No</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {townships.map((t, index) => (
                                        <tr key={t.id} className="table-row">
                                            <td>
                                                <div className="township-name">
                                                    <div className="name-icon">
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                                        </svg>
                                                    </div>
                                                    <span className="name-text">{t.name}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="address-cell">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                        <circle cx="12" cy="10" r="3" />
                                                    </svg>
                                                    <span>{t.address}</span>
                                                </div>
                                            </td>
                                            <td>
                                                {t.rerAno}
                                            </td>
                                            <td><div className="d-flex gap-2">
                                                    <button
                                                    className="primary-btn"
                                                    onClick={() => navigate(`/township/edit/${t.id}`)}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className="primary-btn"
                                                    onClick={() => handleInventoryClick(t.id)}
                                                    title="View Inventory"
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M3 3h18v18H3zM9 9h6v6H9z" />
                                                    </svg>
                                                    <span>Inventory</span>
                                                </button>
                                                 <button
                                                    className="primary-btn"
                                                    onClick={() => handleReserveFundClick(t.id)}
                                                >
                                                    Reserve Funds
                                                </button>
                                            </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header  ">
                             <h3>{isEditMode ? "Edit Township" : "Add Township"}</h3>
                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={() => {
                                    setShowAddModal(false)
                                    resetForm();
                                }}
                            >
                                <FiX size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveTownship}>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-group">
                                <label>Township Name <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    placeholder=""
                                    value={newTownshipName}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (!/^[a-zA-Z0-9\s]*$/.test(value)) return;
                                        if (value.length === 1 && /^[0-9]/.test(value)) return;
                                        setNewTownshipName(value);
                                    }}
                                    required
                                    className="form-control"
                                />
                            </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                <label>RERA No</label>
                                <input
                                    type="text"
                                    value={reraNo}
                                    onChange={(e) => setReraNo(e.target.value)}
                                    className="form-control"
                                />
                            </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group">
                                <label>Township Address <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    placeholder=""
                                    value={newTownshipAddress}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (!/^[a-zA-Z0-9\s]*$/.test(value)) return;
                                        if (value.length === 1 && value === " ") return;
                                        setNewTownshipAddress(value);
                                    }}
                                    required
                                    className="form-control"
                                />
                            </div>
                                </div>
                                
                                <div className="col-md-6">
                                    <div className="form-group">
                                <label>Latitude</label>
                                <input
                                    type="text"
                                    value={latitude}
                                    onChange={(e) => setLatitude(e.target.value)}
                                    className="form-control"
                                />
                            </div>
                                </div>
                                <div className="col-md-6">
                                     <div className="form-group">
                                <label>Longitude</label>
                                <input
                                    type="text"
                                    value={longitude}
                                    onChange={(e) => setLongitude(e.target.value)}
                                    className="form-control"
                                />
                            </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group">
                                <label>Select Location from Map</label>

                                <MapContainer
                                    center={[26.9124, 75.7873]} // Jaipur default
                                    zoom={10}
                                    style={{ height: "300px", width: "100%" }}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <LocationPicker
                                        setLatitude={setLatitude}
                                        setLongitude={setLongitude}
                                        initialPosition={
                                            latitude && longitude
                                                ? [parseFloat(latitude), parseFloat(longitude)]
                                                : null
                                        }
                                    />
                                </MapContainer>
                            </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label htmlFor="">Bank Name</label>
                                        <input type="text" className="form-control" value={bankName} onChange={(e) => setBankName(e.target.value)} />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label htmlFor="">IFSC Code</label>
                                        <input type="text" className="form-control" value={ifscCode} onChange={(e) => setIfscCode(e.target.value)} />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label htmlFor="">Account Number</label>
                                        <input type="text" className="form-control" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label htmlFor="">Account Name</label>
                                        <input type="text" className="form-control" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
                                    </div>
                                </div>
                            </div>
                            

                            
                            

                           

                            
                            
                            <div className="modal-actions gap-2">
                                <button
                                    type="button"
                                    className="primary-btn"
                                    onClick={() => {
                                        setShowAddModal(false)
                                        resetForm();
                                    }}
                                >
                                    Close
                                </button>
                                <button
                                    type="submit"
                                    className="primary-btn"
                                    disabled={addingTownship}
                                >
                                    {addingTownship
    ? (isEditMode ? "Updating..." : "Saving...")
    : (isEditMode ? "Update Township" : "Save Township")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            

            {/* Delete Confirm Modal */}
            {/* {showDeleteModal && deleteTownship && (
                <div className="modal-overlay">
                    <div className="modal-content delete-modal">
                        <div className="modal-header">
                            <h3>Delete Township</h3>
                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <div className="delete-content">
                            <div className="delete-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 6h18" />
                                    <path d="M8 6V4h8v2" />
                                    <path d="M19 6l-1 14H6L5 6" />
                                    <path d="M10 11v6" />
                                    <path d="M14 11v6" />
                                </svg>
                            </div>

                            <h4>Are you sure you want to delete this township?</h4>

                            <div className="township-details">
                                <div className="detail-row">
                                    <div className="label">Name</div>
                                    <div className="value">{deleteTownship.name}</div>
                                </div>
                                <div className="detail-row">
                                    <div className="label">Address</div>
                                    <div className="value">{deleteTownship.address}</div>
                                </div>
                            </div>

                            <div className="warning-text">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 9v4" />
                                    <path d="M12 17h.01" />
                                    <path d="M10.29 3.86 1.82 18a1 1 0 0 0 .86 1.5h18.64a1 1 0 0 0 .86-1.5L13.71 3.86a1 1 0 0 0-1.72 0z" />
                                </svg>
                                <span>This action cannot be undone.</span>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="primary-btn"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="primary-btn"
                                onClick={confirmDeleteTownship}
                            >
                                Delete Township
                            </button>
                        </div>
                    </div>
                </div>
            )} */}
        </div>
    );
}