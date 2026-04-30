import axiosInstance from './axiosInstance';
import API_ENDPOINTS from './apiConfig';

/**
 * Service for handling FacingTypes API calls
 */
class FacingTypesService {
    constructor() {
        this.cache = null;
        this.cacheTimestamp = null;
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes cache
    }

    /**
     * Get all facing types from API
     * @returns {Promise<Array>} Array of facing types
     */
    async getFacingTypes() {
        try {
            // Check cache first
            if (this.cache && this.cacheTimestamp && 
                (Date.now() - this.cacheTimestamp) < this.cacheExpiry) {
                return this.cache;
            }

            const response = await axiosInstance.get(API_ENDPOINTS.FACING_TYPES);
            
            if (response.data && Array.isArray(response.data)) {
                // Cache the response
                this.cache = response.data;
                this.cacheTimestamp = Date.now();
                
                // console.log('✅ FacingTypes API Response:', response.data);
                return response.data;
            } else {
                console.warn('⚠️ Invalid FacingTypes API response format:', response.data);
                return this.getFallbackFacingTypes();
            }
        } catch (error) {
            console.error('❌ Error fetching facing types:', error);
            
            // Return fallback data on error
            return this.getFallbackFacingTypes();
        }
    }

    /**
     * Get facing types formatted for dropdown options
     * @returns {Promise<Array>} Array of {value, label} objects
     */
    async getFacingTypesForDropdown() {
        const facingTypes = await this.getFacingTypes();
        return facingTypes.map(facing => ({
            value: facing.id.toString(),
            label: facing.facingName
        }));
    }

    /**
     * Get facing name by ID
     * @param {number|string} id - Facing type ID
     * @returns {Promise<string>} Facing name or empty string
     */
    async getFacingNameById(id) {
        if (!id) return '';
        
        const facingTypes = await this.getFacingTypes();
        const facing = facingTypes.find(f => f.id == id);
        return facing ? facing.facingName : '';
    }

    /**
     * Get facing ID by name
     * @param {string} name - Facing name
     * @returns {Promise<number|null>} Facing ID or null
     */
    async getFacingIdByName(name) {
        if (!name) return null;
        
        const facingTypes = await this.getFacingTypes();
        const facing = facingTypes.find(f => 
            f.facingName.toLowerCase() === name.toLowerCase()
        );
        return facing ? facing.id : null;
    }

    /**
     * Fallback facing types data (matches API response format)
     * @returns {Array} Default facing types
     */
    getFallbackFacingTypes() {
        return [
            { id: 1, facingName: "East" },
            { id: 2, facingName: "West" },
            { id: 3, facingName: "North" },
            { id: 4, facingName: "South" },
            { id: 5, facingName: "East - South" },
            { id: 6, facingName: "East - North" },
            { id: 7, facingName: "West - South" },
            { id: 8, facingName: "West - North" },
            { id: 9, facingName: "North - East" },
            { id: 10, facingName: "North - West" },
            { id: 11, facingName: "South - West" },
            { id: 12, facingName: "South - East" }
        ];
    }

    /**
     * Clear cache (useful for testing or forced refresh)
     */
    clearCache() {
        this.cache = null;
        this.cacheTimestamp = null;
    }

    /**
     * Create a mapping object for quick lookups
     * @returns {Promise<Object>} Object with id->name and name->id mappings
     */
    async getFacingMapping() {
        const facingTypes = await this.getFacingTypes();
        const idToName = {};
        const nameToId = {};
        
        facingTypes.forEach(facing => {
            idToName[facing.id] = facing.facingName;
            idToName[facing.id.toString()] = facing.facingName;
            nameToId[facing.facingName.toLowerCase()] = facing.id;
        });
        
        return { idToName, nameToId };
    }
}

// Create singleton instance
const facingTypesService = new FacingTypesService();

export default facingTypesService;

// Export individual methods for convenience
export const {
    getFacingTypes,
    getFacingTypesForDropdown,
    getFacingNameById,
    getFacingIdByName,
    getFallbackFacingTypes,
    clearCache,
    getFacingMapping
} = facingTypesService;