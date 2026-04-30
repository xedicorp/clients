import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BookingWrapper from "./style";
import PropertyNavigation from "./PropertyNavigation";
import ReminderButton from "../../components/ReminderButton";
import ReminderPopup from "../../components/ReminderPopup";
import Notifications from "./Notifications";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from "../../utilities/apiConfig";
import { isBookingOld, canEditBooking } from "../../utilities/bookingPermissions";
import Swal from 'sweetalert2';
// import "./EditBooking.css";

export default function EditBooking() {
    const { id } = useParams();
    const navigate = useNavigate();

    const countryCodeOptions = [
        { value: "+91", label: "+91" },
    ];

    const onlyDigits = (value) => String(value ?? "").replace(/\D/g, "");
    const normalizeTenDigits = (value) => onlyDigits(value).slice(0, 10);
    const buildPhone = (code, digits) => `${String(code || "").trim()}${String(digits || "").trim()}`;
    const parsePhone = (rawValue) => {
        const raw = String(rawValue ?? "").trim();
        const compact = raw.replace(/\s+/g, "");
        const digits = onlyDigits(compact);
        const matched = countryCodeOptions
            .map(o => o.value)
            .sort((a, b) => b.length - a.length)
            .find(code => compact.startsWith(code));
        if (matched) {
            const codeDigits = onlyDigits(matched);
            const rest = digits.startsWith(codeDigits) ? digits.slice(codeDigits.length) : digits;
            return { code: matched, digits: normalizeTenDigits(rest.length > 10 ? rest.slice(-10) : rest) };
        }
        return { code: "+91", digits: normalizeTenDigits(digits.length > 10 ? digits.slice(-10) : digits) };
    };
    const formatTwoDecimals = (v) => {
       
        const n = Number(String(v ?? "").trim());
        return Number.isFinite(n) ? String(n.toFixed(2)) : "";
    };

    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(null);
    const [clientName, setClientName] = useState("");
    const [clientRelationType, setClientRelationType] = useState(""); // S/O, D/O, W/O, C/O
    const [clientRelative, setClientRelative] = useState("");
    const [clientMobile, setClientMobile] = useState("");
    const [clientCountryCode, setClientCountryCode] = useState("+91");
    const [clientEmail, setClientEmail] = useState("");
    const [clientAddress, setClientAddress] = useState("");
    const [assocName, setAssocName] = useState("");
    const [assocContact, setAssocContact] = useState("");
    const [assocCountryCode, setAssocCountryCode] = useState("+91");
    const [assocRERA, setAssocRERA] = useState("");
    const [assocLeader, setAssocLeader] = useState("");
    const [assocLeaderContact, setAssocLeaderContact] = useState("");
    const [assocLeaderCountryCode, setAssocLeaderCountryCode] = useState("+91");
    const [township, setTownship] = useState("");
    const [workflowType, setWorkflowType] = useState("");
    const [plotNumber, setPlotNumber] = useState("");
    const [plotId, setPlotId] = useState("");
    const [plotSize, setPlotSize] = useState("");
    const [agreementRate, setAgreementRate] = useState("");
     const [discount, setDiscount] = useState("");
    const [agreementValue, setAgreementValue] = useState("");
    const [bookingDate, setBookingDate] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [existingFileName, setExistingFileName] = useState("");
    const [townshipsList, setTownshipsList] = useState([]);
    const [loadingTownships, setLoadingTownships] = useState(false);
    const [plots, setPlots] = useState([]);
    const [loadingPlots, setLoadingPlots] = useState(false);
    const [showReminderPopup, setShowReminderPopup] = useState(false);
    const [isReminderPopupOpen, setIsReminderPopupOpen] = useState(false);
    const [bankList, setBankList] = useState([]);

    // ID Proof State
    const [documentTypes, setDocumentTypes] = useState([]);
    const [loadingDocumentTypes, setLoadingDocumentTypes] = useState(false);
    const [idProofTypeId, setIdProofTypeId] = useState("");
    const [idProofFile, setIdProofFile] = useState(null);
    const [idProofPreviewUrl, setIdProofPreviewUrl] = useState(null);
    const [existingIdProof, setExistingIdProof] = useState(null);
    const [reraList, setReraList] = useState([]);
    const [reraSearch, setReraSearch] = useState("");
    const [showReraDropdown, setShowReraDropdown] = useState(false);
    // Payment Information State
    const [initialAmount, setInitialAmount] = useState("");
    const [initialPaymentDate, setInitialPaymentDate] = useState("");
    const [initialReceiptMethod, setInitialReceiptMethod] = useState("");
    const [initialTransactionId, setInitialTransactionId] = useState("");
    const [initialBankName, setInitialBankName] = useState("");
    const [initialReceiptImage, setInitialReceiptImage] = useState(null);
    const [initialReceiptPreviewUrl, setInitialReceiptPreviewUrl] = useState(null);
    const [amountError, setAmountError] = useState("");

    const paymentModes = [
        { value: "1", label: "Bank Transfer" },
        { value: "2", label: "Cheque" },
        { value: "3", label: "Cash" },
        { value: "4", label: "UPI" },
        { value: "5", label: "Card" },
    ];

    const role = (localStorage.getItem("spendwise_role") || "").toLowerCase();
    const canEditAgreementValue = role === "admin" || role === "superadmin" || role === "loan_admin";

    useEffect(() => {
      const fetchBanks = async () => {
        try {
          const response = await axiosInstance.get(API_ENDPOINTS.BANK_LIST);
    
          const raw = response?.data;
          console.log("Bank List response:", raw);
    
          const banks = Array.isArray(raw)
            ? raw
            : raw?.value || raw?.data || [];
    
          setBankList(banks);
        } catch (err) {
          console.error(err);
        }
      };
    
      fetchBanks();
    }, []);

    useEffect(() => {
  const fetchRera = async () => {
    const res = await axiosInstance.get(API_ENDPOINTS.ASSOCIATE_LIST);
    const list = res.data?.value || res.data || [];
    setReraList(list);
  };
  fetchRera();
}, []);

     const [bookingDocuments, setBookingDocuments] = useState([]);
    // Consolidated data fetching
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);

                // Fetch townships
                setLoadingTownships(true);
                try {
                    const response = await axiosInstance.get(API_ENDPOINTS.TOWNSHIP_LIST);
                    let raw = response?.data;
                    let list = [];
                    
                    if (Array.isArray(raw)) {
                        list = raw;
                    } else if (raw && Array.isArray(raw.value)) {
                        list = raw.value;
                    } else if (raw && Array.isArray(raw.data)) {
                        list = raw.data;
                    }

                    const normalized = (list || []).map((t, idx) => ({
                        id: t.id ?? t.townshipId ?? t.TownshipId ?? idx,
                        name: (t.name ?? t.townshipName ?? t.TownshipName ?? t.Township ?? "").toString(),
                        raw: t
                    })).filter(t => t.name && String(t.name).trim() !== "");

                    setTownshipsList(normalized);
                    localStorage.setItem("townships_data", JSON.stringify(normalized));
                } catch (error) {
                    setTownshipsList([]);
                } finally {
                    setLoadingTownships(false);
                }

                // Fetch document types
                setLoadingDocumentTypes(true);
                let fetchedDocTypes = [];
                try {
                    const response = await axiosInstance.get(API_ENDPOINTS.DOCUMENT_TYPES);
                    const list = Array.isArray(response.data) ? response.data : (response.data?.value || []);
                    fetchedDocTypes = list || [];
                    setDocumentTypes(fetchedDocTypes);
                } catch (error) {
                    setDocumentTypes([]);
                } finally {
                    setLoadingDocumentTypes(false);
                }

                // Fetch existing documents (ID Proof)
                try {
                    if (id) {
                        const docsResponse = await axiosInstance.get(`${API_ENDPOINTS.GET_DOCUMENTS_BY_BOOKING_ID}?bookingId=${id}`);
                        const docs = Array.isArray(docsResponse.data) ? docsResponse.data : (docsResponse.data?.value || []);
                        
                        setBookingDocuments(docs);    

                        if (fetchedDocTypes.length > 0 && docs.length > 0) {
                             const idProofTypes = fetchedDocTypes.filter(t => {
                                const name = String(t.name || "").toLowerCase();
                                return name.includes("aadhar") || name.includes("aadhaar") || name.includes("pan");
                            }).map(t => t.id);
                            
                            const foundDoc = docs.find(d => idProofTypes.includes(d.documentTypeId));
                            if (foundDoc) {
                                setExistingIdProof(foundDoc);
                                setIdProofTypeId(foundDoc.documentTypeId);
                            }
                        }
                    }
                } catch (docErr) {
                }

                // Fetch booking details
                if (!id) {
                    navigate("/property");
                    return;
                }

                const response = await axiosInstance.get(`${API_ENDPOINTS.GET_BOOKING_BY_ID}?bookingId=${id}`);
                const foundBooking = response.data;

                if (!foundBooking) {
                    await Swal.fire({
                        icon: 'error',
                        title: 'Booking not found',
                        text: 'Could not find booking to edit',
                    });
                    navigate("/property");
                    return;
                }

                setBooking(foundBooking);

                // Check permission
                // const hasPermission = canEditBooking(foundBooking, role);
                // if (!hasPermission) {
                //     const isOldBooking = isBookingOld(foundBooking.bookingDate || foundBooking.createdAt);
                //     await Swal.fire({
                //         icon: 'error',
                //         title: 'Access Denied',
                //         text: isOldBooking ? 
                //             'Only Loan Admin can edit old booking records (older than 30 days).' :
                //             'You do not have permission to edit this booking.',
                //     });
                //     navigate("/property");
                //     return;
                // }

                // Populate form fields
                setClientName(foundBooking.clientName   || "");
                
                // Parse clientRelative to extract relation type and name
            
                let extractedType = foundBooking.relationType;
                let extractedName = foundBooking.relationName;
                
                // for (const type of relationTypes) {
                //     if (relativeStr.startsWith(type)) {
                //         extractedType = type;
                //         extractedName = relativeStr.substring(type.length).trim();
                //         break;
                //     }
                // }
                
                setClientRelationType(extractedType);
                setClientRelative(extractedName);
                
                {
                    const { code, digits } = parsePhone(foundBooking.contactNo || foundBooking.clientContactNo || foundBooking.clientMobile || foundBooking.ClientContactNo || foundBooking.ClientMobile || "");
                    setClientCountryCode(code);
                    setClientMobile(digits);
                }
                setClientEmail(foundBooking.clientEmail || foundBooking.ClientEmail || foundBooking.email || foundBooking.Email || "");
                
                // Set client address with all possible field variations
                const addressValue = foundBooking.clientAddress || 
                                   foundBooking.ClientAddress || 
                                   foundBooking.address || 
                                   foundBooking.Address || 
                                   foundBooking.client_address ||
                                   foundBooking.Client_Address || "";
                setClientAddress(addressValue);
                
                setAssocName(foundBooking.associateName || foundBooking.AssociateName || "");
                {
                    const { code, digits } = parsePhone(foundBooking.associateContactNo || foundBooking.associateContact || foundBooking.AssociateContactNo || foundBooking.AssociateContact || "");
                    setAssocCountryCode(code);
                    setAssocContact(digits);
                }
                setAssocRERA(foundBooking.associateReraNo || foundBooking.associateRera || foundBooking.AssociateReraNo || foundBooking.AssociateRera || "");
                setReraSearch(foundBooking.associateReraNo || "");
                setAssocLeader(foundBooking.leaderName || foundBooking.LeaderName || "");
                {
                    const { code, digits } = parsePhone(foundBooking.leaderContactNo || foundBooking.LeaderContactNo || foundBooking.leaderContact || foundBooking.LeaderContact || "");
                    setAssocLeaderCountryCode(code);
                    setAssocLeaderContact(digits);
                }
               
                // Set payment information
                setInitialAmount(foundBooking.initialAmount || foundBooking.InitialAmount || "");
                if(foundBooking.initialPaymentDate)
                { 
                setInitialPaymentDate(foundBooking.initialPaymentDate.split('T')[0]);
                }
               // setInitialPaymentDate(foundBooking.initialPaymentDate || foundBooking.InitialPaymentDate || "");
                setInitialReceiptMethod(foundBooking.initialReceiptMethod || foundBooking.InitialReceiptMethod || "");
                setInitialTransactionId(foundBooking.initialTransactionId || foundBooking.InitialTransactionId || "");
                setInitialBankName(foundBooking.initialBankName || foundBooking.InitialBankName || "");
                
                setPlotNumber(foundBooking.plotNo || foundBooking.plotNumber || foundBooking.PlotNo || foundBooking.PlotNumber || "");
                setPlotId(foundBooking.plotId || foundBooking.PlotId || foundBooking.plotID || foundBooking.PlotID || "");
                setPlotSize(foundBooking.plotSize || foundBooking.PlotSize || "");
                
                // Set agreement rate
                const rateValue = foundBooking.agreementValue;
                setAgreementRate(rateValue ? formatTwoDecimals(rateValue) : "");

                 const totalValue = foundBooking.totalAgreementValue;
                setAgreementValue(totalValue ? formatTwoDecimals(totalValue) : "");
               
                const disc = foundBooking.discount;
                setDiscount(disc ? formatTwoDecimals(disc) : "");
               
                
                // Set booking date
                const bookingDateValue = foundBooking.bookingDate || foundBooking.BookingDate || foundBooking.createdAt || new Date().toISOString().split('T')[0];
                setBookingDate(bookingDateValue.split('T')[0]);

                // Handle existing file
                const possibleFileProps = [
                    'fileName', 'FileName',
                    'filePath', 'FilePath',
                    'chequeFileName', 'ChequeFileName',
                    'file', 'File',
                    'chequeFile', 'ChequeFile',
                    'imageUrl', 'ImageUrl',
                    'docPath', 'DocPath'
                ];
                
                let foundFile = null;
                for (const prop of possibleFileProps) {
                    if (foundBooking[prop]) {
                        foundFile = foundBooking[prop];
                        break;
                    }
                }

                if (foundFile) {
                    const displayName = String(foundFile).split(/[/\\]/).pop() || "Uploaded file";
                    setExistingFileName(displayName);
                }
                
                // Determine workflow type
                const workflowTypeId = foundBooking.workflowTypeId || foundBooking.workflowType;
                if (workflowTypeId === 1 || workflowTypeId === "1") {
                    setWorkflowType("WITH_LOAN");
                } else if (workflowTypeId === 2 || workflowTypeId === "2") {
                    setWorkflowType("WITHOUT_LOAN");
                } else if (workflowTypeId === 3 || workflowTypeId === "3") {
                    setWorkflowType("WITHOUT_7DAY_CLOSED");
                } else if (foundBooking.workflowCode) {
                    setWorkflowType(foundBooking.workflowCode);
                }

                // Set township and fetch plots
                const bookingTownshipName = foundBooking.townshipName || foundBooking.township || foundBooking.TownshipName || foundBooking.Township || "";
                const bookingTownshipId = foundBooking.townshipId || foundBooking.TownshipId || foundBooking.TownshipID;

                if (bookingTownshipName || bookingTownshipId) {
                    const cachedTownships = localStorage.getItem("townships_data");
                    if (cachedTownships) {
                        try {
                            const townships = JSON.parse(cachedTownships);
                            
                            let matchingTownship = null;
                            if (bookingTownshipId) {
                                matchingTownship = townships.find(t => 
                                    String(t.id) === String(bookingTownshipId) || 
                                    String(t.townshipId) === String(bookingTownshipId)
                                );
                            }

                            if (!matchingTownship && bookingTownshipName) {
                                matchingTownship = townships.find(t => 
                                    String(t.name).toLowerCase() === String(bookingTownshipName).toLowerCase()
                                );
                            }

                            if (matchingTownship) {
                                setTownship(matchingTownship.id ?? matchingTownship.name);
                                // Fetch plots for this township
                                fetchPlotsForTownship(matchingTownship.id ?? matchingTownship.name);
                            } else {
                                const fallbackValue = bookingTownshipId || bookingTownshipName;
                                setTownship(fallbackValue);
                                if (bookingTownshipId) {
                                    fetchPlotsForTownship(bookingTownshipId);
                                }
                            }
                        } catch (err) {
                            setTownship(bookingTownshipId || bookingTownshipName);
                        }
                    }
                }

            } catch (err) {
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to load booking details',
                });
                navigate("/property");
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [id, navigate, role]);


    // Effect for ID Proof preview
    useEffect(() => {
    if (!idProofFile) return setIdProofPreviewUrl(null);

    const previewUrl = URL.createObjectURL(idProofFile);
    setIdProofPreviewUrl(previewUrl);

    return () => {
        URL.revokeObjectURL(previewUrl);
    };
}, [idProofFile]);

    // Effect for Receipt preview
    useEffect(() => {
        if (!initialReceiptImage) return setInitialReceiptPreviewUrl(null);

        const previewUrl = URL.createObjectURL(initialReceiptImage);
        setInitialReceiptPreviewUrl(previewUrl);

        return () => {
            URL.revokeObjectURL(previewUrl);
        };
    }, [initialReceiptImage]);

    useEffect(() => {

        const r = Number(agreementRate) -    Number(discount);;
        const s = Number(plotSize);

        if (!Number.isFinite(r) || !Number.isFinite(s) || r <= 0 || s <= 0) {
            setAgreementValue(  0);
        }

          setAgreementValue( r * s);
     

    },[plotSize, agreementRate, discount]);
    
 
    const fetchPlotsForTownship = async (townshipValue) => {
        if (!townshipValue) {
            setPlots([]);
            return;
        }

        const selectedTownship = townshipsList.find(t => {
            const idMatches = [
                t.id,
                t.townshipId,
                t.TownshipId
            ].some(id => 
                id && String(id) === String(townshipValue)
            );
            
            const nameMatches = [
                t.name,
                t.townshipName,
                t.township,
                t.TownshipName,
                t.Township
            ].some(name => 
                name && String(name).toLowerCase() === String(townshipValue).toLowerCase()
            );
            
            return idMatches || nameMatches;
        });

        if (!selectedTownship) {
            setPlots([]);
            return;
        }

        try {
            setLoadingPlots(true);
            const townshipId = selectedTownship.id || selectedTownship.townshipId || selectedTownship.TownshipId;
            
            if (!townshipId) {
                setPlots([]);
                return;
            }

            let response;
            try {
                response = await axiosInstance.get(`${API_ENDPOINTS.PLOTS_LIST}?townshipId=${townshipId}&status=1`);
            } catch (e) {
                response = await axiosInstance.get(API_ENDPOINTS.PLOTS_LIST+"?status=1");
            }

            let allPlots = [];
            if (Array.isArray(response.data)) {
                allPlots = response.data;
            } else if (response.data && Array.isArray(response.data.value)) {
                allPlots = response.data.value;
            } else if (response.data && Array.isArray(response.data.data)) {
                allPlots = response.data.data;
            } else if (response.data && response.data.data) {
                allPlots = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
            }

            let filteredPlots = allPlots.filter(plot => {
                const plotTownshipId = plot.townshipId ?? plot.townShipId ?? plot.township?.id ?? plot.TownshipId ?? plot.townshipId;
                return String(plotTownshipId) === String(townshipId);
            });

            if ((!filteredPlots || filteredPlots.length === 0) && selectedTownship.raw && Array.isArray(selectedTownship.raw.plots)) {
                filteredPlots = selectedTownship.raw.plots;
            }

            const normalized = filteredPlots.map((p, idx) => ({
                id: p.id ?? p.plotId ?? p.plotID ?? idx,
                plotNo: p.plotNo ?? p.plotNumber ?? p.plotName ?? p.name ?? p.number ?? "",
                plotSize: parseFloat(p.plotSize ?? p.size ?? p.plotArea ?? 0) || 0,
            }));

            setPlots(normalized);
        } catch (error) {
            setPlots([]);
        } finally {
            setLoadingPlots(false);
        }
    };

    useEffect(() => {
        if (!plotNumber) return;
        const selectedPlot = plots.find(p => String(p.plotNo) === String(plotNumber));
        if (selectedPlot) {
            setPlotId(String(selectedPlot.id || ""));
            setPlotSize(String(selectedPlot.plotSize || ""));
        }
    }, [plots, plotNumber]);

    const handleReraSelect = (item) => {
  setAssocRERA(item.reraNo);
  setReraSearch(item.reraNo);

  setAssocName(item.firstName || "");

  const { code, digits } = parsePhone(item.contactNo || "");
  setAssocCountryCode(code);
  setAssocContact(digits);

  setAssocLeader(item.leaderName || "");

  const leader = parsePhone(item.leaderContactNo || "");
  setAssocLeaderCountryCode(leader.code);
  setAssocLeaderContact(leader.digits);

  setShowReraDropdown(false);
};

const download = async (documentId, filename) => {
 
  const response = await axiosInstance.get(API_ENDPOINTS.DOWNLOAD_DOCUMENT + `?id=${documentId}`,{responseType: 'blob'} );
  //const blob = await response.blob();
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      // 3. Create a URL for the Blob
      const url = window.URL.createObjectURL(new Blob([blob]));

      // 4. Create a temporary anchor (<a>) element
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || 'downloaded-file'); // Set the download attribute and file name

      // 5. Append the link to the document body and simulate a click
      document.body.appendChild(link);
      link.click();

      // 6. Clean up: remove the link and revoke the object URL
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
}

    const handleUpdate = async (e) => {
        e.preventDefault();
       
        const clientMobileDigits = normalizeTenDigits(clientMobile);
        const assocContactDigits = normalizeTenDigits(assocContact);
        const assocLeaderContactDigits = normalizeTenDigits(assocLeaderContact);
        
        // Validate required fields
        if (!clientName) {
            await Swal.fire({
                icon: 'error',
                title: 'Required Information Missing',
                text: 'Client Name is required.',
            });
            return;
        }

        try {
            // Validate mobile number format only if provided (mobile is optional)
            if (clientMobileDigits && clientMobileDigits.length > 0 && clientMobileDigits.length !== 10) {
                await Swal.fire({
                    icon: 'error',
                    title: 'Invalid Mobile Number',
                    text: 'Client mobile number must be 10 digits if provided.',
                });
                return;
            }

            // Only validate associate contact if it's provided
            if (assocContactDigits && assocContactDigits.length !== 10) {
                await Swal.fire({
                    icon: 'error',
                    title: 'Invalid Contact Number',
                    text: 'Associate contact number must be 10 digits.',
                });
                return;
            }

            // Validate leader contact if provided
            if (assocLeaderContactDigits && assocLeaderContactDigits.length !== 10) {
                await Swal.fire({
                    icon: 'error',
                    title: 'Invalid Contact Number',
                    text: 'Leader contact number must be 10 digits.',
                });
                return;
            }

            if (!township) {
                await Swal.fire({
                    icon: 'error',
                    title: 'Missing Information',
                    text: 'Please select a township before saving the booking.',
                });
                return;
            }

            let townshipId = null;
            try {
                const raw = localStorage.getItem("townships_data");
                if (raw) {
                    const townships = JSON.parse(raw);
                    const byId = townships.find(t => String(t.id) === String(township) || String(t.townshipId) === String(township));
                    if (byId && (byId.id || byId.townshipId)) {
                        townshipId = byId.id ?? byId.townshipId;
                    }

                    if (!townshipId) {
                        const byName = townships.find(t => String(t.name).toLowerCase() === String(township).toLowerCase());
                        if (byName && (byName.id || byName.townshipId)) {
                            townshipId = byName.id ?? byName.townshipId;
                        }
                    }
                }
            } catch (err) {
                // Silently handle error
            }

            if (!townshipId && booking) {
                const originalTownshipId = booking.townshipId || booking.TownshipId || booking.TownshipID;
                const originalTownshipName = booking.townshipName || booking.township || booking.TownshipName || booking.Township;
                
                if (String(township) === String(originalTownshipId) || 
                    String(township).toLowerCase() === String(originalTownshipName || '').toLowerCase()) {
                    
                    if (originalTownshipId) {
                        townshipId = originalTownshipId;
                    }
                }
            }

            if (!townshipId) {
                await Swal.fire({
                    icon: 'error',
                    title: 'Township Not Found',
                    text: `Township "${township}" not found. Please select a valid township.`,
                });
                return;
            }

            if (!plotNumber || String(plotNumber).trim() === '') {
                await Swal.fire({
                    icon: 'error',
                    title: 'Missing Information',
                    text: 'Please select a valid Plot Number for the chosen township.',
                });
                return;
            }

            if (!bookingDate || String(bookingDate || '').trim() === '') {
                await Swal.fire({
                    icon: 'error',
                    title: 'Booking Date Required',
                    text: 'Please select a booking date before saving.',
                });
                return;
            }

            if (!plotSize || String(plotSize || '').trim() === '') {
                await Swal.fire({
                    icon: 'error',
                    title: 'Plot Size Required',
                    text: 'Please  a valid plot size before saving.',
                });
                return;
            }

            // Validate ID Proof if file selected
            if (idProofFile && !idProofTypeId) {
                await Swal.fire({
                    icon: 'error',
                    title: 'Missing Information',
                    text: 'Please select an ID Proof Type for the uploaded file.',
                });
                return;
            }

            const formData = new FormData();
            formData.append('id', String(id));
            formData.append('bookingDate', bookingDate);
            formData.append('townshipId', String(townshipId || '').trim());
            formData.append('plotNo', String(plotNumber || '').trim());
            formData.append('plotId', String(plotId || '').trim());
            formData.append('plotSize', String(plotSize || '').trim());
            formData.append('clientName', String(clientName).trim());
            
            // Combine relation type and relative name
            const fullRelative = clientRelationType && clientRelative 
                ? `${clientRelationType} ${clientRelative}` 
                : clientRelative;
            formData.append('relationName', String(clientRelative).trim());
            
             formData.append('relationType',clientRelationType);
            if (clientMobileDigits) {
                formData.append('clientContactNo', buildPhone(clientCountryCode, clientMobileDigits));
            } else {
                formData.append('clientContactNo', clientCountryCode);
            }
            
            if (clientEmail && clientEmail.trim()) {
                formData.append('clientEmail', String(clientEmail).trim());
            }
            
            if (clientAddress && clientAddress.trim()) {
                formData.append('clientAddress', String(clientAddress).trim());
            }
            
            formData.append('associateName', String(assocName).trim());
            formData.append('associateReraNo', String(assocRERA).trim());
            
            // Always send associate contact - send empty string if not provided
            formData.append('associateContactNo', assocContactDigits ? buildPhone(assocCountryCode, assocContactDigits) : '');
            
            formData.append('LeaderName', String(assocLeader).trim());
            
            // Leader contact - include both common variants to match backend expectations
            if (assocLeaderContactDigits) {
                formData.append('leaderContactNo', buildPhone(assocLeaderCountryCode, assocLeaderContactDigits));
                formData.append('LeaderContactNo', buildPhone(assocLeaderCountryCode, assocLeaderContactDigits));
            } else {
                formData.append('leaderContactNo', assocLeaderCountryCode);
                formData.append('LeaderContactNo', assocLeaderCountryCode);
            }
            
            const workflowTypeMap = {
                WITH_LOAN: 1,
                WITHOUT_LOAN: 2,
                WITHOUT_7DAY_CLOSED: 3,
            };
            if (workflowType && workflowTypeMap[workflowType]) {
                formData.append("workflowTypeId", String(workflowTypeMap[workflowType]));           
                formData.append('workflowCode', workflowType);
            }
            
            if (agreementRate) {
                formData.append('agreementValue', formatTwoDecimals(agreementRate));
            }
            
            let ttlAgValue =  (agreementRate   - discount)*plotSize;

            if (agreementValue) {
                formData.append('totalAgreementValue', formatTwoDecimals(ttlAgValue));
            }

            if (discount) {
                formData.append('discount', discount);
            }
            // Add payment information
            if (initialAmount) {
                formData.append('InitialAmount', initialAmount);
            }
            if (initialPaymentDate && initialPaymentDate.trim()) {
                formData.append('InitialPaymentDate', initialPaymentDate);
            }
            if (initialReceiptMethod  ) {
                formData.append('InitialReceiptMethod', initialReceiptMethod);
            }
            if (initialTransactionId && initialTransactionId.trim()) {
                formData.append('InitialTransactionId', initialTransactionId);
            }
            if (initialBankName && initialBankName.trim()) {
                formData.append('InitialBankName', initialBankName);
            }
            if (initialReceiptImage) {
                formData.append('InitialReceiptImage', initialReceiptImage);
            }
         
            if (selectedFile) {
                formData.append('file', selectedFile);
            }

            const response = await axiosInstance.post(API_ENDPOINTS.BOOKING_SAVE, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Handle ID Proof Upload
            if (idProofFile && idProofTypeId) {
                try {
                    const idForm = new FormData();
                    idForm.append('BookingId', parseInt(id, 10));
                    idForm.append('DocumentTypeId', parseInt(idProofTypeId, 10));
                    idForm.append('File', idProofFile);
                    idForm.append('Notes', 'ID Proof (Uploaded during edit)');
                    
                    await axiosInstance.post(API_ENDPOINTS.UPLOAD_DOCUMENT, idForm, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                } catch (uploadErr) {
                    await Swal.fire({
                        icon: 'warning',
                        title: 'ID Upload Failed',
                        text: 'Booking updated, but ID proof upload failed. Please try again.',
                    });
                }
            }

            await Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Booking updated successfully',
                timer: 1500,
                showConfirmButton: false
            });

            navigate('/property?refresh=' + Date.now());
        } catch (err) {
            let errorMessage = 'Failed to update booking';
            let errorDetails = '';
            
            if (err.response) {
                if (err.response.status === 400) {
                    if (typeof err.response.data === 'string') {
                        errorMessage = err.response.data;
                    } else if (err.response.data?.message) {
                        errorMessage = err.response.data.message;
                    } else if (err.response.data?.errors) {
                        const errors = err.response.data.errors;
                        if (Array.isArray(errors)) {
                            errorDetails = errors.join(', ');
                        } else if (typeof errors === 'object') {
                            errorDetails = Object.values(errors).flat().join(', ');
                        }
                        errorMessage = 'Invalid booking data';
                    } else {
                        errorMessage = 'Invalid booking data. Please check all fields.';
                    }
                } else if (err.response.status === 401) {
                    errorMessage = 'Authentication failed. Please login again.';
                } else if (err.response.status === 500) {
                    errorMessage = 'Server error. Please try again later.';
                } else {
                    errorMessage = err.response.data?.message || `Error: ${err.response.status}`;
                }
            } else if (err.request) {
                errorMessage = 'Network error. Please check your internet connection.';
            } else {
                errorMessage = err.message || 'Unknown error occurred';
            }
            
            await Swal.fire({
                icon: 'error',
                title: 'Update failed',
                text: errorMessage,
                footer: errorDetails ? `<small>${errorDetails}</small>` : ''
            });
        }
    };



    if (loading) {
        return (
            <BookingWrapper className="dashboard-container">
                <div className="new-booking-header">
                    <div className="header-content">
                        <h2>Loading booking...</h2>
                    </div>
                </div>
            </BookingWrapper>
        );
    }

    return (
        <>
        <BookingWrapper className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h2 className="dashboard-title">Edit Booking</h2>
                    <p>Edit the details of the selected booking.</p>
                    {booking && isBookingOld(booking.bookingDate || booking.createdAt) && (
                        <div className="old-booking-warning">
                            ⚠️ This is an old booking record (older than 30 days). Only admin users can edit old records.
                        </div>
                    )}
                </div>
                <div className="dashboard-header-actions">
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
                {/* <PropertyNavigation hideHealthButton bookingId={id}/> */}
            </div>

            <div className="card">
                <div className="upload-loan-form-grid">
                        
                    <div className="upload-loan-field">
                        <label>Booking Type<span className="required">*</span></label>
                        <select 
                            value={workflowType} 
                            onChange={e => setWorkflowType(e.target.value)} 
                            required
                            disabled={loadingTownships}
                            className="form-control"
                        >
                            <option value="">-- Select Booking Type --</option>
                            <option value="WITH_LOAN">Loan</option>
                            <option value="WITHOUT_LOAN">Without Loan</option>
                            <option value="WITHOUT_7DAY_CLOSED">7 Days Close</option>
                        </select>
                    </div>
                    <div className="upload-loan-field">
                        <label>Booking Date<span className="required">*</span></label>
                        <input
                            type="date"
                            value={bookingDate}
                            onChange={e => setBookingDate(e.target.value)}
                            placeholder="mm/dd/yyyy"
                            required
                            className="form-control"
                        />
                    </div>
                    <div className="upload-loan-field">
                        <label>Township Name<span className="required">*</span></label>
                        <select 
                            value={township} 
                            onChange={e => { 
                                const value = e.target.value;
                                setTownship(value); 
                                setPlotNumber(""); 
                                setPlotId("");
                                setPlotSize(""); 
                                fetchPlotsForTownship(value);
                            }} 
                            required
                            disabled={loadingTownships}
                            className="form-control"
                        >
                            <option value="">
                                {loadingTownships ? "Loading townships..." : "-- Select Township --"}
                            </option>
                            {townshipsList.map(t => (
                                <option key={t.id ?? t.name} value={t.id ?? t.name}>{t.name}</option>
                            ))}
                            {township && !townshipsList.find(t => (t.id ?? t.name) === township) && (
                                <option value={township}>{township}</option>
                            )}
                        </select>
                    </div>

                    <div className="upload-loan-field">
                        <label>Plot Number<span className="required">*</span></label>
                        <select
                            value={plotNumber}
                            onChange={e => {
                                const value = e.target.value;
                                setPlotNumber(value);
                                const selectedPlot = plots.find(p => String(p.plotNo) === String(value));
                                if (selectedPlot) {
                                    setPlotId(String(selectedPlot.id || ''));
                                    setPlotSize(String(selectedPlot.plotSize || ''));
                                } else {
                                    const bookingPlotNo = booking?.plotNo || booking?.plotNumber || "";
                                    if (String(bookingPlotNo) === String(value)) {
                                        setPlotId(String(booking?.plotId || plotId || ""));
                                        setPlotSize(String(booking?.plotSize || plotSize || ""));
                                    } else {
                                        setPlotId('');
                                        setPlotSize('');
                                    }
                                }
                            }}
                            disabled={!township || loadingPlots}
                            className="form-control"
                        >
                            <option value="">
                            {loadingPlots
                                ? "Loading plots..."
                                : township && plots.length === 0
                                ? "No Plot Available"     
                                : !township
                                ? "Select township first"
                                : "-- Select Plot --"}
                            </option>
                            {plots.map(plot => (
                                <option key={plot.id} value={plot.plotNo}>
                                    {plot.plotNo}
                                </option>
                            ))}
                            {plotNumber && !plots.find(p => String(p.plotNo) === String(plotNumber)) && (
                                <option value={plotNumber}>{plotNumber}</option>
                            )}
                        </select>
                    </div>

                    <div className="upload-loan-field">
                        <label>Plot Size (Sq.Yds)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={plotSize}
                            readOnly
                            placeholder="Auto-filled from plot"
                            className="form-control"
                        />  
                    </div>

                    

                    <div className="upload-loan-field">
                        <label>Agreement Rate (per sq yd)<span className="required">*</span></label>
                       <input
                        type="text"
                        inputMode="decimal"
                        value={agreementRate}
                        onChange={(e) => {
                            const value = e.target.value;

                            // Allow only numbers + decimal
                            if (/^\d*\.?\d*$/.test(value)) {
                            setAgreementRate(value);
                            }
                        }}
                        onKeyDown={(e) => {
                            if (["-", "+", "e", "E"].includes(e.key)) {
                            e.preventDefault();
                            }
                        }}
                        onBlur={(e) => setAgreementRate(formatTwoDecimals(e.target.value))}
                        placeholder="rate per sq yard"
                        disabled={!canEditAgreementValue}
                        title={!canEditAgreementValue ? "Only Admin, Super Admin or Loan Admin can edit agreement rate" : ""}
                        className="form-control"
                        />
                        {!canEditAgreementValue && (
                            <small style={{ color: '#7f8c8d', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                Only Admin, Super Admin or Loan Admin can edit agreement rate
                            </small>
                        )}
                    </div>
                    <div className="upload-loan-field">
                        <label>Discount(per sq yd)</label>
                        <input
                            type="text"
                            inputMode="decimal"
                            value={discount}
                            onChange={(e) => {
                                const value = e.target.value;

                                if (/^\d*\.?\d*$/.test(value)) {
                                setDiscount(value);
                                }
                            }}
                            onKeyDown={(e) => {
                                if (["-", "+", "e", "E"].includes(e.key)) {
                                e.preventDefault();
                                }
                            }}
                            onBlur={(e) => setDiscount(formatTwoDecimals(e.target.value))}
                            placeholder="Discount"
                            className="form-control"
                            />
                        </div>
                    {/* <div className="upload-loan-field">   
                        <label style={{ fontWeight: 600, fontSize: "14px", textTransform: "capitalize", letterSpacing: "0.3px", color: "var(--primary-color)" }}>upload booking amount </label>
                        {existingFileName && !selectedFile && (
                            <div className="current-file-display">
                                Current file: {existingFileName}
                            </div>
                        )}
                        <input 
                            type="file" 
                            onChange={e => {
                                setSelectedFile(e.target.files?.[0] || null);
                            }} 
                        />
                        {selectedFile && (
                            <div className="new-file-selected">
                                New file selected: {selectedFile.name}
                            </div>
                        )}
                    </div> */}

                 

              
                    
                    <div className="upload-loan-field">
                        <label>Total Agreement Value</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={agreementValue}
                            onChange={e => setAgreementValue(e.target.value)}
                            onBlur={e => setAgreementValue(formatTwoDecimals(e.target.value))}
                            placeholder="Total Agreement Value"
                          
                             readOnly
                            title={!canEditAgreementValue ? "Only Admin, Super Admin or Loan Admin can edit total agreement value" : ""}
                            className="form-control"
                        />
                    
                    </div>
                </div>
            </div>
            
            {/* Payment Information Section */}
            <div className="card booking-info-card">
                <div className="booking-section">
                    <h4>Payment Information</h4>
                    <div className="booking-form-grid">
                        <div className="booking-form-field">
                            <label htmlFor="initialAmount">Booking Amount<span className="required">*</span></label>
                            <input
                                id="initialAmount"
                                className="form-control"
                                type="number"
                                value={initialAmount}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setAmountError("");
                                    if (value === "" || (Number(value) >= 0 && !value.includes('-'))) {
                                        setInitialAmount(value);
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') {
                                        e.preventDefault();
                                    }
                                }}
                                onBlur={(e) => {
                                    const value = e.target.value;
                                    if (value && Number(value) <= 0) {
                                        setAmountError("Booking amount must be greater than zero");
                                    } else {
                                        setAmountError("");
                                    }
                                }}
                                min="0.01"
                                step="0.01"
                                placeholder="booking amount"
                            />
                            {amountError && (
                                <small style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                    {amountError}
                                </small>
                            )}
                        </div>

                        <div className="booking-form-field">
                            <label htmlFor="initialPaymentDate">Receipt Date<span className="required">*</span></label>
                            <input
                                id="initialPaymentDate"
                                type="date"
                                value={initialPaymentDate}
                                onChange={(e) => setInitialPaymentDate(e.target.value)}
                                placeholder="mm/dd/yyyy"
                                className="form-control"
                            />
                        </div>

                        <div className="booking-form-field">
                            <label htmlFor="initialReceiptMethod">Payment Method<span className="required">*</span></label>
                            <select
                                id="initialReceiptMethod"
                                value={initialReceiptMethod}
                                onChange={(e) => setInitialReceiptMethod(e.target.value)}
                                className="form-control"
                            >
                                <option value="">Select Payment Method</option>
                                {paymentModes.map((mode) => (
                                    <option key={mode.value} value={mode.value}>
                                        {mode.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="booking-form-field">
                            <label htmlFor="initialTransactionId">Transaction ID / Cheque No.<span className="required">*</span></label>
                            <input
                                id="initialTransactionId"
                                type="text"
                                value={initialTransactionId}
                                onChange={(e) =>
                                    setInitialTransactionId(
                                    e.target.value.replace(/[^0-9]/g, "")
                                    )
                                }
                                onKeyDown={(e) => {
                                    if (!/[0-9]/.test(e.key) && e.key !== "Backspace" && e.key !== "Tab") {
                                    e.preventDefault();
                                    }
                                }}
                                placeholder="transaction ID or cheque number"
                                className="form-control"
                                />
                        </div>

                        <div className="booking-form-field">
                            <label htmlFor="initialBankName">Bank Name<span className="required">*</span></label>

                            <select
                                id="initialBankName"
                                value={initialBankName || ""}
                                onChange={(e) => setInitialBankName(e.target.value)}
                                className="form-control"
                            >
                                <option value="">
                                {bankList.length === 0 ? "Loading..." : "Select Bank"}
                                </option>

                                {bankList.map((bank) => (
                                <option key={bank.id} value={bank.name}>
                                    {bank.name}
                                </option>
                                ))}
                            </select>
                            </div>

                        <div className="booking-form-field">
                            <label htmlFor="initialReceiptImage">Upload Receipt / Cheque<span className="required">*</span></label>
                            <input
                                id="initialReceiptImage"
                                type="file"
                                onChange={(e) => setInitialReceiptImage(e.target.files?.[0] || null)}
                                accept="image/*,application/pdf"
                                className="form-control"
                            />
                            {initialReceiptImage && (
                                <div className="new-file-selected">
                                    Selected: {initialReceiptImage.name}
                                </div>
                            )}
                            {initialReceiptImage && initialReceiptPreviewUrl && (
                                <>
                                    {String(initialReceiptImage.type || "").startsWith("image/") && (
                                        <img
                                            src={initialReceiptPreviewUrl}
                                            alt="Receipt preview"
                                            style={{ marginTop: 8, maxWidth: "100%", maxHeight: 240, borderRadius: 6, border: "1px solid #dce1e6", objectFit: "contain" }}
                                        />
                                    )}
                                    {String(initialReceiptImage.type || "") === "application/pdf" && (
                                        <iframe
                                            src={initialReceiptPreviewUrl}
                                            title="Receipt PDF preview"
                                            style={{ marginTop: 8, width: "100%", height: 300, border: "1px solid #dce1e6", borderRadius: 6 }}
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <form onSubmit={handleUpdate} noValidate>
                {/* Client Information Section */}
                <div className="card booking-info-card">
                    <div className="booking-section">
                        <h4>Client Information</h4>
                        <div className="booking-form-grid">
                            <div className="booking-form-field">
                                <label htmlFor="clientName">Name<span className="required">*</span></label>
                                <input
                                    id="clientName"
                                    type="text"
                                    value={clientName}
                                    onChange={(e) => setClientName(e.target.value)}
                                    placeholder="client name"
                                    required
                                    className="form-control"
                                />
                            </div>
                            <div className="booking-form-field">
                                <label htmlFor="clientRelative">S/O , D/O , W/O , C/O<span className="required">*</span></label>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <select
                                        id="clientRelationType"
                                        value={clientRelationType}
                                        onChange={(e) => setClientRelationType(e.target.value)}
                                        className="form-control"
                                    >
                                        <option value="">-- Select --</option>
                                        <option value="S/O">S/O</option>
                                        <option value="D/O">D/O</option>
                                        <option value="W/O">W/O</option>
                                        <option value="C/O">C/O</option>
                                    </select>
                                    <input
                                        id="clientRelative"
                                        type="text"
                                        value={clientRelative}
                                        onChange={(e) => setClientRelative(e.target.value)}
                                        placeholder="relative name"
                                        style={{ flex: 1 }}
                                        className="form-control"
                                    />
                                </div>
                            </div>
                            <div className="booking-form-field">
                                <label htmlFor="clientEmail">Email address</label>
                                <input
                                    id="clientEmail"
                                    type="email"
                                    value={clientEmail}
                                    onChange={(e) => setClientEmail(e.target.value)}
                                    placeholder="johndoe@example.com"
                                    className="form-control"
                                />
                            </div>
                            <div className="booking-form-field">
                                <label htmlFor="clientMobile">Contact No</label>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <select
                                    disabled
                                    value={clientCountryCode}
                                    style={{ width: "120px" }}
                                    className="form-control"
                                >
                                    {countryCodeOptions.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                                    <input
                                        id="clientMobile"
                                        type="tel"
                                        inputMode="numeric"
                                        pattern="\d*"
                                        value={clientMobile}
                                        onChange={(e) => setClientMobile(normalizeTenDigits(e.target.value))}
                                        placeholder="10 digit mobile"
                                        maxLength={10}
                                        className="form-control"
                                    />
                                </div>
                            </div>
                            <div className="booking-form-field">
                                <label htmlFor="clientAddress">Address</label>
                                <textarea
                                    key={`address-${id}`}
                                    id="clientAddress"
                                    value={clientAddress}
                                    onChange={(e) => setClientAddress(e.target.value)}
                                    placeholder="Address"
                                    rows={3}
                                    className="form-control"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Associate Information Section */}
                <div className="card booking-info-card">
                    <div className="booking-section">
                        <h4>Associate Information</h4>
                        <div className="booking-form-grid">
                            <div className="booking-form-field">
                                <label htmlFor="assocRERA">RERA No<span className="required">*</span></label>
                               <input
                                value={reraSearch}
                                onChange={(e) => {
                                    setReraSearch(e.target.value);
                                    setShowReraDropdown(true);
                                }}
                                />
                                {showReraDropdown && (
                                <div className="rera-dropdown">
                                    {reraList
                                    .filter(item =>
                                        item.reraNo?.toLowerCase().includes(reraSearch.toLowerCase())
                                    )
                                    .map(item => (
                                        <div
                                        key={item.id}
                                        onClick={() => handleReraSelect(item)}
                                        style={{
                                            padding: "8px",
                                            cursor: "pointer",
                                            borderBottom: "1px solid #eee"
                                        }}
                                        >
                                        {item.reraNo}
                                        </div>
                                    ))}
                                </div>
                                )}
                            </div>
                            <div className="booking-form-field">
                                <label htmlFor="assocName">Associate Name<span className="required">*</span></label>
                                <input
                                    id="assocName"
                                    type="text"
                                    value={assocName}
                                    onChange={(e) => setAssocName(e.target.value)}
                                    placeholder="ABC Realty Associates"
                                    required
                                    className="form-control"
                                    readOnly
                                />
                            </div>
                           
                            <div className="booking-form-field">              
                                <label htmlFor="assocContact">Contact No<span className="required">*</span></label>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <select
                                        aria-label="Associate country code"
                                        value={assocCountryCode}
                                        onChange={(e) => setAssocCountryCode(e.target.value)}
                                        className="form-control"
                                        readOnly
                                    >
                                        {countryCodeOptions.map(o => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
                                    </select>
                                    <input
                                        id="assocContact"
                                        type="tel"
                                        inputMode="numeric"
                                        pattern="\d*"
                                        value={assocContact}
                                        onChange={(e) => setAssocContact(normalizeTenDigits(e.target.value))}
                                        placeholder="10 digit mobile"
                                        maxLength={10}
                                        className="form-control"
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div className="booking-form-field">
                                <label htmlFor="assocLeader">Leader Name<span className="required">*</span></label>
                                <input
                                    id="assocLeader"
                                    type="text"
                                    value={assocLeader}
                                    onChange={(e) => setAssocLeader(e.target.value)}
                                    placeholder="Rajesh Kumar"
                                    required
                                    className="form-control"
                                    readOnly
                                />
                            </div>
                            <div className="booking-form-field">
                                <label htmlFor="assocLeaderContact">Leader Contact No<span className="required">*</span></label>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <select
                                        aria-label="Leader country code"
                                        value={assocLeaderCountryCode}
                                        onChange={(e) => setAssocLeaderCountryCode(e.target.value)}
                                        className="form-control"
                                        readOnly
                                    >
                                        {countryCodeOptions.map(o => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
                                    </select>
                                    <input
                                        id="assocLeaderContact"
                                        type="tel"
                                        inputMode="numeric"
                                        pattern="\d*"
                                        value={assocLeaderContact}
                                        onChange={(e) => setAssocLeaderContact(normalizeTenDigits(e.target.value))}
                                        placeholder="10 digit mobile"
                                        maxLength={10}
                                        className="form-control"
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="booking-form-actions">
                    <button type="submit" className="primary-btn mb-4">
                        Update Booking
                    </button>
                </div>
            </form>


 

           
            
        </BookingWrapper>
       
        </>
        
        
    );
}
