import { useEffect, useMemo, useState } from 'react';
import Wrapper from './style';
import axiosInstance from '../../utilities/axiosInstance';
import API_ENDPOINTS from '../../utilities/apiConfig';
import Swal from 'sweetalert2';
import ReminderPopup from '../../components/ReminderPopup';

 

import { formatDisplayDate, toLocalIsoDate } from '../../utilities/dateUtils';
import Pagination from '../../components/Pagination';
import Table from '../../components/Table';
import ExportToExcel from '../../components/ExportExcel';
import { useNavigate, useParams } from 'react-router-dom';
import { IoIosArrowBack } from "react-icons/io";
 

const ITEMS_PER_PAGE = 10;

/* ================= EXCEL COLUMNS (PROGRESS REPORT) ================= */
const PROGRESS_REPORT_EXCEL_COLUMNS = [
    { header: 'File ID', key: 'id' },
    { header: 'Township', key: 'township' },
    { header: 'Plot No', key: 'plotNumber' },
    { header: 'Plot Size', key: 'plotSize' },
    { header: 'Client Name', key: 'clientName' },
    { header: 'Mobile', key: 'clientMobile' },
    {
        header: 'Created Date',
        key: 'createdAt',
        format: value => formatDisplayDate(value),
    },
    {
        header: 'Progress Status',
        key: 'status',
        format: value => value?.toUpperCase(),
    },
];

const FileProgressSummaryReport = () => {
    const { townshipId } = useParams();
    const townshipIdNumber = Number(townshipId);      
    const [loading, setLoading] = useState(false);    
    const [showReminderPopup, setShowReminderPopup] = useState(false);
    const[reportData, setReportData]=useState([]);

    const navigate = useNavigate();

   

    const loadReport = async () => {
        try {
            const response = await axiosInstance.get(
                API_ENDPOINTS.PROGRESS_SUMMARY_REPORT+"?townshipId="+townshipIdNumber
            );

            setReportData( response.data);

            
        } catch (error) {
            console.error('Error fetching status data:', error);
        }
    };

    useEffect(() => {
        loadReport();
    }, []);

    
    const totals = useMemo(() => {
    return reportData.reduce(
        (acc, item) => {
        acc.count += Number(item.count) || 0;
        acc.receivable += Number(item.receivable) || 0;
        acc.received += Number(item.received) || 0;
        acc.balance += Number(item.balance) || 0;
        return acc;
        },
        { count: 0, receivable: 0, received: 0, balance: 0 }
    );
    }, [reportData]);
   
    return (
        <Wrapper className="dashboard-container">
            <div className="dashboard-header">
                <div >
                    <h2 className="dashboard-title">File Progress Summary Report</h2>
                    <p className="dashboard-subtitle">
                        Overview of File Progress Summary
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginLeft: "auto" }}>
                    
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
                      'Status',
                       'Count',     
                       <span style={{ textAlign: "right", display: "block" }}>Receivable</span>,
                        <span style={{ textAlign: "right", display: "block" }}>Received</span>,
                        <span style={{ textAlign: "right", display: "block" }}>Balance</span>,                
                        'Action',
                    ]}
                        data={[
                        ...reportData,
                        {
                            isTotal: true
                        }
                        ]}                    
                    rowKey={item => item.id}
                    renderRow={b => {
  if (b.isTotal) {
    return (
      <>
        <td style={{ fontWeight: "bold" }}>Total</td>
        <td style={{ fontWeight: "bold" }}>{totals.count}</td>
        <td style={{ fontWeight: "bold", textAlign: "right" }}>
          ₹ {totals.receivable.toLocaleString()}
        </td>
        <td style={{ fontWeight: "bold", textAlign: "right" }}>
          ₹ {totals.received.toLocaleString()}
        </td>
        <td style={{ fontWeight: "bold", textAlign: "right" }}>
          ₹ {totals.balance.toLocaleString()}
        </td>
        <td></td>
      </>
    );
  }

  return (
    <>
      <td>{b.status}</td>
      <td>{b.count}</td>
      <td style={{ textAlign: 'right' }}>{b.receivable}</td>
      <td style={{ textAlign: 'right' }}>{b.received}</td>
      <td style={{ textAlign: 'right' }}>{b.balance}</td>
      <td>
        <button
          className="primary-btn"
          onClick={() =>
            navigate(`/property/township-progress-report/${townshipIdNumber}`)
          }
        >
          View Detail
        </button>
      </td>
    </>
  );
}}
                />
            </div>

          
            <ReminderPopup
                isOpen={showReminderPopup}
                onClose={() => setShowReminderPopup(false)}
                title="Reminder List"
                // bookingId={bookingId}
            />
        </Wrapper> 
    );
};

export default FileProgressSummaryReport;
