import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = (page - 1) * limit;

        const status = searchParams.get('status');
        const search = searchParams.get('search');
        const projectId = searchParams.get('projectId');
        const fromDate = searchParams.get('fromDate');
        const toDate = searchParams.get('toDate');

        let whereClause = 'WHERE 1=1';
        const queryParams = [];

        if (status) {
            whereClause += ' AND pe.status = ?';
            queryParams.push(status);
        }

        if (projectId) {
            whereClause += ' AND pe.project_id = ?';
            queryParams.push(projectId);
        }

        if (search) {
            whereClause += ' AND (COALESCE(NULLIF(pe.cust_name, ""), CONCAT(c.cust_fname, " ", c.cust_lname)) LIKE ? OR COALESCE(NULLIF(pe.cust_mobile, ""), c.cust_mobile) LIKE ?)';
            queryParams.push(`%${search}%`, `%${search}%`);
        }

        if (fromDate) {
            whereClause += ' AND DATE(pe.date_added) >= ?';
            queryParams.push(fromDate);
        }

        if (toDate) {
            whereClause += ' AND DATE(pe.date_added) <= ?';
            queryParams.push(toDate);
        }

        const type = searchParams.get('type') || 'enquiry';

        let countQuery = '';
        let query = '';

        if (type === 'customer') {
            // Customer Query
            let custWhere = 'WHERE 1=1';
            const custParams = [];

            if (search) {
                custWhere += ' AND (CONCAT(cust_fname, " ", cust_lname) LIKE ? OR cust_mobile LIKE ?)';
                custParams.push(`%${search}%`, `%${search}%`);
            }
            // Add other filters if applicable to customers

            countQuery = `SELECT COUNT(*) as total FROM customers ${custWhere}`;

            query = `
                SELECT 
                    cust_id as id, 
                    CONCAT(cust_fname, ' ', cust_lname) as cust_name, 
                    cust_mobile, 
                    status, 
                    followup_date, 
                    followup_time, 
                    created_at as date_added,
                    NULL as project_name,
                    (SELECT note FROM customer_notes WHERE cust_id = customers.cust_id ORDER BY added_at DESC LIMIT 1) as last_note,
                    'customer' as type
                FROM customers
                ${custWhere}
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
            `;

            // Re-assign queryParams for execution
            queryParams.length = 0;
            queryParams.push(...custParams);

        } else {
            // Enquiry Query (Existing logic)
            countQuery = `
              SELECT COUNT(*) as total 
              FROM project_enquiry pe 
              LEFT JOIN customers c ON pe.customer_id = c.cust_id
              ${whereClause}
            `;

            query = `
              SELECT 
                pe.enq_id as id, 
                COALESCE(NULLIF(pe.cust_name, ''), CONCAT(c.cust_fname, ' ', c.cust_lname)) as cust_name, 
                COALESCE(NULLIF(pe.cust_mobile, ''), c.cust_mobile) as cust_mobile, 
                pe.status, pe.followup_date, pe.followup_time, pe.date_added,
                pd.poj_name as project_name,
                (SELECT note FROM project_enquiry_notes WHERE enq_id = pe.enq_id ORDER BY added_at DESC LIMIT 1) as last_note,
                'enquiry' as type
              FROM project_enquiry pe
              LEFT JOIN project_details pd ON pe.project_id = pd.proj_id
              LEFT JOIN customers c ON pe.customer_id = c.cust_id
              ${whereClause}
              ORDER BY pe.date_added DESC
              LIMIT ? OFFSET ?
            `;
        }

        const [countResult] = await pool.query(countQuery, queryParams);
        const total = countResult[0].total;

        const [rows] = await pool.query(query, [...queryParams, limit, offset]);

        // Separate enquiries and customers (if we were fetching both, but currently we only fetch from project_enquiry)
        // The user wants "Project Enquiry Leads" and "Customer Leads".
        // Currently this API only queries `project_enquiry`.
        // I need to update it to also query `customers` or handle them separately.
        // For now, I will assume this page is primarily for Project Enquiries as per the table schema.
        // But the user said "on all the places".
        // Let's check if I should split the current results or fetch customers too.

        // Wait, the current query is: FROM project_enquiry pe ...
        // So these are ALL project enquiries.
        // "Customer Leads" probably implies leads from the `customers` table directly?
        // Or maybe enquiries linked to customers vs unlinked?
        // "project enquiry leads and customer leads"

        // Let's assume:
        // 1. Project Enquiry Leads = Enquiries in `project_enquiry` table.
        // 2. Customer Leads = Records in `customers` table (maybe those with followups?).

        // The current API `GET /api/leads` is clearly built for `project_enquiry`.
        // To support "Customer Leads", I should probably add a `type` filter or return both.
        // Given the pagination, returning both in one list is tricky if they are from different tables.
        // It's better to have a `type` query param: `?type=enquiry` or `?type=customer`.

        // Let's modify the API to accept a `type` param. Default to `enquiry`.

        return NextResponse.json({
            leads: rows,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
