const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function createAdminTable() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'bmw_demo',
        });

        // Create Table
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS admin (
                admin_id INT AUTO_INCREMENT PRIMARY KEY,
                fname VARCHAR(100),
                lname VARCHAR(100),
                email VARCHAR(100) UNIQUE NOT NULL,
                mobile VARCHAR(20),
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'admin',
                status VARCHAR(20) DEFAULT 'active',
                builder_id INT DEFAULT NULL,
                designation VARCHAR(100),
                project_ids TEXT,
                reset_token VARCHAR(255),
                reset_valid_time DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
            )
        `;
        await connection.query(createTableQuery);
        console.log("Table 'admin' created or already exists.");

        // Check if admin exists
        const [rows] = await connection.query("SELECT * FROM admin WHERE email = 'admin@example.com'");

        if (rows.length === 0) {
            const hashedPassword = await bcrypt.hash('password', 10);
            const insertQuery = `
                INSERT INTO admin (fname, lname, email, mobile, password, role, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
            `;
            await connection.query(insertQuery, ['Admin', 'User', 'admin@example.com', '1234567890', hashedPassword, 'admin', 'active']);
            console.log("Default admin user created: admin@example.com / password");
        } else {
            console.log("Admin user already exists.");
        }

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

createAdminTable();
