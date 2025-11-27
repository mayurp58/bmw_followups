const mysql = require('mysql2/promise');

async function checkLead() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'bmw_demo'
    });

    try {
        const [rows] = await connection.execute(
            'SELECT * FROM project_enquiry WHERE enq_id = 694'
        );
        console.log('Lead 694:', rows[0]);

        if (rows[0]) {
            const [customer] = await connection.execute(
                'SELECT * FROM customers WHERE cust_id = ?', [rows[0].customer_id]
            );
            console.log('Linked Customer:', customer[0]);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

checkLead();
