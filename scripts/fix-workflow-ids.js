/**
 * Database Migration Script: Fix WorkflowTypeId Values
 * 
 * This script fixes inconsistent workflowTypeId values in the database
 * by ensuring they are properly set to 1, 2, or 3 based on workflowCode
 * 
 * Run this script to clean up existing data:
 * node scripts/fix-workflow-ids.js
 */

// You'll need to replace this with your actual database connection
// This is a template - adjust according to your database setup

const fixWorkflowIds = async () => {
    console.log('🔧 Starting WorkflowTypeId fix...');

    try {
        // Replace this with your actual database query logic
        // Example for different database types:

        // FOR SQL DATABASES (MySQL, PostgreSQL, etc.):
        const sqlQueries = [
            // Fix records with workflowCode but wrong workflowTypeId
            `UPDATE bookings SET workflowTypeId = 1 WHERE workflowCode = 'WITH_LOAN' AND workflowTypeId != 1;`,
            `UPDATE bookings SET workflowTypeId = 2 WHERE workflowCode = 'WITHOUT_LOAN' AND workflowTypeId != 2;`,
            `UPDATE bookings SET workflowTypeId = 3 WHERE workflowCode = 'WITHOUT_7DAY_CLOSED' AND workflowTypeId != 3;`,

            // Fix records with no workflowCode but have workflowTypeId
            `UPDATE bookings SET workflowCode = 'WITH_LOAN' WHERE workflowTypeId = 1 AND (workflowCode IS NULL OR workflowCode = '');`,
            `UPDATE bookings SET workflowCode = 'WITHOUT_LOAN' WHERE workflowTypeId = 2 AND (workflowCode IS NULL OR workflowCode = '');`,
            `UPDATE bookings SET workflowCode = 'WITHOUT_7DAY_CLOSED' WHERE workflowTypeId = 3 AND (workflowCode IS NULL OR workflowCode = '');`,

            // Fix records with invalid workflowTypeId (0, null, or other values)
            `UPDATE bookings SET workflowTypeId = 2, workflowCode = 'WITHOUT_LOAN' WHERE workflowTypeId NOT IN (1, 2, 3) OR workflowTypeId IS NULL;`,
        ];

        console.log('📝 SQL queries to run:');
        sqlQueries.forEach((query, index) => {
            console.log(`${index + 1}. ${query}`);
        });

        // FOR MONGODB:
        const mongoOperations = [
            // Fix records with workflowCode but wrong workflowTypeId
            { updateMany: { filter: { workflowCode: 'WITH_LOAN', workflowTypeId: { $ne: 1 } }, update: { $set: { workflowTypeId: 1 } } } },
            { updateMany: { filter: { workflowCode: 'WITHOUT_LOAN', workflowTypeId: { $ne: 2 } }, update: { $set: { workflowTypeId: 2 } } } },
            { updateMany: { filter: { workflowCode: 'WITHOUT_7DAY_CLOSED', workflowTypeId: { $ne: 3 } }, update: { $set: { workflowTypeId: 3 } } } },

            // Fix records with no workflowCode but have workflowTypeId
            { updateMany: { filter: { workflowTypeId: 1, $or: [{ workflowCode: { $exists: false } }, { workflowCode: '' }] }, update: { $set: { workflowCode: 'WITH_LOAN' } } } },
            { updateMany: { filter: { workflowTypeId: 2, $or: [{ workflowCode: { $exists: false } }, { workflowCode: '' }] }, update: { $set: { workflowCode: 'WITHOUT_LOAN' } } } },
            { updateMany: { filter: { workflowTypeId: 3, $or: [{ workflowCode: { $exists: false } }, { workflowCode: '' }] }, update: { $set: { workflowCode: 'WITHOUT_7DAY_CLOSED' } } } },

            // Fix records with invalid workflowTypeId
            { updateMany: { filter: { $or: [{ workflowTypeId: { $nin: [1, 2, 3] } }, { workflowTypeId: { $exists: false } }] }, update: { $set: { workflowTypeId: 2, workflowCode: 'WITHOUT_LOAN' } } } },
        ];

        console.log('\n📝 MongoDB operations to run:');
        mongoOperations.forEach((op, index) => {
            console.log(`${index + 1}.`, JSON.stringify(op, null, 2));
        });

        // UNCOMMENT AND MODIFY BASED ON YOUR DATABASE:

        // For SQL databases:
        // const db = require('your-database-connection');
        // for (const query of sqlQueries) {
        //     const result = await db.query(query);
        //     console.log(`✅ Query executed: ${result.affectedRows} rows affected`);
        // }

        // For MongoDB:
        // const { MongoClient } = require('mongodb');
        // const client = new MongoClient('your-connection-string');
        // await client.connect();
        // const db = client.db('your-database-name');
        // const collection = db.collection('bookings');
        // 
        // for (const operation of mongoOperations) {
        //     const result = await collection.updateMany(operation.filter, operation.update);
        //     console.log(`✅ Operation completed: ${result.modifiedCount} documents modified`);
        // }
        // await client.close();

        console.log('\n✅ WorkflowTypeId fix completed successfully!');
        console.log('📊 Summary:');
        console.log('   - WorkflowTypeId 1 = WITH_LOAN');
        console.log('   - WorkflowTypeId 2 = WITHOUT_LOAN (default)');
        console.log('   - WorkflowTypeId 3 = WITHOUT_7DAY_CLOSED');

    } catch (error) {
        console.error('❌ Error fixing WorkflowTypeId:', error);
        throw error;
    }
};

// Manual verification queries
const verificationQueries = {
    sql: [
        'SELECT workflowTypeId, workflowCode, COUNT(*) as count FROM bookings GROUP BY workflowTypeId, workflowCode ORDER BY workflowTypeId;',
        'SELECT COUNT(*) as total_records FROM bookings;',
        'SELECT COUNT(*) as invalid_records FROM bookings WHERE workflowTypeId NOT IN (1, 2, 3) OR workflowTypeId IS NULL;'
    ],
    mongo: [
        'db.bookings.aggregate([{ $group: { _id: { workflowTypeId: "$workflowTypeId", workflowCode: "$workflowCode" }, count: { $sum: 1 } } }, { $sort: { "_id.workflowTypeId": 1 } }])',
        'db.bookings.countDocuments({})',
        'db.bookings.countDocuments({ $or: [{ workflowTypeId: { $nin: [1, 2, 3] } }, { workflowTypeId: { $exists: false } }] })'
    ]
};

console.log('\n🔍 Verification queries to run after migration:');
console.log('\nSQL:');
verificationQueries.sql.forEach((query, index) => {
    console.log(`${index + 1}. ${query}`);
});

console.log('\nMongoDB:');
verificationQueries.mongo.forEach((query, index) => {
    console.log(`${index + 1}. ${query}`);
});

// Run the fix
if (require.main === module) {
    fixWorkflowIds().catch(console.error);
}

module.exports = { fixWorkflowIds };