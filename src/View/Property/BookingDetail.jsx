import React, { useEffect, useState } from "react";
import BookingWrapper from "./style";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from "../../utilities/apiConfig";
import "./BookingDetail.css";

export default function BookingDetail() {
    const { id } = useParams();
    const [booking, setBooking] = useState(null);
    const [steps, setSteps] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const STORAGE_KEY = "property_bookings_v1";

    const workflowNameMap = {
        WITH_LOAN: "Loan",
        WITHOUT_LOAN: "Without Loan",
        WITHOUT_7DAY_CLOSED: "7 Day Closed",
        AGREEMENT_REGISTRY_PROCESS: "Agreement Registry"
    };

    const determineWorkflowCode = (item) => {
        const wfIdRaw = item?.workflowTypeId ?? item?.WorkflowTypeId ?? item?.workflowTypeID ?? item?.WorkflowTypeID;
        const wfId = Number(wfIdRaw);
        if (wfId === 1) return "WITH_LOAN";
        if (wfId === 2) return "WITHOUT_LOAN";
        if (wfId === 3) return "WITHOUT_7DAY_CLOSED";

        const wf = (item?.workflowCode || item?.workflowType || "").toString().trim().toUpperCase();

        if (wf === "1") return "WITH_LOAN";
        if (wf === "2") return "WITHOUT_LOAN";
        if (wf === "3") return "WITHOUT_7DAY_CLOSED";

        if (wf === "WITH_LOAN" || item?.loanRequired === true) return "WITH_LOAN";
        if (wf === "WITHOUT_LOAN") return "WITHOUT_LOAN";
        if (wf === "FAST_CLOSE" || wf === "WITHOUT_7DAY_CLOSED" || item?.quickClose === true) return "WITHOUT_7DAY_CLOSED";
        if (wf === "AGREEMENT_REGISTRY" || wf === "AGREEMENT_REGISTRY_PROCESS") return "AGREEMENT_REGISTRY_PROCESS";

        return "WITHOUT_LOAN";
    };

    const buildStepsFromWorkflow = (workflowCode) => {
        // These would ideally come from an API endpoint
        // For now, we'll define default workflow steps based on workflow code
        const defaultSteps = {
            WITH_LOAN: [
                "Booking Created",
                "Document Collection",
                "Bank Loan Application",
                "Loan Sanction",
                "Agreement Draft Preparation",
                "DD Submission to Bank",
                "Agreement Execution",
                "Property Handover"
            ],
            WITHOUT_LOAN: [
                "Booking Created",
                "Document Collection",
                "Payment Processing",
                "Agreement Draft Preparation",
                "Agreement Execution",
                "Property Handover"
            ],
            WITHOUT_7DAY_CLOSED: [
                "Booking Created",
                "Document Collection",
                "Full Payment",
                "Agreement Draft (24 Hours)",
                "Agreement Execution (48 Hours)",
                "Property Handover (7 Days)"
            ],
            AGREEMENT_REGISTRY_PROCESS: [
                "Booking Created",
                "Document Verification",
                "Agreement Draft",
                "Registry Process",
                "Stamp Duty Payment",
                "Registration",
                "Property Transfer"
            ]
        };

        const stepTitles = defaultSteps[workflowCode] || defaultSteps.WITHOUT_LOAN;
        return stepTitles.map((title, idx) => ({
            id: `wf-${workflowCode}-${idx}`,
            stepKey: `step_${idx}`,
            title,
            status: "pending"
        }));
    };

    const persistWorkflowSelection = (workflowCode) => {
        try {
            if (workflowCode) {
                localStorage.setItem("current_workflow_code", workflowCode);
            }

            if (!id || !workflowCode) return;

            const raw = localStorage.getItem(STORAGE_KEY);
            const list = raw ? JSON.parse(raw) : [];
            const isArray = Array.isArray(list) ? list : [];

            const nextList = isArray.some(b => String(b.id) === String(id))
                ? isArray.map(b => String(b.id) === String(id) ? { ...b, workflowCode, workflowType: workflowCode } : b)
                : [...isArray, { id, workflowCode, workflowType: workflowCode }];

            localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
        } catch (err) {
            // Silent error handling
        }
    };

    // Consolidated data fetching
    useEffect(() => {
        if (!id) return;

        // Store current booking ID for menu navigation
        localStorage.setItem('current_booking_id', id);

        const fetchBookingData = async () => {
            setLoading(true);
            try {
                // Fetch booking details
                const resp = await axiosInstance.get(API_ENDPOINTS.BOOKING_LIST);
                const listData = Array.isArray(resp.data) ? resp.data : (resp.data?.value || []);
                const apiBooking = listData.find(i => String(i.id) === String(id));
                
                if (apiBooking) {
                    const workflowCode = determineWorkflowCode(apiBooking);
                    const workflowSteps = buildStepsFromWorkflow(workflowCode);

                    const bookingData = {
                        id: apiBooking.id,
                        township: apiBooking.townshipName,
                        plotNumber: apiBooking.plotNo,
                        plotSize: apiBooking.plotSize,
                        clientMobile: apiBooking.contactNo,
                        clientName: apiBooking.clientName,
                        status: (apiBooking.status || "workflow_selected").toLowerCase(),
                        createdAt: apiBooking.bookingDate ? new Date(apiBooking.bookingDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                        steps: workflowSteps,
                        workflowCode,
                        workflowName: workflowNameMap[workflowCode] || workflowCode
                    };
                    
                    setBooking(bookingData);
                    setSteps(workflowSteps);
                    persistWorkflowSelection(workflowCode);

                    // Try to fetch additional booking details if endpoint exists
                    try {
                        const detailRes = await axiosInstance.get(
                            `${API_ENDPOINTS.GET_BOOKING_BY_ID}?bookingId=${apiBooking.id}`
                        );
                        const detail = detailRes?.data;
                        
                        if (detail) {
                            // You can update booking data with additional details here if needed
                        }
                    } catch (detailErr) {
                        // Silently ignore if detail endpoint fails
                    }
                }
            } catch (error) {
                // Handle error silently or show user-friendly message
            } finally {
                setLoading(false);
            }
        };

        fetchBookingData();
    }, [id]);

    const toggleStep = (sid) => {
        const next = steps.map(s => {
            if (s.id !== sid) return s;
            const newStatus = s.status === "completed" ? "pending" : "completed";
            return { ...s, status: newStatus, completedAt: newStatus === "completed" ? new Date().toISOString() : null };
        });
        setSteps(next);

        const allCompleted = next.length > 0 && next.every(x => x.status === "completed");
        if (allCompleted) {
            setBooking(prev => ({ ...prev, status: "closed", closedAt: new Date().toISOString() }));
        }
    };

    const handleStepClick = (stepIndex, step) => {
        localStorage.setItem('current_step_index', stepIndex.toString());
        localStorage.setItem('current_booking_id', id);
        if (booking?.workflowCode) {
            persistWorkflowSelection(booking.workflowCode);
        }
        window.dispatchEvent(new Event('stepChanged'));
    };

    if (loading) {
        return (
            <BookingWrapper className="booking-detail-container">
                <div className="booking-detail-header">
                    <div className="booking-detail-info">
                        <h2>Loading...</h2>
                    </div>
                    <button className="small-btn" onClick={() => navigate("/property")}>Back</button>
                </div>
            </BookingWrapper>
        );
    }

    if (!booking) {
        return (
            <BookingWrapper className="booking-detail-container">
                <div className="booking-detail-header">
                    <div className="booking-detail-info">
                        <h2>Booking not found</h2>
                    </div>
                    <button className="small-btn" onClick={() => navigate("/property")}>Back</button>
                </div>
            </BookingWrapper>
        );
    }

    const completedSteps = steps.filter(s => s.status === "completed").length;
    const totalSteps = steps.length;
    const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

    return (
        <BookingWrapper className="booking-detail-container">
            <div className="booking-detail-header">
                <div className="booking-detail-info">
                    <h2>Booking ID {booking.id}</h2>
                    <div className="booking-detail-meta">
                        <div className="booking-detail-meta-item">
                            📱 {booking.clientMobile || "N/A"}
                        </div>
                        <div className="booking-detail-meta-item">
                            📅 Created {booking.createdAt}
                        </div>
                        {booking.plotSize && (
                            <div className="booking-detail-meta-item">
                                📏 {booking.plotSize}
                            </div>
                        )}
                    </div>
                </div>
                <button className="small-btn" onClick={() => navigate(-1)}>Back</button>
            </div>

            <div className="card booking-status-card">
                <h3>Status</h3>
                <div className="booking-status-badges">
                    <span className={`booking-badge ${booking.status || 'booking_created'}`}>
                        {(booking.status || 'booking_created').replace(/_/g, ' ')}
                    </span>
                    {booking.workflowCode && (
                        <span className="booking-badge workflow_selected">
                            {booking.workflowName || booking.workflowCode}
                        </span>
                    )}
                </div>
            </div>

            <div className="card workflow-steps-card">
                <h3>Booking File Progress</h3>
                {steps.length === 0 ? (
                    <div className="workflow-empty">
                        <div className="workflow-empty-icon">📋</div>
                        <div className="workflow-empty-text">No workflow steps available</div>
                    </div>
                ) : (
                    <>
                        <ul className="workflow-steps-list">
                            {steps.map((s, index) => (
                                <li key={s.id} className="workflow-step-item">
                                    <input 
                                        type="checkbox" 
                                        className="workflow-step-checkbox"
                                        checked={s.status === "completed"} 
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            toggleStep(s.id);
                                        }} 
                                    />
                                    <div 
                                        className={`workflow-step-content ${s.status}`}
                                        onClick={() => handleStepClick(index, s)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="workflow-step-header">
                                            <div className={`workflow-step-title ${s.status}`}>{s.title}</div>
                                            {s.completedAt && (
                                                <div className="workflow-step-time">
                                                    ✓ {new Date(s.completedAt).toLocaleString()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="workflow-progress">
                            <div className="workflow-progress-text">
                                Progress: {completedSteps} of {totalSteps} steps completed ({Math.round(progressPercentage)}%)
                            </div>
                            <div className="workflow-progress-bar">
                                <div className="workflow-progress-fill" style={{ width: `${progressPercentage}%` }}></div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="card booking-info-card">
                <h3>Booking Information</h3>
                <div className="booking-info-grid">
                    <div className="booking-info-item">
                        <div className="booking-info-label">Booking ID</div>
                        <div className="booking-info-value">{booking.id}</div>
                    </div>
                    <div className="booking-info-item">
                        <div className="booking-info-label">Township</div>
                        <div className="booking-info-value">{booking.township || "N/A"}</div>
                    </div>
                    <div className="booking-info-item">
                        <div className="booking-info-label">Plot Number</div>
                        <div className="booking-info-value">{booking.plotNumber || "N/A"}</div>
                    </div>
                    <div className="booking-info-item">
                        <div className="booking-info-label">Plot Size</div>
                        <div className={`booking-info-value ${!booking.plotSize ? 'empty' : ''}`}>
                            {booking.plotSize || "Not specified"}
                        </div>
                    </div>
                    <div className="booking-info-item">
                        <div className="booking-info-label">Client Name</div>
                        <div className={`booking-info-value ${!booking.clientName ? 'empty' : ''}`}>
                            {booking.clientName || "Not provided"}
                        </div>
                    </div>
                    <div className="booking-info-item">
                        <div className="booking-info-label">Client Mobile</div>
                        <div className={`booking-info-value ${!booking.clientMobile ? 'empty' : ''}`}>
                            {booking.clientMobile || "Not provided"}
                        </div>
                    </div>
                    <div className="booking-info-item">
                        <div className="booking-info-label">Created Date</div>
                        <div className="booking-info-value">{booking.createdAt}</div>
                    </div>
                    {booking.updatedAt && (
                        <div className="booking-info-item">
                            <div className="booking-info-label">Last Updated</div>
                            <div className="booking-info-value">{booking.updatedAt}</div>
                        </div>
                    )}
                    {booking.closedAt && (
                        <div className="booking-info-item">
                            <div className="booking-info-label">Closed Date</div>
                            <div className="booking-info-value">{booking.closedAt}</div>
                        </div>
                    )}
                </div>
            </div>

        </BookingWrapper>
    );
}