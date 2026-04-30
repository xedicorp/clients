import { useNavigate } from "react-router-dom";
import Wrapper from './style';

const User7Dashboard = () => {
    const navigate = useNavigate();

    const handleSendToVerify = () => {
        navigate("/property/receipt-verification");
    };

    return (
        <Wrapper>
            <div className="user7-dashboard">
                <div className="dashboard-header">
                    <h2>Dashboard</h2>
                    <hr/>
                </div>
                <div className="dashboard-navigation">
                    <button 
                        className="nav-card verify-button"
                        onClick={handleSendToVerify}
                    >
                        <div className="nav-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 12l2 2 4-4"></path>
                                <circle cx="12" cy="12" r="10"></circle>
                            </svg>
                        </div>
                        <div className="nav-content">
                            <h3>go to Recipt</h3>
                            <p>Send data for verification</p>
                        </div>
                    </button>
                </div>
            </div>
        </Wrapper>
    );
};

export default User7Dashboard;