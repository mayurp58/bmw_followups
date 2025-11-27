import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { format } from 'date-fns';

export async function GET() {
    try {
        const today = format(new Date(), 'yyyy-MM-dd');

        const enquiryQuery = `
      SELECT 
        pe.enq_id, pe.cust_name, pe.cust_mobile, pe.status, pe.followup_date, pe.followup_time,
        pd.poj_name as project_name,
        'enquiry' as type,
        (SELECT note FROM project_enquiry_notes WHERE enq_id = pe.enq_id ORDER BY added_at DESC LIMIT 1) as last_note
      FROM project_enquiry pe
      LEFT JOIN project_details pd ON pe.project_id = pd.proj_id
      WHERE pe.followup_date = ?
    `;

        const customerQuery = `
      SELECT 
        cust_id, CONCAT(cust_fname, ' ', cust_lname) as cust_name, cust_mobile, status, followup_date, followup_time,
        NULL as project_name,
        'customer' as type,
        (SELECT note FROM customer_notes WHERE cust_id = customers.cust_id ORDER BY added_at DESC LIMIT 1) as last_note
      FROM customers
      WHERE followup_date = ?
    `;

        const [enquiries, customers] = await Promise.all([
            pool.query(enquiryQuery, [today]).then(([rows]) => rows),
            pool.query(customerQuery, [today]).then(([rows]) => rows)
        ]);

        const allFollowups = [...enquiries, ...customers].sort((a, b) => {
            // Sort by time, handling nulls
            if (!a.followup_time) return 1;
            if (!b.followup_time) return -1;
            return a.followup_time.localeCompare(b.followup_time);
        });

        return NextResponse.json(allFollowups);

    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
