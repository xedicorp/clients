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

const DailyComprehensiveReport = () => {
    
    const [loading, setLoading] = useState(false);    
    const [showReminderPopup, setShowReminderPopup] = useState(false);
    const[reportData, setReportData]=useState([]);

    const navigate = useNavigate();

   

    const loadReport = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(API_ENDPOINTS.DAILY_COMPREHENSIVE_REPORT 
            );

            setReportData( response.data);

         } catch (error) {

                setReportData([]);
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
                <div >
                    <h2 className="dashboard-title">Daily Comprehensive Report</h2>
                    <p className="dashboard-subtitle">
                        Overview of Daily Comprehensive Progress
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
                  
                </div>
            </div>

          

            <div className="card">
                 {loading ? (
                        <div className="loading-state">
                            <p>Loading Report...</p>
                        </div>
                    ) : (
                <table className="table" style={{fontSize:"15px"}}>
            <thead>
              <tr>
              
                <th>Particulars</th>
                  <th align='center' colSpan={reportData.townships?.length}>Today's Report</th>
                    <th align='center' colSpan={reportData.townships?.length}>  Till Date Report</th>
                   
                
              </tr>
            </thead>
            <tbody> 
                 <tr>
                    <td></td>
                    {reportData.townships?.map((item) => (                      
                        <td>
                            {item.name}
                        </td>                   

                    ))}
                     {reportData.townships?.map((item) => (                      
                        <td>
                            {item.name}
                        </td>                   

                    ))}
                   </tr>
                   <tr>
    <td>No of Rehan Plots</td>
    {reportData.townships?.map((item) => { 
        const todayData = reportData.today.find(p => p.townshipId == item.id);  
        return ( 
            <>                            
                <td>{todayData?.noOfRehanPlots}</td>
            </>                              
        );          
    })}
    {reportData.townships?.map((item) => { 
        const tillDateData = reportData.tillDate.find(p => p.townshipId == item.id);  
        return ( 
            <>                            
                <td>{tillDateData?.noOfRehanPlots}</td>
            </>                              
        );          
    })}
</tr>
<tr>
    <td>No of Not Available Plots</td>
    {reportData.townships?.map((item) => { 
        const todayData = reportData.today.find(p => p.townshipId == item.id);  
        return ( 
            <>                            
                <td>{todayData?.noOfNotAvailablePlots}</td>
            </>                              
        );          
    })}
    {reportData.townships?.map((item) => { 
        const tillDateData = reportData.tillDate.find(p => p.townshipId == item.id);  
        return ( 
            <>                            
                <td>{tillDateData?.noOfNotAvailablePlots}</td>
            </>                              
        );          
    })}
</tr>
<tr>
    <td>No of Available Plots</td>
    {reportData.townships?.map((item) => { 
        const todayData = reportData.today.find(p => p.townshipId == item.id);  
        return ( 
            <>                            
                <td>{todayData?.noOfAvailablePlots}</td>
            </>                              
        );          
    })}
    {reportData.townships?.map((item) => { 
        const tillDateData = reportData.tillDate.find(p => p.townshipId == item.id);  
        return ( 
            <>                            
                <td>{tillDateData?.noOfAvailablePlots}</td>
            </>                              
        );          
    })}
</tr>
                   <tr>
                    <td>No of unsold Plots</td>
                     {reportData.townships?.map((item) => { 
                       
                        const  todayData= reportData.today.find(p=>p.townshipId==item.id);  
                         return ( 
                            <>                            
                            <td>{todayData?.noOfUnsoldPlots}</td></>                              
                            );          
                     }
                    )}
                    {reportData.townships?.map((item) => { 
                       
                        const  tillDateData= reportData.tillDate.find(p=>p.townshipId==item.id);  
                         return ( 
                            <>                            
                            <td>{tillDateData?.noOfUnsoldPlots}</td></>                              
                            );          
                     }
                    )}
                   </tr>
                   <tr>
                    <td>No of  Plots  Booked</td>
                    {reportData.townships?.map((item) => { 
                       
                        const  todayData= reportData.today.find(p=>p.townshipId==item.id);  
                         return ( 
                            <>                            
                            <td>{todayData?.noOfPlotsBooked}</td></>                              
                            );          
                     }
                    )}
                    {reportData.townships?.map((item) => { 
                       
                        const  tillDateData= reportData.tillDate.find(p=>p.townshipId==item.id);  
                         return ( 
                            <>                            
                            <td>{tillDateData?.noOfPlotsBooked}</td></>                              
                            );          
                     }
                    )}
                   </tr>
                   <tr>
                    <td>Loan File Login</td>
                    {reportData.townships?.map((item) => { 
                       
                        const  todayData= reportData.today.find(p=>p.townshipId==item.id);  
                         return ( 
                            <>                            
                            <td>{todayData?.noOfLoanFileLogin}</td></>                              
                            );          
                     }
                    )}
                    {reportData.townships?.map((item) => { 
                       
                        const  tillDateData= reportData.tillDate.find(p=>p.townshipId==item.id);  
                         return ( 
                            <>                            
                            <td>{tillDateData?.noOfLoanFileLogin}</td></>                              
                            );          
                     }
                    )}
                   </tr>
                   <tr>
                    <td>Loan File Sanction</td>
                    {reportData.townships?.map((item) => { 
                       
                        const  todayData= reportData.today.find(p=>p.townshipId==item.id);  
                         return ( 
                            <>                            
                            <td>{todayData?.noOfLoanFileSanction}</td></>                              
                            );          
                     }
                    )}
                    {reportData.townships?.map((item) => { 
                       
                        const  tillDateData= reportData.tillDate.find(p=>p.townshipId==item.id);  
                         return ( 
                            <>                            
                            <td>{tillDateData?.noOfLoanFileSanction}</td></>                              
                            );          
                     }
                    )}
                   </tr>
                    <tr>
                    <td>Docs Signed</td>
                    {reportData.townships?.map((item) => { 
                       
                        const  todayData= reportData.today.find(p=>p.townshipId==item.id);  
                         return ( 
                            <>                            
                            <td>{todayData?.noOfDokitSigned}</td></>                              
                            );          
                     }
                    )}
                    {reportData.townships?.map((item) => { 
                       
                        const  tillDateData= reportData.tillDate.find(p=>p.townshipId==item.id);  
                         return ( 
                            <>                            
                            <td>{tillDateData?.noOfDokitSigned}</td></>                              
                            );          
                     }
                    )}
                   </tr>
                     <tr>
                    <td>No of DD Received</td>
                    {reportData.townships?.map((item) => { 
                       
                        const  todayData= reportData.today.find(p=>p.townshipId==item.id);  
                         return ( 
                            <>                            
                            <td>{todayData?.noOfDDReceived}</td></>                              
                            );          
                     }
                    )}
                     {reportData.townships?.map((item) => { 
                       
                        const  tillDateData= reportData.tillDate.find(p=>p.townshipId==item.id);  
                         return ( 
                            <>                            
                            <td>{tillDateData?.noOfDDReceived}</td></>                              
                            );          
                     }
                    )}
                   </tr>
                     <tr>
                    <td>Amount DD Deposited in Bank</td>
                    {reportData.townships?.map((item) => { 
                       
                        const  todayData= reportData.today.find(p=>p.townshipId==item.id);  
                         return ( 
                            <>                            
                            <td>{todayData?.amountOfDDDepositedInBank}</td></>                              
                            );          
                     }
                    )}
                     {reportData.townships?.map((item) => { 
                       
                        const  tillDateData= reportData.tillDate.find(p=>p.townshipId==item.id);  
                         return ( 
                            <>                            
                            <td>{tillDateData?.amountOfDDDepositedInBank}</td></>                              
                            );          
                     }
                    )}
                   </tr>
                    <tr>
                    <td>Amount Received Other than DD</td>
                    {reportData.townships?.map((item) => { 
                       
                        const  todayData= reportData.today.find(p=>p.townshipId==item.id);  
                         return ( 
                            <>                            
                            <td>{todayData?.amountReceivedOtherThanDD}</td></>                              
                            );          
                     }
                    )}
                     {reportData.townships?.map((item) => { 
                       
                        const  tillDateData= reportData.tillDate.find(p=>p.townshipId==item.id);  
                         return ( 
                            <>                            
                            <td>{tillDateData?.amountReceivedOtherThanDD}</td></>                              
                            );          
                     }
                    )}
                   </tr>

</tbody>
                </table>
                  )}
            </div>

          
      
        </Wrapper>
    );
};

export default DailyComprehensiveReport;
