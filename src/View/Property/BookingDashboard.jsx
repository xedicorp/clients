import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import LargeModal from '../../components/NewComponent/Modal/LargeModal';
import SmallModal from '../../components/NewComponent/Modal/SmallModal';
import API_ENDPOINTS , { API_BASE_URL } from '../../utilities/apiConfig';
import axiosInstance from '../../utilities/axiosInstance';
import Notifications from './Notifications';
import BookingWrapper from './style';
import { FaXmark } from "react-icons/fa6";  
import {
  determineWorkflowCode,
  getWorkflowBadgeClass,
  getWorkflowDisplayName,
  normalizeWorkflowTypeId,
  workflowCodeToId
} from '../../utilities/workflowUtils';

import { FcDocument } from "react-icons/fc";
import { FaRegCommentDots, FaCheckCircle, FaSearch, FaRedo, FaTimesCircle } from "react-icons/fa";
import { TbReceiptRupee } from "react-icons/tb";
import hasPermission from '../../utilities/HasPermission';
import { formatDisplayDate, toLocalIsoDate } from '../../utilities/dateUtils';
import { getPlotFacing } from '../../utilities/facingUtils';
import {
  getAllPermissions,
  getCurrentUserRole
} from '../../utilities/rolePermissions';
import './BookingDashboard.css';
import { set } from 'date-fns';

const BookingDashboard = () => {
  const currentUsername = (localStorage.getItem('userName') || '').toLowerCase();

  const shouldShowMenuItem = (permissionName) => {
    // Special handling for itadmin - show all menu items like admin
    if (permissionName == "") {
      return true;
    }
    return hasPermission(permissionName);
  };

   const [quickMenuItems, setQuickMenuItems] = useState([
    { id: 1, name: 'View File Progress' },
    { id: 2, name: 'JDA Patta Update'  },
    { id: 3, name: 'Send for Draft'  },
    { id: 4, name: 'Receipt Payment Update'  },
    { id: 5, name: 'Send for Agreement'  },
    { id: 6, name: 'Send for Allotment Letter'  },
    { id: 7, name: 'Update File Login Status'  },
    {id:8, name:'Update OCR Clearance Status'},
    {id:9, name:'Upload Bank DD'},
     {id:10, name:'Bank DD Update'},
     {id:11, name:'Update Dokit Signing Status'},
     {id:12, name:'Upload Document'},
     {id:13, name:'Update Loan  Sanction  Status'},
     {id:14, name:'Edit Booking'},
     {id:15, name:'Change Plot'},
     {id:16, name:'View Payment History'},
     {id:17, name:'Mark File Checked'},
     {id:18, name:'Manage Refunds'},
     {id:19, name:'Cancel Booking'},
     {id:20, name:'Send for Closure'},
  ]);
  
 const isApplicable = (sId, wId, menuItemId) => {
  //1: Loan, 2 Without Loan, 3 7 days close
 // return true; //for now enable so that old data could be updated
  let isShow = false;

    //50: Closed
    // if(sId==50 && (menuItemId==2 || menuItemId==3 ||  menuItemId==4
    //   || menuItemId==5 ||  menuItemId==6 ||  menuItemId==7 ||  menuItemId==8
    //   ||  menuItemId==9 ||  menuItemId==10  ||  menuItemId==11
    // ))
    //   return false;

    switch (wId) //Workflow Type Id
    {
      case 1:
           
          isShow= true;
          break;
      case 2:  //without loan
          if(menuItemId==7 || menuItemId==8 || menuItemId==11 || menuItemId==13)
          {
            isShow=false;
          }
          else
            isShow= true;
          break;
      case 3: //7 days clear
       if(menuItemId==7 || menuItemId==8 || menuItemId==11|| menuItemId==13)
          {
            isShow=false;
          }
          else
          isShow= true;
          break;
      default :
          isShow= false;
    }
    return isShow;
  };
 
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterTownship, setFilterTownship] = useState('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterAssociation, setFilterAssociation] = useState('all');
  const [filterSearch, setFilterSearch] = useState('');
  const [searchDraft, setSearchDraft] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [filterWorkflow, setFilterWorkflow] = useState('all');
  const [allowedTownshipNames, setAllowedTownshipNames] = useState(null);
  const [showUploadedDocumentModal, setShowUploadedDocumentModal] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState([]);
  const [showViewReceiptModal, setShowViewReceiptModal] = useState(false);
  const [uploadedReceiptList, setUploadedReceiptList] = useState([]);
  const [showClosureConfirmationModal, setShowClosureConfirmationModal] = useState(false);
  const [closureValidation, setClosureValidation] = useState(null);
  const [closureLoading, setClosureLoading] = useState(false);
  const [totalAmountReceived, setTotalAmountReceived] = useState('');
  const [amountUnderVerification, setAmountUnderVerification] = useState('');
  const [transactionsList, setTransactionsList] = useState([]);
  // Search API specific states
  const [searchParams, setSearchParams] = useState({
    townshipId: '',
    bookingType: '',
    bookingStatus: '',
    reraNo: '',
    plotNo: '',
    fromDate: '',
  });
  const [townships, setTownships] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Associate search states
  const [associateSearchText, setAssociateSearchText] = useState('');
  const [showAssociateDropdown, setShowAssociateDropdown] = useState(false);
  const [filteredAssociates, setFilteredAssociates] = useState([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Cancel booking modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

   // Remarks modal state
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [remarkText, setRemarkText] = useState("");

  // Refund modal state
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedRefundBooking, setSelectedRefundBooking] = useState(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundLoading, setRefundLoading] = useState(false);

  // Add Status modal state
  const [showAddStatusModal, setShowAddStatusModal] = useState(false);
  const [selectedStatusBooking, setSelectedStatusBooking] = useState(null);
  const [statusDate, setStatusDate] = useState('');
  const [statusType, setStatusType] = useState('booking_created');
  const [statusNote, setStatusNote] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);

  // Menu dropdown state
  const [openMenuId, setOpenMenuId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({});

  // Change Plot modal state
  const [showChangePlotModal, setShowChangePlotModal] = useState(false);
  const [selectedChangePlotBooking, setSelectedChangePlotBooking] =
    useState(null);
  const [availablePlots, setAvailablePlots] = useState([]);
  const [selectedPlot, setSelectedPlot] = useState('');
  const [changePlotReason, setChangePlotReason] = useState('');
  const [changePlotLoading, setChangePlotLoading] = useState(false);
  const [newAgreementValue, setNewAgreementValue] = useState('');
  const [showNotificationsPopup, setShowNotificationsPopup] = useState(false);
  const [isDraftChecked, setIsDraftChecked] = useState(false);
  const [isATTChecked, setIsATTChecked] = useState(false);
  const [isAllotmentChecked, setIsAllotmentChecked] = useState(false);
  const dropdownRef = useRef(null);

  const triggerElementRef = useRef(null);
  const menuElementRef = useRef(null);

  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [shouldRenderAbove, setShouldRenderAbove] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [menuCoords, setMenuCoords] = useState({ top: 0, left: 0 });
  const [renderAboveFlag, setRenderAboveFlag] = useState(false);

  // Client Info modal state
  const [showClientInfoModal, setShowClientInfoModal] = useState(false);
  const [selectedClientInfo, setSelectedClientInfo] = useState(null);
  const [statusList, setStatusList] = useState([]);
  const [reraList, setReraList] = useState([]);
  const [reraSearch, setReraSearch] = useState("");
  const [loadingReraList, setLoadingReraList] = useState(false);
  const [debouncedReraSearch, setDebouncedReraSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // Plot No. search states
  const [plotSearch, setPlotSearch] = useState("");
  const [showPlotDropdown, setShowPlotDropdown] = useState(false);
  const [plotList, setPlotList] = useState([]);
  const [loadingPlotList, setLoadingPlotList] = useState(false);
  const [debouncedPlotSearch, setDebouncedPlotSearch] = useState("");
  const [selectedBookingForClientInfo, setSelectedBookingForClientInfo] = useState(null);

  useEffect(() => {
    if (isMenuVisible && triggerElementRef.current && menuElementRef.current) {
      const triggerRect = triggerElementRef.current.getBoundingClientRect();
      const menuHeight = menuElementRef.current.offsetHeight;

      const availableSpaceBelow = window.innerHeight - triggerRect.bottom;
      const availableSpaceAbove = triggerRect.top;

      // 🔥 NEW: detect if page is fully scrolled
      const scrollTop = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;

      const isPageAtBottom =
        scrollTop + windowHeight >= documentHeight - 5;

      if (
        availableSpaceBelow < menuHeight ||
        isPageAtBottom
      ) {
        setShouldRenderAbove(true);
      } else {
        setShouldRenderAbove(false);
      }
    }
  }, [isMenuVisible]);

 
   

  const toggleMenu = (bookingId, buttonElement) => {
    if (openMenuId === bookingId) {
      setOpenMenuId(null);
      setDropdownPosition({});
      return;
    }

    if (buttonElement) {
      const rect = buttonElement.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const estimatedHeight = 250;
      const spaceBelow = viewportHeight - rect.bottom - 50;
      const spaceAbove = rect.top - 310;
      let positionStyle = {};
      if (spaceBelow >= estimatedHeight) {
        positionStyle = {
          top: "100%",
          bottom: "auto",
          marginTop: "8px",
          marginBottom: "0px",
          maxHeight: estimatedHeight,
          overflowY: "auto",
        };
      }
      else if (spaceAbove >= estimatedHeight) {
        positionStyle = {
          top: "auto",
          bottom: "100%",
          marginTop: "0px",
          marginBottom: "8px",
          maxHeight: estimatedHeight,
          overflowY: "auto",
        };
      }
      else {
        if (spaceBelow >= spaceAbove) {
          positionStyle = {
            top: "100%",
            bottom: "auto",
            marginTop: "8px",
            marginBottom: "0px",
            maxHeight: spaceBelow - 10,
            overflowY: "auto",
          };
        } else {
          positionStyle = {
            top: "auto",
            bottom: "100%",
            marginTop: "0px",
            marginBottom: "8px",
            maxHeight: spaceAbove - 10,
            overflowY: "auto",
          };
        }
      }

      setDropdownPosition(positionStyle);
    }

    setOpenMenuId(bookingId);
  };





  const navigate = useNavigate();
  const location = useLocation();
  const currentUserRole = getCurrentUserRole();
  const permissions = getAllPermissions();

  
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        const userId =
          localStorage.getItem('userId') ||
          localStorage.getItem('spendwise_userId');
        const townshipsResponse = await axiosInstance.get(
          // API_ENDPOINTS.TOWNSHIP_LIST+"?userId="+getUserId()
            API_ENDPOINTS.TOWNSHIP_LIST
        );

        const townshipsData = Array.isArray(townshipsResponse.data)
          ? townshipsResponse.data
          : townshipsResponse.data?.value || [];


        setTownships(townshipsData);
        const urlParams = new URLSearchParams(location.search);
        const shouldRefresh = urlParams.get('refresh');
        const plotChanged = urlParams.get('plotChanged');
        const fromView = urlParams.get('fromView');
        if (
          shouldRefresh === 'true' ||
          plotChanged === 'true' ||
          fromView === 'true'
        ) {
          await handleSearchAPI(false);

          if (plotChanged === 'true') {
            setTimeout(() => {
              Swal.fire({
                icon: 'success',
                title: 'Plot Changed Successfully',
                text: 'The plot has been changed and the booking list has been updated.',
                timer: 3000,
                showConfirmButton: false,
              });
            }, 1000);
          }
        }

        if (
          shouldRefresh === 'true' ||
          fromView === 'true' ||
          plotChanged === 'true'
        ) {
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }
      } catch (error) {
        setError(error.message || 'Failed to load initial data');
        setTownships([]);
      } finally {
        setLoading(false);
      }
    };

    const handleClickOutside = (event) => {
      if (!event.target.closest('.booking-menu-container')) {
        setOpenMenuId(null);
      }
    };

    loadInitialData(); 
    var searchItems =localStorage.getItem("searchCriteria");
   
    if(searchItems)
    {  
        let searchObj = JSON.parse(searchItems);
        const queryParams = new URLSearchParams();      
        queryParams.append('townshipId', searchObj.townshipId)  ;     
        queryParams.append('bookingType', searchObj.bookingType  );     
        queryParams.append('bookingStatus', searchObj.bookingStatus  );     
        queryParams.append('reraNo', searchObj.reraNo  );      
        queryParams.append('plotNo', searchObj.plotNo );      
        queryParams.append('fromDate', searchObj.fromDate  );
        queryParams.append('userId', searchObj.userId);
        loadData(false,queryParams);

        setSearchParams({
           townshipId: searchObj.townshipId,
          bookingType: searchObj.bookingType,
          bookingStatus: searchObj.bookingStatus,
          reraNo: searchObj.reraNo,
          plotNo: searchObj.plotNo ,
          fromDate: searchObj.fromDate ,
        })
    }
    
    document.addEventListener('click', handleClickOutside);


    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [location.search]);

   
  const createSeacrhParams=()=>{

   
      const queryParams = new URLSearchParams();
      if (searchParams.townshipId)
        queryParams.append('townshipId', searchParams.townshipId) || '';
      if (searchParams.bookingType)
        queryParams.append('bookingType', searchParams.bookingType || '');
      if (searchParams.bookingStatus)
        queryParams.append('statusTypeId', searchParams.bookingStatus || '');
      if (searchParams.reraNo?.trim()) {
        queryParams.append('reraNo', searchParams.reraNo.trim());
      }
      if (searchParams.plotNo && searchParams.plotNo.trim())
        queryParams.append('plotNo', searchParams.plotNo.trim());
      if (searchParams.fromDate)
        queryParams.append('fromDate', searchParams.fromDate || '');

      queryParams.append('userId', getUserId());

      //local store search criteria
       let searchObj = {
          'townshipId': searchParams.townshipId || '',
          'bookingType': searchParams.bookingType || '',
          'bookingStatus': searchParams.bookingStatus || '',
          'reraNo': searchParams.reraNo || '',
          'plotNo': searchParams.plotNo?.trim() || '',
          'fromDate': searchParams.fromDate || '',
          'userId': getUserId()
       }; 
      localStorage.setItem("searchCriteria",JSON.stringify( searchObj));
      return queryParams;
  }
  
  const handleSearchAPI = async (showSuccessModal = true) => {
    setSearchLoading(true);
    setError(null);

    try {
      const queryParams =  createSeacrhParams();     
       loadData(false, queryParams);
      }
     catch (error) {
      setError(error.message || 'Failed to search bookings');
      setBookings([]);

      let errorMessage = 'Failed to search bookings. Please try again.';

      if (error.response?.status === 404) {
        errorMessage =
          'Search endpoint not found. Please contact administrator.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error occurred. Please try again later.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (
        error.name === 'TypeError' &&
        error.message.includes('Cannot read properties of undefined')
      ) {
        errorMessage =
          'Invalid data received from server. Please try again or contact support.';
      }

      // if (showSuccessModal) {
      //   Swal.fire({
      //     icon: 'error',
      //     title: 'Search Failed',
      //     text: errorMessage,
      //   });
      // }
      const queryParams = createSeacrhParams();
loadData(showSuccessModal, queryParams);
    } finally {
      setSearchLoading(false);
    }
  };

  const loadData= async (showSuccessModal = true, queryParams ) => {
     try {
      if (!queryParams) {
      queryParams = new URLSearchParams();
    }
        
      const apiUrl = `${API_ENDPOINTS.BOOKING_SEARCH}?${queryParams.toString()}`;
      const response = await axiosInstance.get(apiUrl);
      let searchResults = Array.isArray(response.data)
        ? response.data
        : response.data?.value || [];

      if (searchResults.length > 0) {
        let transformedBookings = searchResults
          .map((item) => {
            if (!item || !item.id || typeof item !== 'object')
              return null;
              
            const workflowCode = determineWorkflowCode(item);
            const existingBooking = bookings.find(
              (b) => b && b.id === item.id,
            );
            const shouldPreserveLocalStatus =
              !!existingBooking &&
              ((existingBooking?.status === 'plot_changed' &&
                (!item?.status ||
                  item?.status === 'booking_created')) ||
                (existingBooking?.status === 'cancelled' &&
                  item?.status !== 'cancelled'));

            return {
              id: item.id,
              township: item.townshipName || 'Unknown',
              townshipId:
                item.townshipId ||
                item.TownshipId ||
                item.TownshipID ||
                item.township?.id ||
                item.Township?.id,
              plotNumber:
                item.plotNo ||
                item.PlotNo ||
                item.plot_no ||
                'N/A',
              plotId:
                item.plotId ||
                item.PlotId ||
                item.plotID ||
                item.PlotID ||
                item.plot?.id ||
                item.Plot?.id,
              plotSize: item.plotSize || 'N/A',
              plotFacing:
                item.plotFacing ||
                item.facing ||
                item.facingName ||
                item.FacingName ||
                item.plotDirection ||
                item.direction,
              createdAt: item.bookingDate
                ? toLocalIsoDate(item.bookingDate)
                : toLocalIsoDate(new Date()),
              clientName: item.clientName || '',
              clientEmail: item.clientEmail || '',
              clientMobile: item.contactNo || '',
              clientAddress:
                item.address ||
                item.Address ||
                item.clientAddress ||
                '',
              clientRelativeName: item.relationName || '',
              clientRelation: item.relationType || '',
              associateName: item.associateName || '',
              associateReraNo: item.associateReraNo || '',
              associateContactNo: item.associateContactNo || '',
              leaderName: item.leaderName || '',
              leaderContactNo: item.leaderContactNo || '',
              status:
                (shouldPreserveLocalStatus
                  ? existingBooking?.status
                  : (
                    item?.status || 'booking_created'
                  ).toLowerCase()) || 'booking_created',
              workflowTypeId: (() => {
                const rawId = Number(
                  item.workflowTypeId ||
                  item.workflowType ||
                  item.WorkflowType,
                );
                return normalizeWorkflowTypeId(rawId);
              })(),
              workflowCode: workflowCode,
              updatedAt: new Date().toISOString(),
              rawDate: item.bookingDate || new Date(),
              // Additional fields from API response
              agreementValue: item.agreementValue || 0,
               totalTDSDeducted: item.totalTDSDeducted || 0,
              totalAgreementValue: item.totalAgreementValue || null,
              discount: item.discount || null,
              chequeFilePath: item.chequeFilePath || null,
              currentStage: item.currentStage || null,
              paymentMode: item.paymentMode || null,
              amount_2: item.amount_2 || null,
              transNo: item.transNo || null,
              dateOfTransfer: item.dateOfTransfer || null,
              isPaymentVerified: item.isPaymentVerified || null,
              notes_2: item.notes_2 || null,
              dateOfLogin: item.dateOfLogin || null,
              bankName: item.bankName || null,
              branchName: item.branchName || null,
              loginRefNo: item.loginRefNo || null,
              notes_3: item.notes_3 || null,
              isDraftPrepared: item.isDraftPrepared || null,
              draftPreparedOn: item.draftPreparedOn || null,
              isDraftGivenToBank: item.isDraftGivenToBank || null,
              draftGivenToBankOn: item.draftGivenToBankOn || null,
              notes_4: item.notes_4 || null,
              isLoanSanctioned: item.isLoanSanctioned || null,
              loanSanctionDate: item.loanSanctionDate || null,
              loanSanctionNotes: item.loanSanctionNotes || null,
              isCompletedOnAllSides: item.isCompletedOnAllSides || null,
              completionDate: item.completionDate || null,
              markFileCheckNotes: item.markFileCheckNotes || null,
              originalATTPath: item.originalATTPath || null,
              originalATTNotes: item.originalATTNotes || null,
              isDokitSigned: item.isDokitSigned || null,
              dokitSignDate: item.dokitSignDate || null,
              isJDAFileSigned: item.isJDAFileSigned || null,
              jdaFileSignDate: item.jdaFileSignDate || null,
              dokitSigingNotes: item.dokitSigingNotes || null,
              bankDDPath: item.bankDDPath || null,
              ddNo: item.ddNo || null,
              ddAmount: item.ddAmount || null,
              ddNotes: item.ddNotes || null,
              isJDAPattaApplied: item.isJDAPattaApplied || null,
              jdaPattaAppliedOn: item.jdaPattaAppliedOn || null,
              isJDAPattaRegistered: item.isJDAPattaRegistered || null,
              jdaPattaRegisteredOn: item.jdaPattaRegisteredOn || null,
              isJDAPattaGivenToBank: item.isJDAPattaGivenToBank || null,
              jdaPattaGivenToBankOn: item.jdaPattaGivenToBankOn || null,
              isDDReceivedFromBank: item.isDDReceivedFromBank || null,
              ddReceivedFromBankOn: item.ddReceivedFromBankOn || null,
              jdaPattaNotes: item.jdaPattaNotes || null,
              isDDSubmittedToBank: item.isDDSubmittedToBank || null,
              ddClearedOn: item.ddClearedOn || null,
              ddUpdateNotes: item.ddUpdateNotes || null,
              statusId: item.statusId || null,
              lastStatusChangedOn: item.lastStatusChangedOn || null,
              allowedDays: item.allowedDays || 0,
              elapsedDays: item.elapsedDays || null,
              remainingDays: item.remainingDays || 0,
              progressState: item.progressState || 'NO_TIMELINE',
              progressColor: item.progressColor || '#ffffff',
            };
          })
          .filter(
            (booking) =>
              booking !== null &&
              booking !== undefined &&
              booking.id,
          )
          .sort((a, b) => {
            const dateDiff =
              new Date(b.rawDate) - new Date(a.rawDate);
            if (dateDiff !== 0) return dateDiff;
            return b.id - a.id;
          });

        setBookings(transformedBookings);
        setHasSearched(true);

        if (showSuccessModal) {
          // Optional: Show success message for filtered searches
        }
      } else {
        setBookings([]);
        setHasSearched(true);


        const message =
          'No bookings found matching your search criteria.';

        if (showSuccessModal) {
          const selectedTownship = townships.find(t => t.id == searchParams.townshipId);
          const townshipName = selectedTownship?.name || 'selected township';

          Swal.fire({
            icon: 'info',
            title: 'No Results',
            html: `
              <div style="text-align: left;">
                <p>${message}</p>
                <br/>
                <p><strong>Search Criteria:</strong></p>
                <ul style="margin-left: 20px;">
                  ${searchParams.townshipId ? `<li>Township: ${townshipName} (ID: ${searchParams.townshipId})</li>` : ''}
                  ${searchParams.bookingType ? `<li>Booking Type: ${searchParams.bookingType}</li>` : ''}
                  ${searchParams.bookingStatus ? `<li>Status: ${searchParams.bookingStatus}</li>` : ''}
                  ${searchParams.reraNo ? `<li>Associate Rera ID: ${searchParams.reraNo}</li>` : ''}
                  ${searchParams.plotNo ? `<li>Plot No: ${searchParams.plotNo}</li>` : ''}
                  ${searchParams.fromDate ? `<li>From Date: ${searchParams.fromDate}</li>` : ''}
                </ul>
                <br/>
                <p style="color: #666; font-size: 13px;">
                  <strong>Tip:</strong> Try removing some filters or check if bookings exist for this township in the database.
                </p>
              </div>
            `,
            confirmButtonText: 'OK',
            width: '500px'
          });
        }
      }
    } catch (error) {
      setError(error.message || 'Failed to search bookings');
      setBookings([]);

      let errorMessage = 'Failed to search bookings. Please try again.';

      if (error.response?.status === 404) {
        errorMessage =
          'Search endpoint not found. Please contact administrator.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error occurred. Please try again later.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (
        error.name === 'TypeError' &&
        error.message.includes('Cannot read properties of undefined')
      ) {
        errorMessage =
          'Invalid data received from server. Please try again or contact support.';
      }

      // if (showSuccessModal) {
      //   Swal.fire({
      //     icon: 'error',
      //     title: 'Search Failed',
      //     text: errorMessage,
      //   });
      // }
     
    } finally {
      setSearchLoading(false);
    }
     if (showSuccessModal) {
        Swal.fire({
          icon: 'error',
          title: 'Search Failed',
          text: errorMessage,
        });
      }
  }
useEffect(() => {
  if (!reraSearch.trim()) {
    setSearchParams(prev => ({ ...prev, reraNo: "" }));
  }
}, [reraSearch]);

// Fetch receipts function
    const fetchTransactions = async (currentBookingId) => {
        try {
            const hasBookingId =
                currentBookingId && String(currentBookingId).trim() !== '';
            let url = `${API_ENDPOINTS.TRANSACTIONS_BY_BOOKINGID}?bookingId=${currentBookingId}`;

            const response = await axiosInstance.get(url);
            let transList = [];

            if (Array.isArray(response.data)) {
                transList = response.data;
            } else if (response.data && typeof response.data === 'object') {
                transList = response.data || [];
            }
            setTransactionsList(transList);
            // Filter for current booking
            let amount = 0;
            let discount = 0;
            let amtUnderVarification = 0;
            transList.map((receipt) => {
                if (receipt.status == 3 && receipt.headName == 'Receipt')
                    //3:Verified
                    amount = amount + receipt.amount;

                if (receipt.headName == 'Excess Refund')
                    //3:Verified
                    amount = amount - receipt.amount;

                if (receipt.headName == 'Discount')
                    //3:Verified
                    discount = discount + receipt.amount;

                if (receipt.status == 2 && receipt.headName == 'Receipt')
                    //2:Under Vaification
                    amtUnderVarification =
                        amtUnderVarification + receipt.amount;
            });

            setTotalAmountReceived(amount);
            setAmountUnderVerification(amtUnderVarification);
        } catch (error) {
            let errorMsg = 'Failed to load receipts.';
            if (error.message?.includes('Network Error')) {
                errorMsg =
                    'Network error. Please check your internet connection.';
            } else if (error.response?.status === 404) {
                errorMsg = 'Receipt list endpoint not found.';
            } else if (error.response?.status === 500) {
                errorMsg = 'Server error. Please try again later.';
            }
            
            setTransactionsList([]);
        } finally {
            setLoading(false);
        }
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
    }
  };

  const getReraList = async () => {
    try {
      setLoadingReraList(true);
      const response = await axiosInstance.get(
        API_ENDPOINTS.ASSOCIATE_LIST
      );

      const formattedData = response.data
        .filter(item => item.reraNo)
        .map(item => ({
          id: item.id,
          reraNo: item.reraNo
        }));
      setReraList(formattedData);

    } catch (error) {
    } finally {
      setLoadingReraList(false);
    }
  };

  const getPlotList = async (townshipId) => {
    if (!townshipId) return
    try {
      setLoadingPlotList(true);
      const response = await axiosInstance.get(
        `${API_ENDPOINTS.PLOTS_LIST}?townshipId=${townshipId}`
      );
      const formattedData = (response.data || [])
        .filter(item => item.status?.toLowerCase() === 'available')
      setPlotList(formattedData);
      console.log('Formatted plot data:', formattedData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingPlotList(false);
    }
  };

useEffect(() => {
  if (showCancelModal && selectedBookingId) {
    fetchTransactions(selectedBookingId);
  }
}, [showCancelModal, selectedBookingId]);
  useEffect(() => {
    getStatusData();
    getReraList();
    getPlotList();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedReraSearch(reraSearch);
    }, 200); // 300ms debounce

    return () => clearTimeout(timer);
  }, [reraSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPlotSearch(plotSearch);
    }, 200);

    return () => clearTimeout(timer);
  }, [plotSearch]);

  const filteredReraList = debouncedReraSearch
    ? reraList.filter(item =>
      item.reraNo
        ?.toLowerCase()
        .includes(debouncedReraSearch.toLowerCase())
    )
    : [];




  const updateBooking = (id, patch) => {
    setBookings((prev) => {
      const next = prev
        .filter((x) => x && x.id && typeof x === 'object')
        .map((x) => {
          if (x.id !== id) return x;
          return {
            ...x,
            ...patch,
            updatedAt: new Date().toISOString(),
            _justUpdated: true,
          };
        });

      setTimeout(() => {
        setBookings((current) =>
          current
            .filter((x) => x && x.id && typeof x === 'object')
            .map((x) => {
              if (x.id !== id) return x;
              return { ...x, _justUpdated: false };
            }),
        );
      }, 1500);

      return next;
    });
  };
  const handleCancelBooking = (bookingId) => {
    setSelectedBookingId(bookingId);
    setCancelReason('');
    setShowCancelModal(true);
  };
  const handleSenClosureBooking = async (bookingId) => {

  setSelectedBookingId(bookingId);
  setCancelReason('');
  setShowClosureConfirmationModal(true);

  try {

    setClosureLoading(true);

    const response = await axiosInstance.get(
      `${API_ENDPOINTS.CLOSURE_VALIDATION}/${bookingId}`
    );

    setClosureValidation(response.data);
    console.log("Closure validation response:", response.data);

  } catch (error) {
    console.error(error);
  } finally {
    setClosureLoading(false);
  }

};
const handleRemark = (bookingId) => {
    setSelectedBookingId(bookingId);
    openRemarkModal(bookingId);
  };
 const openRemarkModal = async (bookingId) => {

 

  try {

    const response = await axiosInstance.get(
      API_ENDPOINTS.BOOKING_GET_BY_ID,
      {
        params: { bookingId: bookingId }
      }
    );

    console.log("Booking details:", response.data);

    setRemarkText(response.data?.remark || "");

  } catch (error) {

    console.error("Failed to fetch remark:", error);
    setRemarkText("");

  }
 setSelectedBookingId(bookingId);
  setShowRemarkModal(true);
};

  const handleRefundBooking = (booking) => {
    setSelectedRefundBooking(booking);
    setRefundAmount('');
    setShowRefundModal(true);
  };

  const handleChangePlot = (booking) => {
    console.log('Selected booking for change plot:', booking);
    setSelectedChangePlotBooking(booking);
    setSelectedPlot(booking.plotId);
    setNewAgreementValue('');
    setShowChangePlotModal(true);
    getPlotList(booking.townshipId);
  }

  const selectedPlotDetails = plotList.find(
    (p) => p.id === parseInt(selectedPlot)
  );

  const handleViewDocuments = async (bookingId) => {
    try {
      const { data } = await axiosInstance.get(
        `${API_ENDPOINTS.GET_DOCUMENTS_BY_BOOKING_ID}?bookingId=${bookingId}`
      );

      setUploadedDocument(data || []);
    } catch (error) {
      setUploadedDocument([]);
    } finally {
      setShowUploadedDocumentModal(true);
    }
  };

  const handleViewReceipts = async (bookingId) => {
    try {
      const { data } = await axiosInstance.get(
        `${API_ENDPOINTS.RECEIPT_LIST_BY_BOOKING_ID}?bookingId=${bookingId}`
      );
      setUploadedReceiptList(data || []);
    } catch (error) {
      setUploadedReceiptList([]);
    } finally {
      setShowViewReceiptModal(true);
    }
  };


  const handleDownloadDocument = async (doc) => {
    if (!doc?.documentId) {
      Swal.fire("Invalid Document", "Missing document ID.", "error");
      return;
    }

    try {
      Swal.fire({
        title: "Downloading...",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      const { data, headers } = await axiosInstance.get(
        `${API_ENDPOINTS.DOCUMENT_DOWNLOAD}?id=${doc.documentId}`,
        { responseType: "blob" }
      );

      Swal.close();

      if (!data || data.size === 0) {
        throw new Error("Empty file received.");
      }

      const blob = new Blob([data], {
        type: headers["content-type"],
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = doc.fileName || `Document_${doc.documentId}`;
      link.click();

      URL.revokeObjectURL(url);

    } catch (error) {
      Swal.close();
      Swal.fire("Error", "Download failed.", "error");
    }
  };


  const formatPaymentMethod = (paymentMode) => {
    switch (paymentMode) {
      case 1:
        return "Bank Transfer";

      case 2:
        return "Cheque";

      case 4:
        return "UPI";

      case 5:
        return "NEFT/RTGS";

      case 6:
        return "Demand Draft";

      default:
        return paymentMode;
    }
  };

 const handleDownloadReceipt = (doc) => {
  if (!doc?.receiptImage) {
    Swal.fire("No File", "No file uploaded for this receipt.", "info");
    return;
  }

  const fileUrl = `${API_BASE_URL}/Uploads/${doc.receiptImage}`;
  const fileName = fileUrl.split("/").pop();

  const link = document.createElement("a");
  link.href = fileUrl;
  link.setAttribute("download", fileName); 

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

  const handleDownloadClosureDoc = (filePath) => {

  if (!filePath) return;

  const fileUrl = `${API_BASE_URL}/Uploads/${filePath}`;

  const link = document.createElement("a");
  link.href = fileUrl;
  link.setAttribute("download", filePath); 

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

};


  const submitCancelBooking = async () => {
    if (!cancelReason.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Reason Required',
        text: 'Please provide a reason for cancellation.',
      });
      return;
    }

    setCancelLoading(true);

    const bookingIdToCancel = selectedBookingId;

    try {
      const payload = {
        bookingId: bookingIdToCancel,
        cancelReason: cancelReason.trim(),
        status: 'cancelled',
      };

      // Call API to persist cancellation
      await axiosInstance.post(API_ENDPOINTS.CANCEL_BOOKING, payload);

      setShowCancelModal(false);
      setSelectedBookingId(null);
      setCancelReason('');

      // Update local state
      updateBooking(bookingIdToCancel, {
        status: 'cancelled',
        cancelReason: cancelReason.trim(),
        cancelledAt: new Date().toISOString(),
      });

      Swal.fire({
        icon: 'success',
        title: 'Booking Cancelled Successfully',
        text: 'The booking has been marked as cancelled and cannot be edited.',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Cancellation Failed',
        text:
          error.response?.data?.message ||
          error.message ||
          'Failed to cancel booking. Please try again.',
      });
    } finally {
      setCancelLoading(false);
    }
  };
const getUserId = () => {
        const stored = localStorage.getItem("userId") || localStorage.getItem("spendwise_userId");
        const parsed = stored ? Number(stored) : NaN;
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
      };
  const submitRefundBooking = async () => {
    if (
      !refundAmount.trim() ||
      isNaN(refundAmount) ||
      parseFloat(refundAmount) <= 0
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Amount',
        text: 'Please provide a valid refund amount.',
      });
      return;
    }

    setRefundLoading(true);
    try {
      

    

      // Prepare payload for refund request
      const payload = {
        id: 0,
        bookingId: selectedRefundBooking.id,
        refundAmount: parseFloat(refundAmount),
        status: 1, // 1 = Pending/Initiated
        notes: `Refund requested for Booking ID ${selectedRefundBooking.id} - ${selectedRefundBooking.clientName || 'N/A'}`,
        createdBy: currentUserId,
        createdAt: new Date().toISOString()
      };

      // Use only the proper REFUND_SAVE endpoint
      const response = await axiosInstance.post(
        API_ENDPOINTS.REFUND_SAVE,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );

      // Success - Update local state
      updateBooking(selectedRefundBooking.id, {
        refundStatus: 'pending',
        refundAmount: parseFloat(refundAmount),
        refundRequestedAt: new Date().toISOString(),
      });

      setShowRefundModal(false);
      setSelectedRefundBooking(null);
      setRefundAmount('');

      Swal.fire({
        icon: 'success',
        title: 'Refund Requested Successfully',
        html: `
          <div style="text-align: left;">
            <p style="color: #10b981; font-weight: 600;">✅ Refund request has been submitted successfully!</p>
            <br/>
            <div style="background: #f0fdf4; padding: 12px; border-radius: 6px; border: 1px solid #86efac;">
              <p><strong>Details:</strong></p>
              <ul style="margin: 8px 0 0 20px; padding: 0;">
                <li>Booking ID: <strong>${selectedRefundBooking.id}</strong></li>
                <li>Client: <strong>${selectedRefundBooking.clientName || 'N/A'}</strong></li>
                <li>Refund Amount: <strong>₹${parseFloat(refundAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></li>
                <li>Status: <strong>Pending Approval</strong></li>
              </ul>
            </div>
            <br/>
            <p style="color: #666; font-size: 13px;">
              The refund request is now pending approval from the administrator.
            </p>
          </div>
        `,
        timer: 5000,
        showConfirmButton: true,
        confirmButtonText: 'OK',
        confirmButtonColor: '#10b981'
      });

    } catch (error) {
      let errorTitle = 'Refund Request Failed';
      let errorMessage = 'Failed to process refund request.';
      let errorDetails = '';

      if (error.response?.status === 404) {
        errorTitle = 'Backend API Not Available';
        errorMessage = 'The Refund Save endpoint (/Refund/Save) is not implemented on the server.';
        errorDetails = 'Please contact your system administrator to implement the following endpoints:\n• POST /Refund/Save - To create refund requests\n• POST /Refund/SaveStatus - To update refund status';
      } else if (error.response?.status === 403) {
        errorTitle = 'Permission Denied';
        errorMessage = "You don't have permission to process refunds.";
        errorDetails = 'Please contact your administrator to grant you refund processing permissions.';
      } else if (error.response?.status === 400) {
        errorTitle = 'Invalid Request';
        errorMessage = 'Invalid refund request data.';
        errorDetails = error.response?.data?.message || 'Please check the refund amount and try again.';
      } else if (error.response?.status === 500) {
        errorTitle = 'Server Error';
        errorMessage = 'Server error occurred while processing refund.';
        errorDetails = error.response?.data?.message || 'Please try again later or contact support.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Swal.fire({
        icon: 'error',
        title: errorTitle,
        html: `
          <div style="text-align: left;">
            <p><strong>${errorMessage}</strong></p>
            ${errorDetails ? `<p style="margin-top: 10px; color: #666; font-size: 14px;">${errorDetails}</p>` : ''}
            <br/>
            <div style="background: #f5f5f5; padding: 12px; border-radius: 6px; font-size: 12px; color: #666;">
              <strong>Technical Details:</strong><br/>
              <strong>Endpoint:</strong> ${API_ENDPOINTS.REFUND_SAVE}<br/>
              <strong>Error Code:</strong> ${error.response?.status || 'Network Error'}
            </div>
          </div>
        `,
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444',
        width: '550px'
      });
    } finally {
      setRefundLoading(false);
    }
  };

  const submitAddStatus = async () => {
    if (!statusDate.trim() || !statusNote.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please fill in all required fields.',
      });
      return;
    }

    setStatusLoading(true);
    try {
      const response = await axiosInstance.get(
        `${API_ENDPOINTS.GET_BOOKING_BY_ID}?bookingId=${selectedStatusBooking.id}`,
      );
      const bookingData = response.data;

      if (!bookingData) {
        throw new Error('Could not fetch booking details');
      }
      const formData = new FormData();
      formData.append('id', String(bookingData.id));
      formData.append(
        'bookingDate',
        bookingData.bookingDate ||
        bookingData.createdAt ||
        new Date().toISOString(),
      );
      formData.append(
        'townshipId',
        String(bookingData.townshipId || bookingData.TownshipId || ''),
      );
      formData.append(
        'plotNo',
        String(bookingData.plotNo || bookingData.PlotNo || ''),
      );
      formData.append(
        'plotId',
        String(bookingData.plotId || bookingData.PlotId || ''),
      );
      formData.append('plotSize', String(bookingData.plotSize || ''));
      formData.append('clientName', String(bookingData.clientName || ''));
      formData.append(
        'clientContactNo',
        String(
          bookingData.contactNo || bookingData.clientContactNo || '',
        ),
      );
      formData.append(
        'clientEmail',
        String(bookingData.clientEmail || ''),
      );
      formData.append(
        'clientAddress',
        String(bookingData.clientAddress || ''),
      );
      formData.append(
        'associateName',
        String(bookingData.associateName || ''),
      );
      formData.append(
        'associateReraNo',
        String(bookingData.associateReraNo || ''),
      );
      formData.append(
        'associateContactNo',
        String(bookingData.associateContactNo || ''),
      );
      formData.append('LeaderName', String(bookingData.leaderName || ''));
      formData.append(
        'agreementValue',
        String(bookingData.agreementValue || ''),
      );
      const isWorkflow = [
        'WITH_LOAN',
        'WITHOUT_LOAN',
        'WITHOUT_7DAY_CLOSED',
        'AGREEMENT_REGISTRY_PROCESS',
      ].includes(statusType);

      if (isWorkflow) {
        const wfId = workflowCodeToId(statusType);
        formData.append('workflowTypeId', String(wfId));
        formData.append('workflowCode', statusType);
        formData.append('status', statusType);
      } else {
        formData.append(
          'workflowTypeId',
          String(bookingData.workflowTypeId || 2),
        );
        formData.append(
          'workflowCode',
          bookingData.workflowCode || 'WITHOUT_LOAN',
        );
        formData.append('status', statusType);
      }

      await axiosInstance.post(API_ENDPOINTS.BOOKING_SAVE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      updateBooking(selectedStatusBooking.id, {
        lastStatusUpdate: {
          date: statusDate,
          status: statusType,
          note: statusNote.trim(),
          createdAt: new Date().toISOString(),
        },
        status: statusType,
        workflowCode: isWorkflow
          ? statusType
          : bookingData.workflowCode ||
          selectedStatusBooking.workflowCode,
        updatedAt: new Date().toISOString(),
      });

      setShowAddStatusModal(false);
      setSelectedStatusBooking(null);
      setStatusDate('');
      setStatusType('booking_created');
      setStatusNote('');

      Swal.fire({
        icon: 'success',
        title: 'Status Updated',
        text: 'Status has been successfully updated and saved.',
        timer: 3000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Status Update Failed',
        text: error.message || 'Failed to save status to server.',
        confirmButtonText: 'OK',
      });
    } finally {
      setStatusLoading(false);
    }
  };

  const submitChangePlot = async () => {
    if (!selectedPlot) {
      Swal.fire({
        icon: 'warning',
        title: 'Plot Required',
        text: 'Please select a new plot.',
      });
      return;
    }

    if (!newAgreementValue || isNaN(newAgreementValue) || parseFloat(newAgreementValue) <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Agreement Value Required',
        text: 'Please provide a valid agreement value.',
      });
      return;
    }

    setChangePlotLoading(true);

    try {
      const currentUserId = JSON.parse(localStorage.getItem('userId'));

      const payload = {
        bookingId: selectedChangePlotBooking.id,
        newPlotId: parseInt(selectedPlot),
        newAgreementValue: parseFloat(newAgreementValue),
        plotChangedBy: currentUserId,
        plotChangedOn: Math.floor(Date.now() / 1000),
      };

      const response = await axiosInstance.post(
        API_ENDPOINTS.CHANGE_PLOT,
        payload,
      );

      if (response.data === true || response.data?.success === true || response.status === 200) {

        updateBooking(selectedChangePlotBooking.id, {
          plotId: parseInt(selectedPlot),
          plotNumber: selectedPlotDetails?.plotNo,
          agreementValue: parseFloat(newAgreementValue),
          plotChangedAt: new Date().toISOString(),
          plotChangedBy: currentUserId,
          status: 'plot changed',
          updatedAt: new Date().toISOString(),
        });

        setShowChangePlotModal(false);
        setSelectedChangePlotBooking(null);
        setSelectedPlot('');
        setNewAgreementValue('');
        Swal.fire({
          icon: 'success',
          title: 'Plot Changed Successfully',
          timer: 3000,
          showConfirmButton: false,
        });
      } else {
        throw new Error('API returned unsuccessful response');
      }

    } catch (error) {
      let errorMessage = 'Failed to change plot. Please try again.';

      if (error.response?.status === 404) {
        errorMessage = 'ChangePlot API endpoint not found.';
      } else if (error.response?.status === 403) {
        errorMessage = "You don't have permission to change plots.";
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid data provided.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error occurred.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Swal.fire({
        icon: 'error',
        title: 'Change Plot Failed',
        text: errorMessage,
      });

    } finally {
      setChangePlotLoading(false);
    }
  };


  const debugPlotData = async () => {
    try {
      const plotsResponse = await axiosInstance.get(
        API_ENDPOINTS.PLOTS_LIST,
      );
      const allPlots = Array.isArray(plotsResponse.data)
        ? plotsResponse.data
        : plotsResponse.data?.value || [];

      if (allPlots.length > 0) {
        const facing = getPlotFacing(allPlots[0]);

        const townships = [
          ...new Set(
            allPlots.map((p) => p.townshipName || p.township),
          ),
        ];

        townships.forEach((township) => {
          const townshipPlots = allPlots.filter(
            (p) => (p.townshipName || p.township) === township,
          );
          const available = townshipPlots.filter((p) => !p.isBooked);
        });
      }

      if (bookings.length > 0) {
        const firstBooking = bookings[0];
      }
    } catch (error) { }
  };

  const relationOptions = [
    { value: "S/O", label: "S/O" },
    { value: "D/O", label: "D/O" },
    { value: "W/O", label: "W/O" },
    { value: "C/O", label: "C/O" },
  ];

  const [showSendForDraftModal, setShowSendForDraftModal] = useState(false);
  const [selectedDraftBooking, setSelectedDraftBooking] = useState(null);
  const [draftClientInfo, setDraftClientInfo] = useState({
    applicationName: '',
    relationType: '',
    fatherMotherCo: '',
    address: '',
    mobileNo: '',
    aadharCard: '',
    panCard: '',
  });
  const [draftNotes, setDraftNotes] = useState('');
  const [aadharFile, setAadharFile] = useState(null);
  const [previews, setPreviews] = useState({
    aadhar: null,
    pan: null,
  });
  const ALLOWED_FILE_REGEX = /\.(jpg|jpeg|png|pdf)$/i;
  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 5MB

  const [panFile, setPanFile] = useState(null);
  const [sendDraftLoading, setSendDraftLoading] = useState(false);
  const [showSendForAgreementModal, setShowSendForAgreementModal] =
    useState(false);
  const [selectedAgreementBooking, setSelectedAgreementBooking] =
    useState(null);
  const [agreementClientInfo, setAgreementClientInfo] = useState({
    applicationName: '',
    relationType: '',
    fatherMotherCo: '',
    address: '',
    mobileNo: '',
    aadharCard: '',
    panCard: '',
  });
  const [agreementNotes, setAgreementNotes] = useState('');
  const [agreementAadharFile, setAgreementAadharFile] = useState(null);
  const [agreementPanFile, setAgreementPanFile] = useState(null);
  const [sendAgreementLoading, setSendAgreementLoading] = useState(false);
  const [showSendForAllotmentModal, setShowSendForAllotmentModal] =
    useState(false);
  const [selectedAllotmentBooking, setSelectedAllotmentBooking] =
    useState(null);
  const [allotmentClientInfo, setAllotmentClientInfo] = useState({
    applicationName: '',
    relationType: '',
    fatherMotherCo: '',
    address: '',
    mobileNo: '',
    aadharCard: '',
    panCard: '',
  });
  const [allotmentNotes, setAllotmentNotes] = useState('');
  const [allotmentAadharFile, setAllotmentAadharFile] = useState(null);
  const [allotmentPanFile, setAllotmentPanFile] = useState(null);
  const [sendAllotmentLoading, setSendAllotmentLoading] = useState(false);

  // Checkbox states for Send for Draft
  const [draftClientInfoChecked, setDraftClientInfoChecked] = useState(false);
  const [draftDocumentUploadChecked, setDraftDocumentUploadChecked] =
    useState(false);

  // Client info source selection state (existing or new)
  const [clientInfoSource, setClientInfoSource] = useState('existing');
  const [agreementInfoSource, setAgreementInfoSource] = useState('existing');
  const [allotmentInfoSource, setAllotmentInfoSource] = useState('existing');

  // Checkbox states for Send for Agreement
  const [agreementClientInfoChecked, setAgreementClientInfoChecked] =
    useState(false);
  const [agreementDocumentUploadChecked, setAgreementDocumentUploadChecked] =
    useState(false);

  // Checkbox states for Send for Allotment Letter
  const [allotmentClientInfoChecked, setAllotmentClientInfoChecked] =
    useState(false);
  const [allotmentDocumentUploadChecked, setAllotmentDocumentUploadChecked] =
    useState(false);

  const isPdf = (value, docType) => {
    if (!value) return false;

    if (typeof value === "string" && value.startsWith("blob:")) {
      const file =
        docType === "aadhar" ? aadharFile : panFile;

      return file instanceof File && file.type === "application/pdf";
    }

    return typeof value === "string" && value.toLowerCase().endsWith(".pdf");
  };

  const handleFileChange = (type, fileList) => {
    const file = fileList && fileList.length > 0 ? fileList[0] : null;

    if (file && !ALLOWED_FILE_REGEX.test(file.name)) {
      alert("Only JPG, JPEG, PNG or PDF files allowed");
      return;
    }

    if (file && file.size > MAX_FILE_SIZE) {
      alert("File must be less than 5MB");
      return;
    }

    // Update file state
    if (type === "aadhar") setAadharFile(file);
    if (type === "pan") setPanFile(file);

    // Update preview
    setPreviews(prev => {
      const next = { ...prev };

      if (next[type]?.startsWith?.("blob:")) {
        URL.revokeObjectURL(next[type]);
      }

      next[type] = file ? URL.createObjectURL(file) : null;

      return next;
    });
  };


  useEffect(() => {
    return () => {
      Object.values(previews).forEach(url => {
        if (url?.startsWith?.("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);


  const handleSendForDraft = async (bookingId) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;
    setDraftClientInfo({
      applicationName: booking?.clientName || '-',
      relationType: booking?.clientRelation || '-',
      fatherMotherCo: booking?.clientRelativeName || '-',
      address: booking?.clientAddress || '-',
      mobileNo: booking?.clientMobile || '-',
      aadharCard: booking?.aadharCard || '-',
      panCard: booking?.panCard || '-',
    });


    setSelectedDraftBooking(booking);
    setClientInfoSource('existing');
    setDraftNotes('');
    setAadharFile(null);
    setPanFile(null);
    setShowSendForDraftModal(true);
  };

  const uploadDocument = async ({
    bookingId,
    documentTypeId,
    file,
    notes = ''
  }) => {
    if (!bookingId || !documentTypeId || !file) {
      throw new Error('Missing required document upload fields.');
    }

    const formData = new FormData();

    formData.append('BookingId', Number(bookingId));
    formData.append('DocumentTypeId', Number(documentTypeId)); // 1 = Aadhar, 2 = PAN
    formData.append('File', file);
    formData.append('Notes', notes);

    return axiosInstance.post(
      API_ENDPOINTS.UPLOAD_DOCUMENT,
      formData
    );
  };


  // Submit send for draft with client information
  const submitSendForDraft = async () => {

    if (!selectedDraftBooking?.id) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No booking selected.',
      });
      return;
    }

    const currentUser =
      localStorage.getItem('userName') ||
      localStorage.getItem('userName') ||
      'admin';


    const finalClientInfo =
      clientInfoSource === 'existing'
        ? {
          applicationName: selectedDraftBooking.clientName || '',
          relationType: selectedDraftBooking.clientRelation || '',
          fatherMotherCo: selectedDraftBooking.clientRelativeName || '',
          address: selectedDraftBooking.clientAddress || '',
          mobileNo: selectedDraftBooking.clientMobile || '',
          aadharCard: '',
          panCard: '',
        }
        : { ...draftClientInfo };


    if (!finalClientInfo.applicationName?.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Application Name is required.',
      });
      return;
    }

    if (!finalClientInfo.mobileNo?.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Mobile Number is required.',
      });
      return;
    }

    if (!draftNotes?.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Notes are required for draft requests.',
      });
      return;
    }

    if (draftNotes.trim().length < 3) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Notes',
        text: 'Notes must be at least 3 characters long.',
      });
      return;
    }

    setSendDraftLoading(true);

    try {
      const userId =
        localStorage.getItem('spendwise_userId') ||
        localStorage.getItem('userId') ||
        5;

      const payload = {
        userId: Number(userId),
        bookingId: Number(selectedDraftBooking.id),
        notes: draftNotes.trim(),
        isOriginalAgreement: true,
        applicantName: finalClientInfo.applicationName,
        relativeName: finalClientInfo.fatherMotherCo,
        address: finalClientInfo.address,
        contactNo: finalClientInfo.mobileNo,
        relationType: finalClientInfo.relationType,
      };

      await axiosInstance.post(
        API_ENDPOINTS.SEND_TO_DRAFT,
        payload
      );

      if (aadharFile) {
        await uploadDocument({
          bookingId: selectedDraftBooking.id,
          documentTypeId: 1,
          file: aadharFile,
          notes: 'Aadhar document for draft'
        });
      }


      if (panFile) {
        await uploadDocument({
          bookingId: selectedDraftBooking.id,
          documentTypeId: 2,
          file: panFile,
          notes: 'PAN document for draft'
        });
      }

      updateBooking(selectedDraftBooking.id, {
        status: 'sent_for_draft',
        draftStatus: 'sent_for_draft',
        updatedAt: new Date().toISOString(),
        draftNotes: draftNotes.trim(),
        draftRequestedBy: currentUser,
        clientInformation: finalClientInfo,
      });

      setShowSendForDraftModal(false);
      setDraftClientInfoChecked(false);
      setDraftDocumentUploadChecked(false);
      setDraftNotes('');
      setAadharFile(null);
      setPanFile(null);

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `Booking ID ${selectedDraftBooking.id} sent for draft successfully.`,
      });

    } catch (error) {
      let errorMessage =
        'Failed to send booking for draft. Please try again.';

      if (error.response?.status === 400) {
        errorMessage =
          error.response?.data?.message ||
          'Invalid request data. Please check the booking details.';
      } else if (error.response?.status === 401) {
        errorMessage =
          'You are not authorized to perform this action. Please login again.';
      } else if (error.response?.status === 404) {
        errorMessage =
          'Booking not found. Please refresh the page and try again.';
      } else if (error.response?.status === 500) {
        errorMessage =
          'Server error occurred. Please contact support if the issue persists.';
      } else if (error.message === 'Network Error') {
        errorMessage =
          'Network error. Please check your internet connection.';
      }

      Swal.fire({
        icon: 'error',
        title: 'Error',
        html: `
        <div style="text-align: left;">
          <p><strong>Error:</strong> ${errorMessage}</p>
          <p><strong>Booking ID:</strong> ${selectedDraftBooking.id}</p>
          <p><strong>Status Code:</strong> ${error.response?.status || 'N/A'}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
      `,
        confirmButtonColor: '#d33',
        confirmButtonText: 'OK',
      });

    } finally {
      setSendDraftLoading(false);
    }
  };


  // Handler for viewing client information
  const handleViewClientInfo = (booking) => {
    setSelectedClientInfo(booking.clientInformation || {});
    setSelectedBookingForClientInfo(booking);
    setShowClientInfoModal(true);
  };

  const handleOriginalAgreement = async (bookingId) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;
    setAgreementClientInfo({
      applicationName: booking?.clientName || '-',
      relationType: booking?.clientRelation || '-',
      fatherMotherCo: booking?.clientRelativeName || '-',
      address: booking?.clientAddress || '-',
      mobileNo: booking?.clientMobile || '-',
      aadharCard: booking?.aadharCard || '-',
      panCard: booking?.panCard || '-',
    });

    setSelectedAgreementBooking(booking);
    setAgreementInfoSource('existing');
    setAgreementNotes('');
    setAgreementAadharFile(null);
    setAgreementPanFile(null);
    setShowSendForAgreementModal(true);
  };

  // Submit send for agreement with client information
  const submitSendForAgreement = async () => {
    if (!selectedAgreementBooking?.id) {
      Swal.fire({ icon: "error", title: "Error", text: "No booking selected." });
      return;
    }

    if (!agreementClientInfo.applicationName?.trim()) {
      Swal.fire({ icon: "warning", title: "Missing Information", text: "Application Name is required." });
      return;
    }

    if (!agreementClientInfo.mobileNo?.trim()) {
      Swal.fire({ icon: "warning", title: "Missing Information", text: "Mobile Number is required." });
      return;
    }

    if (!agreementNotes?.trim() || agreementNotes.trim().length < 3) {
      Swal.fire({ icon: "warning", title: "Invalid Notes", text: "Notes must be at least 3 characters." });
      return;
    }

    setSendAgreementLoading(true);

    try {
      const userId =
        localStorage.getItem("spendwise_userId") ||
        localStorage.getItem("userId")

      const currentUser =
        localStorage.getItem("userName") ||
        localStorage.getItem("userName")

      const payload = {
        userId: Number(userId),
        bookingId: Number(selectedAgreementBooking.id),
        notes: agreementNotes.trim(),
        isOriginalAgreement: false,
        applicantName: agreementClientInfo.applicationName,
        relativeName: agreementClientInfo.fatherMotherCo,
        address: agreementClientInfo.address,
        contactNo: agreementClientInfo.mobileNo,
        relationType: agreementClientInfo.relationType,
      };

      await axiosInstance.post(API_ENDPOINTS.SEND_TO_DRAFT, payload);

      if (agreementAadharFile) {
        await uploadDocument({
          bookingId: selectedAgreementBooking.id,
          documentTypeId: 1,
          file: agreementAadharFile,
          notes: "Aadhar document for agreement",
        });
      }

      if (agreementPanFile) {
        await uploadDocument({
          bookingId: selectedAgreementBooking.id,
          documentTypeId: 2,
          file: agreementPanFile,
          notes: "PAN document for agreement",
        });
      }

      updateBooking(selectedAgreementBooking.id, {
        status: "agreement_sent",
        draftStatus: "agreement_sent",
        updatedAt: new Date().toISOString(),
        agreementNotes: agreementNotes.trim(),
        agreementRequestedBy: currentUser,
        clientInformation: agreementClientInfo,
      });

      setShowSendForAgreementModal(false);
      setAgreementClientInfoChecked(false);
      setAgreementDocumentUploadChecked(false);
      setAgreementNotes("");
      setAgreementAadharFile(null);
      setAgreementPanFile(null);

      Swal.fire({
        icon: "success",
        title: "Success",
        text: `Booking ${selectedAgreementBooking.id} sent for agreement.`,
      });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to send for agreement";

      Swal.fire({ icon: "error", title: "Error", text: message });
    } finally {
      setSendAgreementLoading(false);
    }
  };


  // Enhanced Handler for Send for Allotment Letter button
  const handleSendAllotmentLetter = async (bookingId) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;
    setAllotmentClientInfo({
      applicationName: booking?.clientName || '-',
      relationType: booking?.clientRelation || '-',
      fatherMotherCo: booking?.clientRelativeName || '-',
      address: booking?.clientAddress || '-',
      mobileNo: booking?.clientMobile || '-',
      aadharCard: booking?.aadharCard || '-',
      panCard: booking?.panCard || '-',
    });

    setSelectedAllotmentBooking(booking);
    setAllotmentInfoSource('existing');
    setAllotmentNotes('');
    setAllotmentAadharFile(null);
    setAllotmentPanFile(null);
    setShowSendForAllotmentModal(true);
  };

  // Submit send for allotment letter with client information
  const submitSendForAllotment = async () => {
    if (!selectedAllotmentBooking?.id) {
      Swal.fire({ icon: "error", title: "Error", text: "No booking selected." });
      return;
    }

    if (!allotmentClientInfo.applicationName?.trim() ||
      !allotmentClientInfo.mobileNo?.trim() ||
      !allotmentNotes?.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Application name, mobile and notes are required.",
      });
      return;
    }

    setSendAllotmentLoading(true);

    try {
      const userId =
        localStorage.getItem("spendwise_userId") ||
        localStorage.getItem("userId");

      const currentUser =
        localStorage.getItem("userName") ||
        localStorage.getItem("userName")

      const payload = {
        userId: Number(userId),
        bookingId: Number(selectedAllotmentBooking.id),
        notes: allotmentNotes.trim(),
        isOriginalAgreement: true,
        applicantName: allotmentClientInfo.applicationName,
        relativeName: allotmentClientInfo.fatherMotherCo,
        address: allotmentClientInfo.address,
        contactNo: allotmentClientInfo.mobileNo,
        relationType: allotmentClientInfo.relationType,
      };

      await axiosInstance.post(API_ENDPOINTS.SEND_FOR_ALLOTMENT_LETTER, payload);

      updateBooking(selectedAllotmentBooking.id, {
        status: "allotment_letter_sent",
        allotmentLetterStatus: "sent_for_allotment_letter",
        updatedAt: new Date().toISOString(),
        allotmentLetterNotes: allotmentNotes.trim(),
        allotmentLetterRequestedBy: currentUser,
        clientInformation: allotmentClientInfo,
      });

      setShowSendForAllotmentModal(false);
      setAllotmentClientInfoChecked(false);
      setAllotmentDocumentUploadChecked(false);

      Swal.fire({
        icon: "success",
        title: "Success",
        text: `Booking ${selectedAllotmentBooking.id} sent for allotment.`,
      });

    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to send for allotment";

      Swal.fire({ icon: "error", title: "Error", text: message });
    } finally {
      setSendAllotmentLoading(false);
    }
  };


const handleAddRemark = async () => {

  if (!remarkText.trim()) {
    Swal.fire({
      icon: "error",
      title: "Remark required",
      text: "Please enter a remark"
    });
    return;
  }

  try {

    const payload = {
      bookingId: selectedBookingId,
      remark: remarkText.trim()
    };

    console.log("Payload sending:", payload);

    const response = await axiosInstance.post(
      API_ENDPOINTS.ADD_REMARK,
      payload
    );

    console.log("API response:", response);

    if (response.status === 200) {

      Swal.fire({
        icon: "success",
        title: "Remark added successfully",
        timer: 1500,
        showConfirmButton: false
      });

      setShowRemarkModal(false);
    }

  } catch (error) {

    console.log("FULL ERROR:", error.response);

    Swal.fire({
      icon: "error",
      title: "Failed",
      text: error.response?.data?.message || "Failed to add remark"
    });

  }
};

  const getBadgeClass = (workflowCode) => {
    return getWorkflowBadgeClass(workflowCode);
  };

  const getDisplayName = (workflowCode) => {
    return getWorkflowDisplayName(workflowCode);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const validBookings = bookings.filter(
    (b) => b && b.id && typeof b === 'object',
  );
  const filteredBookings = validBookings.filter((booking) => {
 
    return true;
  });

  const currentItems = filteredBookings.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

const submitClosureRequest = async () => {
   
    setCancelLoading(true); 
    try {
      const payload = {
        bookingId: selectedBookingId, 
        userId: getUserId()
      };

      // Call API to persist cancellation
      await axiosInstance.post(API_ENDPOINTS.SEND_FOR_CLOSURE, payload);

      setShowClosureConfirmationModal(false);
      setSelectedBookingId(null); 
      Swal.fire({
        icon: 'success',
        title: 'Closure request submitted successfully',
        text: 'The booking has been sent for Closure.',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Closure request Failed',
        text:
          error.response?.data?.message ||
          error.message ||
          'Failed to closure booking. Please try again.',
      });
    } finally {
      setCancelLoading(false);
    }
  };

  const handleResetFilters = async () => {
  // Reset all filter states
  setSearchParams({
    townshipId: '',
    bookingType: '',
    bookingStatus: '',
    reraNo: '',
    plotNo: '',
    fromDate: '',
  });

  setFilterSearch('');
  setFilterTownship('all');
  setFilterAssociation('all');
  setFilterWorkflow('all');
  setFilterDateFrom('');
  setSearchDraft('');
  setAssociateSearchText('');
  setReraSearch('');
  setPlotSearch('');

  // Clear localStorage (IMPORTANT)
  localStorage.removeItem("searchCriteria");

  // Reload default data
  const queryParams = new URLSearchParams();
  queryParams.append('userId', getUserId());

  await loadData(true, queryParams);
};

 const handleSendForFileCheck = async (bookingId) => {

  const confirm = await Swal.fire({
    title: "Send for File Check?",
    html: `
      You are about to send <b>${bookingId}</b>'s files for verification.<br/><br/>
      Do you want to continue?
    `,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes, Send",
    cancelButtonText: "No",
    confirmButtonColor: "#10b981"
  });

  if (!confirm.isConfirmed) return;

  try {

    Swal.fire({
      title: "Sending...",
      text: "Please wait while we process",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // 🔥 FIX: body te bookingId pathao
    const response = await axiosInstance.post(
      API_ENDPOINTS.SEND_FOR_FILE_CHECK,
      {
        bookingId: bookingId
      }
    );

    if (response.status !== 200) {
      throw new Error("Failed to send for file check");
    }

    await Swal.fire({
      icon: "success",
      title: "Sent Successfully",
      text: `Booking ${bookingId} sent for verification`,
      timer: 1500,
      showConfirmButton: false
    });

    

  } catch (error) {

    console.error("File check error:", error);

    await Swal.fire({
      icon: "error",
      title: "Failed",
      text:
        error.response?.data?.message ||
        "Could not send for file check"
    });
  }
};
  return (
    <BookingWrapper className="dashboard-container">
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
              Booking Management
            </h1>
            <p className="dashboard-subtitle">
              Manage and monitor all bookings across the system
            </p>
          </div>
        </div>
        <div className="dashboard-header-actions">
          {

          }
        </div>
      </div>

      {/* Summary Cards - Only for Admin */}
      {/* {hasPermission("CanManageUsers") && (
        <div className="dashboard-container">
          <div className="summary-cards">
            <div className="summary-card">
              <div className="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <div className="card-content">
                <h3>Total Bookings</h3>
                <p className="card-value">{bookings.length}</p>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                  <path d="M9 9h.01"></path>
                  <path d="M15 9h.01"></path>
                </svg>
              </div>
              <div className="card-content">
                <h3>Active Bookings</h3>
                <p className="card-value">{bookings.filter(b => b.status === 'Active').length}</p>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <div className="card-content">
                <h3>Pending Approvals</h3>
                <p className="card-value">{bookings.filter(b => b.status === 'Pending').length}</p>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <div className="card-content">
                <h3>Completed</h3>
                <p className="card-value">{bookings.filter(b => b.status === 'Completed').length}</p>
              </div>
            </div>
          </div>
        </div>
      )} */}

      <div className="card dashboard-filters-card">
        <div className="dashboard-filters">
          {/* Search API Form */}
          <div className="filter-group">
            <label htmlFor="search-township-filter">
              {/* <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg> */}
              Township
            </label>
            <select
              id="search-township-filter"
              className="form-control"
              value={searchParams.townshipId}
              onChange={(e) =>
                setSearchParams((prev) => ({
                  ...prev,
                  townshipId: e.target.value,
                }))
              }
            >
              <option value="">Select Township</option>
              {townships.map((township) => (
                <option key={township.id} value={township.id}>
                  {township.name}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="search-booking-type-filter">
              {/* <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg> */}
              Booking Type
            </label>
            <select
              id="search-booking-type-filter"
              className="form-control"
              value={searchParams.bookingType}
              onChange={(e) =>
                setSearchParams((prev) => ({
                  ...prev,
                  bookingType: e.target.value,
                }))
              }
            >
              <option value="">Select Type</option>
              <option value="1">Loan</option>
              <option value="2">Without Loan</option>
              <option value="3">7 Day Close</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="search-booking-status-filter">
              {/* <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg> */}
              Booking Status
            </label>
            <select
              id="search-booking-status-filter"
              className="form-control"
              value={searchParams.bookingStatus || ''}
              onChange={(e) =>
                setSearchParams((prev) => ({
                  ...prev,
                  bookingStatus: e.target.value,
                }))
              }
            >
              <option value="">All Status</option>

              {statusList.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="search-associate-filter">
              {/* <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg> */}
              RERA No.
            </label>
            <div className="rera-search-wrapper">
              <input
                type="text"
                className="form-control"
                placeholder="Search RERA..."
                value={reraSearch}
                onChange={(e) => {
                  const value = e.target.value;
                  setReraSearch(value);

                  // 🔥 IMPORTANT FIX
                  if (value.trim() === "") {
                    setSearchParams((prev) => ({
                      ...prev,
                      reraNo: ""   
                    }));
                    setShowDropdown(false);
                  } else {
                    setShowDropdown(true);
                  }
                }}
                onFocus={() => {
                  if (reraSearch.trim() !== "") {
                    setShowDropdown(true);
                  }
                }}
                onBlur={() => {
                  setTimeout(() => setShowDropdown(false), 200);
                }}
              />

              {showDropdown && (
                <div className="rera-dropdown-menu">
                  {filteredReraList.length > 0 ? (
                    filteredReraList.map((item) => (
                      <div
                        key={item.id}
                        className="rera-dropdown-item"
                        onClick={() => {
                          setSearchParams((prev) => ({
                            ...prev,
                            reraNo: item.reraNo,
                          }));
                          setReraSearch(item.reraNo);
                          setShowDropdown(false);
                        }}
                      >
                        {item.reraNo}
                      </div>
                    ))
                  ) : debouncedReraSearch &&
                    debouncedReraSearch === reraSearch ? (
                    <div className="rera-dropdown-no-data">
                      No RERA No. Matching {reraSearch}
                    </div>
                  ) : null}

                </div>
              )}
            </div>
          </div>
          <div className="filter-group">
            <label htmlFor="search-plot-no">
              Plot No.
            </label>
            <input
              type="text"
              id="search-plot-no"
              className="form-control"
              placeholder="Plot Number..."
              value={searchParams.plotNo}
              onChange={(e) =>
                setSearchParams((prev) => ({
                  ...prev,
                  plotNo: e.target.value,
                }))
              }
            />
          </div>
          <div className="filter-group">
            <label htmlFor="search-date-from">
              {/* <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="18"
                  rx="2"
                  ry="2"
                ></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg> */}
              From Date
            </label>
            <input
              type="date"
              id="search-date-from"
              className="form-control"
              value={searchParams.fromDate}
              onChange={(e) =>
                setSearchParams((prev) => ({
                  ...prev,
                  fromDate: e.target.value,
                }))
              }
            />
          </div>
          <div className="bookin-list-reset">
            <button
              className="primary-btn"
              type="button"
              onClick={handleSearchAPI}
              disabled={searchLoading}
              style={{
                cursor: searchLoading
                  ? 'not-allowed'
                  : 'pointer',
              }}
            >
              <FaSearch style={{ size: '14px' }} />
              <span>
                {searchLoading ? 'Searching...' : 'Search'}
              </span>
            </button>
            <button
              type="button"
              className="primary-btn"
              onClick={handleResetFilters}
            >
              <FaRedo style={{size: '14px' }} />
              Reset
            </button>
          </div>
        </div>
      </div>
      {error && (
        <div
          className="card"
          style={{
            background: '#ffebee',
            border: '1px solid #f44336',
            padding: '16px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#c62828',
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ width: '24px', height: '24px' }}
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <div>
             
              <div style={{ fontSize: '13px', marginTop: '4px' }}>
                Please check the error details
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="card">
        <div className="dashboard-table-header">
          <h3 className="dashboard-table-title">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            Booking List
            {/* {hasSearched && (
              <span style={{ 
                fontSize: '14px', 
                padding: '4px 8px', 
                backgroundColor: '#21a2a7', 
                color: 'white', 
                borderRadius: '4px',
                marginLeft: '10px'
              }}>
                Search Results
              </span>
            )} */}
          </h3>
          {/* {hasSearched && (
            <div className="dashboard-table-badge" style={{ fontSize: '14px', padding: '4px 12px', background: '#e3f2fd', borderRadius: '4px' }}>
              {validBookings.length} {validBookings.length === 1 ? 'Booking' : 'Bookings'} Found
            </div>
          )} */}
        </div>

        <div className="table-wrapper" >
          <table className="table">
            <thead>
              <tr>
                <th className="left">Booking ID</th>
                <th className="left">Township / Plot</th>
                <th className="left">Client Name / Mobile</th>
                <th className="left">Created Date</th>
                <th className="center">Booking Type</th>
                <th className="center">Status</th>
                <th className="left">Action</th>
              </tr>
            </thead>
            <tbody>
              {!hasSearched ? (
                <tr>
                  <td colSpan={8} className="no-data">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle
                        cx="11"
                        cy="11"
                        r="8"
                      ></circle>
                      <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <p>
                      Click search button to load bookings
                    </p>
                  </td>
                </tr>
              ) : searchLoading ? (
                <tr >
                  <td colSpan={8} className="no-data">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ animation: 'spin 1s linear infinite' }}
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        strokeDasharray="60"
                        strokeDashoffset="20"
                      ></circle>
                    </svg>
                    <p>Searching bookings...</p>
                  </td>
                </tr>
              ) : (
                <>
                  {currentItems
                    .filter(
                      (b) =>
                        b &&
                        b.id &&
                        b.status &&
                        typeof b === 'object',
                    )
                    .map((b) => (
                      <tr
                        style={{ color: b.progressColor }}
                        key={`booking-${b.id}`}
                        className={
                          b._justUpdated
                            ? 'booking-row-updated'
                            : ''
                        }
                      >
                        <td
                          className="booking-id"
                          valign="top"
                        >
                          <span onClick={() => navigate(`/booking-summery-report/${b.id}`)}  style={{
                              cursor: "pointer",
                              color: "#2563eb",
                              fontWeight: "600",
                              textDecoration: "underline"
                            }}>{b.id}</span>
                        </td>
                        <td className="property-info">
                          <div className="property-name">
                            {b.township || 'N/A'}
                          </div>
                          <div className="property-details">
                            Plot {b.plotNumber || 'N/A'} •
                            {b.plotSize && b.plotSize !== 'N/A'
                              ? (String(b.plotSize).toLowerCase().includes('sq')
                                ? b.plotSize
                                : `${b.plotSize} SqYrds`)
                              : 'N/A'}
                            {b.plotFacing && (
                              <span> • {b.plotFacing} Facing</span>
                            )}
                          </div>
                        </td>
                        <td className="client-mobile"  >
                          {b.clientName && (
                            <div className='property-name'>
                              {b.clientName}
                            </div>
                          )}
                          <div className='property-details'>
                            {b.clientMobile || '-'}
                          </div>
                        </td>
                        <td className="created-date">
                          {formatDisplayDate(b.createdAt)}
                        </td>
                        <td className="status center" style={{ color: b.progressColor }}>
                          {(() => {
                            if (
                              !b ||
                              typeof b !==
                              'object'
                            ) {
                              return (
                                <span
                                  style={{
                                    color: '#999',
                                    fontSize:
                                      '12px',
                                  }}
                                >
                                  Unknown
                                </span>
                              );
                            }

                            const workflowCode =
                              b.workflowCode ||
                              '';
                            const status =
                              b.status || '';

                            // Show workflow types first
                            if (
                              workflowCode &&
                              [
                                'WITH_LOAN',
                                'WITHOUT_LOAN',
                                'WITHOUT_7DAY_CLOSED',
                              ].includes(
                                workflowCode,
                              )
                            ) {
                              return (
                                <span
                                  className={getBadgeClass(
                                    workflowCode,
                                  )}
                                >
                                  {getDisplayName(
                                    workflowCode,
                                  )}
                                </span>
                              );
                            }

                            // Show other status values like plot_changed, payment_pending, etc.
                            if (
                              status &&
                              status !==
                              'booking_created'
                            ) {
                              return (
                                <span
                                  className={getBadgeClass(
                                    status,
                                  )}
                                >
                                  {getDisplayName(
                                    status,
                                  )}
                                </span>
                              );
                            }

                            // Default for booking_created or no status
                            return (
                              <span
                                style={{
                                  color: '#999',
                                  fontSize:
                                    '12px',
                                }}
                              >
                                Initiated
                              </span>
                            );
                          })()}
                        </td>
                        <td className="booking-status">
                          {(() => {
                            // Display the actual booking status from your data
                            const bookingStatus =
                              b.status ||
                              'Active';

                            // Style based on status - removed background colors
                            let statusStyle = {
                              padding: '4px 8px',
                              borderRadius: '0px',
                              fontSize: '12px',
                              fontWeight: '600',
                              textTransform:
                                'capitalize',
                            };

                            if (
                              bookingStatus ===
                              'Active'
                            ) {
                              statusStyle = {
                                ...statusStyle,
                                color: '#155724',
                              };
                            } else if (
                              bookingStatus ===
                              'Cancelled'
                            ) {
                              statusStyle = {
                                ...statusStyle,
                                color: '#721c24',
                              };
                            } else if (
                              bookingStatus.includes(
                                'Draft Prepared',
                              )
                            ) {
                              statusStyle = {
                                ...statusStyle,
                                color: '#856404',
                              };
                            } else {
                              statusStyle = {
                                ...statusStyle,
                                color: '#383d41',
                              };
                            }

                            return (
                              <span
                                style={
                                  statusStyle
                                }
                              >
                                {bookingStatus}
                              </span>
                            );
                          })()}
                        </td>{' '}
                        <td>
                          <div
                            style={{
                              display: 'flex',
                              alignItems:
                                'center',
                              justifyContent:
                                'center',
                              gap: '5px',
                            }}
                          >
                            {/* Document Actions Menu */}

                            {
                              <div
                                className="booking-menu-container"
                                style={{
                                  position:
                                    'relative',
                                  display:
                                    'inline-block',
                                }}
                              >
                                <button
                                  className="primary-btn"
                                  onClick={(
                                    e,
                                  ) => {
                                    e.stopPropagation();
                                    toggleMenu(
                                      b.id,
                                      e.currentTarget,
                                    );
                                  }}

                                >
                                  <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    style={{
                                      width: '16px',
                                      height: '16px',
                                    }}
                                  >
                                    <line
                                      x1="3"
                                      y1="12"
                                      x2="21"
                                      y2="12"
                                    ></line>
                                    <line
                                      x1="3"
                                      y1="6"
                                      x2="21"
                                      y2="6"
                                    ></line>
                                    <line
                                      x1="3"
                                      y1="18"
                                      x2="21"
                                      y2="18"
                                    ></line>
                                  </svg>
                                </button>

                                {openMenuId ===
                                  b.id && (
                                    <div
                                      ref={dropdownRef}
                                      className="booking-dropdown-menu"
                                      style={{
                                        position:
                                          'absolute',
                                        ...dropdownPosition,
                                        right: '0',
                                        backgroundColor:
                                          'white',
                                        border: '1px solid #ddd',
                                        borderRadius:
                                          '8px',
                                        boxShadow:
                                          '0 4px 12px rgba(0,0,0,0.15)',
                                        zIndex: 100,
                                        minWidth:
                                          '200px',
                                        padding:
                                          '8px 0',
                                      }}
                                    >
                                      {isApplicable(b.statusId, b.workflowTypeId, 1) && shouldShowMenuItem( 'CanViewFileProgress', ) && (
                                          <button className="dropdown-item"
                                            onClick={() => {
                                              navigate( `/property/summary/${b.id}`,);
                                              setOpenMenuId( null,);
                                            }}
                                            style={{  width: '100%',padding:'10px 16px', border: 'none', background: 'none', textAlign: 'left',
                                              cursor: 'pointer',fontSize:                                                '13px',
                                              display:'flex',
                                              alignItems:'center',
                                              gap: '8px',color: '#333',
                                              transition: 'background-color 0.2s',
                                            }}
                                            onMouseOver={(  e, ) =>
                                            (e.target.style.backgroundColor = '#f5f5f5')
                                            }
                                            onMouseOut={(
                                              e,
                                            ) =>
                                            (e.target.style.backgroundColor =
                                              'transparent')
                                            }
                                          >
                                            <svg
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth="2"
                                              style={{
                                                width: '16px',
                                                height: '16px',
                                                color: '#ff9800',
                                              }}
                                            >
                                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                              <polyline points="14,2 14,8 20,8"></polyline>
                                              <line  x1="16" y1="13"  x2="8" y2="13" ></line>
                                              <line x1="16"  y1="17" x2="8"  y2="17"></line>
                                            </svg>
                                            View File Progress
                                          </button>
                                        )}

                                      {isApplicable(b.statusId, b.workflowTypeId, 2) && shouldShowMenuItem( 'CanUpdateJDAFile',
                                      ) &&  (
                                          <button
                                            className="dropdown-item"
                                            onClick={() => {
                                              navigate(
                                                `/property/jda-patta/${b.id}`,
                                              );
                                              setOpenMenuId(
                                                null,
                                              );
                                            }}
                                            style={{
                                              width: '100%',
                                              padding:
                                                '10px 16px',
                                              border: 'none',
                                              background:
                                                'none',
                                              textAlign:
                                                'left',
                                              cursor: 'pointer',
                                              fontSize:
                                                '13px',
                                              display:
                                                'flex',
                                              alignItems:
                                                'center',
                                              gap: '8px',
                                              color: '#333',
                                              transition:
                                                'background-color 0.2s',
                                            }}
                                            onMouseOver={(
                                              e,
                                            ) =>
                                            (e.target.style.backgroundColor =
                                              '#f5f5f5')
                                            }
                                            onMouseOut={(
                                              e,
                                            ) =>
                                            (e.target.style.backgroundColor =
                                              'transparent')
                                            }
                                          >
                                            <svg
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth="2"
                                              style={{
                                                width: '16px',
                                                height: '16px',
                                                color: '#ff9800',
                                              }}
                                            >
                                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                              <polyline points="14,2 14,8 20,8"></polyline>
                                             <line  x1="16" y1="13"  x2="8" y2="13" ></line>
                                              <line x1="16"  y1="17" x2="8"  y2="17"></line>
                                            </svg>
                                            JDA Patta Update
                                          </button>
                                        )}
                                      {isApplicable(b.statusId, b.workflowTypeId, 3) && shouldShowMenuItem( 'CanCreateDraft') &&  (
                                          <button  className="dropdown-item"
                                            onClick={() => {  handleSendForDraft(
                                                b.id, );
                                              setOpenMenuId( null,
                                              );
                                            }}
                                            style={{
                                              width: '100%',
                                              padding:
                                                '10px 16px',
                                              border: 'none',
                                              background:
                                                'none',
                                              textAlign:
                                                'left',
                                              cursor: 'pointer',
                                              fontSize:
                                                '13px',
                                              display:
                                                'flex',
                                              alignItems:
                                                'center',
                                              gap: '8px',
                                              color: '#333',
                                              transition:
                                                'background-color 0.2s',
                                            }}
                                            onMouseOver={(
                                              e,
                                            ) =>
                                            (e.target.style.backgroundColor =
                                              '#f5f5f5')
                                            }
                                            onMouseOut={(
                                              e,
                                            ) =>
                                            (e.target.style.backgroundColor =
                                              'transparent')
                                            }
                                          >
                                            <svg
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth="2"
                                              style={{
                                                width: '16px',
                                                height: '16px',
                                                color: '#ff9800',
                                              }}
                                            >
                                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                              <polyline points="14,2 14,8 20,8"></polyline>
                                             <line  x1="16" y1="13"  x2="8" y2="13" ></line>
                                             <line x1="16"  y1="17" x2="8"  y2="17"></line>
                                            </svg>
                                            Send for Draft
                                          </button>
                                        )}

                                      {isApplicable(b.statusId, b.workflowTypeId, 4) && shouldShowMenuItem(
                                        'CanReceivePayment',
                                      ) &&  (
                                          <button className="dropdown-item"
                                            onClick={() => {
                                              navigate(
                                                `/property/receipt-payment-update/${b.id}`,
                                              );
                                              setOpenMenuId(
                                                null,
                                              );
                                            }}
                                            style={{
                                              width: '100%',
                                              padding:
                                                '10px 16px',
                                              border: 'none',
                                              background:
                                                'none',
                                              textAlign:
                                                'left',
                                              cursor: 'pointer',
                                              fontSize:
                                                '13px',
                                              display:
                                                'flex',
                                              alignItems:
                                                'center',
                                              gap: '8px',
                                              color: '#333',
                                              transition:
                                                'background-color 0.2s',
                                            }}
                                            onMouseOver={(
                                              e,
                                            ) =>
                                            (e.target.style.backgroundColor =
                                              '#f5f5f5')
                                            }
                                            onMouseOut={(
                                              e,
                                            ) =>
                                            (e.target.style.backgroundColor =
                                              'transparent')
                                            }
                                          >
                                            <svg
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth="2"
                                              style={{
                                                width: '16px',
                                                height: '16px',
                                                color: '#ff9800',
                                              }}
                                            >
                                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                              <polyline points="14,2 14,8 20,8"></polyline>
                                             <line  x1="16" y1="13"  x2="8" y2="13" ></line>
                                              <line x1="16"  y1="17" x2="8"  y2="17"></line>
                                            </svg>
                                            Receipt Payment Update
                                          </button>
                                        )}

                                      {isApplicable(b.statusId, b.workflowTypeId, 5) && shouldShowMenuItem("") &&  (
                                        <button
                                          className="dropdown-item"
                                          onClick={() => {
                                            handleOriginalAgreement(
                                              b.id,
                                            );
                                            setOpenMenuId(
                                              null,
                                            );
                                          }}
                                          style={{
                                            width: '100%',
                                            padding:
                                              '10px 16px',
                                            border: 'none',
                                            background:
                                              'none',
                                            textAlign:
                                              'left',
                                            cursor: 'pointer',
                                            fontSize:
                                              '13px',
                                            display:
                                              'flex',
                                            alignItems:
                                              'center',
                                            gap: '8px',
                                            color: '#333',
                                            transition:
                                              'background-color 0.2s',
                                          }}
                                          onMouseOver={(
                                            e,
                                          ) =>
                                          (e.target.style.backgroundColor =
                                            '#f5f5f5')
                                          }
                                          onMouseOut={(
                                            e,
                                          ) =>
                                          (e.target.style.backgroundColor =
                                            'transparent')
                                          }
                                        >
                                          <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            style={{
                                              width: '16px',
                                              height: '16px',
                                              color: '#4caf50',
                                            }}
                                          >
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                            <polyline points="14,2 14,8 20,8"></polyline>
                                            <path d="M16 13l-4-4-4 4"></path>
                                            <path d="M12 17V9"></path>
                                          </svg>
                                          Send for Agreement
                                        </button>
                                      )}

                                      {isApplicable(b.statusId, b.workflowTypeId,6) && shouldShowMenuItem(
                                        'CanViewAllotmentLetterRequests',
                                      ) &&  (
                                          <button
                                            className="dropdown-item"
                                            onClick={() => {
                                              handleSendAllotmentLetter(
                                                b.id,
                                              );
                                              setOpenMenuId(
                                                null,
                                              );
                                            }}
                                            style={{
                                              width: '100%',
                                              padding:
                                                '10px 16px',
                                              border: 'none',
                                              background:
                                                'none',
                                              textAlign:
                                                'left',
                                              cursor: 'pointer',
                                              fontSize:
                                                '13px',
                                              display:
                                                'flex',
                                              alignItems:
                                                'center',
                                              gap: '8px',
                                              color: '#333',
                                              transition:
                                                'background-color 0.2s',
                                            }}
                                            onMouseOver={(
                                              e,
                                            ) =>
                                            (e.target.style.backgroundColor =
                                              '#f5f5f5')
                                            }
                                            onMouseOut={(
                                              e,
                                            ) =>
                                            (e.target.style.backgroundColor =
                                              'transparent')
                                            }
                                          >
                                            <svg
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth="2"
                                              style={{
                                                width: '16px',
                                                height: '16px',
                                                color: '#3f51b5',
                                              }}
                                            >
                                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                              <polyline points="14,2 14,8 20,8"></polyline>
                                                <line  x1="16" y1="13"  x2="8" y2="13" ></line>
                                             <line x1="16"  y1="17" x2="8"  y2="17"></line>
                                              <polyline points="10 9 9 9 8 9"></polyline>
                                            </svg>
                                            Send  for Allotment Letter
                                          </button>
                                        )}

                                        {isApplicable(b.statusId, b.workflowTypeId,7) && shouldShowMenuItem("CanUpdateFileLoginStatus") && (
                                        <button
                                          className="dropdown-item"
                                          onClick={() => {
                                            navigate(
                                              `/property/login-status/${b.id}`,
                                            );
                                            setOpenMenuId(
                                              null,
                                            );
                                          }}
                                          style={{
                                            width: '100%',
                                            padding:
                                              '10px 16px',
                                            border: 'none',
                                            background:
                                              'none',
                                            textAlign:
                                              'left',
                                            cursor: 'pointer',
                                            fontSize:
                                              '13px',
                                            display:
                                              'flex',
                                            alignItems:
                                              'center',
                                            gap: '8px',
                                            color: '#333',
                                            transition:
                                              'background-color 0.2s',
                                          }}
                                          onMouseOver={(
                                            e,
                                          ) =>
                                          (e.target.style.backgroundColor =
                                            '#f5f5f5')
                                          }
                                          onMouseOut={(
                                            e,
                                          ) =>
                                          (e.target.style.backgroundColor =
                                            'transparent')
                                          }
                                        >
                                          <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            style={{
                                              width: '16px',
                                              height: '16px',
                                              color: '#ff5722',
                                            }}
                                          >
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                            <polyline points="14,2 14,8 20,8"></polyline>
                                            <path d="M16 13l-4-4-4 4"></path>
                                            <path d="M12 17V9"></path>
                                          </svg>
                                          Update Login Status
                                        </button>
                                      )}

                                       {isApplicable(b.statusId, b.workflowTypeId,8) && shouldShowMenuItem("CanUpdateFileLoginStatus") && (
                                        <button
                                          className="dropdown-item"
                                          onClick={() => {
                                            navigate(
                                              `/property/ocr-status/${b.id}`,
                                            );
                                            setOpenMenuId(
                                              null,
                                            );
                                          }}
                                          style={{
                                            width: '100%', padding: '10px 16px',
                                            border: 'none',background: 'none',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            display: 'flex',
                                            alignItems:  'center',
                                            gap: '8px',
                                            color: '#333',
                                            transition: 'background-color 0.2s',
                                          }}
                                          onMouseOver={(
                                            e,
                                          ) =>
                                          (e.target.style.backgroundColor =
                                            '#f5f5f5')
                                          }
                                          onMouseOut={(
                                            e,
                                          ) =>
                                          (e.target.style.backgroundColor =
                                            'transparent')
                                          }
                                        >
                                          <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            style={{
                                              width: '16px',
                                              height: '16px',
                                              color: '#ff5722',
                                            }}
                                          >
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                            <polyline points="14,2 14,8 20,8"></polyline>
                                            <path d="M16 13l-4-4-4 4"></path>
                                            <path d="M12 17V9"></path>
                                          </svg>
                                          Update OCR Clearance Status
                                        </button>
                                      )}

                                      {isApplicable(b.statusId, b.workflowTypeId,9) && shouldShowMenuItem("") &&  (
                                        <button
                                          className="dropdown-item"
                                          onClick={() => {
                                            navigate(
                                              `/property/bank-dd/${b.id}`,
                                            );
                                            setOpenMenuId(
                                              null,
                                            );
                                          }}
                                          style={{
                                            width: '100%',
                                            padding:
                                              '10px 16px',
                                            border: 'none',
                                            background:
                                              'none',
                                            textAlign:
                                              'left',
                                            cursor: 'pointer',
                                            fontSize:
                                              '13px',
                                            display:
                                              'flex',
                                            alignItems:
                                              'center',
                                            gap: '8px',
                                            color: '#333',
                                            transition:
                                              'background-color 0.2s',
                                          }}
                                          onMouseOver={(
                                            e,
                                          ) =>
                                          (e.target.style.backgroundColor =
                                            '#f5f5f5')
                                          }
                                          onMouseOut={(
                                            e,
                                          ) =>
                                          (e.target.style.backgroundColor =
                                            'transparent')
                                          }
                                        >
                                          <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            style={{
                                              width: '16px',
                                              height: '16px',
                                              color: '#9c27b0',
                                            }}
                                          >
                                            <rect
                                              x="3"
                                              y="3"
                                              width="18"
                                              height="18"
                                              rx="2"
                                              ry="2"
                                            ></rect>
                                            <circle
                                              cx="8.5"
                                              cy="8.5"
                                              r="1.5"
                                            ></circle>
                                            <polyline points="21 15 16 10 5 21"></polyline>
                                          </svg>
                                          Upload Bank  DD
                                        </button>
                                      )}

                                      {isApplicable(b.statusId, b.workflowTypeId,10) && shouldShowMenuItem("") &&  (
                                        <button
                                          className="dropdown-item"
                                          onClick={() => {
                                            navigate(
                                              `/property/dd-update/${b.id}`,
                                            );
                                            setOpenMenuId(
                                              null,
                                            );
                                          }}
                                          style={{
                                            width: '100%',
                                            padding:
                                              '10px 16px',
                                            border: 'none',
                                            background:
                                              'none',
                                            textAlign:
                                              'left',
                                            cursor: 'pointer',
                                            fontSize:
                                              '13px',
                                            display:
                                              'flex',
                                            alignItems:
                                              'center',
                                            gap: '8px',
                                            color: '#333',
                                            transition:
                                              'background-color 0.2s',
                                          }}
                                          onMouseOver={(
                                            e,
                                          ) =>
                                          (e.target.style.backgroundColor =
                                            '#f5f5f5')
                                          }
                                          onMouseOut={(
                                            e,
                                          ) =>
                                          (e.target.style.backgroundColor =
                                            'transparent')
                                          }
                                        >
                                          <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            style={{
                                              width: '16px',
                                              height: '16px',
                                              color: '#e91e63',
                                            }}
                                          >
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                          </svg>
                                          Bank DD Update
                                        </button>
                                      )}

                                      {isApplicable(b.statusId, b.workflowTypeId,11) && shouldShowMenuItem("CanUpdateDokitSigningStatus") && (
                                        <button
                                          className="dropdown-item"
                                          onClick={() => {
                                            navigate(
                                              `/property/dokit-signing/${b.id}`,
                                            );
                                            setOpenMenuId(
                                              null,
                                            );
                                          }}
                                          style={{
                                            width: '100%',
                                            padding:
                                              '10px 16px',
                                            border: 'none',
                                            background:
                                              'none',
                                            textAlign:
                                              'left',
                                            cursor: 'pointer',
                                            fontSize:
                                              '13px',
                                            display:
                                              'flex',
                                            alignItems:
                                              'center',
                                            gap: '8px',
                                            color: '#333',
                                            transition:
                                              'background-color 0.2s',
                                          }}
                                          onMouseOver={(
                                            e,
                                          ) =>
                                          (e.target.style.backgroundColor =
                                            '#f5f5f5')
                                          }
                                          onMouseOut={(
                                            e,
                                          ) =>
                                          (e.target.style.backgroundColor =
                                            'transparent')
                                          }
                                        >
                                          <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            style={{
                                              width: '16px',
                                              height: '16px',
                                              color: '#ff5722',
                                            }}
                                          >
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                            <polyline points="14,2 14,8 20,8"></polyline>
                                            <path d="M16 13l-4-4-4 4"></path>
                                            <path d="M12 17V9"></path>
                                          </svg>
                                          Update Dokit Signing Status
                                        </button>
                                      )}

                                      {isApplicable(b.statusId, b.workflowTypeId,12) && shouldShowMenuItem("CanUploadLoanDocuments") && (
                                        <button
                                          className="dropdown-item"
                                          onClick={() => {
                                            navigate(
                                              `/property/loan-document/${b.id}`,
                                            );
                                            setOpenMenuId(
                                              null,
                                            );
                                          }}
                                          style={{
                                            width: '100%',
                                            padding:
                                              '10px 16px',
                                            border: 'none',
                                            background:
                                              'none',
                                            textAlign:
                                              'left',
                                            cursor: 'pointer',
                                            fontSize:
                                              '13px',
                                            display:
                                              'flex',
                                            alignItems:
                                              'center',
                                            gap: '8px',
                                            color: '#333',
                                            transition:
                                              'background-color 0.2s',
                                          }}
                                          onMouseOver={(
                                            e,
                                          ) =>
                                          (e.target.style.backgroundColor =
                                            '#f5f5f5')
                                          }
                                          onMouseOut={(
                                            e,
                                          ) =>
                                          (e.target.style.backgroundColor =
                                            'transparent')
                                          }
                                        >
                                          <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            style={{
                                              width: '16px',
                                              height: '16px',
                                              color: '#607d8b',
                                            }}
                                          >
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                            <polyline points="14,2 14,8 20,8"></polyline>
                                            <line
                                              x1="16"
                                              y1="13"
                                              x2="8"
                                              y2="13"
                                            ></line>
                                            <line
                                              x1="16"
                                              y1="17"
                                              x2="8"
                                              y2="17"
                                            ></line>
                                            <path d="M21 15l-3-3 3-3"></path>
                                          </svg>
                                          Upload Document
                                        </button>
                                      )}

                                      {isApplicable(b.statusId, b.workflowTypeId,13) && shouldShowMenuItem("CanUpdateLoanSanctionStatus") && (
                                        <button
                                          className="dropdown-item"
                                          onClick={() => {
                                            navigate(
                                              `/property/loan-sanction/${b.id}`,
                                            );
                                            setOpenMenuId(
                                              null,
                                            );
                                          }}
                                          style={{
                                            width: '100%',
                                            padding:
                                              '10px 16px',
                                            border: 'none',
                                            background:
                                              'none',
                                            textAlign:
                                              'left',
                                            cursor: 'pointer',
                                            fontSize:
                                              '13px',
                                            display:
                                              'flex',
                                            alignItems:
                                              'center',
                                            gap: '8px',
                                            color: '#333',
                                            transition:
                                              'background-color 0.2s',
                                          }}
                                          onMouseOver={(
                                            e,
                                          ) =>
                                          (e.target.style.backgroundColor =
                                            '#f5f5f5')
                                          }
                                          onMouseOut={(
                                            e,
                                          ) =>
                                          (e.target.style.backgroundColor =
                                            'transparent')
                                          }
                                        >
                                          <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            style={{
                                              width: '16px',
                                              height: '16px',
                                              color: '#795548',
                                            }}
                                          >
                                            <path d="M9 12l2 2 4-4"></path>
                                            <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
                                            <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
                                            <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"></path>
                                            <path d="M12 21c0-1-1-3-3-3s-3 2-3 3 1 3 3 3 3-2 3-3"></path>
                                          </svg>
                                          Update Loan  Sanction  Status
                                        </button>
                                      )}

                                      {isApplicable(b.statusId, b.workflowTypeId,14) && hasPermission('CanEditBooking')
                                        &&  (
                                          <button
                                            className="dropdown-item"
                                            
                                            onClick={() => {
                                              navigate(
                                                `/property/edit/${b.id}`,
                                              );
                                              setOpenMenuId(
                                                null,
                                              );
                                              console.log("Edit clicked", b.id);
                                            }}
                                            style={{
                                              width: '100%',
                                              padding:
                                                '10px 16px',
                                              border: 'none',
                                              background:
                                                'none',
                                              textAlign:
                                                'left',
                                              cursor: 'pointer',
                                              fontSize:
                                                '13px',
                                              display:
                                                'flex',
                                              alignItems:
                                                'center',
                                              gap: '8px',
                                              color: '#333',
                                              transition:
                                                'background-color 0.2s',
                                            }}
                                            onMouseOver={(
                                              e,
                                            ) =>
                                            (e.target.style.backgroundColor =
                                              '#f5f5f5')
                                            }
                                            onMouseOut={(
                                              e,
                                            ) =>
                                            (e.target.style.backgroundColor =
                                              'transparent')
                                            }
                                          >
                                            <svg
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth="2"
                                              style={{
                                                width: '16px',
                                                height: '16px',
                                                color: '#795548',
                                              }}
                                            >
                                              <path d="M9 12l2 2 4-4"></path>
                                              <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
                                              <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
                                              <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"></path>
                                              <path d="M12 21c0-1-1-3-3-3s-3 2-3 3 1 3 3 3 3-2 3-3"></path>
                                            </svg>
                                            Edit Booking
                                          </button>
                                        )}

                                      {isApplicable(b.statusId, b.workflowTypeId,15) && hasPermission(
                                        'CanChangePlot',
                                      ) &&  (
                                          <button
                                            className="dropdown-item"
                                            onClick={() => {
                                              handleChangePlot(
                                                b,
                                              );
                                              setOpenMenuId(
                                                null,
                                              );
                                            }}
                                            style={{
                                              width: '100%',
                                              padding:
                                                '10px 16px',
                                              border: 'none',
                                              background:
                                                'none',
                                              textAlign:
                                                'left',
                                              cursor: 'pointer',
                                              fontSize:
                                                '13px',
                                              display:
                                                'flex',
                                              alignItems:
                                                'center',
                                              gap: '8px',
                                              color: '#333',
                                              transition:
                                                'background-color 0.2s',
                                            }}
                                            onMouseOver={(
                                              e,
                                            ) =>
                                            (e.target.style.backgroundColor =
                                              '#f5f5f5')
                                            }
                                            onMouseOut={(
                                              e,
                                            ) =>
                                            (e.target.style.backgroundColor =
                                              'transparent')
                                            }
                                          >
                                            <svg
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth="2"
                                              style={{
                                                width: '16px',
                                                height: '16px',
                                                color: '#795548',
                                              }}
                                            >
                                              <path d="M9 12l2 2 4-4"></path>
                                              <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
                                              <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
                                              <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"></path>
                                              <path d="M12 21c0-1-1-3-3-3s-3 2-3 3 1 3 3 3 3-2 3-3"></path>
                                            </svg>
                                            Change Plot
                                          </button>
                                        )}

                                      {/* {isApplicable(b.statusId, b.workflowTypeId,16) && hasPermission('CanViewPaymentHistory') && (
                                        <button
                                          className="dropdown-item"
                                          onClick={() => {
                                            navigate(
                                              `/property/payment-history/${b.id}`,
                                            );
                                            setOpenMenuId(
                                              null,
                                            );
                                          }}
                                          style={{
                                            width: '100%',
                                            padding:
                                              '10px 16px',
                                            border: 'none',
                                            background:
                                              'none',
                                            textAlign:
                                              'left',
                                            cursor: 'pointer',
                                            fontSize:
                                              '13px',
                                            display:
                                              'flex',
                                            alignItems:
                                              'center',
                                            gap: '8px',
                                            color: '#333',
                                            transition:
                                              'background-color 0.2s',
                                          }}
                                          onMouseOver={(
                                            e,
                                          ) =>
                                          (e.target.style.backgroundColor =
                                            '#f5f5f5')
                                          }
                                          onMouseOut={(
                                            e,
                                          ) =>
                                          (e.target.style.backgroundColor =
                                            'transparent')
                                          }
                                        >
                                          <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            style={{
                                              width: '16px',
                                              height: '16px',
                                              color: '#795548',
                                            }}
                                          >
                                            <path d="M9 12l2 2 4-4"></path>
                                            <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
                                            <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
                                            <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"></path>
                                            <path d="M12 21c0-1-1-3-3-3s-3 2-3 3 1 3 3 3 3-2 3-3"></path>
                                          </svg>
                                          View Payment History
                                        </button>
                                      )} */}

                                      {isApplicable(b.statusId, b.workflowTypeId,17) && hasPermission(
                                        'CanMarkFileCompleted',
                                      ) &&  (
                                          <button
                                            className="dropdown-item"
                                            
                                            onClick={() => handleSendForFileCheck(b.id)}
                                          >
                                            <svg
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth="2"
                                              style={{
                                                width: '16px',
                                                height: '16px',
                                                color: '#10b981',
                                              }}
                                            >
                                              <path d="M9 12l2 2 4-4"></path>
                                              <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
                                              <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
                                              <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"></path>
                                              <path d="M12 21c0-1-1-3-3-3s-3 2-3 3 1 3 3 3 3-2 3-3"></path>
                                            </svg>
                                            Send For File Check
                                          </button>
                                        )}

                                      {/* {isApplicable(b.statusId, b.workflowTypeId,18) && hasPermission(
                                        'CanManageRefunds',
                                      ) && b.status !== 'active' && (
                                          <button
                                            className="dropdown-item"
                                            onClick={() => {
                                              handleRefundBooking(
                                                b,
                                              );
                                              setOpenMenuId(
                                                null,
                                              );
                                            }}
                                            style={{
                                              width: '100%',
                                              padding:
                                                '10px 16px',
                                              border: 'none',
                                              background:
                                                'none',
                                              textAlign:
                                                'left',
                                              cursor: 'pointer',
                                              fontSize:
                                                '13px',
                                              display:
                                                'flex',
                                              alignItems:
                                                'center',
                                              gap: '8px',
                                              color: '#333',
                                              transition:
                                                'background-color 0.2s',
                                            }}
                                            onMouseOver={(
                                              e,
                                            ) =>
                                            (e.target.style.backgroundColor =
                                              '#f5f5f5')
                                            }
                                            onMouseOut={(
                                              e,
                                            ) =>
                                            (e.target.style.backgroundColor =
                                              'transparent')
                                            }
                                          >
                                            <svg
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth="2"
                                              style={{
                                                width: '16px',
                                                height: '16px',
                                                color: '#f59e0b',
                                              }}
                                            >
                                              <path d="M3 6h18l-2 13H5L3 6z"></path>
                                              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                              <path d="M10 11v6"></path>
                                              <path d="M14 11v6"></path>
                                            </svg>
                                            Manage Refunds
                                          </button>
                                        )} */}

                                      <button
                                        className="dropdown-item"
                                        onClick={() => {
                                          navigate(
                                            `/property/follow-up/${b.id}`,
                                          );
                                          setOpenMenuId(
                                            null,
                                          );
                                        }}
                                        style={{
                                          width: '100%',
                                          padding:
                                            '10px 16px',
                                          border: 'none',
                                          background:
                                            'none',
                                          textAlign:
                                            'left',
                                          cursor: 'pointer',
                                          fontSize:
                                            '13px',
                                          display:
                                            'flex',
                                          alignItems:
                                            'center',
                                          gap: '8px',
                                          color: '#333',
                                          transition:
                                            'background-color 0.2s',
                                        }}
                                        onMouseOver={(
                                          e,
                                        ) =>
                                        (e.target.style.backgroundColor =
                                          '#f5f5f5')
                                        }
                                        onMouseOut={(
                                          e,
                                        ) =>
                                        (e.target.style.backgroundColor =
                                          'transparent')
                                        }
                                      >
                                        <svg
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          style={{
                                            width: '16px',
                                            height: '16px',
                                            color: '#2196f3',
                                          }}
                                        >
                                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                        </svg>
                                        Follow  Up
                                      </button>

                                      {isApplicable(b.statusId, b.workflowTypeId,19) && hasPermission(
                                        'CanCancelBooking',
                                      ) &&  (
                                          <button
                                            className="dropdown-item"
                                            onClick={() => {
                                              handleCancelBooking(
                                                b.id,
                                              );
                                              setOpenMenuId(
                                                null,
                                              );
                                            }}
                                            style={{
                                              width: '100%',
                                              padding:
                                                '10px 16px',
                                              border: 'none',
                                              background:
                                                'none',
                                              textAlign:
                                                'left',
                                              cursor: 'pointer',
                                              fontSize:
                                                '13px',
                                              display:
                                                'flex',
                                              alignItems:
                                                'center',
                                              gap: '8px',
                                              color: '#333',
                                              transition:
                                                'background-color 0.2s',
                                            }}
                                            onMouseOver={(
                                              e,
                                            ) =>
                                            (e.target.style.backgroundColor =
                                              '#f5f5f5')
                                            }
                                            onMouseOut={(
                                              e,
                                            ) =>
                                            (e.target.style.backgroundColor =
                                              'transparent')
                                            }
                                          >
                                            <svg
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth="2"
                                              style={{
                                                width: '16px',
                                                height: '16px',
                                                color: '#dc3545',
                                              }}
                                            >
                                              <circle
                                                cx="12"
                                                cy="12"
                                                r="10"
                                              ></circle>
                                              <line
                                                x1="15"
                                                y1="9"
                                                x2="9"
                                                y2="15"
                                              ></line>
                                              <line
                                                x1="9"
                                                y1="9"
                                                x2="15"
                                                y2="15"
                                              ></line>
                                            </svg>
                                            Cancel Booking
                                          </button>
                                        )}
                                      <button
                                        style={{
                                          width: "100%",
                                          padding: "10px 16px",
                                          border: "none",
                                          background: "none",
                                          textAlign: "left",
                                          cursor: "pointer",
                                          fontSize: "13px",
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "8px",
                                          color: "#333",
                                          transition: "background-color 0.2s ease"
                                        }}

                                        className="dropdown-item"
                                        onClick={() => {
                                          setOpenMenuId(null);
                                          handleViewDocuments(b.id)
                                        }}
                                      >
                                        <FcDocument size={16} />
                                        View Documents
                                      </button>
                                      <button
                                        style={{
                                          width: "100%",
                                          padding: "10px 16px",
                                          border: "none",
                                          background: "none",
                                          textAlign: "left",
                                          cursor: "pointer",
                                          fontSize: "13px",
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "8px",
                                          color: "#333",
                                          transition: "background-color 0.2s ease"
                                        }}

                                        className="dropdown-item"
                                        onClick={() => {
                                          setOpenMenuId(null);
                                          handleViewReceipts(b.id)
                                        }}
                                      >
                                        <TbReceiptRupee size={16} color='#2e7d32' />
                                        View Receipts
                                      </button>
                                     { isApplicable(b.statusId, b.workflowTypeId,20) && ( 
                                      <button
                                        className="dropdown-item"
                                       onClick={() => {
                                              handleSenClosureBooking(
                                                b.id,
                                              );
                                              setOpenMenuId(
                                                null,
                                              );
                                            }}
                                      >
                                        <FaXmark size={16}/>
                                        Send for Closure
                                      </button>
                                        )}
                                      <button
                                            className="dropdown-item"
                                            onClick={() => {
                                              handleRemark(
                                                b.id,
                                              );
                                              setOpenMenuId(
                                                null,
                                              );
                                            }}
                                            
                                            style={{
                                              width: '100%',
                                              padding:
                                                '10px 16px',
                                              border: 'none',
                                              background:
                                                'none',
                                              textAlign:
                                                'left',
                                              cursor: 'pointer',
                                              fontSize:
                                                '13px',
                                              display:
                                                'flex',
                                              alignItems:
                                                'center',
                                              gap: '8px',
                                              color: '#333',
                                              transition:
                                                'background-color 0.2s',
                                            }}
                                            onMouseOver={(
                                              e,
                                            ) =>
                                            (e.target.style.backgroundColor =
                                              '#f5f5f5')
                                            }
                                            onMouseOut={(
                                              e,
                                            ) =>
                                            (e.target.style.backgroundColor =
                                              'transparent')
                                            }
                                          >
                                            <FaRegCommentDots size={18} />
                                            Remarks
                                          </button>
                                    </div>
                                  )}
                              </div>
                            }
                          </div>
                        </td>
                      </tr>
                    ))}
                  {filteredBookings.length === 0 &&
                    hasSearched && (
                      <tr>
                        <td
                          colSpan={8}
                          className="no-data"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <circle
                              cx="11"
                              cy="11"
                              r="8"
                            ></circle>
                            <path d="m21 21-4.35-4.35"></path>
                          </svg>
                          <p>
                            No bookings found
                            matching your criteria
                          </p>
                          <span>
                            Try adjusting your
                            filters or search terms
                          </span>
                        </td>
                      </tr>
                    )}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {hasSearched && filteredBookings.length > itemsPerPage && (
          <div
            className="pagination-controls"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: '20px',
              gap: '15px',
              paddingBottom: '20px',
            }}
          >
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className='primary-btn'
              >
              Previous
            </button>

            <span style={{ fontSize: '14px', color: '#666' }}>
              Page <strong>{currentPage}</strong> of{' '}
              <strong>{totalPages}</strong>
            </span>

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
             className='primary-btn'
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Simple & Attractive Cancel Booking Modal */}
      <SmallModal
        show={showCancelModal}
        size="small"
        transparentOverlay={false}
        onClose={() => {
          if (!cancelLoading) {
            setShowCancelModal(false);
            setSelectedBookingId(null);
            setCancelReason('');
          }
        }}
        title="Cancel Booking"
      >
        <div className="simple-cancel-modal">
          {/* Simple Header */}
          

          {/* Simple Booking Info */}
          {(() => {
            const booking = bookings.find(
              (b) => b.id === selectedBookingId,
            );
            return booking ? (
              
              <div className="mb-3">
                <div>
           
            <p className="cancel-message mb-3">
              Are you sure you want to cancel booking{' '}
              <strong onClick={() => navigate(`/booking-summery-report/${selectedBookingId}`)} style={{
                              cursor: "pointer",
                              fontWeight: "600",
                              textDecoration: "underline"
                            }}>{selectedBookingId}</strong> ?
            </p>
          </div>
                   <div className="row">
                    <div className="col-md-6">
                      <div className="booking-info-row">
                  <label>Booking Date:</label>
                  <span>{formatDisplayDate(booking.createdAt) || 'N/A'}</span>
                </div>
                    </div>
                
                <div className="col-md-6">
                  <div className="booking-info-row">
                  <label>Township Name:</label>
                  <span>
                    {booking.township} - Plot{' '}
                    {booking.plotNumber}
                  </span>
                </div>
                </div>
                <div className="col-md-6">
                  <div className="booking-info-row">
                  <label>Plot Size:</label>
                  <span>
                    {booking.plotSize} Sq.Yds
                  </span>
                </div>
                </div>
                <div className="col-md-6">
                      <div className="booking-info-row">
                  <label>Client:</label>
                  <span>{booking.clientName || 'N/A'}</span>
                </div>
                    </div>
                <div className="col-md-6">
                      <div className="booking-info-row">
                  <label>Verified Amount:</label>
                  <span>{parseFloat(totalAmountReceived).toFixed(2)}</span>
                </div>
                    </div>
                    <div className="col-md-6">
                      <div className="booking-info-row">
                  <label>Non Verified Amount:</label>
                  <span>{parseFloat(amountUnderVerification).toFixed(2)}</span>
                </div>
                    </div>
                    
                    
                
              </div>
              </div>
             
            ) : null;
          })()}

          {/* Simple Warning */}
          <div className="simple-warning">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span>
              Cancelled bookings cannot be edited or modified
            </span>
          </div>

          {/* Simple Reason Input */}
          <div className="simple-reason-section">
            <label htmlFor="cancel-reason">
              Reason for Cancellation{' '}
              <span className="required">*</span>
            </label>
            <textarea
              id="cancel-reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Please provide a reason for cancelling this booking..."
              rows={3}
              className='form-control'
              disabled={cancelLoading}
            />
            {/* {!cancelReason.trim() && (
              <span className="simple-error">
                Reason is required
              </span>
            )} */}
          </div>

          {/* Buttons inside popup */}
          <div
            className="simple-cancel-actions"
            style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end',
              marginTop: '20px',
              paddingTop: '15px',
              borderTop: '1px solid #eee',
            }}
          >
            <button
              type="button"
              className="primary-btn"
              onClick={() => {
                if (!cancelLoading) {
                  setShowCancelModal(false);
                  setSelectedBookingId(null);
                  setCancelReason('');
                }
              }}
              disabled={cancelLoading}
              style={{
                cursor: cancelLoading
                  ? 'not-allowed'
                  : 'pointer',
              }}
            >
              Close
            </button>
            <button
              type="button"
              className={` primary-btn ${cancelLoading || !cancelReason.trim() ? 'disabled' : ''}`}
              onClick={submitCancelBooking}
              disabled={cancelLoading || !cancelReason.trim()}
              style={{
                cursor:
                  cancelLoading || !cancelReason.trim()
                    ? 'not-allowed'
                    : 'pointer',
              }}
            >
              {cancelLoading
                ? 'Cancelling...'
                : 'Confirm Cancellation'}
            </button>
          </div>
        </div>
      </SmallModal>


       <SmallModal
  show={showRemarkModal}
  size="small"
  transparentOverlay={false}
  onClose={() => setShowRemarkModal(false)}
  title="Remarks"
>
 <textarea
  id="remarkText"
  placeholder="Add Remarks"
  rows={3}
  className='form-control remarkText'
  value={remarkText}
  onChange={(e) => setRemarkText(e.target.value)}
/>

  <div className="modal-actions">
    <button
      type="button"
      className="primary-btn"
      onClick={handleAddRemark}
    >
      Add Remark
    </button>
  </div>
</SmallModal>

      <SmallModal
        show={showNotificationsPopup}
        title="Notification"
        onClose={() => setShowNotificationsPopup(false)}
        transparentOverlay={false}
      >
        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <Notifications
            isPopup={true}
            onClose={() => setShowNotificationsPopup(false)}
          />
        </div>
      </SmallModal>
 <SmallModal
        show={showClosureConfirmationModal}
        size="small"
        transparentOverlay={false}
        onClose={() => {
          if (!cancelLoading) {
            setShowClosureConfirmationModal(false);
            setSelectedBookingId(null);
          //  setCancelReason('');
          }
        }}
        title="Send for Closure"
      >
        <div className="">
          

          {/* Simple Booking Info */}
          {(() => {
            const booking = bookings.find(
              (b) => b.id === selectedBookingId,
            );
            return booking ? (
              <div className="simple-booking-info">
                <div className="info-row">
                  <span>Client:</span>
                  <span>{booking.clientName || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span>Property:</span>
                  <span>
                    {booking.township} - Plot{' '}
                    {booking.plotNumber}
                  </span>
                </div>
              </div>
            ) : null;
          })()}

          {closureValidation && (
  <div className="closure-payment-table">
    <h4 className='dashboard-table-title mb-3'>Payment Summary</h4>

    <table className="table">
       <thead>
          <th>Agreement Value</th>
          <th>TDS</th>
          <th>Received Amount</th>
          <th>Pending Amount</th>
        </thead>
      <tbody>
       
        <tr>
          <td>₹{closureValidation.agreementValue}
              <p><b>Discount: ₹{closureValidation.totalDiscount}</b></p>

          </td>
           <td>₹{closureValidation.totalTDSDeducted}</td>
          <td>₹{closureValidation.receivedAmount}</td>
          <td style={{ color: closureValidation.pendingAmount > 0 ? "red" : "green" }}>
            ₹{closureValidation.pendingAmount}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
)}


{closureValidation && (
  <div className="closure-doc-table">

    <h4 className='dashboard-table-title mb-3'>Documents</h4>

    {/* {!closureValidation.documentsReceived?.length ? (
      <p>No documents uploaded</p>
    ) : ( */}
      <table className="table table-bordered">
  <tbody>
    <tr>
      {/* Uploaded Documents */}
      <td className="w-50" style={{ color: "green" }}>
        {closureValidation.documentsReceived?.length > 0
          ? closureValidation.documentsReceived
              .map((doc) => doc.documentName)
              .join(", ")
          : "No documents uploaded"}
      </td>

      {/* Pending Documents */}
      <td style={{ color: "red" }}>
        {closureValidation.documentsPending?.length > 0
          ? closureValidation.documentsPending.join(", ")
          : "No pending documents"}
      </td>
    </tr>
  </tbody>
</table>
    {/* )} */}

  </div>
)}
          {closureValidation && !closureValidation.canSendForClosure && (

  <div className="simple-warning">

    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>

    <span>
  Please upload required documents : {" "}
  <b>
    {closureValidation.documentsPending.join(", ")}
  </b>{" "}
  and complete pending payment before sending closure request.
</span>

  </div>

)}

        

          {/* Buttons inside popup */}
          <div
            className="simple-cancel-actions"
            style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end',
              marginTop: '20px',
              paddingTop: '15px',
              borderTop: '1px solid #eee',
            }}
          >
            <button
              type="button"
              className="primary-btn"
              onClick={() => {
                if (!cancelLoading) {
                  setShowClosureConfirmationModal (false);
                  setSelectedBookingId(null);
                  
                }
              }}
              disabled={cancelLoading}
              style={{
                cursor: cancelLoading
                  ? 'not-allowed'
                  : 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className={"primary-btn"  }
              onClick={submitClosureRequest}
              disabled={
  cancelLoading ||
  !closureValidation?.canSendForClosure
}
              style={{
  cursor:
    cancelLoading || !closureValidation?.canSendForClosure
      ? 'not-allowed'
      : 'pointer',
}}
            >
              {cancelLoading
                ? 'Sending for Closure...'
                : 'Send for Closure'}
            </button>
          </div>
        </div>
      </SmallModal>

      {/* Refund Booking Modal */}
      {showRefundModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Process Refund</h3>
              <button
                className="modal-close-btn"
                onClick={() => {
                  if (!refundLoading) {
                    setShowRefundModal(false);
                    setSelectedRefundBooking(null);
                    setRefundAmount('');
                  }
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); submitRefundBooking(); }} noValidate>
              {selectedRefundBooking && (
                <>
                  <div className="">
                    <h4 className="dashboard-table-title mb-3">Booking Information</h4>

                    <div className="row">
                      <div className="col-6">
                        <div className="form-group">
                        <label>Booking No.</label>
                        <input
                          type="text"
                          value={`${selectedRefundBooking.id}`}
                          className="form-control"
                          disabled
                          readOnly
                        />
                      </div>
                      </div>
                      <div className="col-6">
                        <div className="form-group">
                        <label>Booking Date</label>
                        <input
                          type="text"
                          value={formatDisplayDate(selectedRefundBooking.createdAt)}
                          className="form-control"
                          disabled
                          readOnly
                        />
                      </div>
                      </div>
                      <div className="col-6">
                        <div className="form-group">
                        <label>Client Name</label>
                        <input
                          type="text"
                          value={selectedRefundBooking.clientName || 'N/A'}
                          className="form-control"
                          disabled
                          readOnly
                        />
                      </div>
                      </div>
                      <div className="col-6">
                        <div className="form-group">
                        <label>Contact ID</label>
                        <input
                          type="text"
                          value={selectedRefundBooking.clientEmail || 'N/A'}
                          className="form-control"
                          disabled
                          readOnly
                        />
                      </div>
                      </div>
                      <div className="col-6">
                         <div className="form-group">
                        <label>Associate Information</label>
                        <input
                          type="text"
                          value={selectedRefundBooking.associateName || 'N/A'}
                          className="form-control"
                          disabled
                          readOnly
                        />
                      </div>
                      </div>
                      <div className="col-6">
                         <div className="form-group">
                        <label>Contact No.</label>
                        <input
                          type="text"
                          value={selectedRefundBooking.clientMobile || 'N/A'}
                          className="form-control"
                          disabled
                          readOnly
                        />
                      </div>
                      </div>
                      

                      
                    </div>

                    
                  
                    <h4 className="dashboard-table-title mb-3">Refund Details</h4>

                    <div className="row">
                      <div className="col-6">
                        <div className="form-group">
                        <label htmlFor="refund-amount" className="required">Refund Amount</label>
                        <input
                          type="number"
                          id="refund-amount"
                          value={refundAmount}
                          onChange={(e) => setRefundAmount(e.target.value)}
                          placeholder="Enter refund amount..."
                          className={`form-control ${(!refundAmount.trim() || isNaN(refundAmount) || parseFloat(refundAmount) <= 0) ? 'error' : ''}`}
                          disabled={refundLoading}
                          min="0"
                          step="0.01"
                        />
                        {/* {(!refundAmount.trim() || isNaN(refundAmount) || parseFloat(refundAmount) <= 0) && (
                          <div className="error-message">Valid amount is required</div>
                        )} */}
                      </div>
                      </div>
                      <div className="col-6">
                            <div className="form-group">
                        <label>Refund Status</label>
                        <input
                          type="text"
                          value="Pending"
                          className="form-control refund-status-pending"
                          disabled
                          readOnly
                        />
                      </div>
                      </div>

                      
                    </div>
                  </div>
                </>
              )}

              <div className="modal-actions mt-0">
                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => {
                    if (!refundLoading) {
                      setShowRefundModal(false);
                      setSelectedRefundBooking(null);
                      setRefundAmount('');
                    }
                  }}
                  disabled={refundLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-btn"
                  disabled={
                    refundLoading ||
                    !refundAmount.trim() ||
                    isNaN(refundAmount) ||
                    parseFloat(refundAmount) <= 0
                  }
                >
                  {refundLoading ? (
                    <>
                      <svg className="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                        <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Process Refund'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Status Modal */}
      <SmallModal
        show={showAddStatusModal}
        title="Update Booking Status"
        onClose={() => {
          if (!statusLoading) {
            setShowAddStatusModal(false);
            setSelectedStatusBooking(null);
            setStatusDate('');
            setStatusType('booking_created');
            setStatusNote('');
          }
        }}
      >
        <div className="simple-status-modal">
          {/* Booking Info */}
          {selectedStatusBooking && (
            <div
              style={{
                padding: '12px',
                background: '#f8f9fa',
                borderRadius: '6px',
                marginBottom: '20px',
                border: '1px solid #e9ecef',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '4px',
                }}
              >
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#333',
                  }}
                >
                  Booking ID {selectedStatusBooking.id}
                </span>
                <span
                  style={{ fontSize: '12px', color: '#666' }}
                >
                  {formatDisplayDate(
                    selectedStatusBooking.createdAt,
                  )}
                </span>
              </div>
              <div style={{ fontSize: '13px', color: '#555' }}>
                {selectedStatusBooking.township} • Plot{' '}
                {selectedStatusBooking.plotNumber}
              </div>
            </div>
          )}

          {/* Date Input */}
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '13px',
                fontWeight: '500',
                color: '#444',
              }}
            >
              Status Date <span className="required">*</span>
            </label>
            <input
              type="date"
              value={statusDate}
              onChange={(e) => setStatusDate(e.target.value)}
              className="form-control"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #ddd',
              }}
              disabled={statusLoading}
            />
          </div>

          {/* Status Select */}
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '13px',
                fontWeight: '500',
                color: '#444',
              }}
            >
              New Status <span className="required">*</span>
            </label>
            <select
              value={statusType}
              onChange={(e) => setStatusType(e.target.value)}
              className="simple-select"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #ddd',
              }}
              disabled={statusLoading}
            >
              <option value="booking_created">
                Booking Created
              </option>
              <option value="payment_pending">
                Payment Pending
              </option>
              <option value="payment_confirmed">
                Payment Confirmed
              </option>
              <option value="workflow_selected">
                Workflow Selected
              </option>
              <option value="WITH_LOAN">Loan</option>
              <option value="WITHOUT_LOAN">Without Loan</option>
              <option value="WITHOUT_7DAY_CLOSED">
                7 Day Closed
              </option>
              <option value="AGREEMENT_REGISTRY_PROCESS">
                Agreement Registry
              </option>
            </select>
          </div>

          {/* Note Input */}
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '13px',
                fontWeight: '500',
                color: '#444',
              }}
            >
              Note <span className="required">*</span>
            </label>
            <textarea
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="Enter status update note..."
              rows={3}
              className='form-control'
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                resize: 'vertical',
              }}
              disabled={statusLoading}
            />
          </div>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end',
              paddingTop: '15px',
              borderTop: '1px solid #eee',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setShowAddStatusModal(false);
                setSelectedStatusBooking(null);
              }}
              disabled={statusLoading}
              style={{
                padding: '8px 16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                background: 'white',
                color: '#666',
                cursor: statusLoading
                  ? 'not-allowed'
                  : 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submitAddStatus}
              disabled={statusLoading}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                background: '#10b981',
                color: 'white',
                cursor: statusLoading
                  ? 'not-allowed'
                  : 'pointer',
              }}
            >
              {statusLoading ? 'Saving...' : 'Save Status'}
            </button>
          </div>
        </div>
      </SmallModal>

      {/* Change Plot Modal */}
      <SmallModal
        show={showChangePlotModal}
        onClose={() => {
          if (!changePlotLoading) {
            setShowChangePlotModal(false);
            setSelectedChangePlotBooking(null);
            setSelectedPlot('');
            setChangePlotReason('');
            setNewAgreementValue('');
             setTotalTdsValue('');
            setAvailablePlots([]);
          }
        }}
        title="Change Plot"
      >
        <div className="simple-change-plot-modal">
          {/* Change Plot Header */}
          <div className="simple-change-plot-header">
            <div className="change-plot-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <p className="change-plot-message">
              Change plot for booking{' '}
              <strong>{selectedChangePlotBooking?.id}</strong>
            </p>
          </div>

          {/* Current Booking Information */}
          {selectedChangePlotBooking && (
            <div className="current-booking-info">
              <h4
                style={{
                  margin: '0 0 15px 0',
                  fontSize: '16px',
                  color: '#333',
                }}
              >
                Current Booking Details
              </h4>

              <div
                className="info-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  marginBottom: '20px',
                }}
              >
                <div className="info-item">
                  <label>Client Name</label>
                  <span>
                    {selectedChangePlotBooking.clientName ||
                      'N/A'}
                  </span>
                </div>

                <div className="info-item">
                  <label>Township</label>
                  <span>
                    {selectedChangePlotBooking.township}
                  </span>
                </div>

                <div className="info-item">
                  <label>Current Plot Number</label>
                  <span>
                    Plot{' '}
                    {selectedChangePlotBooking.plotNumber}
                  </span>
                </div>

                <div className="info-item">
                  <label>Plot Size</label>
                  <span>
                    {selectedChangePlotBooking.plotSize ||
                      'N/A'}
                  </span>
                </div>
              </div>

              {/* New Plot Selection */}
              <div className="new-plot-section">
                <label htmlFor="plot-select">
                  Available Plots in{' '}
                  {selectedChangePlotBooking.township}{' '}
                  <span className="required">*</span>
                </label>
                <select
                  id="plot-select"
                  value={selectedPlot}
                  onChange={(e) => setSelectedPlot(e.target.value)}
                  className="simple-select"
                  disabled={changePlotLoading}
                >
                  <option value="">Select a plot...</option>
                  {plotList.map((plot) => (
                    <option key={plot.id} value={plot.id}>
                      {`${plot.plotTypeName} - ${plot.plotNo} - ${plot.plotSize} - ${plot.facingName}`}
                    </option>
                  ))}
                </select>
                {!selectedPlot && (
                  <span className="simple-error">
                    Please select a plot
                  </span>
                )}
              </div>

              {/* New Agreement Value Input */}
              <div className="agreement-value-section">
                <label htmlFor="new-agreement-value">
                  New Agreement Value{' '}
                  <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="new-agreement-value"
                  value={newAgreementValue}
                  onChange={(e) =>
                    setNewAgreementValue(e.target.value)
                  }
                  placeholder="Enter new agreement value..."
                  className="form-control"
                  disabled={changePlotLoading}
                  min="0"
                  step="0.01"
                />
                {(!newAgreementValue ||
                  isNaN(newAgreementValue) ||
                  parseFloat(newAgreementValue) <= 0) && (
                    <span className="simple-error">
                      Valid agreement value is required
                    </span>
                  )}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div
            className="simple-change-plot-actions"
            style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end',
              marginTop: '20px',
              paddingTop: '15px',
              borderTop: '1px solid #eee',
            }}
          >
            <button
              type="button"
              className="primary-btn"
              onClick={() => {
                if (!changePlotLoading) {
                  setShowChangePlotModal(false);
                  setSelectedChangePlotBooking(null);
                  setSelectedPlot('');
                  setChangePlotReason('');
                  setNewAgreementValue('');
                  setAvailablePlots([]);
                }
              }}
              disabled={changePlotLoading}
              style={{
                cursor: changePlotLoading
                  ? 'not-allowed'
                  : 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`primary-btn ${changePlotLoading || !selectedPlot || !changePlotReason.trim() || !newAgreementValue || isNaN(newAgreementValue) || parseFloat(newAgreementValue) <= 0 ? 'disabled' : ''}`}
              onClick={submitChangePlot}
              disabled={
                changePlotLoading ||
                !selectedPlot ||
                !newAgreementValue ||
                isNaN(newAgreementValue) ||
                parseFloat(newAgreementValue) <= 0
              }
              style={{
                background:
                  changePlotLoading ||
                    !selectedPlot ||

                    !newAgreementValue ||
                    isNaN(newAgreementValue) ||
                    parseFloat(newAgreementValue) <= 0
                    ? '#cbd5e1'
                    : '#21a2a7',
                color: changePlotLoading ||
                  !selectedPlot ||

                  !newAgreementValue ||
                  isNaN(newAgreementValue) ||
                  parseFloat(newAgreementValue) <= 0
                  ? '#64748b'
                  : 'black',
                cursor:
                  changePlotLoading ||
                    !selectedPlot ||

                    !newAgreementValue ||
                    isNaN(newAgreementValue) ||
                    parseFloat(newAgreementValue) <= 0
                    ? 'not-allowed'
                    : 'pointer',
              }}
            >
              {changePlotLoading
                ? 'Changing Plot...'
                : 'Change Plot'}
            </button>
          </div>
        </div>
      </SmallModal>

      {/* Enhanced Send for Draft Modal */}
      <SmallModal
        show={showSendForDraftModal}
        title="Send for Draft"
        // title="Send for Draft - Client Information"
        onClose={() => {
          if (!sendDraftLoading) {
            setShowSendForDraftModal(false);
            setSelectedDraftBooking(null);
            setDraftClientInfo({
              applicationName: '',
              fatherMotherCo: '',
              address: '',
              mobileNo: '',
              aadharCard: '',
              panCard: '',
            });
            setDraftNotes('');
            setAadharFile(null);
            setPanFile(null);
            setDraftClientInfoChecked(false);
            setDraftDocumentUploadChecked(false);
            setPreviews({
              aadhar: null,
              pan: null
            });
          }
        }}
      >
        <div className="">
          {selectedDraftBooking && (
            <>
              <h3 className='dashboard-table-title'>Booking Reference</h3>
              <div
                className="booking-reference-section">
                <div>
                  <strong>ID:</strong>
                  {selectedDraftBooking.id}
                </div>
                <div>
                  <strong>Township:</strong>{' '}
                  {selectedDraftBooking.township}
                </div>
                <div>
                  <strong>Plot:</strong>{' '}
                  {selectedDraftBooking.plotNumber} (
                  {selectedDraftBooking.plotSize})
                </div>
              </div>
              {/* Use Existing Information Section */}
              <div
                className="existing-info-section"
                style={{
                  marginBottom: '20px',
                  opacity:
                    clientInfoSource === 'existing'
                      ? 1
                      : 0.6,
                  transition: 'all 0.3s ease',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    marginBottom: '10px',
                  }}
                >
                  <input
                    type="radio"
                    id="useExistingSource"
                    name="clientInfoSource"
                    checked={
                      clientInfoSource === 'existing'
                    }
                    onChange={() => {
                      setClientInfoSource('existing')
                      setDraftClientInfo({
                        applicationName: selectedDraftBooking?.clientName || '-',
                        relationType: selectedDraftBooking?.clientRelation || '-',
                        fatherMotherCo: selectedDraftBooking?.clientRelativeName || '-',
                        address: selectedDraftBooking?.clientAddress || '-',
                        mobileNo: selectedDraftBooking?.clientMobile || '-',
                        aadharCard: selectedDraftBooking?.aadharCard || '-',
                        panCard: selectedDraftBooking?.panCard || '-',
                      })
                    }}
                    style={{
                      marginRight: '8px',
                      cursor: 'pointer',
                      margin: '0 8px 0 0',
                      width: '18px',
                      height: '18px',
                      flexShrink: 0,
                    }}
                  />
                  <label
                    htmlFor="useExistingSource"
                    className='radio-label'
                  >
                    Use Existing Information
                  </label>
                </div>

                <div
                  style={{
                    backgroundColor: '#f8f9fa',
                    padding: '15px',
                    borderRadius: '0px',
                    border:
                      clientInfoSource === 'existing'
                        ? '2px solid #007bff'
                        : '1px solid #ccc',
                    fontSize: '14px',
                    pointerEvents:
                      clientInfoSource === 'existing'
                        ? 'auto'
                        : 'none',
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '15px',
                      marginBottom: '10px',
                    }}
                  >
                    <div>
                      <strong>Application Name:</strong>{' '}
                      <br />
                      {selectedDraftBooking.clientName ||
                        '-'}
                    </div>
                    <div>
                      <strong>
                        {selectedDraftBooking?.clientRelation || 'Relation'}

                      </strong>{' '}
                      <br />
                      {selectedDraftBooking.clientRelativeName || '-'}
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '15px',
                      marginBottom: '10px',
                    }}
                  >
                    <div>
                      <strong>Address:</strong> <br />
                      {selectedDraftBooking.clientAddress ||
                        '-'}
                    </div>
                    <div>
                      <strong>Mobile Number:</strong>{' '}
                      <br />
                      {selectedDraftBooking.clientMobile ||
                        '-'}
                    </div>
                  </div>
                </div>
              </div>
              {/* (New) Section */}
              <div
                className="new-info-section"
                style={{
                  marginBottom: '20px',
                  opacity:
                    clientInfoSource === 'new' ? 1 : 0.6,
                  transition: 'all 0.3s ease',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    marginBottom: '15px',
                  }}
                >
                  <input
                    type="radio"
                    id="useNewSource"
                    name="clientInfoSource"
                    checked={clientInfoSource === 'new'}
                    onChange={() => {
                      setClientInfoSource('new')
                      setDraftClientInfo({
                        applicationName: '',
                        relationType: '',
                        fatherMotherCo: '',
                        address: '',
                        mobileNo: '',
                        aadharCard: '',
                        panCard: '',
                      })
                    }}
                    style={{
                      marginRight: '8px',
                      cursor: 'pointer',
                      margin: '0 8px 0 0',
                      width: '18px',
                      height: '18px',
                      flexShrink: 0,
                    }}
                  />
                  <label
                    htmlFor="useNewSource"
                    className='radio-label'
                  >
                    (New)
                  </label>
                </div>

                <div
                  className="draft-new-info-form-container"
                  style={{
                    border:
                      clientInfoSource === 'new'
                        ? '2px solid #007bff'
                        : '1px solid #ccc',
                    borderRadius: '0px',
                    padding:
                      clientInfoSource === 'new'
                        ? '15px'
                        : '15px',
                    pointerEvents:
                      clientInfoSource === 'new'
                        ? 'auto'
                        : 'none',
                  }}
                >
                  <div
                    className="draft-form-row-two-cols"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '15px',
                      marginBottom: '15px',
                    }}
                  >
                    <div className="draft-form-field">
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '5px',
                          fontWeight: '500',
                          color: '#495057',
                          fontSize: '14px',
                        }}
                      >
                        Application Name{' '}
                        <span
                          style={{ color: '#dc3545' }}
                        >
                          *
                        </span>
                      </label>
                      <input
                        type="text"
                        value={
                          draftClientInfo.applicationName
                        }
                        onChange={(e) =>
                          setDraftClientInfo(
                            (prev) => ({
                              ...prev,
                              applicationName:
                                e.target.value,
                            }),
                          )
                        }
                        placeholder="Enter client name"
                        disabled={sendDraftLoading}
                        className='form-control'
                      />
                    </div>

                    <div className="draft-form-field">
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '5px',
                          fontWeight: '500',
                          color: '#495057',
                          fontSize: '14px',
                        }}
                      >
                        S/O , D/O , W/O , C/O
                      </label>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <select
                          value={draftClientInfo.relationType}
                          onChange={(e) =>
                            setDraftClientInfo(
                              (prev) => ({
                                ...prev,
                                relationType:
                                  e.target.value,
                              }),
                            )
                          }
                          style={{ width: "90px" }}
                          className="form-control"
                        >
                          <option value="">Select</option>
                          {relationOptions.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={
                            draftClientInfo.fatherMotherCo
                          }
                          onChange={(e) =>
                            setDraftClientInfo(
                              (prev) => ({
                                ...prev,
                                fatherMotherCo:
                                  e.target.value,
                              }),
                            )
                          }
                          placeholder="Enter relative name"
                          style={{ flex: 1 }}
                          className="form-control"
                        />
                      </div>
                    </div>
                  </div>

                  <div
                    className="draft-form-row-two-cols"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '15px',
                      marginBottom: '15px',
                    }}
                  >
                    <div className="draft-form-field">
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '5px',
                          fontWeight: '500',
                          color: '#495057',
                          fontSize: '14px',
                        }}
                      >
                        Address
                      </label>
                      <textarea
                        value={draftClientInfo.address}
                        onChange={(e) =>
                          setDraftClientInfo(
                            (prev) => ({
                              ...prev,
                              address:
                                e.target.value,
                            }),
                          )
                        }
                        placeholder="Enter complete address"
                        disabled={sendDraftLoading}
                        rows={1}
                        className='form-control'
                      />
                    </div>

                    <div className="draft-form-field">
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '5px',
                          fontWeight: '500',
                          color: '#495057',
                          fontSize: '14px',
                        }}
                      >
                        Mobile Number{' '}
                        <span
                          style={{ color: '#dc3545' }}
                        >
                          *
                        </span>
                      </label>
                      <input
                          type="tel"
                          value={draftClientInfo.mobileNo}
                          onChange={(e) => {
                            // শুধু digit রাখবে
                            let value = e.target.value.replace(/\D/g, "");

                            // 10 digit limit
                            if (value.length > 10) {
                              value = value.slice(0, 10);
                            }

                            setDraftClientInfo((prev) => ({
                              ...prev,
                              mobileNo: value,
                            }));
                          }}
                          placeholder="Enter mobile number"
                          disabled={sendDraftLoading}
                          className="form-control"
                          maxLength={10}
                        />
                    </div>
                  </div>
                  {/* <div className="checkbox-row">
                    <label className="custom-checkbox">
                      <input
                        type="checkbox"
                        checked={isDraftChecked}
                        onChange={(e) => setIsDraftChecked(e.target.checked)}
                      />
                      <span>Document for Draft</span>
                    </label>

                    <label className="custom-checkbox">
                      <input
                        type="checkbox"
                        checked={isATTChecked}
                        onChange={(e) => setIsATTChecked(e.target.checked)}
                      />
                      <span>Document for ATT</span>
                    </label>

                    <label className="custom-checkbox">
                      <input
                        type="checkbox"
                        checked={isAllotmentChecked}
                        onChange={(e) => setIsAllotmentChecked(e.target.checked)}
                      />
                      <span>Document for Allotment</span>
                    </label>
                  </div> */}

                  {/* File Uploads moved here */}
                  <div
                    className="draft-form-row-two-cols"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '15px',
                    }}
                  >

                    {/* AADHAR */}
                    <div>
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '5px',
                          fontWeight: '500',
                          color: '#495057',
                        }}
                      >
                        Aadhar Card (PDF/Image)
                      </label>

                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        disabled={sendDraftLoading}
                        onChange={(e) => handleFileChange("aadhar", e.target.files)}
                        className='form-control'
                      />

                      <div
                        style={{
                          marginTop: '8px',
                          height: '110px',
                          background: '#fafafa',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          padding: '6px',
                        }}
                      >
                        {previews.aadhar ? (
                          isPdf(previews.aadhar, "aadhar") ? (
                            <button
                              style={{
                                padding: '8px 16px',
                                background: '#0d6efd',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 600,
                              }}
                              onClick={() => window.open(previews.aadhar, "_blank")}
                            >
                              Preview PDF
                            </button>
                          ) : (
                            <img
                              src={previews.aadhar}
                              alt="aadhar preview"
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                borderRadius: '0px',
                              }}
                            />
                          )
                        ) : (
                          <span style={{ fontSize: '13px', color: '#9ca3af' }}>
                            No file selected
                          </span>
                        )}
                      </div>
                    </div>

                    {/* PAN */}
                    <div>
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '5px',
                          fontWeight: '500',
                          color: '#495057',
                        }}
                      >
                        PAN Card (PDF/Image)
                      </label>

                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        disabled={sendDraftLoading}
                        onChange={(e) => handleFileChange("pan", e.target.files)}
                        className='form-control'
                      />

                      <div
                        style={{
                          marginTop: '8px',
                          height: '110px',
                          background: '#fafafa',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          padding: '6px',
                        }}
                      >
                        {previews.pan ? (
                          isPdf(previews.pan, "pan") ? (
                            <button
                              style={{
                                padding: '8px 16px',
                                background: '#0d6efd',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 600,
                              }}
                              onClick={() => window.open(previews.pan, "_blank")}
                            >
                              Preview PDF
                            </button>
                          ) : (
                            <img
                              src={previews.pan}
                              alt="pan preview"
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                borderRadius: '0px',
                              }}
                            />
                          )
                        ) : (
                          <span style={{ fontSize: '13px', color: '#9ca3af' }}>
                            No file selected
                          </span>
                        )}
                      </div>
                    </div>

                  </div>

                </div>
              </div>
              {/* Notes Section */}
              <div
                className="notes-section"
                style={{ marginBottom: '20px' }}
              >
                <label
                  style={{
                    display: 'block',
                    marginBottom: '5px',
                    fontWeight: '500',
                    color: '#495057',
                  }}
                >
                  Notes{' '}
                  <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <textarea
                  value={draftNotes}
                  onChange={(e) =>
                    setDraftNotes(e.target.value)
                  }
                  placeholder="Enter notes for the draft request..."
                  disabled={sendDraftLoading}
                  rows={4}
                  className='form-control'
                />
              </div>
              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  justifyContent: 'flex-end',
                  paddingTop: '15px',
                  borderTop: '1px solid #e9ecef',
                  paddingBottom: '20px',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (!sendDraftLoading) {
                      setShowSendForDraftModal(false);
                      setSelectedDraftBooking(null);
                      setDraftClientInfo({
                        applicationName: '',
                        fatherMotherCo: '',
                        address: '',
                        mobileNo: '',
                        aadharCard: '',
                        panCard: '',
                      });
                      setDraftNotes('');
                      setAadharFile(null);
                      setPanFile(null);
                      setDraftClientInfoChecked(false);
                      setDraftDocumentUploadChecked(
                        false,
                      );
                    }
                  }}
                  disabled={sendDraftLoading}
                  className='primary-btn'
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={submitSendForDraft}
                  className='primary-btn'
                  disabled={
                    sendDraftLoading ||
                    (clientInfoSource === 'new' &&
                      (!draftClientInfo.applicationName.trim() ||
                        !draftClientInfo.mobileNo.trim())) ||
                    !draftNotes.trim()
                  }
                  style={{
                    cursor:
                      sendDraftLoading ||
                        (clientInfoSource === 'new' &&
                          (!draftClientInfo.applicationName.trim() ||
                            !draftClientInfo.mobileNo.trim())) ||
                        !draftNotes.trim()
                        ? 'not-allowed'
                        : 'pointer',
                  }}
                >
                  {sendDraftLoading
                    ? 'Sending...'
                    : 'Send for Draft'}
                </button>
              </div>
            </>
          )}
        </div>
      </SmallModal>

      {/* Send for Agreement Modal */}
      <SmallModal
        show={showSendForAgreementModal}
        title="Send for Agreement"
        onClose={() => {
          if (!sendAgreementLoading) {
            setShowSendForAgreementModal(false);
            setSelectedAgreementBooking(null);
            setAgreementClientInfo({
              applicationName: '',
              fatherMotherCo: '',
              address: '',
              mobileNo: '',
              aadharCard: '',
              panCard: '',
            });
            setAgreementNotes('');
            setAgreementAadharFile(null);
            setAgreementPanFile(null);
            setAgreementClientInfoChecked(false);
            setAgreementDocumentUploadChecked(false);
          }
        }}
      >
        <div className="send-agreement-modal-content">
          {selectedAgreementBooking && (
            <>
              <h3 className='dashboard-table-title'>Booking Reference</h3>
              {/* Booking Reference */}
              <div
                className="booking-reference-section">

                <div>
                  <strong>ID:</strong>
                  {selectedAgreementBooking.id}
                </div>
                <div>
                  <strong>Township:</strong>{' '}
                  {selectedAgreementBooking.township}
                </div>
                <div>
                  <strong>Plot:</strong>{' '}
                  {selectedAgreementBooking.plotNumber} (
                  {selectedAgreementBooking.plotSize})
                </div>
              </div>

              {/* Client Information Checkbox */}
              {/* Use Existing Information Section */}
              <div
                className="existing-info-section"
                style={{
                  marginBottom: '20px',
                  opacity:
                    agreementInfoSource === 'existing'
                      ? 1
                      : 0.6,
                  transition: 'all 0.3s ease',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    marginBottom: '10px',
                  }}
                >
                  <input
                    type="radio"
                    id="useExistingAgreementSource"
                    name="agreementInfoSource"
                    checked={
                      agreementInfoSource === 'existing'
                    }
                    onChange={() => {
                      setAgreementInfoSource('existing')
                      setAgreementClientInfo({
                        applicationName: selectedAgreementBooking?.clientName,
                        relationType: selectedAgreementBooking?.clientRelation,
                        fatherMotherCo: selectedAgreementBooking?.clientRelativeName,
                        address: selectedAgreementBooking?.clientAddress,
                        mobileNo: selectedAgreementBooking?.clientMobile,
                        aadharCard: selectedAgreementBooking?.aadharCard,
                        panCard: selectedAgreementBooking?.panCard,
                      })
                    }}
                  />
                  <label
                    htmlFor="useExistingAgreementSource"
                    className='radio-label'
                  >
                    Use Existing Information
                  </label>
                </div>

                <div
                  style={{
                    backgroundColor: '#f8f9fa',
                    padding: '15px',
                    borderRadius: '0px',
                    border:
                      agreementInfoSource === 'existing'
                        ? '2px solid #007bff'
                        : '1px solid #ccc',
                    fontSize: '14px',
                    pointerEvents:
                      agreementInfoSource === 'existing'
                        ? 'auto'
                        : 'none',
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '15px',
                      marginBottom: '10px',
                    }}
                  >
                    <div>
                      <strong>Application Name:</strong>{' '}
                      <br />
                      {selectedAgreementBooking.clientName ||
                        '-'}
                    </div>
                    <div>
                      <strong>
                        {selectedAgreementBooking?.clientRelation || 'Relation'}

                      </strong>{' '}
                      <br />
                      {selectedAgreementBooking.clientRelativeName || '-'}
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '15px',
                      marginBottom: '10px',
                    }}
                  >
                    <div>
                      <strong>Address:</strong> <br />
                      {selectedAgreementBooking.clientAddress ||
                        '-'}
                    </div>
                    <div>
                      <strong>Mobile Number:</strong>{' '}
                      <br />
                      {selectedAgreementBooking.clientMobile ||
                        '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* (New) Section */}
              <div
                className="new-info-section"
                style={{
                  marginBottom: '20px',
                  opacity:
                    agreementInfoSource === 'new' ? 1 : 0.6,
                  transition: 'all 0.3s ease',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    marginBottom: '15px',
                  }}
                >
                  <input
                    type="radio"
                    id="useNewAgreementSource"
                    name="agreementInfoSource"
                    checked={agreementInfoSource === 'new'}
                    onChange={() => {
                      setAgreementInfoSource('new')
                      setAgreementClientInfo({
                        applicationName: '',
                        relationType: '',
                        fatherMotherCo: '',
                        address: '',
                        mobileNo: '',
                        aadharCard: '',
                        panCard: '',
                      })
                    }}
                    style={{
                      marginRight: '8px',
                      cursor: 'pointer',
                      margin: '0 8px 0 0',
                      width: '18px',
                      height: '18px',
                      flexShrink: 0,
                    }}
                  />
                  <label
                    htmlFor="useNewAgreementSource"
                    className='radio-label'
                  >
                    (New)
                  </label>
                </div>

                <div
                  style={{
                    border:
                      agreementInfoSource === 'new'
                        ? '2px solid #007bff'
                        : '1px solid #ccc',
                    borderRadius: '0px',
                    padding:
                      agreementInfoSource === 'new'
                        ? '15px'
                        : '15px',
                    pointerEvents:
                      agreementInfoSource === 'new'
                        ? 'auto'
                        : 'none',
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '15px',
                      marginBottom: '15px',
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '5px',
                          fontWeight: '500',
                          color: '#495057',
                        }}
                      >
                        Application Name{' '}
                        <span
                          style={{ color: '#dc3545' }}
                        >
                          *
                        </span>
                      </label>
                      <input
                        type="text"
                        value={
                          agreementClientInfo.applicationName
                        }
                        onChange={(e) =>
                          setAgreementClientInfo(
                            (prev) => ({
                              ...prev,
                              applicationName:
                                e.target.value,
                            }),
                          )
                        }
                        placeholder="Enter client name"
                        disabled={sendAgreementLoading}
                        className='form-control'
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '5px',
                          fontWeight: '500',
                          color: '#495057',
                        }}
                      >
                        S/O , D/O , W/O , C/O
                      </label>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <select
                          value={agreementClientInfo.relationType}
                          onChange={(e) =>
                            setAgreementClientInfo(
                              (prev) => ({
                                ...prev,
                                relationType:
                                  e.target.value,
                              }),
                            )
                          }
                          style={{ width: "90px" }}
                          className="form-control"
                        >
                          <option value=""> Select</option>
                          {relationOptions.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={
                            agreementClientInfo.fatherMotherCo
                          }
                          onChange={(e) =>
                            setAgreementClientInfo(
                              (prev) => ({
                                ...prev,
                                fatherMotherCo:
                                  e.target.value,
                              }),
                            )
                          }
                          placeholder="Enter relative name"
                          style={{ flex: 1 }}
                          className="form-control"
                        />
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '15px',
                      marginBottom: '15px',
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '5px',
                          fontWeight: '500',
                          color: '#495057',
                        }}
                      >
                        Address
                      </label>
                      <textarea
                        value={
                          agreementClientInfo.address
                        }
                        onChange={(e) =>
                          setAgreementClientInfo(
                            (prev) => ({
                              ...prev,
                              address:
                                e.target.value,
                            }),
                          )
                        }
                        placeholder="Enter complete address"
                        disabled={sendAgreementLoading}
                        rows={1}
                        className='form-control'
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '5px',
                          fontWeight: '500',
                          color: '#495057',
                        }}
                      >
                        Mobile Number{' '}
                        <span
                          style={{ color: '#dc3545' }}
                        >
                          *
                        </span>
                      </label>
                      <input
                        type="tel"
                        value={
                          agreementClientInfo.mobileNo
                        }
                        onChange={(e) =>
                          setAgreementClientInfo(
                            (prev) => ({
                              ...prev,
                              mobileNo:
                                e.target.value,
                            }),
                          )
                        }
                        placeholder="Enter mobile number"
                        disabled={sendAgreementLoading}
                        className='form-control'
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '15px',
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '5px',
                          fontWeight: '500',
                          color: '#495057',
                        }}
                      >
                        Aadhar Card (PDF/Image)
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) =>
                          setAgreementAadharFile(
                            e.target.files[0] ||
                            null,
                          )
                        }
                        disabled={sendAgreementLoading}
                        className='form-control'
                      />
                      {agreementAadharFile && (
                        <div
                          style={{
                            marginTop: '5px',
                            fontSize: '12px',
                            color: '#28a745',
                          }}
                        >
                          ✓ {agreementAadharFile.name}{' '}
                          selected
                        </div>
                      )}
                    </div>

                    <div>
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '5px',
                          fontWeight: '500',
                          color: '#495057',
                        }}
                      >
                        PAN Card (PDF/Image)
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) =>
                          setAgreementPanFile(
                            e.target.files[0] ||
                            null,
                          )
                        }
                        disabled={sendAgreementLoading}
                        className='form-control'
                      />
                      {agreementPanFile && (
                        <div
                          style={{
                            marginTop: '5px',
                            fontSize: '12px',
                            color: '#28a745',
                          }}
                        >
                          ✓ {agreementPanFile.name}{' '}
                          selected
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div
                className="notes-section"
                style={{ marginBottom: '20px' }}
              >
                <label
                  style={{
                    display: 'block',
                    marginBottom: '5px',
                    fontWeight: '500',
                    color: '#495057',
                  }}
                >
                  Agreement Notes{' '}
                  <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <textarea
                  value={agreementNotes}
                  onChange={(e) =>
                    setAgreementNotes(e.target.value)
                  }
                  placeholder="Enter notes for the agreement request..."
                  disabled={sendAgreementLoading}
                  rows={4}
                  className='form-control'
                />
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  justifyContent: 'flex-end',
                  paddingTop: '15px',
                  borderTop: '1px solid #e9ecef',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (!sendAgreementLoading) {
                      setShowSendForAgreementModal(false);
                      setSelectedAgreementBooking(null);
                      setAgreementClientInfo({
                        applicationName: '',
                        fatherMotherCo: '',
                        address: '',
                        mobileNo: '',
                        aadharCard: '',
                        panCard: '',
                      });
                      setAgreementNotes('');
                      setAgreementAadharFile(null);
                      setAgreementPanFile(null);
                      setAgreementClientInfoChecked(
                        false,
                      );
                      setAgreementDocumentUploadChecked(
                        false,
                      );
                    }
                  }}
                  disabled={sendAgreementLoading}
                  className='primary-btn'
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={submitSendForAgreement}
                  className='primary-btn'
                  disabled={
                    sendAgreementLoading ||
                    !agreementClientInfo.applicationName.trim() ||
                    !agreementClientInfo.mobileNo.trim() ||
                    !agreementNotes.trim()
                  }
                  style={{
                    cursor:
                      sendAgreementLoading ||
                        !agreementClientInfo.applicationName.trim() ||
                        !agreementClientInfo.mobileNo.trim() ||
                        !agreementNotes.trim()
                        ? 'not-allowed'
                        : 'pointer',
                    fontSize: '14px',
                  }}
                >
                  {sendAgreementLoading
                    ? 'Sending...'
                    : 'Send for Agreement'}
                </button>
              </div>
            </>
          )}
        </div>
      </SmallModal>

      {/* Send for Allotment Letter Modal */}
      <SmallModal
        show={showSendForAllotmentModal}
        // title="Send for Allotment Letter - Client Information"
        onClose={() => {
          if (!sendAllotmentLoading) {
            setShowSendForAllotmentModal(false);
            setSelectedAllotmentBooking(null);
            setAllotmentNotes('');
            setAllotmentAadharFile(null);
            setAllotmentPanFile(null);
            setAllotmentClientInfoChecked(false);
            setAllotmentDocumentUploadChecked(false);
          }
        }}
        title="Send for Allotment"
      >
        <div className="send-allotment-modal-content">
          {selectedAllotmentBooking && (
            <>
              <h3 className='dashboard-table-title'>Booking Reference</h3>
              {/* Booking Reference */}
              <div
                className="booking-reference-section">

                <div>
                  <strong>ID : </strong>
                  {selectedAllotmentBooking.id}
                </div>
                <div>
                  <strong>Township : </strong>{' '}
                  {selectedAllotmentBooking.township}
                </div>
                <div>
                  <strong>Plot : </strong>{' '}
                  {selectedAllotmentBooking.plotNumber} (
                  {selectedAllotmentBooking.plotSize})
                </div>

              </div>
              {/* Use Existing Information Section */}
              <div
                className="existing-info-section"
                style={{
                  marginBottom: '20px',
                  opacity:
                    allotmentInfoSource === 'existing'
                      ? 1
                      : 0.6,
                  transition: 'all 0.3s ease',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    marginBottom: '10px',
                  }}
                >
                  <input
                    type="radio"
                    id="useExistingAllotmentSource"
                    name="allotmentInfoSource"
                    checked={
                      allotmentInfoSource === 'existing'
                    }
                    onChange={() => {
                      setAllotmentInfoSource('existing')
                      setAllotmentClientInfo({
                        applicationName: selectedAllotmentBooking?.clientName,
                        relationType: selectedAllotmentBooking?.clientRelation,
                        fatherMotherCo: selectedAllotmentBooking?.clientRelativeName,
                        address: selectedAllotmentBooking?.clientAddress,
                        mobileNo: selectedAllotmentBooking?.clientMobile,
                        aadharCard: selectedAllotmentBooking?.aadharCard,
                        panCard: selectedAllotmentBooking?.panCard,
                      })
                    }}
                    style={{
                      marginRight: '8px',
                      cursor: 'pointer',
                      margin: '0 8px 0 0',
                      width: '18px',
                      height: '18px',
                      flexShrink: 0,
                    }}
                  />
                  <label
                    htmlFor="useExistingAllotmentSource"
                    className='radio-label'
                  >
                    Use Existing Information
                  </label>
                </div>

                <div
                  style={{
                    backgroundColor: '#f8f9fa',
                    padding: '15px',
                    borderRadius: '0px',
                    border:
                      allotmentInfoSource === 'existing'
                        ? '2px solid #007bff'
                        : '1px solid #ccc',
                    fontSize: '14px',
                    pointerEvents:
                      allotmentInfoSource === 'existing'
                        ? 'auto'
                        : 'none',
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '15px',
                      marginBottom: '10px',
                    }}
                  >
                    <div>
                      <strong>Application Name:</strong>{' '}
                      <br />
                      {selectedAllotmentBooking.clientName ||
                        '-'}
                    </div>
                    <div>
                      <strong>
                        {selectedAllotmentBooking?.clientRelation || 'Relation'}

                      </strong>{' '}
                      <br />
                      {selectedAllotmentBooking.clientRelativeName || '-'}
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '15px',
                      marginBottom: '10px',
                    }}
                  >
                    <div>
                      <strong>Address:</strong> <br />
                      {selectedAllotmentBooking.clientAddress ||
                        '-'}
                    </div>
                    <div>
                      <strong>Mobile Number:</strong>{' '}
                      <br />
                      {selectedAllotmentBooking.clientMobile ||
                        '-'}
                    </div>
                  </div>
                </div>
              </div>
              {/* (New) Section */}
              <div
                className="new-info-section"
                style={{
                  marginBottom: '20px',
                  opacity:
                    allotmentInfoSource === 'new' ? 1 : 0.6,
                  transition: 'all 0.3s ease',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    marginBottom: '15px',
                  }}
                >
                  <input
                    type="radio"
                    id="useNewAllotmentSource"
                    name="allotmentInfoSource"
                    checked={allotmentInfoSource === 'new'}
                    onChange={() => {
                      setAllotmentInfoSource('new')
                      setAllotmentClientInfo({
                        applicationName: '',
                        relationType: '',
                        fatherMotherCo: '',
                        address: '',
                        mobileNo: '',
                        aadharCard: '',
                        panCard: '',
                      })
                    }}
                    style={{
                      marginRight: '8px',
                      cursor: 'pointer',
                      margin: '0 8px 0 0',
                      width: '18px',
                      height: '18px',
                      flexShrink: 0,
                    }}
                  />
                  <label
                    htmlFor="useNewAllotmentSource"
                    className='radio-label'
                  >
                    (New)
                  </label>
                </div>

                <div
                  className="new-info-form-container"
                  style={{
                    border:
                      allotmentInfoSource === 'new'
                        ? '2px solid #007bff'
                        : '1px solid #ccc',
                    borderRadius: '0px',
                    padding:
                      allotmentInfoSource === 'new'
                        ? '15px'
                        : '15px',
                    pointerEvents:
                      allotmentInfoSource === 'new'
                        ? 'auto'
                        : 'none',
                  }}
                >
                  <div
                    className="form-row-two-cols"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '15px',
                      marginBottom: '15px',
                    }}
                  >
                    <div className="form-field">
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '5px',
                          fontWeight: '500',
                          color: '#495057',
                          fontSize: '14px',
                        }}
                      >
                        Application Name{' '}
                        <span
                          style={{ color: '#dc3545' }}
                        >
                          *
                        </span>
                      </label>
                      <input
                        type="text"
                        value={
                          allotmentClientInfo.applicationName
                        }
                        onChange={(e) =>
                          setAllotmentClientInfo(
                            (prev) => ({
                              ...prev,
                              applicationName:
                                e.target.value,
                            }),
                          )
                        }
                        placeholder="Enter client name"
                        disabled={sendAllotmentLoading}
                        className='form-control'
                      />
                    </div>

                    <div className="form-field">
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '5px',
                          fontWeight: '500',
                          color: '#495057',
                          fontSize: '14px',
                        }}
                      >
                        S/O , D/O , W/O , C/O
                      </label>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <select
                          value={allotmentClientInfo.relationType}
                          onChange={(e) =>
                            setAllotmentClientInfo(
                              (prev) => ({
                                ...prev,
                                relationType:
                                  e.target.value,
                              }),
                            )
                          }
                          style={{ width: "90px" }}
                          className="form-control"
                        >
                          <option value="">Select</option>
                          {relationOptions.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={
                            allotmentClientInfo.fatherMotherCo
                          }
                          onChange={(e) =>
                            setAllotmentClientInfo(
                              (prev) => ({
                                ...prev,
                                fatherMotherCo:
                                  e.target.value,
                              }),
                            )
                          }
                          placeholder="Enter relative name"
                          style={{ flex: 1 }}
                          className="form-control"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-field" style={{ marginBottom: '15px' }}>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '5px',
                        fontWeight: '500',
                        color: '#495057',
                        fontSize: '14px',
                      }}
                    >
                      Address
                    </label>
                    <textarea
                      value={allotmentClientInfo.address}
                      onChange={(e) =>
                        setAllotmentClientInfo((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                      placeholder="Enter complete address"
                      disabled={sendAllotmentLoading}
                      rows={3}
                      className='form-control'
                    />
                  </div>

                  <div className="form-field" style={{ marginBottom: '15px' }}>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '5px',
                        fontWeight: '500',
                        color: '#495057',
                        fontSize: '14px',
                      }}
                    >
                      Mobile Number{' '}
                      <span style={{ color: '#dc3545' }}>
                        *
                      </span>
                    </label>
                    <input
                      type="tel"
                      value={allotmentClientInfo.mobileNo}
                      onChange={(e) =>
                        setAllotmentClientInfo((prev) => ({
                          ...prev,
                          mobileNo: e.target.value,
                        }))
                      }
                      placeholder="Enter mobile number"
                      disabled={sendAllotmentLoading}
                      className='form-control'
                    />
                  </div>
                </div>
              </div>
              {/* Document Upload Checkbox - Commented out as API doesn't support file upload */}
              {/* <div
                style={{
                  marginBottom: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <input
                  type="checkbox"
                  id="allotmentDocumentUploadCheck"
                  checked={allotmentDocumentUploadChecked}
                  onChange={(e) =>
                    setAllotmentDocumentUploadChecked(
                      e.target.checked,
                    )
                  }
                  style={{ width: '16px', height: '16px' }}
                />
                <label
                  htmlFor="allotmentDocumentUploadCheck"
                  style={{
                    fontWeight: '500',
                    color: '#495057',
                    cursor: 'pointer',
                  }}
                >
                  Document Upload Complete
                </label>
              </div> */}
              {/* File Upload Section - Commented out as API doesn't support file upload */}
              {/* <div
                className="file-upload-section"
                style={{ marginBottom: '20px' }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '15px',
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '5px',
                        fontWeight: '500',
                        color: '#495057',
                      }}
                    >
                      Aadhar Card (PDF/Image)
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        setAllotmentAadharFile(
                          e.target.files[0] || null,
                        )
                      }
                      disabled={sendAllotmentLoading}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ced4da',
                        borderRadius: '4px',
                        fontSize: '14px',
                      }}
                    />
                    {allotmentAadharFile && (
                      <div
                        style={{
                          marginTop: '5px',
                          fontSize: '12px',
                          color: '#28a745',
                        }}
                      >
                        ✓ {allotmentAadharFile.name}{' '}
                        selected
                      </div>
                    )}
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '5px',
                        fontWeight: '500',
                        color: '#495057',
                      }}
                    >
                      PAN Card (PDF/Image)
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        setAllotmentPanFile(
                          e.target.files[0] || null,
                        )
                      }
                      disabled={sendAllotmentLoading}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ced4da',
                        borderRadius: '4px',
                        fontSize: '14px',
                      }}
                    />
                    {allotmentPanFile && (
                      <div
                        style={{
                          marginTop: '5px',
                          fontSize: '12px',
                          color: '#28a745',
                        }}
                      >
                        ✓ {allotmentPanFile.name}{' '}
                        selected
                      </div>
                    )}
                  </div>
                </div>
              </div> */}
              {/* Notes Section */}
              <div
                className="notes-section"
                style={{ marginBottom: '20px' }}
              >
                <label
                  style={{
                    display: 'block',
                    marginBottom: '5px',
                    fontWeight: '500',
                    color: '#495057',
                  }}
                >
                  Allotment Letter Notes{' '}
                  <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <textarea
                  value={allotmentNotes}
                  onChange={(e) =>
                    setAllotmentNotes(e.target.value)
                  }
                  placeholder="Enter notes for the allotment letter request..."
                  disabled={sendAllotmentLoading}
                  rows={4}
                  className='form-control'
                />
              </div>
              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  justifyContent: 'flex-end',
                  paddingTop: '15px',
                  borderTop: '1px solid #e9ecef',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (!sendAllotmentLoading) {
                      setShowSendForAllotmentModal(false);
                      setSelectedAllotmentBooking(null);
                      setAllotmentClientInfo({
                        applicationName: '',
                        fatherMotherCo: '',
                        address: '',
                        mobileNo: '',
                        aadharCard: '',
                        panCard: '',
                      });
                      setAllotmentNotes('');
                      setAllotmentAadharFile(null);
                      setAllotmentPanFile(null);
                      setAllotmentClientInfoChecked(
                        false,
                      );
                      setAllotmentDocumentUploadChecked(
                        false,
                      );
                    }
                  }}
                  disabled={sendAllotmentLoading}
                  className='primary-btn'
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className='primary-btn'
                  onClick={submitSendForAllotment}
                  disabled={
                    sendAllotmentLoading ||
                    (allotmentInfoSource === 'new' &&
                      (!allotmentClientInfo.applicationName.trim() ||
                        !allotmentClientInfo.mobileNo.trim())) ||
                    !allotmentNotes.trim()
                  }
                  style={{
                    cursor:
                      sendAllotmentLoading ||
                        (allotmentInfoSource === 'new' &&
                          (!allotmentClientInfo.applicationName.trim() ||
                            !allotmentClientInfo.mobileNo.trim())) ||
                        !allotmentNotes.trim()
                        ? 'not-allowed'
                        : 'pointer',
                  }}
                >
                  {sendAllotmentLoading
                    ? 'Sending...'
                    : 'Send for Allotment Letter'}
                </button>
              </div>
            </>
          )}
        </div>
      </SmallModal>
      <SmallModal
        title="Uploaded Documents"
        show={showUploadedDocumentModal}
        onClose={() => setShowUploadedDocumentModal(false)}
      >
        {!uploadedDocument?.length ? (
          <p>No documents found</p>
        ) : (
          <table className='table'
          >
            <thead>
              <tr>
                <th style={{ width: "60px", textAlign: "left" }}>S.No</th>
                <th style={{ textAlign: "left" }}>File Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {uploadedDocument.map((doc, index) => (
                <tr key={doc.documentId} style={{ borderBottom: "1px solid #eee" }}>
                  <td>{index + 1}</td>
                  <td>{doc.documentTypeName}</td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="primary-btn"
                      onClick={() => handleDownloadDocument(doc)}
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SmallModal>
      <LargeModal
        title="Uploaded Receipts"
        show={showViewReceiptModal}
        onClose={() => setShowViewReceiptModal(false)}
      >
        {!uploadedReceiptList?.length ? (
          <p>No receipts found</p>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Chq/ DD/ UPI/ NEFT-RTGS/ Transaction No</th>
                  <th>Amount</th>
                  <th>Bank Name</th>
                  <th>Receipt Date</th>
                  <th>Payment Mode</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {uploadedReceiptList.map((receipt, index) => (
                  <tr key={receipt.receiptumentId}>
                    <td>{index + 1}</td>
                    <td>{receipt.transactionId}</td>
                    <td>₹ {receipt.amount}</td>
                    <td>{receipt.bankName}</td>
                    <td>{receipt.receiptDate ? new Date(receipt.receiptDate).toLocaleDateString("en-GB") : "-"}</td>
                    <td>{formatPaymentMethod(receipt.receiptMethod)}</td>
                    <td>{receipt.statusText}</td>
                    <td>
                      <button
                        onClick={() => {
                          handleDownloadReceipt(receipt)
                          setShowViewReceiptModal(false)
                        }}
                        className='primary-btn'
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </LargeModal>
    </BookingWrapper>
  );
}

export default BookingDashboard;