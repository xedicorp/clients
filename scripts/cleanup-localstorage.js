/**
 * Cleanup Script for Bank DD LocalStorage
 * 
 * This script removes base64 file data from localStorage to fix quota exceeded errors.
 * Run this in the browser console if you're experiencing localStorage quota issues.
 * 
 * Usage:
 * 1. Open browser DevTools (F12)
 * 2. Go to Console tab
 * 3. Copy and paste this entire script
 * 4. Press Enter
 */

(function cleanupBankDDLocalStorage() {
    console.log('🧹 Starting Bank DD localStorage cleanup...');
    
    let totalCleaned = 0;
    let totalSizeBefore = 0;
    let totalSizeAfter = 0;
    
    // Get all localStorage keys
    const keys = Object.keys(localStorage);
    
    // Filter keys that match bank_demand_drafts pattern
    const bankDDKeys = keys.filter(key => key.startsWith('bank_demand_drafts_'));
    
    console.log(`Found ${bankDDKeys.length} bank DD records in localStorage`);
    
    bankDDKeys.forEach(key => {
        try {
            const data = localStorage.getItem(key);
            totalSizeBefore += data.length;
            
            const records = JSON.parse(data);
            
            // Remove fileDataURL from each record
            const cleanedRecords = records.map(record => {
                const { fileDataURL, ...rest } = record;
                return rest;
            });
            
            const cleanedData = JSON.stringify(cleanedRecords);
            totalSizeAfter += cleanedData.length;
            
            localStorage.setItem(key, cleanedData);
            totalCleaned++;
            
            console.log(`✅ Cleaned ${key}: ${(data.length / 1024).toFixed(2)}KB → ${(cleanedData.length / 1024).toFixed(2)}KB`);
        } catch (error) {
            console.error(`❌ Error cleaning ${key}:`, error);
        }
    });
    
    const savedSpace = totalSizeBefore - totalSizeAfter;
    
    console.log('\n📊 Cleanup Summary:');
    console.log(`   Records cleaned: ${totalCleaned}`);
    console.log(`   Space before: ${(totalSizeBefore / 1024).toFixed(2)}KB`);
    console.log(`   Space after: ${(totalSizeAfter / 1024).toFixed(2)}KB`);
    console.log(`   Space saved: ${(savedSpace / 1024).toFixed(2)}KB`);
    console.log('\n✨ Cleanup complete! Refresh the page to see the changes.');
})();
