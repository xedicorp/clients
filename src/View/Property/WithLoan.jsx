import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BookingWrapper from "./style";
import ReminderButton from "../../components/ReminderButton";
import ReminderPopup from "../../components/ReminderPopup";
import "./WithLoan.css";

export default function WithLoan() {
    const navigate = useNavigate();
    
    const [aadharCard, setAadharCard] = useState(false);
    const [panCard, setPanCard] = useState(false);
    const [photo, setPhoto] = useState(false);
    const [bankDocuments, setBankDocuments] = useState(false);
    const [loanSanctioned, setLoanSanctioned] = useState(false);
    const [loanSanctionDate, setLoanSanctionDate] = useState("");
    const [agreementCreated, setAgreementCreated] = useState(false);
    const [registrySigned, setRegistrySigned] = useState(false);
    const [jdaFileSigned, setJdaFileSigned] = useState(false);
    const [initialPaymentReceived, setInitialPaymentReceived] = useState(false);
    const [initialPaymentDate, setInitialPaymentDate] = useState("");
    const [bankDDReceived, setBankDDReceived] = useState(false);
    const [bankDDDate, setBankDDDate] = useState("");
    const [jdaApplied, setJdaApplied] = useState(false);
    const [jdaApplicationDate, setJdaApplicationDate] = useState("");
    const [pattaReceived, setPattaReceived] = useState(false);
    const [pattaRegistered, setPattaRegistered] = useState(false);
    const [pattaGivenToBank, setPattaGivenToBank] = useState(false);
    const [pattaRegisteredCopy, setPattaRegisteredCopy] = useState(null);
    const [agreementOriginalCopy, setAgreementOriginalCopy] = useState(null);
    const [loanDocuments, setLoanDocuments] = useState(null);
    const [note, setNote] = useState("");

    // Reminder popup state
    const [showReminderPopup, setShowReminderPopup] = useState(false);

    const handleFileUpload = (e, setter) => {
        const file = e.target.files[0];
        if (file) {
            setter(file.name);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const withLoanData = {
            aadharCard, panCard, photo, bankDocuments, loanSanctioned, loanSanctionDate,
            agreementCreated, registrySigned, jdaFileSigned, initialPaymentReceived,
            initialPaymentDate, bankDDReceived, bankDDDate, jdaApplied, jdaApplicationDate,
            pattaReceived, pattaRegistered, pattaGivenToBank, pattaRegisteredCopy,
            agreementOriginalCopy, loanDocuments, note,
            createdAt: new Date().toISOString()
        };
        
        const existingWithLoan = JSON.parse(localStorage.getItem("with_loan_updates") || "[]");
        existingWithLoan.push(withLoanData);
        localStorage.setItem("with_loan_updates", JSON.stringify(existingWithLoan));
        
        alert("Loan data saved successfully!");
        navigate("/property");
    };

    const CheckboxItem = ({ id, checked, onChange, label }) => (
        <div 
            className={`with-loan-checkbox-container ${checked ? 'checked' : ''}`}
            onClick={() => onChange(!checked)}
        >
            <input
                type="checkbox"
                id={id}
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="with-loan-checkbox"
                onClick={(e) => e.stopPropagation()}
            />
            <label htmlFor={id} className="with-loan-checkbox-label">
                {label}
            </label>
            {checked && (
                <svg className="with-loan-checkmark" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            )}
        </div>
    );

    return (
        <BookingWrapper className="with-loan-container">
            <div className="with-loan-header">
                <h2>Loan</h2>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <ReminderButton 
                      size="small" 
                      variant="secondary" 
                      onClick={() => setShowReminderPopup(true)}
                    />
                    <button className="small-btn" onClick={() => navigate(-1)}>Back</button>
                </div>
            </div>

            <div className="card with-loan-form-card">
                <form onSubmit={handleSubmit}>
                    <div className="with-loan-form-grid">
                        
                        <div className="with-loan-section-header">
                            <h3 className="with-loan-section-title">📄 Document Verification</h3>
                        </div>

                        <CheckboxItem id="aadharCard" checked={aadharCard} onChange={setAadharCard} label="Aadhar Card" />
                        <CheckboxItem id="panCard" checked={panCard} onChange={setPanCard} label="PAN Card" />
                        <CheckboxItem id="photo" checked={photo} onChange={setPhoto} label="Photo" />
                        <CheckboxItem id="bankDocuments" checked={bankDocuments} onChange={setBankDocuments} label="Bank Documents" />

                        <div className="with-loan-section-header">
                            <h3 className="with-loan-section-title">🏦 Loan Process</h3>
                        </div>

                        <CheckboxItem id="loanSanctioned" checked={loanSanctioned} onChange={setLoanSanctioned} label="Loan Sanctioned" />

                        {loanSanctioned && (
                            <div>
                                <label htmlFor="loanSanctionDate" className="with-loan-field-label">Loan Sanction Date</label>
                                <input
                                    type="date"
                                    id="loanSanctionDate"
                                    value={loanSanctionDate}
                                    onChange={(e) => setLoanSanctionDate(e.target.value)}
                                    className="with-loan-input"
                                />
                            </div>
                        )}

                        <div className="with-loan-section-header">
                            <h3 className="with-loan-section-title">📝 Agreement & Registry Process</h3>
                        </div>

                        <CheckboxItem id="agreementCreated" checked={agreementCreated} onChange={setAgreementCreated} label="Agreement Created" />
                        <CheckboxItem id="registrySigned" checked={registrySigned} onChange={setRegistrySigned} label="Registry/Agreement Signed" />

                        <div className="with-loan-section-header">
                            <h3 className="with-loan-section-title">💰 Payment Process</h3>
                        </div>

                        <CheckboxItem id="jdaFileSigned" checked={jdaFileSigned} onChange={setJdaFileSigned} label="JDA File Signed by Customer" />
                        <CheckboxItem id="initialPaymentReceived" checked={initialPaymentReceived} onChange={setInitialPaymentReceived} label="Initial Payment Received (20% within 30 days)" />

                        {initialPaymentReceived && (
                            <div>
                                <label htmlFor="initialPaymentDate" className="with-loan-field-label">Initial Payment Date</label>
                                <input
                                    type="date"
                                    id="initialPaymentDate"
                                    value={initialPaymentDate}
                                    onChange={(e) => setInitialPaymentDate(e.target.value)}
                                    className="with-loan-input"
                                />
                            </div>
                        )}

                        <CheckboxItem id="bankDDReceived" checked={bankDDReceived} onChange={setBankDDReceived} label="Bank DD Received (80% from bank)" />

                        {bankDDReceived && (
                            <div>
                                <label htmlFor="bankDDDate" className="with-loan-field-label">Bank DD Received Date</label>
                                <input
                                    type="date"
                                    id="bankDDDate"
                                    value={bankDDDate}
                                    onChange={(e) => setBankDDDate(e.target.value)}
                                    className="with-loan-input"
                                />
                            </div>
                        )}

                        <div className="with-loan-section-header">
                            <h3 className="with-loan-section-title">🏛️ JDA Process</h3>
                        </div>

                        <CheckboxItem id="jdaApplied" checked={jdaApplied} onChange={setJdaApplied} label="Applied in JDA (after full payment)" />

                        {jdaApplied && (
                            <div>
                                <label htmlFor="jdaApplicationDate" className="with-loan-field-label">JDA Application Date</label>
                                <input
                                    type="date"
                                    id="jdaApplicationDate"
                                    value={jdaApplicationDate}
                                    onChange={(e) => setJdaApplicationDate(e.target.value)}
                                    className="with-loan-input"
                                />
                            </div>
                        )}

                        <CheckboxItem id="pattaReceived" checked={pattaReceived} onChange={setPattaReceived} label="Patta Received from JDA" />
                        <CheckboxItem id="pattaRegistered" checked={pattaRegistered} onChange={setPattaRegistered} label="Patta Registered" />
                        <CheckboxItem id="pattaGivenToBank" checked={pattaGivenToBank} onChange={setPattaGivenToBank} label="Patta Given to Bank" />

                        <div className="with-loan-section-header">
                            <h3 className="with-loan-section-title">📤 Upload Documents Online</h3>
                        </div>

                        <div>
                            <label htmlFor="pattaRegisteredCopy" className="with-loan-field-label">
                                Upload Patta Registered Copy
                            </label>
                            <input
                                type="file"
                                id="pattaRegisteredCopy"
                                onChange={(e) => handleFileUpload(e, setPattaRegisteredCopy)}
                                className="with-loan-file-input"
                                accept=".pdf,.jpg,.jpeg,.png"
                            />
                            {pattaRegisteredCopy && (
                                <div className="with-loan-file-selected">
                                    ✓ File selected: {pattaRegisteredCopy}
                                </div>
                            )}
                        </div>

                        <div>
                            <label htmlFor="agreementOriginalCopy" className="with-loan-field-label">
                                Upload Agreement Original Copy
                            </label>
                            <input
                                type="file"
                                id="agreementOriginalCopy"
                                onChange={(e) => handleFileUpload(e, setAgreementOriginalCopy)}
                                className="with-loan-file-input"
                                accept=".pdf,.jpg,.jpeg,.png"
                            />
                            {agreementOriginalCopy && (
                                <div className="with-loan-file-selected">
                                    ✓ File selected: {agreementOriginalCopy}
                                </div>
                            )}
                        </div>

                        <div>
                            <label htmlFor="loanDocuments" className="with-loan-field-label">
                                Upload Loan Documents
                            </label>
                            <input
                                type="file"
                                id="loanDocuments"
                                onChange={(e) => handleFileUpload(e, setLoanDocuments)}
                                className="with-loan-file-input"
                                accept=".pdf,.jpg,.jpeg,.png"
                            />
                            {loanDocuments && (
                                <div className="with-loan-file-selected">
                                    ✓ File selected: {loanDocuments}
                                </div>
                            )}
                        </div>

                        <div>
                            <label htmlFor="note" className="with-loan-field-label">Note</label>
                            <textarea
                                id="note"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Enter any notes..."
                                className="with-loan-textarea"
                            />
                        </div>
                    </div>

                    <div className="with-loan-actions">
                        <button type="button" className="small-btn" onClick={() => navigate(-1)}>Cancel</button>
                        <button type="submit" className="small-btn primary">Save</button>
                    </div>
                </form>
            </div>

            <div className="card with-loan-table-card">
                <h3 className="with-loan-table-title">Recent Loan Updates</h3>
                <div className="with-loan-table-wrapper">
                    <table className="with-loan-table">
                        <thead>
                            <tr>
                                <th className="center">Docs</th>
                                <th className="center">Loan</th>
                                <th className="center">Agreement</th>
                                <th className="center">Registry</th>
                                <th className="center">Initial Pay</th>
                                <th className="center">Bank DD</th>
                                <th className="center">JDA Applied</th>
                                <th className="center">Patta</th>
                                <th className="center">Registered</th>
                                <th className="center">To Bank</th>
                                <th className="left">Uploads</th>
                                <th className="left">Updated At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {JSON.parse(localStorage.getItem("with_loan_updates") || "[]").slice(-5).reverse().map((item, idx) => (
                                <tr key={idx}>
                                    <td className="center">{item.aadharCard && item.panCard && item.photo && item.bankDocuments ? "✅" : "⏳"}</td>
                                    <td className="center">
                                        {item.loanSanctioned ? "✅" : "❌"}
                                        {item.loanSanctionDate && <div className="date-small">{item.loanSanctionDate}</div>}
                                    </td>
                                    <td className="center">{item.agreementCreated ? "✅" : "❌"}</td>
                                    <td className="center">{item.registrySigned ? "✅" : "❌"}</td>
                                    <td className="center">
                                        {item.initialPaymentReceived ? "✅" : "❌"}
                                        {item.initialPaymentDate && <div className="date-small">{item.initialPaymentDate}</div>}
                                    </td>
                                    <td className="center">
                                        {item.bankDDReceived ? "✅" : "❌"}
                                        {item.bankDDDate && <div className="date-small">{item.bankDDDate}</div>}
                                    </td>
                                    <td className="center">
                                        {item.jdaApplied ? "✅" : "❌"}
                                        {item.jdaApplicationDate && <div className="date-small">{item.jdaApplicationDate}</div>}
                                    </td>
                                    <td className="center">{item.pattaReceived ? "✅" : "❌"}</td>
                                    <td className="center">{item.pattaRegistered ? "✅" : "❌"}</td>
                                    <td className="center">{item.pattaGivenToBank ? "✅" : "❌"}</td>
                                    <td className="text">
                                        {item.pattaRegisteredCopy && <div>📄 Patta</div>}
                                        {item.agreementOriginalCopy && <div>📄 Agreement</div>}
                                        {item.loanDocuments && <div>📄 Loan Docs</div>}
                                        {!item.pattaRegisteredCopy && !item.agreementOriginalCopy && !item.loanDocuments && "-"}
                                    </td>
                                    <td className="date">{new Date(item.createdAt).toLocaleString()}</td>
                                </tr>
                            ))}
                            {JSON.parse(localStorage.getItem("with_loan_updates") || "[]").length === 0 && (
                                <tr>
                                    <td colSpan={12} className="no-data">No loan updates yet</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Reminder Popup */}
            <ReminderPopup 
              isOpen={showReminderPopup}
              onClose={() => setShowReminderPopup(false)}
              title="Create Reminder"
            //   bookingId={bookingId}
            />
        </BookingWrapper>
    );
}
