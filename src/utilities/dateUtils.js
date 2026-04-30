/**
 * Date utility functions for formatting and converting dates
 */

const toDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    // Handle YYYY-MM-DD format (local date)
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [y, m, d] = trimmed.split("-").map(Number);
      return new Date(y, m - 1, d);
    }

    // Handle ISO strings with timezone info
    const hasTimezone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(trimmed);
    const isIsoLike = /^\d{4}-\d{2}-\d{2}T/.test(trimmed);
    
    if (isIsoLike && !hasTimezone) {
      // If it's an ISO-like string without timezone, treat as local time
      // Don't add 'Z' to avoid UTC conversion issues
      return new Date(trimmed);
    }

    // Handle other date formats
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }

    return null;
  }

  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * Formats a date for display purposes
 * @param {Date|string} date - The date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDisplayDate = (date, options = {}) => {
  if (!date) return "";
  
  const dateObj = toDate(date);
  
  if (!dateObj || isNaN(dateObj.getTime())) {
    return "";
  }

  const defaultOptions = {
    year: "numeric",
    month: "short",
    day: "2-digit",
    timeZone: 'Asia/Kolkata', // Ensure consistent timezone for Indian users
    ...options
  };

  return dateObj.toLocaleDateString("en-IN", defaultOptions);
};

/**
 * Converts a date to local ISO string format (YYYY-MM-DD)
 * @param {Date|string} date - The date to convert
 * @returns {string} ISO date string in local timezone
 */
export const toLocalIsoDate = (date) => {
  if (!date) return "";
  
  const dateObj = toDate(date);
  
  if (!dateObj || isNaN(dateObj.getTime())) {
    return "";
  }

  // Get local date components
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  
  return `${year}-${month}-${day}`;
};

/**
 * Formats a date and time for display
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (date) => {
  if (!date) return "";
  
  const dateObj = toDate(date);
  
  if (!dateObj || isNaN(dateObj.getTime())) {
    return "";
  }

  return dateObj.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short", 
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: 'Asia/Kolkata'
  });
};

/**
 * Formats time only for display
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted time string
 */
export const formatTimeDisplay = (date) => {
  if (!date) return "";
  
  const dateObj = toDate(date);
  
  if (!dateObj || isNaN(dateObj.getTime())) {
    return "";
  }

  return dateObj.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: 'Asia/Kolkata'
  });
};

/**
 * Gets the current date in ISO format
 * @returns {string} Current date in YYYY-MM-DD format
 */
export const getCurrentDate = () => {
  return toLocalIsoDate(new Date());
};

/**
 * Checks if a date is today
 * @param {Date|string} date - The date to check
 * @returns {boolean} True if the date is today
 */
export const isToday = (date) => {
  if (!date) return false;
  
  const dateObj = toDate(date);
  const today = new Date();
  
  if (!dateObj || isNaN(dateObj.getTime())) return false;

  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
};

/**
 * Formats a date from API response to input field format (YYYY-MM-DD)
 * This function handles timezone issues by using local date components
 * @param {Date|string} dateValue - The date value from API
 * @returns {string} Formatted date string for input fields
 */
export const formatDateForInput = (dateValue) => {
  if (!dateValue) return "";
  
  const dateObj = toDate(dateValue);
  if (!dateObj || isNaN(dateObj.getTime())) return "";
  
  // Use local date components to avoid timezone issues
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};
