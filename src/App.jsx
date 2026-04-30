// App.jsx (modified: added select-workflow route)
import { useEffect, useState } from "react";
import { Navigate, Outlet, Route, BrowserRouter as Router, Routes, useLocation } from "react-router-dom";
import './App.css';
import PermissionProtected from "./components/PermissionProtected";
import { GlobalStyle } from "./globalTheme";
import Layout from "./Layout";
import './styles/common-buttons.css';
import AuthService from "./utilities/auth";
import { initializeUserPermissions } from "./utilities/menuPermissions";
import StorageMigration from "./utilities/storageMigration";
import AdminDashboard from "./View/AdminView/AdminDashboard";
import AdminSettingsPage from "./View/AdminView/AdminSetting";
import RolePermissions from "./View/AdminView/RolePermissions";
import UserList from "./View/AdminView/UserList";
import AdminViewContainer from "./View/AdminView/ViewContainer";

import axiosInstance from "./utilities/axiosInstance";
import AssociateList from "./View/AssociateList";
import AssociateManagement from "./View/AssociateManagemant";
import AssociateBookingRequests from "./View/AssociateRequests/BookingRequests";
import AssociateDocumentVerifyRequests from "./View/AssociateRequests/DocumentVerifyRequests";
import GenerateReceipt from "./View/GenerateReceipt";
import Login from "./View/Login/index";
import AgreementDraftStatus from "./View/Property/AgreementDraftStatus";
import AgreementRegistryProcess from "./View/Property/AgreementRegistryProcess";
import AllotmentList from "./View/Property/AllotmentList";
import BankDDUpdate from "./View/Property/BankDDUpdate";
import BookingDashboard from "./View/Property/BookingDashboard";
import BookingDetail from "./View/Property/BookingDetail";
import BookingInfo from "./View/Property/BookingInfo";
import BookingSummary from "./View/Property/BookingSummary";
import ChangePlot from "./View/Property/ChangePlot";
import DokitSigning from "./View/Property/DokitSigning";
import DraftRequests from "./View/Property/DraftRequests";
import EditBooking from "./View/Property/EditBooking";
import FollowUp from "./View/Property/FollowUp";
import HoldBooking from "./View/Property/HoldBooking";
import HoldReportBooking from "./View/Property/HoldReportBooking";
import ClientList from "./View/Property/ClientList";
import AssociateBooking from "./View/Property/AssociateBooking";
import AssociateBookingList from "./View/Property/AssociateBookingList";
import InventoryManagement from "./View/Property/InventoryManagement";
import JDAPattaUpdate from "./View/Property/JDAPattaUpdate";
import LoanSanctionStatus from "./View/Property/LoanSanctionStatus";
import MarkFileCheck from "./View/Property/MarkFileCheck";
import NewBooking from "./View/Property/NewBooking";
import Notifications from "./View/Property/Notifications";
import PaymentEntry from "./View/Property/PaymentEntry";
import PaymentHistory from "./View/Property/PaymentHistory";
import PermissionTest from "./View/Property/PermissionTest";
import FileProgressReport from "./View/Property/ProgressReport";
import BookingReport from "./View/Reports/BookingReport"
import OCRPaymentUpdate from "./View/Property/Receipt PaymentUpdate";
import ReceiptVerification from "./View/Property/ReceiptVerification";
import RefundList from "./View/Property/RefundList";
import ReminderSave from "./View/Property/ReminderSave";
import Reports from "./View/Property/Reports";
import TownshipCollectionSummary from "./View/Property/TownshipCollectionSummary";
import TownshipHealthReport from "./View/Property/TownshipHealthReport";
import TownshipList from "./View/Property/TownshipList";
import UpdateInitialPayment from "./View/Property/UpdateInitialPayment";
import UpdateLoanDocument from "./View/Property/UpdateLoanDocument";
import UpdateLoginLiveStatus from "./View/Property/UpdateLoginLiveStatus";
import UpdateStatus from "./View/Property/UpdateStatus";
import UploadBankDemandDraft from "./View/Property/UploadBankDemandDraft";
import UploadLoanDocument from "./View/Property/UploadLoanDocument";
import UploadOriginalATTs from "./View/Property/UploadOriginalATTs";
import WeatherForecast from "./View/Property/WeatherForecast";
import WithLoan from "./View/Property/WithLoan";
import Without7DayClosed from "./View/Property/Without7DayClosed";
import WithoutLoan from "./View/Property/WithoutLoan";
import AvailabilityReport from "./View/Reports/AvailabilityReport";
import CollectionDetailReport from "./View/Reports/CollectionDetailReport";
import FundsReport from "./View/Reports/FundsReport";
import StaffList from "./View/StaffList";
import TeamList from "./View/TeamList";
import Settings from "./View/AdminView/settings";
import BookingSummeryReport from "./View/BookingSummeryReport";
import ReserveFunds  from "./View/Master/ReserveFunds";
import ClosureRequests from "./View/AdminView/ClosureRequests";
import DocumentTypes  from "./View/Master/DocumentTypes";
import TownshipFunds from "./View/Property/TownshipFunds/TownshipFunds";
import FileProgressSummaryReport from "./View/Reports/FileProgressSummaryReport";
import DailyComprehensiveReport from "./View/Reports/DailyComprehensiveReport";
import ManagementStatusReport from "./View/Reports/ManagementStatusReport";

import NotificationList from "./View/Notifications/NotificationList";
import OCRStatusUpdate from "./View/Property/OCRStatusUpdate";
import Banks  from "./View/Master/Banks";
import TdsEntry  from "./View/Accounts/TdsEntry";
import TdsList  from "./View/Accounts/TdsList";
import CancelledBookingsReport from "./View/Reports/CancelledBookingsReport";
import AccountPaymentEntry from "./View/Accounts/PaymentEntry";
import TransactionList  from "./View/Accounts/TransactionList";
import Ledger  from "./View/Accounts/Ledger";
import HeadList from "./View/Accounts/HeadList";
import DailyBalanceUpdate from "./View/Accounts/DailyBalanceUpdate";
import TicketList from "./View/Support/TicketList";
import ExpiredReraList from "./View/Reports/ExpiredReraList";
import ClosureReport from "./View/Reports/ClosureReport";
import ProcessStage from "./View/AdminView/ProcessStageSetup";
import DelayedBookings from "./View/AdminView/AdminDashboard/DelayedBookings";
import ManageEmailTemplate from "./View/Administration/ManageEmailTemplate";
import TemplateList from "./View/Administration/TemplateList";
import CreateTicket from "./View/Support/CreateTicket";
import TDSReport from "./View/Reports/TDSReport";
import TownshipForm  from "./View/Administration/AddTownship";
import 'quill/dist/quill.snow.css';
import BackupRestore from "./View/Administration/BackupRestore";
const isAuthenticated = () => {
    return AuthService.isAuthenticated();
};
const getRole = () => {
    return AuthService.getRole();
};
const getDefaultPathForRole = (role) => {    
    return '/admin';
};

const PrivateRoute = () => {
   //  const username = (localStorage.getItem('userName') || '').toLowerCase();
    // const role = getRole();

    // // Special handling for ITAdmin - ensure they always go to admin dashboard
    // if (username === 'itadmin' && role === 'admin') {
    // }

    return isAuthenticated() ? <Outlet /> : <Navigate to="/login" />;
};

const PublicRoute = () => {
    return !isAuthenticated() ? <Outlet /> : <Navigate to="/" />;
};

 
// const RootRedirect = () => {
//     const role = getRole();
//     const username = (localStorage.getItem('userName') || '').toLowerCase();
//     const defaultPath = getDefaultPathForRole(role);

   
//     return <Navigate to={defaultPath} replace />;
// };

const RoleProtected = ({ allowedRoles }) => {
    if (!isAuthenticated()) return <Navigate to="/login" />;

    const role = getRole();
    const username = (localStorage.getItem('userName') || '').toLowerCase();

    // Special debug logging for ITAdmin
    if (username === 'itadmin') {

    }

    if (!allowedRoles.includes(role)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

function App() {
    const [appSettings, setAppSettings] = useState(null);
    useEffect(() => {
        try {
            StorageMigration.runMigrationIfNeeded();
        } catch (error) { }

        if (AuthService.isAuthenticated()) {
            try {
                initializeUserPermissions();
            } catch (error) { }
        }

        // 🔥 ADD THIS PART
        const getLogo = async () => {
            try {
                const res = await axiosInstance.get('/Master/AppSettings');
                debugger;
                setAppSettings(res.data?.[0]);
                localStorage.setItem('logoUrl', res.data?.[0].logoUrl);
                localStorage.setItem('logo2Url', res.data?.[0].logo2Url);
                localStorage.setItem('companyName', res.data?.[0].companyName);

            } catch (error) {
                console.error('Error fetching logo:', error);
            }
        };
        getLogo();
    }, []);


    return (
        <>
            <GlobalStyle />
            <Router>
                <Routes>

                    <Route element={<PublicRoute />}>
                        <Route path="/login" element={<Login appSettings={appSettings} />} />
                    </Route>
                    <Route element={<PrivateRoute />}>
                       
                            <Route path="/" element={<Layout appSettings={appSettings} />}>
                                 <Route path="admin/delayed-bookings/:townshipId/:stageName" element={<DelayedBookings />} />

                                    <Route path="admin" element={<AdminDashboard />} />
                                    <Route path="admin-setting" element={<AdminSettingsPage />} />
                                    <Route path="admin-container" element={<AdminViewContainer />} />
                                    <Route path="admin-user-list" element={<UserList />} />
                                    <Route path="role-permissions" element={<RolePermissions />} />
                                       <Route path="administration/template/:id" element={<ManageEmailTemplate />} />
                                           <Route path="administration/template-list" element={<TemplateList />} />
                                            <Route path="administration/backup-restore" element={<BackupRestore />} />  
                                   
                                {/* permission */}
                                
                                     
                                        <Route path="property/new" element={<NewBooking />} />
                                       
                                            <Route path="property/edit/:id" element={<EditBooking />} />
                                        
                                        <Route path="property/township-list" element={<TownshipList />} />
                                        <Route path="associate-management" element={<AssociateManagement />} />
                                
                                  
                                        <Route path="property/file-check/:id" element={<MarkFileCheck />} />
                                        <Route path="property/file-check" element={<MarkFileCheck />} />
                                  
                                    <Route path="property" element={<BookingDashboard />} />
                                    <Route path="property/reports" element={<Reports />} />
                                    <Route path="reports/cancelled-bookings-report"  element={<CancelledBookingsReport />} />
                                    <Route path="reports/collection-detail-report/:townshipId" element={<CollectionDetailReport />} />
                                      <Route path="reports/funds-report/:townshipId" element={<FundsReport />} />
                                    <Route path="property/info" element={<BookingInfo />} />
                                    <Route path="property/payment/:id" element={<UpdateInitialPayment />} />
                                    <Route path="property/loan-document/:id" element={<UploadLoanDocument />} />
                                    <Route path="property/login-status/:id" element={<UpdateLoginLiveStatus />} />
                                      <Route path="property/ocr-status/:id" element={<OCRStatusUpdate />} />
                                    <Route path="property/agreement-draft/:id" element={<AgreementDraftStatus />} />
                                    <Route path="property/loan-sanction/:id" element={<LoanSanctionStatus />} />
                                    <Route path="property/ocr-payment/:id" element={<OCRPaymentUpdate />} />
                                    <Route path="property/receipt-list" element={<OCRPaymentUpdate />} />
                                    <Route path="property/receipt-list/:id" element={<OCRPaymentUpdate />} />
                                    <Route path="property/receipt-payment-update/:id" element={<OCRPaymentUpdate />} />
                                    <Route path="property/upload-atts/:id" element={<UploadOriginalATTs />} />
                                    <Route path="property/dokit-signing/:id" element={<DokitSigning />} />
                                    <Route path="property/bank-dd/:id" element={<UploadBankDemandDraft />} />
                                    <Route path="property/jda-patta/:id" element={<JDAPattaUpdate />} />
                                    <Route path="property/dd-update/:id" element={<BankDDUpdate />} />

                                    <Route path="property/with-loan" element={<WithLoan />} />
                                    <Route path="property/without-loan" element={<WithoutLoan />} />
                                    <Route path="property/without-7day-closed/:id" element={<Without7DayClosed />} />
                                    <Route path="property/agreement-registry/:id" element={<AgreementRegistryProcess />} />
                                    <Route path="property/summary/:id" element={<BookingSummary />} />
                                    <Route path="property/follow-up/:id" element={<FollowUp />} />
                                    <Route path="property/update-loan-document" element={<UpdateLoanDocument />} />
                                    <Route path="property/update-status/:id" element={<UpdateStatus />} />
                                    <Route path="property/weather-forecast" element={<WeatherForecast />} />
                                    <Route path="property/inventory-management" element={<InventoryManagement />} />
                                    <Route path="property/township-health/:townshipId?" element={<TownshipHealthReport />} />
                                    <Route path="property/township-progress-report/:townshipId?" element={<FileProgressReport />} />
                                    <Route path="property/township-progress-summary-report/:townshipId?" element={<FileProgressSummaryReport />} />
                                    <Route path="reports/daily-comprehensive-report" element={<DailyComprehensiveReport />} />
                                    <Route path="reports/management-status-report/:townshipId?" element={<ManagementStatusReport />} />
                                    <Route path="reports/availability-report/:townshipId?" element={<AvailabilityReport />} />
                                    <Route path="property/township-collection/:townshipId" element={<TownshipCollectionSummary />} />
                                    <Route path="property/payment-entry" element={<PaymentEntry />} />
                                    <Route path="property/hold-booking" element={<HoldBooking />} />
                                    <Route path="property/hold-report-booking" element={<HoldReportBooking />} />
                                    <Route path="property/associate-booking" element={<AssociateBooking />} />
                                    <Route path="property/associate-booking-request" element={<AssociateBookingList />} />
                                    <Route path="property/payment-history" element={<PaymentHistory />} />
                                    <Route path="property/payment-history/:id" element={<PaymentHistory />} />
                                    <Route path="property/refund-list" element={<RefundList />} />
                                    <Route path="property/reminder-save" element={<ReminderSave />} />
                                    <Route path="property/change-plot/:bookingId" element={<ChangePlot />} />
                                    <Route path="property/permission-test" element={<PermissionTest />} />
                                    <Route path="property/receipt-verification" element={<ReceiptVerification />} />
                                    <Route path="property/draft-requests" element={<DraftRequests />} />
                                    <Route path="property/allotment" element={<AllotmentList />} />
                                    <Route path="notifications" element={<Notifications />} />
                                    <Route path="property/notifications" element={<Notifications />} />
                                       <Route path="notification/list/:priority" element={<NotificationList />} />
                                    <Route path="property/:id" element={<BookingDetail />} />
                                    <Route path="staff-list" element={<StaffList />} />
                                    <Route path="team-list" element={<TeamList />} />
                                    <Route path="generate-receipt" element={<GenerateReceipt />} />
                                    <Route path="settings" element={<Settings />} />

                                    <Route path="associate-list" element={<AssociateList />} />
                                    <Route path="master/reserve-funds" element={<ReserveFunds />} />
                                     <Route path="master/document-types" element={<DocumentTypes />} />
                                       <Route path="master/banks" element={<Banks />} />
                                    <Route
                                        path="booking-summery-report/:id"
                                        element={<BookingSummeryReport />}
                                    />
                                    <Route path="admin/closure-requests" element={<ClosureRequests />} />
                               
                                    <Route path="/property/township-funds" element={<TownshipFunds />} />
                                    <Route path="property/client-list" element={<ClientList />} />
                                      <Route path="accounts/heads" element={<HeadList />} />    
                                      <Route path="accounts/tds-entry" element={<TdsEntry />} />
                                      <Route path="accounts/tds-list" element={<TdsList />} />
                                      <Route path="accounts/payment-entry" element={<AccountPaymentEntry />} />
                                        <Route path="accounts/transaction-list" element={<TransactionList />} />
                                      
                                      <Route path="accounts/ledger/:id" element={<Ledger />} />
                                        <Route path="support/ticket-list" element={<TicketList />} />
                                        <Route path="support/create-ticket" element={<CreateTicket />} />
                                        <Route path="reports/expired-rera-list/:townshipId" element={<ExpiredReraList />} />
                                        <Route path="reports/closure-report" element={<ClosureReport />} />
                                        <Route path="reports/booking-report" element={<BookingReport />} />
                                        <Route path="associate/associate-booking-requests" element={<AssociateBookingRequests />} />
                                            <Route path="associate/associate-document-verify" element={<AssociateDocumentVerifyRequests />} />
                                            <Route path="admin/process-stage" element={<ProcessStage />} />
                                            <Route path="reports/tds-report" element={<TDSReport />} />
                                            <Route path="township/add" element={<TownshipForm />} />
<Route path="township/edit/:id" element={<TownshipForm />} />
<Route path="accounts/daily-balance-update" element={<DailyBalanceUpdate />} />
                                {/* <Route
                                    index
                                    element={<RootRedirect />}
                                /> */}
                            </Route>
                         
                    </Route>

                    <Route
                        path="*"
                        element={
                            isAuthenticated()
                                ? <Navigate to="/" />
                                : <Navigate to="/login" />
                        }
                    />

                </Routes>
            </Router>
        </>
    );
}

export default App;
