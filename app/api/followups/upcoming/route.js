import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { addDays, format } from 'date-fns';

export async function GET() {
  try {
    const today = new Date();
    const nextWeek = addDays(today, 7);
    const startDate = format(today, 'yyyy-MM-dd');
    const endDate = format(nextWeek, 'yyyy-MM-dd');

    const enquiryQuery = `
      SELECT
        pe.enq_id, pe.cust_name, pe.cust_mobile, pe.status, pe.followup_date, pe.followup_time,
        pd.poj_name as project_name,
        'enquiry' as type
      FROM project_enquiry pe
      LEFT JOIN project_details pd ON pe.project_id = pd.proj_id
      WHERE pe.followup_date > ?
      AND pe.status NOT IN ('Dead Lead', 'Booking done', 'Not Interested', 'Duplicate Lead')
      ORDER BY pe.followup_date ASC, pe.followup_time ASC
      LIMIT 50
    `;

    const customerQuery = `
      SELECT
        cust_id, CONCAT(cust_fname, ' ', cust_lname) as cust_name, cust_mobile, status, followup_date, followup_time,
        NULL as project_name,
        'customer' as type
      FROM customers
      WHERE followup_date BETWEEN ? AND ?
    `;

    const [enquiries, customers] = await Promise.all([
      pool.query(enquiryQuery, [startDate, endDate]).then(([rows]) => rows),
      pool.query(customerQuery, [startDate, endDate]).then(([rows]) => rows)
    ]);

    const allFollowups = [...enquiries, ...customers];

    // Group by date
    const grouped = allFollowups.reduce((acc, curr) => {
      // curr.followup_date is likely a Date object from mysql2
      const dateStr = format(new Date(curr.followup_date), 'yyyy-MM-dd');
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      acc[dateStr].push(curr);
      return acc;
    }, {});

    return NextResponse.json(grouped);

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
