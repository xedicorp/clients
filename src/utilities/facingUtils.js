// Utility functions for handling plot facing data
import facingTypesService from './facingTypesAPI';

// Legacy facing map for backward compatibility
const FACING_MAP = {
    1: 'East',
    2: 'West',
    3: 'North',
    4: 'South',
    5: 'East - South',
    6: 'East - North',
    7: 'West - South',
    8: 'West - North',
    9: 'North - East',
    10: 'North - West',
    11: 'South - West',
    12: 'South - East',
    '1': 'East',
    '2': 'West',
    '3': 'North',
    '4': 'South',
    '5': 'East - South',
    '6': 'East - North',
    '7': 'West - South',
    '8': 'West - North',
    '9': 'North - East',
    '10': 'North - West',
    '11': 'South - West',
    '12': 'South - East'
};

// Cache for API-based facing mapping
let apiMappingCache = null;

/**
 * Get API-based facing mapping with caching
 * @returns {Promise<Object>} Object with idToName and nameToId mappings
 */
async function getApiMapping() {
    if (!apiMappingCache) {
        try {
            apiMappingCache = await facingTypesService.getFacingMapping();
        } catch (error) {
            console.warn('Failed to get API mapping, using fallback:', error);
            // Create mapping from legacy FACING_MAP
            const idToName = { ...FACING_MAP };
            const nameToId = {};
            Object.entries(FACING_MAP).forEach(([id, name]) => {
                if (!isNaN(id)) { // Only process numeric keys
                    nameToId[name.toLowerCase()] = parseInt(id);
                }
            });
            apiMappingCache = { idToName, nameToId };
        }
    }
    return apiMappingCache;
}

/**
 * Get plot facing display text from various possible field formats
 * Enhanced with API integration
 * @param {Object} item - The item (booking or plot) containing facing data
 * @returns {string} - The facing direction text or empty string
 */
export function getPlotFacing(item) {
    if (!item) return '';
    
    // 1. Try exact matches from a known list (fast path)
    const priorityFields = [
        'plotFacing', 'facing', 'facingName', 'FacingName', 
        'plotDirection', 'direction', 'plotFacingDirection', 'facingDirection',
        'facing_name', 'plot_facing', 'facing_direction',
        'plot.facing', 'plot.facingName', 'Plot.Facing', 'Plot.FacingName', 'Plot.facing',
        'Facing', 'Direction', 'PlotFacing', 'PlotDirection',
        'facingType', 'FacingType', 'plotFacingType', 'PlotFacingType',
        // Additional common field names
        'facingId', 'FacingId', 'plotFacingId', 'PlotFacingId',
        'facingCode', 'FacingCode', 'plotFacingCode', 'PlotFacingCode',
        'orientation', 'Orientation', 'plotOrientation', 'PlotOrientation'
    ];
    
    let facingValue = null;
    
    for (const field of priorityFields) {
        if (field.includes('.')) {
            const parts = field.split('.');
            let value = item;
            for (const part of parts) {
                value = value?.[part];
                if (value === undefined || value === null) break;
            }
            if (isValidFacing(value)) {
                facingValue = value;
                break;
            }
        } else {
            if (isValidFacing(item[field])) {
                facingValue = item[field];
                break;
            }
        }
    }

    // 2. If not found, try case-insensitive search on all keys (slow path but robust)
    if (!facingValue) {
        const keys = Object.keys(item);
        for (const key of keys) {
            if (/facing|direction|orientation/i.test(key)) {
                const value = item[key];
                if (isValidFacing(value)) {
                    facingValue = value;
                    break;
                }
            }
        }
    }
    
    // 3. Check for nested objects like 'Plot' or 'plot' if we're looking at a booking
    if (!facingValue) {
        const nestedKeys = ['plot', 'Plot', 'property', 'Property'];
        for (const nestedKey of nestedKeys) {
            if (item[nestedKey] && typeof item[nestedKey] === 'object') {
                const nestedFacing = getPlotFacing(item[nestedKey]);
                if (nestedFacing) {
                    return nestedFacing; // Recursively found it
                }
            }
        }
    }
    
    if (!facingValue) {
        // Debug logging for development
        if (import.meta.env.DEV) {
            // console.log('🔍 No facing found for item:', {
            //     keys: Object.keys(item),
            //     item: item
            // });
        }
        return '';
    }
    
    // Try API mapping first, then fallback to legacy mapping
    return resolveFacingValue(facingValue);
}

/**
 * Resolve facing value using API mapping or legacy mapping
 * @param {*} facingValue - The facing value to resolve
 * @returns {string} - Resolved facing name
 */
function resolveFacingValue(facingValue) {
    // Check legacy map first for immediate response
    if (FACING_MAP[facingValue]) {
        return FACING_MAP[facingValue];
    }
    
    // If it's already a string, return it (but clean it up)
    if (typeof facingValue === 'string' && facingValue.trim()) {
        const cleanFacing = facingValue.trim();
        const lowerFacing = cleanFacing.toLowerCase();
        const validFacings = new Set([
            'east', 'west', 'north', 'south',
            'northeast', 'northwest', 'southeast', 'southwest',
            'north-east', 'north-west', 'south-east', 'south-west',
            'east - south', 'east - north', 'west - south', 'west - north',
            'north - east', 'north - west', 'south - west', 'south - east',
            'east-south', 'east-north', 'west-south', 'west-north',
            'north-east', 'north-west', 'south-west', 'south-east'
        ]);
        if (validFacings.has(lowerFacing)) {
            return cleanFacing.replace(/\b([a-z])([a-z]*)\b/gi, (_, a, b) => a.toUpperCase() + b.toLowerCase());
        }
        return cleanFacing;
    }
    
    // If it's a number, try to map it
    if (typeof facingValue === 'number' || (!isNaN(facingValue) && !isNaN(parseFloat(facingValue)))) {
        const mapped = FACING_MAP[facingValue];
        if (mapped) {
            return mapped;
        }
        // If it's a number but not in our map, return it as string
        return String(facingValue);
    }
    
    // If it's an object, try to extract meaningful data
    if (typeof facingValue === 'object' && facingValue !== null) {
        const objFacing = facingValue.name || facingValue.value || facingValue.text || 
                         facingValue.facing || facingValue.direction || facingValue.label;
        if (objFacing) {
            return typeof objFacing === 'string' ? objFacing.trim() : FACING_MAP[objFacing] || String(objFacing);
        }
    }
    
    // Last resort: return the value as string
    return String(facingValue);
}

/**
 * Async version of getPlotFacing that uses API mapping
 * @param {Object} item - The item containing facing data
 * @returns {Promise<string>} - The facing direction text
 */
export async function getPlotFacingAsync(item) {
    if (!item) return '';
    
    // Get the raw facing value using the sync method
    const syncResult = getPlotFacing(item);
    if (syncResult) return syncResult;
    
    // If sync method didn't find anything, try API-based resolution
    try {
        const mapping = await getApiMapping();
        
        // Try to find facing ID in the item and resolve it
        const facingId = item.facingId || item.FacingId || item.facing || item.Facing;
        if (facingId && mapping.idToName[facingId]) {
            return mapping.idToName[facingId];
        }
        
        // Try to find facing name and validate it
        const facingName = item.facingName || item.FacingName || item.plotFacing || item.PlotFacing;
        if (facingName && typeof facingName === 'string') {
            const lowerName = facingName.toLowerCase();
            if (mapping.nameToId[lowerName]) {
                return facingName; // Valid name from API
            }
        }
    } catch (error) {
        console.warn('Error in async facing resolution:', error);
    }
    
    return syncResult || '';
}

function isValidFacing(value) {
    if (value === undefined || value === null) return false;
    if (typeof value === 'string') {
        const lower = value.trim().toLowerCase();
        return lower !== 'null' && lower !== 'n/a' && lower !== '' && lower !== 'undefined' && lower !== 'none';
    }
    if (typeof value === 'number') {
        return !isNaN(value) && value >= 0; // Accept any non-negative number
    }
    if (typeof value === 'object' && value !== null) {
        return true; // Objects might contain valid facing data
    }
    return false;
}

/**
 * Get plot facing for display in dropdowns with fallback
 * @param {Object} plot - The plot object
 * @returns {string} - Formatted facing text for display
 */
export function getPlotFacingDisplay(plot) {
    const facing = getPlotFacing(plot);
    return facing || 'Unknown Facing';
}

/**
 * Get facing types for dropdown options (API-based)
 * @returns {Promise<Array>} Array of {value, label} objects
 */
export async function getFacingTypesForDropdown() {
    try {
        return await facingTypesService.getFacingTypesForDropdown();
    } catch (error) {
        console.error('Error getting facing types for dropdown:', error);
        // Return fallback options
        return Object.entries(FACING_MAP)
            .filter(([key]) => !isNaN(key) && key.length <= 2) // Only numeric keys, avoid duplicates
            .map(([value, label]) => ({ value, label }));
    }
}

/**
 * Get all facing types (API-based)
 * @returns {Promise<Array>} Array of facing type objects
 */
export async function getFacingTypes() {
    try {
        return await facingTypesService.getFacingTypes();
    } catch (error) {
        console.error('Error getting facing types:', error);
        return facingTypesService.getFallbackFacingTypes();
    }
}

/**
 * Clear facing cache (useful for testing or forced refresh)
 */
export function clearFacingCache() {
    apiMappingCache = null;
    facingTypesService.clearCache();
}

export default {
    getPlotFacing,
    getPlotFacingAsync,
    getPlotFacingDisplay,
    getFacingTypesForDropdown,
    getFacingTypes,
    clearFacingCache,
    FACING_MAP
};