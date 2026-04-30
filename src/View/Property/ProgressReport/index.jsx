import { useEffect, useMemo, useState } from 'react';
import Wrapper from './style';
import axiosInstance from '../../../utilities/axiosInstance';
import API_ENDPOINTS from '../../../utilities/apiConfig';
import Swal from 'sweetalert2';
import ReminderPopup from '../../../components/ReminderPopup';

import {
    determineWorkflowCode,
    normalizeWorkflowTypeId,
} from '../../../utilities/workflowUtils';

import { formatDisplayDate, toLocalIsoDate } from '../../../utilities/dateUtils';
import Pagination from '../../../components/Pagination';
import Table from '../../../components/Table';
import ExportToExcel from '../../../components/ExportExcel';
import { useNavigate, useParams } from 'react-router-dom';
import { IoIosArrowBack } from "react-icons/io";

const ITEMS_PER_PAGE = 20;

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

const FileProgressReport = () => {
    const { townshipId } = useParams();
    const townshipIdNumber = Number(townshipId);

    const [progressReports, setProgressReports] = useState([]);
    const [statusList, setStatusList] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [showReminderPopup, setShowReminderPopup] = useState(false);

    const navigate = useNavigate();

    const handleSearch = async () => {
        try {
            setLoading(true);

            const queryParams = new URLSearchParams();
            queryParams.append('userId', getUserId());
            if (selectedStatus) {
                queryParams.append('statusTypeId', selectedStatus);
            }

            if (townshipIdNumber) {
                queryParams.append('townshipId', townshipIdNumber);
                 queryParams.append('userId', getUserId());
            }

            const apiUrl = queryParams.toString()
                ? `${API_ENDPOINTS.BOOKING_SEARCH}?${queryParams.toString()}`
                : API_ENDPOINTS.BOOKING_SEARCH;

            const response = await axiosInstance.get(apiUrl);

            let results = Array.isArray(response.data)
                ? response.data
                : response.data?.value || [];

            const transformed = results
                .filter(item => item?.id)
                .map(item => ({
                    id: item.id,
                    township: item.townshipName || 'N/A',
                    plotNumber: item.plotNo || 'N/A',
                    plotSize: item.plotSize || 'N/A',
                    clientName: item.clientName || 'N/A',
                    clientMobile: item.contactNo || '-',
                    status: (item.status || 'N/A').toLowerCase(),
                    createdAt: item.bookingDate
                        ? toLocalIsoDate(item.bookingDate)
                        : toLocalIsoDate(new Date()),
                    rawDate: item.bookingDate || new Date(),
                    workflowCode: determineWorkflowCode(item),
                    workflowTypeId: normalizeWorkflowTypeId(
                        Number(item.workflowTypeId),
                    ),
                }))
                .sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));

            setProgressReports(transformed);
            setCurrentPage(1);
            setHasSearched(true);

            if (!transformed.length) {
                Swal.fire({
                    icon: 'info',
                    title: 'No Results',
                    text: 'No progress records found for selected filters',
                    timer: 2000,
                    showConfirmButton: false,
                });
            }
        } catch (error) {
            Swal.fire(
                'Error',
                error?.response?.data?.message ||
                'Failed to search progress records',
                'error',
            );
            setProgressReports([]);
        } finally {
            setLoading(false);
        }
    };

     const getUserId = () => {
        const stored = localStorage.getItem("userId") || localStorage.getItem("spendwise_userId");
        const parsed = stored ? Number(stored) : NaN;
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
      };

    const getStatusData = async () => {
        try {
            const response = await axiosInstance.get(
                API_ENDPOINTS.BOOKING_STATUS_TYPE_LIST
            );

            const formattedData = response.data.map(item => ({
                id: item.id,
                name: item.name
            }));

            setStatusList(formattedData);
        } catch (error) {
            console.error('Error fetching status data:', error);
        }
    };
  
    useEffect(() => {
        getStatusData();
    }, []);

    const filteredReports = useMemo(() => {
        return hasSearched ? progressReports : [];
    }, [progressReports, hasSearched]);

    /* ================= PAGINATION ================= */
    const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);

    const currentItems = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredReports.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredReports, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedStatus]);

    return (
        <Wrapper className="dashboard-container">
            <div className="dashboard-header">
                <div >
                    <h2 className="dashboard-title">File Progress Report</h2>
                    <p className="dashboard-subtitle">
                        Overview of File Progress
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
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div className="filter-group">
                        <label>Progress Status</label>
                        <select
                            value={selectedStatus}
                            onChange={e =>
                                setSelectedStatus(
                                    e.target.value === ''
                                        ? ''
                                        : Number(e.target.value)
                                )
                            }
                            className='form-control'
                        >
                            <option value="">All</option>

                            {statusList.map(item => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>

                        <button
                            className="primary-btn"
                            onClick={handleSearch}
                            disabled={loading}
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </div>

                    <ExportToExcel
                        data={filteredReports}
                        columns={PROGRESS_REPORT_EXCEL_COLUMNS}
                        fileName={`Progress_Report_${new Date()
                            .toISOString()
                            .slice(0, 10)}`}
                        sheetName="Progress Report"
                        buttonText="Download Excel"
                    />
                </div>
            </div>

            <div className="card">
                <Table
                    headers={[
                        'File',
                        'Township / Plot',
                        'Mobile',
                        'Created Date',
                        'Status',
                        'Action',
                    ]}
                    data={currentItems}
                    emptyMessage={
                        !hasSearched
                            ? 'Please click Search to load progress data'
                            : 'No progress records found'
                    }
                    rowKey={item => item.id}
                    renderRow={b => (
                        <>
                            <td>     <span onClick={() => navigate(`/booking-summery-report/${b.id}`)}  style={{
                              cursor: "pointer",
                              color: "#2563eb",
                              fontWeight: "600",
                              textDecoration: "underline"
                            }}>{b.id}</span>   </td>
                            <td>
                                {b.township} / Plot {b.plotNumber}
                            </td>
                            <td>{b.clientMobile}</td>
                            <td>{formatDisplayDate(b.createdAt)}</td>
                            <td>
                                <span className="status-badge">
                                    {b.status.toUpperCase()}
                                </span>
                            </td>
                            <td>
                                <button
                                    className="primary-btn"
                                    onClick={() =>
                                        navigate(`/property/summary/${b.id}`)
                                    }
                                >
                                    View Summary
                                </button>
                            </td>
                        </>
                    )}
                />
            </div>

            {hasSearched && totalPages > 1 && (
                <Pagination
                    page={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}

            <ReminderPopup
                isOpen={showReminderPopup}
                onClose={() => setShowReminderPopup(false)}
                title="Reminder List"
                // bookingId={bookingId}
            />
        </Wrapper>
    );
};

export default FileProgressReport;
