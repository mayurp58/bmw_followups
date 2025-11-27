const mysql = require('mysql2/promise');

async function checkLeadData() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'bmw_demo'
    });

    try {
        console.log('--- Lead 291 ---');
        const [leadRows] = await connection.execute(
            'SELECT * FROM project_enquiry WHERE enq_id = 291'
        );
        const lead = leadRows[0];
        console.log('Lead:', lead);

        if (lead) {
            const customerId = lead.customer_id;
            console.log('Customer ID:', customerId);

            if (customerId) {
                console.log('--- Customer ---');
                const [customerRows] = await connection.execute(
                    'SELECT * FROM customers WHERE cust_id = ?', [customerId]
                );
                console.log('Customer:', customerRows[0]);

                console.log('--- Wishlist (Interested Projects) ---');
                // Assuming user_id in wishlist maps to cust_id
                const [wishlistRows] = await connection.execute(
                    'SELECT * FROM project_wishlist WHERE user_id = ?', [customerId]
                );
                console.log('Wishlist Count:', wishlistRows.length);
                console.log('Wishlist Items:', wishlistRows);

                console.log('--- Recently Viewed ---');
                // Assuming user_id in recently_viewed maps to cust_id
                const [recentRows] = await connection.execute(
                    'SELECT * FROM recently_viewed WHERE user_id = ?', [customerId]
                );
                console.log('Recently Viewed Count:', recentRows.length);
                console.log('Recently Viewed Items:', recentRows);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

checkLeadData();
