import { useEffect, useState } from "react";
import BookingWrapper from "../Property/style";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from "../../utilities/apiConfig";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function AccountPaymentEntry() {
  const navigate = useNavigate();
  const [hideTownshipPlot, setHideTownshipPlot] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [townshipList, setTownshipList] = useState([]);
  const [transactionModeList, setTransactionModeList] = useState([]);
  const [plotList, setPlotList] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [totalAmount, setTotalAmount] = useState('');
  const [transactionDate, setTransactionDate] = useState('');
   const [headId, setHeadId] = useState('');
    const [plotId, setPlotId] = useState('');
   const [paymentMode, setPaymentMode] = useState('1');
  const [transactionId, setTransactionId] = useState('');
  const [bankList, setBankList] = useState([]);
  const [bankName, setBankName] = useState('');
  const [remarks, setRemarks] = useState('');
  const [paymentReceiptsFile, setPaymentReceiptsFile] = useState(null);
  const [transactionPreview, settransactionPreview] = useState(null);
  const [headsList, setHeadsList] = useState([]);
  const [formData, setFormData] = useState({
    headId: "",
    townshipId: "",
    plotId: "",    
    amount: "",
    transactionDate:"",
    notes: ""
  });

 
  const getUserId = () => {
    const stored = localStorage.getItem("userId") || localStorage.getItem("spendwise_userId");
    const parsed = stored ? Number(stored) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  };

  const resetForm = () => {
    setTotalAmount('');
    setTransactionDate('');
    setHeadId('');
    setRemarks('');
    setTransactionId('');
    setPaymentMode('1');
    setBankName('');

  }
   const fetchHeadList = async () => {
      try {
        setLoading(true);
  
        const res = await axiosInstance.get(API_ENDPOINTS.HEAD_LIST); 
        const list = res.data  ; 
        setHeadsList(list); 
      } catch (err) {
        Swal.fire("Error", "Failed to load Account Heads list", "error");
      } finally {
        setLoading(false);
      }
    };
  
    const fetchTransactionModeList = async () => {
      try {
        setLoading(true);
  
        const res = await axiosInstance.get(API_ENDPOINTS.TRANSACTIONMODE_LIST); 
        const list = res.data  ; 
        setTransactionModeList(list); 
      } catch (err) {
        Swal.fire("Error", "Failed to load Transaction Modes list", "error");
      } finally {
        setLoading(false);
      }
    };
     const ALLOWED_FILE_REGEX = /\.(jpg|jpeg|png|pdf)$/i;
    const MAX_FILE_SIZE = 20 * 1024 * 1024;

    const isPdf = (file) => {
        if (!file) return false;

        if (file instanceof File) {
            return file.type === "application/pdf";
        }

        return typeof file === "string" && file.toLowerCase().endsWith(".pdf");
    };
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
     const handleFileChange = (fileList) => {
        const file = fileList && fileList.length > 0 ? fileList[0] : null;

        if (file && !ALLOWED_FILE_REGEX.test(file.name)) {
            alert("Only JPG, JPEG, PNG or PDF files allowed");
            return;
        }

        if (file && file.size > MAX_FILE_SIZE) {
            alert("File must be less than 20MB");
            return;
        }

        setPaymentReceiptsFile(file);

        // Remove old preview if exists
        if (transactionPreview?.startsWith?.("blob:")) {
            URL.revokeObjectURL(transactionPreview);
        }

        settransactionPreview(file ? URL.createObjectURL(file) : null);
    };

  // ✅ Fetch Townships
  useEffect(() => {
    const fetchTownships = async () => {
      try {
        const res = await axiosInstance.get(
          API_ENDPOINTS.TOWNSHIP_LIST + "?userId=" + getUserId()+"&status=2");
        const data = Array.isArray(res.data) ? res.data : res.data?.value || [];
        setTownshipList(data);
      } catch (err) {
        Swal.fire("Error", "Failed to load townships", "error");
      }
    };
    fetchBanks();
    fetchTownships();
    fetchHeadList();
    fetchTransactionModeList();
  }, []);

  // ✅ Fetch Plots based on Township
  const fetchPlots = async (townshipId) => {
    try {
    //  let status=2;
    let isShowNotAvailables = false;
      let status=0; //TEMP FIX
      const res = await axiosInstance.get(API_ENDPOINTS.PLOTS_LIST, {
        params: { townshipId, status, isShowNotAvailables }
      });

      const plots = Array.isArray(res.data)
        ? res.data
        : res.data?.value || [];

      setPlotList(plots);
    } catch {
      setPlotList([]);
    }
  };

  // ✅ Handle Change
  const handleChange = (field, value) => {
   
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));

    
    if (field === "townshipId") {
      setFormData((prev) => ({
        ...prev,
        townshipId: value,
        plotId: ""
      }));
      fetchPlots(value);
    }
    
     if (field === "headId")  {
      //1: HeadId
      setHeadId(value);
      const selectedHead = headsList.find(head => head.id === Number(value));
      if (selectedHead) {
        switch (selectedHead.headName) {
          case "Excess Refund":
            setHideTownshipPlot(false);
                  break;
            case "Discount":
            setHideTownshipPlot(false);
                  break;
          default:
            setHideTownshipPlot(true);
        }
      }
    }
  };

  // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault(); 
        const trimmedTransactionId = transactionId?.trim() || '';
        const trimmedPaymentMode = paymentMode?.toString().trim() || '';

        // Validation
        if (
            !totalAmount ||
            !transactionDate ||
            !trimmedPaymentMode ||
            !trimmedTransactionId
        ) {
            const missingFields = [];
            if (!totalAmount) missingFields.push('• Amount');
            if (!transactionDate) missingFields.push('• Transaction Date');
            if (!trimmedPaymentMode) missingFields.push('• Transaction Method');
            if (!trimmedTransactionId) missingFields.push('• Transaction ID');

            alert(
                `Please fill all required fields:\n\n${missingFields.join('\n')}`
            );
            return;
        }

        setSaving(true);

        try {
            const formattedDate = new Date(transactionDate).toISOString();
           
            const formData = new FormData();
            formData.append("id",   0);          
            formData.append("amount", parseFloat(totalAmount));
            formData.append("transactionDate", formattedDate);
            formData.append("transactionMethod", paymentMode);
            formData.append("transactionId", trimmedTransactionId);
            formData.append("bankName", bankName?.trim() || '');
             formData.append("headId",  headId?.trim() || 0);
            formData.append("headEntityId", plotId?.trim() || 0);

            formData.append("notes", remarks?.trim() || 'Payment');
            formData.append("userId", getUserId());

           
            if (paymentReceiptsFile) {
                formData.append("transactionImage", paymentReceiptsFile);
            }

            const response = await axiosInstance.post(
                API_ENDPOINTS.SAVE_PAYMENT,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (response.status === 200 || response.status === 201) {
               // await fetchReceipts(bookingId);

                const actionText = isEditMode ? 'updated' : 'saved';
                const successMessage =
                    `Transaction ${actionText} successfully!\n\n` +
                    `Amount: ₹${parseFloat(totalAmount).toLocaleString()}\n` +
                    `Transaction ID: ${transactionId}`;

                alert(successMessage);
              //  handleCancelEdit();
                setPaymentReceiptsFile(null);
                settransactionPreview(null); 
                resetForm();
             }

        } catch (error) {
            console.error('Receipt save error:', error);
            let errorMessage = 'Failed to save receipt. Please try again.';

            if (error.response?.data?.title) {
                errorMessage = error.response.data.title;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                const errorList = Object.keys(errors).map(key => `${key}: ${errors[key].join(', ')}`).join('\n');
                errorMessage = `Validation errors:\n${errorList}`;
            } else if (error.message) {
                errorMessage = error.message;
            }

            alert(`Error saving receipt:\n\n${errorMessage}`);
        } finally {
            setSaving(false);
        }
    };


  return (
    <BookingWrapper className="dashboard-container">
 <form onSubmit={handleSubmit}> 
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Misc Transaction Entry</h1>
          <p className="dashboard-subtitle">Create Misc Transaction Entry</p>
        </div>
        <div className="dashboard-header-actions">
          <button className="primary-btn" onClick={() => navigate("/accounts/transaction-list")}>
            Transaction List
          </button>
        </div>
      </div>
        <div className="card">
        <div className="upload-loan-form-grid">

 {/* Head */}
        <div className="booking-form-field">
          <label>Head <span style={{ color: "red" }}>*</span></label>
            <select
            className="form-control"
            value={headId}
            onChange={(e) => handleChange("headId", e.target.value)}
          >
            <option value="">Select Head</option>
            {headsList.map((head) => (
              <option key={head.id} value={head.id}>{head.headName }</option>
            ))}
          </select>
        </div>
          {/* Township */}

            {!hideTownshipPlot && (

            <> <div className="booking-form-field">
              <label>Township <span style={{ color: "red" }}>*</span></label>
              <select
                className="form-control"
                value={formData.townshipId}
                onChange={(e) => handleChange("townshipId", e.target.value)}
              >
                <option value="">Select Township</option>
                {townshipList.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div><div className="booking-form-field">
                <label>Plot <span style={{ color: "red" }}>*</span></label>
                <select
                  className="form-control"
                  value={plotId}
                  onChange={(e) => setPlotId(e.target.value)}
                  disabled={!formData.townshipId}
                >
                  <option value="">Select Plot</option>
                  {plotList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.plotNo} ({p.plotSize} SqYds)
                    </option>
                  ))}
                </select>
              </div></>
            )}
             {hideTownshipPlot && (
               <> <div className="booking-form-field"></div>
                <div className="booking-form-field"></div></> 
             )}
          {/* Date */}
          
          <div className="booking-form-field">
            <label>Transaction Date <span style={{ color: "red" }}>*</span></label>
            <input
              type="date"
              className="form-control"
               value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              required
            />
          </div>

          {/* Amount */}
          <div className="booking-form-field">
            <label>Amount <span style={{ color: "red" }}>*</span></label>
            <input
              type="text"
              className="form-control"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="Enter amount"
              
            />
          </div>

       
 
        
                      <div className="booking-form-field">
                            <label htmlFor="paymentMode">
                                Payment Method *
                            </label>
                            <select
                                id="paymentMode"
                                value={paymentMode}
                                onChange={(e) => setPaymentMode(e.target.value)}
                                required
                                className='form-control'
                            >
                                {transactionModeList.map((mode) => (
                                  
                                    <option key={mode.Id} value={mode.id}>
                                        {mode.modeName}
                                    </option>
                                ))}
                            </select>
                        </div>



                         <div className="booking-form-field">
                            <label htmlFor="transactionId">
                                Transaction ID / Reference No/ Cheque No *
                            </label>
                            <input
                                id="transactionId"
                                type="text"
                                value={transactionId}
                                onChange={(e) =>
                                    setTransactionId(
                                        e.target.value.replace(/[^0-9]/g, ''),
                                    )
                                }
                                placeholder="Enter transaction ID"
                                required
                                className='form-control'
                            />
                        </div>

                        <div className="booking-form-field">
                        <label htmlFor="bankName">
                            Bank Name
                        </label>

                        <select
                            id="bankName"
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
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



                        <div className="ocr-form-field ocr-remarks-field">
                            <div className="ocr-remarks-section">
                                <label htmlFor="remarks">
                                    Remarks / Notes
                                </label>
                                <textarea
                                    id="remarks"
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    placeholder="Enter any remarks or notes"
                                    rows="4"
                                    className='form-control'
                                />
                            </div>
                            <div className="ocr-file-upload-section">
                                <label>
                                    Payment    (PDF/Image)
                                </label>
                                <div className="file-item-wrapper">
                                    <label className="upload-box">
                                        <span className="upload-text">Click to Upload</span>

                                        <input
                                            type="file"
                                            accept="image/*,application/pdf"
                                            onChange={(e) => handleFileChange(e.target.files)}
                                            className='form-control'
                                        />
                                    </label>


                                    <div className="file-preview-box">
                                        {transactionPreview ? (
                                            isPdf(paymentReceiptsFile || transactionPreview) ? (
                                                <div className="pdf-preview-box">
                                                    <button
                                                        className="pdf-preview-btn"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            window.open(transactionPreview, "_blank");
                                                        }}
                                                    >
                                                        Preview PDF
                                                    </button>
                                                </div>
                                            ) : (
                                                <img
                                                    src={transactionPreview}
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
                
 </div>
                <div className="booking-form-actions">
          <button className="primary-btn" onClick={handleSubmit}>
            Save
          </button>
       
                 </div> 
            </div>
    
    </form>
    </BookingWrapper>
  );
}