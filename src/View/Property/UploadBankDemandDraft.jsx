import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BookingWrapper from "./style";
import ReminderButton from "../../components/ReminderButton";
import ReminderPopup from "../../components/ReminderPopup";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from "../../utilities/apiConfig";
import { API_BASE_URL } from "../../utilities/apiConfig";
import Swal from "sweetalert2";
import "./UploadBankDemandDraft.css";
import { set } from "date-fns";

export default function UploadBankDemandDraft() {
    const navigate = useNavigate();
    const { id } = useParams();

    // Form state
    const [bookingId, setBookingId] = useState(id || "");
    const [ddPhoto, setDdPhoto] = useState(null);
    const [ddPhotoName, setDdPhotoName] = useState("");
    const [ddPhotoPreview, setDdPhotoPreview] = useState("");
    const [ddNo, setDdNo] = useState("");
    const [ddAmount, setDdAmount] = useState("");
    const [ddNotes, setDdNotes] = useState("");

    // API state
    const [uploading, setUploading] = useState(false);
    const [uploadHistory, setUploadHistory] = useState([]);

    // Booking Details State
    const [booking, setBooking] = useState(null);
    const [loadingBooking, setLoadingBooking] = useState(true);

    // Reminder popup state
    const [showReminderPopup, setShowReminderPopup] = useState(false);
    const [isOriginalReceived, setIsOriginalReceived] = useState(false);
    const [ddReceivedDate, setDdReceivedDate] = useState("");
    // const [ddReceiveType, setDdReceiveType] = useState({
    // original: false,
    // photo: false
    // });

    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setDdPhoto(file);
            setDdPhotoName(file.name);

            const reader = new FileReader();
            reader.onloadend = () => {
                setDdPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };
    const setDDReceivedChecked = (checked) => {
    setDdReceivedFromBank(checked);

    if (!checked) {
        setDdReceivedDate("");
        setDdReceiveType({ original: false, photo: false });
    }
};

// const handleDDTypeChange = (type) => {
//     setDdReceiveType((prev) => ({
//         ...prev,
//         [type]: !prev[type]
//     }));
// };


    const handleRemovePhoto = () => {
        setDdPhoto(null);
        setDdPhotoName("");
        setDdPhotoPreview("");
        const fileInput = document.getElementById("ddPhoto");
        if (fileInput) fileInput.value = "";
    };

    const handleViewPhoto = (fileUrl) => {
        if (!fileUrl) {
            alert("File not found");
            return;
        }

        const fileType = getFileType(ddPhotoName);

        // Open file directly in new tab
        const newTab = window.open();

        if (!newTab) {
            alert("Popup blocked. Please allow popups for this site.");
            return;
        }

        if (fileType === "PDF") {
            newTab.document.write(`
            <html>
                <head>
                    <title>${ddPhotoName || "PDF Document"}</title>
                    <style>
                        body {
                            margin: 0;
                            background: #111;
                        }
                        iframe {
                            width: 100vw;
                            height: 100vh;
                            border: none;
                        }
                    </style>
                </head>
                <body>
                    <iframe src="${fileUrl}"></iframe>
                </body>
            </html>
        `);
        } else {
            newTab.document.write(`
            <html>
                <head>
                    <title>${ddPhotoName || "Image Preview"}</title>
                    <style>
                        body {
                            margin: 0;
                            background: #111;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                        }
                        img {
                            max-width: 100%;
                            max-height: 100%;
                            object-fit: contain;
                        }
                    </style>
                </head>
                <body>
                    <img src="${fileUrl}" />
                </body>
            </html>
        `);
        }

        newTab.document.close();
    };




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
            default:
                return extension ? extension.toUpperCase() : 'Unknown';
        }
    };


    useEffect(() => {
        const fetchAllData = async () => {
            if (!id) return;

            // Update booking ID
            if (id !== bookingId) {
                setBookingId(id);
            }

            try {
                // Fetch booking details
                setLoadingBooking(true);
                try {
                    const res = await axiosInstance.get(API_ENDPOINTS.BOOKING_LIST);
                    const list = Array.isArray(res.data) ? res.data : res.data?.value || [];
                    const data = list.find(b => b.id === Number(id));
                    if (data) {
                          
                        setBooking({
                            township: data.townshipName,
                            plotNumber: data.plotNo,
                            plotSize: data.plotSize,
                            clientName: data.clientName,
                            clientMobile: data.contactNo,
                            bookingDate: data.bookingDate,
                            bankDDPath:data.bankDDPath,
                            ddNo:data.ddNo,
                            ddAmount:data.ddAmount,
                            ddNotes:data.ddNotes,
                            isDDReceivedFromBank:data.isDDReceivedFromBank,
                            ddReceivedFromBankOn:data.ddReceivedFromBankOn
                        });
                        setIsOriginalReceived(data.isDDReceivedFromBank);
                        setDdReceivedDate(data.ddReceivedFromBankOn ? data.ddReceivedFromBankOn.split('T')[0] : "");    
                          setDdNo (data.ddNo);
                           setDdAmount (data.ddAmount);
                            setDdNotes (data.ddNotes);
                        if(data.bankDDPath)
                        { 
                           // setDdPhoto (data.bankDDPath);
                            setDdPhotoPreview(
                            `${API_BASE_URL}${data.bankDDPath.startsWith('/') ? '' : '/'}${data.bankDDPath}`
                            );
                        }
                    }
                } catch (err) {
                    // Handle error silently
                } finally {
                    setLoadingBooking(false);
                }

                // Fetch upload history from localStorage
                const existingDDs = JSON.parse(localStorage.getItem(`bank_demand_drafts_${id}`) || "[]");
                setUploadHistory(existingDDs);

            } catch (error) {
                // Handle any global errors
            }
        };

        fetchAllData();
    }, [id, bookingId]);

    const handleViewDD = (dd) => {
        if (!dd) return;

        const fileName = dd.ddPhotoName;
        const fileType = dd.fileType || getFileType(fileName);
        const dataURL = dd.fileDataURL || (dd.apiResponse && dd.apiResponse.url);

        if (dataURL) {
            if (fileType === 'PDF') {
                Swal.fire({
                    title: fileName || 'PDF',
                    html: `
                        <div style="display:flex; flex-direction:column; gap:12px;">
                            <iframe src="${dataURL}" style="width:100%; height:70vh; border:1px solid #ddd; border-radius:8px;"></iframe>
                            <a href="${dataURL}" download="${fileName || 'document.pdf'}" style="display:inline-flex; align-items:center; gap:8px; padding:8px 12px; border:1px solid #21a2a7; border-radius:6px; color:#21a2a7;">
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
                            <a href="${dataURL}" download="${fileName || 'image'}" style="display:inline-flex; align-items:center; gap:8px; padding:8px 12px; border:1px solid #21a2a7; border-radius:6px; color:#21a2a7;">
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
            // Fallback for other types
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

    const handleEditDD = (dd) => {
        setDdNo(dd.ddNo || "");
        setDdAmount(dd.ddAmount || "");
        setDdNotes(dd.ddNotes || "");

        // Restore file preview
        setDdPhotoName(dd.ddPhotoName || "");
        setDdPhotoPreview(dd.fileDataURL || (dd.apiResponse && dd.apiResponse.url) || "");

        // Scroll to form
        const formElement = document.querySelector('.upload-bank-dd-form-card');
        if (formElement) {
            formElement.scrollIntoView({ behavior: 'smooth' });
        }

        Swal.fire({
            icon: 'info',
            title: 'Edit Details',
            text: 'You can now view the previously uploaded document or re-upload a new one.',
            timer: 3000,
            showConfirmButton: false
        });
    };


    const handleDeleteDD = (ddToDelete) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to delete this record from history?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                const newHistory = uploadHistory.filter(item => item !== ddToDelete);
                setUploadHistory(newHistory);
                localStorage.setItem(`bank_demand_drafts_${bookingId}`, JSON.stringify(newHistory));
                Swal.fire(
                    'Deleted!',
                    'The record has been deleted.',
                    'success'
                );
            }
        });
    };

    const getUserId = () => {
        const stored = localStorage.getItem("userId") || localStorage.getItem("spendwise_userId");
        const parsed = stored ? Number(stored) : NaN;
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
      };
    const handleSubmit = async (e) => {
        e.preventDefault(); 
        if (!ddReceivedDate) {
            Swal.fire({
                icon: "error",
                title: "Missing Date",
                text: "Please select  Date",
            });
            return;
        }
    
        // Validation
        if (!bookingId || !ddPhoto || !ddNo || !ddAmount) {
            const missingFields = [];
            if (!bookingId) missingFields.push("• Booking ID");
            if (!ddPhoto) missingFields.push("• DD Photo/Document");
            if (!ddNo) missingFields.push("• DD Number");
            if (!ddAmount) missingFields.push("• DD Amount");

            alert(`❌ Please fill all required fields:\n\n${missingFields.join('\n')}`);
            return;
        }

        // Validate DD Amount is a valid number
        const amountNum = parseFloat(ddAmount);
        if (isNaN(amountNum) || amountNum <= 0) {
            alert("❌ Please enter a valid DD Amount (must be greater than 0)");
            return;
        }

        setUploading(true);

        try {
            // Prepare FormData for multipart/form-data request
            const formData = new FormData();
            formData.append('BookingId', parseInt(bookingId, 10));
            formData.append('File', ddPhoto);
            formData.append('DDNo', ddNo.trim());
            formData.append('DDAmount', amountNum);
            formData.append('DDNotes', ddNotes.trim() || "Bank DD Upload");
            formData.append('UserId', getUserId());
            formData.append("IsDDReceivedFromBank", isOriginalReceived);
            formData.append(
                "DDReceivedFromBankOn",  new Date(ddReceivedDate).toISOString()  
            ); 
            // Call the UploadBankDD API
            const response = await axiosInstance.post(API_ENDPOINTS.UPLOAD_BANK_DD, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                // Save to localStorage for history
                const ddData = {
                    bookingId: parseInt(bookingId, 10),
                    ddPhotoName,
                    ddNo: ddNo.trim(),
                    ddAmount: amountNum,
                    ddNotes: ddNotes.trim() || "Bank DD Upload",
                    uploadedAt: new Date().toISOString(),
                    apiResponse: response.data,
                    fileDataURL: ddPhotoPreview,
                    fileType: getFileType(ddPhotoName)
                };

                const existingDDs = JSON.parse(localStorage.getItem(`bank_demand_drafts_${bookingId}`) || "[]");
                existingDDs.push(ddData);
                localStorage.setItem(`bank_demand_drafts_${bookingId}`, JSON.stringify(existingDDs));

                // Refresh history
                setUploadHistory(existingDDs);

                // Show success message
                const successMessage = `✅ Bank DD uploaded successfully!\n\n` +
                    `DD Number: ${ddNo}\n` +
                    `DD Amount: ₹${amountNum.toLocaleString()}\n` +
                    `File: ${ddPhotoName}\n\n` +
                    `📋 Check Upload History below to see your uploaded DD.`;

                alert(successMessage);

                // Clear form
                setDdPhoto(null);
                setDdPhotoName("");
                setDdPhotoPreview("");
                setDdNo("");
                setDdAmount("");
                setDdNotes("");

                // Clear file input
                const fileInput = document.getElementById("ddPhoto");
                if (fileInput) fileInput.value = "";

            } else {
                alert("DD processed but with unexpected response. Please check the upload history.");
                // Refresh history from localStorage
                const existingDDs = JSON.parse(localStorage.getItem(`bank_demand_drafts_${bookingId}`) || "[]");
                setUploadHistory(existingDDs);
            }

        } catch (error) {
            let errorMessage = "Failed to upload Bank DD. Please try again.";

            if (error.response?.data) {
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data.title) {
                    errorMessage = error.response.data.title;

                    if (error.response.data.errors) {
                        const errors = error.response.data.errors;
                        const errorList = Object.keys(errors).map(key =>
                            `${key}: ${errors[key].join(', ')}`
                        ).join('\n');
                        errorMessage += '\n\nValidation Errors:\n' + errorList;
                    }
                } else if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            alert(`❌ Error uploading Bank DD:\n\n${errorMessage}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <BookingWrapper className="dashboard-container">
            <div className="dashboard-header">
                <div className="dashboard-header-content">
                    <div className="dashboard-header-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                    </div>
                    <div>
                        <h2 className="dashboard-header-title">Upload Bank Demand Draft</h2>
                        <p className="dashboard-subtitle">Upload and manage bank DD documents</p>
                    </div>
                </div>
                {/* Embedded Navigation */}
                <div className="dashboard-header-actions">
                    
                    <button
                        onClick={() => navigate("/property")}
                        className="primary-btn"
                    >
                        Back
                    </button>
                    <ReminderButton
                        size="small"
                        variant="outline"
                        onClick={() => setShowReminderPopup(true)}
                    />
                </div>
            </div>

            {/* Booking Information Card */}
            <div className="card">
                {!loadingBooking && booking ? (
                    <div className="">
    <div className="booking-info-matrix">

        <div className="booking-info-row">
            <label>Township :</label>
            <span className="booking-info-value">
                {booking?.township || "N/A"}
            </span>
        </div>

        <div className="booking-info-row">
            <label>Plot :</label>
            <span className="booking-info-value">
                {booking?.plotNumber || "N/A"}
            </span>
        </div>

        <div className="booking-info-row">
            <label>Size :</label>
            <span className="booking-info-value">
                {booking?.plotSize || "N/A"}
            </span>
        </div>

        <div className="booking-info-row">
            <label>Client :</label>
            <span className="booking-info-value">
                {booking?.clientName || "N/A"}
            </span>
        </div>

        <div className="booking-info-row">
            <label>Mobile :</label>
            <span className="booking-info-value">
                {booking?.clientMobile || "N/A"}
            </span>
        </div>

        <div className="booking-info-row">
            <label>Booking Date :</label>
            <span className="booking-info-value">
                {booking?.bookingDate
                    ? new Date(booking.bookingDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                    })
                    : "N/A"}
            </span>
        </div>

    </div>
</div>

                ) : (
                    <div className="booking-info-loading">
                        <p>{bookingId ? 'Loading booking information...' : 'No booking selected'}</p>
                    </div>
                )}
            </div>

            <div className="card upload-bank-dd-form-card">
                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="mb-2">
                                {/* ================= DD RECEIVED ================= */}
                            <div
                                className={`jda-container`}
                                
                            >
                                <div className="jda-checkbox-line">
                                   
                                    <label htmlFor="ddReceivedFromBank" className="jda-checkbox-label">
                                         What is received  from Bank?
                                    </label>
                                </div>

                                 
                                    <div className="jda-field" onClick={(e) => e.stopPropagation()}>

                                        {/* TYPE SELECTION */}
                                        <div style={{ display: "flex", gap: "20px", marginBottom: "10px" }}>
                                             <label className="jda-checkbox-label">
                                                <input
                                                    type="radio"
                                                    name="ddType"
                                                    checked={!isOriginalReceived}
                                                    onChange={() => setIsOriginalReceived(false)}
                                                />
                                                {" "} DD Photo  
                                            </label>
                                            <label className="jda-checkbox-label">
                                                <input
                                                    type="radio"
                                                    name="ddType"
                                                    checked={isOriginalReceived}
                                                    onChange={() => setIsOriginalReceived(true)}
                                                />
                                                {" "} Original DD  
                                            </label>

                                           
                                        </div>

                                        {/* DATE */}
                                        <label>
                                            Date <span className="required-asterisk">*</span>
                                        </label>

                                        <input
                                            type="date"
                                            value={ddReceivedDate}
                                            onChange={(e) => setDdReceivedDate(e.target.value)}
                                            className="form-control"
                                        />
                                    </div>
                                 
                            </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                             <div className="form-group">
                            <label className="upload-bank-dd-field-label">
                                Upload DD Photo <span className="upload-bank-dd-required">*</span>
                            </label>

                            {!ddPhotoPreview ? (
                                <div
                                    className="upload-bank-dd-upload-box"
                                    onClick={() => document.getElementById("ddPhoto").click()}
                                >
                                    <input
                                        id="ddPhoto"
                                        type="file"
                                        onChange={handlePhotoChange}
                                        accept="image/*,.pdf"
                                        style={{ display: "none" }}
                                        required
                                    />
                                    <svg className="upload-bank-dd-upload-icon" viewBox="0 0 24 24" fill="none" stroke="rgba(127, 143, 166, 0.6)" strokeWidth="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                        <polyline points="21 15 16 10 5 21"></polyline>
                                    </svg>
                                    <div className="upload-bank-dd-upload-title">
                                        Click to upload DD photo
                                    </div>
                                    <div className="upload-bank-dd-upload-subtitle">
                                        Supports: JPG, PNG, PDF (Max 10MB)
                                    </div>
                                </div>
                            ) : (
                                <div className="upload-bank-dd-preview-box">
                                    <div className="upload-bank-dd-preview-content">
                                        {ddPhotoName.toLowerCase().endsWith('.pdf') ? (
                                            <div className="upload-bank-dd-pdf-icon">
                                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2">
                                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                    <polyline points="14 2 14 8 20 8"></polyline>
                                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                                    <polyline points="10 9 9 9 8 9"></polyline>
                                                </svg>
                                            </div>
                                        ) : (
                                            <img
                                                src={ddPhotoPreview}
                                                alt="DD Preview"
                                                className="upload-bank-dd-preview-image"
                                            />
                                        )}
                                        {/* <div className="upload-bank-dd-preview-info">
                                            <div className="upload-bank-dd-file-name">
                                                {ddPhotoName}
                                            </div>
                                            <div className="upload-bank-dd-success-message">
                                                File uploaded successfully
                                            </div>
                                        </div> */}
                                        <div className="d-flex gap-2 flex-wrap">
                                            <button
                                            type="button"
                                            onClick={handleRemovePhoto}
                                            className="primary-btn"
                                        >
                                            Remove
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleViewPhoto(ddPhotoPreview)}
                                            className="primary-btn"
                                        >
                                            View Document
                                        </button>
                                        </div>
                                        
                                    </div>
                                </div>
                            )}
                        </div>
                        </div>
                        <div className="col-md-6">
                            {/* DD Number */}
                        <div className="form-group">
                            <label htmlFor="ddNo" className="upload-bank-dd-field-label">
                                DD Number <span className="upload-bank-dd-required">*</span>
                            </label>
                            <input
  id="ddNo"
  type="number  "
  value={ddNo}
   onChange={(e) => {
    const value = e.target.value;
    // Allow only digits
    if (/^\d*$/.test(value)) {
      setDdNo(value);
    }
  }}
  placeholder="Enter DD number"
  required
  className="form-control"
/>
                                </div>
                        </div>
                        <div className="col-md-6">
                            {/* DD Amount */}
                        <div className="form-group">
                            <label htmlFor="ddAmount" className="upload-bank-dd-field-label">
                                DD Amount <span className="upload-bank-dd-required">*</span>
                            </label>
                            <input
                            id="ddAmount"
                            type="number"
                            value={ddAmount}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value >= 0) {
                                setDdAmount(value);
                                }
                            }}
                            placeholder="Enter DD amount"
                            min="0"
                            step="0.01"
                            required
                            className="form-control"
                            />
                        </div>
                        </div>
                        <div className="col-md-6">
                            {/* DD Notes */}
                        <div className="form-group">
                            <label htmlFor="ddNotes" className="upload-bank-dd-field-label">
                                DD Notes
                            </label>
                            <textarea
                                id="ddNotes"
                                value={ddNotes}
                                onChange={(e) => setDdNotes(e.target.value)}
                                placeholder="Enter any notes about the demand draft..."
                                className="form-control"
                            />
                        </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="form-actions">
                        <button type="submit" className="primary-btn" disabled={uploading}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                            {uploading ? "Uploading..." : "Upload DD"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Reminder Popup */}
            <ReminderPopup
                isOpen={showReminderPopup}
                onClose={() => setShowReminderPopup(false)}
                title="Create Reminder"
                bookingId={id}
            />
        </BookingWrapper>
    );
}