import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BookingWrapper from "./style";
import PropertyNavigation from "./PropertyNavigation";
import ReminderButton from "../../components/ReminderButton";
import ReminderPopup from "../../components/ReminderPopup";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS , { API_BASE_URL } from '../../utilities/apiConfig';
import { formatDisplayDate, formatDateForInput } from "../../utilities/dateUtils";
import { getCurrentUserRole } from "../../utilities/rolePermissions";
import Swal from "sweetalert2";
import "./JDAPattaUpdate.css";

export default function JDAPattaUpdate() {
    const navigate = useNavigate();
    const { id } = useParams();

    // Role check
    const role = getCurrentUserRole();
    const isJDAFileAdmin = role === 'jda_file_admin';

    // Form state
    const [jdaPattaApplied, setJdaPattaApplied] = useState(false);
    const [jdaPattaReceived, setJdaPattaReceived] = useState(false);
    const [jdaPattaAppliedOn, setJdaPattaAppliedOn] = useState("");
    const [jdaPattaReceivedOn, setJdaPattaReceivedOn] = useState("");
    const [jdaPattaRegistered, setJdaPattaRegistered] = useState(false);
    const [uploadRegisteredCopyDate, setUploadRegisteredCopyDate] = useState("");
    const [jdaFileSignedByCustomer, setjdaFileSignedByCustomer] = useState(false);
    const [jdaPattaGivenDate, setJdaPattaGivenDate] = useState("");
    // const [ddReceivedFromBank, setDdReceivedFromBank] = useState(false);
    const [ddReceivedDate, setDdReceivedDate] = useState("");
    const [note, setNote] = useState("");
    const [jdaFile, setJdaFile] = useState(null);
    const [jdaPreview, setJdaPreview] = useState("");
    const ALLOWED_FILE_REGEX = /\.(jpg|jpeg|png|pdf)$/i;
    const MAX_FILE_SIZE = 20 * 1024 * 1024; // 5MB
    const isPdf = (fileUrl) => {
        return fileUrl?.toLowerCase().includes(".pdf");
    };
    const handleJdaFileChange = (fileList) => {
    const file = fileList?.[0];
    if (!file) return;

    if (!ALLOWED_FILE_REGEX.test(file.name)) {
        alert("Only JPG, JPEG, PNG or PDF files allowed");
        return;
    }

    if (file.size > MAX_FILE_SIZE) {
        alert("File must be less than 5MB");
        return;
    }

    setJdaFile(file);

    if (jdaPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(jdaPreview);
    }

    setJdaPreview(URL.createObjectURL(file));
};

    // UI state
    const [loading, setLoading] = useState(false);
    const [bookingExists, setBookingExists] = useState(null);
    const [checkingBooking, setCheckingBooking] = useState(true);
    const [booking, setBooking] = useState(null);
    const [showReminderPopup, setShowReminderPopup] = useState(false);

    // Handle checkbox changes
    const setAppliedChecked = (checked) => {
        setJdaPattaApplied(checked);
        if (!checked) setJdaPattaAppliedOn("");
    };
    const setJDAPattaReceiveChecked = (checked) => {
    setJdaPattaReceived(checked);
    if (!checked) setJdaPattaReceivedOn(""); 
};
    
    const setRegisteredChecked = (checked) => {
        setJdaPattaRegistered(checked);
        if (!checked) setUploadRegisteredCopyDate("");
    };

    const setGivenToBankChecked = (checked) => {
        setjdaFileSignedByCustomer(checked);
        if (!checked) setJdaPattaGivenDate("");
    };

    // const setDDReceivedChecked = (checked) => {
    //     setDdReceivedFromBank(checked);
    //     if (!checked) setDdReceivedDate("");
    // };

    // Load booking and prefill data
    useEffect(() => {
        const loadBookingData = async () => {
            if (!id || isNaN(Number(id))) {
                setBookingExists(false);
                setCheckingBooking(false);

                Swal.fire({
                    icon: "error",
                    title: "Invalid Booking ID",
                    text: "Please navigate from the Booking Dashboard",
                    confirmButtonText: "Go to Dashboard"
                }).then(() => {
                    navigate("/property");
                });
                return;
            }

            try {
                setCheckingBooking(true);

                // Fetch all bookings
                const response = await axiosInstance.get(API_ENDPOINTS.BOOKING_LIST);
                const bookingsList = Array.isArray(response.data) ? response.data : (response.data?.value || []);

                const booking = bookingsList.find(b => b.id === Number(id));

                if (booking) {
                    setBookingExists(true);
                    setBooking({
                        id: booking.id,
                        township: booking.townshipName,
                        plotNumber: booking.plotNo,
                        plotSize: booking.plotSize,
                        clientName: booking.clientName,
                        clientMobile: booking.contactNo,
                        bookingDate: booking.bookingDate
                    });

                    // Prefill JDA/Patta data from booking detail
                    try {
                        const detailRes = await axiosInstance.get(
                            `${API_ENDPOINTS.GET_BOOKING_BY_ID}?bookingId=${booking.id}`
                        );
                        const detail = detailRes?.data?.data ?? detailRes?.data ?? {};

setJdaPattaApplied(detail.isJDAPattaApplied ?? false);
setJdaPattaAppliedOn(
    detail.jdaPattaAppliedOn
        ? formatDateForInput(detail.jdaPattaAppliedOn)
        : ""
);

setJdaPattaReceived(detail.isJDAPattaReceived ?? false);
setJdaPattaReceivedOn(
    detail.jdaPattaReceivedOn
        ? formatDateForInput(detail.jdaPattaReceivedOn)
        : ""
);

setJdaPattaRegistered(detail.isJDAPattaRegistered ?? false);
setUploadRegisteredCopyDate(
    detail.jdaPattaRegisteredOn
        ? formatDateForInput(detail.jdaPattaRegisteredOn)
        : ""
);

setjdaFileSignedByCustomer(detail.isjdaFileSignedByCustomer ?? false);
setJdaPattaGivenDate(
    detail.jdaFileSignedByCustomerOn
        ? formatDateForInput(detail.jdaFileSignedByCustomerOn)
        : ""
);

// setDdReceivedFromBank(detail.isDDReceivedFromBank ?? false);
// setDdReceivedDate(
//     detail.ddReceivedFromBankOn
//         ? formatDateForInput(detail.ddReceivedFromBankOn)
//         : ""
// );


setNote(detail.jdaPattaNotes ?? "");
if (detail.jdaFilePath) {
    const fullUrl = `${API_BASE_URL}/Uploads/${detail.jdaFilePath}`;
    setJdaPreview(fullUrl);
}

                    } catch (prefillErr) {
                    }
                } else {
                    setBookingExists(false);

                    Swal.fire({
                        icon: "warning",
                        title: "Booking Not Found",
                        html: `
                            <p>Booking ID <strong>${id}</strong> does not exist in the system.</p>
                            <p>Please select a valid booking from the dashboard.</p>
                        `,
                        confirmButtonText: "Go to Dashboard"
                    }).then(() => {
                        navigate("/property");
                    });
                }
            } catch (error) {
                // Allow user to proceed even if verification fails
                setBookingExists(true);
            } finally {
                setCheckingBooking(false);
            }
        };

        loadBookingData();
    }, [id, navigate]);
    const handleSubmit = async (e) => {
        e.preventDefault();

        const bookingId = Number(id);
        if (!bookingId || isNaN(bookingId)) {
            Swal.fire({
                icon: "error",
                title: "Missing Booking ID",
                text: "Invalid booking ID in URL.",
            });
            return;
        }

        const validationIssues = [];

        const validateCheckboxDatePair = ({ checked, dateStr, checkboxLabel, dateLabel }) => {
            const hasDate = Boolean(dateStr);

            if (checked && !hasDate) {
                validationIssues.push(`${dateLabel} is required when "${checkboxLabel}" is checked.`);
                return;
            }

            if (!checked && hasDate) {
                validationIssues.push(`Please check "${checkboxLabel}" or clear "${dateLabel}".`);
                return;
            }

            if (hasDate) {
                const parsed = new Date(dateStr);
                if (Number.isNaN(parsed.getTime())) {
                    validationIssues.push(`Invalid date selected for "${dateLabel}".`);
                }
            }
        };

        const validateCheckboxFile = ({ checked, file, checkboxLabel, fileLabel }) => {
    const hasFile = Boolean(file);

    if (checked && !hasFile) {
        validationIssues.push(`${fileLabel} is required when "${checkboxLabel}" is checked.`);
        return;
    }

    if (!checked && hasFile) {
        validationIssues.push(`Please check "${checkboxLabel}" or remove "${fileLabel}".`);
        return;
    }
};

validateCheckboxFile({
    checked: jdaPattaReceived,
    file: jdaFile,
    checkboxLabel: "Is JDA Patta Received",
    fileLabel: "JDA Patta Image",
});

        validateCheckboxDatePair({
            checked: jdaPattaApplied,
            dateStr: jdaPattaAppliedOn,
            checkboxLabel: "Is JDA Patta Applied",
            dateLabel: "JDA Patta Applied On",
        });

           validateCheckboxDatePair({
            checked: jdaPattaReceived,
            dateStr: jdaPattaReceivedOn,
            checkboxLabel: "Is JDA Patta Received",
            dateLabel: "JDA Patta Received On",
        });
        validateCheckboxDatePair({
            checked: jdaPattaRegistered,
            dateStr: uploadRegisteredCopyDate,
            checkboxLabel: "Is JDA Patta Registered",
            dateLabel: "JDA Patta Registered",
        });

        validateCheckboxDatePair({
            checked: jdaFileSignedByCustomer,
            dateStr: jdaPattaGivenDate,
            checkboxLabel: "Is JDA Patta Given to Bank",
            dateLabel: "JDA Patta Given Date",
        });

        // validateCheckboxDatePair({
        //     checked: ddReceivedFromBank,
        //     dateStr: ddReceivedDate,
        //     checkboxLabel: "Is DD Received from Bank",
        //     dateLabel: "DD Received Date",
        // });

        if (validationIssues.length) {
            Swal.fire({
                icon: "error",
                title: "Please fill these fields",
                html: `
                    <ul style="text-align:left; padding-left: 18px; margin: 0;">
                        ${validationIssues.map((m) => `<li>${m}</li>`).join("")}
                    </ul>
                `,
            });
            return;
        }

        const anyUpdate =
            jdaPattaApplied ||
            jdaPattaReceived ||
            jdaPattaRegistered ||
            jdaFileSignedByCustomer ||
            // ddReceivedFromBank ||
            Boolean(note?.trim());

        if (!anyUpdate) {
            Swal.fire({
                icon: "warning",
                title: "No changes to save",
                text: "Please select at least one JDA/Patta status or add notes.",
            });
            return;
        }

        const formatDate = (dateStr) => {
            if (!dateStr) return null;
            return new Date(dateStr).toISOString();
        };

        const payload = {
            bookingId: bookingId,
            isJDAPattaApplied: jdaPattaApplied,
            jdaPattaAppliedOn: jdaPattaApplied ? formatDate(jdaPattaAppliedOn) : null,
            
            isJDAPattaReceived: jdaPattaReceived,
            jdaPattaReceivedOn: jdaPattaReceived ? formatDate(jdaPattaReceivedOn) : null,
            
            isJDAPattaRegistered: jdaPattaRegistered,
            jdaPattaRegisteredOn: jdaPattaRegistered ? formatDate(uploadRegisteredCopyDate) : null,
            isjdaFileSignedByCustomer: jdaFileSignedByCustomer,
            jdaFileSignedByCustomerOn: jdaFileSignedByCustomer ? formatDate(jdaPattaGivenDate) : null,
            // isDDReceivedFromBank: ddReceivedFromBank,
            // ddReceivedFromBankOn: ddReceivedFromBank ? formatDate(ddReceivedDate) : null,
            notes: note?.trim() || "",
        };

        setLoading(true);
        try {
    const formData = new FormData();

    // Basic fields
    formData.append("BookingId", bookingId);

    formData.append("IsJDAPattaApplied", jdaPattaApplied);
    formData.append("JDAPattaAppliedOn", jdaPattaApplied ? formatDate(jdaPattaAppliedOn) : "");

    formData.append("IsJDAPattaReceived", jdaPattaReceived);
    formData.append("JDAPattaReceivedOn", jdaPattaReceived ? formatDate(jdaPattaReceivedOn) : "");

    formData.append("IsJDAPattaRegistered", jdaPattaRegistered);
    formData.append("JDAPattaRegisteredOn", jdaPattaRegistered ? formatDate(uploadRegisteredCopyDate) : "");

    formData.append("IsjdaFileSignedByCustomer", jdaFileSignedByCustomer);
    formData.append("jdaFileSignedByCustomerOn", jdaFileSignedByCustomer ? formatDate(jdaPattaGivenDate) : "");

    // formData.append("IsDDReceivedFromBank", ddReceivedFromBank);
    // formData.append("DDReceivedFromBankOn", ddReceivedFromBank ? formatDate(ddReceivedDate) : "");

    // ✅ Notes (IMPORTANT: backend name = Notes)
    formData.append("Notes", note?.trim() || "");

    // ✅ File (IMPORTANT: backend name = File)
    if (jdaFile) {
        formData.append("File", jdaFile);
    }

    // 🔍 Debug (run once)
    // for (let pair of formData.entries()) {
    //     console.log(pair[0], pair[1]);
    // }

    const res = await axiosInstance.post(
        API_ENDPOINTS.UPDATE_JDA_PATTA_STATUS,
        formData
        // ❌ Don't manually set Content-Type
    );

    const isSuccess =
        res.data === true ||
        res.data?.success === true ||
        res.status === 200;

    if (isSuccess) {
        Swal.fire({
            icon: "success",
            title: "JDA Patta Status Updated Successfully",
            text: "JDA Patta information has been recorded",
            timer: 2000,
            showConfirmButton: false,
        });

        setTimeout(() => {
            navigate(`/property?refresh=${Date.now()}`);
        }, 2000);
    } else {
        Swal.fire({
            icon: "warning",
            title: "Unexpected Response",
            text: "The status may not have been saved. Please verify.",
        });
    }

} catch (err) {
    const status = err.response?.status;
    let message = "Something went wrong";

    if (status === 400) {
        message = "Invalid request data";
    } else if (status === 404) {
        message = `Booking ID ${id} not found`;
    } else if (status === 500) {
        message = "Internal Server Error";
    } else if (!err.response) {
        message = "Network Error - Cannot connect to server";
    }

    Swal.fire({
        icon: "error",
        title: `Failed (${status || "Network Error"})`,
        text: message,
    });
} finally {
    setLoading(false);
}
    };

    // Loading state
    if (checkingBooking) {
        return (
            <BookingWrapper className={`dashboard-container ${isJDAFileAdmin ? 'jda-file-admin' : ''}`}>
                <div className="dashboard-header">
                    <div className="dashboard-header-content">
                        <div>
                            <h2 className="dashboard-title">JDA Patta Update</h2>
                            <p className="dashboard-subtitle">Verifying booking...</p>
                        </div>
                    </div>
                    {!isJDAFileAdmin && <PropertyNavigation hideHealthButton />}
                </div>
                <div className="card dashboard-card">
                    <div className="loading-container">
                        <p>Verifying booking ID {id}...</p>
                    </div>
                </div>
            </BookingWrapper>
        );
    }

    // Booking not found
    if (bookingExists === false) {
        return (
            <BookingWrapper className={`dashboard-container ${isJDAFileAdmin ? 'jda-file-admin' : ''}`}>
                <div className="dashboard-header">
                    <div className="dashboard-header-content">
                        <div>
                            <h2 className="dashboard-title">JDA Patta Update</h2>
                            <p className="dashboard-subtitle">Booking not found</p>
                        </div>
                    </div>
                    {!isJDAFileAdmin && <PropertyNavigation hideHealthButton />}
                </div>
                <div className="card">
                    <div className="error-container">
                        <p>Booking ID {id} does not exist.</p>
                        <button
                            className="primary-btn"
                            onClick={() => navigate("/property")}
                        >
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            </BookingWrapper>
        );
    }

    return (
        <BookingWrapper className={`dashboard-container ${isJDAFileAdmin ? 'jda-file-admin' : ''}`}>
            <div className="dashboard-header">
                <div className="dashboard-header-content">
                    <div>
                        <h1 className="dashboard-title">
                            {isJDAFileAdmin ? 'JDA File Update' : 'JDA Patta Update'}
                        </h1>
                        <p className="dashboard-subtitle">
                            Track JDA Patta application and registration status
                        </p>
                    </div>
                    
                </div>
                
                    <div className="dashboard-header-actions">
                        <button
                            className="primary-btn"
                            onClick={() => navigate(-1)}
                        >
                            Back
                        </button>
                        <ReminderButton
                                                size="small"
                                                onClick={() => setShowReminderPopup(true)}
                                                
                                            />
                    </div>
                
            </div>

            {/* Booking Information */}
            {!checkingBooking && booking && (
                <div className="card">
                    <div className="booking-info-matrix">

                        <div className="booking-info-row">
                            <label>Township :</label>
                            <div className="booking-info-value">
                                {booking?.township || "N/A"}
                            </div>
                        </div>

                        <div className="booking-info-row">
                            <label>Plot :</label>
                            <div className="booking-info-value">
                                {booking?.plotNumber || "N/A"}
                            </div>
                        </div>

                        <div className="booking-info-row">
                            <label>Size :</label>
                            <div className="booking-info-value">
                                {booking?.plotSize || "N/A"}
                            </div>
                        </div>

                        <div className="booking-info-row">
                            <label>Client :</label>
                            <div className="booking-info-value">
                                {booking?.clientName || "N/A"}
                            </div>
                        </div>

                        <div className="booking-info-row">
                            <label>Mobile :</label>
                            <div className="booking-info-value">
                                {booking?.clientMobile || "N/A"}
                            </div>
                        </div>

                        <div className="booking-info-row">
                            <label>Booking Date :</label>
                            <div className="booking-info-value">
                                {booking?.bookingDate
                                    ? formatDisplayDate(booking.bookingDate)
                                    : "N/A"}
                            </div>
                        </div>

                    </div>
                </div>


            )}

            <div className="card">
                
                    <div className="dashboard-table-header">
                        <div>
                            <h3 className="dashboard-table-title">
                            JDA Patta Status Update
                        </h3>

                        <p className="form-header-subtitle">
                            Update the status of JDA Patta application and registration process
                        </p>
                        </div>
                        
                    </div>
                    <form id="jda-form" onSubmit={handleSubmit}>
                <div className="jda-patta-form">
                    {/* ================= GIVEN TO BANK ================= */}
                    <div
                        className={`jda-container ${jdaFileSignedByCustomer ? 'checked' : ''}`}
                        onClick={() => setGivenToBankChecked(!jdaFileSignedByCustomer)}
                    >
                        <div className="jda-checkbox-line">
                            <input
                                type="checkbox"
                                id="jdaFileSignedByCustomer"
                                checked={jdaFileSignedByCustomer}
                                onChange={(e) => setGivenToBankChecked(e.target.checked)}
                                className="jda-checkbox"
                                onClick={(e) => e.stopPropagation()}
                            />

                            <label htmlFor="jdaFileSignedByCustomer" className="jda-checkbox-label">
                               Is JDA File Signed By Customer
                            </label>
                        </div>

                        {jdaFileSignedByCustomer && (
                            <div className="jda-field" onClick={(e) => e.stopPropagation()}>
                                <label>
                                    JDA File Signed Date <span className="required-asterisk">*</span>
                                </label>

                                <div className="jda-date-field">
                                    <input
                                        type="date"
                                        value={jdaPattaGivenDate}
                                        onChange={(e) => setJdaPattaGivenDate(e.target.value)}
                                        className="form-control"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    <div
                        className={`jda-container ${jdaPattaApplied ? 'checked' : ''}`}
                        onClick={() => setAppliedChecked(!jdaPattaApplied)}
                    >
                        <div className="jda-checkbox-line">
                            <input
                                type="checkbox"
                                id="jdaPattaApplied"
                                checked={jdaPattaApplied}
                                onChange={(e) => setAppliedChecked(e.target.checked)}
                                className="jda-checkbox"
                                onClick={(e) => e.stopPropagation()}
                            />

                            <label htmlFor="jdaPattaApplied" className="jda-checkbox-label">
                                Is JDA Patta Applied
                            </label>
                        </div>

                        {jdaPattaApplied && (
                            <div className="jda-field" onClick={(e) => e.stopPropagation()}>
                                <label htmlFor="jdaPattaAppliedOn">
                                    JDA Patta Applied On <span className="required-asterisk">*</span>
                                </label>

                                <div className="jda-date-field">
                                    <input
                                        id="jdaPattaAppliedOn"
                                        type="date"
                                        value={jdaPattaAppliedOn}
                                        onChange={(e) => setJdaPattaAppliedOn(e.target.value)}
                                        className="form-control"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                <div
                        className={`jda-container ${jdaPattaReceived ? 'checked' : ''}`}
                        onClick={() => setJDAPattaReceiveChecked(!jdaPattaReceived)}
                    >
                        <div className="jda-checkbox-line">
                            <input
                                type="checkbox"
                                id="jdaPattaReceived"
                                checked={jdaPattaReceived}
                                onChange={(e) => setJDAPattaReceiveChecked(e.target.checked)}
                                className="jda-checkbox"
                                onClick={(e) => e.stopPropagation()}
                            />

                            <label htmlFor="jdaPattaReceived" className="jda-checkbox-label">
                                Is JDA Patta received
                            </label>
                        </div>

                        {jdaPattaReceived && (
                            <div className="d-flex gap-2 align-items-center" onClick={(e) => e.stopPropagation()}>
                                
                                {/* DATE */}
                                <div className="jda-field w-50">
                                    <label>
                                        JDA Patta received on <span className="required-asterisk">*</span>
                                    </label>

                                    <input
                                        type="date"
                                        value={jdaPattaReceivedOn}
                                        onChange={(e) => setJdaPattaReceivedOn(e.target.value)}
                                        className="form-control"
                                    />
                                </div>

                                {/* FILE UPLOAD */}
                                <div className="file-item-wrapper w-50">
                                    <div className="file-header">
                                        <label className="file-title">JDA Patta Image <span className="required-asterisk">*</span></label>
                                    </div>

                                    <label className="upload-box">
                                        <span className="upload-text">Click to Upload</span>
                                        <input
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.pdf"
                                            onChange={(e) => handleJdaFileChange(e.target.files)}
                                        />
                                    </label>

                                    <div className="file-preview-box">
                                        {jdaPreview ? (
                                            isPdf(jdaPreview) ? (
                                                <button
                                                    className="pdf-preview-btn"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        window.open(jdaPreview, "_blank");
                                                    }}
                                                >
                                                    Preview PDF
                                                </button>
                                            ) : (
                                                <img
                                                    src={jdaPreview}
                                                    alt="preview"
                                                    className="preview-image"
                                                />
                                            )
                                        ) : (
                                            <div className="empty-preview">No file selected</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ================= REGISTERED ================= */}
                    <div
                        className={`jda-container ${jdaPattaRegistered ? 'checked' : ''}`}
                        onClick={() => setRegisteredChecked(!jdaPattaRegistered)}
                    >
                        <div className="jda-checkbox-line">
                            <input
                                type="checkbox"
                                id="jdaPattaRegistered"
                                checked={jdaPattaRegistered}
                                onChange={(e) => setRegisteredChecked(e.target.checked)}
                                className="jda-checkbox"
                                onClick={(e) => e.stopPropagation()}
                            />

                            <label htmlFor="jdaPattaRegistered" className="jda-checkbox-label">
                                Is JDA Patta Registered
                            </label>
                        </div>

                        {jdaPattaRegistered && (
                            <div className="jda-field" onClick={(e) => e.stopPropagation()}>
                                <label>
                                    JDA Patta Registered <span className="required-asterisk">*</span>
                                </label>

                                <input
                                    type="date"
                                    value={uploadRegisteredCopyDate}
                                    onChange={(e) => setUploadRegisteredCopyDate(e.target.value)}
                                    className="form-control"
                                />
                            </div>
                        )}
                    </div>


                    


                    {/* ================= DD RECEIVED ================= */}
                    {/* <div
                        className={`jda-container ${ddReceivedFromBank ? 'checked' : ''}`}
                        onClick={() => setDDReceivedChecked(!ddReceivedFromBank)}
                    >
                        <div className="jda-checkbox-line">
                            <input
                                type="checkbox"
                                id="ddReceivedFromBank"
                                checked={ddReceivedFromBank}
                                onChange={(e) => setDDReceivedChecked(e.target.checked)}
                                className="jda-checkbox"
                                onClick={(e) => e.stopPropagation()}
                            />

                            <label htmlFor="ddReceivedFromBank" className="jda-checkbox-label">
                                Is DD Received from Bank
                            </label>
                        </div>

                        {ddReceivedFromBank && (
                            <div className="jda-field" onClick={(e) => e.stopPropagation()}>
                                <label>
                                    DD Received Date <span className="required-asterisk">*</span>
                                </label>

                                <div className="jda-date-field">
                                    <input
                                        type="date"
                                        value={ddReceivedDate}
                                        onChange={(e) => setDdReceivedDate(e.target.value)}
                                        className="form-control"
                                    />
                                </div>
                            </div>
                        )}
                    </div> */}
                </div>
                <div className="jda-note-field">
                    <label htmlFor="note">Note</label>
                    <textarea
                        id="note"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Enter any notes..."
                        className="form-control"
                    />
                </div>
            </form>
                <div className="ms-auto">

                <button
                    type="submit"
                    className={`primary-btn ${loading ? 'loading' : ''}`}
                    disabled={loading}
                    form="jda-form"
                >
                    {loading ? (
                        <>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 12a9 9 0 11-6.219-8.56" />
                            </svg>
                            <span>Saving...</span>
                        </>
                    ) : (
                        <>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                            </svg>
                            <span>Save Updates</span>
                        </>
                    )}
                </button>
            </div>
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
