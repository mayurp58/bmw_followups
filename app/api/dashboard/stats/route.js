import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { format, addDays } from 'date-fns';

export async function GET() {
  try {
    const today = format(new Date(), 'yyyy-MM-dd');

    // 1. Total Leads (Project Enquiries)
    const [totalLeadsResult] = await pool.query('SELECT COUNT(*) as count FROM project_enquiry');
    const totalLeads = totalLeadsResult[0].count;

    // 2. Today's Followups List (Replaces simple count and Recent Activities)
    // 2. Today's Followups List (Replaces simple count and Recent Activities)
    const enquiryQuery = `
      SELECT 
        pe.enq_id, 
        COALESCE(NULLIF(pe.cust_name, ''), CONCAT(c.cust_fname, ' ', c.cust_lname)) as cust_name, 
        COALESCE(NULLIF(pe.cust_mobile, ''), c.cust_mobile) as cust_mobile, 
        pe.status, pe.followup_date, pe.followup_time,
        pd.poj_name as project_name,
        'enquiry' as type,
        (SELECT note FROM project_enquiry_notes WHERE enq_id = pe.enq_id ORDER BY added_at DESC LIMIT 1) as last_note
      FROM project_enquiry pe
      LEFT JOIN project_details pd ON pe.project_id = pd.proj_id
      LEFT JOIN customers c ON pe.customer_id = c.cust_id
      WHERE pe.followup_date = ?
      AND COALESCE(NULLIF(pe.cust_mobile, ''), c.cust_mobile) IS NOT NULL 
      AND COALESCE(NULLIF(pe.cust_mobile, ''), c.cust_mobile) <> ''
    `;

    const customerQuery = `
      SELECT 
        cust_id, CONCAT(cust_fname, ' ', cust_lname) as cust_name, cust_mobile, status, followup_date, followup_time,
        NULL as project_name,
        'customer' as type,
        (SELECT note FROM customer_notes WHERE cust_id = customers.cust_id ORDER BY added_at DESC LIMIT 1) as last_note
      FROM customers
      WHERE followup_date = ?
      AND cust_mobile IS NOT NULL AND cust_mobile <> ''
    `;

    const [enquiries, customers] = await Promise.all([
      pool.query(enquiryQuery, [today]).then(([rows]) => rows),
      pool.query(customerQuery, [today]).then(([rows]) => rows)
    ]);

    const todayFollowupsList = [...enquiries, ...customers].sort((a, b) => {
      if (!a.followup_time) return 1;
      if (!b.followup_time) return -1;
      return a.followup_time.localeCompare(b.followup_time);
    });

    const todayFollowups = todayFollowupsList.length;

    // 3. Overdue Followups
    const [overdueEnquiry] = await pool.query('SELECT COUNT(*) as count FROM project_enquiry WHERE followup_date < ? AND status NOT IN ("Dead Lead", "Booking done", "Not Interested")', [today]);
    const [overdueCustomer] = await pool.query('SELECT COUNT(*) as count FROM customers WHERE followup_date < ? AND status NOT IN ("Dead Lead", "Booking done", "Not Interested")', [today]);
    const overdueFollowups = overdueEnquiry[0].count + overdueCustomer[0].count;

    // 4. This Week Followups
    const nextWeek = format(addDays(new Date(), 7), 'yyyy-MM-dd');
    const [weekEnquiry] = await pool.query('SELECT COUNT(*) as count FROM project_enquiry WHERE followup_date BETWEEN ? AND ?', [today, nextWeek]);
    const [weekCustomer] = await pool.query('SELECT COUNT(*) as count FROM customers WHERE followup_date BETWEEN ? AND ?', [today, nextWeek]);
    const thisWeekFollowups = weekEnquiry[0].count + weekCustomer[0].count;

    // 5. Status-wise Lead Count
    const [statusCounts] = await pool.query('SELECT status, COUNT(*) as count FROM project_enquiry GROUP BY status');

    // 6. Agent-wise Performance (Notes added count)
    const agentPerformanceQuery = `
      SELECT added_by, COUNT(*) as count FROM (
        SELECT added_by FROM project_enquiry_notes
        UNION ALL
        SELECT added_by FROM customer_notes
      ) as all_notes
      GROUP BY added_by
      ORDER BY count DESC
      LIMIT 5
    `;
    const [agentPerformance] = await pool.query(agentPerformanceQuery);

    return NextResponse.json({
      summary: {
        totalLeads,
        todayFollowups,
        overdueFollowups,
        thisWeekFollowups
      },
      todayFollowupsList,
      statusCounts,
      agentPerformance
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
