import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BookingWrapper from "./style";

export default function BookingInfo() {
    const navigate = useNavigate();
    
    const [clientName, setClientName] = useState("");
    const [clientMobile, setClientMobile] = useState("");
    const [clientAddress, setClientAddress] = useState("");
    const [clientEmail, setClientEmail] = useState("");

    const handleSave = (e) => {
        e.preventDefault();
        
        const clientInfo = {
            name: clientName,
            mobile: clientMobile,
            address: clientAddress,
            email: clientEmail
        };
        
        localStorage.setItem("client_info", JSON.stringify(clientInfo));
        alert("Client information saved!");
    };

    const handleSaveAndConfirm = (e) => {
        e.preventDefault();
        
        const clientInfo = {
            name: clientName,
            mobile: clientMobile,
            address: clientAddress,
            email: clientEmail
        };
        
        localStorage.setItem("client_info", JSON.stringify(clientInfo));
        alert("Client information saved and confirmed!");
        navigate("/property");
    };

    const formRowStyle = {
        display: "grid",
        gridTemplateColumns: "200px 1fr",
        gap: 16,
        alignItems: "center",
        marginBottom: 12
    };

    const labelStyle = { 
        fontWeight: 600, 
        fontSize: "14px" 
    };

    const inputStyle = {
        padding: "10px 12px",
        borderRadius: "6px",
        border: "1px solid rgba(100, 100, 100, 0.3)",
        background: "rgba(255, 255, 255, 0.05)",
        color: "var(--text-color)",
        fontSize: "14px",
        width: "100%",
        outline: "none",
        transition: "border-color 0.2s",
        boxSizing: "border-box"
    };

    return (
        <BookingWrapper style={{ width: "100%", maxWidth: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h2 style={{ margin: 0 }}>Booking Info</h2>
                <button className="small-btn" onClick={() => navigate(-1)}>Back</button>
            </div>

            <div className="card" style={{ padding: 24, width: "100%" }}>
                <h3 style={{ marginTop: 0, marginBottom: 20, color: "var(--text-color)" }}>Client Info</h3>
                
                <form onSubmit={handleSave} style={{ width: "100%" }}>
                    <div style={{ display: "grid", gap: 16, maxWidth: "100%" }}>
                        
                        <div style={formRowStyle}>
                            <label style={labelStyle} htmlFor="clientName">Name</label>
                            <input 
                                id="clientName"
                                name="clientName"
                                type="text"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                placeholder="Enter client name"
                                style={inputStyle}
                                autoComplete="name"
                                required
                            />
                        </div>

                        <div style={formRowStyle}>
                            <label style={labelStyle} htmlFor="clientMobile">Mobile</label>
                            <input 
                                id="clientMobile"
                                name="clientMobile"
                                type="tel"
                                value={clientMobile}
                                onChange={(e) => setClientMobile(e.target.value)}
                                placeholder="+91-..."
                                style={inputStyle}
                                autoComplete="tel"
                                required
                            />
                        </div>

                        <div style={formRowStyle}>
                            <label style={labelStyle} htmlFor="clientAddress">Address</label>
                            <textarea 
                                id="clientAddress"
                                name="clientAddress"
                                value={clientAddress}
                                onChange={(e) => setClientAddress(e.target.value)}
                                placeholder="Enter client address"
                                style={{...inputStyle, minHeight: "80px", resize: "vertical"}}
                                autoComplete="street-address"
                                required
                            />
                        </div>

                        <div style={formRowStyle}>
                            <label style={labelStyle} htmlFor="clientEmail">Email</label>
                            <input 
                                id="clientEmail"
                                name="clientEmail"
                                type="email"
                                value={clientEmail}
                                onChange={(e) => setClientEmail(e.target.value)}
                                placeholder="client@example.com"
                                style={inputStyle}
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
                            <button type="button" className="small-btn" onClick={() => navigate(-1)}>
                                Cancel
                            </button>
                            <button type="submit" className="small-btn primary" style={{ padding: "8px 16px" }}>
                                Save Booking
                            </button>
                            <button type="button" className="small-btn primary" onClick={handleSaveAndConfirm} style={{ padding: "8px 16px" }}>
                                Save & Confirm Booking
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </BookingWrapper>
    );
}