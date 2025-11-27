const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function importDb() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            multipleStatements: true
        });

        await connection.query('DROP DATABASE IF EXISTS bmw_demo');
        await connection.query('CREATE DATABASE IF NOT EXISTS bmw_demo');
        await connection.query('USE bmw_demo');

        const sqlPath = path.join(__dirname, '../bookmywing (2).sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Importing database...');
        await connection.query(sql);
        console.log('Main database imported successfully.');

        // Import project_enquiry.sql
        const projectEnquiryPath = path.join(__dirname, '../project_enquiry.sql');
        if (fs.existsSync(projectEnquiryPath)) {
            console.log('Importing project_enquiry.sql...');
            const projectEnquirySql = fs.readFileSync(projectEnquiryPath, 'utf8');

            // Drop the table if it exists to avoid conflicts
            await connection.query('DROP TABLE IF EXISTS project_enquiry');

            await connection.query(projectEnquirySql);
            console.log('project_enquiry.sql imported successfully.');
        }

        await connection.end();
    } catch (err) {
        console.error('Error importing database:', err);
        process.exit(1);
    }
}

importDb();
