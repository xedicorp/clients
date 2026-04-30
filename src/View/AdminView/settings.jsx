import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Swal from 'sweetalert2';
import API_ENDPOINTS from "../../utilities/apiConfig";
import axiosInstance from "../../utilities/axiosInstance";
import "./settings.css";
import PropertyNavigation from "../../View/Property/PropertyNavigation";
import BookingWrapper from "../../View/Property/style";

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
        Discount: "",
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

    const [townshipOptions, setTownshipOptions] = useState([]);
    const [reraList, setReraList] = useState([]);
    const [availablePlots, setAvailablePlots] = useState([]);
    const [reraSearch, setReraSearch] = useState("");
    const [contactSearch, setContactSearch] = useState("");
    const [showReraDropdown, setShowReraDropdown] = useState(false);
    const [showContactDropdown, setShowContactDropdown] = useState(false);
    const [bankList, setBankList] = useState([]);

    const ALLOWED_FILE_REGEX = /\.(jpg|jpeg|png)$/i;
    const MAX_FILE_SIZE = 20 * 1024 * 1024;
    const [settingsData, setSettingsData] = useState({
    plotSold: "",
    amount: ""
});


  // fetch banks
  const fetchBanks = async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.BANK_LIST);

      const raw = response?.data;

      const banks = Array.isArray(raw)
        ? raw
        : raw?.value || raw?.data || [];

      setBankList(banks);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);
const [bankAccounts, setBankAccounts] = useState([]);
const [showBankModal, setShowBankModal] = useState(false);
const [bankForm, setBankForm] = useState({
  name: "",
  accountNumber: "",
  bankName: "",
  ifsc: ""
});
const [editIndex, setEditIndex] = useState(null);
const openAddModal = () => {
  setBankForm({
    name: "",
    accountNumber: "",
    bankName: "",
    ifsc: ""
  });
  setEditIndex(null);
  setShowBankModal(true);
};

const openEditModal = (index) => {
  setBankForm(bankAccounts[index]);
  setEditIndex(index);
  setShowBankModal(true);
};

useEffect(() => {
    fetchSettings();
}, []);

const fetchSettings = async () => {
    try {
        const res = await axiosInstance.get(API_ENDPOINTS.SETTING_GET_ALL);

        const list = Array.isArray(res.data) ? res.data : [];

        const plotSold = list.find(x => x.key === "plotSold")?.value || "";
        const amount = list.find(x => x.key === "amount")?.value || "";

        const bankAccountsRaw = list.find(x => x.key === "bankAccounts")?.value;

setBankAccounts(bankAccountsRaw ? JSON.parse(bankAccountsRaw) : []);

        setSettingsData({
            plotSold,
            amount
        });

    } catch (err) {
        console.error(err);
    }
};

const handleSaveSettings = async () => {
    if (!settingsData.plotSold || !settingsData.amount) {
        Swal.fire("Error", "Both fields are required", "error");
        return;
    }

    try {
        Swal.fire({ title: "Saving...", didOpen: () => Swal.showLoading() });

        // 🔥 2 ta alada API call
        await axiosInstance.post(API_ENDPOINTS.SETTING_SAVE, {
            key: "plotSold",
            value: settingsData.plotSold
        });

        await axiosInstance.post(API_ENDPOINTS.SETTING_SAVE, {
            key: "amount",
            value: settingsData.amount
        });

        Swal.fire("Success", "Settings saved", "success");

    } catch (err) {
        console.log(err?.response); // 🔥 important debug
        Swal.fire("Error", err?.response?.data || "Failed to save settings", "error");
    }
};

    
  const [receiptPreview, setReceiptPreview] = useState(null);
    // Field validation rules
    const validateField = (section, field, value) => {
        // Fields that should NOT be mandatory
        const nonMandatoryFields = {
            newBooking: ['ClientEmail', 'PlotSize', 'TotalAgreementValue'],
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
                DocumentTypeId: "ID Type",
                File: "ID Proof",
                ClientName: "Client Name",
                ClientContactNo: "Contact Number",
                ClientAddress: "Address",
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
        if (field === 'ClientContactNo' && value.length !== 10) {
            return "Contact number must be 10 digits";
        }
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
        const bookingFields = ['WorkflowTypeId', 'BookingDate', 'TownshipId', 'PlotNo', 'AgreementValue', 'Discount', 'DocumentTypeId', 'File'];
        bookingFields.forEach(field => {
            const error = validateField('newBooking', field, newBooking[field]);
            if (error) newErrors[field] = error;
        });

        // Client section validation
        const clientFields = ['ClientName', 'ClientContactNo', 'ClientAddress', 'RelationType', 'RelationName'];
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

    useEffect(() => {
        getReraList();
    }, []);

    useEffect(() => {
        if (!isFromHoldBooking) return;
        const data = JSON.parse(localStorage.getItem('holdBookingData'));
        if (!data) return;
        // ... rest of your hold booking logic
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
            return;
        }

        const totalAgreementValue = Number(newBooking.AgreementValue) * Number(newBooking.PlotSize);

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
            formData.append("Discount", newBooking.Discount);
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
            Swal.fire("Error", error.message || "Failed", "error");
        }
    }, [newBooking, client, associate, payment, navigate]);

    const handleFileChange = (fileList, fieldName, isPayment = false) => {
        const file = fileList?.[0] || null;
        if (!file) return;

        if (!ALLOWED_FILE_REGEX.test(file.name)) {
            Swal.fire("Error", "Only JPG, JPEG, PNG  files allowed", "error");
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            Swal.fire("Error", "File must be less than 5MB", "error");
            return;
        }

       
    };

    useEffect(() => {
        const fetchTownships = async () => {
            try {
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
                    params: { townshipId: newBooking.TownshipId }
                });

                let plots = [];
                if (Array.isArray(response.data)) {
                    plots = response.data;
                } else if (response.data?.value && Array.isArray(response.data.value)) {
                    plots = response.data.value;
                } else if (response.data?.data && Array.isArray(response.data.data)) {
                    plots = response.data.data;
                }

                const availableOnly = plots.filter(p => {
                    const status = (p.status || p.listType || "").toLowerCase();
                    return status !== "booked" && status !== "sold" && status !== "hold";
                });

                let finalPlots = [...availableOnly];

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
        const r = Number(newBooking.AgreementValue);
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
const handleBankSubmit = async (e) => {
  e.preventDefault();

  if (!bankForm.name || !bankForm.accountNumber || !bankForm.bankName) {
    Swal.fire("Error", "All fields required", "error");
    return;
  }

  const isEdit = editIndex !== null;

  const result = await Swal.fire({
    title: isEdit ? "Update Bank?" : "Add Bank?",
    text: isEdit
      ? "Do you want to update this bank details?"
      : "Do you want to add this bank?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: isEdit ? "Yes, Update" : "Yes, Add",
    cancelButtonText: "Cancel"
  });

  if (!result.isConfirmed) return;

  try {
    Swal.fire({ title: "Saving...", didOpen: () => Swal.showLoading() });

    let updated;

    if (isEdit) {
      updated = [...bankAccounts];
      updated[editIndex] = bankForm;
    } else {
      updated = [...bankAccounts, bankForm];
    }

    setBankAccounts(updated);

    await axiosInstance.post(API_ENDPOINTS.SETTING_SAVE, {
      key: "bankAccounts",
      value: JSON.stringify(updated)
    });

    Swal.fire(
      "Success",
      isEdit ? "Bank updated successfully" : "Bank added successfully",
      "success"
    );

    setShowBankModal(false);

  } catch (err) {
    Swal.fire(
      "Error",
      err?.response?.data || "Something went wrong",
      "error"
    );
  }
};
  

const handleDelete = (index) => {
  Swal.fire({
    title: "Confirm Deletion",
    text: "Are you sure you want to delete this bank account?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!"
  }).then(async (result) => {
    if (result.isConfirmed) {
      const updated = bankAccounts.filter((_, i) => i !== index);
      setBankAccounts(updated);
        await axiosInstance.post(API_ENDPOINTS.SETTING_SAVE, {
        key: "bankAccounts",
        value: JSON.stringify(updated)
        });

      Swal.fire("Deleted!", "Bank account removed", "success");
    }
  });
};



    return (
        <BookingWrapper className="dashboard-container">
            {/* HEADER */}
            <div className="dashboard-header">
                <div className="dashboard-header-content">
                    <div className="dashboard-header-text">
                        <h2>Settings</h2>
                        <p className="dashboard-subtitle">
                            Manage settings
                        </p>
                    </div>
                </div>
                <div className="dashboard-header-actions">
                    <PropertyNavigation hideHealthButton hideNewBookingButton />
                </div>
            </div>


    {/* Email Settings */}
            <div className="card">
                <div className="form-section-header">
                    <h3>Company Information</h3>
                </div>

                <div className="upload-loan-form-grid mb-2">
                     
                    

                   

                    <FormField
                        label="Company Name"
                        section="newBooking"
                        field="PlotSize"
                        showAsterisk={false}
                        touched={touched}
                        errors={errors}
                        isFieldMandatory={isFieldMandatory}
                    >
                        <input
                            disabled={isFromHoldBooking}
                            type="text"
                            value={newBooking.PlotSize}
                            placeholder="Company Name"
                           
                            className="form-control"
                        />
                    </FormField>

                    

                    <FormField
                        label="Address"
                        section="newBooking"
                        field="TotalAgreementValue"
                        showAsterisk={false}
                        touched={touched}
                        errors={errors}
                        isFieldMandatory={isFieldMandatory}
                    >
                        <input
                            disabled={isFromHoldBooking}
                            type="text"
                            value={calculateTotal()}
                            placeholder="Company Address"
                         
                            className="form-control"
                        />
                    </FormField>

                    <FormField
                        label="GST No"
                        section="newBooking"
                        field="Discount"
                        showAsterisk={false}
                        touched={touched}
                        errors={errors}
                        isFieldMandatory={isFieldMandatory}
                    >
                        <input
                            disabled={isFromHoldBooking}
                            type="text"
                            value={newBooking.Discount}
                            onChange={(e) => updateNewBooking("Discount", e.target.value)}
                            placeholder="GST No"
                            className="form-control"
                        />
                    </FormField>

                  
                </div>
                 <div className="ocr-file-upload-section w-50">
                                <label className="mb-2">
                                   Logo
                                </label>
                                <div className="file-item-wrapper">
                                    <label className="upload-box">
                                        <span className="upload-text">Click to Upload</span>

                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e.target.files)}
                                            className='form-control'
                                        />
                                    </label>


                                    <div className="file-preview-box">
                                        {receiptPreview ? (
                                            isPdf(paymentReceiptsFile || receiptPreview) ? (
                                                <div className="pdf-preview-box">
                                                    <button
                                                        className="pdf-preview-btn"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            window.open(receiptPreview, "_blank");
                                                        }}
                                                    >
                                                        Preview PDF
                                                    </button>
                                                </div>
                                            ) : (
                                                <img
                                                    src={receiptPreview}
                                                    alt="receipt"
                                                    className="preview-image"
                                                />
                                            )
                                        ) : (
                                            <div className="empty-preview">No file selected</div>
                                        )}
                                    </div>
                                </div>
                            </div>
            </div>

            {/* Email Settings */}
            <div className="card">
                <div className="form-section-header">
                    <h3>Email Setting</h3>
                </div>

                <div className="upload-loan-form-grid">
                     
                    

                   

                    <FormField
                        label="SMTP Server"
                        section="newBooking"
                        field="PlotSize"
                        showAsterisk={false}
                        touched={touched}
                        errors={errors}
                        isFieldMandatory={isFieldMandatory}
                    >
                        <input
                            disabled={isFromHoldBooking}
                            type="text"
                            value={newBooking.PlotSize}
                            placeholder="SMTP Server"
                           
                            className="form-control"
                        />
                    </FormField>

                    

                    <FormField
                        label="Port"
                        section="newBooking"
                        field="TotalAgreementValue"
                        showAsterisk={false}
                        touched={touched}
                        errors={errors}
                        isFieldMandatory={isFieldMandatory}
                    >
                        <input
                            disabled={isFromHoldBooking}
                            type="text"
                            value={calculateTotal()}
                            placeholder="Port No"
                           
                            className="form-control"
                        />
                    </FormField>

                    <FormField
                        label="User Id"
                        section="newBooking"
                        field="Discount"
                        showAsterisk={false}
                        touched={touched}
                        errors={errors}
                        isFieldMandatory={isFieldMandatory}
                    >
                        <input
                            disabled={isFromHoldBooking}
                            type="text"
                            value={newBooking.Discount}
                            onChange={(e) => updateNewBooking("Discount", e.target.value)}
                            placeholder="User Id"
                            className="form-control"
                        />
                    </FormField>

                       <FormField
                        label="Password"
                        section="newBooking"
                        field="Discount"
                        showAsterisk={false}
                        touched={touched}
                        errors={errors}
                        isFieldMandatory={isFieldMandatory}
                    >
                        <input
                            disabled={isFromHoldBooking}
                            type="text"
                            value={newBooking.Discount}
                            onChange={(e) => updateNewBooking("Discount", e.target.value)}
                            placeholder="Password"
                            className="form-control"
                        />
                    </FormField>
                  
                </div>
            </div>

             {/* Other Settings */}
            <div className="card">
                <div className="form-section-header">
                    <h3>Most valued associate setting</h3>
                </div>

                <div className="upload-loan-form-grid align-items-end"> 
                    <FormField
                        label="Number of plots Sold"
                        section="newBooking"
                        field="PlotSize"
                        showAsterisk={false}
                        touched={touched}
                        errors={errors}
                        isFieldMandatory={isFieldMandatory}
                    >
                        <input
                            disabled={isFromHoldBooking}
                            type="text"
                           value={settingsData.plotSold}
                            onChange={(e) =>
                                setSettingsData(prev => ({
                                    ...prev,
                                    plotSold: e.target.value
                                }))
                            }
                            placeholder="Number of plots Sold"
                           
                            className="form-control"
                        />
                    </FormField>

                    

                    <FormField
                        label="Amount of   plots sold"
                        section="newBooking"
                        field="TotalAgreementValue"
                        showAsterisk={false}
                        touched={touched}
                        errors={errors}
                        isFieldMandatory={isFieldMandatory}
                    >
                        <input
                            disabled={isFromHoldBooking}
                            type="text"
                            value={settingsData.amount}
                            onChange={(e) =>
                                setSettingsData(prev => ({
                                    ...prev,
                                    amount: e.target.value
                                }))
                            }
                            placeholder="Amount of   plots sold"
                           
                            className="form-control"
                        />
                    </FormField> 

                    <div>
    <button className="primary-btn" onClick={handleSaveSettings}>
        Save Settings
    </button>
</div>
                </div>
            </div>
            <div className="card">
                    <div className="form-section-header d-flex justify-content-between align-items-center">
  <h3>Company Bank Details</h3>

  <button className="primary-btn" onClick={openAddModal}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="16" />
                            <line x1="8" y1="12" x2="16" y2="12" />
                        </svg>
                         Add Bank
  </button>
</div>
                    {/* <div className="row">
                        <div className="col-md-6">
                            <div className="form-group">
                                <label>Account Name</label>
                                <input
  type="text"
  className="form-control"
  placeholder="Account Holder Name"
  value={bankForm.name}
  onChange={(e) =>
    setBankForm(prev => ({ ...prev, name: e.target.value }))
  }
/>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label>Account Number</label>
                                <input
  type="text"
  className="form-control"
  placeholder="Account Number"
  value={bankForm.accountNumber}
  onChange={(e) =>
    setBankForm(prev => ({ ...prev, accountNumber: e.target.value }))
  }
/>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label>Bank Name</label>
                                

<select
        name="BankName"
        value={bankForm.bankName}
  onChange={(e) =>
    setBankForm(prev => ({ ...prev, bankName: e.target.value }))
  }
        className="form-control"
      >
        <option value="">Select Bank</option>
        {bankList.map((bank) => (
          <option key={bank.id} value={bank.name}>
            {bank.name}
          </option>
        ))}
      </select>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label>IFSC Code</label>
                                <input
  type="text"
  className="form-control"
  placeholder="IFSC Code"
  value={bankForm.ifsc}
  onChange={(e) =>
    setBankForm(prev => ({ ...prev, ifsc: e.target.value }))
  }
/>
                            </div>
                    </div>
                    <div className="col-12">
                        <button 
  className="primary-btn ms-auto" 
  onClick={handleAddBank}
>
  {editIndex !== null ? "Update Bank Details" : "Add Bank Details"}
</button>
                    </div>
                    </div> */}
                    <div className="table-responsive mt-3">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Account Name</th>
                                    <th>Account Number</th>
                                    <th>Bank Name</th>
                                    <th>IFSC Code</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
  {bankAccounts.map((acc, index) => (
    <tr key={index}>
      <td>{acc.name}</td>
      <td>{acc.accountNumber}</td>
      <td>{acc.bankName}</td>
      <td>{acc.ifsc}</td>
      <td>
        <div className="d-flex gap-2">
          <button className="primary-btn" onClick={() => openEditModal(index)}>
  Edit
</button>
          <button className="primary-btn" onClick={() => handleDelete(index)}>Delete</button>
        </div>
      </td>
    </tr>
  ))}
</tbody>
                        </table>
                    </div>
                </div>
                {showBankModal && (
  <div className="modal-overlay">
    <div className="modal-content">

      <div className="modal-header">
        <h3>{editIndex !== null ? "Edit Bank" : "Add Bank"}</h3>
        <button
          className="modal-close-btn"
          onClick={() => setShowBankModal(false)}
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleBankSubmit}>
        
        <div className="form-group">
          <label>Account Name *</label>
          <input
            type="text"
            className="form-control"
            value={bankForm.name}
            onChange={(e) =>
              setBankForm(prev => ({ ...prev, name: e.target.value }))
            }
            placeholder="Account Holder Name"
          />
        </div>

        <div className="form-group">
          <label>Account Number *</label>
          <input
  type="text"
  className="form-control"
  placeholder="Account Number"
  value={bankForm.accountNumber}
  onChange={(e) => {
    const onlyNums = e.target.value.replace(/\D/g, ""); // 🔥 only digits
    setBankForm(prev => ({ ...prev, accountNumber: onlyNums }));
  }}
  inputMode="numeric"
  maxLength={18}
/>
        </div>

        <div className="form-group">
          <label>Bank Name *</label>
          <select
            className="form-control"
            value={bankForm.bankName}
            onChange={(e) =>
              setBankForm(prev => ({ ...prev, bankName: e.target.value }))
            }
          >
            <option value="">Select Bank</option>
            {bankList.map((bank) => (
              <option key={bank.id} value={bank.name}>
                {bank.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>IFSC Code</label>
          <input
            type="text"
            className="form-control"
            value={bankForm.ifsc}
            onChange={(e) =>
              setBankForm(prev => ({ ...prev, ifsc: e.target.value }))
            }
            placeholder="IFSC Code"
          />
        </div>

        <div className="modal-actions">
          <button type="submit" className="primary-btn">
            {editIndex !== null ? "Update Bank" : "Save Bank"}
          </button>
        </div>

      </form>
    </div>
  </div>
)}
 
        </BookingWrapper>
        
    );
}