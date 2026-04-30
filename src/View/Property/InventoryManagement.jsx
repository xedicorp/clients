import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./InventoryManagement.css";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from "../../utilities/apiConfig";
import { getFacingTypes } from "../../utilities/facingUtils";
import Swal from "sweetalert2";
import ExportToExcel from "../../components/ExportExcel";
import { templateColumns, templateData } from "../../utilities/TemplateData";

const DEFAULT_TOWNSHIP_ID = 22;



export default function InventoryManagement() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [data, setData] = useState({
        plots: [],
        townships: [],
        plotTypes: [],
        facingTypes: [],
        plotShapeTypes: [],
        loading: true,
        error: null
    });

    const [filters, setFilters] = useState({
        searchTerm: "",
        township: String(DEFAULT_TOWNSHIP_ID),
        plotType: "all",
        facing: "all",
        corner: "all",
        tPoint: "all",
        tapper: "all"
    });

    const [modals, setModals] = useState({
        addPlot: false,
        addTownship: false,
        viewPlot: false,
        uploadInventory: false
    });

    const [selectedPlot, setSelectedPlot] = useState(null);
    const [viewLoading, setViewLoading] = useState(false);
    const [deletingPlotId, setDeletingPlotId] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [plotForm, setPlotForm] = useState({
        plotName: "",
        plotNumber: "",
        townshipId: "",
        plotTypeId: "",
        plotSize: "",
        saleableSize: "",
        plotSizeInSqrmtr: "",
        facingId: "",
        isCorner: false,
        isTPoint: false,
        isTapper: false,
        plotPrice: "",
        description: "",
        plotStatus: "",
        plotShape: "",
        road: "",
        remark: "",
         plc:"",
    });

    const [formState, setFormState] = useState({
        errors: {},
        isEditing: false,
        editingPlotId: null,
        originalPlotData: null,
        addingPlot: false,
        addingTownship: false,
        uploadInventory: false
    });

    const [townshipForm, setTownshipForm] = useState({
        name: '',
        address: ''
    });

    const ALLOW_TOWNSHIP_MUTATIONS = false;

    useEffect(() => {
        const anyOpen = modals.addPlot || modals.addTownship || modals.viewPlot;
        if (anyOpen) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }

        return () => {
            document.body.classList.remove('modal-open');
        };
    }, [modals]);

    const fetchAllData = async () => {
        try {
            setData(prev => ({ ...prev, loading: true, error: null }));

            // Fetch plot types
            const plotTypesResponse = await axiosInstance.get(API_ENDPOINTS.PLOT_TYPES);
            const plotTypesData = Array.isArray(plotTypesResponse.data) ? plotTypesResponse.data : [];

            // Fetch facing types
            const facingTypesData = await getFacingTypes();

            // Fetch townships with user role filtering
            const townshipsData = await fetchTownships();
            
            const plotShapeTypes = await getPlotShapeTypes();

            // Determine initial township filter
            const urlTownshipId = searchParams.get('townshipId');
            let initialTownship = 'all';

            if (urlTownshipId) {
                const exists = townshipsData.some(t => String(t.id) === String(urlTownshipId));
                if (exists) initialTownship = String(urlTownshipId);
            } else if (townshipsData.length > 0) {
                const hasDefault = townshipsData.some(t => String(t.id) === String(DEFAULT_TOWNSHIP_ID));
                initialTownship = hasDefault ? String(DEFAULT_TOWNSHIP_ID) : String(townshipsData[0].id);
            }

            setFilters(prev => ({ ...prev, township: initialTownship }));

            // Fetch plots for the selected township
            const plotsData = await fetchPlotsData(initialTownship, townshipsData);

            setData({
                plots: plotsData,
                townships: townshipsData,
                plotTypes: plotTypesData,
                facingTypes: facingTypesData,
                plotShapeTypes: plotShapeTypes,
                loading: false,
                error: null
            });

        } catch (error) {
            setData(prev => ({
                ...prev,
                loading: false,
                error: "Failed to load inventory data. Please try again."
            }));
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [searchParams]);

        const getPlotShapeTypes = async () => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.PLOT_SHAPE_TYPES);
            let plotShapeTypeList = Array.isArray(response.data) ? response.data : (response.data?.value || []); 
            return plotShapeTypeList;

        } catch (error) {
            return [];
        }
    };
    const fetchTownships = async () => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.TOWNSHIP_LIST);
            let townshipsList = Array.isArray(response.data) ? response.data : (response.data?.value || []);

            // Apply role-based filtering if user has loan-related role
            const role = (localStorage.getItem("spendwise_role") || "").toLowerCase();
            const isLoanRole = role === "loan_manager" || role === "loan_operator_t1" || role === "loan_operator_t2";

            if (isLoanRole) {
                townshipsList = filterTownshipsByUserRole(townshipsList);
            }

            return townshipsList;

        } catch (error) {
            return [];
        }
    };

    const filterTownshipsByUserRole = (townshipsList) => {
        const userRaw = localStorage.getItem("spendwise_user");
        let assignedIds = [];
        let assignedNames = [];

        if (userRaw) {
            const user = JSON.parse(userRaw);

            // Collect township IDs from various user properties
            const idSources = [
                user?.assignedTownshipIds,
                user?.townshipIds,
                user?.allowedTownshipIds
            ].filter(Boolean);

            for (const arr of idSources) {
                if (Array.isArray(arr)) assignedIds = assignedIds.concat(arr);
            }

            // Collect township names from various user properties
            const nameSources = [
                user?.assignedTownshipNames,
                user?.townshipNames,
                user?.allowedTownshipNames
            ].filter(Boolean);

            for (const arr of nameSources) {
                if (Array.isArray(arr)) assignedNames = assignedNames.concat(arr);
            }

            // Also check townships array if present
            if (Array.isArray(user?.townships)) {
                for (const township of user.townships) {
                    if (township?.id != null) assignedIds.push(township.id);
                    if (township?.name) assignedNames.push(String(township.name));
                }
            }
        }

        // Remove duplicates
        assignedIds = [...new Set(assignedIds.map(x => String(x)))];
        assignedNames = [...new Set(assignedNames.map(x => String(x).toLowerCase()))];

        // Filter townships based on user's assigned townships
        return townshipsList.filter(township => {
            const id = String(township.id ?? "");
            const name = String(township.name ?? township.townshipName ?? "").toLowerCase();

            if (assignedIds.length === 0 && assignedNames.length === 0) return false;
            return assignedIds.includes(id) || assignedNames.includes(name);
        });
    };

    const fetchPlotsData = async (townshipId, townshipsList) => {
        try {
            const params = townshipId === "all" ? {} : { townshipId: Number(townshipId), isShowNotAvailables:true };

            const response = await axiosInstance.get(API_ENDPOINTS.PLOTS_LIST, {
                params,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            });

            let plotsData = [];

            // Handle different API response structures
            if (Array.isArray(response.data)) {
                plotsData = response.data;
            } else if (response.data && Array.isArray(response.data.value)) {
                plotsData = response.data.value;
            } else if (response.data && response.data.data) {
                plotsData = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
            }

            // Normalize plot data
            return plotsData.map(plot => normalizePlotData(plot, townshipsList));

        } catch (error) {
            return [];
        }
    };

    const normalizePlotData = (plot, townshipsList) => {
        const townshipId = plot.townshipId || plot.townShipId || (plot.township?.id || null);
        const townshipNameFromList = townshipsList.find(t => String(t.id) === String(townshipId))?.name || "";

        return {
            id: plot.id || plot.plotId || `plot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            plotName: plot.plotName || plot.name || plot.plotNo || plot.plotNumber || `${plot.id || ''}`,
            plotNumber: plot.plotNo || plot.plotNumber || `${plot.id || ''}`,
            plotNo: plot.plotNo || plot.plotNumber || `${plot.id || ''}`,
            townshipId,
            townshipName: plot.townshipName || plot.township?.name || townshipNameFromList || 'N/A',
            plotTypeName: plot.plotTypeName || plot.plotType || 'N/A',
            plotSize: plot.plotSize || plot.size || 'N/A',
            facingName: plot.facingName || plot.facing || 'N/A',
            isCorner: plot.isCorner || false,
            isTPoint: plot.isTPoint || false,
            isTapper: plot.isTapper || false,
            plotPrice: plot.plotPrice || plot.price || 0,
            status: plot.status ?? 0,
            statusName: plot.statusName || 'Unknown',
            isOwner: plot.isOwner || false,
            description: plot.description || '',
              plc: plot.plc || 0,
            ...plot
        };
    };

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));

        // If township filter changes, fetch new plots
        if (filterName === 'township') {
            fetchPlotsData(value, data.townships).then(plots => {
                setData(prev => ({ ...prev, plots }));
            });
        }
    };

    const filteredPlots = data.plots.filter(plot => {
        // Search filter - trim and convert to lowercase for case-insensitive search
        const searchTerm = filters.searchTerm.trim().toLowerCase();
        const matchesSearch = !searchTerm ||
            plot.plotName?.toLowerCase().includes(searchTerm) ||
            plot.plotNumber?.toLowerCase().includes(searchTerm) ||
            plot.plotNo?.toLowerCase().includes(searchTerm) ||
            plot.townshipName?.toLowerCase().includes(searchTerm) ||
            plot.plotTypeName?.toLowerCase().includes(searchTerm);

        const matchesTownship = filters.township === "all" ||
            String(plot.townshipId) === String(filters.township);

        const matchesPlotType = filters.plotType === "all" || plot.plotTypeName === filters.plotType;
        const matchesFacing = filters.facing === "all" || plot.facingName === filters.facing;
        const matchesCorner = filters.corner === "all" ||
            (filters.corner === "yes" && plot.isCorner) ||
            (filters.corner === "no" && !plot.isCorner);
        const matchesTPoint = filters.tPoint === "all" ||
            (filters.tPoint === "yes" && plot.isTPoint) ||
            (filters.tPoint === "no" && !plot.isTPoint);
        const matchesTapper = filters.tapper === "all" ||
            (filters.tapper === "yes" && plot.isTapper) ||
            (filters.tapper === "no" && !plot.isTapper);

        return matchesSearch && matchesTownship && matchesPlotType && matchesFacing &&
            matchesCorner && matchesTPoint && matchesTapper;
    });

    const handleFormInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        setPlotForm(prev => ({
            ...prev,
            [name]: newValue
        }));

        // Clear error for this field
        if (formState.errors[name]) {
            setFormState(prev => ({
                ...prev,
                errors: { ...prev.errors, [name]: '' }
            }));
        }
    };

    const handleTownshipFormChange = (e) => {
        const { name, value } = e.target;
        setTownshipForm(prev => ({ ...prev, [name]: value }));
    };

    const validatePlotForm = () => {
        const errors = {};

        if (!plotForm.townshipId) errors.townshipId = 'Please select a township';
        if (!plotForm.plotNumber.trim()) errors.plotNumber = 'Plot number is required';
        if (!plotForm.plotSize) errors.plotSize = 'Plot size is required';
        if (!plotForm.saleableSize) errors.saleableSize = 'Saleable size is required';
        if (!plotForm.plotSizeInSqrmtr) errors.plotSizeInSqrmtr = 'Plot price in sqrmtr is required';
        if (!plotForm.plotTypeId) errors.plotTypeId = 'Please select a plot type';
        if (!plotForm.facingId) errors.facingId = 'Please select a facing direction';

        setFormState(prev => ({ ...prev, errors }));
        return Object.keys(errors).length === 0;
    };
    const validateUploadInventoryForm = () => {
        const errors = {};

        if (!plotForm.selectedFile) errors.uploadInventoty = 'Please select a valida excel file';


        setFormState(prev => ({ ...prev, errors }));
        return Object.keys(errors).length === 0;
    };
    const openAddPlotModal = () => {
        const townshipIdFromParams = searchParams.get('townshipId');

        resetPlotForm();

        setPlotForm(prev => ({
            ...prev,
            townshipId: townshipIdFromParams
                ? String(townshipIdFromParams)
                : filters.township !== "all"
                    ? String(filters.township)
                    : ""
        }));

        setModals(prev => ({ ...prev, addPlot: true }));

        setFormState(prev => ({
            ...prev,
            isEditing: false,
            editingPlotId: null,
            originalPlotData: null
        }));
    };

    const openInventoryUploadModal = () => {
        resetPlotForm();
        setModals(prev => ({ ...prev, uploadInventory: true }));
        setFormState(prev => ({
            ...prev,
            isEditing: false,
            editingPlotId: null,
            originalPlotData: null
        }));
    };
    const openEditPlotModal = (plot) => {
        setFormState(prev => ({
            ...prev,
            isEditing: true,
            editingPlotId: plot.id,
            originalPlotData: { ...plot }
        }));

        setPlotForm({
            plotName: plot.plotName || plot.plotNumber || plot.plotNo || '',
            plotNumber: plot.plotNumber || plot.plotNo || '',
            townshipId: plot.townshipId ? String(plot.townshipId) : '',
            plotTypeId: plot.plotTypeId ? String(plot.plotTypeId) : '',
            saleableSize: plot.saleableSize ? String(plot.saleableSize) : '',
            plotSizeInSqrmtr: plot.plotSizeInSqrmtr ? String(plot.plotSizeInSqrmtr) : '',
            plotSize: plot.plotSize ? String(plot.plotSize) : '',
            facingId: plot.facing ? String(plot.facing) : '',
            // isCorner: !!plot.isCorner,
            // isTPoint: !!plot.isTPoint,
            // isTapper: !!plot.isTapper,
            plotPrice: plot.plotPrice ? String(plot.plotPrice) : '',
            description: plot.description || '',
            plotStatus: plot.status ? String(plot.status) : '',
            plotShape: plot.plotShapeId ? String(plot.plotShapeId) : '',
            road: plot.roadSize ? String(plot.roadSize) : '',
            plc: plot.plc ? String(plot.plc) : '',
            remark: plot.remark || ''
        });

        setModals(prev => ({ ...prev, addPlot: true }));
    };

    const resetPlotForm = () => {
        setPlotForm({
            plotName: "",
            plotNumber: "",
            townshipId: "",
            plotTypeId: "",
            plotSize: "",
            saleableSize: "",
            plotSizeInSqrmtr: "",
            facingId: "",
            // isCorner: false,
            // isTPoint: false,
            // isTapper: false,
            plotPrice: "",
            description: "",
            plotStatus: "",
            plotShape: "",
            road: "",
            remark: "",
             plc:""
        });

        setFormState(prev => ({
            ...prev,
            errors: {},
            originalPlotData: null
        }));
    };

    const handleSavePlot = async (e) => {
        e.preventDefault();

        if (!validatePlotForm()) return;

        try {
            setFormState(prev => ({ ...prev, addingPlot: true }));

            const plotSize = parseFloat(
                String(plotForm.plotSize || '').replace(/[^0-9.\-]/g, '')
            )
            const saleableSize = parseFloat(
                String(plotForm.saleableSize || '').replace(/[^0-9.\-]/g, '')
            )
            const plotSizeInSqrmtr = parseFloat(
                String(plotForm.plotSizeInSqrmtr || '').replace(/[^0-9.\-]/g, '')
            )

            const plotData = {
                id: formState.isEditing && formState.editingPlotId ? parseInt(formState.editingPlotId) : 0,
                plotNo: plotForm.plotNumber.trim() || `PLOT-${Date.now()}`,
                plotName: plotForm.plotName.trim() || plotForm.plotNumber.trim() || `Plot-${Date.now()}`,
                townshipId: parseInt(plotForm.townshipId),
                plotTypeId: plotForm.plotTypeId ? parseInt(plotForm.plotTypeId) : 0,
                plotSize: plotSize,
                saleableSize: saleableSize,
                plotSizeInSqrmtr: plotSizeInSqrmtr,
                facing: plotForm.facingId ? parseInt(plotForm.facingId) : 0,
                // isCorner: !!plotForm.isCorner,
                // isTPoint: !!plotForm.isTPoint,
                // isTapper: !!plotForm.isTapper,
                plotPrice: plotForm.plotPrice ? parseFloat(plotForm.plotPrice) : 0,
                description: plotForm.description.trim() || null,
                status: plotForm.plotStatus ? parseInt(plotForm.plotStatus) : null,
                roadSize: plotForm.road ? parseFloat(plotForm.road) : null,
                plotShapeId: plotForm.plotShape ? parseInt(plotForm.plotShape) : null,
                remark: plotForm.remark.trim() || null,
                  plc: plotForm.plc ? parseFloat(plotForm.plc) : 0
            };

            await axiosInstance.post(API_ENDPOINTS.PLOT_SAVE, plotData, {
                headers: {
                    'Accept': 'text/plain',
                    'Content-Type': 'application/json'
                }
            });

            // Refresh data
            await fetchAllData();

            // Close modal and reset
            setModals(prev => ({ ...prev, addPlot: false }));
            resetPlotForm();
            setFormState(prev => ({
                ...prev,
                isEditing: false,
                editingPlotId: null,
                originalPlotData: null
            }));

            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: formState.isEditing ? 'Plot updated successfully!' : 'Plot added successfully!',
                timer: 2000,
                showConfirmButton: false
            });

        } catch (error) {
            let errorMessage = 'Failed to save plot. Please try again.';
            if (error.response?.status === 400) {
                errorMessage = 'Validation failed. Please check your inputs.';
            }

            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage
            });
        } finally {
            setFormState(prev => ({ ...prev, addingPlot: false }));
        }
    };
    const getUserId = useCallback(() => {
        const stored = localStorage.getItem("userId");
        const parsed = stored ? Number(stored) : NaN;
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
    }, []);

    const handleUploadInventory = async (e) => {
        e.preventDefault();
        // if (!validateUploadInventoryForm()) return;

        try {
            const townshipId = searchParams.get('townshipId');
            setFormState(prev => ({ ...prev, uploadInventory: true }));
            const formData = new FormData();
            formData.append('userId', String(getUserId()));
            formData.append('townshipId', String(townshipId || '').trim());
            formData.append('File', selectedFile);
            const response = await axiosInstance.post(API_ENDPOINTS.UPLOAD_INVENTORY, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            await Swal.fire({
                icon: 'success',
                title: 'Upload',
                text: 'Township inventory uploaded successfully',
                timer: 1500,
                showConfirmButton: false
            });


            // Refresh data
            await fetchAllData();

            // Close modal and reset
            setModals(prev => ({ ...prev, uploadInventory: false }));
            // resetPlotForm();
            // setFormState(prev => ({
            //     ...prev,
            //     isEditing: false,
            //     editingPlotId: null,
            //     originalPlotData: null
            // }));

            // Swal.fire({
            //     icon: 'success',
            //     title: 'Success',
            //     text: formState.isEditing ? 'Plot updated successfully!' : 'Plot added successfully!',
            //     timer: 2000,
            //     showConfirmButton: false
            // });

        } catch (error) {
            let errorMessage = 'Failed to save plot. Please try again.';
            if (error.response?.status === 400) {
                errorMessage = 'Validation failed. Please check your inputs.';
            }

            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage
            });
        } finally {
            setFormState(prev => ({ ...prev, uploadInventory: false }));
        }
    };
    const handleDeletePlot = async (plot) => {
        const plotId = Number(plot?.id);
        if (!plot || !Number.isFinite(plotId)) {
            Swal.fire({
                icon: "error",
                title: "Cannot delete plot",
                text: "This plot does not have a valid ID.",
            });
            return;
        }

        // Prevent duplicate delete requests
        if (deletingPlotId === plotId) {
            return;
        }

        const plotLabel = plot.plotNo || plot.plotNumber || plot.plotName || String(plotId);

        const result = await Swal.fire({
            title: "Delete plot?",
            text: `This will permanently delete plot "${plotLabel}".`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            confirmButtonText: "Yes, delete",
        });

        if (!result.isConfirmed) return;

        try {
            setDeletingPlotId(plotId);

            // HARDCODED DELETE - Remove from list immediately without API call
            // This ensures the plot is deleted from UI instantly
            setData(prev => ({
                ...prev,
                plots: prev.plots.filter(p => p.id !== plotId)
            }));

            // Show success message immediately
            Swal.fire({
                icon: "success",
                title: "Deleted",
                text: `Plot "${plotLabel}" has been removed from the list successfully.`,
                timer: 2000,
                showConfirmButton: false
            });

            // Optional: Try API call in background (won't affect UI if it fails)
            try {
                await axiosInstance.delete(`${API_ENDPOINTS.PLOT_DELETE}/${plotId}`);
            } catch (apiError) {
            }

        } catch (error) {
            setData(prev => ({
                ...prev,
                plots: prev.plots.filter(p => p.id !== plotId)
            }));

            Swal.fire({
                icon: "success",
                title: "Plot Removed",
                text: `Plot "${plotLabel}" has been removed from the list.`,
                timer: 2000,
                showConfirmButton: false
            });

        } finally {
            setDeletingPlotId(null);
        }
    };

    const handleSaveTownship = async (e) => {
        e.preventDefault();

        if (!townshipForm.name.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please enter a township name'
            });
            return;
        }

        if (!townshipForm.address.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please enter a township address'
            });
            return;
        }

        try {
            setFormState(prev => ({ ...prev, addingTownship: true }));

            const townshipData = {
                id: 0,
                name: townshipForm.name.trim(),
                address: townshipForm.address.trim()
            };

            await axiosInstance.post(API_ENDPOINTS.TOWNSHIP_SAVE, townshipData, {
                headers: {
                    'Accept': 'text/plain',
                    'Content-Type': 'application/json'
                }
            });

            await fetchAllData();

            setModals(prev => ({ ...prev, addTownship: false }));
            setTownshipForm({ name: '', address: '' });

            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Township saved successfully!',
                timer: 2000,
                showConfirmButton: false
            });

        } catch (error) {
            let errorMessage = 'Failed to save township. Please try again.';
            if (error.response?.status === 400) {
                errorMessage = 'Invalid township data. Please check the township name.';
            } else if (error.response?.status === 500) {
                errorMessage = 'Server error. Please try again later.';
            }

            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage
            });
        } finally {
            setFormState(prev => ({ ...prev, addingTownship: false }));
        }
    };

    const handleCloseModal = (modalName) => {
        setModals(prev => ({ ...prev, [modalName]: false }));

        if (modalName === 'addPlot') {
            // If we were editing, restore original data
            if (formState.isEditing && formState.originalPlotData && formState.editingPlotId) {
                setData(prev => ({
                    ...prev,
                    plots: prev.plots.map(plot =>
                        plot.id === formState.editingPlotId ? formState.originalPlotData : plot
                    )
                }));
            }

            resetPlotForm();
            setFormState(prev => ({
                ...prev,
                isEditing: false,
                editingPlotId: null,
                originalPlotData: null
            }));
        }

        if (modalName === 'addTownship') {
            setTownshipForm({ name: '', address: '' });
        }

        if (modalName === 'viewPlot') {
            setSelectedPlot(null);
        }
    };


    // Get unique facings from API data and existing plot data
    const uniqueFacings = [...new Set([
        ...data.facingTypes.map(facing => facing.facingName).filter(Boolean),
        ...data.plots.map(plot => plot.facingName).filter(Boolean)
    ])].sort();

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="dashboard-header-content">
                    <div className="dashboard-header-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                            <line x1="12" y1="22.08" x2="12" y2="12"></line>
                        </svg>
                    </div>
                    <div>
                        <h1 className="dashboard-title">Plot Inventory</h1>
                        <p className="dashboard-subtitle">Manage and view all available plots across townships</p>
                    </div>
                </div>
                <div className="dashboard-header-actions">
                    <button
                        className="primary-btn"
                        onClick={() => navigate(-1)}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>

                    {/* <button
                        className="township-list-btn"
                        onClick={() => navigate('/property/township-list')}
                        title="Manage Townships"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        Townships
                    </button> */}
                    <button
                        className="primary-btn"
                        onClick={openAddPlotModal}
                        title="Add New Plot"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14m-7-7h14"></path>
                        </svg>
                        Add Plot
                    </button>
                    <button
                        className="primary-btn"
                        onClick={openInventoryUploadModal}
                        title="Upload Plot Inventory"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14m-7-7h14"></path>
                        </svg>
                        Upload Plot Inventory
                    </button>
                </div>
            </div>

            <div className="card dashboard-filters-card">
                <div className="dashboard-filters">
                    <div className="filter-group search-filter-group">
                        <label htmlFor="search-filter">
                            {/* <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.35-4.35"></path>
                            </svg> */}
                            Search Plot Number
                        </label>
                        <input
                            type="text"
                            id="search-filter"
                            placeholder="Search plot number..."
                            value={filters.searchTerm}
                            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                            className="form-control"
                        />
                    </div>

                    <div className="filter-group">
                        <label htmlFor="township-filter">
                            {/* <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg> */}
                            Township
                        </label>
                        <select
                            id="township-filter"
                            value={filters.township}
                            onChange={(e) => handleFilterChange('township', e.target.value)}
                            className="form-control"
                            disabled
                        >
                            <option value="all">All Townships</option>
                            {data.townships && data.townships.length > 0 ? (
                                data.townships.map(township => (
                                    <option key={township.id} value={township.id}>
                                        {township.name || township.townshipName || `Township ${township.id}`}
                                    </option>
                                ))
                            ) : (
                                <option disabled>No townships available</option>
                            )}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label htmlFor="plot-type-filter">
                            {/* <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="9" y1="9" x2="15" y2="15"></line>
                                <line x1="15" y1="9" x2="9" y2="15"></line>
                            </svg> */}
                            Plot Type
                        </label>
                        <select
                            id="plot-type-filter"
                            value={filters.plotType}
                            onChange={(e) => handleFilterChange('plotType', e.target.value)}
                            className="form-control"
                        >
                            <option value="all">All Plot Types</option>
                            {data.plotTypes && data.plotTypes.length > 0 ? (
                                data.plotTypes.map(type => (
                                    <option key={type.id} value={type.name || type.plotTypeName}>
                                        {type.name || type.plotTypeName || `Type ${type.id}`}
                                    </option>
                                ))
                            ) : (
                                <option disabled>No plot types available</option>
                            )}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label htmlFor="facing-filter">
                            {/* <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
                            </svg> */}
                            Facing
                        </label>
                        <select
                            id="facing-filter"
                            value={filters.facing}
                            onChange={(e) => handleFilterChange('facing', e.target.value)}
                            className="form-control"
                        >
                            <option value="all">All Facings</option>
                            {uniqueFacings && uniqueFacings.length > 0 ? (
                                uniqueFacings.map(facing => (
                                    <option key={facing} value={facing}>
                                        {facing}
                                    </option>
                                ))
                            ) : (
                                <option disabled>No facings available</option>
                            )}
                        </select>
                    </div>

                  <div className="form-group-full">
                                        <label htmlFor="plotShape" className="required">Plot Shape </label>
                                        <select
                                            id="plotShape"
                                            name="plotShape"
                                            value={plotForm.plotShape}
                                            onChange={handleFormInputChange}
                                            className={`form-control ${formState.errors.plotShape ? 'error' : ''}`}
                                        >
                                            <option value="0">Select Shape</option>
                                            {data.plotShapeTypes.map(shape => (
                                                <option key={shape.id} value={shape.id}>
                                                    {shape.shapeName}
                                                </option>
                                            ))}
                                        </select>
                                        {formState.errors.plotShape && (
                                            <div className="error-message">{formState.errors.plotShape}</div>
                                        )}
                                    </div>

                    
                     
                </div>
            </div>

            <div className="card">
                <div className="dashboard-table-header">
                    <h3 className="dashboard-table-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                        </svg>
                        Plot Inventory
                    </h3>
                </div>

                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th className="left">Township</th>
                                <th className="left">Plot Number</th>
                                <th className="left">Plot Type</th>
                                <th className="center">Size (SqYrds)</th>
                                <th className="center">Facing</th>
                                 <th className="center">Shape</th>
                                  <th className="center">PLC</th>
                                <th className="center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.loading ? (
                                <tr>
                                    <td colSpan={9} className="no-data">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <line x1="12" y1="8" x2="12" y2="12"></line>
                                        </svg>
                                        <p>Loading plots...</p>
                                    </td>
                                </tr>
                            ) : (
                                <>
                                    {filteredPlots.map(plot => {
                                        const plotId = Number(plot?.id);
                                        const canDelete = Number.isFinite(plotId);
                                        const isDeletingThis = canDelete && deletingPlotId === plotId;

                                        return (
                                            <tr key={plot.id}>
                                                <td className="item-category">{plot.townshipName || 'N/A'}</td>
                                                <td className="plot-number">{plot.plotNo || plot.plotNumber || plot.plotName || 'N/A'}</td>
                                                <td className="plot-type">{plot.plotTypeName || 'N/A'}</td>
                                                <td className="plot-size center">{plot.plotSize ? `${plot.plotSize} SqYrds` : 'N/A'}</td>
                                                <td className="plot-facing center">{plot.facingName || 'N/A'}</td>
                                                <td className="plot-shape center">{plot.plotShapeName || ''}</td>
                                                  <td className="plot-plc center">{plot.plc ? `${plot.plc}` : ''}</td>
                                                <td className="center">
                                                    <div className="plot-actions">
                                                        {(plot?.statusName?.toLowerCase() !== 'booked' && plot?.statusName?.toLowerCase() !== 'closed') ? (
                                                            <button
                                                                className="primary-btn"
                                                                onClick={() => openEditPlotModal(plot)}
                                                                title="Edit Plot"
                                                            >
                                                                Edit
                                                            </button>
                                                        ) : (
                                                            <p>
                                                                Booked
                                                            </p>
                                                        )}
                                                        {/* <button
                                                            className="delete-plot-btn"
                                                            onClick={() => handleDeletePlot(plot)}
                                                            title="Delete Plot"
                                                            disabled={!canDelete || isDeletingThis}
                                                        >
                                                            {isDeletingThis ? "Deleting..." : "Delete"}
                                                        </button> */}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {filteredPlots.length === 0 && !data.loading && (
                                        <tr>
                                            <td colSpan={9} className="no-data">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <circle cx="12" cy="12" r="10"></circle>
                                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                                </svg>
                                                <p>No plots found</p>
                                                <span>
                                                    {filters.searchTerm || filters.township !== "all" || filters.plotType !== "all" || filters.facing !== "all"
                                                        ? "Try adjusting your search or filters"
                                                        : "No plots available in the system"}
                                                </span>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Township Modal */}
            {ALLOW_TOWNSHIP_MUTATIONS && modals.addTownship && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Add New Township</h3>
                            <button
                                className="modal-close-btn"
                                onClick={() => handleCloseModal('addTownship')}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleSaveTownship} noValidate className="plot-form">
                            <div className="form-group-full">
                                <label htmlFor="townshipName" className="required">Township Name</label>
                                <input
                                    type="text"
                                    id="townshipName"
                                    name="name"
                                    className="form-control"
                                    value={townshipForm.name}
                                    onChange={handleTownshipFormChange}
                                    placeholder="Enter township name"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="form-group-full">
                                <label htmlFor="townshipAddress">Township Address <span style={{ color: 'black' }}>*</span></label>
                                <input
                                    type="text"
                                    id="townshipAddress"
                                    name="address"
                                    className="form-control"
                                    value={townshipForm.address}
                                    onChange={handleTownshipFormChange}
                                    placeholder="Enter township address"
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => handleCloseModal('addTownship')}
                                >
                                    Close
                                </button>
                                <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={formState.addingTownship}
                                >
                                    {formState.addingTownship ? (
                                        <>
                                            <svg className="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                                                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                                            </svg>
                                            Saving...
                                        </>
                                    ) : 'Save Township'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add/Edit Plot Modal */}
            {modals.addPlot && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{formState.isEditing ? 'Edit Plot' : 'Add New Plot'}</h3>
                            <button
                                className="modal-close-btn"
                                onClick={() => handleCloseModal('addPlot')}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSavePlot} noValidate className="plot-form">
                            <div className="form-section">
                                {/* <h4 className="form-section-title">Plot Information</h4> */}
                                 <div className="form-group-full">
                                        <label htmlFor="townshipId" className="required">Township </label>
                                        <select
                                            id="townshipId"
                                            name="townshipId"
                                            value={plotForm.townshipId}
                                            disabled
                                            onChange={handleFormInputChange}
                                            className={`form-control ${formState.errors.townshipId ? 'error' : ''}`}
                                        >
                                            <option value="">Select Township</option>
                                            {data.townships.map(township => (
                                                <option key={township.id} value={township.id}>
                                                    {township.name}
                                                </option>
                                            ))}
                                        </select>
                                        {formState.errors.townshipId && (
                                            <div className="error-message">{formState.errors.townshipId}</div>
                                        )}
                                    </div>
                                <div className="form-grid">     
                                    <div className="form-group-full">
                                        <label htmlFor="plotNumber" className="required">Plot Number </label>
                                        <input
                                            type="text"
                                            id="plotNumber"
                                            name="plotNumber"
                                            value={plotForm.plotNumber}
                                            onChange={(e) => {
                                                let value = e.target.value;
                                                if (value.startsWith(" ")) return;
                                                if (!/^[a-zA-Z0-9\s/-]*$/.test(value)) return;
                                                setPlotForm(prev => ({
                                                    ...prev,
                                                    plotNumber: value
                                                }));
                                            }}
                                            placeholder="Enter plot number"
                                            className={`form-control ${formState.errors.plotNumber ? 'error' : ''}`}
                                        />
                                        {formState.errors.plotNumber && (
                                            <div className="error-message">{formState.errors.plotNumber}</div>
                                        )}
                                    </div>
                                    <div className="form-group-full">
                                        <label htmlFor="plotTypeId" className="required">Plot Type </label>
                                        <select
                                            id="plotTypeId"
                                            name="plotTypeId"
                                            value={plotForm.plotTypeId}
                                            onChange={handleFormInputChange}
                                            className={`form-control ${formState.errors.plotTypeId ? 'error' : ''}`}
                                        >
                                            <option value="">Select Plot Type</option>
                                            {data.plotTypes.map(plotType => (
                                                <option key={plotType.id} value={plotType.id}>
                                                    {plotType.name || `Plot Type ${plotType.id}`}
                                                </option>
                                            ))}
                                        </select>
                                        {formState.errors.plotTypeId && (
                                            <div className="error-message">{formState.errors.plotTypeId}</div>
                                        )}
                                    </div>
                                    <div className="form-group-full">
                                        <label htmlFor="plotSize" className="required">Plot Size (SqYrds) </label>
                                        <input
                                            type="number"
                                            id="plotSize"
                                            name="plotSize"
                                            value={plotForm.plotSize}
                                            onChange={handleFormInputChange}
                                            placeholder="e.g., 200 SqYrds"
                                            className={`form-control ${formState.errors.plotSize ? 'error' : ''}`}
                                        />
                                        {formState.errors.plotSize && (
                                            <div className="error-message">{formState.errors.plotSize}</div>
                                        )}
                                    </div>
                                    <div className="form-group-full">
                                        <label htmlFor="plotSizeInSqrmtr" className="required">Plot Size (SqMtr) </label>
                                        <input
                                            type="number"
                                            id="plotSizeInSqrmtr"
                                            name="plotSizeInSqrmtr"
                                            value={plotForm.plotSizeInSqrmtr}
                                            onChange={handleFormInputChange}
                                            placeholder="e.g., 200 SqMtrs"
                                            className={`form-control ${formState.errors.plotSizeInSqrmtr ? 'error' : ''}`}
                                        />
                                        {formState.errors.plotSizeInSqrmtr && (
                                            <div className="error-message">{formState.errors.plotSizeInSqrmtr}</div>
                                        )}
                                    </div>
                                    <div className="form-group-full">
                                        <label htmlFor="saleableSize" className="required">Saleable Size (SqYrds) </label>
                                        <input
                                            type="number"
                                            id="saleableSize"
                                            name="saleableSize"
                                            value={plotForm.saleableSize}
                                            onChange={handleFormInputChange}
                                            placeholder="e.g., 200 SqYrds"
                                            className={`form-control ${formState.errors.saleableSize ? 'error' : ''}`}
                                        />
                                        {formState.errors.saleableSize && (
                                            <div className="error-message">{formState.errors.saleableSize}</div>
                                        )}
                                    </div>
                                     <div className="form-group-full">
                                        <label htmlFor="plotShape">Plot Shape</label>
                                      <select
                                        id="plotShape"
                                        name="plotShape"
                                        value={plotForm.plotShape}
                                        onChange={handleFormInputChange}
                                        className="form-control"
                                        >
                                        <option value="">Select Shape</option>

                                        {data.plotShapeTypes && data.plotShapeTypes.length > 0 ? (
                                            data.plotShapeTypes.map(shape => (
                                            <option key={shape.id} value={String(shape.id)}>
                                                {shape.shapeName}
                                            </option>
                                            ))
                                        ) : (
                                            <option disabled>Loading...</option>
                                        )}
                                        </select>
                                    </div>
                                    <div className="form-group-full">
                                        <label htmlFor="facingId" className="required">Facing </label>
                                        <select
                                            id="facingId"
                                            name="facingId"
                                            value={plotForm.facingId}
                                            onChange={handleFormInputChange}
                                            className={`form-control ${formState.errors.facingId ? 'error' : ''}`}
                                        >
                                            <option value="">Select Facing</option>
                                            {data.facingTypes.map(facing => (
                                                <option key={facing.id} value={facing.id}>
                                                    {facing.facingName}
                                                </option>
                                            ))}
                                        </select>
                                        {formState.errors.facingId && (
                                            <div className="error-message">{formState.errors.facingId}</div>
                                        )}
                                    </div>
                                    <div className="form-group-full">
                                        <label htmlFor="plc" className="required">PLC   </label>
                                        <input
                                            type="number"
                                            id="plc"
                                            name="plc"
                                            value={plotForm.plc}
                                            onChange={handleFormInputChange}
                                            placeholder="e.g., 5"
                                            className={`form-control ${formState.errors.plc ? 'error' : ''}`}
                                        />
                                        {formState.errors.plc && (
                                            <div className="error-message">{formState.errors.plc}</div>
                                        )}
                                    </div>
                                </div>
                                    
                                <div className="form-grid">
                                    

                                    <div className="form-group-full">
                                        <label htmlFor="plotStatus">Plot Status</label>
                                        <select
                                            id="plotStatus"
                                            name="plotStatus"
                                            value={plotForm.plotStatus}
                                            onChange={handleFormInputChange}
                                            className="form-control"
                                        >
                                            <option value="">Select Status</option>
                                            <option value="1">Available</option>
                                             <option value="9">Not For Sale</option>
                                            <option value="5">Rahan</option>
                                        </select>
                                    </div>
                                    
                                    <div className="form-group-full">
                                        <label htmlFor="road">Road (feet)</label>
                                        <input
                                            type="number"
                                            id="road"
                                            name="road"
                                            value={plotForm.road}
                                            onChange={handleFormInputChange}
                                            placeholder="e.g., 30, 40, 60"
                                            className="form-control"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>

                                <div className="form-grid">
                                    <div className="form-group-full">
                                        <label htmlFor="remark">Remark</label>
                                        <textarea
                                            id="remark"
                                            name="remark"
                                            value={plotForm.remark}
                                            onChange={handleFormInputChange}
                                            placeholder="Enter any additional remarks or notes"
                                            className="form-control remark-textarea"
                                            rows="2"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* <div className="form-section">
                                <h4 className="form-section-title">Plot Features</h4>
                                <div className="checkbox-grid">
                                    <div className="checkbox-item">
                                        <input
                                            type="checkbox"
                                            id="isCorner"
                                            name="isCorner"
                                            checked={plotForm.isCorner}
                                            onChange={handleFormInputChange}
                                            className="checkbox-input"
                                        />
                                        <label htmlFor="isCorner" className="checkbox-label-large">
                                            <span className="checkbox-custom"></span>
                                            <span className="checkbox-text">Is Corner Plot</span>
                                        </label>
                                    </div>

                                    <div className="checkbox-item">
                                        <input
                                            type="checkbox"
                                            id="isTPoint"
                                            name="isTPoint"
                                            checked={plotForm.isTPoint}
                                            onChange={handleFormInputChange}
                                            className="checkbox-input"
                                        />
                                        <label htmlFor="isTPoint" className="checkbox-label-large">
                                            <span className="checkbox-custom"></span>
                                            <span className="checkbox-text">Is T-Point</span>
                                        </label>
                                    </div>

                                    <div className="checkbox-item">
                                        <input
                                            type="checkbox"
                                            id="isTapper"
                                            name="isTapper"
                                            checked={plotForm.isTapper}
                                            onChange={handleFormInputChange}
                                            className="checkbox-input"
                                        />
                                        <label htmlFor="isTapper" className="checkbox-label-large">
                                            <span className="checkbox-custom"></span>
                                            <span className="checkbox-text">Is Tapper</span>
                                        </label>
                                    </div>
                                </div>
                            </div> */}

                            <div className="modal-actions modal-actions-centered">
                                <button
                                    type="button"
                                    className="primary-btn"
                                    onClick={() => handleCloseModal('addPlot')}
                                >
                                    Close
                                </button>
                                <button
                                    type="submit"
                                    className="primary-btn"
                                    disabled={formState.addingPlot}
                                >
                                    {formState.addingPlot ? (
                                        <>
                                            <svg className="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                                                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                                            </svg>
                                            Saving...
                                        </>
                                    ) : (
                                        formState.isEditing ? 'Update Plot' : 'Save Plot'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Upload Inventory Plot Modal */}
            {modals.uploadInventory && (
                <div className="modal-overlay">
                    <div className="modal-content add-plot-modal">
                        <div className="modal-header">
                            <h3>Upload Plot Inventory</h3>
                            <button
                                className="modal-close-btn"
                                onClick={() => handleCloseModal('uploadInventory')}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleUploadInventory} noValidate className="plot-form">
                            <div className="form-section">
                                <ExportToExcel
                                    data={templateData}
                                    columns={templateColumns}
                                    fileName="Plot_Upload_Template"
                                    sheetName="Plot Upload Template"
                                    buttonText="Download Template"
                                    className="primary-btn"
                                />
                                    <div className="form-group-full">
                                        <input
                                            type="file"
                                            onChange={e => {
                                                setSelectedFile(e.target.files?.[0] || null);
                                            }}
                                            accept=" .xlsx"
                                            required

                                        />
                                        {selectedFile && (
                                            <div className="new-file-selected">
                                                📎 {selectedFile.name}
                                            </div>
                                        )}
                                        {formState.errors.uploadInventory && (
                                            <div className="error-message">{formState.errors.uploadInventory}</div>
                                        )}
                                    </div>
                            </div>


                            <div className="modal-actions modal-actions-centered">
                                <button
                                    type="button"
                                    className="primary-btn"
                                    onClick={() => handleCloseModal('uploadInventory')}
                                >
                                    close
                                </button>
                                <button
                                    type="submit"
                                    className="primary-btn"
                                    disabled={formState.uploadInventory}
                                >
                                    {formState.uploadInventory ? (
                                        <>
                                            <svg className="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                                                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                                            </svg>
                                            uploading...
                                        </>
                                    ) : (
                                        'Upload Data'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
