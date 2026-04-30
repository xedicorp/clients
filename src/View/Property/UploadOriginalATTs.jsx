import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BookingWrapper from "./style";
import PropertyNavigation from "./PropertyNavigation";
import ReminderButton from "../../components/ReminderButton";
import ReminderPopup from "../../components/ReminderPopup";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS, { API_BASE_URL } from "../../utilities/apiConfig";
import { formatDisplayDate } from "../../utilities/dateUtils";
import Swal from "sweetalert2";
import "./UploadOriginalATTs.css";

export default function UploadOriginalATTs() {
    const navigate = useNavigate();
    const { id: bookingId } = useParams();

    const [file, setFile] = useState(null);
    const [notes, setNotes] = useState("");
    const [uploading, setUploading] = useState(false);
    const [booking, setBooking] = useState(null);
    const [loadingBooking, setLoadingBooking] = useState(true);
    
    // Edit mode state
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingDocId, setEditingDocId] = useState(null);
    const [editingNotes, setEditingNotes] = useState("");
    
    // Single state for documents - combine API and local
    const [documents, setDocuments] = useState([]);
    const [loadingDocuments, setLoadingDocuments] = useState(false);
    const [documentsError, setDocumentsError] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Reminder popup state
    const [showReminderPopup, setShowReminderPopup] = useState(false);

    // Helper function to get file type from file name
    const getFileType = (fileName) => {
        if (!fileName) return 'Unknown';
        const extension = fileName.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'jpg':
            case 'jpeg':
                return 'JPEG';
            case 'png':
                return 'PNG';
            case 'pdf':
                return 'PDF';
            case 'doc':
                return 'DOC';
            case 'docx':
                return 'DOCX';
            case 'txt':
                return 'TXT';
            case 'gif':
                return 'GIF';
            case 'bmp':
                return 'BMP';
            case 'tiff':
            case 'tif':
                return 'TIFF';
            default:
                return extension ? extension.toUpperCase() : 'Unknown';
        }
    };

    // Helper function to get file type icon
    const getFileTypeIcon = (fileName) => {
        const fileType = getFileType(fileName);
        switch (fileType) {
            case 'JPEG':
            case 'PNG':
            case 'GIF':
            case 'BMP':
            case 'TIFF':
                return (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', color: '#10b981' }}>
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                );
            case 'PDF':
                return (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', color: '#ef4444' }}>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                );
            case 'DOC':
            case 'DOCX':
                return (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', color: '#3b82f6' }}>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                );
            default:
                return (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', color: '#6b7280' }}>
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                        <polyline points="13 2 13 9 20 9"></polyline>
                    </svg>
                );
        }
    };

    const readFileAsDataURL = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

    const handleViewFile = (record) => {
        if (!record) return;

        const fileName = record.fileName;
        const fileType = record.fileType || getFileType(fileName);
        const dataURL = record.fileDataURL;

        if (dataURL) {
            if (fileType === 'PDF') {
                Swal.fire({
                    title: fileName || 'PDF',
                    html: `
                        <div style="display:flex; flex-direction:column; gap:12px;">
                            <iframe src="${dataURL}" style="width:100%; height:70vh; border:1px solid #ddd; border-radius:8px;"></iframe>
                            <a href="${dataURL}" download="${fileName || 'document.pdf'}" style="display:inline-flex; align-items:center; gap:8px; padding:8px 12px; border:1px solid var(--primary-color); border-radius:6px; color:var(--primary-color);">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px; height:16px;">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="17 8 12 3 7 8"></polyline>
                                    <line x1="12" y1="3" x2="12" y2="15"></line>
                                </svg>
                                Download
                            </a>
                        </div>
                    `,
                    showConfirmButton: true,
                    confirmButtonText: 'Close',
                    width: '80%',
                });
                return;
            }
            if (['JPEG', 'PNG', 'GIF', 'BMP', 'TIFF'].includes(fileType)) {
                Swal.fire({
                    title: fileName || 'Image',
                    html: `
                        <div style="display:flex; flex-direction:column; gap:12px;">
                            <img src="${dataURL}" alt="${fileName || 'Image'}" style="max-width:100%; max-height:70vh; border-radius:8px; border:1px solid #ddd; object-fit:contain;" />
                            <a href="${dataURL}" download="${fileName || 'image'}" style="display:inline-flex; align-items:center; gap:8px; padding:8px 12px; border:1px solid var(--primary-color); border-radius:6px; color:var(--primary-color);">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px; height:16px;">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="17 8 12 3 7 8"></polyline>
                                    <line x1="12" y1="3" x2="12" y2="15"></line>
                                </svg>
                                Download
                            </a>
                        </div>
                    `,
                    showConfirmButton: true,
                    confirmButtonText: 'Close',
                    width: '60%',
                });
                return;
            }
            const link = document.createElement('a');
            link.href = dataURL;
            link.download = fileName || 'file';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
        }

        Swal.fire({
            title: fileName || 'File',
            html: `
                <div style="text-align: center;">
                    <p style="margin-bottom: 15px; color: #666;">File Type: ${fileType}</p>
                    <p style="color: #999; font-size: 14px;">Preview unavailable</p>
                    <p style="color: #999; font-size: 12px;">Re-upload the file to enable local preview</p>
                </div>
            `,
            showConfirmButton: true,
            confirmButtonText: 'Close',
            width: 500
        });
    };

    const handleDeleteFile = async (fileToDelete) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This document will be permanently deleted!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Yes, delete it"
        }).then(async (result) => {
            if (!result.isConfirmed) return;

            try {
                if (fileToDelete.source === "api") {
                    await axiosInstance.delete(
                        `${API_ENDPOINTS.DELETE_DOCUMENT_BY_ID}/${fileToDelete.id.replace("api_", "")}`
                    );
                    Swal.fire("Deleted!", "Server document deleted.", "success");
                } 
                else if (fileToDelete.source === "local") {
                    const existing = JSON.parse(
                        localStorage.getItem("original_atts_uploads") || "[]"
                    );

                    const updated = existing.filter(
                        item =>
                            item.createdAt !== fileToDelete.createdAt ||
                            item.fileName !== fileToDelete.fileName
                    );

                    localStorage.setItem(
                        "original_atts_uploads",
                        JSON.stringify(updated)
                    );
                    Swal.fire("Deleted!", "Local document deleted.", "success");
                }

                setRefreshTrigger(prev => prev + 1);

            } catch (err) {
                Swal.fire("Error", "Failed to delete document", "error");
            }
        });
    };

    // Handle editing a document
    const handleEditDocument = (doc) => {
        setIsEditMode(true);
        setEditingDocId(doc.id);
        setEditingNotes(doc.notes || "");
        
        document.querySelector('.upload-atts-form-card').scrollIntoView({ behavior: 'smooth' });
    };

    // Handle saving edited document
    const handleSaveEdit = async () => {
        if (!editingDocId) return;

        try {
            const docToEdit = documents.find(d => d.id === editingDocId);
            if (!docToEdit) return;

            if (docToEdit.source === "api") {
                await axiosInstance.put(
                    `${API_ENDPOINTS.UPDATE_DOCUMENT_BY_ID}/${editingDocId.replace("api_", "")}`,
                    { notes: editingNotes }
                );
                Swal.fire("Updated!", "Document notes updated successfully.", "success");
            } 
            else if (docToEdit.source === "local") {
                const existing = JSON.parse(
                    localStorage.getItem("original_atts_uploads") || "[]"
                );

                const updated = existing.map(item => {
                    if (item.createdAt === docToEdit.createdAt && 
                        item.fileName === docToEdit.fileName) {
                        return { ...item, notes: editingNotes };
                    }
                    return item;
                });

                localStorage.setItem(
                    "original_atts_uploads",
                    JSON.stringify(updated)
                );
                Swal.fire("Updated!", "Local document notes updated.", "success");
            }

            handleCancelEdit();
            setRefreshTrigger(prev => prev + 1);

        } catch (err) {
            Swal.fire("Error", "Failed to update document", "error");
        }
    };

    // Handle canceling edit mode
    const handleCancelEdit = () => {
        setIsEditMode(false);
        setEditingDocId(null);
        setEditingNotes("");
    };

    // Fetch documents from both API and localStorage
    const fetchDocuments = useCallback(async () => {
        if (!bookingId) {
            setDocuments([]);
            return;
        }

        setLoadingDocuments(true);
        setDocumentsError(null);

        try {
            let apiDocs = [];
            try {
                const response = await axiosInstance.get(
                    `${API_ENDPOINTS.GET_DOCUMENTS_BY_BOOKING_ID}?bookingId=${bookingId}`
                );
                
                if (Array.isArray(response.data)) {
                    apiDocs = response.data;
                } else if (response.data && typeof response.data === 'object') {
                    apiDocs = response.data.value || response.data.data || response.data.documents || response.data.items || [];
                }
                
                apiDocs = apiDocs.filter(doc => {
                    const fileName = (doc.fileName || doc.documentName || '').toLowerCase();
                    const docType = (doc.documentType || doc.fileType || '').toLowerCase();
                    const notes = (doc.notes || doc.description || '').toLowerCase();
                    
                    return fileName.includes('att') || 
                        fileName.includes('original') ||
                        docType.includes('att') || 
                        docType.includes('original') ||
                        notes.includes('att') ||
                        notes.includes('original');
                });
            } catch (apiError) {
                // Use localStorage as fallback
            }

            let localDocs = [];
            try {
                const localData = JSON.parse(localStorage.getItem("original_atts_uploads") || "[]");
                localDocs = localData
                    .filter(item => String(item.bookingId) === String(bookingId))
                    .map(item => ({
                        ...item,
                        source: 'local',
                        id: `local_${item.createdAt}_${Math.random().toString(36).substr(2, 9)}`
                    }));
            } catch (localError) {}

            const allDocuments = [...apiDocs, ...localDocs];
            const uniqueDocsMap = new Map();
            
            allDocuments.forEach(doc => {
                const key = `${doc.fileName}_${doc.fileSize}_${doc.createdAt}`;
                if (!uniqueDocsMap.has(key) || doc.source === 'api') {
                    uniqueDocsMap.set(key, {
                        ...doc,
                        source: doc.source || 'unknown',
                        id: doc.id || `doc_${Math.random().toString(36).substr(2, 9)}`
                    });
                }
            });
            
            const uniqueDocs = Array.from(uniqueDocsMap.values());
            uniqueDocs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            setDocuments(uniqueDocs);
            
        } catch (error) {
            setDocumentsError("Failed to load documents. Please try again.");
            setDocuments([]);
        } finally {
            setLoadingDocuments(false);
        }
    }, [bookingId]);

    // Single useEffect to fetch all data
    useEffect(() => {
        const fetchAllData = async () => {
            if (!bookingId) {
                setLoadingBooking(false);
                setDocuments([]);
                return;
            }

            // Fetch booking details
            try {
                const response = await axiosInstance.get(API_ENDPOINTS.BOOKING_LIST);
                const bookingsList = Array.isArray(response.data) ? response.data : (response.data?.value || []);
                const bookingData = bookingsList.find(b => b.id === Number(bookingId));

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
                // Handle error silently
            } finally {
                setLoadingBooking(false);
            }

            // Fetch documents
            setLoadingDocuments(true);
            setDocumentsError(null);

            try {
                let apiDocs = [];
                try {
                    const response = await axiosInstance.get(
                        `${API_ENDPOINTS.GET_DOCUMENTS_BY_BOOKING_ID}?bookingId=${bookingId}`
                    );
                    
                    if (Array.isArray(response.data)) {
                        apiDocs = response.data;
                    } else if (response.data && typeof response.data === 'object') {
                        apiDocs = response.data.value || response.data.data || response.data.documents || response.data.items || [];
                    }
                    
                    apiDocs = apiDocs.filter(doc => {
                        const fileName = (doc.fileName || doc.documentName || '').toLowerCase();
                        const docType = (doc.documentType || doc.fileType || '').toLowerCase();
                        const notes = (doc.notes || doc.description || '').toLowerCase();
                        
                        return fileName.includes('att') || 
                            fileName.includes('original') ||
                            docType.includes('att') || 
                            docType.includes('original') ||
                            notes.includes('att') ||
                            notes.includes('original');
                    });
                } catch (apiError) {}

                let localDocs = [];
                try {
                    const localData = JSON.parse(localStorage.getItem("original_atts_uploads") || "[]");
                    localDocs = localData
                        .filter(item => String(item.bookingId) === String(bookingId))
                        .map(item => ({
                            ...item,
                            source: 'local',
                            id: `local_${item.createdAt}_${Math.random().toString(36).substr(2, 9)}`
                        }));
                } catch (localError) {}

                const allDocuments = [...apiDocs, ...localDocs];
                const uniqueDocsMap = new Map();
                
                allDocuments.forEach(doc => {
                    const key = `${doc.fileName}_${doc.fileSize}_${doc.createdAt}`;
                    if (!uniqueDocsMap.has(key) || doc.source === 'api') {
                        uniqueDocsMap.set(key, {
                            ...doc,
                            source: doc.source || 'unknown',
                            id: doc.id || `doc_${Math.random().toString(36).substr(2, 9)}`
                        });
                    }
                });
                
                const uniqueDocs = Array.from(uniqueDocsMap.values());
                uniqueDocs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                
                setDocuments(uniqueDocs);
                
            } catch (error) {
                setDocumentsError("Failed to load documents. Please try again.");
                setDocuments([]);
            } finally {
                setLoadingDocuments(false);
            }
        };

        fetchAllData();
    }, [bookingId, refreshTrigger]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!bookingId) {
            Swal.fire({
                icon: "warning",
                title: "Missing Booking ID",
                text: "Please select a booking first from the booking list.",
            });
            return;
        }

        if (!file) {
            Swal.fire({
                icon: "warning",
                title: "No File Selected",
                text: "Please select a file to upload.",
            });
            return;
        }

        if (!notes?.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Missing Notes",
                text: "Please add notes about this upload.",
            });
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('BookingId', parseInt(bookingId, 10));
            formData.append('File', file);
            formData.append('Notes', notes.trim());

            const response = await axiosInstance.post(
                API_ENDPOINTS.UPLOAD_ORIGINAL_ATT_REQUEST,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            const isSuccess = response.data === true || response.data?.success === true || response.status === 200;

            if (isSuccess) {
                const existingATTs = JSON.parse(localStorage.getItem("original_atts_uploads") || "[]");
                const fileDataURL = await readFileAsDataURL(file);
                const newRecord = {
                    bookingId: parseInt(bookingId),
                    fileName: file.name,
                    fileSize: file.size,
                    fileType: getFileType(file.name),
                    fileDataURL,
                    fileMimeType: file.type || '',
                    notes,
                    createdAt: new Date().toISOString(),
                    source: 'local',
                    syncedWithAPI: true
                };

                existingATTs.push(newRecord);
                localStorage.setItem("original_atts_uploads", JSON.stringify(existingATTs));

                Swal.fire({
                    icon: "success",
                    title: "Original ATT Uploaded Successfully",
                    html: `
                        <p>Your original ATT document has been uploaded successfully!</p>
                        <hr style="margin: 15px 0;">
                        <div style="text-align: left; padding: 0 20px;">
                            <p><strong>File:</strong> ${file.name}</p>
                            <p><strong>Type:</strong> ${getFileType(file.name)}</p>
                            <p><strong>Size:</strong> ${(file.size / 1024).toFixed(2)} KB</p>
                            <p><strong>Notes:</strong> ${notes}</p>
                        </div>
                    `,
                    timer: 3000,
                    showConfirmButton: true,
                    confirmButtonText: "OK"
                });

                setFile(null);
                setNotes("");
                const fileInput = document.querySelector('input[type="file"]');
                if (fileInput) fileInput.value = '';
                setRefreshTrigger(prev => prev + 1);

            } else {
                Swal.fire({
                    icon: "warning",
                    title: "Unexpected Response",
                    html: `
                        <p>API returned: <code>${JSON.stringify(response.data)}</code></p>
                        <p>The file may not have been uploaded. Please verify.</p>
                    `,
                });
            }

        } catch (error) {
            const status = error.response?.status;
            const errorData = error.response?.data;
            let msg = "Something went wrong";
            let detailMsg = "";

            if (status === 400) {
                msg = "Invalid request data";
                detailMsg = errorData?.message || errorData?.title || JSON.stringify(errorData);
            } else if (status === 404) {
                msg = `Booking ID ${bookingId} not found`;
                detailMsg = "The booking does not exist in the database. Please check the booking ID.";
            } else if (status === 500) {
                msg = "Internal Server Error";
                detailMsg = errorData?.message || errorData?.title || "Please contact support or try again later.";
            } else if (!error.response) {
                msg = "Network Error - Cannot connect to server";
                detailMsg = "Check CORS settings or server availability";
            }

            Swal.fire({
                icon: "error",
                title: `Upload Failed (${status || "Network Error"})`,
                html: `
                    <p><strong>${msg}</strong></p>
                    <p>${detailMsg}</p>
                    ${errorData ? `<pre style="text-align: left; max-height: 200px; overflow: auto;">${JSON.stringify(errorData, null, 2)}</pre>` : ''}
                    <hr>
                    <p style="font-size: 12px; color: #666;">Check browser console for full details</p>
                `,
                width: 600,
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <BookingWrapper className="upload-atts-container">
            <div className="upload-atts-header">
                <div className="upload-atts-header-content">
                    <div className="upload-atts-header-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                    </div>
                    <div>
                        <h2>Upload Original ATTs</h2>
                        <p className="upload-atts-subtitle">Manage and track original ATT document uploads</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <PropertyNavigation hideHealthButton />
                </div>
            </div>

            {/* Booking Information */}
            {!loadingBooking && booking ? (
                <div className="card booking-info-card">
                    <div className="booking-info-two-column">
                        <div className="info-row">
                            <span className="info-label">Township:</span>
                            <span className="info-value">{booking?.township || 'N/A'}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Plot:</span>
                            <span className="info-value">{booking?.plotNumber || 'N/A'}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Size:</span>
                            <span className="info-value">{booking?.plotSize || 'N/A'}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Client:</span>
                            <span className="info-value">{booking?.clientName || 'N/A'}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Mobile:</span>
                            <span className="info-value">{booking?.clientMobile || 'N/A'}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Booking Date:</span>
                            <span className="info-value">
                                {booking?.bookingDate ? formatDisplayDate(booking.bookingDate) : 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="card booking-info-card">
                    <div style={{ padding: '15px', textAlign: 'center' }}>
                        <p>{bookingId ? 'Loading booking information...' : 'No booking selected'}</p>
                    </div>
                </div>
            )}

            <div className="card upload-atts-form-card">
                <div className="upload-atts-form-header">
                    <h3>{isEditMode ? 'Edit Document Notes' : 'Upload Original ATT Document'}</h3>
                    <div className={`upload-atts-form-badge ${isEditMode ? 'edit-mode' : ''}`}>
                        {isEditMode ? `Editing Document` : 'ATT Documents'}
                    </div>
                </div>

                {isEditMode ? (
                    <div className="upload-atts-form-section">
                        <div className="upload-atts-field">
                            <label htmlFor="editNotes">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                                Edit Notes *
                            </label>
                            <textarea
                                id="editNotes"
                                value={editingNotes}
                                onChange={(e) => setEditingNotes(e.target.value)}
                                placeholder="Update notes for this document..."
                                rows="4"
                                required
                                minLength="1"
                            />
                        </div>
                        
                        <div className="upload-atts-actions">
                            <ReminderButton 
                              size="small" 
                              variant="outline" 
                              onClick={() => setShowReminderPopup(true)}
                            />
                            <button type="button" className="small-btn secondary" onClick={handleCancelEdit}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                                Cancel Edit
                            </button>
                            <button type="button" className="small-btn primary" onClick={handleSaveEdit}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                Save Changes
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                    <div className="upload-atts-form-section">
                        <div className="upload-atts-field">
                            <label htmlFor="file">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="17 8 12 3 7 8"></polyline>
                                    <line x1="12" y1="3" x2="12" y2="15"></line>
                                </svg>
                                Upload File *
                            </label>
                            <input
                                type="file"
                                id="file"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt,.gif,.bmp,.tiff,.tif"
                                required
                            />
                            {file && (
                                <div style={{
                                    marginTop: '8px',
                                    padding: '8px 12px',
                                    background: 'rgba(33, 162, 167, 0.05)',
                                    border: '1px solid rgba(33, 162, 167, 0.1)',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    color: '#666'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {getFileTypeIcon(file.name)}
                                        <span>
                                            <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
                                        </span>
                                    </div>
                                    <div style={{ marginTop: '4px', fontSize: '12px', color: '#999' }}>
                                        File Type: {getFileType(file.name)}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="upload-atts-field">
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
                                placeholder="Enter notes about this original ATT document..."
                                rows="4"
                                required
                                minLength="1"
                            />
                        </div>
                    </div>

                    <div className="upload-atts-actions">
                        <ReminderButton 
                          size="small" 
                          variant="outline" 
                          onClick={() => setShowReminderPopup(true)}
                        />
                        <button type="button" className="small-btn secondary" onClick={() => navigate(-1)} disabled={uploading}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                            Cancel
                        </button>
                        <button type="submit" className="small-btn primary" disabled={uploading}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                            {uploading ? "Uploading..." : "Upload Original ATT"}
                        </button>
                    </div>
                </form>
                )}
            </div>

            <div className="card upload-atts-table-card">
                <div className="upload-atts-table-header">
                    <h3 className="upload-atts-table-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                        Upload History
                    </h3>
                    <div className="upload-atts-table-badge">
                        {documents.length} Records
                        {loadingDocuments && <span style={{ marginLeft: '8px', fontSize: '12px' }}>(Loading...)</span>}
                        {documentsError && <span style={{ marginLeft: '8px', fontSize: '12px', color: '#ef4444' }}>(Error loading data)</span>}
                    </div>
                    <button
                        type="button"
                        className="small-btn secondary"
                        onClick={() => setRefreshTrigger(prev => prev + 1)}
                        disabled={loadingDocuments}
                        style={{ marginLeft: '8px' }}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}>
                            <polyline points="23 4 23 10 17 10"></polyline>
                            <polyline points="1 20 1 14 7 14"></polyline>
                            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
                        </svg>
                        {loadingDocuments ? 'Loading...' : 'Refresh'}
                    </button>
                </div>
                <div className="upload-atts-table-wrapper">
                    {loadingDocuments ? (
                        <div className="loading-state" style={{ padding: '40px', textAlign: 'center' }}>
                            <p>Loading uploaded documents...</p>
                        </div>
                    ) : documentsError ? (
                        <div className="error-state" style={{ padding: '40px', textAlign: 'center' }}>
                            <p style={{ color: '#ef4444', marginBottom: '15px' }}>{documentsError}</p>
                            <button 
                                onClick={() => setRefreshTrigger(prev => prev + 1)} 
                                className="small-btn primary"
                            >
                                Retry
                            </button>
                        </div>
                    ) : (
                        <table className="upload-atts-table">
                            <thead>
                                <tr>
                                    <th className="left">File Name</th>
                                    <th className="center">File Type</th>
                                    <th className="center">File Size</th>
                                    <th className="left">Notes</th>
                                    <th className="left">Uploaded At</th>
                                    <th className="center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {documents.slice(0, 10).map((doc, idx) => (
                                    <tr key={doc.id || idx}>
                                        <td className="text">
                                            {getFileTypeIcon(doc.fileName)}
                                            <span style={{ marginLeft: '8px' }}>
                                                {doc.fileName || <span className="empty-value">-</span>}
                                            </span>
                                        </td>
                                        <td className="center">
                                            {doc.fileType ? (
                                                <span
                                                    className="upload-atts-file-type-badge"
                                                    data-type={doc.fileType}
                                                >
                                                    {doc.fileType}
                                                </span>
                                            ) : (
                                                <span className="empty-value">-</span>
                                            )}
                                        </td>
                                        <td className="center">
                                            {doc.fileSize ? (
                                                <span className="upload-atts-status-indicator uploaded">
                                                    {(doc.fileSize / 1024).toFixed(2)} KB
                                                </span>
                                            ) : (
                                                <span className="empty-value">-</span>
                                            )}
                                        </td>
                                        <td className="text">
                                            <span title={doc.notes || 'No notes provided'}>
                                                {doc.notes && doc.notes.trim() && doc.notes !== 'No notes provided' ? (
                                                    doc.notes.length > 30 ?
                                                        doc.notes.substring(0, 30) + '...' :
                                                        doc.notes
                                                ) : (
                                                    <span className="empty-value">No notes</span>
                                                )}
                                            </span>
                                        </td>
                                        <td className="date">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px', marginRight: '6px' }}>
                                                <circle cx="12" cy="12" r="10"></circle>
                                                <polyline points="12 6 12 12 16 14"></polyline>
                                            </svg>
                                            <span>
                                                {doc.createdAt ? new Date(doc.createdAt).toLocaleString() : 'Unknown date'}
                                            </span>
                                        </td>
                                        <td className="center">
                                            <button
                                                className="upload-atts-view-btn"
                                                onClick={() => handleViewFile(doc)}
                                                title="View file details"
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                    <circle cx="12" cy="12" r="3"></circle>
                                                </svg>
                                                View
                                            </button>
                                            <button
                                                className="upload-atts-edit-btn"
                                                onClick={() => handleEditDocument(doc)}
                                                title="Edit document notes"
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                </svg>
                                                Edit
                                            </button>
                                            <button
                                                className="upload-atts-delete-btn"
                                                onClick={() => handleDeleteFile(doc)}
                                                title="Delete file"
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                </svg>
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {documents.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="no-data">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10"></circle>
                                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                            </svg>
                                            <p>No upload records found</p>
                                            <span>Start by uploading your first original ATT document</span>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <ReminderPopup 
              isOpen={showReminderPopup}
              onClose={() => setShowReminderPopup(false)}
              title="Create Reminder"
              bookingId={bookingId}
            />
        </BookingWrapper>
    );
}