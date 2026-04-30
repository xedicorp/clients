import { useState, useEffect  } from "react";
import { FiX } from "react-icons/fi";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from '../../utilities/apiConfig';
import Swal from "sweetalert2";

export default function DocumentTypes() { 
    const [documentTypes, setDocumentTypes] = useState([]);
const [showModal, setShowModal] = useState(false);
const [isEdit, setIsEdit] = useState(false);
const [formData, setFormData] = useState({
    id: 0,
    name: "",
    isRequiredForClosure: false
});

    useEffect(() => {
    getAllDocumentTypes();
}, []);

const handleOpenAddModal = () => {
    setIsEdit(false);
    setFormData({
        id: 0,
        name: "",
        isRequiredForClosure: false
    });
    setShowModal(true);
};

const handleOpenEditModal = (item) => {
    setIsEdit(true);
    setFormData({
        id: item.id,
        name: item.name,
        isRequiredForClosure: item.isRequiredForClosure
    });
    setShowModal(true);
};

const handleSave = async () => {
    if (!formData.name.trim()) {
        Swal.fire("Error", "Document Type Name is required", "error");
        return;
    }

    try {
        const res = await axiosInstance.post(
            API_ENDPOINTS.DOCUMENT_TYPES_SAVE,
            formData
        );

        Swal.fire("Success", "Saved successfully", "success");
        setShowModal(false);
        getAllDocumentTypes();

    } catch (error) {
        Swal.fire("Error", error.response?.data?.message || "Something went wrong", "error");
    }
};
    
    

    const getAllDocumentTypes = async () => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.DOCUMENT_TYPES);

        if (response.data) {
            setDocumentTypes (response.data);
        }
        console.log(response.data);

    } catch (error) {
        console.error("Error fetching document types:", error);
    }
    };
 

    const handleDelete = async (id) => {
    const confirm = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!"
    });

    if (confirm.isConfirmed) {
        try {
            await axiosInstance.delete(`${API_ENDPOINTS.DOCUMENT_TYPES_DELETE}/${id}`);

            Swal.fire("Deleted!", "Record deleted successfully", "success");
            getAllDocumentTypes();

        } catch (error) {
            Swal.fire("Error", "Delete failed", "error");
        }
    }
};

const handleToggle = async (item) => {
    const updatedData = {
        ...item,
        isRequiredForClosure: !item.isRequiredForClosure
    };

    try {
        await axiosInstance.post(API_ENDPOINTS.DOCUMENT_TYPES_SAVE, updatedData);

        Swal.fire("Updated", "Status updated successfully", "success");
        getAllDocumentTypes();

    } catch (error) {
        Swal.fire("Error", "Toggle failed", "error");
    }
};

    return (
        <div className="dashboard-container">

            {/* Header */}
            <div className="dashboard-header">
                    <div>
                        <h1 className="dashboard-title">Document Types</h1>
                        <p className="dashboard-subtitle">
                            Manage Document Types
                        </p>
                    </div>
                    <div className="dashboard-header-actions">
                        <button className="primary-btn" onClick={handleOpenAddModal}>
    Add Document Type
</button>
                    </div>
 
            </div>
            {showModal && (
    <div className="modal-overlay">
            <div className="modal-content">

                <div className="modal-header">
                    <h5 className="modal-title">
                        {isEdit ? "Edit" : "Add"} Document Type
                    </h5>
                    <button className="modal-close-btn" onClick={() => setShowModal(false)}><FiX size={20} /></button>
                </div>

                <div className="">
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                        />
                    </div>

                    <div className="form-group">
                        <label>Required for Closure?</label>

                        <div className="d-flex align-items-center mt-2">
                            <input
                                type="radio"
                                checked={formData.isRequiredForClosure === true}
                                onChange={() =>
                                    setFormData({ ...formData, isRequiredForClosure: true })
                                }
                            /> Yes

                            <input
                                type="radio"
                                className="ms-3"
                                checked={formData.isRequiredForClosure === false}
                                onChange={() =>
                                    setFormData({ ...formData, isRequiredForClosure: false })
                                }
                            /> No
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="primary-btn me-2"
                        onClick={() => setShowModal(false)}>
                        Cancel
                    </button>

                    <button className="primary-btn"
                        onClick={handleSave}>
                        Save
                    </button>
                </div>

            </div>
    </div>
)}

            {/* Table Section */}
            <div className="card">
                <div className="dashboard-table-header">
                        <h3 className="dashboard-table-title">All Document Types</h3>
                    <p className="subtitle">
                            Showing {documentTypes.length} records
                        </p>
                </div>

                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Document Type Name</th>
                                <th>Is Requried for Closure?</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
    {documentTypes.map((item) => (
        <tr key={item.id}>
            <td>{item.name}</td>

            <td>
                <div className="status-switch-container">
                    <label className="status-switch">
                        <input
                            type="checkbox"
                            checked={item.isRequiredForClosure}
                            onChange={() => handleToggle(item)}
                        />
                        <span className="switch-slider"></span>
                    </label>

                    <span className={`status-text ${item.isRequiredForClosure ? 'active' : 'inactive'}`}>
                        {item.isRequiredForClosure ? 'Yes' : 'No'}
                    </span>
                </div>
            </td>

            <td>
                <div className="d-flex gap-2">
                    <button className="primary-btn me-2"
                        onClick={() => handleOpenEditModal(item)}>
                        Edit
                    </button>

                    <button className="primary-btn"
                        onClick={() => handleDelete(item.id)}>
                        Delete
                    </button>
                </div>
            </td>
        </tr>
    ))}
</tbody>
                    </table>
                    
                </div>
            </div>

           
        </div>
        
    );
}