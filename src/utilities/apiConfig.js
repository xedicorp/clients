// API endpoints configuration
// These endpoints will be prefixed with baseURL from axiosInstance
// In dev: /api (proxied by Vite to https://api.rajbhoomi.co.in)
// In prod: /api (rewritten by Vercel to https://api.rajbhoomi.co.in)
export const API_BASE_URL = "https://adminapi.xedicorporation.com";

const API_ENDPOINTS = {
    LOGO_SCREEN: '/Master/AppSettings',
    TOWNSHIP_LIST: '/Township/List',
    TOWNSHIP_SAVE: '/Township/Save', // POST - Save/Add new township
    TOWNSHIP_UPDATE: '/Township/Update', // PUT - Update existing township
    TOWNSHIP_DELETE: '/Township/Delete', // DELETE - Delete township by ID
    UPLOAD_INVENTORY: '/Township/UploadInventory', // POST - Upload inventory for a township
    BOOKING_LIST: '/Booking/List',
    BOOKING_SEARCH: '/Booking/Search', // GET - Search bookings with parameters
    BOOKING_SAVE: '/Booking/Save',
    BOOKING_GET_BY_ID: '/Booking/GetById',
    ASSOCIATE_LIST: '/Associate/GetList',
    ASSOCIATE_CREATE: '/Associate/Save',
    ASSOCIATE_UPDATE: '/Associate/Update',
    ASSOCIATE_DELETE: '/Associate/Delete',
    GET_ASSOCIATE_BY_RERA: '/Associate/GetByRera', // GET - Get associate details by RERA number
    GET_BOOKING_REQUESTS: '/Associate/booking-requests',
    APPROVE_REJECT_BOOKING_REQUEST:'/Associate/approve-reject-booking-request',
    GET_DOCUMENT_VERIFY_REQUESTS: '/Associate/user-document-requests/getAll',
    APPROVE_REJECT_DOCUMENT_REQUEST: '/Associate/update-user-document-status',
    EXPIRED_RERA_LIST: '/Associate/expired-licenses',
    BOOKING_STATUS_TYPE_LIST: 'Master/BookingStatusTypes',
    BOOKING_STATUS_CHANGE: '/Booking/change-status', // POST - Change booking status with reason
    GET_BOOKING_BY_ID: '/Booking/GetById', // GET - Get booking details by ID
    UPDATE_INITIAL_PAYMENT: '/Booking/UpdateInitialPayment', // POST - Update initial payment for booking
    UPDATE_LOGIN_STATUS: '/Booking/UpdateLoginStatus',
    UPDATE_DRAFT_PREPARATION_STATUS: '/Booking/UpdateDraftPerparationStatus',
    SEND_TO_DRAFT: '/Booking/SendToDraft',
    GET_DRAFT_REQUESTS: '/Booking/GetDraftRequests',
    MARK_DRAFT_COMPLETE: '/Booking/MarkDraftComplete', // POST - Mark draft as complete
    UPDATE_LOAN_SANCTION_STATUS: '/Booking/UpdateLoanSanctionStatus',
    ADD_REMARK: '/Booking/add-remark',
    GET_DOCUMENTS_BY_BOOKING_ID: '/Document/GetAllByBookingId',
    UPLOAD_DOCUMENT: '/Document/Upload',
    UPDATE_DOCUMENT_BY_ID: '/Document/Update', // PUT - Update document by ID
    DELETE_DOCUMENT_BY_ID: '/Document/Delete', // DELETE - Delete document by ID
    DOWNLOAD_DOCUMENT: '/Document/Download', // GET - Download document by ID
    PLOTS_LIST: '/Plot/List',
    PLOT_GET_BY_ID: '/Plot/GetById',
    PLOT_SAVE: '/Plot/Save', // POST - Save/Add new plot
    PLOT_DELETE: '/Plot/Delete', // DELETE - Delete plot by ID
    PLOT_HOLD_LIST: '/Plot/Hold/List', // GET - Get list of hold plots by townshipId
    DOCUMENT_TYPES: '/Master/DocumentTypes',
    DOCUMENT_TYPE_BY_ID: '/Master/DocumentTypes/GetById', // GET - Get document type by ID
    DOCUMENT_TYPES_SAVE: '/Master/DocumentTypes/Save', // POST - Save/Add new document type
    DOCUMENT_TYPES_DELETE: '/Master/DocumentTypes', // DELETE - Delete document type by ID
    RECEIPT_LIST: '/Receipt/List',
    PLOT_HOLD: '/Plot/Hold',
    // Get receipts by bookingId (e.g. /Receipt/ListByBookingId?bookingId=22)
    RECEIPT_LIST_BY_BOOKING_ID: '/Receipt/ListByBookingId',
    RECEIPT_SAVE: '/Receipt/Save',
    RECEIPT_DELETE: '/Receipt/Delete', // DELETE - Delete receipt by ID
    RECEIPT_VERIFICATION_REQUESTS: '/Receipt/VerificationRequests', // GET - Get all receipts pending verification
    RECEIPT_VERIFY: '/Receipt/Verify', // POST - Verify a receipt (approve or reject)
    RECEIPT_SEND_VERIF_REQUEST: '/Receipt/SendVerifRequest', // POST - Send receipt for verification
    RECEIPT_BY_ID:'Receipt/GetById',
    RECEIPT_UPDATE: '/Receipt/update-receipt', // POST - Update receipt date
    REJECT_RECEIPT: '/Receipt/Reject', // POST - Reject a receipt
    UPDATE_MARK_FILE_CHECK_STATUS: '/Booking/UpdateMarkFileCheckStatus',
    UPLOAD_ORIGINAL_ATT_REQUEST: '/Booking/UploadOriginalATTRequest',
    UPLOAD_BANK_DD: '/Booking/UploadBankDD',
    UPDATE_DOKIT_SIGNING_STATUS: '/Booking/UpdateDokitSigningStatus',
    UPDATE_JDA_PATTA_STATUS: '/Booking/UpdateJDAPattaStatus',
    UPDATE_BANK_DD_STATUS: '/Booking/UpdateBankDDStatus',
    CANCEL_BOOKING: '/Booking/Cancel', // POST - Cancel booking with reason
    CHANGE_PLOT: '/Booking/ChangePlot', // POST - Change plot for booking
    GET_BOOKING_PROGRESS: '/Booking/GetBookingProgress', // GET - Get booking progress by bookingId
    WEATHER_FORECAST: '/WeatherForecast',
    TOWNSHIP_COLLECTION_SUMMARY: '/Report/TownshipCollectionSummaryReport', // GET - Get township collection summary by townshipId
    TOWNSHIP_COLLECTION_DETAIL: '/Report/TownshipCollectionDetailReport',
  
    PLOT_TYPES: '/Master/PlotTypes', // GET - Get all plot types
    PLOT_SHAPE_TYPES: '/Master/PlotShapeTypes',
    USER_LIST: '/Identity/UserList', // GET - Get list of users with their roles
    STAFF_LIST: '/Staff/GetList',
    DELETE_STAFF: '/Staff/Delete',
    SAVE_STAFF: '/Staff/Save',
    TEAM_LIST: '/teams/GetList', // GET - Get list of users with their roles
    SAVE_TEAM: '/teams/Save',
    DELETE_TEAM: '/teams/Delete',
    ASSIGN_TEAM_TO_STAFF: '/teams/AssignStaff',
    ASSIGN_ASSOCIATE_TO_TEAM: '/teams/AssignAssociates',
    ASSIGN_PLOT_TO_TEAM: '/teams/AssignPlots',
    GET_TOWNSHIP_LIST: '/Township/List',
    GET_PLOTS_BY_TOWNSHIP_ID: "/Plot/List",
    GET_TEAM_BY_ID: '/teams/GetById',
    ROLE_LIST: '/Identity/RoleList', // GET - Get list of roles
    ROLE_PERMISSIONS: '/Identity/RolePermissions', // GET - Get permissions for a role
    SAVE_ROLE_PERMISSIONS: '/Identity/SaveRolePermissions', // POST - Save role permissions
    USER_TOWNSHIPS: '/Identity/UserTownships', // GET - Get townships assigned to a user (requires userId parameter)
    CHANGE_PASSWORD:'/Identity/ChangePassword',
    SUPPORT_CHANGE_PASSWORD:'/Identity/SupportChangePassword',
    ASSIGN_USER_TOWNSHIPS: '/Identity/AssignUserTownships', // POST - Assign townships to a user
    REMINDER_LIST: '/Reminder/List',
    REMINDER_LIST_BY_USER_ID: '/Reminder/GetByBookingId', // GET - Get reminders for a user
    REMINDER_SAVE: '/Reminder/Save', // POST - Save or update a reminder
    REMINDER_DELETE: '/Reminder/Delete', // DELETE - Delete a reminder
    REMINDER_DISMISS: '/Reminder/Dismiss', // POST - Dismiss a reminder
    GET_FOLLOWUP_BY_BOOKING_ID: '/Followup/GetByBookingId', // GET - Get followups by bookingId
    FOLLOWUP_SAVE: '/Followup/Save', // POST - Save or update a followup
    FOLLOWUP_DELETE: '/Followup/Delete', // DELETE - Delete a followup
    REFUND_LIST: '/Refund/List', // GET - Get list of refunds
    REFUND_SAVE: '/Refund/Save', // POST - Save or update a refund
    REFUND_DELETE: '/Refund/Delete', // DELETE - Delete a refund by ID
    REFUND_SAVE_STATUS: '/Refund/SaveStatus', // POST - Save refund status
    REFUND_STATUS_LOGS: '/Refund/StatusLogs', // GET - Get refund status logs
    DOCUMENT_DOWNLOAD: '/Document/Download', // GET - Download document by ID
    ALLOTMENTS: '/Allotment/List', // GET - Get list of allotments
    ALLOTMENT_BY_ID: '/Allotment/GetById', // GET - Get allotment details by ID
    ALLOTMENT_MARK_DRAFT_COMPLETE: '/Allotment/MarkDraftComplete', // POST - Mark allotment draft as complete
    MARK_ALLOTMENT_LETTER_COMPLETE: '/Booking/MarkAllotmentLetterComplete', // POST - Mark allotment letter as complete
    SEND_FOR_ALLOTMENT_LETTER: '/Booking/SendForAllotmentLetter', // POST - Send booking for allotment letter
    GET_ALLOTMENT_LETTER_REQUESTS: '/Booking/GetAllotmentLetterRequests', // GET - Get allotment letter requests
     AVAILABILITY_REPORT: '/report/plot-availability',
    FACING_TYPES: '/Master/FacingTypes', // GET - Get all facing types
    CREATE_USER: '/Identity/CreateUser',
    UPDATE_USER: '/Identity/UpdateUser',
    TOGGLE_USER: '/Identity/ToggleUser',
    // ===== Reserve Fund =====
    RESERVEFUND_LIST: '/ReserveFund/GetList',
    RESERVEFUND_GET_BY_ID: '/ReserveFund/GetById',
    RESERVEFUND_SAVE: '/ReserveFund/Save',
    RESERVEFUND_DELETE: '/ReserveFund/Delete',

    // ===== Township Reserve Fund =====
    TOWNSHIP_FUNDS_LIST: '/ReserveFund/TownshipFunds/GetAll',
    TOWNSHIP_FUNDS_GET_BY_ID: '/ReserveFund/TownshipFunds/GetById',
    TOWNSHIP_FUNDS_SAVE: '/ReserveFund/TownshipFunds/Save',
    TOWNSHIP_FUNDS_DELETE: '/ReserveFund/TownshipFunds/Delete',

    CLOSURE_VALIDATION: "/Booking/closure-validation",
    SEND_FOR_CLOSURE :"/Booking/SendForCloserRequest",
    CLOSURE_REQUEST_LIST: '/Booking/GetCloserRequests',
    APPROVE_REJECT_CLOSURE_REQUEST: '/Booking/ApproveRejectClosureRequest',
    NOTIFICATION_LIST: '/Notification/List',
     DASHBOARD_GET: '/Dashboard/Get',
      DASHBOARD_GET_V1: '/Dashboard/Get_v1',
    UPDATE_LOCR_CLEARANCE_STATUS: '/Booking/UpdateOCRClearanceStatus',

     // ===== Master =====
       BANK_LIST: '/Master/Banks',
       BANK_GET_BY_ID: '/Master/Banks/GetById',
       BANK_SAVE: '/Master/Banks/Save',
       BANK_DELETE: '/Master/Banks/Delete',
       // ===== Reports =====
           TOWNSHIP_HEALTH_REPORT: '/Report/TownshipHealthReport', // GET - Get township health report by townshipId
    PROGRESS_SUMMARY_REPORT:"/Report/Progress-Summary-Report",
    DAILY_COMPREHENSIVE_REPORT:"/Report/daily-comprehensive-report",
    MANAGEMENT_STATUS_REPORT:"/Report/management-status-report",

       TDS_ENTRY: '/Receipt/tds-entry', // POST - Create adjustment entry
       TDS_LIST: '/Account/GetTdsList', // GET - Get list of TDS entries
       CANCELLED_BOOKING_REPORT:"/Report/cancelled-bookings-report",

        HEAD_LIST: '/Account/GetAccountHeadList', // GET - Get list of Account Heads
         TRANSACTIONMODE_LIST: '/Account/GetTransactionModes',
         SAVE_PAYMENT: '/Account/SavePayment',
       TRANSACTIONS_BY_BOOKINGID: '/Account/TransactionsByBookingId',
       
       RECEIPT_DELETE: '/Receipt/Delete', // POST - delete a receipt (approve or reject)
         TRANSACTION_LIST: '/Account/transactionsList', // POST - delete a transaction (approve or reject)
        TRANSACTION_DELETE: '/Account/delete-transaction', // POST - delete a transaction (approve or reject)

       // ===== Settings =====
        SETTING_GET_ALL:'/api/Setting/GetAll',
        SETTING_SAVE:'/api/Setting/Save',
        SETTING_GET_BY_KEY:'/api/Setting/GetByKey',

        // ===== ProgressStage =====
        PROGRESS_STAGE_LIST: '/ProgressStage/GetAll', // GET - Get all progress stages
        PROGRESS_STAGE_GET_BY_ID: '/ProgressStage/GetById', // GET - Get progress stage by ID
        PROGRESS_STAGE_SAVE: '/ProgressStage/Save', // POST - Save or update a progress stage
        PROGRESS_STAGE_DELETE: '/ProgressStage/Delete', // DELETE - Delete a progress stage by ID

        DELAYED_BOOKINGS:"/Booking/GetDelayedBookings",
        GET_TEMPLATE:"/Template/GetById",
        GET_TEMPLATES:"/Template/List",
        SAVE_TEMPLATES: "/Template/Save",
        LEDGER: '/Account/ledger', // Get - Get ledger details by account head ID

SUPPORT_TICKET_SAVE: '/Support/SaveTicket',
SUPPORT_TICKET_LIST: '/Support/GetTickets',
SUPPORT_TICKET_BY_ID: '/Support/GetTicketById',
ASSOCIATE_TOGGLE_STATUS: '/Associate/ToggleStatus', // POST - Toggle associate active/inactive status
SEND_FOR_FILE_CHECK: '/Booking/SendForFileCheck', // POST - Send booking for file check
UPDATE_MARK_FILE_CHECK_STATUS: '/Booking/UpdateMarkFileCheckStatus' ,// POST - Update mark file check status
TOWNSHIP_BANKS: '/Township/GetTownshipBanks',
ACCOUNT_UPDATE_DAILY_BALANCE: '/Account/UpdateDailyBalance',


GET_CLIENT_INVOICES: "/Invoice/GetByClientId",
DOWNLOAD_INVOICE: "/Invoice/download",
          };

export default API_ENDPOINTS;
        