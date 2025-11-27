const mysql = require('mysql2/promise');

async function checkCustomerByMobile() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'bmw_demo'
    });

    try {
        const mobile = '8087827327';
        console.log(`Checking for customer with mobile: ${mobile}`);

        const [rows] = await connection.execute(
            'SELECT * FROM customers WHERE cust_mobile = ?', [mobile]
        );

        if (rows.length > 0) {
            console.log('Found Customer:', rows[0]);
            const custId = rows[0].cust_id;

            console.log('--- Wishlist ---');
            const [wishlist] = await connection.execute('SELECT * FROM project_wishlist WHERE user_id = ?', [custId]);
            console.log(wishlist);

            console.log('--- Recently Viewed ---');
            const [recent] = await connection.execute('SELECT * FROM recently_viewed WHERE user_id = ?', [custId]);
            console.log(recent);
        } else {
            console.log('No customer found with this mobile number.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

checkCustomerByMobile();
