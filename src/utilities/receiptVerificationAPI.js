/**
 * Receipt Verification API Utility
 * Handles sending receipts for verification
 */

import axiosInstance from './axiosInstance';
import API_ENDPOINTS from './apiConfig';
import Swal from 'sweetalert2';

/**
 * Send receipt verification request
 * @param {Object} params - Request parameters
 * @param {number} params.id - Request ID (usually 0)
 * @param {number} params.receiptId - Receipt ID to verify
 * @param {number} params.userId - User ID sending the request
 * @returns {Promise<Object>} Response object with success status
 */
export const sendReceiptVerificationRequest = async (params) => {
    try {
        const requestData = {
            id: params.id || 0,
            receiptId: params.receiptId,
            userId: params.userId
        };

        // console.log("Sending verification request:", requestData);

        const response = await axiosInstance.post(API_ENDPOINTS.RECEIPT_SEND_VERIF_REQUEST, requestData);
        
        // console.log("Verification request response:", response);

        return {
            success: true,
            data: response.data,
            message: "Receipt sent for verification successfully!"
        };
        
    } catch (error) {
        console.error("Error sending receipt for verification:", error);
        
        let errorMessage = "Failed to send receipt for verification. Please try again.";
        
        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.response?.status === 400) {
            errorMessage = "Invalid request data. Please check the receipt details.";
        } else if (error.response?.status === 403) {
            errorMessage = "You don't have permission to send receipts for verification.";
        } else if (error.response?.status === 404) {
            errorMessage = "Receipt not found. Please refresh and try again.";
        }
        
        return {
            success: false,
            error: errorMessage,
            details: error.response?.data
        };
    }
};

/**
 * Get current user ID from localStorage
 * @returns {number} Current user ID
 */
export const getCurrentUserId = () => {
    const userId = localStorage.getItem('spendwise_userId') || 
                   localStorage.getItem('userId') || 
                   localStorage.getItem('spendwise_user_id') || 
                   '5'; // Default fallback
    return parseInt(userId, 10);
};

/**
 * Simplified function to send verification request with automatic user ID detection
 * @param {number} receiptId - Receipt ID to verify
 * @param {number} id - Request ID (optional, defaults to 0)
 * @returns {Promise<Object>} Response object with success status
 */
export const sendVerificationRequest = async (receiptId, id = 0) => {
    const userId = getCurrentUserId();
    
    return await sendReceiptVerificationRequest({
        id,
        receiptId,
        userId
    });
};

/**
 * Send verification request with SweetAlert2 notifications
 * @param {number} receiptId - Receipt ID to verify
 * @param {Object} options - Options for customization
 * @param {boolean} options.showConfirmation - Show confirmation dialog (default: true)
 * @param {boolean} options.showSuccess - Show success notification (default: true)
 * @param {boolean} options.showError - Show error notification (default: true)
 * @returns {Promise<Object>} Response object with success status
 */
export const sendVerificationRequestWithNotifications = async (receiptId, options = {}) => {
    const {
        showConfirmation = true,
        showSuccess = true,
        showError = true
    } = options;

    // Show confirmation dialog
    if (showConfirmation) {
        const result = await Swal.fire({
            title: 'Send Receipt for Verification?',
            text: `Are you sure you want to send Receipt #${receiptId} for verification?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: 'var(--primary-color)',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Send for Verification',
            cancelButtonText: 'Cancel'
        });

        if (!result.isConfirmed) {
            return { success: false, cancelled: true };
        }
    }

    // Send the request
    const response = await sendVerificationRequest(receiptId);

    // Show notifications
    if (response.success && showSuccess) {
        await Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: response.message,
            confirmButtonColor: 'var(--primary-color)',
            timer: 3000,
            timerProgressBar: true
        });
    } else if (!response.success && showError) {
        await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.error,
            confirmButtonColor: 'var(--primary-color)'
        });
    }

    return response;
};

export default {
    sendReceiptVerificationRequest,
    getCurrentUserId,
    sendVerificationRequest,
    sendVerificationRequestWithNotifications
};