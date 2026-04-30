import { useEffect, useState } from 'react';
import Wrapper from './style';
import axiosInstance from '../../utilities/axiosInstance';
import API_ENDPOINTS from '../../utilities/apiConfig';
import ReminderPopup from '../../components/ReminderPopup';
import Table from '../../components/Table';
import { useNavigate, useParams } from 'react-router-dom';
import { formatDisplayDate } from '../../utilities/dateUtils';

const ExpiredReraList = () => {
    const { townshipId } = useParams();
    const townshipIdNumber = Number(townshipId);

    const [loading, setLoading] = useState(false);
    const [showReminderPopup, setShowReminderPopup] = useState(false);
    const [reportData, setReportData] = useState([]);

    const navigate = useNavigate();

    const loadReport = async () => {
        try {
            setLoading(true);

            const response = await axiosInstance.get(
                API_ENDPOINTS.EXPIRED_RERA_LIST + "?townshipId=" + townshipIdNumber
            );
            console.log('Expired RERA List response:', response.data);
            setReportData(response.data);

        } catch (error) {
            console.error('Error fetching expired RERA list:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReport();
    }, []);

    return (
        <Wrapper className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h2 className="dashboard-title">RERA Expired List</h2>
                    <p className="dashboard-subtitle">
                        List of associates with expired RERA licenses
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginLeft: "auto" }}>
                    
                    {/* Back Button */}
                    <button className="primary-btn" onClick={() => navigate(-1)}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            width="20"
                            height="20"
                        >
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                        Back
                    </button>

                    {/* Reminder Button */}
                    <button
                        className="primary-btn"
                        onClick={() => setShowReminderPopup(true)}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                        Reminder
                    </button>
                </div>
            </div>

            <div className="card">
                <Table
                    headers={[
                        'First Name',
                        'Contact No',
                        'RERA No',
                        'Approved On'
                    ]}
                    data={reportData}
                    rowKey={item => item.id}
                    renderRow={item => (
                        <>
                            <td>{item.firstName}</td>
                            <td>{item.contactNo}</td>
                            <td>{item.reraNo}</td>
                            <td>{formatDisplayDate(item.approvedOn)}</td>
                        </>
                    )}
                />
            </div>

            <ReminderPopup
                isOpen={showReminderPopup}
                onClose={() => setShowReminderPopup(false)}
                title="Reminder List"
            />
        </Wrapper>
    );
};

export default ExpiredReraList;