import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom"; 
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from "../../utilities/apiConfig";
import { formatDisplayDate } from "../../utilities/dateUtils";
import Swal from "sweetalert2";
 

export default function CreateTicket() {
     const navigate = useNavigate();
    const { id: routeBookingId } = useParams();
   
    // Check if current user is user7
    const currentUsername =
        localStorage.getItem('userName') ||
        localStorage.getItem('userName') ||
        '';
    
    // Form state
    
    const [subject, setSubject] = useState('');
 
    // const [department, setDepartment] = useState('0');
 
   
    const [message, setMessage] = useState('');

    // Edit mode state
    const [isEditMode, setIsEditMode] = useState(false);
   
    
    // API state
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null); 
    const [screenshot, setscreenshot] = useState(null);
    const [receiptPreview, setReceiptPreview] = useState(null);
    
    const [processing, setProcessing] = useState(false);
    const [clicked, setClicked] = useState(false);
 

    // Payment options
    // const departments = [
    //     { value: '1', label: 'Sales' },
    //     { value: '2', label: 'Billing' },
    //     { value: '4', label: 'Tech Support' } 
       
    // ];

 
    const ALLOWED_FILE_REGEX = /\.(jpg|jpeg|png|pdf)$/i;
    const MAX_FILE_SIZE = 20 * 1024 * 1024;

    const isPdf = (file) => {
        if (!file) return false;

        if (file instanceof File) {
            return file.type === "application/pdf";
        }

        return typeof file === "string" && file.toLowerCase().endsWith(".pdf");
    };

   
      const closePopups = () => {
         setShowDeletePopup(false);
    };

     
    const handleFileChange = (fileList) => {
     
        const file = fileList && fileList.length > 0 ? fileList[0] : null;

                    if (file && !ALLOWED_FILE_REGEX.test(file.name)) {
                        Swal.fire({
                            icon: "warning",
                            title: "Invalid File",
                            text: "Only JPG, JPEG, PNG or PDF files allowed"
                            });
                            return;
                    }

                if (file && file.size > MAX_FILE_SIZE) {
                    Swal.fire({
                    icon: "warning",
                    title: "File Too Large",
                    text: "File must be less than 20MB"
                    });
                    return;
                }
                  
        setscreenshot(file);

        // Remove old preview if exists
        if (receiptPreview?.startsWith?.("blob:")) {
            URL.revokeObjectURL(receiptPreview);
        }

        setReceiptPreview(file ? URL.createObjectURL(file) : null);
    };


    useEffect(() => {
        return () => {
            if (receiptPreview?.startsWith?.("blob:")) {
                URL.revokeObjectURL(receiptPreview);
            }
        };
    }, [receiptPreview]);

    

    const getUserId = () => {
        const stored = localStorage.getItem("userId") || localStorage.getItem("spendwise_userId");
        const parsed = stored ? Number(stored) : NaN;
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
      };
  

    // Submit form
    const handleSubmit = async (e) => {
    e.preventDefault();

    // const errors = [];

    // if (!subject.trim()) errors.push("Subject is required");
    // if (!department) errors.push("Department is required");
    // if (!message.trim()) errors.push("Message is required");

    // if (errors.length > 0) {
    //     Swal.fire({
    //         icon: "warning",
    //         title: "Validation Error",
    //         html: errors.map(err => `• ${err}`).join("<br>")
    //     });
    //     return;
    // }

    setSaving(true);

    let clientId="71AFB0B2-EEB7-40C7-9706-E59DE110C847";
    try {
        const formData = new FormData();
            formData.append("Id", 0);
            formData.append("Subject", subject);
            formData.append("Message", message);
            formData.append("ClientId", clientId);


        if (screenshot) {
            formData.append("Screenshot", screenshot);
        }

        const response = await axiosInstance.post(
            API_ENDPOINTS.SUPPORT_TICKET_SAVE,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        Swal.fire({
  icon: "success",
  title: "Ticket Created",
  text: response?.data || "Your ticket has been submitted successfully"
});

        // reset
        setSubject("");
        setMessage("");
        setscreenshot(null);
        setReceiptPreview(null);

    } catch (error) {
        let errorMessage = 'Failed to save ticket.';

        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        }

        Swal.fire("Error", errorMessage, "error");
    } finally {
        setSaving(false);
    }
};

 
    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                <div className="dashboard-header-content">
                    <div className="dashboard-header-icon">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <line x1="12" y1="1" x2="12" y2="23"></line>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                    </div>
                    <div>
                        <h2 className="dashboard-title">Create Ticket</h2>
                        <p className="dashboard-subtitle">
                            Submit a  support ticket
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>

                    <button className="primary-btn" onClick={() => navigate(-1)}>
                        
                        Back
                    </button>
                     
                </div>
            </div> 
          
            <div className="card" >
                

                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-lg-12 col-md-12  mb-3">
                            <label htmlFor="subject">
                                Subject <span className="required">*</span>
                            </label>
                            <input
                                id="subject"
                                type="text"
                                value={subject}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    
                                    setSubject(value);
                                    
                                }}
                                placeholder="Subject"
                               
                                required
                                className="form-control"
                                />
                        </div>

                      

                        {/* <div className="col-lg-6 col-md-12  mb-3">
                            <label htmlFor="paymentMode">
                                Department <span className="required">*</span>
                            </label>
                            <select
                                id="department"
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                required
                                className='form-control'
                            >
                                {departments.map((mode) => (
                                    <option key={mode.value} value={mode.value}>
                                        {mode.label}
                                    </option>
                                ))}
                            </select>
                        </div>  */}
                       
                            <div className="col-lg-6 col-md-12 mb-3">
                                <label htmlFor="remarks">
                                    Message <span className="required">*</span>
                                </label>
                                <textarea
                                    id="message"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type your message here"
                                    rows="4"
                                    className='form-control'
                                    style={{height:"240px"}}
                                    required
                                />
                            </div>
                            <div className="col-lg-6 col-md-12  mb-3">
                                <label>
                                   Screenshot
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
                                        {receiptPreview ? (
                                            isPdf(screenshot || receiptPreview) ? (
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

                    <div className="d-flex ">
                        <button
                            type="submit"
                            className="primary-btn ms-auto"
                            disabled={saving}
                        >
                            {saving
                                ? 'Submiting...'
                                : 'Submit Ticket'}
                        </button>
                    </div>
                </form>
            </div>
 
 
        </div >
    );
}
