import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BookingWrapper from "./style";
import Slider from "../../components/Slider";
import { UploadLoanDocumentsContent } from "../../components/Slider/SliderContent";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from "../../utilities/apiConfig";
import Swal from "sweetalert2";
import "./Without7DayClosed.css";

export default function Without7DayClosed() {
    const navigate = useNavigate();
    const { id } = useParams();
    
    const [paymentReceived, setPaymentReceived] = useState(false);
    const [paymentDate, setPaymentDate] = useState("");
    const [atsDraftCreated, setAtsDraftCreated] = useState(false);
    const [atsDraftDate, setAtsDraftDate] = useState("");
    const [atsChecked, setAtsChecked] = useState(false);
    const [agreementOriginalPrinted, setAgreementOriginalPrinted] = useState(false);
    const [jdaFileSigned, setJdaFileSigned] = useState(false);
    const [pattaAppliedInJda, setPattaAppliedInJda] = useState(false);
    const [pattaApplicationDate, setPattaApplicationDate] = useState("");
    const [pattaReceivedFromJda, setPattaReceivedFromJda] = useState(false);
    const [pattaRegistered, setPattaRegistered] = useState(false);
    const [pattaRegisteredCopy, setPattaRegisteredCopy] = useState(null);
    const [agreementOriginalCopy, setAgreementOriginalCopy] = useState(null);
    const [note, setNote] = useState("");

    // Upload Loan Document slider states - WITHOUT_7DAY_CLOSED specific
    const [showWithout7DayUploadSlider, setShowWithout7DayUploadSlider] = useState(false);
    const [without7DayDocumentTypeId, setWithout7DayDocumentTypeId] = useState("");
    const [without7DayFile, setWithout7DayFile] = useState(null);
    const [without7DayDocumentNotes, setWithout7DayDocumentNotes] = useState("document");
    const [without7DayDocuments, setWithout7DayDocuments] = useState([]);
    const [without7DayLoadingDocuments, setWithout7DayLoadingDocuments] = useState(false);
    const [without7DayLoadingDocumentTypes, setWithout7DayLoadingDocumentTypes] = useState(false);
    const [without7DayDocumentTypes, setWithout7DayDocumentTypes] = useState([]);
    const [without7DayUploading, setWithout7DayUploading] = useState(false);
    const [without7DayBooking, setWithout7DayBooking] = useState(null);
    const [without7DayLoadingBooking, setWithout7DayLoadingBooking] = useState(true);

    // Cleanup effect to ensure state isolation
    useEffect(() => {
        // Reset all slider-related state when component mounts
        setShowWithout7DayUploadSlider(false);
        setWithout7DayDocumentTypeId("");
        setWithout7DayFile(null);
        setWithout7DayDocumentNotes("document");
        
        return () => {
            // Cleanup when component unmounts
            setShowWithout7DayUploadSlider(false);
            setWithout7DayDocumentTypeId("");
            setWithout7DayFile(null);
            setWithout7DayDocumentNotes("document");
        };
    }, []);

    // Check if booking ID exists, if not redirect to booking list
    useEffect(() => {
        if (!id) {
            Swal.fire({
                icon: "warning",
                title: "No Booking Selected",
                text: "Please select a booking first.",
                confirmButtonText: "Go to Booking List"
            }).then(() => {
                navigate("/property");
            });
        }
    }, [id, navigate]);

    // Fetch booking details
    useEffect(() => {
        const fetchBookingDetails = async () => {
            if (!id) return;
            
            try {
                
                if (bookingData) {
                    setWithout7DayBooking({
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
            } finally {
                setWithout7DayLoadingBooking(false);
            }
        };

        fetchBookingDetails();
    }, [id]);

    // Fetch document types from API
    useEffect(() => {
        const fetchDocumentTypes = async () => {
            setWithout7DayLoadingDocumentTypes(true);
            try {
                const response = await axiosInstance.get(API_ENDPOINTS.DOCUMENT_TYPES);
                
                setWithout7DayDocumentTypes(response.data || []);
            } catch (error) {
                setWithout7DayDocumentTypes([]);
            } finally {
                setWithout7DayLoadingDocumentTypes(false);
            }
        };

        fetchDocumentTypes();
    }, []);

    // Fetch documents for this booking
    useEffect(() => {
        if (!id) return;

        const fetchDocuments = async () => {
            setWithout7DayLoadingDocuments(true);
            try {
                const response = await axiosInstance.get(
                    `${API_ENDPOINTS.GET_DOCUMENTS_BY_BOOKING_ID}?bookingId=${id}`
                );
                
                const docs = Array.isArray(response.data) ? response.data : [];
                setWithout7DayDocuments(docs);
            } catch (error) {
                setWithout7DayDocuments([]);
            } finally {
                setWithout7DayLoadingDocuments(false);
            }
        };

        fetchDocuments();
    }, [id]);

    const handleFileUpload = (e, setter) => {
        const file = e.target.files[0];
        if (file) {
            setter(file.name);
        }
    };

    // Handle loan document upload
    const handleLoanDocumentUpload = async (e) => {
        e.preventDefault();
        
        // Validate required fields
        if (!without7DayDocumentTypeId || !without7DayFile || !without7DayDocumentNotes?.trim()) {
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

        setWithout7DayUploading(true);
        try {
            const formData = new FormData();
            formData.append('BookingId', bookingId);
            formData.append('DocumentTypeId', parseInt(without7DayDocumentTypeId, 10));
            formData.append('File', without7DayFile);
            formData.append('Notes', without7DayDocumentNotes?.trim() || 'document');
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
                text: "Your loan document has been uploaded",
                timer: 1800,
                showConfirmButton: false,
            });

            // Clear form
            setWithout7DayDocumentTypeId("");
            setWithout7DayFile(null);
            setWithout7DayDocumentNotes("document");
            
            // Reset file input
            const fileInput = document.querySelector('#without7day-loan-document-file');
            if (fileInput) fileInput.value = '';

            // Refresh documents list
            const docsResponse = await axiosInstance.get(
                `${API_ENDPOINTS.GET_DOCUMENTS_BY_BOOKING_ID}?bookingId=${id}`
            );
            setWithout7DayDocuments(Array.isArray(docsResponse.data) ? docsResponse.data : []);

            // Close slider
            setShowWithout7DayUploadSlider(false);

        } catch (err) {
           const status = err.response?.status;
            let msg = "Failed to upload document";
            
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
                title: `Upload Failed (${status || "Network Error"})`,
                text: msg,
            });
        } finally {
            setWithout7DayUploading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const validationIssues = [];

        if (paymentReceived && !paymentDate) {
            validationIssues.push("Payment Received Date is required when Payment Received is checked.");
        }

        if (atsDraftCreated && !atsDraftDate) {
            validationIssues.push("ATS Draft Date is required when ATS Draft Created is checked.");
        }

        if (pattaAppliedInJda && !pattaApplicationDate) {
            validationIssues.push("Patta Application Date is required when Patta Applied in JDA is checked.");
        }

        if (pattaRegistered && !pattaRegisteredCopy) {
            validationIssues.push("Upload Patta Registered Copy is required when Patta Registered is checked.");
        }

        const anyUpdate =
            paymentReceived ||
            atsDraftCreated ||
            atsChecked ||
            agreementOriginalPrinted ||
            jdaFileSigned ||
            pattaAppliedInJda ||
            pattaReceivedFromJda ||
            pattaRegistered ||
            Boolean(note?.trim()) ||
            Boolean(pattaRegisteredCopy) ||
            Boolean(agreementOriginalCopy);

        if (!anyUpdate) {
            validationIssues.push("Please add at least one update before saving.");
        }

        if (validationIssues.length) {
            Swal.fire({
                icon: "error",
                title: "Please fix these fields",
                html: `
                    <ul style="text-align:left; padding-left: 18px; margin: 0;">
                        ${validationIssues.map((m) => `<li>${m}</li>`).join("")}
                    </ul>
                `,
            });
            return;
        }
        
        const without7DayData = {
            paymentReceived, paymentDate, atsDraftCreated, atsDraftDate, atsChecked,
            agreementOriginalPrinted, jdaFileSigned, pattaAppliedInJda, pattaApplicationDate,
            pattaReceivedFromJda, pattaRegistered, pattaRegisteredCopy, agreementOriginalCopy, note,
            createdAt: new Date().toISOString()
        };
        
        const existing = JSON.parse(localStorage.getItem("without_7day_updates") || "[]");
        existing.push(without7DayData);
        localStorage.setItem("without_7day_updates", JSON.stringify(existing));
        
        alert("Without 7 Day Closed data saved successfully!");
        navigate("/property");
    };

    const CheckboxItem = ({ id, checked, onChange, label }) => (
        <div 
            className={`without-7day-checkbox-container ${checked ? 'checked' : ''}`}
            onClick={() => onChange(!checked)}
        >
            <input
                type="checkbox"
                id={id}
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="without-7day-checkbox"
                onClick={(e) => e.stopPropagation()}
            />
            <label htmlFor={id} className="without-7day-checkbox-label">{label}</label>
            {checked && (
                <svg className="without-7day-checkmark" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            )}
        </div>
    );

    // If no booking ID, component will redirect via useEffect
    if (!id) {
        return null;
    }

    return (
        <BookingWrapper className="without-7day-container">
            <div className="without-7day-header">
                <h2>Without 7 Day Closed</h2>
                <div className="header-actions">
                    <button 
                        className="small-btn primary" 
                        onClick={() => setShowWithout7DayUploadSlider(true)}
                        style={{ marginRight: '10px' }}
                    >
                        📄 Upload Loan Document
                    </button>
                    <button className="small-btn" onClick={() => navigate(-1)}>Back</button>
                </div>
            </div>

            <div className="card without-7day-form-card">
                <form onSubmit={handleSubmit}>
                    <div className="without-7day-form-grid">
                        
                        <div className="without-7day-section-header">
                            <h3 className="without-7day-section-title">💰 Payment & ATS Process</h3>
                        </div>

                        <CheckboxItem id="paymentReceived" checked={paymentReceived} onChange={setPaymentReceived} label="Payment Received" />

                        {paymentReceived && (
                            <div>
                                <label htmlFor="paymentDate" className="without-7day-field-label">Payment Received Date</label>
                                <input type="date" id="paymentDate" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="without-7day-input" />
                            </div>
                        )}

                        <CheckboxItem id="atsDraftCreated" checked={atsDraftCreated} onChange={setAtsDraftCreated} label="ATS Draft Created (after payment)" />

                        {atsDraftCreated && (
                            <div>
                                <label htmlFor="atsDraftDate" className="without-7day-field-label">ATS Draft Date</label>
                                <input type="date" id="atsDraftDate" value={atsDraftDate} onChange={(e) => setAtsDraftDate(e.target.value)} className="without-7day-input" />
                            </div>
                        )}

                        <CheckboxItem id="atsChecked" checked={atsChecked} onChange={setAtsChecked} label="ATS Checked & Verified" />

                        <div className="without-7day-section-header">
                            <h3 className="without-7day-section-title">📝 Agreement Process</h3>
                        </div>

                        <CheckboxItem id="agreementOriginalPrinted" checked={agreementOriginalPrinted} onChange={setAgreementOriginalPrinted} label="Agreement Original Printed" />

                        <div className="without-7day-section-header">
                            <h3 className="without-7day-section-title">🏛️ JDA Process</h3>
                        </div>

                        <CheckboxItem id="jdaFileSigned" checked={jdaFileSigned} onChange={setJdaFileSigned} label="JDA File Signed by Customer" />
                        <CheckboxItem id="pattaAppliedInJda" checked={pattaAppliedInJda} onChange={setPattaAppliedInJda} label="Patta Applied in JDA" />

                        {pattaAppliedInJda && (
                            <div>
                                <label htmlFor="pattaApplicationDate" className="without-7day-field-label">Patta Application Date</label>
                                <input type="date" id="pattaApplicationDate" value={pattaApplicationDate} onChange={(e) => setPattaApplicationDate(e.target.value)} className="without-7day-input" />
                            </div>
                        )}

                        <CheckboxItem id="pattaReceivedFromJda" checked={pattaReceivedFromJda} onChange={setPattaReceivedFromJda} label="Patta Received from JDA" />
                        <CheckboxItem id="pattaRegistered" checked={pattaRegistered} onChange={setPattaRegistered} label="Patta Registered" />

                        <div className="without-7day-section-header">
                            <h3 className="without-7day-section-title">📤 Upload Documents Online</h3>
                        </div>

                        <div>
                            <label htmlFor="pattaRegisteredCopy" className="without-7day-field-label">Upload Patta Registered Copy</label>
                            <input type="file" id="pattaRegisteredCopy" onChange={(e) => handleFileUpload(e, setPattaRegisteredCopy)} className="without-7day-file-input" accept=".pdf,.jpg,.jpeg,.png" />
                            {pattaRegisteredCopy && <div className="without-7day-file-selected">✓ File selected: {pattaRegisteredCopy}</div>}
                        </div>

                        <div>
                            <label htmlFor="agreementOriginalCopy" className="without-7day-field-label">Upload Agreement Original Copy</label>
                            <input type="file" id="agreementOriginalCopy" onChange={(e) => handleFileUpload(e, setAgreementOriginalCopy)} className="without-7day-file-input" accept=".pdf,.jpg,.jpeg,.png" />
                            {agreementOriginalCopy && <div className="without-7day-file-selected">✓ File selected: {agreementOriginalCopy}</div>}
                        </div>

                        <div>
                            <label htmlFor="note" className="without-7day-field-label">Note</label>
                            <textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Enter any notes..." className="without-7day-textarea" />
                        </div>
                    </div>

                    <div className="without-7day-actions">
                        <button type="button" className="small-btn" onClick={() => navigate(-1)}>Cancel</button>
                        <button type="submit" className="small-btn primary">Save</button>
                    </div>
                </form>
            </div>

            <div className="card without-7day-table-card">
                <h3 className="without-7day-table-title">Recent Without 7 Day Closed Updates</h3>
                <div className="without-7day-table-wrapper">
                    <table className="without-7day-table">
                        <thead>
                            <tr>
                                <th className="center">Payment</th>
                                <th className="center">ATS Draft</th>
                                <th className="center">ATS Checked</th>
                                <th className="center">Agreement</th>
                                <th className="center">JDA Signed</th>
                                <th className="center">Patta Applied</th>
                                <th className="center">Patta Received</th>
                                <th className="center">Registered</th>
                                <th className="left">Uploads</th>
                                <th className="left">Updated At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {JSON.parse(localStorage.getItem("without_7day_updates") || "[]").slice(-5).reverse().map((item, idx) => (
                                <tr key={idx}>
                                    <td className="center">
                                        {item.paymentReceived ? "✅" : "❌"}
                                        {item.paymentDate && <div className="date-small">{item.paymentDate}</div>}
                                    </td>
                                    <td className="center">
                                        {item.atsDraftCreated ? "✅" : "❌"}
                                        {item.atsDraftDate && <div className="date-small">{item.atsDraftDate}</div>}
                                    </td>
                                    <td className="center">{item.atsChecked ? "✅" : "❌"}</td>
                                    <td className="center">{item.agreementOriginalPrinted ? "✅" : "❌"}</td>
                                    <td className="center">{item.jdaFileSigned ? "✅" : "❌"}</td>
                                    <td className="center">
                                        {item.pattaAppliedInJda ? "✅" : "❌"}
                                        {item.pattaApplicationDate && <div className="date-small">{item.pattaApplicationDate}</div>}
                                    </td>
                                    <td className="center">{item.pattaReceivedFromJda ? "✅" : "❌"}</td>
                                    <td className="center">{item.pattaRegistered ? "✅" : "❌"}</td>
                                    <td className="text">
                                        {item.pattaRegisteredCopy && <div>📄 Patta</div>}
                                        {item.agreementOriginalCopy && <div>📄 Agreement</div>}
                                        {!item.pattaRegisteredCopy && !item.agreementOriginalCopy && "-"}
                                    </td>
                                    <td className="date">{new Date(item.createdAt).toLocaleString()}</td>
                                </tr>
                            ))}
                            {JSON.parse(localStorage.getItem("without_7day_updates") || "[]").length === 0 && (
                                <tr>
                                    <td colSpan={10} className="no-data">No without 7 day closed updates yet</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Upload Loan Document Slider */}
            {showWithout7DayUploadSlider && (
                <Slider 
                    key="without7day-upload-slider"
                    title="Upload Loan Documents (Without 7 Day Closed)" 
                    onClose={() => setShowWithout7DayUploadSlider(false)}
                >
                    <div className="upload-loan-slider-content">
                        {/* Booking Information */}
                        {!without7DayLoadingBooking && without7DayBooking ? (
                            <div className="booking-info-section">
                                <h4>Booking Information</h4>
                                <div className="booking-info-grid">
                                    <div className="info-item">
                                        <span className="info-label">Township:</span>
                                        <span className="info-value">{without7DayBooking?.township || 'N/A'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Plot:</span>
                                        <span className="info-value">{without7DayBooking?.plotNumber || 'N/A'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Client:</span>
                                        <span className="info-value">{without7DayBooking?.clientName || 'N/A'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Mobile:</span>
                                        <span className="info-value">{without7DayBooking?.clientMobile || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="loading-section">
                                <p>Loading booking information...</p>
                            </div>
                        )}

                        {/* Upload Form */}
                        <div className="upload-form-section">
                            <h4>Upload Document</h4>
                            <form onSubmit={handleLoanDocumentUpload} id="without7day-upload-form">
                                <div className="form-grid">
                                    <div className="form-field">
                                        <label htmlFor="without7day-loan-document-type">Document Type *</label>
                                        <select
                                            id="without7day-loan-document-type"
                                            value={without7DayDocumentTypeId}
                                            onChange={(e) => setWithout7DayDocumentTypeId(e.target.value)}
                                            disabled={without7DayLoadingDocumentTypes}
                                            required
                                        >
                                            <option value="">
                                                {without7DayLoadingDocumentTypes ? "Loading..." : "-- Select Document Type --"}
                                            </option>
                                            {without7DayDocumentTypes.map((type) => (
                                                <option key={type.id} value={type.id}>
                                                    {type.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-field">
                                        <label htmlFor="without7day-loan-document-file">Upload File *</label>
                                        <input
                                            id="without7day-loan-document-file"
                                            type="file"
                                            onChange={(e) => setWithout7DayFile(e.target.files?.[0] || null)}
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            required
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label htmlFor="without7day-loan-document-notes">Notes *</label>
                                        <textarea
                                            id="without7day-loan-document-notes"
                                            value={without7DayDocumentNotes}
                                            onChange={(e) => setWithout7DayDocumentNotes(e.target.value)}
                                            placeholder="Enter notes about this document..."
                                            required
                                            minLength="1"
                                            rows="3"
                                        />
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button 
                                        type="button" 
                                        className="small-btn secondary" 
                                        onClick={() => setShowWithout7DayUploadSlider(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="small-btn primary" 
                                        disabled={without7DayUploading}
                                    >
                                        {without7DayUploading ? "Uploading..." : "Upload Document"}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Documents List */}
                        <div className="documents-list-section">
                            <h4>Uploaded Documents ({without7DayDocuments.length})</h4>
                            {without7DayLoadingDocuments ? (
                                <div className="loading-section">
                                    <p>Loading documents...</p>
                                </div>
                            ) : without7DayDocuments.length === 0 ? (
                                <div className="empty-section">
                                    <p>No documents uploaded yet</p>
                                </div>
                            ) : (
                                <div className="documents-list">
                                    {without7DayDocuments.map((doc) => (
                                        <div key={doc.documentId} className="document-item">
                                            <div className="document-info">
                                                <div className="document-type">{doc.documentTypeName}</div>
                                                <div className="document-date">
                                                    {doc.uploadedOn ? new Date(doc.uploadedOn).toLocaleDateString() : "N/A"}
                                                </div>
                                                <div className="document-notes">{doc.notes || "No notes"}</div>
                                            </div>
                                            {doc.url && (
                                                <a 
                                                    href={doc.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="document-link"
                                                >
                                                    View
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </Slider>
            )}
        </BookingWrapper>
    );
}
