import { useEffect, useMemo, useState } from 'react';
import Wrapper from './style';
import axiosInstance from '../../utilities/axiosInstance';
import API_ENDPOINTS from '../../utilities/apiConfig'; 
import { formatDisplayDate, toLocalIsoDate } from '../../utilities/dateUtils'; 
import { useNavigate, useParams } from 'react-router-dom';
 
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

const ManagementStatusReport = () => {
    
    const [loading, setLoading] = useState(false);    
    const [showReminderPopup, setShowReminderPopup] = useState(false);
    const[reportData, setReportData]=useState([]);
    const { townshipId } = useParams();
    const navigate = useNavigate(); 
    const [ddNotPrintCount, setDDNotPrintCount] = useState(""); 
    const loadReport = async () => {
        
        try {
            setLoading(true);
            const response = await axiosInstance.get(API_ENDPOINTS.MANAGEMENT_STATUS_REPORT +"?townshipId="+townshipId  );

            setReportData( response.data);
            let ocrCount=reportData.tillPrevMonth?.loanSanctionStatusModel?.oCRNotClear || 0;
             let dokitCount=reportData.tillPrevMonth?.loanSanctionStatusModel?.dokitNotSigned || 0;
            setDDNotPrintCount(ocrCount+dokitCount);
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
                    <h2 className="dashboard-title">Management Status Report</h2>
                    <p className="dashboard-subtitle">
                        Overview of Status from Management Eyes
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
                  {/* <th align='center' >No. of Plots</th>
                    <th align='center'  > Revenue</th>
                     
                 <th align='center' >No. of Plots</th>
                    <th align='center'  > Revenue</th>
                      */}
                      <th align='center' >No. of Plots</th>
                      <th align='center'  > Receivable</th>
                    <th align='center'  > Received</th>
                     
              </tr>
            </thead>
            <tbody> 
                    <tr>
                        <td>Total Plots</td>
                        {/* <td>{reportData.total?.totalPlots}</td> 
                         <td> </td> 
                          <td>{reportData.total?.totalPlots}</td> 
                           <td> </td>  */}
                         
                            <td>{reportData.total?.totalPlots}</td> 
                              <td></td>
                             <td> </td> 
                   </tr>
                    <tr>
                         <td  colSpan={4} style={{backgroundColor:'#f5f7e9'}}><b>Plots available for Sale</b></td>                         
                   </tr>
                        <tr>
                            <td>Regular Plots</td>
                        {/* <td>{reportData.total?.availablePlots?.regularPlots}</td>   
                          <td> </td>  
                            <td>{reportData.total?.availablePlots?.regularPlots}</td>  
                              <td> </td>   */}
                                  
                                <td>{reportData.total?.availablePlots?.regularPlots}</td>  
                                <td></td>
                                  <td> </td>  

                   </tr>
                   <tr>
                            <td>Rahan Plots</td>
                        {/* <td>{reportData.total?.availablePlots?.rahanPlots}</td>    
                         <td> </td> 
                          <td>{reportData.total?.availablePlots?.rahanPlots}</td> 
                           <td> </td>  */}
                               
                            <td>{reportData.total?.availablePlots?.rahanPlots}</td> 
                            <td></td>
                             <td> </td>                 
                   </tr>
                   <tr>
                            <td>  Plots not available for sale</td>
                            {/* <td>{reportData.total?.availablePlots?.notForSalePlots}</td>  
                             <td> </td> 
                              <td>{reportData.total?.availablePlots?.notForSalePlots}</td> 
                               <td> </td>  */}
                                <td>{reportData.total?.availablePlots?.notForSalePlots}</td>  
                                <td> </td>                           
                   </tr>
                    <tr>
                            <td> <b> No Plots Booked </b></td>
                            {/* <td>{reportData.total?.noOfPlotsBooked}</td>     
                            <td></td> 
                            <td>{reportData.total?.noOfPlotsBooked}</td> 
                            <td></td>  */}
                             
                            <td>{reportData.total?.noOfPlotsBooked}</td> 
                               <td></td>
                            <td></td>                        
                   </tr>
                     <tr>
                            <td  colSpan={4} style={{backgroundColor:'#f5f7e9'}}> <b>   Plots closed </b></td>
                                                    
                   </tr>
                     <tr>
                            <td> Without Loan</td>
                            {/* <td>{reportData.total?.closedPlots?.withoutLoan}</td>  
                            <td>{reportData.total?.closedPlots?.withoutLoan}</td>
                            <td>{reportData.total?.closedPlots?.withoutLoan}</td>
                            <td>{reportData.total?.closedPlots?.withoutLoan}</td> */}
                         
                            <td>{reportData.total?.closedPlots?.withoutLoan}</td>
                                <td>{reportData.total?.closedPlots?.withoutLoanValue}</td>
                            <td>{reportData.total?.closedPlots?.withoutLoanAmount}</td>                          
                    </tr>
                     <tr>
                             <td> Loan</td>
                            {/* <td>{reportData.tillPrevMonth?.closedPlots?.loan}</td>    
                            <td>{reportData.tillPrevMonth?.closedPlots?.loan}</td>
                            <td>{reportData.tillPrevMonth?.closedPlots?.loan}</td>
                            <td>{reportData.tillPrevMonth?.closedPlots?.loan}</td> */}
                            <td>{reportData.total?.closedPlots?.loan}</td>
                             <td>{reportData.total?.closedPlots?.loanValue}</td>       
                            <td>{reportData.total?.closedPlots?.loanAmount}</td>                        
                    </tr>
                    <tr>
                           <td  colSpan={4} style={{backgroundColor:'#f5f7e9'}}> <b>    Plots under process </b></td>
                                                    
                   </tr>
                     <tr>
                            <td> Without loan</td>
                            {/* <td>{reportData.tillPrevMonth?.underProcessPlots?.withoutLoan}</td>   
                             <td>{reportData.tillPrevMonth?.underProcessPlots?.withoutLoan}</td>
                              <td>{reportData.tillPrevMonth?.underProcessPlots?.withoutLoan}</td>
                               <td>{reportData.tillPrevMonth?.underProcessPlots?.withoutLoan}</td> */}
                                <td>{reportData.total?.underProcessPlots?.withoutLoan}</td>
                                  <td>{reportData.total?.underProcessPlots?.withoutLoanValue}</td>    
                                 <td>{reportData.total?.underProcessPlots?.withoutLoanAmount}</td>                         
                   </tr>
                    <tr>
                              <td  colSpan={4} style={{backgroundColor:'#f5f7e9'}}> <b> Loan </b></td>
                                                    
                   </tr>
                     <tr>
                            <td> Yet not login</td>
                            {/* <td>{reportData.tillPrevMonth?.loginStatusModel?.yetNotLogin}</td>   
                            <td>{reportData.tillPrevMonth?.loginStatusModel?.yetNotLogin}</td> 
                            <td>{reportData.tillPrevMonth?.loginStatusModel?.yetNotLogin}</td> 
                            <td>{reportData.tillPrevMonth?.loginStatusModel?.yetNotLogin}</td>  */}
                            <td>{reportData.total?.loginStatusModel?.yetNotLogin}</td> 
                            <td>{reportData.total?.loginStatusModel?.yetNotLoginValue}</td>  
                            <td>{reportData.total?.loginStatusModel?.yetNotLoginAmount}</td>                          
                   </tr>
                    <tr>
                            <td> Login and under process </td>
                            {/* <td>{reportData.tillPrevMonth?.loginStatusModel?.loginAndUnderProcess}</td>   
                            <td>{reportData.tillPrevMonth?.loginStatusModel?.loginAndUnderProcess}</td>
                            <td>{reportData.tillPrevMonth?.loginStatusModel?.loginAndUnderProcess}</td>
                            <td>{reportData.tillPrevMonth?.loginStatusModel?.loginAndUnderProcess}</td> */}
                            <td>{reportData.total?.loginStatusModel?.loginAndUnderProcess}</td>
                            <td>{reportData.total?.loginStatusModel?.loginAndUnderProcessValue}</td>   
                            <td>{reportData.total?.loginStatusModel?.loginAndUnderProcessAmount}</td>                         
                   </tr>
                      <tr >
                            <td  colSpan={4} style={{backgroundColor:'#f5f7e9'}}> <b> Sanction </b></td>
                                                    
                   </tr>
                     <tr >
                            <td  colSpan={4} style={{backgroundColor:'#e5eac9'}}> <b> DD Print but not received </b></td>
                                                    
                   </tr>
                     <tr>
                            <td> JDA Patta not applied </td>
                            {/* <td>{reportData.tillPrevMonth?.sanctionStatusModel?.jdaPattaNotApplied}</td>   
                            <td>{reportData.tillPrevMonth?.sanctionStatusModel?.jdaPattaNotApplied}</td>
                            <td>{reportData.tillPrevMonth?.sanctionStatusModel?.jdaPattaNotApplied}</td>
                            <td>{reportData.tillPrevMonth?.sanctionStatusModel?.jdaPattaNotApplied}</td> */}
                            <td>{reportData.total?.sanctionStatusModel?.jdaPattaNotApplied}</td>
                             <td>{reportData.total?.sanctionStatusModel?.jdaPattaNotAppliedValue}</td>    
                            <td>{reportData.total?.sanctionStatusModel?.jdaPattaNotAppliedAmount}</td>                         
                   </tr>
                    <tr>
                            <td> JDA Patta applied but not received</td>
                            {/* <td>{reportData.tillPrevMonth?.sanctionStatusModel?.jdaPattaAppliedNotReceived}</td>   
                            <td>{reportData.tillPrevMonth?.sanctionStatusModel?.jdaPattaAppliedNotReceived}</td>
                            <td>{reportData.tillPrevMonth?.sanctionStatusModel?.jdaPattaAppliedNotReceived}</td>
                            <td>{reportData.tillPrevMonth?.sanctionStatusModel?.jdaPattaAppliedNotReceived}</td> */}
                            <td>{reportData.total?.sanctionStatusModel?.jdaPattaAppliedNotReceived}</td>
                              <td>{reportData.total?.sanctionStatusModel?.jdaPattaAppliedNotReceivedValue}</td>  
                            <td>{reportData.total?.sanctionStatusModel?.jdaPattaAppliedNotReceivedAmount}</td>                         
                   </tr>
                    <tr>
                            <td> JDA Patta not registered</td>
                            {/* <td>{reportData.tillPrevMonth?.sanctionStatusModel?.jdaPattaNotRegistered}</td>  
                            <td>{reportData.tillPrevMonth?.sanctionStatusModel?.jdaPattaNotRegistered}</td>
                            <td>{reportData.tillPrevMonth?.sanctionStatusModel?.jdaPattaNotRegistered}</td>
                            <td>{reportData.tillPrevMonth?.sanctionStatusModel?.jdaPattaNotRegistered}</td> */}
                            <td>{reportData.total?.sanctionStatusModel?.jdaPattaNotRegistered}</td>
                              <td>{reportData.total?.sanctionStatusModel?.jdaPattaNotRegisteredValue}</td>    
                            <td>{reportData.total?.sanctionStatusModel?.jdaPattaNotRegisteredAmount}</td>                          
                   </tr>
                    <tr >
                            <td  colSpan={7} style={{backgroundColor:'#e5eac9'}}> <b> DD Print not print</b></td>
                                                    
                   </tr>
                     <tr>
                            <td> Loan documents not signed</td>
                            {/* <td>{reportData.tillPrevMonth?.sanctionStatusModel?.dokitNotSigned}</td>   
                            <td>{reportData.tillPrevMonth?.sanctionStatusModel?.dokitNotSigned}</td> 
                            <td>{reportData.tillPrevMonth?.sanctionStatusModel?.dokitNotSigned}</td> 
                            <td>{reportData.tillPrevMonth?.sanctionStatusModel?.dokitNotSigned}</td>  */}
                            <td>{reportData.total?.sanctionStatusModel?.dokitNotSigned}</td> 
                             <td>{reportData.total?.sanctionStatusModel?.dokitNotSignedValue}</td>      
                            <td>{reportData.total?.sanctionStatusModel?.dokitNotSignedAmount}</td>                          
                   </tr>
                     <tr>
                            <td> OC not cleared by customer</td>
                            {/* <td>{reportData.tillPrevMonth?.sanctionStatusModel?.ocrNotClear}</td>   
                            <td>{reportData.tillPrevMonth?.sanctionStatusModel?.ocrNotClear}</td> 
                            <td>{reportData.tillPrevMonth?.sanctionStatusModel?.ocrNotClear}</td> 
                            <td>{reportData.tillPrevMonth?.sanctionStatusModel?.ocrNotClear}</td>  */}
                            <td>{reportData.total?.sanctionStatusModel?.ocrNotClear}</td> 
                            <td>{reportData.total?.sanctionStatusModel?.ocrNotClearValue}</td>  
                            <td>{reportData.total?.sanctionStatusModel?.ocrNotClearAmount}</td>                          
                   </tr>
                    <tr>
                            <td> Both</td>
                            {/* <td>{ddNotPrintCount}</td>     
                            <td>{ddNotPrintCount}</td>
                            <td>{ddNotPrintCount}</td>
                            <td>{ddNotPrintCount}</td> */}
                            <td>{ddNotPrintCount}</td>
                            <td>{ddNotPrintCount}</td>    
                            <td>{ddNotPrintCount}</td>                      
                   </tr>
            </tbody>
                </table>
                  )}
            </div>

          
      
        </Wrapper>
    );
};

export default ManagementStatusReport;
