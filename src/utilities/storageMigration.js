/**
 * Storage Migration Utility
 * Handles migration of localStorage data between different versions of the application
 */

class StorageMigration {
    static MIGRATION_VERSION_KEY = 'spendwise_migration_version';
    static CURRENT_VERSION = '1.0.0';

    /**
     * Run migration if needed
     */
    static runMigrationIfNeeded() {
        const currentVersion = localStorage.getItem(this.MIGRATION_VERSION_KEY);
        
        if (!currentVersion) {
            // console.log('🔄 Running initial storage migration...');
            this.runInitialMigration();
            localStorage.setItem(this.MIGRATION_VERSION_KEY, this.CURRENT_VERSION);
            // console.log('✅ Storage migration completed');
        } else if (currentVersion !== this.CURRENT_VERSION) {
            // console.log(`🔄 Running storage migration from ${currentVersion} to ${this.CURRENT_VERSION}...`);
            this.runVersionMigration(currentVersion, this.CURRENT_VERSION);
            localStorage.setItem(this.MIGRATION_VERSION_KEY, this.CURRENT_VERSION);
            // console.log('✅ Storage migration completed');
        }
    }

    /**
     * Run initial migration for new installations
     */
    static runInitialMigration() {
        // Clean up any legacy keys that might exist
        this.cleanupLegacyKeys();
        
        // Ensure proper data types for existing keys
        this.normalizeExistingData();
    }

    /**
     * Run version-specific migrations
     * @param {string} fromVersion - Current version
     * @param {string} toVersion - Target version
     */
    static runVersionMigration(fromVersion, toVersion) {
        // Add version-specific migration logic here as needed
        // console.log(`Migrating from ${fromVersion} to ${toVersion}`);
        
        // Example migration logic:
        // if (fromVersion === '0.9.0' && toVersion === '1.0.0') {
        //     this.migrateFrom090To100();
        // }
    }

    /**
     * Clean up legacy localStorage keys
     */
    static cleanupLegacyKeys() {
        const legacyKeys = [
            'old_token_key',
            'legacy_user_data',
            'deprecated_settings'
        ];

        legacyKeys.forEach(key => {
            if (localStorage.getItem(key)) {
                // console.log(`🗑️ Removing legacy key: ${key}`);
                localStorage.removeItem(key);
            }
        });
    }

    /**
     * Normalize existing data to ensure proper types
     */
    static normalizeExistingData() {
        // Ensure userId is a valid number
        const userId = localStorage.getItem('userId');
        if (userId && isNaN(Number(userId))) {
            // console.log('🔧 Normalizing userId');
            localStorage.setItem('userId', '1'); // Default fallback
        }

        // Ensure role is lowercase
        const role = localStorage.getItem('spendwise_role');
        if (role && role !== role.toLowerCase()) {
            // console.log('🔧 Normalizing role to lowercase');
            localStorage.setItem('spendwise_role', role.toLowerCase());
        }

        // Clean up empty or invalid tokens
        const token = localStorage.getItem('spendwise_token');
        if (token && (token.trim() === '' || token === 'null' || token === 'undefined')) {
            // console.log('🔧 Removing invalid token');
            localStorage.removeItem('spendwise_token');
        }
    }

    /**
     * Get current migration version
     * @returns {string}
     */
    static getCurrentVersion() {
        return localStorage.getItem(this.MIGRATION_VERSION_KEY) || 'none';
    }

    /**
     * Force reset migration (for development/testing)
     */
    static resetMigration() {
        localStorage.removeItem(this.MIGRATION_VERSION_KEY);
        // console.log('🔄 Migration version reset');
    }

    /**
     * Get storage usage information
     * @returns {Object}
     */
    static getStorageInfo() {
        const keys = Object.keys(localStorage);
        const totalSize = keys.reduce((total, key) => {
            return total + key.length + (localStorage.getItem(key) || '').length;
        }, 0);

        return {
            keyCount: keys.length,
            totalSize: totalSize,
            totalSizeKB: Math.round(totalSize / 1024 * 100) / 100,
            keys: keys.filter(key => key.startsWith('spendwise_') || key === 'userId'),
            migrationVersion: this.getCurrentVersion()
        };
    }
}

export default StorageMigration;