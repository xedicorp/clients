import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Swal from 'sweetalert2';
import API_ENDPOINTS from "../../utilities/apiConfig";
import axiosInstance from "../../utilities/axiosInstance";
import "./NewBooking.css";
import PropertyNavigation from "./PropertyNavigation";
import BookingWrapper from "./style";
import ReminderPopup from '../../components/ReminderPopup';
import ReminderButton from "../../components/ReminderButton";

const FormField = ({
    label,
    section,
    field,
    children,
    showAsterisk = true,
    touched,
    errors,
    isFieldMandatory
}) => {
    const isRequired = showAsterisk && isFieldMandatory?.(section, field);

    return (
        <div className="booking-form-field">
            <label>
                {label} {isRequired && <span style={{ color: "red" }}>*</span>}
            </label>

            {children}

            {touched[field] && errors[field] && (
                <span className="field-error" style={{ color: "red" }}>
                    {errors[field]}
                </span>
            )}
        </div>
    );
};

export default function NewBooking() {
    const navigate = useNavigate();
    const location = useLocation();
    const isFromHoldBooking = location.state?.fromHoldBooking;
    const [showReminderPopup, setShowReminderPopup] = useState(false);

    const countryCodeOptions = [
        { value: "+91", label: "+91" },
    ];

    const [newBooking, setNewBooking] = useState({
        BookingDate: new Date().toISOString().split("T")[0],
        WorkflowTypeId: "",
        TownshipId: "",
        PlotId: "",
        PlotNo: "",
        PlotSize: "",
        AgreementValue: "",
        TotalAgreementValue: "",
        Discount: 0,
        DocumentTypeId: "",
        File: null
    });

    const [client, setClient] = useState({
        ClientName: "",
        ClientContactNo: "",
        countryCode: "+91",
        ClientEmail: "",
        ClientAddress: "",
        RelationType: "",
        RelationName: ""
    });

    const [associate, setAssociate] = useState({
        AssociateName: "",
        AssociateContactNo: "",
        countryCode: "+91",
        AssociateReraNo: "",
        LeaderName: "",
        LeaderContactNo: "",
        leaderCountryCode: "+91"
    });

    const [payment, setPayment] = useState({
        InitialAmount: "",
        InitialPaymentDate: "",
        InitialReceiptMethod: "",
        InitialTransactionId: "",
        InitialBankName: "",
        InitialChequeNo: "",
        InitialReceiptStatus: "1",
        InitialNotes: "Initial Payment",
        InitialReceiptImage: null
    });

    // Error states for all sections
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [disabledFields, setDisabledFields] = useState({});
    const [townshipOptions, setTownshipOptions] = useState([]);
    const [reraList, setReraList] = useState([]);
    const [availablePlots, setAvailablePlots] = useState([]);
    const [reraSearch, setReraSearch] = useState("");
    const [contactSearch, setContactSearch] = useState("");
    const [showReraDropdown, setShowReraDropdown] = useState(false);
    const [showContactDropdown, setShowContactDropdown] = useState(false);
    const [bankList, setBankList] = useState([]);

    const ALLOWED_FILE_REGEX = /\.(jpg|jpeg|png|pdf)$/i;
    const MAX_FILE_SIZE = 20 * 1024 * 1024;

    const paymentModes = [
        { value: "1", label: "Bank Transfer" },
        { value: "2", label: "Cheque" },
        { value: "4", label: "UPI" },
        { value: "5", label: "NEFT/RTGS" },
        { value: "6", label: "Demand Draft" },
    ];

    const relationOptions = [
        { value: "S/O", label: "S/O" },
        { value: "D/O", label: "D/O" },
        { value: "W/O", label: "W/O" },
        { value: "C/O", label: "C/O" },
    ];

    useEffect(() => {
  const fetchBanks = async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.BANK_LIST);

      const raw = response?.data;
      console.log("Bank List response:", raw);

      const banks = Array.isArray(raw)
        ? raw
        : raw?.value || raw?.data || [];

      setBankList(banks);
    } catch (err) {
      console.error(err);
    }
  };

  fetchBanks();
}, []);
    // Field validation rules
    const validateField = (section, field, value) => {
        // Fields that should NOT be mandatory
        const nonMandatoryFields = {
            newBooking: ['ClientEmail','ClientContactNo', 'ClientAddress','PlotSize', 'TotalAgreementValue'],
            client: ['ClientEmail'],
            payment: ['InitialChequeNo', 'InitialNotes']
        };

        // Check if field is mandatory
        const isMandatory = !nonMandatoryFields[section]?.includes(field);

        if (!isMandatory) return ""; // Non-mandatory fields don't need validation

        if (!value || value === "" || value === null || value === undefined) {
            const fieldNames = {
                WorkflowTypeId: "Booking Type",
                BookingDate: "Booking Date",
                TownshipId: "Township",
                PlotNo: "Plot Number",
                PlotId: "Plot",
                AgreementValue: "Agreement Rate",
                Discount: "Discount",
              //  DocumentTypeId: "ID Type",
               // File: "ID Proof",
                ClientName: "Client Name",
               // ClientContactNo: "Contact Number",
              //  ClientAddress: "Address",
                RelationType: "Relation Type",
                RelationName: "Relation Name",
                AssociateName: "Associate Name",
                AssociateContactNo: "Associate Contact",
                AssociateReraNo: "RERA Number",
                LeaderName: "Leader Name",
                LeaderContactNo: "Leader Contact",
                InitialAmount: "Booking Amount",
                InitialPaymentDate: "Receipt Date",
                InitialReceiptMethod: "Payment Method",
                InitialTransactionId: "Transaction ID",
                InitialBankName: "Bank Name",
                InitialReceiptImage: "Receipt Image"
            };
            return `${fieldNames[field] || field} is required`;
        }

        // Special validations
        // if (field === 'ClientContactNo' && value.length !== 10) {
        //     return "Contact number must be 10 digits";
        // }
        if (field === 'AssociateContactNo' && value.length !== 10) {
            return "Contact number must be 10 digits";
        }
        if (field === 'LeaderContactNo' && value.length !== 10) {
            return "Contact number must be 10 digits";
        }
        if (field === 'InitialAmount' && Number(value) <= 0) {
            return "Booking amount must be greater than zero";
        }
        if (field === 'Discount' && value && Number(value) < 0) {
            return "Discount cannot be negative";
        }
        if (field === 'ClientEmail' && value && !/\S+@\S+\.\S+/.test(value)) {
            return "Invalid email format";
        }

        return "";
    };

    // Validate entire form
    const validateForm = () => {
     
        let newErrors = {};

        // Booking section validation
        const bookingFields = ['WorkflowTypeId', 'BookingDate', 'TownshipId', 'PlotNo', 'AgreementValue' ];
        bookingFields.forEach(field => {
            const error = validateField('newBooking', field, newBooking[field]);
            if (error) newErrors[field] = error;
        });

        // Client section validation
        const clientFields = ['ClientName', 'RelationType', 'RelationName'];
        clientFields.forEach(field => {
            const error = validateField('client', field, client[field]);
            if (error) newErrors[field] = error;
        });

        // Associate section validation
        const associateFields = ['AssociateName', 'AssociateContactNo', 'AssociateReraNo', 'LeaderName', 'LeaderContactNo'];
        associateFields.forEach(field => {
            const error = validateField('associate', field, associate[field]);
            if (error) newErrors[field] = error;
        });

        // Payment section validation
        const paymentFields = ['InitialAmount', 'InitialPaymentDate', 'InitialReceiptMethod', 'InitialTransactionId', 'InitialBankName', 'InitialReceiptImage'];
        paymentFields.forEach(field => {
            const error = validateField('payment', field, payment[field]);
            if (error) newErrors[field] = error;
        });

        setErrors(newErrors);

        // Auto scroll to first error
        if (Object.keys(newErrors).length > 0) {
            const firstErrorField = document.querySelector(".field-error");
            if (firstErrorField) {
                firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            return false;
        }

        return true;
    };

    // Handle field blur to validate
    const handleBlur = (section, field, value) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        const error = validateField(section, field, value);
        setErrors(prev => ({ ...prev, [field]: error }));
    };

    // Update functions with validation on change
    const updateNewBooking = (field, value) => {
        setNewBooking(prev => ({ ...prev, [field]: value }));
        if (touched[field]) {
            const error = validateField('newBooking', field, value);
            setErrors(prev => ({ ...prev, [field]: error }));
        }
    };

    const updateClient = (field, value) => {
        setClient(prev => ({ ...prev, [field]: value }));
        if (touched[field]) {
            const error = validateField('client', field, value);
            setErrors(prev => ({ ...prev, [field]: error }));
        }
    };

    const updateAssociate = (field, value) => {
        setAssociate(prev => ({ ...prev, [field]: value }));
        if (touched[field]) {
            const error = validateField('associate', field, value);
            setErrors(prev => ({ ...prev, [field]: error }));
        }
    };

    const updatePayment = (field, value) => {
        setPayment(prev => ({ ...prev, [field]: value }));
        if (touched[field]) {
            const error = validateField('payment', field, value);
            setErrors(prev => ({ ...prev, [field]: error }));
        }
    };

    const openFileInNewTab = (file) => {
        if (!file) return;
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL, "_blank");
        setTimeout(() => URL.revokeObjectURL(fileURL), 1000);
    };

     const getUserId = () => {
        const stored = localStorage.getItem("userId") || localStorage.getItem("spendwise_userId");
        const parsed = stored ? Number(stored) : NaN;
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
      };
    useEffect(() => {
        getReraList();
    }, []);

    useEffect(() => {
        if (!isFromHoldBooking) return;

        const data = JSON.parse(localStorage.getItem('holdBookingData'));
        if (!data) return;

        setNewBooking(prev => ({
            ...prev,
            TownshipId: data.townshipId || "",
            PlotId: data.plotId || "",
            PlotNo: data.plotNo || "",
            PlotSize: data.plotSize || "",
        }));

        setAssociate(prev => ({
            ...prev,
            AssociateName: data.associateName || "",
            AssociateContactNo: data.associateContactNo || "",
            AssociateReraNo: data.associateReraNo || "",
            LeaderName: data.leaderName || "",
            LeaderContactNo: data.leaderContactNo || ""
        }));
        setReraSearch(data.associateReraNo || "");
        setDisabledFields({
            TownshipId: true,
            PlotNo: true,
            PlotSize: true,
            AssociateName: true,
            AssociateContactNo: true,
            AssociateReraNo: true,
            LeaderName: true,
            LeaderContactNo: true
        });

    }, [isFromHoldBooking]);

    const getReraList = async () => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.ASSOCIATE_LIST);
            const listData = Array.isArray(response.data)
                ? response.data
                : response.data?.value || response.data?.data || [];
            const formattedData = listData.filter((item) => item.reraNo);
            setReraList(formattedData);
        } catch (error) {
            console.error(error);
        }
    };

    const filteredReraList = reraSearch
        ? reraList.filter((item) =>
            item.reraNo?.toLowerCase().includes(reraSearch.toLowerCase())
        )
        : [];

    const filteredContactList = contactSearch
        ? reraList.filter((item) => {
            const contactDigits = item.contactNo?.replace(/\D/g, "");
            return contactDigits?.includes(contactSearch);
        })
        : [];

    const handleReraSelect = (item) => {
        setAssociate((prev) => ({
            ...prev,
            AssociateReraNo: item.reraNo || "",
            AssociateName: item.firstName || "",
            LeaderName: item.leaderName || "",
            LeaderContactNo: item.leaderContactNo
                ? item.leaderContactNo.replace(/\D/g, "").slice(-10)
                : "",
            AssociateContactNo: item.contactNo
                ? item.contactNo.replace(/\D/g, "").slice(-10)
                : ""
        }));
        setReraSearch(item.reraNo || "");
        setContactSearch(item.contactNo?.replace(/\D/g, "").slice(-10) || "");
        setShowReraDropdown(false);
        setShowContactDropdown(false);
    };

    const handleSaveBooking = useCallback(async (e) => {
        e.preventDefault();
        console.log("CLICKED SAVE BUTTON");
        const currentUserId = getUserId();
        // Mark all fields as touched
        const allFields = [
            'WorkflowTypeId', 'BookingDate', 'TownshipId', 'PlotNo', 'AgreementValue',
            'DocumentTypeId', 'File', 'ClientName', 'ClientContactNo', 'ClientAddress',
            'RelationType', 'RelationName', 'AssociateName', 'AssociateContactNo',
            'AssociateReraNo', 'LeaderName', 'LeaderContactNo', 'InitialAmount',
            'InitialPaymentDate', 'InitialReceiptMethod', 'InitialTransactionId',
            'InitialBankName', 'InitialReceiptImage'
        ];

        const touchedFields = {};
        allFields.forEach(field => touchedFields[field] = true);
        setTouched(touchedFields);

        // Validate form
        if (!validateForm()) {
    Swal.fire("Error", "Please fill all required fields correctly", "error");
    return;
}
  
        const totalAgreementValue = Number(newBooking.AgreementValue) * Number(newBooking.PlotSize) - Number(newBooking.Discount)* Number(newBooking.PlotSize);

        try {
            Swal.fire({ title: "Saving...", didOpen: () => Swal.showLoading() });

            const formData = new FormData();
            formData.append("BookingDate", newBooking.BookingDate);
            formData.append("WorkflowTypeId", newBooking.WorkflowTypeId);
            formData.append("TownshipId", newBooking.TownshipId);
            formData.append("PlotId", newBooking.PlotId);
            formData.append("PlotNo", newBooking.PlotNo);
            formData.append("PlotSize", newBooking.PlotSize);
            formData.append("AgreementValue", newBooking.AgreementValue);
            formData.append("TotalAgreementValue", totalAgreementValue);
            formData.append("Discount", Number(newBooking.Discount) || 0);
            formData.append("DocumentTypeId", newBooking.DocumentTypeId);
            if (newBooking.File) { formData.append("File", newBooking.File); }
            formData.append("ClientName", client.ClientName);
            formData.append("ClientContactNo", `${client.countryCode}${client.ClientContactNo}`);
            formData.append("ClientEmail", client.ClientEmail);
            formData.append("ClientAddress", client.ClientAddress);
            formData.append("RelationType", client.RelationType);
            formData.append("RelationName", client.RelationName);
            formData.append("AssociateName", associate.AssociateName);
            formData.append("AssociateContactNo", `${associate.countryCode}${associate.AssociateContactNo}`);
            formData.append("AssociateReraNo", associate.AssociateReraNo);
            formData.append("LeaderName", associate.LeaderName);
            formData.append("LeaderContactNo", `${associate.leaderCountryCode}${associate.LeaderContactNo}`);
            formData.append("InitialAmount", payment.InitialAmount);
            formData.append("InitialPaymentDate", payment.InitialPaymentDate);
            formData.append("InitialReceiptMethod", payment.InitialReceiptMethod);
            formData.append("InitialTransactionId", payment.InitialTransactionId);
            formData.append("InitialBankName", payment.InitialBankName);
            formData.append("InitialReceiptStatus", payment.InitialReceiptStatus);
            formData.append("InitialNotes", payment.InitialNotes);
            formData.append("InitialChequeNo", "-");
            formData.append("UserId",currentUserId);
            if (payment.InitialReceiptImage) {
                formData.append("InitialReceiptImage", payment.InitialReceiptImage);
            }

            await axiosInstance.post(API_ENDPOINTS.BOOKING_SAVE, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            Swal.fire("Success", "Booking Saved Successfully", "success")
                .then(() => {
                    localStorage.removeItem('holdBookingData');
                    navigate("/property");
                });

        } catch (error) {
    console.error(error);

    Swal.fire(
        "Error",
        error?.response?.data?.message || "Something went wrong",
        "error"
    );
}
    }, [newBooking, client, associate, payment, navigate]);

    const handleFileChange = (fileList, fieldName, isPayment = false) => {
        const file = fileList?.[0] || null;
        if (!file) return;

        if (!ALLOWED_FILE_REGEX.test(file.name)) {
            Swal.fire("Error", "Only JPG, JPEG, PNG or PDF files allowed", "error");
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            Swal.fire("Error", "File must be less than 5MB", "error");
            return;
        }

        if (isPayment) {
            updatePayment(fieldName, file);
        } else {
            updateNewBooking(fieldName, file);
        }

        if (touched[fieldName]) {
            const error = validateField(isPayment ? 'payment' : 'newBooking', fieldName, file);
            setErrors(prev => ({ ...prev, [fieldName]: error }));
        }
    };

    useEffect(() => {
        const fetchTownships = async () => {
            try {
                // const res = await axiosInstance.get(API_ENDPOINTS.TOWNSHIP_LIST+"?userId="+ getUserId());
                const res = await axiosInstance.get(API_ENDPOINTS.TOWNSHIP_LIST);
                const list = Array.isArray(res.data) ? res.data : (res.data?.value || []);
                setTownshipOptions(list);
            } catch (err) {
                console.error(err);
            }
        };
        fetchTownships();
    }, []);

    useEffect(() => {
        if (!newBooking.TownshipId) {
            setAvailablePlots([]);
            const holdBookingData = localStorage.getItem('holdBookingData');
            if (!holdBookingData) {
                updateNewBooking("PlotNo", "");
                updateNewBooking("PlotSize", "");
                updateNewBooking("PlotId", "");
            }
            return;
        }

        const fetchPlots = async () => {
            try {
                const response = await axiosInstance.get(API_ENDPOINTS.PLOTS_LIST, {
                    params: { townshipId: newBooking.TownshipId, status:1 }
                });

                let plots = [];
                if (Array.isArray(response.data)) {
                    plots = response.data;
                } else if (response.data?.value && Array.isArray(response.data.value)) {
                    plots = response.data.value;
                } else if (response.data?.data && Array.isArray(response.data.data)) {
                    plots = response.data.data;
                }

                // const availableOnly = plots.filter(p => {
                //     const status = (p.statusText || p.listType || "").toLowerCase();
                //     return status !== "booked" && status !== "sold" && status !== "hold";
                // });

                let finalPlots = [...plots];

                if (newBooking.PlotId) {
                    const selectedPlot = plots.find(
                        p => p.id === Number(newBooking.PlotId)
                    );
                    const alreadyExists = availableOnly.some(
                        p => p.id === Number(newBooking.PlotId)
                    );
                    if (selectedPlot && !alreadyExists) {
                        finalPlots.push(selectedPlot);
                    }
                }
                setAvailablePlots(finalPlots);

                if (newBooking.PlotId && !newBooking.PlotNo) {
                    const matchedPlot = finalPlots.find(
                        p => p.id === Number(newBooking.PlotId)
                    );
                    if (matchedPlot) {
                        updateNewBooking("PlotNo", matchedPlot.plotNo || matchedPlot.plotNumber || "");
                    }
                }
            } catch (err) {
                setAvailablePlots([]);
            }
        };

        fetchPlots();
    }, [newBooking.TownshipId]);

    const onlyDigits = useCallback((value) => String(value ?? "").replace(/\D/g, ""), []);
    const normalizeTenDigits = useCallback((value) => onlyDigits(value).slice(0, 10), [onlyDigits]);

    const calculateTotal = () => {
        const r = Number(newBooking.AgreementValue) -    Number(newBooking.Discount);;
        const s = Number(newBooking.PlotSize);

        if (!Number.isFinite(r) || !Number.isFinite(s) || r <= 0 || s <= 0) {
            return "";
        }

        const total = r * s;
        return `₹ ${total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
    };

    const handlePlotChange = (e) => {
        const selectedPlotNo = e.target.value;
        const selectedPlot = availablePlots.find(p =>
            String(p.plotNo || p.plotNumber || "") === String(selectedPlotNo)
        );
        updateNewBooking("PlotNo", selectedPlotNo);
        updateNewBooking("PlotSize", selectedPlot ? (selectedPlot.plotSize || selectedPlot.size || "") : "");
        updateNewBooking("PlotId", selectedPlot ? selectedPlot.id : "");
    };

    // Helper to check if field should show mandatory asterisk
    const isFieldMandatory = (section, field) => {
        const nonMandatoryFields = {
            newBooking: ['ClientEmail', 'PlotSize', 'TotalAgreementValue'],
            client: ['ClientEmail'],
            payment: ['InitialChequeNo', 'InitialNotes']
        };
        return !nonMandatoryFields[section]?.includes(field);
    };


    return (
        <BookingWrapper className="dashboard-container">
            {/* HEADER */}
            <div className="dashboard-header">
                <div className="dashboard-header-content">
                    <div className="dashboard-header-text">
                        <h2>Create New Booking</h2>
                        <p className="dashboard-subtitle">
                            Add a new booking with complete details
                        </p>
                    </div>
                </div>
                <div className="dashboard-header-actions">
                        <ReminderButton
                            size="small"
                            variant="outline"
                            onClick={() => setShowReminderPopup(true)}
                        />
                </div>
            </div>
            <form onSubmit={handleSaveBooking}>
            {/* BOOKING DETAILS */}
            <div className="card">
                <div className="form-section-header">
                    <h3>Booking Details</h3>
                </div>

                <div className="upload-loan-form-grid">
                    <FormField
                        label="Booking Type"
                        section="newBooking"
                        field="WorkflowTypeId"
                        touched={touched}
                        errors={errors}
                        isFieldMandatory={isFieldMandatory}
                    >
                        <select
                            value={newBooking.WorkflowTypeId}
                            onChange={(e) => updateNewBooking("WorkflowTypeId", e.target.value)}
                            onBlur={(e) => handleBlur('newBooking', 'WorkflowTypeId', e.target.value)}
                            className={`form-control ${touched.WorkflowTypeId && errors.WorkflowTypeId ? 'error' : ''}`}
                        >
                            <option value="">Select Booking Type</option>
                            <option value={1}>Loan</option>
                            <option value={2}>Without Loan</option>
                            <option value={3}>7 Days Close</option>
                        </select>
                    </FormField>

                    <FormField
                        label="Booking Date"
                        section="newBooking"
                        field="BookingDate"
                        touched={touched}
                        errors={errors}
                        isFieldMandatory={isFieldMandatory}
                    >
                        <input
                            type="date"
                            value={newBooking.BookingDate}
                            onChange={(e) => updateNewBooking("BookingDate", e.target.value)}
                            onBlur={(e) => handleBlur('newBooking', 'BookingDate', e.target.value)}
                            className={`form-control ${touched.BookingDate && errors.BookingDate ? 'error' : ''}`}
                        />
                    </FormField>

                    <FormField
                        label="Township Name"
                        section="newBooking"
                        field="TownshipId"
                        touched={touched}
                        errors={errors}
                        isFieldMandatory={isFieldMandatory}
                    >
                        <select
                            disabled={!newBooking.WorkflowTypeId || disabledFields.TownshipId}
                            value={newBooking.TownshipId}
                            onChange={(e) => updateNewBooking("TownshipId", e.target.value)}
                            onBlur={(e) => handleBlur('newBooking', 'TownshipId', e.target.value)}
                            className={`form-control ${touched.TownshipId && errors.TownshipId ? 'error' : ''}`}
                        >
                            <option value="">Select Township</option>
                            {townshipOptions.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </FormField>

                    <FormField
                        label="Plot Number"
                        section="newBooking"
                        field="PlotNo"
                        touched={touched}
                        errors={errors}
                        isFieldMandatory={isFieldMandatory}
                    >
                        <select
                            disabled={!newBooking.TownshipId || disabledFields.PlotNo}
                            value={newBooking.PlotNo}
                            onChange={handlePlotChange}
                            onBlur={() => handleBlur('newBooking', 'PlotNo', newBooking.PlotNo)}
                            className={`form-control ${touched.PlotNo && errors.PlotNo ? 'error' : ''}`}
                        >
                             <option value="">
                                {!newBooking.TownshipId
                                    ? "Select township first"
                                    : availablePlots.length === 0
                                    ? "No Plot Available"      
                                    : "Select Plot"}
                                </option>
                            {availablePlots.map((p) => (
                                <option key={p.id} value={p.plotNo || p.plotNumber}>
                                    {p.plotNo || p.plotNumber} ({p.plotSize || p.size || "N/A"} SqYrds)
                                </option>
                            ))}
                        </select>
                    </FormField>

                    <FormField
                        label="Plot Size(Sq.Yds)"
                        section="newBooking"
                        field="PlotSize"
                        showAsterisk={false}
                        touched={touched}
                        errors={errors}
                        isFieldMandatory={isFieldMandatory}
                    >
                        <input
                            disabled={disabledFields.PlotSize}
                            type="number"
                            value={newBooking.PlotSize}
                            placeholder="plot size"
                            readOnly
                            className="form-control"
                        />
                    </FormField>

                    <FormField
                        label="Agreement Rate( Per Sq.Yds)"
                        section="newBooking"
                        field="AgreementValue"
                        touched={touched}
                        errors={errors}
                        isFieldMandatory={isFieldMandatory}
                    >
                        <input
                        type="text"
                        value={newBooking.AgreementValue}
                        onChange={(e) => {
                            let value = e.target.value;

                            // allow digits and one decimal point
                            if (/^\d*\.?\d*$/.test(value)) {
                            updateNewBooking("AgreementValue", value);
                            }
                        }}
                        onBlur={(e) =>
                            handleBlur("newBooking", "AgreementValue", e.target.value)
                        }
                        placeholder="agreement rate"
                        inputMode="decimal"
                        className={`form-control ${
                            touched.AgreementValue && errors.AgreementValue ? "error" : ""
                        }`}
                        />
                    </FormField>
                                <FormField
                                label="Discount(Per Sq.Yds)"
                                section="newBooking"
                                field="Discount"
                                showAsterisk={false}
                                touched={touched}
                                errors={errors}
                                >
                                <input
                                    type="text"
                                    value={newBooking.Discount}
                                    onChange={(e) => {
                                    const value = e.target.value;

                                    // allow numbers with max 2 decimal
                                    if (/^\d*\.?\d{0,2}$/.test(value)) {
                                        updateNewBooking("Discount", value);
                                    }
                                    }}
                                    onBlur={() => {
                                    if (!newBooking.Discount || newBooking.Discount === "") {
                                        updateNewBooking("Discount", 0);
                                    }
                                    }}
                                    placeholder="0"
                                    inputMode="decimal"
                                    className="form-control"
                                />
                                </FormField>
                    <FormField
                        label="Total Agreement Value"
                        section="newBooking"
                        field="TotalAgreementValue"
                        showAsterisk={false}
                        touched={touched}
                        errors={errors}
                        isFieldMandatory={isFieldMandatory}
                    >
                        <input
                            type="text"
                            value={calculateTotal()}
                            placeholder="Total Value i.e Agreement Rate * Plot Size"
                            readOnly
                            className="form-control"
                        />
                    </FormField>

                 

                    <FormField
                        label="ID Type"
                        section="newBooking"
                        field="DocumentTypeId"
                        touched={touched}
                        errors={errors}
                        
                    >
                        <select
                            value={newBooking.DocumentTypeId}
                            onChange={(e) => updateNewBooking("DocumentTypeId", e.target.value)}
                            
                            className= "form-control"
                        >
                            <option value="">Select ID Type</option>
                            <option value={1}>Aadhar Card</option>
                            <option value={2}>PAN Card</option>
                        </select>
                    </FormField>

                    <FormField
                        label="Upload ID Proof"
                        section="newBooking"
                        field="File"
                        touched={touched}
                        errors={errors}
                        
                    >
                        <div className="file-upload-row">
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                className={`form-control ${touched.File && errors.File ? 'error' : ''}`}
                                onChange={(e) => handleFileChange(e.target.files, "File")}
                            />
                            {newBooking.File && (
                                <button type="button" className="primary-btn" onClick={() => openFileInNewTab(newBooking.File)}>
                                    Preview
                                </button>
                            )}
                        </div>
                    </FormField>
                </div>
            </div>

            {/* PAYMENT INFO */}
            <div className="card">
                <div className="form-section-header">
                    <h3>Payment Information</h3>
                </div>

                <div className="booking-form-grid">
                    <FormField
                        label="Booking Amount"
                        section="payment"
                        field="InitialAmount"
                        touched={touched}
                        errors={errors}
                        isFieldMandatory={isFieldMandatory}
                    >
                        <input
                            type="text"
                            value={payment.InitialAmount}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, "");
                                if (value === "" || (Number(value) >= 0 && !value.includes('-'))) {
                                    updatePayment("InitialAmount", value);
                                }
                            }}
                            onBlur={(e) => handleBlur('payment', 'InitialAmount', e.target.value)}
                            min="0.01"
                            step="0.01"
                            placeholder="booking amount"
                            className={`form-control ${touched.InitialAmount && errors.InitialAmount ? 'error' : ''}`}
                        />
                    </FormField>

                    <FormField
                        label="Receipt Date"
                        section="payment"
                        field="InitialPaymentDate"
                        touched={touched}
                        errors={errors}
                        isFieldMandatory={isFieldMandatory}
                    >
                        <input
                            type="date"
                            value={payment.InitialPaymentDate}
                            onChange={(e) => updatePayment("InitialPaymentDate", e.target.value)}
                            onBlur={(e) => handleBlur('payment', 'InitialPaymentDate', e.target.value)}
                            className={`form-control ${touched.InitialPaymentDate && errors.InitialPaymentDate ? 'error' : ''}`}
                        />
                    </FormField>

                    <FormField
                        label="Payment Method"
                        section="payment"
                        field="InitialReceiptMethod"
                        touched={touched}
                        errors={errors}
                        isFieldMandatory={isFieldMandatory}
                    >
                        <select
                            value={payment.InitialReceiptMethod}
                            onChange={(e) => updatePayment("InitialReceiptMethod", e.target.value)}
                            onBlur={(e) => handleBlur('payment', 'InitialReceiptMethod', e.target.value)}
                            className={`form-control ${touched.InitialReceiptMethod && errors.InitialReceiptMethod ? 'error' : ''}`}
                        >
                            <option value="">Select Payment Method</option>
                            {paymentModes.map((mode) => (
                                <option key={mode.value} value={mode.value}>{mode.label}</option>
                            ))}
                        </select>
                    </FormField>

                    <FormField
                        label="Transaction ID / Cheque No."
                        section="payment"
                        field="InitialTransactionId"
                        touched={touched}
                        errors={errors}
                        isFieldMandatory={isFieldMandatory}
                    >
                        <input
                            type="text"
                            value={payment.InitialTransactionId}
                            onChange={(e) =>
                                updatePayment(
                                    "InitialTransactionId",
                                    e.target.value.replace(/[^a-zA-Z0-9]/g, "")
                                )
                            }
                            onBlur={(e) =>
                                handleBlur("payment", "InitialTransactionId", e.target.value)
                            }
                            placeholder="transaction ID or cheque number"
                            className={`form-control ${
                                touched.InitialTransactionId && errors.InitialTransactionId
                                    ? "error"
                                    : ""
                            }`}
                        />
                    </FormField>

                    <FormField
  label="Bank Name"
  section="payment"
  field="InitialBankName"
  touched={touched}
  errors={errors}
  isFieldMandatory={isFieldMandatory}
>
  <select
    value={payment.InitialBankName || ""}
    onChange={(e) =>
      updatePayment("InitialBankName", e.target.value)
    }
    onBlur={(e) =>
      handleBlur("payment", "InitialBankName", e.target.value)
    }
    className={`form-control ${
      touched.InitialBankName && errors.InitialBankName ? "error" : ""
    }`}
  >
    <option value="">Select Bank</option>

    {bankList.map((bank) => (
      <option key={bank.id} value={bank.bankName}>
        {bank.name}
      </option>
    ))}
  </select>
</FormField>

                    <FormField
                        label="Upload Receipt/ Cheque"
                        section="payment"
                        field="InitialReceiptImage"
                        touched={touched}
                        errors={errors}
                        isFieldMandatory={isFieldMandatory}
                    >
                        <div className="file-upload-row">
                            <input
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={(e) => handleFileChange(e.target.files, "InitialReceiptImage", true)}
                                onBlur={() => handleBlur('payment', 'InitialReceiptImage', payment.InitialReceiptImage)}
                                className={`form-control ${touched.InitialReceiptImage && errors.InitialReceiptImage ? 'error' : ''}`}
                            />
                            {payment.InitialReceiptImage && (
                                <button type="button" className="primary-btn" onClick={() => openFileInNewTab(payment.InitialReceiptImage)}>
                                    Preview
                                </button>
                            )}
                        </div>
                    </FormField>
                </div>
            </div>

            {/* CLIENT INFO */}
            
                <div className="card">
                    <div className="form-section-header">
                        <h3>Client Information</h3>
                    </div>

                    <div className="booking-form-grid">
                        <FormField
                            label="Name"
                            section="client"
                            field="ClientName"
                            touched={touched}
                            errors={errors}
                            isFieldMandatory={isFieldMandatory}
                        >
                            <input
                                type="text"
                                value={client.ClientName}
                                onChange={(e) => updateClient("ClientName", e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
                                onBlur={(e) => handleBlur('client', 'ClientName', e.target.value)}
                                placeholder="client name"
                                className={`form-control ${touched.ClientName && errors.ClientName ? 'error' : ''}`}
                            />
                        </FormField>

                        <FormField
                            label="S/O , D/O , W/O , C/O"
                            section="client"
                            field="RelationType"
                            touched={touched}
                            errors={errors}
                            isFieldMandatory={isFieldMandatory}
                        >
                            <div style={{ display: "flex", gap: "8px" }}>
                                <select
                                    value={client.RelationType}
                                    onChange={(e) => updateClient("RelationType", e.target.value)}
                                    onBlur={(e) => handleBlur('client', 'RelationType', e.target.value)}
                                    style={{ width: "90px" }}
                                    className={`form-control ${touched.RelationType && errors.RelationType ? 'error' : ''}`}
                                >
                                    <option value="">Select</option>
                                    {relationOptions.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    value={client.RelationName}
                                    onChange={(e) => updateClient("RelationName", e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
                                    onBlur={(e) => handleBlur('client', 'RelationName', e.target.value)}
                                    placeholder="relative name"
                                    style={{ flex: 1 }}
                                    className={`form-control ${touched.RelationName && errors.RelationName ? 'error' : ''}`}
                                />
                            </div>
                        </FormField>

                        <FormField
                            label="Email"
                            section="client"
                            field="ClientEmail"
                            showAsterisk={false}
                            touched={touched}
                            errors={errors}
                            isFieldMandatory={isFieldMandatory}
                        >
                            <input
                                type="email"
                                value={client.ClientEmail}
                                onChange={(e) => updateClient("ClientEmail", e.target.value)}
                                onBlur={(e) => handleBlur('client', 'ClientEmail', e.target.value)}
                                placeholder="email address"
                                className={`form-control ${touched.ClientEmail && errors.ClientEmail ? 'error' : ''}`}
                            />
                        </FormField>

                        <FormField
                            label="Contact No"
                            section="client"
                            field="ClientContactNo"
                            touched={touched}
                            errors={errors}
                           
                        >
                            <div style={{ display: "flex", gap: "8px" }}>
                                <select
                                    disabled
                                    value={client.countryCode}
                                    style={{ width: "120px" }}
                                    className="form-control"
                                >
                                    {countryCodeOptions.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                                <input
                                    type="tel"
                                    value={client.ClientContactNo}
                                    onChange={(e) => updateClient("ClientContactNo", normalizeTenDigits(e.target.value))}
                                    maxLength={10}
                                    placeholder="Contact No"
                                    className={`form-control ${touched.ClientContactNo && errors.ClientContactNo ? 'error' : ''}`}
                                />
                            </div>
                        </FormField>

                        <FormField
                            label="Address"
                            section="client"
                            field="ClientAddress"
                            touched={touched}
                            errors={errors}
                           
                        >
                            <textarea
                                value={client.ClientAddress}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (!/^[a-zA-Z0-9\s]*$/.test(value)) return;
                                    if (value.length === 1 && value === " ") return;
                                    updateClient("ClientAddress", value);
                                }}
                                placeholder="complete address"
                                className={`form-control ${touched.ClientAddress && errors.ClientAddress ? 'error' : ''}`}
                            />
                        </FormField>
                    </div>
                </div>

                {/* ASSOCIATE INFO */}
                <div className="card">
                    <div className="form-section-header">
                        <h3>Associate Information</h3>
                    </div>

                    <div className="booking-form-grid">
                        <FormField
                            label="RERA No"
                            section="associate"
                            field="AssociateReraNo"
                            touched={touched}
                            errors={errors}
                            isFieldMandatory={isFieldMandatory}
                        >
                            <div style={{ position: "relative" }}>
                                <input
                                    type="text"
                                    disabled={disabledFields.AssociateReraNo}
                                    placeholder="Search by RERA No"
                                    value={reraSearch}
                                    onChange={(e) => {
                                        setReraSearch(e.target.value);
                                        setShowReraDropdown(true);
                                        setShowContactDropdown(false);
                                        updateAssociate("AssociateReraNo", e.target.value);
                                        if (e.target.value === "") {
                                            setShowReraDropdown(false);
                                            setShowContactDropdown(false);
                                        }
                                    }}
                                    onBlur={() => {
                                        setTimeout(() => {
                                            setShowReraDropdown(false);
                                            setShowContactDropdown(false);
                                        }, 150);
                                        handleBlur('associate', 'AssociateReraNo', associate.AssociateReraNo);
                                    }}
                                    className={`form-control ${touched.AssociateReraNo && errors.AssociateReraNo ? 'error' : ''}`}
                                />
                                {showReraDropdown && (
                                    <div className="rera-dropdown">
                                        {filteredReraList.length > 0 ? (
                                            filteredReraList.map((item) => (
                                                <div
                                                    key={item.id}
                                                    tabIndex={-1}
                                                    className="rera-dropdown-item"
                                                    onMouseDown={() => {
                                                        handleReraSelect(item);
                                                        setShowReraDropdown(false);
                                                        handleBlur('associate', 'AssociateReraNo', item.reraNo);
                                                    }}
                                                >
                                                    {item.reraNo}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="rera-dropdown-item no-result">
                                                No result matching your search "{reraSearch}"
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </FormField>

                        <FormField
                            label="Associate Name"
                            section="associate"
                            field="AssociateName"
                            touched={touched}
                            errors={errors}
                            isFieldMandatory={isFieldMandatory}
                        >
                            <input
                                type="text"
                                readOnly
                                disabled={disabledFields.AssociateName}
                                value={associate.AssociateName}
                                onChange={(e) => updateAssociate("AssociateName", e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
                                // onBlur={(e) => handleBlur('associate', 'AssociateName', e.target.value)}
                                placeholder="associate name"
                                className={`form-control ${touched.AssociateName && errors.AssociateName ? 'error' : ''}`}
                            />
                        </FormField>

                        <FormField
                            label="Contact"
                            section="associate"
                            field="AssociateContactNo"
                            touched={touched}
                            errors={errors}
                            isFieldMandatory={isFieldMandatory}
                        >
                            <div style={{ display: "flex", gap: "8px", position: "relative" }}>
                                <select
                                    disabled
                                    value={associate.countryCode}
                                    style={{ width: "120px" }}
                                    className="form-control"
                                    readOnly
                                >
                                    {countryCodeOptions.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>

                                <div style={{ position: "relative", flex: 1 }}>
                                    <input
                                        type="tel"
                                        readOnly
                                        value={associate.AssociateContactNo}
                                        disabled={disabledFields.AssociateContactNo}
                                        onChange={(e) => {
                                            const value = normalizeTenDigits(e.target.value);
                                            updateAssociate("AssociateContactNo", value);
                                            setContactSearch(value);
                                            setShowContactDropdown(true);
                                            setShowReraDropdown(false);
                                            if (value === "") {
                                                setShowContactDropdown(false);
                                                setShowReraDropdown(false);
                                            }
                                        }}
                                        onBlur={() => {
                                            setTimeout(() => {
                                                setShowReraDropdown(false);
                                                setShowContactDropdown(false);
                                            }, 150);
                                            handleBlur('associate', 'AssociateContactNo', associate.AssociateContactNo);
                                        }}
                                        maxLength={10}
                                        placeholder="Contact No"
                                        className={`form-control ${touched.AssociateContactNo && errors.AssociateContactNo ? 'error' : ''}`}
                                    />

                                    {showContactDropdown && (
                                        <div className="rera-dropdown">
                                            {filteredContactList.length > 0 ? (
                                                filteredContactList.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        tabIndex={-1}
                                                        className="rera-dropdown-item"
                                                        onMouseDown={() => {
                                                            handleReraSelect(item);
                                                            setShowContactDropdown(false);
                                                            handleBlur('associate', 'AssociateContactNo', item.contactNo);
                                                        }}
                                                    >
                                                        {item.contactNo}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="rera-dropdown-item no-result">
                                                    No result matching your search "{contactSearch}"
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </FormField>

                        <FormField
                            label="Leader Name"
                            section="associate"
                            field="LeaderName"
                            touched={touched}
                            errors={errors}
                            isFieldMandatory={isFieldMandatory}
                        >
                            <input
                                type="text"
                                value={associate.LeaderName}
                                disabled={disabledFields.LeaderName}
                                onChange={(e) => updateAssociate("LeaderName", e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
                                onBlur={(e) => handleBlur('associate', 'LeaderName', e.target.value)}
                                placeholder="leader name"
                                className={`form-control ${touched.LeaderName && errors.LeaderName ? 'error' : ''}`}
                                readOnly
                            />
                        </FormField>

                        <FormField
                            label="Leader Contact"
                            section="associate"
                            field="LeaderContactNo"
                            touched={touched}
                            errors={errors}
                            isFieldMandatory={isFieldMandatory}
                        >
                            <div style={{ display: "flex", gap: "8px" }}>
                                <select
                                    disabled
                                    value={associate.leaderCountryCode}
                                    style={{ width: "120px" }}
                                    className="form-control"
                                >
                                    {countryCodeOptions.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                                <input
                                    type="tel"
                                    disabled={disabledFields.LeaderContactNo}
                                    value={associate.LeaderContactNo}
                                    onChange={(e) => updateAssociate("LeaderContactNo", normalizeTenDigits(e.target.value))}
                                    onBlur={(e) => handleBlur('associate', 'LeaderContactNo', e.target.value)}
                                    maxLength={10}
                                    placeholder="Contact No"
                                    className={`form-control ${touched.LeaderContactNo && errors.LeaderContactNo ? 'error' : ''}`}
                                    readOnly
                                />
                            </div>
                        </FormField>
                    </div>

                    <div className="booking-form-actions">
                        <button type="submit" className="primary-btn">
                            Save Booking
                        </button>
                    </div>
                </div>
            </form>
             <ReminderPopup 
                             isOpen={showReminderPopup}
                             onClose={() => setShowReminderPopup(false)}
                             title="Create Reminder"
                            //  bookingId={id}
                         />
        </BookingWrapper>
    );
}