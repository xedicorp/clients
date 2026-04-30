/**
 * Workflow Utilities
 * Centralized functions for handling workflowTypeId and workflowCode consistency
 */

// Standard workflow mapping
export const WORKFLOW_TYPES = {
  WITH_LOAN: 1,
  WITHOUT_LOAN: 2,
  WITHOUT_7DAY_CLOSED: 3,
};

export const WORKFLOW_CODES = {
  1: 'WITH_LOAN',
  2: 'WITHOUT_LOAN', 
  3: 'WITHOUT_7DAY_CLOSED',
};

export const WORKFLOW_DISPLAY_NAMES = {
  WITH_LOAN: 'Loan',
  WITHOUT_LOAN: 'Without Loan',
  WITHOUT_7DAY_CLOSED: '7 Day Closed',
  FAST_CLOSE: '7 Day Closed',
  AGREEMENT_REGISTRY_PROCESS: 'Agreement Registry',
  plot_changed: 'Plot Changed',
  booking_created: 'Booking Created',
  payment_pending: 'Payment Pending',
  payment_confirmed: 'Payment Confirmed',
  workflow_selected: 'Workflow Selected',
};

/**
 * Convert workflowTypeId to workflowCode
 * @param {number|string} workflowTypeId 
 * @returns {string|null}
 */
export const workflowIdToCode = (workflowTypeId) => {
  const id = Number(workflowTypeId);
  return WORKFLOW_CODES[id] || null;
};

/**
 * Convert workflowCode to workflowTypeId
 * @param {string} workflowCode 
 * @returns {number}
 */
export const workflowCodeToId = (workflowCode) => {
  return WORKFLOW_TYPES[workflowCode] || 2; // Default to WITHOUT_LOAN
};

/**
 * Normalize and validate workflowTypeId
 * Ensures it's always 1, 2, or 3
 * @param {any} value 
 * @returns {number}
 */
export const normalizeWorkflowTypeId = (value) => {
  const id = Number(value);
  if (id === 1 || id === 2 || id === 3) return id;
  return 2; // Default to WITHOUT_LOAN
};

/**
 * Determine workflow code from various possible API response fields
 * @param {object} item - API response item
 * @returns {string}
 */
export const determineWorkflowCode = (item) => {
  // Check for nested workflow object
  if (item.workflow && item.workflow.code) return item.workflow.code;

  // Check workflowTypeId first
  const wfIdRaw = item.workflowTypeId ?? item.WorkflowTypeId ?? item.workflowTypeID ?? item.WorkflowTypeID;
  const wfId = Number(wfIdRaw);
  if (wfId === 1 || wfId === 2 || wfId === 3) return workflowIdToCode(wfId);

  // Normalize workflow type/code from various possible fields
  const rawWf = item.workflowCode || item.WorkflowCode ||
    item.workflowType || item.WorkflowType ||
    item.workflowTypeId || item.WorkflowTypeId ||
    item.bookingType || item.BookingType ||
    item.type || item.Type || "";

  const wf = String(rawWf).trim().toUpperCase();

  // Handle numeric values (API might send 1/2/3)
  if (wf === "1") return "WITH_LOAN";
  if (wf === "2") return "WITHOUT_LOAN";
  if (wf === "3") return "WITHOUT_7DAY_CLOSED";

  // Handle string codes/flags
  if (wf.includes("WITH_LOAN") || wf.includes("WITH LOAN")) return "WITH_LOAN";
  if (wf.includes("WITHOUT_LOAN") || wf.includes("WITHOUT LOAN")) return "WITHOUT_LOAN";

  // Check boolean flags with loose equality
  if (item.loanRequired == true || String(item.loanRequired).toLowerCase() === 'true' ||
    item.LoanRequired == true || String(item.LoanRequired).toLowerCase() === 'true') {
    return "WITH_LOAN";
  }

  if (wf === "FAST_CLOSE" || wf === "WITHOUT_7DAY_CLOSED" ||
    item.quickClose == true || String(item.quickClose).toLowerCase() === 'true' ||
    item.QuickClose == true || String(item.QuickClose).toLowerCase() === 'true') {
    return "WITHOUT_7DAY_CLOSED";
  }

  if (wf === "AGREEMENT_REGISTRY" || wf === "AGREEMENT_REGISTRY_PROCESS") return "AGREEMENT_REGISTRY_PROCESS";

  // Default fallback
  return "WITHOUT_LOAN";
};

/**
 * Get display name for workflow or status
 * @param {string} workflowCodeOrStatus 
 * @returns {string}
 */
export const getWorkflowDisplayName = (workflowCodeOrStatus) => {
  // If it's a workflow code, return its display name
  if (WORKFLOW_DISPLAY_NAMES[workflowCodeOrStatus]) {
    return WORKFLOW_DISPLAY_NAMES[workflowCodeOrStatus];
  }
  
  // If it's booking_created status, show "Without Loan" as default workflow
  if (workflowCodeOrStatus === 'booking_created') {
    return 'Without Loan';
  }
  
  // For other statuses, return the display name or default to "Without Loan"
  return WORKFLOW_DISPLAY_NAMES[workflowCodeOrStatus] || 'Without Loan';
};

/**
 * Get CSS class for workflow badge or status
 * @param {string} workflowCodeOrStatus 
 * @returns {string}
 */
export const getWorkflowBadgeClass = (workflowCodeOrStatus) => {
  const workflowMap = {
    WITH_LOAN: "status-with-loan",
    WITHOUT_LOAN: "status-without-loan",
    WITHOUT_7DAY_CLOSED: "status-fast-close",
    FAST_CLOSE: "status-fast-close",
    AGREEMENT_REGISTRY_PROCESS: "status-agreement-registry",
    booking_created: "status-new",
    payment_pending: "status-payment-pending",
    payment_confirmed: "status-payment-confirmed",
    workflow_selected: "status-workflow-selected",
    plot_changed: "status-plot-changed"
  };
  return `booking-status-badge ${workflowMap[workflowCodeOrStatus] || "status-new"}`;
};

/**
 * Validate and fix booking data workflow fields
 * @param {object} booking 
 * @returns {object} Fixed booking data
 */
export const fixBookingWorkflowData = (booking) => {
  const workflowCode = determineWorkflowCode(booking);
  const workflowTypeId = workflowCodeToId(workflowCode);
  
  return {
    ...booking,
    workflowCode,
    workflowTypeId,
  };
};