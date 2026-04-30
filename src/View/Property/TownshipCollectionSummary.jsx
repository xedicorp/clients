import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from "../../utilities/apiConfig";
import "./TownshipCollectionSummary.css";
import { GoDownload } from "react-icons/go";
import { IoPrintOutline } from "react-icons/io5";
import { IoIosArrowBack } from "react-icons/io";

const TownshipCollectionSummary = () => {
    const { townshipId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [collectionDetails, setCollectionDetails] = useState([]);
    const [townshipName, setTownshipName] = useState("");
    const [error, setError] = useState(null);
    const [isPrinting, setIsPrinting] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        const fetchTownshipData = async () => {
            if (!townshipId) return;

            try {
                setLoading(true);
                setError(null);

                const [collectionResponse, healthResponse] = await Promise.allSettled([
                    axiosInstance.get(API_ENDPOINTS.TOWNSHIP_COLLECTION_DETAIL, {
                        params: { townshipId: parseInt(townshipId) }
                    }),
                    axiosInstance.get(API_ENDPOINTS.TOWNSHIP_HEALTH_REPORT, {
                        params: { townshipId: parseInt(townshipId) }
                    })
                ]);

                // Process Township Health Report for township name
                if (healthResponse.status === 'fulfilled') {
                    const healthData = healthResponse.value.data;
                    setTownshipName(healthData.townshipName || `Township ${townshipId}`);
                } else {
                    // Fallback: Try to get township name from collection summary API
                    try {
                        const summaryResponse = await axiosInstance.get(API_ENDPOINTS.TOWNSHIP_COLLECTION_SUMMARY+"?userId="+getUserId());
                        const summaryData = Array.isArray(summaryResponse.data) ? summaryResponse.data : (summaryResponse.data?.value || []);
                        const township = summaryData.find(t => 
                            (t.id || t.Id || t.ID || t.townshipId || t.TownshipId) == townshipId
                        );
                        if (township) {
                            setTownshipName(township.townshipName || township.TownshipName || `Township ${townshipId}`);
                        } else {
                            setTownshipName(`Township ${townshipId}`);
                        }
                    } catch {
                        setTownshipName(`Township ${townshipId}`);
                    }
                }

                // Process Collection Details
                if (collectionResponse.status === 'fulfilled') {
                    const rawData = collectionResponse.value.data;
                    const data = Array.isArray(rawData) ? rawData : (rawData?.value || rawData?.data || []);
                    
                    // Debug logging
                    // console.log('📊 Collection Detail API Response:', {
                    //     rawDataType: typeof rawData,
                    //     isArray: Array.isArray(rawData),
                    //     dataLength: data?.length,
                    //     firstItem: data?.[0],
                    //     allKeys: data?.[0] ? Object.keys(data[0]) : []
                    // });
                    
                    if (!data || data.length === 0) {
                        setCollectionDetails([]);
                        setError(`No collection records found for this township (ID: ${townshipId})`);
                    } else {
                        // Normalize the data to ensure consistent field names
                        const normalizedData = data.map((item, index) => ({
                            bookingNo: item.bookingNo || item.BookingNo || item.bookingId || item.BookingId || '-',
                            customerName: item.customerName || item.CustomerName || item.clientName || item.ClientName || '-',
                            customerContactNo: item.customerContactNo || item.CustomerContactNo || item.contactNo || item.ContactNo || item.mobileNo || item.MobileNo || '-',
                            description: item.description || item.Description || item.remarks || item.Remarks || item.notes || item.Notes || '-',
                            receiptDate: item.receiptDate || item.ReceiptDate || item.paymentDate || item.PaymentDate || item.date || item.Date || null,
                            amount: item.amount || item.Amount || item.totalAmount || item.TotalAmount || 0
                        }));
                        
                        // console.log('✅ Normalized Collection Data:', {
                        //     count: normalizedData.length,
                        //     sample: normalizedData[0]
                        // });
                        
                        setCollectionDetails(normalizedData);
                    }
                } else {
                    setCollectionDetails([]);
                    const errorMsg = collectionResponse.reason?.response?.data?.message || 
                                    collectionResponse.reason?.message || 
                                    "Failed to load collection details";
                    setError(`${errorMsg} (Township ID: ${townshipId})`);
                }

            } catch (err) {
                setError("Failed to load township data");
                try {
                    const summaryResponse = await axiosInstance.get(API_ENDPOINTS.TOWNSHIP_COLLECTION_SUMMARY+"?userId="+getUserId());
                    const summaryData = Array.isArray(summaryResponse.data) ? summaryResponse.data : (summaryResponse.data?.value || []);
                    const township = summaryData.find(t => 
                        (t.id || t.Id || t.ID || t.townshipId || t.TownshipId) == townshipId
                    );
                    if (township) {
                        setTownshipName(township.townshipName || township.TownshipName || `Township ${townshipId}`);
                    } else {
                        setTownshipName(`Township ${townshipId}`);
                    }
                } catch {
                    setTownshipName(`Township ${townshipId}`);
                }
                setCollectionDetails([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTownshipData();
    }, [townshipId]);

    const downloadReport = () => {
        try {
            setIsDownloading(true);
            const csvHeaders = ['Booking No', 'Customer Name', 'Contact No', 'Description', 'Receipt Date', 'Amount'];
            const csvData = collectionDetails.map(item => [
                item.bookingNo || '',
                item.customerName || '',
                item.customerContactNo || '',
                item.description || '',
                item.receiptDate ? new Date(item.receiptDate).toLocaleString('en-IN') : '',
                item.amount || 0
            ]);

            const csvContent = [
                csvHeaders.join(','),
                ...csvData.map(row => row.map(field => `"${field}"`).join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `${townshipName}-collection-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            setTimeout(() => {
                setIsDownloading(false);
            }, 1000);
        } catch (error) {
            setIsDownloading(false);
            alert('Error downloading report. Please try again.');
        }
    };

    const getUserId = () => {
        const stored = localStorage.getItem("userId") || localStorage.getItem("spendwise_userId");
        const parsed = stored ? Number(stored) : NaN;
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
      };
    const handlePrint = () => {
        setIsPrinting(true);
        setTimeout(() => {
            window.print();
            setTimeout(() => {
                setIsPrinting(false);
            }, 500);
        }, 300);
    };

    const totalCollection = collectionDetails.reduce((sum, item) => sum + (item.amount || 0), 0);
    const currency = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

    const rows = [...collectionDetails].sort((a, b) => {
        const da = a.receiptDate ? new Date(a.receiptDate).getTime() : 0;
        const db = b.receiptDate ? new Date(b.receiptDate).getTime() : 0;
        return db - da;
    });

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading township collection data...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="dashboard-header-content">
                    <div>
                        <h2 className="dashboard-title">Township Collection Details</h2>
                        <p className="dashboard-subtitle">Detailed receipt-wise collection for {townshipName}</p>
                    </div>
                </div>
                <div className="dashboard-header-actions">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="primary-btn"
                    >
                      <IoIosArrowBack />
                        Back
                    </button>
                </div>
            </div>

            {error && (
                <div className="error-alert">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    {error}
                </div>
            )}

            <div className="card">
                <div className="dashboard-table-header">
                    <h3 className="dashboard-table-title">{townshipName}</h3>
                    <div className="table-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button 
                            className="primary-btn" 
                            onClick={handlePrint}
                            disabled={isPrinting || loading}
                        >
                            {isPrinting ? (
                                <>
                                    <div className="spinner-sm"></div>
                                    <span>Printing...</span>
                                </>
                            ) : (
                                <>
                                  <IoPrintOutline />

                                    Print Report
                                </>
                            )}
                        </button>
                        <button 
                            className="primary-btn" 
                            onClick={downloadReport}
                            disabled={isDownloading || loading}
                        >
                            {isDownloading ? (
                                <>
                                    <div className="spinner-sm"></div>
                                    <span>Downloading...</span>
                                </>
                            ) : (
                                <>
                                   <GoDownload />
                                    Download CSV
                                </>
                            )}
                        </button>
                        {/* <span className="amount-badge total">
                            Total {currency(totalCollection)}
                        </span> */}
                    </div>
                </div>
                
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Booking No</th>
                                <th>Customer Name</th>
                                <th>Contact No</th>
                                <th>Description</th>
                                <th>Receipt Date</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length > 0 ? (
                                rows.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.bookingNo || '-'}</td>
                                        <td>{item.customerName || '-'}</td>
                                        <td>{item.customerContactNo || '-'}</td>
                                        <td>{item.description || '-'}</td>
                                        <td>
                                            {item.receiptDate ? new Date(item.receiptDate).toLocaleString('en-IN', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) : 'N/A'}
                                        </td>
                                        <td>
                                            {currency(item.amount)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="no-data">
                                        No collection records found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TownshipCollectionSummary;