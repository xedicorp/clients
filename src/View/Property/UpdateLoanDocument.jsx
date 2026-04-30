import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BookingWrapper from "./style";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from "../../utilities/apiConfig";
import "./UpdateLoanDocument.css";

export default function UpdateLoanDocument() {
    const navigate = useNavigate();
    
    const [documentId, setDocumentId] = useState("");
    const [documentType, setDocumentType] = useState("");
    const [documentStatus, setDocumentStatus] = useState("");
    const [applicantName, setApplicantName] = useState("");
    const [loanAmount, setLoanAmount] = useState("");
    const [bankName, setBankName] = useState("");
    const [sanctionDate, setSanctionDate] = useState("");
    const [disbursementDate, setDisbursementDate] = useState("");
    const [remarks, setRemarks] = useState("");
    const [isVerified, setIsVerified] = useState(false);
    const [documentTypes, setDocumentTypes] = useState([]);
    const [loadingDocumentTypes, setLoadingDocumentTypes] = useState(false);
    const [bankList, setBankList] = useState([]);

    // Fetch document types from API
    useEffect(() => {
        const fetchDocumentTypes = async () => {
            setLoadingDocumentTypes(true);
            try {
                const response = await axiosInstance.get(API_ENDPOINTS.DOCUMENT_TYPES);
                
                setDocumentTypes(response.data || []);
                localStorage.setItem("document_types_data", JSON.stringify(response.data || []));
            } catch (error) {
                setDocumentTypes([]);
            } finally {
                setLoadingDocumentTypes(false);
            }
        };

        fetchDocumentTypes();
    }, []);
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

    const statusOptions = [
        "Pending Review",
        "Under Verification",
        "Approved",
        "Rejected",
        "Resubmission Required",
        "Completed"
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const updateData = {
            documentId,
            documentType,
            documentStatus,
            applicantName,
            loanAmount,
            bankName,
            sanctionDate,
            disbursementDate,
            remarks,
            isVerified,
            updatedAt: new Date().toISOString()
        };
        
        
        const existingUpdates = JSON.parse(localStorage.getItem("loan_document_updates") || "[]");
        existingUpdates.push(updateData);
        localStorage.setItem("loan_document_updates", JSON.stringify(existingUpdates));
        
        alert("Loan document updated successfully!");
        navigate("/property");
    };

    return (
        <BookingWrapper className="update-loan-doc-container">
            <div className="update-loan-doc-header">
                <div className="update-loan-doc-header-content">
                    <div className="update-loan-doc-header-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                    </div>
                    <div>
                        <h2>Update Loan Document</h2>
                        <p className="update-loan-doc-subtitle">Update loan document status and details</p>
                    </div>
                </div>
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
            </div>

            <div className="card update-loan-doc-form-card">
                <div className="update-loan-doc-form-header">
                    <h3>Document Update Form</h3>
                    <div className="update-loan-doc-form-badge">Loan Documents</div>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="update-loan-doc-form-grid">
                        
                        <div className="update-loan-doc-field">
                            <label htmlFor="documentId">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                                </svg>
                                Document ID
                            </label>
                            <input
                                id="documentId"
                                type="text"
                                value={documentId}
                                onChange={(e) => setDocumentId(e.target.value)}
                                placeholder="Enter document ID"
                                required
                            />
                        </div>

                        <div className="update-loan-doc-field">
                            <label htmlFor="documentType">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                </svg>
                                Document Type
                            </label>
                            <select
                                id="documentType"
                                value={documentType}
                                onChange={(e) => setDocumentType(e.target.value)}
                                disabled={loadingDocumentTypes}
                                required
                            >
                                <option value="">
                                    {loadingDocumentTypes ? "Loading..." : "Select Document Type"}
                                </option>
                                {documentTypes.map((type) => (
                                    <option key={type.id} value={type.name}>{type.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="update-loan-doc-field">
                            <label htmlFor="documentStatus">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                Document Status
                            </label>
                            <select
                                id="documentStatus"
                                value={documentStatus}
                                onChange={(e) => setDocumentStatus(e.target.value)}
                                required
                            >
                                <option value="">Select Status</option>
                                {statusOptions.map((status) => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>

                        <div className="update-loan-doc-field">
                            <label htmlFor="applicantName">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                Applicant Name
                            </label>
                            <input
                                id="applicantName"
                                type="text"
                                value={applicantName}
                                onChange={(e) => setApplicantName(e.target.value)}
                                placeholder="Enter applicant name"
                                required
                            />
                        </div>

                        <div className="update-loan-doc-field">
                            <label htmlFor="loanAmount">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="1" x2="12" y2="23"></line>
                                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                </svg>
                                Loan Amount
                            </label>
                            <input
                                id="loanAmount"
                                type="number"
                                value={loanAmount}
                                onChange={(e) => setLoanAmount(e.target.value)}
                                placeholder="Enter loan amount"
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>

                        <div className="update-loan-doc-field">
  <label htmlFor="bankName">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </svg>
    Bank Name
  </label>

  <select
    id="bankName"
    value={bankName || ""}
    onChange={(e) => setBankName(e.target.value)}
    required
  >
    <option value="">
      {bankList.length === 0 ? "Loading..." : "Select Bank"}
    </option>

    {bankList.map((bank) => (
      <option key={bank.id} value={bank.name}>
        {bank.name}
      </option>
    ))}
  </select>
</div>

                        <div className="update-loan-doc-field">
                            <label htmlFor="sanctionDate">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                                Sanction Date
                            </label>
                            <input
                                id="sanctionDate"
                                type="date"
                                value={sanctionDate}
                                onChange={(e) => setSanctionDate(e.target.value)}
                            />
                        </div>

                        <div className="update-loan-doc-field">
                            <label htmlFor="disbursementDate">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                                Disbursement Date
                            </label>
                            <input
                                id="disbursementDate"
                                type="date"
                                value={disbursementDate}
                                onChange={(e) => setDisbursementDate(e.target.value)}
                            />
                        </div>

                        <div className="update-loan-doc-checkbox-field">
                            <label className="update-loan-doc-checkbox-container">
                                <input
                                    type="checkbox"
                                    checked={isVerified}
                                    onChange={(e) => setIsVerified(e.target.checked)}
                                />
                                <span className="update-loan-doc-checkbox-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                    </svg>
                                    Document Verified & Approved
                                </span>
                            </label>
                        </div>

                        <div className="update-loan-doc-field update-loan-doc-remarks-field">
                            <label htmlFor="remarks">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                                Remarks / Notes
                            </label>
                            <textarea
                                id="remarks"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder="Enter any remarks or notes..."
                                rows="4"
                            />
                        </div>
                    </div>

                    <div className="update-loan-doc-actions">
                        <button type="button" className="small-btn secondary" onClick={() => navigate(-1)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                            Cancel
                        </button>
                        <button type="submit" className="small-btn primary">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            Update Document
                        </button>
                    </div>
                </form>
            </div>

            <div className="card update-loan-doc-table-card">
                <div className="update-loan-doc-table-header">
                    <h3 className="update-loan-doc-table-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                            <polyline points="13 2 13 9 20 9"></polyline>
                        </svg>
                        Recent Updates
                    </h3>
                    <div className="update-loan-doc-table-badge">
                        {JSON.parse(localStorage.getItem("loan_document_updates") || "[]").length} Updates
                    </div>
                </div>
                <div className="update-loan-doc-table-wrapper">
                    <table className="update-loan-doc-table">
                        <thead>
                            <tr>
                                <th className="left">Document ID</th>
                                <th className="left">Type</th>
                                <th className="left">Applicant</th>
                                <th className="left">Bank</th>
                                <th className="left">Amount</th>
                                <th className="center">Status</th>
                                <th className="center">Verified</th>
                            </tr>
                        </thead>
                        <tbody>
                            {JSON.parse(localStorage.getItem("loan_document_updates") || "[]").slice(-5).reverse().map((doc, idx) => (
                                <tr key={idx}>
                                    <td className="doc-id">
                                        <span className="doc-id-badge">{doc.documentId}</span>
                                    </td>
                                    <td className="doc-type">
                                        <span className="doc-type-badge">{doc.documentType}</span>
                                    </td>
                                    <td className="applicant">{doc.applicantName}</td>
                                    <td className="bank">{doc.bankName}</td>
                                    <td className="amount">₹{parseFloat(doc.loanAmount || 0).toLocaleString()}</td>
                                    <td className="status center">
                                        <span className={`status-badge status-${doc.documentStatus?.toLowerCase().replace(/\s+/g, '-')}`}>
                                            {doc.documentStatus}
                                        </span>
                                    </td>
                                    <td className="verified center">
                                        <span className={`verified-badge ${doc.isVerified ? 'verified' : 'pending'}`}>
                                            {doc.isVerified ? '✓ Verified' : '⏳ Pending'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {JSON.parse(localStorage.getItem("loan_document_updates") || "[]").length === 0 && (
                                <tr>
                                    <td colSpan={7} className="no-data">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <line x1="12" y1="8" x2="12" y2="12"></line>
                                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                        </svg>
                                        <p>No updates yet</p>
                                        <span>Start by updating your first loan document</span>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </BookingWrapper>
    );
}
