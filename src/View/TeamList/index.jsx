import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import Button from "../../components/NewComponent/Button";
import Icon from "../../Components/NewComponent/Icons";
import SmallModal from "../../components/NewComponent/Modal/SmallModal";
import Search from "../../Components/NewComponent/Search";
import Table from "../../Components/NewComponent/Table";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from '../../utilities/apiConfig';
import DropdownSearch from "../../components/NewComponent/DropdownList";
import Wrapper from "./style";
import { t } from "i18next";


const TeamList = () => {
    const navigate = useNavigate();
    const [teams, setTeams] = useState([]);
    const [staffs, setStaffs] = useState([]);
    const [search, setSearch] = useState("");
    const [showTeamModal, setShowTeamModal] = useState(false);
    const [showAddStaffModal, setShowAddStaffModal] = useState(false);
    const [showAddAssociateModal, setShowAddAssociateModal] = useState(false);
    const [showAddPlotModal, setShowAddPlotModal] = useState(false);
    const [townshipId, setTownshipId] = useState(null);
    const [townships, setTownships] = useState([]);
    const [plotList, setPlotList] = useState([]);
    const [associateList, setAssociateList] = useState([]);
    const [associateSearch, setAssociateSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [teamForm, setTeamForm] = useState({
        id: null,
        name: ""
    });
    const [addStaffTeamForm, setAddStaffTeamForm] = useState({
        teamId: "",
        staffIds: []
    });

    const [addAssociateTeamForm, setAddAssociateTeamForm] = useState({
        teamId: null,
        associateIds: [],
    });

    const [addPlotForm, setAddPlotForm] = useState({
        teamId: null,
        selections: {}
    });


    const handleChange = (e) => {
        const { name, value } = e.target;
        setTeamForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    const [openTeamMenuId, setOpenTeamMenuId] = useState(null);
    const dropdownRef = useRef(null);

    const toggleTeamMenu = (id) => {
        setOpenTeamMenuId((prev) => (prev === id ? null : id));
    };

    const headers = ["Team Name", "Staff Members", "Associates", "Townships","Plots", "Actions"];
    const plotHeaders = ["__select__", "Plot No", "Size", "Facing", "Type", "Status"];
    const staffHeaders = ["__select__", "Name", "Contact"];
    const associateHeaders = ["__select__", "Name", "RERA No"];


    const isAllStaffSelected =
        staffs.length > 0 &&
        addStaffTeamForm.staffIds.length === staffs.length;

    const handleSelectAllStaff = () => {
        setAddStaffTeamForm((prev) => ({
            ...prev,
            staffIds: isAllStaffSelected ? [] : staffs.map((s) => s.id),
        }));
    };

    const isAllPlotsSelected =
        townshipId &&
        plotList.length > 0 &&
        (addPlotForm.selections[townshipId]?.length === plotList.length);

    const handleSelectAllPlots = () => {
        if (!townshipId) return;

        const ids = plotList.map(p => p.id);

        setAddPlotForm(prev => ({
            ...prev,
            selections: {
                ...prev.selections,
                [townshipId]:
                    prev.selections[townshipId]?.length === ids.length ? [] : ids,
            },
        }));
    };

    const isAllAssociatesSelected =
        associateList.length > 0 &&
        addAssociateTeamForm.associateIds.length === associateList.length;

    const handleSelectAllAssociates = () => {
        setAddAssociateTeamForm(prev => ({
            ...prev,
            associateIds: isAllAssociatesSelected
                ? []
                : associateList.map(a => a.id),
        }));
    };

    const filteredTeams = useMemo(() => {
        if (!search) return teams;
        const s = search.toLowerCase();
        return teams.filter(t =>
            t.name?.toLowerCase().includes(s)
        );
    }, [teams, search]);

    const filteredAssociates = useMemo(() => {
        if (!associateSearch) return associateList;
        const s = associateSearch.toLowerCase().trim();
        return associateList.filter(a =>
            `${a.firstName || ""} ${a.lastName || ""}`
                .toLowerCase()
                .includes(s) ||
            a.reraNo?.toLowerCase().includes(s)
        );
    }, [associateList, associateSearch]);


    const townshipOptions = townships.map(t => ({
        label: t.name,
        value: t.id
    }));

    const handleTownshipSelect = (option) => {
        const id = Number(option.value);
        setTownshipId(id);
    };


    const selectedTownshipName =
        townships.find(t => t.id === townshipId)?.name || "";

    const handleTownshipClear = () => {
        setTownshipId(null);
        setPlotList([]);
    };


    const handleSaveTeam = async () => {
        try {
            const payload = { ...teamForm };
            if (!payload.id) delete payload.id;
            await axiosInstance.post(API_ENDPOINTS.SAVE_TEAM, payload);
            toast.success(
                teamForm.id
                    ? "Team updated successfully"
                    : "Team created successfully"
            );

            setShowTeamModal(false);

            setTeamForm({
                id: null,
                name: "",
            });

            fetchTeams();
        } catch (err) {
            console.error(err);

            toast.error(
                teamForm.id
                    ? "Failed to update team"
                    : "Failed to create team"
            );
        }
    };

    const fetchStaff = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get(API_ENDPOINTS.STAFF_LIST);
            const usersData = response?.data || [];
            const normalized = usersData.map((u) => ({
                id: u.id,
                firstName: u.firstName,
                lastName: u.lastName,
                name: [u?.firstName, u?.lastName].filter(Boolean).join(" "),
                address: u.address,
                contactNo: u.contactNo,
                status: u.isActive,
            }));

            setStaffs(normalized);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTeams = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get(API_ENDPOINTS.TEAM_LIST);
            const teamsData = response?.data || [];
            setTeams(teamsData);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTownships = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get(
                API_ENDPOINTS.GET_TOWNSHIP_LIST,
            );
            const townshipData = response?.data || [];
            setTownships(townshipData);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchPlots = async (townshipId) => {
        if (!townshipId) return;
        try {
            setIsLoading(true);
            const response = await axiosInstance.get(API_ENDPOINTS.GET_PLOTS_BY_TOWNSHIP_ID, {
                params: { townshipId },
            });
            const plotsData = response?.data || [];
            setPlotList(plotsData);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAssociates = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get(API_ENDPOINTS.ASSOCIATE_LIST)
            const associateData = response?.data || [];
            setAssociateList(associateData);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (showAddPlotModal) {
            fetchTownships();
        }
    }, [showAddPlotModal, fetchTownships]);


    useEffect(() => {
        if (showAddPlotModal && townshipId) {
            console.log("Fetching plots for", townshipId);
            fetchPlots(townshipId);
        } else if (!townshipId) {
            setPlotList([]);
        }
    }, [townshipId, showAddPlotModal]);


    useEffect(() => {
        fetchTeams();
        fetchStaff();
        fetchAssociates();
    }, []);

    useEffect(() => {
        if (showAddStaffModal) fetchStaff();
    }, [showAddStaffModal]);


    const handleEditClick = (team) => {
        setShowTeamModal(true);
        setTeamForm({
            id: team.id,
            name: team.name,
        });
    };

    const handleTeamDelete = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This team will be permanently deleted.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Delete",
        });
        if (!result.isConfirmed) return;
        try {
            await axiosInstance.delete(`${API_ENDPOINTS.DELETE_TEAM}/${id}`);
            toast.success("Team deleted successfully");
            setTeams((prev) => prev.filter((t) => t.id !== id));
        } catch (err) {
            toast.error(err?.response?.data?.message || "Error deleting team");
        }
    };

    const handleSaveTeamMembers = async () => {
        try {
            if (addStaffTeamForm.staffIds.length === 0) {
                toast.error("Select at least one staff");
                return;
            }
            const payload = {
                teamId: addStaffTeamForm.teamId,
                staffIds: addStaffTeamForm.staffIds,
            };
            await axiosInstance.post(API_ENDPOINTS.ASSIGN_TEAM_TO_STAFF, payload);
            toast.success("Team members assigned successfully");
            setShowAddStaffModal(false);
            setAddStaffTeamForm({
                teamId: "",
                staffIds: [],
            });
            fetchTeams();
        } catch (err) {
            toast.error(
                err?.response?.data?.message || "Failed to assign team members"
            );
        }
    };

    const handleSaveAssociate = async () => {
        if (!addAssociateTeamForm.teamId) {
            toast.error("Invalid team");
            return;
        }

        if (addAssociateTeamForm.associateIds.length === 0) {
            toast.error("Select associate");
            return;
        }

        try {
            const payload = {
                teamId: Number(addAssociateTeamForm.teamId),
                associateIds: addAssociateTeamForm.associateIds.map(Number),
            };
            await axiosInstance.post(API_ENDPOINTS.ASSIGN_ASSOCIATE_TO_TEAM, payload);
            toast.success("Associate assigned successfully");
            setShowAddAssociateModal(false);
            setAddAssociateTeamForm({
                teamId: null,
                associateIds: [],
            });
            fetchTeams();
        } catch (err) {
            toast.error(
                err?.response?.data?.message || "Failed to assign associate"
            );
        }
    };

    const handleSavePlots = async () => {
        if (!addPlotForm.teamId) {
            toast.error("Invalid team");
            return;
        }
        const validEntries = Object.entries(addPlotForm.selections)
            .filter(([tId, plots]) => Number(tId) && plots?.length > 0);
        const townshipIds = validEntries.map(([tId]) => Number(tId));
        const plotIds = [
            ...new Set(
                validEntries
                    .flatMap(([, plots]) => plots)
                    .map(Number)
            )
        ];

        if (plotIds.length === 0) {
            toast.error("Select plot");
            return;
        }

        const payload = {
            teamId: Number(addPlotForm.teamId),
            townshipIds,
            plotIds
        };

        try {
            await axiosInstance.post(API_ENDPOINTS.ASSIGN_PLOT_TO_TEAM, payload);

            toast.success("Plots assigned successfully");

            setShowAddPlotModal(false);
            setAddPlotForm({ teamId: null, selections: {} });

            fetchTeams();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to assign plots");
        }
    };


    const handleAddTeamMembers = (team) => {
        setAddStaffTeamForm({
            teamId: team.id,
            staffIds: team.staffs?.map(s => s.id ?? s) || [],
        });
        setShowAddStaffModal(true);
    };

    const handleAddAssociate = (team) => {
        setAddAssociateTeamForm({
            teamId: team.id,
            associateIds: team.associates?.map(a => a.id ?? a) || [],
        });
        setShowAddAssociateModal(true);
    };

    const handleAddPlot = (team) => {
        const selections = {};
        team.plots?.forEach(p => {
            const tId = p.townshipId ?? team.townshipId;
            if (!selections[tId]) selections[tId] = [];
            selections[tId].push(p.id ?? p);
        });
        setTownshipId(Object.keys(selections)[0] || null);
        setAddPlotForm({
            teamId: team.id,
            selections
        });

        setShowAddPlotModal(true);
    };


    const handleAddTeam = () => {
        setTeamForm({ id: null, name: "" });
        setShowTeamModal(true);
    };

    const renderRow = (team) => (
        <>
            <td>{team.name || "-"}</td>
            <td><div className="team-table-staff-list">{team.staffs?.map(s => s.name).join(", ") || "-"}</div> </td>
            <td><div className="team-table-associate-list">{team.associates?.map(a => a.name).join(", ") || "-"}</div></td>
            <td><div className="team-table-plot-list">{team.townships?.map(t => t.name).join(", ") || "-"}</div></td>
            <td><div className="team-table-plot-list">{team.plots?.map(p => p.plotNo).join(", ") || "-"}</div></td>
            <td>
                <div className="team-menu-container">
                    <button
                        className="primary-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleTeamMenu(team.id);
                        }}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>

                    {openTeamMenuId === team.id && (
                        <div ref={dropdownRef} className="team-dropdown-menu">

                            <button
                                className="dropdown-item"
                                onClick={() => {
                                    handleEditClick(team);
                                    setOpenTeamMenuId(null);
                                }}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 20h9" />
                                    <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
                                </svg>
                                Edit
                            </button>
                                
                            <button
                                className="dropdown-item"
                                onClick={() => {
                                    handleAddTeamMembers(team);
                                    setOpenTeamMenuId(null);
                                }}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 00-3-3.87" />
                                    <path d="M16 3.13a4 4 0 010 7.75" />
                                </svg>
                                Members
                            </button>

                            <button
                                className="dropdown-item"
                                onClick={() => {
                                    handleAddAssociate(team);
                                    setOpenTeamMenuId(null);
                                }}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="7" r="4" />
                                    <path d="M5.5 21a6.5 6.5 0 0113 0" />
                                </svg>
                                Associates
                            </button>

                            <button
                                className="dropdown-item"
                                onClick={() => {
                                    handleAddPlot(team);
                                    setOpenTeamMenuId(null);
                                }}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="7" height="7" />
                                    <rect x="14" y="3" width="7" height="7" />
                                    <rect x="14" y="14" width="7" height="7" />
                                    <rect x="3" y="14" width="7" height="7" />
                                </svg>
                                Plots
                            </button>

                            <button
                                className="dropdown-item"
                                onClick={() => navigate('/property')}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 3h18v4H3z" />
                                    <path d="M3 7h18v14H3z" />
                                </svg>
                                Bookings
                            </button>

                            <button
                                className="dropdown-item"
                                onClick={() => navigate('/property/reports')}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="20" x2="12" y2="10" />
                                    <line x1="18" y1="20" x2="18" y2="4" />
                                    <line x1="6" y1="20" x2="6" y2="16" />
                                </svg>
                                Progress Report
                            </button>

                            <button
                                className="dropdown-item danger"
                                onClick={() => {
                                    handleTeamDelete(team.id);
                                    setOpenTeamMenuId(null);
                                }}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6l-1 14H6L5 6" />
                                    <path d="M10 11v6" />
                                    <path d="M14 11v6" />
                                    <path d="M9 6V4h6v2" />
                                </svg>
                                Delete
                            </button>

                        </div>
                    )}
                </div>
            </td>
        </>
    );

    const renderStaffRow = (s) => {
        const isChecked = addStaffTeamForm.staffIds.includes(s.id);

        const handleToggle = () => {
            setAddStaffTeamForm((prev) => {
                const exists = prev.staffIds.includes(s.id);

                return {
                    ...prev,
                    staffIds: exists
                        ? prev.staffIds.filter((id) => id !== s.id)
                        : [...prev.staffIds, s.id],
                };
            });
        };

        return (
            <>
                <td>
                    <input
                        type="checkbox"
                        className="checkbox"
                        checked={isChecked}
                        onChange={handleToggle}
                    />
                </td>

                <td>{s.name}</td>
                <td>{s.contactNo || "-"}</td>
            </>
        );
    };

    const renderPlotList = (p) => {
        const tId = townshipId;

        const checked =
            addPlotForm.selections[tId]?.includes(p.id) || false;

        const toggle = () => {
            setAddPlotForm(prev => {
                const townshipPlots = prev.selections[tId] || [];
                const exists = townshipPlots.includes(p.id);

                return {
                    ...prev,
                    selections: {
                        ...prev.selections,
                        [tId]: exists
                            ? townshipPlots.filter(id => id !== p.id)
                            : [...townshipPlots, p.id],
                    },
                };
            });
        };

        return (
            <>
                <td>
                    <input
                        type="checkbox"
                        className="checkbox"
                        checked={checked}
                        onChange={toggle}
                    />
                </td>
                <td>{p.plotNo}</td>
                <td>{p.plotSize}</td>
                <td>{p.facingName}</td>
                <td>{p.plotTypeName}</td>
                <td>{p.status}</td>
            </>
        );
    };

    const renderAssociateRow = (a) => {
        const checked = addAssociateTeamForm.associateIds.includes(a.id);

        const toggle = () => {
            setAddAssociateTeamForm(prev => {
                const exists = prev.associateIds.includes(a.id);

                return {
                    ...prev,
                    associateIds: exists
                        ? prev.associateIds.filter(id => id !== a.id)
                        : [...prev.associateIds, a.id],
                };
            });
        };

        return (
            <>
                <td>
                    <input
                        type="checkbox"
                        className="checkbox"
                        checked={checked}
                        onChange={toggle}
                    />
                </td>

                <td>{a.firstName || "-"}</td>
                <td>{a.reraNo || "-"}</td>
            </>
        );
    };





    return (
        <Wrapper className="dashboard-container">
            <div className="dashboard-header">
                <div className="dashboard-header-content">
                    <div className="dashboard-header-icon">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                    </div>
                    <div>
                        <h1 className="dashboard-title">
                            Team Management
                        </h1>
                        <p className="dashboard-subtitle">
                            Manage and monitor all Team across the system
                        </p>
                    </div>
                </div>
                <div className="dashboard-header-actions">
                    <Button onClick={handleAddTeam}>
                        <Icon name="addCircle" />
                        Add Team
                    </Button>
                </div>
            </div>
            <div className="card">
                <div className="dashboard-table-header">
                    <Search
                        value={search}
                        onChange={setSearch}
                        placeholder="Search team name..."
                    />
                </div>
                <Table
                    headers={headers}
                    data={filteredTeams}
                    renderRow={renderRow}
                    emptyMessage="No teams found."
                    rowKey={(t) => t.id}
                />
            </div>

            {/* Add Edit Modal */}
            <SmallModal
                show={showTeamModal}
                onClose={() => setShowTeamModal(false)}
                title={teamForm.id ? "Edit Team" : "Create Team"}
                actions={
                    <Button variant="primary" onClick={handleSaveTeam}>
                        {teamForm.id ? "Update Team" : "Create Team"}
                    </Button>
                }
            >
                <div className="staff-save--modal-details">
                    <div className="form-grid">
                        <div className="form-group full">
                            <label>Team Name</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Enter team name"
                                value={teamForm.name}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>
                    </div>
                </div>
            </SmallModal>

            {/* Add Staff Modal */}
            <SmallModal
                show={showAddStaffModal}
                onClose={() => setShowAddStaffModal(false)}
                title=" Manage Members"
                actions={
                    <Button variant="primary" onClick={handleSaveTeamMembers}>
                        Save
                    </Button>
                }
            >
                <div className="staff-save--modal-details">
                    <Table
                        headers={staffHeaders}
                        data={staffs}
                        renderRow={renderStaffRow}
                        rowKey={(s) => s.id}
                        isAllSelected={isAllStaffSelected}
                        handleSelectAll={handleSelectAllStaff}
                        emptyMessage="No staff found."
                        compact
                    />
                </div>
            </SmallModal>

            {/* Add Associate Modal */}
            <SmallModal
                show={showAddAssociateModal}
                onClose={() => setShowAddAssociateModal(false)}
                title="Manage Associates"
                actions={
                    <Button onClick={handleSaveAssociate}>
                        Save
                    </Button>
                }
            >
                <div className="associate-modal">
                    <div className="associate-search-box">
                        <Search
                            value={associateSearch}
                            onChange={setAssociateSearch}
                            placeholder="Search by Associate Name and RERA No..."
                        />
                    </div>
                    <div className="table-box">
                        <Table
                            headers={associateHeaders}
                            data={filteredAssociates}
                            renderRow={renderAssociateRow}
                            rowKey={(a) => a.id}
                            isAllSelected={isAllAssociatesSelected}
                            handleSelectAll={handleSelectAllAssociates}
                            emptyMessage="No associates found."
                            compact
                        />
                    </div>
                </div>
            </SmallModal>

            {/* Add Plot Modal */}
            <SmallModal
                show={showAddPlotModal}
                onClose={() => setShowAddPlotModal(false)}
                title="Manage Plots"
                actions={
                    <Button onClick={handleSavePlots}>
                        Save
                    </Button>
                }
            >
                <div className="plot-modal">
                    <div className="township-search-section-modal">
                        <label className="section-label">Township</label>
                        <DropdownSearch
                            options={townshipOptions}
                            displayValue={selectedTownshipName}
                            onSelect={handleTownshipSelect}
                            onClear={handleTownshipClear}
                        />
                    </div>

                    <div className="section">
                        <div className="dashboard-table-header">
                            <label>Plots</label>
                            <span className="count">{(addPlotForm.selections[townshipId]?.length || 0)} selected</span>
                        </div>
                        <div className="table-box">
                            <Table
                                headers={plotHeaders}
                                data={plotList}
                                renderRow={renderPlotList}
                                rowKey={(p) => p.id}
                                isAllSelected={isAllPlotsSelected}
                                handleSelectAll={handleSelectAllPlots}
                                emptyMessage="No plots found."
                                compact
                            />
                        </div>
                    </div>
                </div>
            </SmallModal>

            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </Wrapper >
    );
};


export default TeamList;
