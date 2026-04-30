/**
 * Utility functions for booking permissions and age checks
 */

/**
 * Check if a booking is considered "old" (older than 30 days)
 * @param {string|Date} bookingDate - The booking date
 * @returns {boolean} - True if booking is older than 30 days
 */
export const isBookingOld = (bookingDate) => {
  if (!bookingDate) return false;
  const bookingDateObj = new Date(bookingDate);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return bookingDateObj < thirtyDaysAgo;
};

/**
 * Check if a user can edit a specific booking based on role and booking age
 * @param {Object} booking - The booking object
 * @param {string} userRole - The user's role (from localStorage)
 * @returns {boolean} - True if user can edit the booking
 */
export const canEditBooking = (booking, userRole = null) => {
  if (!booking) return false;
  
  const role = userRole || (localStorage.getItem("spendwise_role") || "").toLowerCase();
  
  // JDA File Admin cannot edit any bookings
  if (role === 'jda_file_admin') {
    return false;
  }
  
  const isOldBooking = isBookingOld(booking.bookingDate || booking.createdAt || booking.rawDate);
  
  if (isOldBooking) {
    return role === "loan_admin";
  }
  
  // For new bookings (<30 days), allow admin, superadmin, loan_admin, and loan_manager
  return ['admin', 'superadmin', 'loan_admin', 'loan_manager'].includes(role);
};

/**
 * Get the number of days since a booking was created
 * @param {string|Date} bookingDate - The booking date
 * @returns {number} - Number of days since booking creation
 */
export const getBookingAge = (bookingDate) => {
  if (!bookingDate) return 0;
  const bookingDateObj = new Date(bookingDate);
  const today = new Date();
  const diffTime = Math.abs(today - bookingDateObj);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Get a human-readable description of booking edit permissions
 * @param {Object} booking - The booking object
 * @param {string} userRole - The user's role
 * @returns {Object} - Object with permission status and message
 */
export const getEditPermissionInfo = (booking, userRole = null) => {
  const role = userRole || (localStorage.getItem("spendwise_role") || "").toLowerCase();
  const isOldBooking = isBookingOld(booking.bookingDate || booking.createdAt || booking.rawDate);
  const canEdit = canEditBooking(booking, role);
  const age = getBookingAge(booking.bookingDate || booking.createdAt || booking.rawDate);
  
  return {
    canEdit,
    isOldBooking,
    age,
    message: isOldBooking 
      ? `Old booking (${age} days) - Loan Admin only`
      : canEdit 
        ? `Can edit (${age} days old)`
        : "No edit permission"
  };
};
