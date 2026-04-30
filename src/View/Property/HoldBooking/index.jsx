import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyNavigation from '../PropertyNavigation';
import ReminderPopup from '../../../components/ReminderPopup';
import { MdPreview } from 'react-icons/md';
import { CiSaveDown2 } from 'react-icons/ci';
import {
    getCurrentUserRole,
    getAllPermissions,
} from '../../../utilities/rolePermissions';
import Swal from 'sweetalert2';
import axiosInstance from '../../../utilities/axiosInstance';
import API_ENDPOINTS from '../../../utilities/apiConfig';
import BookingWrapper from '../style';
import './style.css';
import hasPermission from '../../../utilities/HasPermission';

export default function HoldBooking() {
    const navigate = useNavigate();
    const [assocName, setAssociateName] = useState('');
    const [assocContact, setAssociateContact] = useState('');
    const [associateRERA, setAssociateRERA] = useState('');
    const [assocLeader, setAssociateLeader] = useState('');
    const [leaderContact, setLeaderContact] = useState('');
    const [showReminderPopup, setShowReminderPopup] = useState(false);
    const [townshipOptions, setTownshipOptions] = useState([]);
    const [availablePlots, setAvailablePlots] = useState([]);
    const [reraList, setReraList] = useState([]);
    const [reraSearch, setReraSearch] = useState('');
    const [debouncedReraSearch, setDebouncedReraSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [associateId, setAssociateiateId] = useState(null);
    const [holdBookingFormData, setHoldBookingFormData] = useState({
        plotId: '',
        workflowTypeId: '',
        townshipId: '',
        associateId: '',
        plotSize: '',
        agreementRate: '',
        totalAgreementValue: '',
        holdDateTime: '',
    });


    const inputRef = useRef(null);
    const role = getCurrentUserRole();
    const permissions = getAllPermissions(role);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchTownships = async () => {
            try {
                // Fetch all townships without userId filter
                const res = await axiosInstance.get(
                    // API_ENDPOINTS.TOWNSHIP_LIST+"?userId="+getUserId() ,
                    API_ENDPOINTS.TOWNSHIP_LIST
                );
                const list = Array.isArray(res.data)
                    ? res.data
                    : res.data?.value || [];
                setTownshipOptions(list);
            } catch (err) {
            }
        };
        fetchTownships();
    }, []);

    const getUserId = () => {
        const stored = localStorage.getItem("userId") || localStorage.getItem("spendwise_userId");
        const parsed = stored ? Number(stored) : NaN;
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
      };
    useEffect(() => {
        if (!holdBookingFormData.townshipId) {
            setAvailablePlots([]);

            return;
        }

        const fetchPlots = async () => {
            try {
                const response = await axiosInstance.get(
                    API_ENDPOINTS.PLOTS_LIST,
                    {
                        params: { townshipId: holdBookingFormData.townshipId },
                    }
                );

                const plots = Array.isArray(response.data)
                    ? response.data
                    : response.data?.value || [];

               const availableOnly = plots.filter((p) => {
                const status = (p.statusName || '').toLowerCase();
                return status === 'available';
                });

                setAvailablePlots(availableOnly);

            } catch (err) {
                setAvailablePlots([]);
            }
        };


        fetchPlots();
    }, [holdBookingFormData.townshipId]);


    const onlyDigits = useCallback(
        (value) => String(value ?? '').replace(/\D/g, ''),
        [],
    );
    const normalizeTenDigits = useCallback(
        (value) => onlyDigits(value).slice(0, 10),
        [onlyDigits],
    );
    const validateForm = () => {
    let newErrors = {};

    if (!holdBookingFormData.townshipId) {
        newErrors.townshipId = "Township is required";
    }

    if (!holdBookingFormData.plotId) {
        newErrors.plotId = "Plot is required";
    }

    if (!holdBookingFormData.holdDateTime) {
        newErrors.holdDateTime = "Hold date & time is required";
    }

    if (!associateId) {
        newErrors.associateId = "RERA selection is required";
    }

    if (!assocName) {
        newErrors.assocName = "Associate name is required";
    }

    if (!assocContact || assocContact.length !== 10) {
        newErrors.assocContact = "Valid 10 digit contact required";
    }

    if (!assocLeader) {
        newErrors.assocLeader = "Leader name is required";
    }

    if (!leaderContact || leaderContact.length !== 10) {
        newErrors.leaderContact = "Valid 10 digit leader contact required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
};
    const handleSaveBooking = useCallback(async (e) => {
        e.preventDefault();

        const {
            townshipId,
            plotId,
            workflowTypeId,
            plotSize,
            agreementRate,
            holdDateTime
        } = holdBookingFormData;

        const isValid = validateForm();

        if (!isValid) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please fill all required fields.',
            });
            return;
        }

        if (!associateId) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please select a valid Associate.',
            });
            return;
        }

        try {
            Swal.fire({
                title: 'Saving Hold Booking...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
            });

            const totalValue =
                (Number(plotSize) || 0) *
                (Number(agreementRate) || 0);

            const payload = {
                plotId: Number(plotId),
                associateId: Number(associateId),
                workflowTypeId: Number(workflowTypeId) || 0,
                townshipId: Number(townshipId),
                plotSize: Number(plotSize),
                agreementRate: Number(agreementRate) || 0,
                totalAgreementValue: totalValue,
                holdDateTime,
            };

            await axiosInstance.post(
                API_ENDPOINTS.PLOT_HOLD,
                payload
            );

            Swal.close();
            Swal.fire({
                icon: 'success',
                title: 'Hold Booking Created',
                text: 'Plot has been successfully placed on hold.',
            })

            setHoldBookingFormData({
                plotId: '',
                townshipId: '',
                workflowTypeId: '',
                associateId: '',
                plotSize: '',
                agreementRate: '',
                totalAgreementValue: '',
                holdDateTime: '',
            });
            setAssociateiateId(null);
            setReraSearch('');
            setAssociateName('');
            setAssociateContact('');
            setAssociateLeader('');
            setLeaderContact('');

        } catch (error) {
            Swal.close();
            Swal.fire({
                icon: 'error',
                title: 'Failed',
                text: error.response?.data || 'Failed to create hold booking.'
            });
        }

    }, [holdBookingFormData, associateId, navigate]);



    const handleSaveConfirmBooking = useCallback(
        (e) => {
            handleSaveBooking(e);
        },
        [handleSaveBooking],
    );

    const calculateTotal = () => {
        const r = Number(holdBookingFormData.agreementRate);
        const s = Number(holdBookingFormData.plotSize);
        if (Number.isNaN(r) || Number.isNaN(s) || r <= 0 || s <= 0) return '';
        const total = r * s;
        return `₹ ${total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
    };


    useEffect(() => {
        getReraList();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedReraSearch(reraSearch);
        }, 200); // 300ms debounce

        return () => clearTimeout(timer);
    }, [reraSearch]);

    const getReraList = async () => {
        try {
            // Associate list contains RERA numbers and contact info
            const response = await axiosInstance.get(
                API_ENDPOINTS.ASSOCIATE_LIST,
            );

            const listData = Array.isArray(response.data)
                ? response.data
                : response.data?.value || response.data?.data || [];
            const formattedData = listData.filter((item) => item.reraNo);
            setReraList(formattedData);
        } catch (error) {
        }
    };

    const filteredReraList = debouncedReraSearch
        ? reraList.filter((item) =>
            item.reraNo
                ?.toLowerCase()
                .includes(debouncedReraSearch.toLowerCase()),
        )
        : [];

    const handleReraSelect = (item) => {
        setAssociateiateId(item.id);
        setAssociateRERA(item.reraNo || '');
        setAssociateName(item.firstName || '');
        setAssociateLeader(item.leaderName || '');

        if (item.contactNo) {
            const digits = item.contactNo.replace(/\D/g, '').slice(-10);
            setAssociateContact(digits);
        } else {
            setAssociateContact('');
        }

        if (item.leaderContactNo) {
            const leaderDigits = item.leaderContactNo.replace(/\D/g, '').slice(-10);
            setLeaderContact(leaderDigits);
        } else {
            setLeaderContact('');
        }

        setReraSearch(item.reraNo);
        setShowDropdown(false);
    };

    const handleChange = (field, value) => {
    setHoldBookingFormData((prev) => ({
        ...prev,
        [field]: value,
    }));

    setErrors((prev) => ({
        ...prev,
        [field]: ''
    }));
};

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="dashboard-header-content">
                    <div className="dashboard-header-text">
                        <h2>Hold Booking</h2>
                        <p className="dashboard-subtitle">
                            Add a Hold booking with complete details
                        </p>
                    </div>
                </div>
                <div className="dashboard-header-actions">
                    <PropertyNavigation hideHealthButton hideNewBookingButton showHoldBookingList={true}/>
                </div>
            </div>

            <div className="card dashboard-form-card">
                <div className="form-section-header">
                    <h3 className='dashboard-table-title'>Booking Details</h3>
                    <div className="section-divider"></div>
                </div>

                <div className="upload-loan-form-grid">


                    <div className="upload-loan-field">
                        <label>Township Name <span className="required">*</span></label>
                        <select
                            value={holdBookingFormData.townshipId}
                            onChange={(e) => {
                                handleChange("townshipId", Number(e.target.value));
                                handleChange("plotId", '');
                                handleChange("plotSize", '');
                                handleChange("agreementRate", '');
                            }}
                            className='form-control'
                        >
                            <option value={0}>Select Township</option>
                            {townshipOptions.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>
                        {errors.townshipId && (
    <p className="error-text">{errors.townshipId}</p>
)}
                    </div>

                    <div className="upload-loan-field">
                        <label>Plot Number <span className="required">*</span></label>
                        <select
                            value={holdBookingFormData.plotId}
                            onChange={(e) => {
                                const selectedPlot = availablePlots.find(
                                    (p) => p.id === Number(e.target.value)
                                );
                                handleChange("plotId", Number(e.target.value));
                                handleChange("plotSize", selectedPlot?.plotSize || 0);
                            }}
                            disabled={!holdBookingFormData.townshipId}
                            className='form-control'
                        >
                            <option value={0}>-- Select Plot --</option>

                            {availablePlots.length > 0 ? (
                                availablePlots.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.plotNo} ({p.plotSize} SqYrds)
                                    </option>
                                ))
                            ) : (
                                holdBookingFormData.townshipId && (
                                    <option value="" disabled>
                                        No Plot Available
                                    </option>
                                )
                            )}
                        </select>
                        {errors.plotId && <p className="error-text">{errors.plotId}</p>}

                    </div>

                    <div className="upload-loan-field">
                        <label>Plot Size (Sq. Yards)</label>
                        <input
                            type="number"
                            value={holdBookingFormData.plotSize}
                            readOnly
                            placeholder="Enter plot size"
                            className='form-control'
                        />
                    </div>


                    <div className="upload-loan-field">
                        <label>Hold Date & Time <span className="required">*</span></label>
                        <input
                            type="datetime-local"
                            value={holdBookingFormData.holdDateTime}
                            onChange={(e) =>
                                handleChange("holdDateTime", e.target.value)
                            }
                            placeholder="Select hold date and time"
                            className='form-control'
                        />
                        {errors.holdDateTime && (
    <p className="error-text">{errors.holdDateTime}</p>
)}
                    </div>
                </div>
            </div>
            <div className="card booking-info-card">
                <form onSubmit={handleSaveBooking}>
                    {/* Association Information */}
                    <div className="booking-section">
                        <h4>
                            {/* <span className="section-number">2</span> */}
                            <span className="section-title">
                                Associate Information
                            </span>
                        </h4>
                        <div className="booking-form-grid">
                            <div className="booking-form-field">
                                <label htmlFor="assocRERA">RERA No <span className="required">*</span></label>

                                <div className="rera-wrapper">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        placeholder="Search RERA..."
                                        value={reraSearch}
                                        onChange={(e) => {
                                            setReraSearch(e.target.value);
                                            setShowDropdown(true);

                                            setErrors((prev) => ({
                                                ...prev,
                                                associateId: ''
                                            }));
                                        }}
                                        onFocus={() => {
                                            if (reraSearch)
                                                setShowDropdown(true);
                                        }}
                                        onBlur={() => {
                                            setTimeout(() => setShowDropdown(false), 150);
                                        }}
                                        className='form-control'
                                    />

                                    {showDropdown && (
                                        <div className="rera-dropdown-menu">
                                            {filteredReraList.length > 0 ? (
                                                filteredReraList.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="rera-dropdown-item"
                                                        onMouseDown={() =>
                                                            handleReraSelect(
                                                                item,
                                                            )
                                                        }
                                                    >
                                                        {item.reraNo}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="rera-dropdown-no-data">
                                                    No search found
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {errors.associateId && (
    <p className="error-text">{errors.associateId}</p>
)}
                                </div>
                            </div>

                            <div className="booking-form-field">
                                <label htmlFor="assocName">
                                    Associate Name <span className="required">*</span>
                                </label>
                                <input
                                    id="assocName"
                                    type="text"
                                    readOnly
                                    value={assocName}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                        setAssociateName(value);

                                        setErrors((prev) => ({
                                            ...prev,
                                            assocName: ''
                                        }));
                                    }}
                                    placeholder="Enter Associates Name"
                                    className="form-control"    
                                />
                            </div>
                            <div className="booking-form-field">
                                <label htmlFor="assocContact">
                                    Contact No <span className="required">*</span>
                                </label>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <input
                                        type="text"
                                        value="+91"
                                        disabled
                                        style={{ width: "60px" }}
                                        className="form-control"
                                    />
                                    <input
                                        id="assocContact"
                                        type="tel"
                                        readOnly
                                        value={assocContact}
                                        onChange={(e) => {
                                        const value = normalizeTenDigits(e.target.value);
                                        setAssociateContact(value);

                                        setErrors((prev) => ({
                                            ...prev,
                                            assocContact: ''
                                        }));
                                    }}
                                        placeholder="10 digit mobile"
                                        maxLength={10}
                                        className='form-control'
                                    />
                                </div>
                            </div>
                            <div className="booking-form-field">
                                <label htmlFor="assocLeader">
                                    Leader Name <span className="required">*</span>
                                </label>
                                <input
                                    id="assocLeader"

                                    type="text"
                                    readOnly
                                    value={assocLeader}
                                    onChange={(e) => {
    const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
    setAssociateLeader(value);

    setErrors((prev) => ({
        ...prev,
        assocLeader: ''
    }));
}}
                                    placeholder="Enter Name"
                                    className="form-control"    
                                />
                            </div>

                            <div className="booking-form-field">
                                <label htmlFor="leaderContact">
                                    Leader Contact No <span className="required">*</span>
                                </label>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <input
                                        type="text"
                                        value="+91"
                                        disabled
                                        style={{ width: "60px" }}
                                        className="form-control"
                                    />
                                    <input
                                        id="leaderContact"
                                        type="tel"
                                        readOnly
                                        value={leaderContact}
                                        onChange={(e) => {
                                            const value = normalizeTenDigits(e.target.value);
                                            setLeaderContact(value);

                                            setErrors((prev) => ({
                                                ...prev,
                                                leaderContact: ''
                                            }));
                                        }}
                                        placeholder="10 digit mobile"
                                        maxLength={10}
                                            className='form-control'
                                    />
                                </div>
                            </div>


                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="booking-form-actions">
                        {/* <button 
                            type="button" 
                            className="small-btn secondary booking-action-btn" 
                            onClick={() => navigate('/property')}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                <path d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span>Cancel</span>
                        </button> */}

                        {/* <button 
                            type="button" 
                            className="small-btn reminder booking-action-btn" 
                            onClick={handleOpenReminder}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <span>Reminder</span>
                        </button> */}

                        {/* {permissions.canSaveAndConfirmBooking && ( */}
                            <button
                                type="button"
                                className="primary-btn"
                                onClick={handleSaveConfirmBooking}
                            >
                                <CiSaveDown2 />
                                <span>Save & Hold Booking</span>
                            </button>
                      {/* //  )} */}

                        {/* {hasPermission("CanCreateBooking") &&(
                          
                                <div
                                    style={{
                                        padding: '12px',
                                        backgroundColor: '#fff3cd',
                                        border: '1px solid #ffeaa7',
                                        borderRadius: '6px',
                                        color: '#856404',
                                        fontSize: '14px',
                                        textAlign: 'center',
                                    }}
                                >
                                    <strong>Insufficient Permissions:</strong>{' '}
                                    Your role ({role || 'unknown'}) does not
                                    have permission to perform booking actions.
                                    Please contact your administrator.
                                </div>
                            )} */}
                    </div>
                </form>
            </div>

            {/* Reminder Popup */}
            <ReminderPopup
                isOpen={showReminderPopup}
                onClose={() => setShowReminderPopup(false)}
                title="Create Reminder"
            />
        </div>
    );
}
