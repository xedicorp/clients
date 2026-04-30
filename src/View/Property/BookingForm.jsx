import { useMemo, useState, useEffect } from "react";
import workflows from "../../mock/workflows";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from "../../utilities/apiConfig";

export default function BookingForm({ onCreate, onClose, initialBooking }) {
    const [township, setTownship] = useState(initialBooking?.township || "");
    const [workflowType, setWorkflowType] = useState(initialBooking?.township || "");
    const [plotNumber, setPlotNumber] = useState(initialBooking?.plotNumber || "");
    const [plotSize, setPlotSize] = useState(initialBooking?.plotSize || "");
    const [clientMobile, setClientMobile] = useState("");
    const [aadharFileName, setAadharFileName] = useState("");
    const [townshipsList, setTownshipsList] = useState([]);
    const [loadingTownships, setLoadingTownships] = useState(false);
    const [availablePlots, setAvailablePlots] = useState([]);
    const [loadingPlots, setLoadingPlots] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const [draft, setDraft] = useState(null);
    const [stage, setStage] = useState("form");

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    useEffect(() => {
        const fetchTownships = async () => {
            setLoadingTownships(true);

            try {
                const response = await axiosInstance.get(API_ENDPOINTS.TOWNSHIP_LIST);

                let townshipsList = Array.isArray(response.data) ? response.data : (response.data?.value || []);
                
                if (Array.isArray(townshipsList) && townshipsList.length > 0) {
                    let transformedData = townshipsList.map((item, index) => ({
                        id: item.id,
                        name: item.name,
                        plots: item.plots || []
                    }));

                    try {
                        const role = (localStorage.getItem("spendwise_role") || "").toLowerCase();
                        const isLoanRole = role === "loan_manager" || role === "loan_operator_t1" || role === "loan_operator_t2";
                        if (isLoanRole) {
                            const userRaw = localStorage.getItem("spendwise_user");
                            let assignedIds = [];
                            let assignedNames = [];
                            if (userRaw) {
                                const u = JSON.parse(userRaw);
                                const idCandidates = [
                                    u?.assignedTownshipIds,
                                    u?.townshipIds,
                                    u?.allowedTownshipIds
                                ].filter(Boolean);
                                for (const arr of idCandidates) {
                                    if (Array.isArray(arr)) assignedIds = assignedIds.concat(arr);
                                }
                                const nameCandidates = [
                                    u?.assignedTownshipNames,
                                    u?.townshipNames,
                                    u?.allowedTownshipNames
                                ].filter(Boolean);
                                for (const arr of nameCandidates) {
                                    if (Array.isArray(arr)) assignedNames = assignedNames.concat(arr);
                                }
                                if (Array.isArray(u?.townships)) {
                                    for (const t of u.townships) {
                                        if (t?.id != null) assignedIds.push(t.id);
                                        if (t?.name) assignedNames.push(String(t.name));
                                    }
                                }
                            }
                            try {
                                const extraIdsRaw = localStorage.getItem("spendwise_allowed_township_ids");
                                if (extraIdsRaw) {
                                    const extra = JSON.parse(extraIdsRaw);
                                    if (Array.isArray(extra)) assignedIds = assignedIds.concat(extra);
                                }
                            } catch {}
                            try {
                                const extraNamesRaw = localStorage.getItem("spendwise_allowed_township_names");
                                if (extraNamesRaw) {
                                    const extra = JSON.parse(extraNamesRaw);
                                    if (Array.isArray(extra)) assignedNames = assignedNames.concat(extra);
                                }
                            } catch {}
                            assignedIds = Array.from(new Set(assignedIds.map(x => String(x))));
                            assignedNames = Array.from(new Set(assignedNames.map(x => String(x).toLowerCase())));
                            transformedData = transformedData.filter(t => {
                                const id = String(t.id ?? "");
                                const name = String(t.name ?? "").toLowerCase();
                                if (assignedIds.length === 0 && assignedNames.length === 0) return false;
                                return assignedIds.includes(id) || assignedNames.includes(name);
                            });
                        }
                    } catch {}

                    setTownshipsList(transformedData);
                    localStorage.setItem("townships_data", JSON.stringify(transformedData));
                }

            } catch (error) {
                // Silently handle fetch error
            } finally {
                setLoadingTownships(false);
            }
        };

        fetchTownships();
    }, []);

    useEffect(() => {
        if (!township) {
            setAvailablePlots([]);
            return;
        }

        const fetchPlots = async () => {
            setLoadingPlots(true);

            try {
                const selectedTownship = townshipsList.find(t => t.name === township);
                const townshipId = selectedTownship?.id;

                if (!townshipId) {
                    setAvailablePlots([]);
                    return;
                }

                const response = await axiosInstance.get(`${API_ENDPOINTS.PLOTS_LIST}?townshipId=${townshipId}`);

                let plots = [];
                if (Array.isArray(response.data)) {
                    plots = response.data;
                } else if (response.data?.value && Array.isArray(response.data.value)) {
                    plots = response.data.value;
                } else if (response.data?.data && Array.isArray(response.data.data)) {
                    plots = response.data.data;
                }

                if (plots && plots.length > 0) {
                    const transformedPlots = plots.map(p => ({
                        number: p.plotNo || p.number || p.plotNumber,
                        plotNo: p.plotNo || p.number || p.plotNumber,
                        size: p.plotSize || p.size,
                        plotSize: p.plotSize || p.size,
                        id: p.id
                    }));

                    setAvailablePlots(transformedPlots);
                    setPlotNumber("");
                    setPlotSize("");
                } else {
                    setAvailablePlots([]);
                }
            } catch (error) {
                setAvailablePlots([]);
            } finally {
                setLoadingPlots(false);
            }
        };

        fetchPlots();
    }, [township, townshipsList]);

    const handlePlotChange = (value) => {
        setPlotNumber(value);
        if (availablePlots && availablePlots.length > 0) {
            const plot = availablePlots.find(p => (p.number || p.plotNo) === value);
            if (plot) {
                setPlotSize(plot.size || plot.plotSize || "");
            } else {
                setPlotSize("");
            }
        } else {
            setPlotSize("");
        }
    };

    const handleCreateDraft = (e) => {
        e.preventDefault();
        
        if (!township || !plotNumber || !plotSize || !clientMobile) {
            alert("Please fill all required fields: Township, Plot Number, Plot Size, and Client Mobile");
            return;
        }

        const createdAt = new Date().toISOString().split("T")[0];

        const bookingDraft = {
            township,
            plotNumber,
            plotSize,
            clientMobile,
            clientAadharUrl: aadharFileName ? `/uploads/${aadharFileName}` : "",
            status: "booking_created",
            createdAt,
            updatedAt: new Date().toISOString()
        };

        setDraft(bookingDraft);
        setStage("select-workflow");
    };

    const chooseWorkflow = (wf) => {
        if (!draft) return;
        const steps = wf.steps.map((title, idx) => ({
            id: `s-${idx}-${Date.now()}`,
            stepKey: `step_${idx}`,
            title,
            status: "pending"
        }));

        const finalBooking = {
            ...draft,
            workflowCode: wf.code,
            workflowName: wf.name,
            steps,
            status: "workflow_selected",
            updatedAt: new Date().toISOString()
        };

        setDraft(finalBooking);
        setStage("preview");
    };

    const handleSaveBooking = () => {
        if (!draft) return;
        onCreate(draft);
    };

    const formRowStyle = {
        display: "grid",
        gridTemplateColumns: "140px 1fr",
        gap: 12,
        alignItems: "center",
        marginBottom: 10
    };
    const labelStyle = { 
        fontWeight: 700, 
        fontSize: "13px",
        color: "#000000",
        textTransform: "uppercase",
        letterSpacing: "0.5px"
    };

    return (
        <div style={{ width: "100%" }}>
            {stage === "form" && (
                <form onSubmit={handleCreateDraft} className="booking-form" style={{ width: "100%" }}>
                    <div style={{ display: "grid", gap: 16, maxWidth: "100%" }}>
                        {/* Form content removed as it was empty */}
                    </div>
                </form>
            )}

            {stage === "preview" && draft && (
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <div>
                            <h3 style={{ margin: 0 }}>Workflow Preview</h3>
                            <div style={{ color: "#8ea0ba" }}>{draft?.workflowName} • {draft?.steps.length} steps</div>
                        </div>
                        <div>
                            <button className="small-btn" onClick={() => setStage("select-workflow")}>Change</button>
                        </div>
                    </div>

                    <div style={{ borderRadius: 8, padding: 12, background: "var(--card-color)" }}>
                        <ol style={{ margin: 0, paddingLeft: 18 }}>
                            {draft.steps.map((s, idx) => (
                                <li key={s.id} style={{ marginBottom: 8 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <div style={{
                                            width: 10, height: 10, borderRadius: 2,
                                            background: s.status === "completed" ? "#28a745" : "#f0ad4e"
                                        }} />
                                        <div style={{ fontWeight: 600 }}>{s.title}</div>
                                    </div>
                                </li>
                            ))}
                        </ol>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
                            <button className="small-btn" onClick={() => setStage("form")}>Cancel</button>
                            <button className="small-btn primary" onClick={handleSaveBooking}>Save & View Booking</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}