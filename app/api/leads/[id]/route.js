import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'enquiry';

    let lead = {};
    let customerId = null;

    if (type === 'customer') {
      // Fetch Customer Directly
      const customerQuery = `SELECT * FROM customers WHERE cust_id = ?`;
      const [customerRows] = await pool.query(customerQuery, [id]);

      if (customerRows.length === 0) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      }

      const customerData = customerRows[0];
      customerId = customerData.cust_id;

      // Mock lead object for frontend compatibility
      lead = {
        enq_id: null, // No enquiry ID
        customer_id: customerId,
        cust_name: `${customerData.cust_fname} ${customerData.cust_lname}`,
        cust_mobile: customerData.cust_mobile,
        cust_email: customerData.cust_email,
        project_name: 'Direct Customer', // Placeholder
        status: customerData.status,
        followup_date: customerData.followup_date,
        followup_time: customerData.followup_time
      };

    } else {
      // Fetch Enquiry Details (Existing Logic)
      const enquiryQuery = `
        SELECT 
            pe.*, 
            pd.poj_name as project_name,
            COALESCE(NULLIF(pe.cust_name, ''), CONCAT(c.cust_fname, ' ', c.cust_lname)) as cust_name,
            COALESCE(NULLIF(pe.cust_mobile, ''), c.cust_mobile) as cust_mobile
        FROM project_enquiry pe
        LEFT JOIN project_details pd ON pe.project_id = pd.proj_id
        LEFT JOIN customers c ON pe.customer_id = c.cust_id
        WHERE pe.enq_id = ?
      `;
      const [enquiryRows] = await pool.query(enquiryQuery, [id]);

      if (enquiryRows.length === 0) {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
      }

      lead = enquiryRows[0];
      customerId = lead.customer_id;
    }

    // 2. Fetch Customer Details (if not already fetched or to ensure full object)
    let customer = {};
    if (customerId && customerId !== 0) {
      const customerQuery = `SELECT * FROM customers WHERE cust_id = ?`;
      const [customerRows] = await pool.query(customerQuery, [customerId]);
      customer = customerRows[0] || {};
    }

    // Fallback: If customerId is 0 but we have a mobile number, try to find customer by mobile
    if ((!customerId || customerId === 0) && lead.cust_mobile) {
      const customerByMobileQuery = `SELECT * FROM customers WHERE cust_mobile = ?`;
      const [customerRows] = await pool.query(customerByMobileQuery, [lead.cust_mobile]);
      if (customerRows.length > 0) {
        customer = customerRows[0];
        customerId = customer.cust_id; // Update customerId to fetch related data
      }
    } else {
      // console.log(`Lead ${id} has customer_id: ${customerId}`);
    }

    // Fallback if customer record is still missing or empty, use lead details
    if (!customer.cust_id) {
      customer = {
        cust_id: customerId || 0,
        cust_name: lead.cust_name,
        cust_mobile: lead.cust_mobile,
        cust_email: lead.cust_email,
        credits: 0 // Default
      };
    }

    // 3. Fetch Wishlist
    const wishlistQuery = `
      SELECT pw.*, pd.poj_name
      FROM project_wishlist pw
      JOIN project_details pd ON pw.project_id = pd.proj_id
      WHERE pw.user_id = ?
    `;

    // 4. Fetch Recently Viewed
    const recentlyViewedQuery = `
      SELECT rv.*, pd.poj_name
      FROM recently_viewed rv
      JOIN project_details pd ON rv.project_id = pd.proj_id
      WHERE rv.user_id = ?
      ORDER BY rv.count DESC
    `;

    // 5. Fetch Notes (Enquiry Notes + Customer Notes)
    // Only fetch enquiry notes if we have an enquiry ID
    let enquiryNotes = [];
    if (lead.enq_id) {
      const enquiryNotesQuery = `
        SELECT nid, note, added_by, status, followup_date, followup_time, added_at, 'enquiry' as type
        FROM project_enquiry_notes
        WHERE enq_id = ?
        `;
      const [rows] = await pool.query(enquiryNotesQuery, [lead.enq_id]);
      enquiryNotes = rows;
    }

    const customerNotesQuery = `
      SELECT nid, note, added_by, status, followup_date, followup_time, added_at, 'customer' as type
      FROM customer_notes
      WHERE cust_id = ?
    `;

    const [wishlist, recentlyViewed, customerNotes] = await Promise.all([
      pool.query(wishlistQuery, [customerId]).then(([rows]) => rows),
      pool.query(recentlyViewedQuery, [customerId]).then(([rows]) => rows),
      pool.query(customerNotesQuery, [customerId]).then(([rows]) => rows)
    ]);

    // Merge and sort notes
    const allNotes = [...enquiryNotes, ...customerNotes].sort((a, b) => {
      return new Date(b.added_at) - new Date(a.added_at);
    });

    return NextResponse.json({
      lead,
      customer,
      wishlist,
      recentlyViewed,
      notes: allNotes
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
