import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BookingWrapper from "./style";
import PropertyNavigation from "./PropertyNavigation";
import ReminderButton from "../../components/ReminderButton";
import ReminderPopup from "../../components/ReminderPopup";
import "./WithoutLoan.css";

export default function WithoutLoan() {
    const navigate = useNavigate();
    
    const [aadharCard, setAadharCard] = useState(false);
    const [panCard, setPanCard] = useState(false);
    const [photo, setPhoto] = useState(false);
    const [agreementCreated, setAgreementCreated] = useState(false);
    const [registrySigned, setRegistrySigned] = useState(false);
    const [jdaFileSigned, setJdaFileSigned] = useState(false);
    const [paymentReceived, setPaymentReceived] = useState(false);
    const [paymentDate, setPaymentDate] = useState("");
    const [jdaApplied, setJdaApplied] = useState(false);
    const [jdaApplicationDate, setJdaApplicationDate] = useState("");
    const [pattaReceived, setPattaReceived] = useState(false);
    const [pattaRegistered, setPattaRegistered] = useState(false);
    const [pattaRegisteredCopy, setPattaRegisteredCopy] = useState(null);
    const [agreementOriginalCopy, setAgreementOriginalCopy] = useState(null);
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
        
        const withoutLoanData = {
            aadharCard, panCard, photo, agreementCreated, registrySigned,
            jdaFileSigned, paymentReceived, paymentDate, jdaApplied,
            jdaApplicationDate, pattaReceived, pattaRegistered,
            pattaRegisteredCopy, agreementOriginalCopy, note,
            createdAt: new Date().toISOString()
        };
        
        const existingWithoutLoan = JSON.parse(localStorage.getItem("without_loan_updates") || "[]");
        existingWithoutLoan.push(withoutLoanData);
        localStorage.setItem("without_loan_updates", JSON.stringify(existingWithoutLoan));
        
        alert("Without Loan data saved successfully!");
        navigate("/property");
    };

    const CheckboxItem = ({ id, checked, onChange, label }) => (
        <div 
            className={`without-loan-checkbox-container ${checked ? 'checked' : ''}`}
            onClick={() => onChange(!checked)}
        >
            <input
                type="checkbox"
                id={id}
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="without-loan-checkbox"
                onClick={(e) => e.stopPropagation()}
            />
            <label htmlFor={id} className="without-loan-checkbox-label">{label}</label>
            {checked && (
                <svg className="without-loan-checkmark" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            )}
        </div>
    );

    return (
        <BookingWrapper className="without-loan-container">
            <div className="without-loan-header">
                <div className="without-loan-header-content">
                    <div className="without-loan-header-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                    </div>
                    <div>
                        <h2>Without Loan</h2>
                        <p className="without-loan-subtitle">Manage property bookings without loan requirements</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <ReminderButton 
                      size="small" 
                      variant="secondary" 
                      onClick={() => setShowReminderPopup(true)}
                    />
                    <PropertyNavigation hideHealthButton />
                </div>
            </div>

            <div className="card without-loan-form-card">
                <form onSubmit={handleSubmit}>
                    <div className="without-loan-form-grid">
                        
                        <div className="without-loan-section-header">
                            <h3 className="without-loan-section-title">Document Verification</h3>
                        </div>

                        <CheckboxItem id="aadharCard" checked={aadharCard} onChange={setAadharCard} label="Aadhar Card" />
                        <CheckboxItem id="panCard" checked={panCard} onChange={setPanCard} label="PAN Card" />
                        <CheckboxItem id="photo" checked={photo} onChange={setPhoto} label="Photo" />

                        <div className="without-loan-section-header">
                            <h3 className="without-loan-section-title">Agreement & Registry Process</h3>
                        </div>

                        <CheckboxItem id="agreementCreated" checked={agreementCreated} onChange={setAgreementCreated} label="Agreement Created" />
                        <CheckboxItem id="registrySigned" checked={registrySigned} onChange={setRegistrySigned} label="Registry/Agreement Signed" />

                        <div className="without-loan-section-header">
                            <h3 className="without-loan-section-title">JDA Process</h3>
                        </div>

                        <CheckboxItem id="jdaFileSigned" checked={jdaFileSigned} onChange={setJdaFileSigned} label="JDA File Signed by Customer" />
                        <CheckboxItem id="paymentReceived" checked={paymentReceived} onChange={setPaymentReceived} label="100% Payment Received (within 30 days of booking)" />

                        {paymentReceived && (
                            <div>
                                <label htmlFor="paymentDate" className="without-loan-field-label">Payment Received Date</label>
                                <input
                                    type="date"
                                    id="paymentDate"
                                    value={paymentDate}
                                    onChange={(e) => setPaymentDate(e.target.value)}
                                    className="without-loan-input"
                                />
                            </div>
                        )}

                        <CheckboxItem id="jdaApplied" checked={jdaApplied} onChange={setJdaApplied} label="Applied in JDA (after payment received)" />

                        {jdaApplied && (
                            <div>
                                <label htmlFor="jdaApplicationDate" className="without-loan-field-label">JDA Application Date</label>
                                <input
                                    type="date"
                                    id="jdaApplicationDate"
                                    value={jdaApplicationDate}
                                    onChange={(e) => setJdaApplicationDate(e.target.value)}
                                    className="without-loan-input"
                                />
                            </div>
                        )}

                        <CheckboxItem id="pattaReceived" checked={pattaReceived} onChange={setPattaReceived} label="Patta Received from JDA" />
                        <CheckboxItem id="pattaRegistered" checked={pattaRegistered} onChange={setPattaRegistered} label="Patta Registered" />

                        <div className="without-loan-section-header">
                            <h3 className="without-loan-section-title">Upload Documents Online</h3>
                        </div>

                        <div>
                            <label htmlFor="pattaRegisteredCopy" className="without-loan-field-label">Upload Patta Registered Copy</label>
                            <input
                                type="file"
                                id="pattaRegisteredCopy"
                                onChange={(e) => handleFileUpload(e, setPattaRegisteredCopy)}
                                className="without-loan-file-input"
                                accept=".pdf,.jpg,.jpeg,.png"
                            />
                            {pattaRegisteredCopy && (
                                <div className="without-loan-file-selected">✓ File selected: {pattaRegisteredCopy}</div>
                            )}
                        </div>

                        <div>
                            <label htmlFor="agreementOriginalCopy" className="without-loan-field-label">Upload Agreement Original Copy</label>
                            <input
                                type="file"
                                id="agreementOriginalCopy"
                                onChange={(e) => handleFileUpload(e, setAgreementOriginalCopy)}
                                className="without-loan-file-input"
                                accept=".pdf,.jpg,.jpeg,.png"
                            />
                            {agreementOriginalCopy && (
                                <div className="without-loan-file-selected">✓ File selected: {agreementOriginalCopy}</div>
                            )}
                        </div>

                        <div>
                            <label htmlFor="note" className="without-loan-field-label">Note</label>
                            <textarea
                                id="note"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Enter any notes..."
                                className="without-loan-textarea"
                            />
                        </div>
                    </div>

                    <div className="without-loan-actions">
                        <button type="button" className="small-btn" onClick={() => navigate(-1)}>Cancel</button>
                        <button type="submit" className="small-btn primary">Save</button>
                    </div>
                </form>
            </div>

            <div className="card without-loan-table-card">
                <h3 className="without-loan-table-title">Recent Without Loan Updates</h3>
                <div className="without-loan-table-wrapper">
                    <table className="without-loan-table">
                        <thead>
                            <tr>
                                <th className="center">Docs</th>
                                <th className="center">Agreement</th>
                                <th className="center">Registry</th>
                                <th className="center">JDA Signed</th>
                                <th className="center">Payment</th>
                                <th className="center">JDA Applied</th>
                                <th className="center">Patta</th>
                                <th className="center">Registered</th>
                                <th className="left">Uploads</th>
                                <th className="left">Updated At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {JSON.parse(localStorage.getItem("without_loan_updates") || "[]").slice(-5).reverse().map((item, idx) => (
                                <tr key={idx}>
                                    <td className="center">{item.aadharCard && item.panCard && item.photo ? "✅" : "⏳"}</td>
                                    <td className="center">{item.agreementCreated ? "✅" : "❌"}</td>
                                    <td className="center">{item.registrySigned ? "✅" : "❌"}</td>
                                    <td className="center">{item.jdaFileSigned ? "✅" : "❌"}</td>
                                    <td className="center">
                                        {item.paymentReceived ? "✅" : "❌"}
                                        {item.paymentDate && <div className="date-small">{item.paymentDate}</div>}
                                    </td>
                                    <td className="center">
                                        {item.jdaApplied ? "✅" : "❌"}
                                        {item.jdaApplicationDate && <div className="date-small">{item.jdaApplicationDate}</div>}
                                    </td>
                                    <td className="center">{item.pattaReceived ? "✅" : "❌"}</td>
                                    <td className="center">{item.pattaRegistered ? "✅" : "❌"}</td>
                                    <td className="text">
                                        {item.pattaRegisteredCopy && <div>📄 Patta</div>}
                                        {item.agreementOriginalCopy && <div>📄 Agreement</div>}
                                        {!item.pattaRegisteredCopy && !item.agreementOriginalCopy && "-"}
                                    </td>
                                    <td className="date">{new Date(item.createdAt).toLocaleString()}</td>
                                </tr>
                            ))}
                            {JSON.parse(localStorage.getItem("without_loan_updates") || "[]").length === 0 && (
                                <tr>
                                    <td colSpan={10} className="no-data">No without loan updates yet</td>
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
