/**
 * Utility to clean up localStorage for bank demand drafts
 * Removes base64 file data to prevent quota exceeded errors
 */

export const cleanupBankDDStorage = () => {
    try {
        const keysToClean = [];
        
        // Find all bank_demand_drafts keys
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('bank_demand_drafts_')) {
                keysToClean.push(key);
            }
        }
        
        let totalCleaned = 0;
        let totalErrors = 0;
        
        keysToClean.forEach(key => {
            try {
                const data = JSON.parse(localStorage.getItem(key) || "[]");
                
                // Remove base64 data and keep only metadata
                const cleanedData = data.map(dd => ({
                    bookingId: dd.bookingId,
                    ddPhotoName: dd.ddPhotoName,
                    ddNo: dd.ddNo,
                    ddAmount: dd.ddAmount,
                    ddNotes: dd.ddNotes,
                    uploadedAt: dd.uploadedAt,
                    fileType: dd.fileType,
                    // Keep only URL, remove base64 data
                    fileUrl: dd.fileUrl || dd.apiResponse?.url || null
                }));
                
                localStorage.setItem(key, JSON.stringify(cleanedData));
                totalCleaned++;
            } catch (error) {
                console.error(`Error cleaning ${key}:`, error);
                totalErrors++;
            }
        });
        
        // console.log(`✅ Cleaned ${totalCleaned} bank DD storage keys`);
        if (totalErrors > 0) {
            console.warn(`⚠️ ${totalErrors} keys had errors during cleanup`);
        }
        
        return {
            success: true,
            cleaned: totalCleaned,
            errors: totalErrors
        };
    } catch (error) {
        console.error('Error during cleanup:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Get current localStorage usage statistics
 */
export const getStorageStats = () => {
    try {
        let totalSize = 0;
        const stats = {};
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                const value = localStorage.getItem(key) || '';
                const size = new Blob([value]).size;
                totalSize += size;
                
                if (key.startsWith('bank_demand_drafts_')) {
                    stats[key] = {
                        size: size,
                        sizeKB: (size / 1024).toFixed(2),
                        records: JSON.parse(value || "[]").length
                    };
                }
            }
        }
        
        return {
            totalSizeKB: (totalSize / 1024).toFixed(2),
            totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
            bankDDKeys: stats
        };
    } catch (error) {
        console.error('Error getting storage stats:', error);
        return null;
    }
};
