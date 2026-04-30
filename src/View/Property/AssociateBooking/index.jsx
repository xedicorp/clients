import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyNavigation from '../PropertyNavigation';
import ReminderPopup from '../../../components/ReminderPopup';
import { CiSaveDown2 } from 'react-icons/ci';
import {
    getCurrentUserRole,
    getAllPermissions,
} from '../../../utilities/rolePermissions';
import Swal from 'sweetalert2';
import axiosInstance from '../../../utilities/axiosInstance';
import API_ENDPOINTS from '../../../utilities/apiConfig';
import './style.css';

export default function AssociateBooking() {
    const navigate = useNavigate();

    // Associate Info
    const [assocName, setAssociateName] = useState('');
    const [assocContact, setAssociateContact] = useState('');
    const [associateRERA, setAssociateRERA] = useState('');
    const [assocLeader, setAssociateLeader] = useState('');
    const [leaderContact, setLeaderContact] = useState('');
    const [associateId, setAssociateiateId] = useState(null);

    // UI
    const [showReminderPopup, setShowReminderPopup] = useState(false);

    // Dropdown / Data
    const [townshipOptions, setTownshipOptions] = useState([]);
    const [availablePlots, setAvailablePlots] = useState([]);
    const [reraList, setReraList] = useState([]);
    const [reraSearch, setReraSearch] = useState('');
    const [debouncedReraSearch, setDebouncedReraSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    const inputRef = useRef(null);

    // Main Form
    const [associateBookingFormData, setAssociateBookingFormData] = useState({
        plotId: '',
        workflowTypeId: '',
        townshipId: '',
        plotSize: '',
        agreementRate: '',
        totalAgreementValue: '',
        bookingDateTime: '',
    });

    const role = getCurrentUserRole();
    const permissions = getAllPermissions(role);

    const getUserId = () => {
        const stored = localStorage.getItem("userId") || localStorage.getItem("spendwise_userId");
        const parsed = stored ? Number(stored) : NaN;
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
    };

    // Fetch Townships
    useEffect(() => {
        const fetchTownships = async () => {
            try {
                const res = await axiosInstance.get(
                    // API_ENDPOINTS.TOWNSHIP_LIST + "?userId=" + getUserId()
                    API_ENDPOINTS.TOWNSHIP_LIST
                );
                const list = Array.isArray(res.data)
                    ? res.data
                    : res.data?.value || [];
                setTownshipOptions(list);
            } catch (err) {}
        };
        fetchTownships();
    }, []);

    // Fetch Plots
    useEffect(() => {
        if (!associateBookingFormData.townshipId) {
            setAvailablePlots([]);
            return;
        }

        const fetchPlots = async () => {
            try {
                const response = await axiosInstance.get(
                    API_ENDPOINTS.PLOTS_LIST,
                    {
                        params: { townshipId: associateBookingFormData.townshipId },
                    }
                );

                const plots = Array.isArray(response.data)
                    ? response.data
                    : response.data?.value || [];

                const availableOnly = plots.filter((p) => {
                    const status = (p.status || '').trim().toLowerCase();
                    return status === 'available';
                });

                setAvailablePlots(availableOnly);
            } catch (err) {
                setAvailablePlots([]);
            }
        };

        fetchPlots();
    }, [associateBookingFormData.townshipId]);

    // Mobile Helpers
    const normalizeTenDigits = (value) =>
        String(value ?? '').replace(/\D/g, '').slice(0, 10);

    // Save Booking
    const handleSaveBooking = useCallback(async (e) => {
        e.preventDefault();

        const {
            townshipId,
            plotId,
            workflowTypeId,
            plotSize,
            agreementRate,
            bookingDateTime
        } = associateBookingFormData;

        if (!townshipId || !plotId || !bookingDateTime) {
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
                title: 'Saving Associate Booking...',
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
                bookingDateTime,
            };

            await axiosInstance.post(
                API_ENDPOINTS.PLOT_HOLD, // 🔁 later change
                payload
            );

            Swal.close();
            Swal.fire({
                icon: 'success',
                title: 'Associate Booking Created',
                text: 'Booking has been successfully created.',
            });

            // Reset
            setAssociateBookingFormData({
                plotId: '',
                townshipId: '',
                workflowTypeId: '',
                plotSize: '',
                agreementRate: '',
                totalAgreementValue: '',
                bookingDateTime: '',
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
                text: error.response?.data || 'Failed to create associate booking.'
            });
        }

    }, [associateBookingFormData, associateId]);

    // RERA List
    useEffect(() => {
        getReraList();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedReraSearch(reraSearch);
        }, 200);
        return () => clearTimeout(timer);
    }, [reraSearch]);

    const getReraList = async () => {
        try {
            const response = await axiosInstance.get(
                API_ENDPOINTS.ASSOCIATE_LIST
            );

            const listData = Array.isArray(response.data)
                ? response.data
                : response.data?.value || response.data?.data || [];

            setReraList(listData.filter((item) => item.reraNo));
        } catch (error) {}
    };

    const filteredReraList = debouncedReraSearch
        ? reraList.filter((item) =>
            item.reraNo?.toLowerCase().includes(debouncedReraSearch.toLowerCase())
        )
        : [];

    const handleReraSelect = (item) => {
        setAssociateiateId(item.id);
        setAssociateRERA(item.reraNo || '');
        setAssociateName(item.firstName || '');
        setAssociateLeader(item.leaderName || '');

        setAssociateContact(
            item.contactNo?.replace(/\D/g, '').slice(-10) || ''
        );

        setLeaderContact(
            item.leaderContactNo?.replace(/\D/g, '').slice(-10) || ''
        );

        setReraSearch(item.reraNo);
        setShowDropdown(false);
    };

    const handleChange = (field, value) => {
        setAssociateBookingFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h2>Associate Booking</h2>
                    <p className="dashboard-subtitle">
                        Add an Associate booking with complete details
                    </p>
                </div>
                <PropertyNavigation hideHealthButton showHoldBookingList />
            </div>

            <div className="card">
                <h3>Associate Booking Details</h3>

                <div className="upload-loan-form-grid">

                    <div>
                        <label>Township *</label>
                        <select
                            value={associateBookingFormData.townshipId}
                            onChange={(e) => {
                                handleChange("townshipId", Number(e.target.value));
                                handleChange("plotId", '');
                            }}
                        >
                            <option value="">Select</option>
                            {townshipOptions.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label>Plot *</label>
                        <select
                            value={associateBookingFormData.plotId}
                            onChange={(e) => {
                                const plot = availablePlots.find(p => p.id === Number(e.target.value));
                                handleChange("plotId", Number(e.target.value));
                                handleChange("plotSize", plot?.plotSize || 0);
                            }}
                        >
                            <option value="">Select</option>
                            {availablePlots.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.plotNo}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label>Booking Date *</label>
                        <input
                            type="datetime-local"
                            value={associateBookingFormData.bookingDateTime}
                            onChange={(e) =>
                                handleChange("bookingDateTime", e.target.value)
                            }
                        />
                    </div>
                </div>
            </div>

            <div className="card">
                <h3>Associate Information</h3>

                <input
                    placeholder="Search RERA..."
                    value={reraSearch}
                    onChange={(e) => {
                        setReraSearch(e.target.value);
                        setShowDropdown(true);
                    }}
                />

                {showDropdown && (
                    <div>
                        {filteredReraList.map(item => (
                            <div key={item.id} onMouseDown={() => handleReraSelect(item)}>
                                {item.reraNo}
                            </div>
                        ))}
                    </div>
                )}

                <input value={assocName} placeholder="Name" readOnly />
                <input value={assocContact} placeholder="Contact" readOnly />
            </div>

            <button className="primary-btn" onClick={handleSaveBooking}>
                <CiSaveDown2 /> Save Associate Booking
            </button>

            <ReminderPopup
                isOpen={showReminderPopup}
                onClose={() => setShowReminderPopup(false)}
                title="Create Reminder"
            />
        </div>
    );
}