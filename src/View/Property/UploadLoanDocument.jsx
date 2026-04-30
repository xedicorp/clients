import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BookingWrapper from "./style";
import PropertyNavigation from "./PropertyNavigation";
import ReminderButton from "../../components/ReminderButton";
import ReminderPopup from "../../components/ReminderPopup";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from "../../utilities/apiConfig";
import { formatDisplayDate, formatDateTime } from "../../utilities/dateUtils";
import Swal from "sweetalert2";
import "./UploadLoanDocument.css";

export default function UploadLoanDocument() {
    const navigate = useNavigate();
    const { id } = useParams();
    
    const [documentTypeId, setDocumentTypeId] = useState("");
    const [file, setFile] = useState(null);
    const [notes, setNotes] = useState("document");
    const [documents, setDocuments] = useState([]);
    const [loadingDocuments, setLoadingDocuments] = useState(false);
    const [loadingDocumentTypes, setLoadingDocumentTypes] = useState(false);
    const [documentTypes, setDocumentTypes] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [booking, setBooking] = useState(null);
    const [loadingBooking, setLoadingBooking] = useState(true);
    
    // Edit/Delete states
    const [editingDoc, setEditingDoc] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editDocumentTypeId, setEditDocumentTypeId] = useState("");
    const [editNotes, setEditNotes] = useState("");
    const [updating, setUpdating] = useState(false);
    const [editDocumentUrl, setEditDocumentUrl] = useState(null);
    const [loadingEditDocument, setLoadingEditDocument] = useState(false);

    // View document modal state
    const [viewingDoc, setViewingDoc] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [loadingDocument, setLoadingDocument] = useState(false);
    const [documentUrl, setDocumentUrl] = useState(null);

    // Reminder popup state
    const [isReminderPopupOpen, setIsReminderPopupOpen] = useState(false);
    useEffect(() => {
        const fetchAllData = async () => {
            if (!id) {
                // Check for booking ID and redirect if missing
                Swal.fire({
                    icon: "warning",
                    title: "No Booking Selected",
                    text: "Please select a booking first.",
                    confirmButtonText: "Go to Booking List"
                }).then(() => {
                    navigate("/");
                });
                return;
            }

            try {
                // 1. Fetch booking details
                setLoadingBooking(true);
                try {
                    const response = await axiosInstance.get(`${API_ENDPOINTS.BOOKING_LIST}`);
                    const bookingsList = Array.isArray(response.data) ? response.data : (response.data?.value || []);
                    const bookingData = bookingsList.find(b => b.id === Number(id));
                    
                    if (bookingData) {
                        setBooking({
                            id: bookingData.id,
                            township: bookingData.townshipName,
                            plotNumber: bookingData.plotNo,
                            plotSize: bookingData.plotSize,
                            clientName: bookingData.clientName,
                            clientMobile: bookingData.contactNo,
                            bookingDate: bookingData.bookingDate || new Date().toISOString().split('T')[0]
                        });
                    }
                } catch (error) {
                    // Handle booking error silently
                } finally {
                    setLoadingBooking(false);
                }

                // 2. Fetch document types
                setLoadingDocumentTypes(true);
                try {
                    const response = await axiosInstance.get(API_ENDPOINTS.DOCUMENT_TYPES);
                    setDocumentTypes(response.data || []);
                } catch (error) {
                    setDocumentTypes([]);
                } finally {
                    setLoadingDocumentTypes(false);
                }

                // 3. Fetch documents for this booking
                setLoadingDocuments(true);
                try {
                    const response = await axiosInstance.get(
                        `${API_ENDPOINTS.GET_DOCUMENTS_BY_BOOKING_ID}?bookingId=${id}`
                    );
                    const docs = Array.isArray(response.data) ? response.data : [];
                    setDocuments(docs);
                } catch (error) {
                    setDocuments([]);
                } finally {
                    setLoadingDocuments(false);
                }

            } catch (error) {
                // Handle any global errors
            }
        };

        fetchAllData();
    }, [id, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!documentTypeId || !file || !notes?.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Incomplete Information",
                text: "Please select document type, upload file, and add notes",
            });
            return;
        }

        const bookingId = Number(id);
        if (!bookingId) {
            Swal.fire({
                icon: "error",
                title: "Missing Booking ID",
                text: "Invalid booking ID in URL.",
            });
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('BookingId', bookingId);
            formData.append('DocumentTypeId', parseInt(documentTypeId, 10));
            formData.append('File', file);
            formData.append('Notes', notes?.trim() || 'document');

            const response = await axiosInstance.post(
                API_ENDPOINTS.UPLOAD_DOCUMENT,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            
            Swal.fire({
                icon: "success",
                title: "Document Uploaded Successfully",
                text: "Your document has been uploaded",
                timer: 1800,
                showConfirmButton: false,
            });

            // Clear form
            setDocumentTypeId("");
            setFile(null);
            setNotes("document");
            
            // Reset file input
            const fileInput = document.querySelector('input[type="file"]');
            if (fileInput) fileInput.value = '';

            // Refresh documents list
            const docsResponse = await axiosInstance.get(
                `${API_ENDPOINTS.GET_DOCUMENTS_BY_BOOKING_ID}?bookingId=${id}`
            );
            setDocuments(Array.isArray(docsResponse.data) ? docsResponse.data : []);

        } catch (err) {
            const status = err.response?.status;
            let msg = "Failed to upload document";
            
            // Get detailed error message from response
            if (err.response?.data) {
                if (typeof err.response.data === 'string') {
                    msg = err.response.data;
                } else if (err.response.data.title) {
                    msg = err.response.data.title;
                    
                    // Add validation errors if present
                    if (err.response.data.errors) {
                        const errors = err.response.data.errors;
                        const errorList = Object.keys(errors).map(key => 
                            `${key}: ${errors[key].join(', ')}`
                        ).join('\n');
                        msg += '\n\nValidation Errors:\n' + errorList;
                    }
                } else if (err.response.data.message) {
                    msg = err.response.data.message;
                }
            } else if (err.message) {
                msg = err.message;
            }

            if (status === 400) msg = "Invalid document data. " + msg;
            else if (status === 404) msg = `Booking ID ${id} not found. ` + msg;
            else if (status === 500) msg = "Internal Server Error. " + msg;

            Swal.fire({
                icon: "error",
                title: `Upload Failed (${status || "Network Error"})`,
                text: msg,
            });
        } finally {
            setUploading(false);
        }
    };

    // Handle edit document
    const handleEditDocument = async (doc) => {
        setEditingDoc(doc);
        setEditDocumentTypeId(doc.documentTypeId || "");
        setEditNotes(doc.notes || "");
        setShowEditModal(true);
        setLoadingEditDocument(true);
        setEditDocumentUrl(null);

        // Load document preview
        try {
            const response = await axiosInstance.get(
                `${API_ENDPOINTS.DOCUMENT_DOWNLOAD}?id=${doc.documentId}`,
                {
                    responseType: 'blob',
                    headers: {
                        'Accept': 'application/pdf, application/octet-stream, image/*, */*'
                    }
                }
            );

            if (response.data && response.data.size > 0) {
                const blob = new Blob([response.data], { 
                    type: response.headers['content-type'] || 'application/pdf' 
                });
                const url = window.URL.createObjectURL(blob);
                setEditDocumentUrl(url);
            }
        } catch (err) {
            console.error('Failed to load document preview:', err);
        } finally {
            setLoadingEditDocument(false);
        }
    };

    // Handle update document
    const handleUpdateDocument = async (e) => {
        e.preventDefault();
        
        if (!editingDoc || !editDocumentTypeId || !editNotes?.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Incomplete Information",
                text: "Please select document type and add notes",
            });
            return;
        }

        setUpdating(true);
        try {
            const payload = {
                documentId: editingDoc.documentId,
                documentTypeId: parseInt(editDocumentTypeId, 10),
                notes: editNotes.trim()
            };

            await axiosInstance.put(
                `${API_ENDPOINTS.UPDATE_DOCUMENT_BY_ID}/${editingDoc.documentId}`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            Swal.fire({
                icon: "success",
                title: "Document Updated Successfully",
                text: "Document information has been updated",
                timer: 1800,
                showConfirmButton: false,
            });

            // Close modal and refresh documents
            setShowEditModal(false);
            setEditingDoc(null);
            
            // Refresh documents list
            const docsResponse = await axiosInstance.get(
                `${API_ENDPOINTS.GET_DOCUMENTS_BY_BOOKING_ID}?bookingId=${id}`
            );
            setDocuments(Array.isArray(docsResponse.data) ? docsResponse.data : []);

        } catch (err) {
            const status = err.response?.status;
            let msg = "Failed to update document";
            
            if (err.response?.data) {
                if (typeof err.response.data === 'string') {
                    msg = err.response.data;
                } else if (err.response.data.title) {
                    msg = err.response.data.title;
                } else if (err.response.data.message) {
                    msg = err.response.data.message;
                }
            }

            Swal.fire({
                icon: "error",
                title: `Update Failed (${status || "Network Error"})`,
                text: msg,
            });
        } finally {
            setUpdating(false);
        }
    };

    // Handle delete document (Hard-coded - immediate delete from UI)
    const handleDeleteDocument = async (doc) => {
    const result = await Swal.fire({
        icon: "warning",
        title: "Delete Document?",
        html: `
            <p>Are you sure you want to delete this document?</p>
            <p><strong>Document Type:</strong> ${doc.documentTypeName}</p>
            <p><strong>Notes:</strong> ${doc.notes || 'No notes'}</p>
            <p style="color: #ef4444; margin-top: 8px;">This action cannot be undone.</p>
        `,
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, Delete",
        cancelButtonText: "Cancel"
    });

    if (!result.isConfirmed) return;

    try {
        // ✅ API CALL
        await axiosInstance.delete(
            `${API_ENDPOINTS.DELETE_DOCUMENT_BY_ID}/${doc.documentId}`
        );

        // ✅ Refresh list after delete
        const docsResponse = await axiosInstance.get(
            `${API_ENDPOINTS.GET_DOCUMENTS_BY_BOOKING_ID}?bookingId=${id}`
        );
        setDocuments(Array.isArray(docsResponse.data) ? docsResponse.data : []);

        Swal.fire({
            icon: "success",
            title: "Document Deleted",
            text: "Document has been deleted successfully",
            timer: 1500,
            showConfirmButton: false,
        });

    } catch (err) {
        console.error(err);

        Swal.fire({
            icon: "error",
            title: "Delete Failed",
            text: err.response?.data || "Failed to delete document",
        });
    }
};

    // Handle view document
    const handleViewDocument = async (doc) => {
        // Validate document data
        if (!doc || !doc.documentId) {
            Swal.fire({
                icon: "error",
                title: "Invalid Document",
                text: "Document information is missing or invalid.",
            });
            return;
        }

        setViewingDoc(doc);
        setShowViewModal(true);
        setLoadingDocument(true);
        setDocumentUrl(null);

        try {
            // Try to get document URL for preview
            const response = await axiosInstance.get(
                `${API_ENDPOINTS.DOCUMENT_DOWNLOAD}?id=${doc.documentId}`,
                {
                    responseType: 'blob',
                    headers: {
                        'Accept': 'application/pdf, application/octet-stream, */*'
                    }
                }
            );

            // Validate response
            if (!response.data || response.data.size === 0) {
                return;
            }

            // Create blob URL for preview
            const blob = new Blob([response.data], { 
                type: response.headers['content-type'] || 'application/pdf' 
            });
            const url = window.URL.createObjectURL(blob);
            setDocumentUrl(url);

        } catch (err) {
            // Don't show error here, just show no preview available
        } finally {
            setLoadingDocument(false);
        }
    };

    // Close view modal and cleanup
    const closeViewModal = () => {
        setShowViewModal(false);
        setViewingDoc(null);
        if (documentUrl) {
            window.URL.revokeObjectURL(documentUrl);
            setDocumentUrl(null);
        }
    };

    // Handle download document
        const handleDownloadDocument = async (doc) => {
            // Validate document data
            if (!doc || !doc.documentId) {
                Swal.fire({
                    icon: "error",
                    title: "Invalid Document",
                    text: "Document information is missing or invalid.",
                });
                return;
            }

            try {
                // Show loading state
                Swal.fire({
                    title: 'Downloading Document...',
                    html: `
                        <p>Preparing document for download</p>
                        <p><strong>Document:</strong> ${doc.documentTypeName || 'Unknown'}</p>
                        <p><strong>ID:</strong> #${doc.documentId}</p>
                    `,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    showConfirmButton: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                const response = await axiosInstance.get(
                    `${API_ENDPOINTS.DOCUMENT_DOWNLOAD}?id=${doc.documentId}`,
                    {
                        responseType: 'blob', // Important for file downloads
                        headers: {
                            'Accept': 'application/pdf, application/octet-stream, */*'
                        }
                    }
                );

                // Close loading dialog
                Swal.close();

                // Validate response
                if (!response.data || response.data.size === 0) {
                    throw new Error('Empty document received from server');
                }

                // Create blob URL and trigger download
                const blob = new Blob([response.data], { 
                    type: response.headers['content-type'] || 'application/pdf' 
                });
                
                // Create a better filename with document type and ID
                const docTypeName = (doc.documentTypeName || 'Document').replace(/[^a-zA-Z0-9]/g, '_');
                let filename = `${docTypeName}_${doc.documentId}`;
                
                // Extract filename from Content-Disposition header if available
                const contentDisposition = response.headers['content-disposition'];
                if (contentDisposition) {
                    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                    if (filenameMatch && filenameMatch[1]) {
                        filename = filenameMatch[1].replace(/['"]/g, '');
                    }
                } else {
                    // Add appropriate extension based on content type
                    const contentType = response.headers['content-type'] || 'application/pdf';
                    if (contentType.includes('pdf')) {
                        filename += '.pdf';
                    } else if (contentType.includes('image')) {
                        if (contentType.includes('jpeg') || contentType.includes('jpg')) {
                            filename += '.jpg';
                        } else if (contentType.includes('png')) {
                            filename += '.png';
                        } else {
                            filename += '.jpg'; // default for images
                        }
                    } else {
                        filename += '.pdf'; // default extension
                    }
                }
                
                // Use a more reliable download method
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                link.style.display = 'none'; 
                document.body.appendChild(link);
                link.click();
                setTimeout(() => {
                    if (document.body.contains(link)) {
                        document.body.removeChild(link);
                    }
                    window.URL.revokeObjectURL(url);
                }, 100);

                // Show success message
                Swal.fire({
                    icon: "success",
                    title: "Document Downloaded",
                    html: `
                        <p>Document has been downloaded successfully</p>
                        <p><strong>File:</strong> ${filename}</p>
                        <p style="color: #6b7280; font-size: 14px;">Check your Downloads folder</p>
                    `,
                    timer: 3000,
                    showConfirmButton: false,
                });

            } catch (err) {
                // Close any loading dialog
                Swal.close();
                
                const status = err.response?.status;
                let msg = "Failed to download document";
                
                if (status === 404) {
                    msg = "Document not found or has been removed";
                } else if (status === 403) {
                    msg = "You don't have permission to download this document";
                } else if (status === 500) {
                    msg = "Server error occurred while downloading document";
                } else if (err.message) {
                    msg = err.message;
                }

                Swal.fire({
                    icon: "error",
                    title: `Download Failed ${status ? `(${status})` : ''}`,
                    text: msg,
                });
            }
        };

    if (!id) {
        return null;
    }

    return (
        <>
        <BookingWrapper className="dashboard-container">
            <div className="dashboard-header">
                <div className="dashboard-header-content">
                    <div>
                        <h2 className="dashboard-title">Upload Documents</h2>
                        <p className="dashboard-subtitle">Upload and manage documents</p>
                    </div>
                </div>
                <div className="dashboard-header-actions">
                    <button className="primary-btn" onClick={() => navigate(-1)}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    width="20"
                                    height="20"
                                >
                                    <path d="M15 18l-6-6 6-6" />
                                </svg>
                                Back
                            </button>
                    {/* <PropertyNavigation hideHealthButton bookingId={id} /> */}
                    <button className="primary-btn" onClick={() => setIsReminderPopupOpen(true)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            Reminder
                        </button>
                </div>
            </div>

            {/* Booking Information */}
            {!loadingBooking && booking ? (
                <div className="card">
    <div className="booking-info-matrix">

        <div className="booking-info-row">
            <label>Township : </label>
            <span className="booking-info-value">
                {booking?.township || 'N/A'}
            </span>
        </div>

        <div className="booking-info-row">
            <label>Plot : </label>
            <span className="booking-info-value">
                {booking?.plotNumber || 'N/A'}
            </span>
        </div>

        <div className="booking-info-row">
            <label>Size : </label>
            <span className="booking-info-value">
                {booking?.plotSize || 'N/A'}
            </span>
        </div>

        <div className="booking-info-row">
            <label>Client : </label>
            <span className="booking-info-value">
                {booking?.clientName || 'N/A'}
            </span>
        </div>

        <div className="booking-info-row">
            <label>Mobile : </label>
            <span className="booking-info-value">
                {booking?.clientMobile || 'N/A'}
            </span>
        </div>

        <div className="booking-info-row">
            <label>Booking Date : </label>
            <span className="booking-info-value">
                {booking?.bookingDate
                    ? formatDisplayDate(booking.bookingDate)
                    : 'N/A'}
            </span>
        </div>

    </div>
</div>

            ) : (
                <div className="card booking-info-card">
                    <div style={{ padding: '15px', textAlign: 'center' }}>
                        <p>Loading booking information...</p>
                    </div>
                </div>
            )}

            <div className="card">
                <div className="dashboard-table-header">
                    <h3 className="dashboard-table-title">Document Upload</h3>
                    <div className="dashboard-badge">Loan Documents</div>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="upload-loan-form-grid">
                        <div className="upload-loan-field">
                            <label htmlFor="documentType">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                                    <polyline points="13 2 13 9 20 9"></polyline>
                                </svg>
                                Document Type *
                            </label>
                            <select
                                id="documentType"
                                value={documentTypeId}
                                onChange={(e) => setDocumentTypeId(e.target.value)}
                                disabled={loadingDocumentTypes}
                                required
                                className="form-control"
                            >
                                <option value="">
                                    {loadingDocumentTypes ? "Loading..." : "-- Select Document Type --"}
                                </option>
                                {documentTypes.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="upload-loan-field">
                            <label htmlFor="file">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="17 8 12 3 7 8"></polyline>
                                    <line x1="12" y1="3" x2="12" y2="15"></line>
                                </svg>
                                Upload File *
                            </label>
                            <input
                                id="file"
                                type="file"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                accept=".pdf,.jpg,.jpeg,.png"
                                required
                                className="form-control"
                            />
                        </div>

                        <div className="upload-loan-field upload-loan-notes-field">
                            <label htmlFor="notes">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                                Notes *
                            </label>
                            <textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Enter notes about this document..."
                                required
                                minLength="1"
                                rows="4"
                                className="form-control"
                            />
                        </div>
                    </div>

                    <div className="upload-loan-actions">
                        <button type="submit" className="primary-btn" disabled={uploading}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                            {uploading ? "Uploading..." : "Upload Document"}
                        </button>
                    </div>
                </form>
            </div>

            <div className="card ">
                <div className="dashboard-table-header">
                    <h3 className="dashboard-table-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                            <polyline points="13 2 13 9 20 9"></polyline>
                        </svg>
                        Uploaded Documents
                    </h3>
                    <div className="dashboard-badge">
                        {loadingDocuments ? "Loading..." : `${documents.length} Files`}
                    </div>
                </div>
                <div className="table-wrapper">
                    {loadingDocuments ? (
                        <div className="loading-state">
                            <div className="loading-spinner"></div>
                            <p>Loading documents...</p>
                        </div>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th className="left">Document ID</th>
                                    <th className="left">Document Type</th>
                                    <th className="left">Uploaded On</th>
                                    <th className="left">Uploaded By</th>
                                    <th className="left">Notes</th>
                                    {/* <th className="center">View</th> */}
                                    {/* <th className="center">Download</th> */}
                                    <th className="center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {documents.filter(doc => doc && doc.documentId).map((doc) => (
                                    <tr key={doc.documentId || Math.random()}>
                                        <td className="doc-id">
                                            <strong>{doc.documentId || 'N/A'}</strong>
                                        </td>
                                        <td className="doc-type">
                                            <span>{doc.documentTypeName || 'Unknown'}</span>
                                        </td>
                                        <td className="date">
                                            {doc.uploadedOn ? formatDateTime(doc.uploadedOn) : <span className="empty-value">-</span>}
                                        </td>
                                        <td className="uploaded-by">
                                            {doc.uploadedBy || <span className="empty-value">-</span>}
                                        </td>
                                        <td className="notes">
                                            {doc.notes || <span className="empty-value">No notes</span>}
                                        </td>
                                        {/* <td className="view center">
                                            <button 
                                                className="view-btn" 
                                                onClick={() => handleViewDocument(doc)}
                                                title="View Document Details"
                                                disabled={!doc.documentId}
                                            >
                                                View
                                            </button>
                                        </td> */}
                                        {/* <td className="download center">
                                            
                                        </td> */}
                                        <td className="actions center">
                                            <div className="action-buttons">
                                                <button 
                                                className="primary-btn" 
                                                onClick={() => handleDownloadDocument(doc)}
                                                title="Download Document"
                                                disabled={!doc.documentId}
                                            >
                                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                    <polyline points="7 10 12 15 17 10"></polyline>
                                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                                </svg>
                                                <span>Download</span>
                                            </button>
                                                <button 
                                                    className="primary-btn" 
                                                    onClick={() => handleEditDocument(doc)}
                                                    title="Edit Document"
                                                    disabled={!doc.documentId}
                                                >
                                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
                                                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                    </svg>
                                                    <span>Edit</span>
                                                </button>
                                                <button 
                                                    className="primary-btn" 
                                                    onClick={() => handleDeleteDocument(doc)}
                                                    title="Delete Document"
                                                    disabled={!doc.documentId}
                                                >
                                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"></path>
                                                    </svg>
                                                    <span>Delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {documents.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="no-data">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10"></circle>
                                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                            </svg>
                                            <p>No documents uploaded yet</p>
                                            <span>Start by uploading your first loan document</span> 
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Edit Document Modal */}
            {showEditModal && editingDoc && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <div className="modal-header">
                            <h3>Edit Document</h3>
                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={() => {
                                    if (editDocumentUrl) {
                                        window.URL.revokeObjectURL(editDocumentUrl);
                                        setEditDocumentUrl(null);
                                    }
                                    setShowEditModal(false);
                                    setEditingDoc(null);
                                }}
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleUpdateDocument}>
                            {/* Document Preview Section */}
                            {editingDoc && (
                                <div className="document-preview-section">
                                    <div className="preview-header">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                                            <polyline points="13 2 13 9 20 9"></polyline>
                                        </svg>
                                        <span>Current Document Preview</span>
                                    </div>
                                    
                                    {/* Document Preview */}
                                    {/* <div className="edit-document-viewer">
                                        {loadingEditDocument ? (
                                            <div className="loading-state">
                                                <div className="loading-spinner"></div>
                                                <p>Loading document preview...</p>
                                            </div>
                                        ) : editDocumentUrl ? (
                                            <iframe
                                                src={editDocumentUrl}
                                                title="Document Preview"
                                                className="edit-document-frame"
                                            />
                                        ) : (
                                            <div className="no-preview">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                                                    <polyline points="13 2 13 9 20 9"></polyline>
                                                </svg>
                                                <p>Preview not available</p>
                                                <span>Document cannot be previewed</span>
                                            </div>
                                        )}
                                    </div> */}

                                    <div className="preview-info">
                                        <div className="preview-item">
                                            <span className="preview-label">Document ID:</span>
                                            <span className="preview-value">#{editingDoc.documentId}</span>
                                        </div>
                                        <div className="preview-item">
                                            <span className="preview-label">Type:</span>
                                            <span className="preview-value">{editingDoc.documentTypeName}</span>
                                        </div>
                                        <div className="preview-item">
                                            <span className="preview-label">Uploaded:</span>
                                            <span className="preview-value">{editingDoc.uploadedOn ? formatDateTime(editingDoc.uploadedOn) : 'N/A'}</span>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        type="button"
                                        className="small-btn secondary download-preview-btn"
                                        onClick={() => handleDownloadDocument(editingDoc)}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                            <polyline points="7 10 12 15 17 10"></polyline>
                                            <line x1="12" y1="15" x2="12" y2="3"></line>
                                        </svg>
                                        Download Document
                                    </button>
                                </div>
                            )}
                            
                            <div className="modal-grid">
                                <div>
                                    <label htmlFor="edit-document-type">Document Type *</label>
                                    <select
                                        id="edit-document-type"
                                        value={editDocumentTypeId}
                                        onChange={(e) => setEditDocumentTypeId(e.target.value)}
                                        disabled={loadingDocumentTypes}
                                        required
                                    >
                                        <option value="">
                                            {loadingDocumentTypes ? "Loading..." : "-- Select Document Type --"}
                                        </option>
                                        {documentTypes.map((type) => (
                                            <option key={type.id} value={type.id}>
                                                {type.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="edit-notes">Notes *</label>
                                <textarea 
                                    id="edit-notes"
                                    className="edit-textarea" 
                                    value={editNotes} 
                                    onChange={(e) => setEditNotes(e.target.value)}
                                    placeholder="Enter notes about this document..."
                                    required
                                    rows="4"
                                />
                            </div>
                                            
                            <div className="modal-actions">
                                <button 
                                    type="button" 
                                    className="small-btn" 
                                    onClick={() => {
                                        if (editDocumentUrl) {
                                            window.URL.revokeObjectURL(editDocumentUrl);
                                            setEditDocumentUrl(null);
                                        }
                                        setShowEditModal(false);
                                        setEditingDoc(null);
                                    }}
                                >
                                    Close
                                </button>
                                <button 
                                    type="submit" 
                                    className="small-btn primary" 
                                    disabled={updating}
                                >
                                    {updating ? "Updating..." : "Update Document"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}



            {/* Reminder Popup */}
            {/* <ReminderPopup
                isOpen={showReminderPopup}
                onClose={() => setShowReminderPopup(false)}
                title="Create Reminder"
                bookingId={id}
            /> */}

            {/* Document View Modal */}
            {showViewModal && viewingDoc && (
                <div className="modal-overlay">
                    <div className="modal-box view-modal">
                        <div className="modal-header">
                            <h3>View Document - {viewingDoc.documentTypeName}</h3>
                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={closeViewModal}
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>
                        <div className="view-modal-content">
                            {/* Document Info */}
                            <div className="document-info">
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="info-label">Document ID:</span>
                                        <span className="info-value">#{viewingDoc.documentId}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Document Type:</span>
                                        <span className="info-value">{viewingDoc.documentTypeName}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Uploaded On:</span>
                                        <span className="info-value">{formatDateTime(viewingDoc.uploadedOn)}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Uploaded By:</span>
                                        <span className="info-value">{viewingDoc.uploadedBy || 'N/A'}</span>
                                    </div>
                                    <div className="info-item full-width">
                                        <span className="info-label">Notes:</span>
                                        <span className="info-value">{viewingDoc.notes || 'No notes'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Document Viewer */}
                            <div className="document-viewer">
                                {loadingDocument ? (
                                    <div className="loading-state">
                                        <div className="loading-spinner"></div>
                                        <p>Loading document...</p>
                                    </div>
                                ) : documentUrl ? (
                                    <iframe
                                        src={documentUrl}
                                        title="Document Viewer"
                                        className="document-frame"
                                        onError={() => {
                                            Swal.fire({
                                                icon: "error",
                                                title: "Preview Not Available",
                                                text: "Document preview is not available. You can download it instead.",
                                            });
                                        }}
                                    />
                                ) : (
                                    <div className="no-preview">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                                            <polyline points="13 2 13 9 20 9"></polyline>
                                        </svg>
                                        <p>Document preview not available</p>
                                        <span>Use the download button to view the document</span>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="view-modal-actions">
                                <button 
                                    type="button" 
                                    className="small-btn secondary" 
                                    onClick={closeViewModal}
                                >
                                    Close
                                </button>
                                <button 
                                    type="button" 
                                    className="small-btn primary download-action-btn" 
                                    onClick={() => handleDownloadDocument(viewingDoc)}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="7 10 12 15 17 10"></polyline>
                                        <line x1="12" y1="15" x2="12" y2="3"></line>
                                    </svg>
                                    Download
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            )}

        </BookingWrapper>
         <ReminderPopup
                        isOpen={isReminderPopupOpen}
                        onClose={() => setIsReminderPopupOpen(false)}
                        title="Payment Reminders"
                        bookingId={id}
                    />
        </>
    );
}