import getCurrentUser from "./getCurrentUser";

export const PERMISSIONS = {
    CAN_MARK_FILE_COMPLETED: "CanMarkFileCompleted",
    CAN_CREATE_BOOKING: "CanCreateBooking",
    CAN_MANAGE_TOWNSHIPS: "CanManageTownships",
    CAN_EDIT_BOOKING: "CanEditBooking",
    CAN_VERIFY_RECEIPTS: "CanVerifyReceipts",
    CAN_CREATE_DRAFT: "CanCreateDraft",
    CAN_VIEW_ALLOTMENT_LETTER_REQUESTS: "CanViewAllotmentLetterRequests",
    CAN_SEND_FOR_AGREEMENT: "",
    CAN_RECEIVE_PAYMENT: "CanReceivePayment",
    CAN_CANCEL_BOOKING: "CanCancelBooking",
    CAN_VIEW_FILE_PROGRESS: "CanViewFileProgress",
    CAN_CHANGE_PLOT: "CanChangePlot",
    CAN_VIEW_REPORTS: "CanViewReports",
    CAN_VIEW_PAYMENT_HISTORY: "CanViewPaymentHistory",
    CAN_VIEW_REMINDER: "CanViewReminder",
    CAN_UPDATE_JDA_FILE: "CanUpdateJDAFile",
    CAN_MANAGE_USERS: "CanManageUsers",
    CAN_MANAGE_ROLE_PERMISSIONS: "CanManageRolePermissions",
    CAN_MANAGE_REFUNDS: "CanManageRefunds",
    CAN_ACCESS_ADMIN: "CanAccessAdmin",
    // Additional permissions for new buttons
    CAN_UPLOAD_BANK_DD: "CanUploadBankDD",
    CAN_UPDATE_BANK_DD: "CanUpdateBankDD",
    CAN_DOKIT_SIGNING: "CanDokitSigning",
    CAN_UPLOAD_LOAN_DOCUMENT: "CanUploadLoanDocument",
    CAN_LOAN_SANCTION_STATUS: "CanLoanSanctionStatus",
    CAN_UPLOAD_RECEIPT: "CanUploadReceipt",
    CAN_HOLD_BOOKING: "CanHoldBooking",
    CAN_MANAGE_MASTERS: "CanManageMasters",
    CAN_VIEW_SETTINGS: "CanViewSettings",
    CAN_EDIT_SETTINGS: "CanEditSettings",
    CAN_MANAGE_STAFF: "CanManageStaff",
    CAN_MANAGE_TEAMS: "CanManageTeams",
    CAN_MANAGE_ASSOCIATES:"CanManageAssociates",
    CAN_VIEW_DRAFT_REQUESTS:"CanViewDraftRequests",
    CAN_MANAGE_ACCOUNTS:"CanManageAccounts",
    CAN_EDIT_RECEIPT_DATE: "CanEditReceiptDate",
    CAN_REOPEN_BOOKING: "CanReopenBooking",

};

const hasPermission = (permissionName) => { 
    // Get user data from localStorage which includes permissions from API
    const user = getCurrentUser();
    
    // Log for debugging
    // console.log('Checking permission:', permissionName, 'for user:', user);
    
    // If no user data, deny permission
    if (!user) return false;
    
    // Try to get permissions from user object first
    let permissions = user.permissions;
    
    // If not in user object, try to get from localStorage directly
    if (!permissions || !Array.isArray(permissions)) {
        try {
            const permissionsStr = localStorage.getItem("spendwise_permissions");
            if (permissionsStr) {
                permissions = JSON.parse(permissionsStr);
            }
        } catch (e) {
            console.error('Error parsing permissions from localStorage:', e);
        }
    }
    
    // If still no permissions array, deny permission
    if (!permissions || !Array.isArray(permissions)) return false;
    
    // Check if the permission exists and is assigned (isAssigned: true)
    return permissions.some(
        (perm) => perm.name === permissionName && perm.isAssigned === true
    );
};

export default hasPermission;
