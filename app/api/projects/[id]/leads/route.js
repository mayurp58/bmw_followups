import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = (page - 1) * limit;
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || '';
        const leadType = searchParams.get('leadType') || 'enquiry'; // 'enquiry' or 'customer'

        let whereClause, queryParams, countQuery, query;

        if (leadType === 'customer') {
            // Fetch customer leads from project_wishlist
            whereClause = 'WHERE pw.project_id = ?';
            queryParams = [id];

            if (search) {
                whereClause += ' AND (CONCAT(c.cust_fname, " ", c.cust_lname) LIKE ? OR c.cust_mobile LIKE ?)';
                queryParams.push(`% ${search}% `, ` % ${search}% `);
            }

            if (status) {
                whereClause += ' AND c.status = ?';
                queryParams.push(status);
            }

            countQuery = `
                SELECT COUNT(DISTINCT c.cust_id) as total
                FROM project_wishlist pw
                INNER JOIN customers c ON pw.user_id = c.cust_id
                ${whereClause}
`;

            query = `
SELECT
c.cust_id as id,
    CONCAT(c.cust_fname, ' ', c.cust_lname) as cust_name,
    c.cust_mobile,
    c.status,
    c.followup_date,
    c.followup_time,
    c.created_at as date_added,
    (SELECT note FROM customer_notes WHERE cust_id = c.cust_id ORDER BY added_at DESC LIMIT 1) as last_note,
        'customer' as type
                FROM project_wishlist pw
                INNER JOIN customers c ON pw.user_id = c.cust_id
                ${whereClause}
                GROUP BY c.cust_id
                ORDER BY c.created_at DESC
LIMIT ? OFFSET ?
    `;

        } else {
            // Fetch enquiry leads (default)
            whereClause = 'WHERE pe.project_id = ?';
            queryParams = [id];

            if (search) {
                whereClause += ' AND (COALESCE(NULLIF(pe.cust_name, ""), CONCAT(c.cust_fname, " ", c.cust_lname)) LIKE ? OR COALESCE(NULLIF(pe.cust_mobile, ""), c.cust_mobile) LIKE ?)';
                queryParams.push(`% ${search}% `, ` % ${search}% `);
            }

            if (status) {
                whereClause += ' AND pe.status = ?';
                queryParams.push(status);
            }

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
    pe.status,
    pe.followup_date,
    pe.followup_time,
    pe.date_added,
    (SELECT note FROM project_enquiry_notes WHERE enq_id = pe.enq_id ORDER BY added_at DESC LIMIT 1) as last_note,
        'enquiry' as type
                FROM project_enquiry pe
                LEFT JOIN customers c ON pe.customer_id = c.cust_id
                ${whereClause}
                ORDER BY pe.date_added DESC
LIMIT ? OFFSET ?
    `;
        }

        const [countResult] = await pool.query(countQuery, queryParams);
        const total = countResult[0].total;

        const [leads] = await pool.query(query, [...queryParams, limit, offset]);

        // Get project details with counts
        const [projectResult] = await pool.query(`
            SELECT
pd.proj_id,
    pd.poj_name,
    (SELECT COUNT(*) FROM project_enquiry WHERE project_id = pd.proj_id) as enquiry_count,
        (SELECT COUNT(DISTINCT user_id) FROM project_wishlist WHERE project_id = pd.proj_id) as customer_count
            FROM project_details pd 
            WHERE proj_id = ?
    `, [id]);
        const project = projectResult[0];

        return NextResponse.json({
            project,
            leads,
            pagination: {
                page,
                totalPages: Math.ceil(total / limit),
                total
            }
        });

    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
