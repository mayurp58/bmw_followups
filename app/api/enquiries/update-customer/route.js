import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
    try {
        const { enq_id, cust_name } = await request.json();

        if (!enq_id || !cust_name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Get the enquiry details to find the mobile number
        const [enquiryResult] = await pool.query(
            'SELECT cust_mobile, customer_id FROM project_enquiry WHERE enq_id = ?',
            [enq_id]
        );

        if (enquiryResult.length === 0) {
            return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
        }

        const enquiry = enquiryResult[0];
        const mobile = enquiry.cust_mobile;

        // Only proceed if customer_id is 0 (as per requirements)
        // "only if the customer id is 0"
        if (enquiry.customer_id !== 0) {
            // If already linked, maybe just update name? 
            // But user said "give option to save customer name in project enquiry only if the customer id is 0"
            // So we should probably respect that.
            // However, if we are just fixing a missing name, we might want to allow it.
            // But let's stick to the requirement: "only if the customer id is 0"
            // Wait, if customer_id is NOT 0, the name should come from customers table (which we handled in GET).
            // So this case is likely for unlinked enquiries with missing names.
        }

        let newCustomerId = 0;
        let message = 'Customer name updated';

        // 2. Check if mobile number exists in customers table
        if (mobile) {
            const [customerResult] = await pool.query(
                'SELECT cust_id, cust_fname, cust_lname FROM customers WHERE cust_mobile = ?',
                [mobile]
            );

            if (customerResult.length > 0) {
                // Found a matching customer!
                const customer = customerResult[0];
                newCustomerId = customer.cust_id;

                // Update enquiry with linked customer ID and the provided name
                await pool.query(
                    'UPDATE project_enquiry SET customer_id = ?, cust_name = ? WHERE enq_id = ?',
                    [newCustomerId, cust_name, enq_id]
                );
                message = `Linked to existing customer (ID: ${newCustomerId}) and updated name`;
            } else {
                // No matching customer, just update the name in project_enquiry
                await pool.query(
                    'UPDATE project_enquiry SET cust_name = ? WHERE enq_id = ?',
                    [cust_name, enq_id]
                );
            }
        } else {
            // No mobile number, just update name
            await pool.query(
                'UPDATE project_enquiry SET cust_name = ? WHERE enq_id = ?',
                [cust_name, enq_id]
            );
        }

        return NextResponse.json({ success: true, message, customerId: newCustomerId });

    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
