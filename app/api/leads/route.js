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
            whereClause += ' AND (pe.cust_name LIKE ? OR pe.cust_mobile LIKE ?)';
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

        const countQuery = `
      SELECT COUNT(*) as total 
      FROM project_enquiry pe 
      ${whereClause}
    `;

        const [countResult] = await pool.query(countQuery, queryParams);
        const total = countResult[0].total;

        const query = `
      SELECT 
        pe.enq_id, pe.cust_name, pe.cust_mobile, pe.status, pe.followup_date, pe.followup_time, pe.date_added,
        pd.poj_name as project_name,
        (SELECT note FROM project_enquiry_notes WHERE enq_id = pe.enq_id ORDER BY added_at DESC LIMIT 1) as last_note
      FROM project_enquiry pe
      LEFT JOIN project_details pd ON pe.project_id = pd.proj_id
      ${whereClause}
      ORDER BY pe.date_added DESC
      LIMIT ? OFFSET ?
    `;

        const [rows] = await pool.query(query, [...queryParams, limit, offset]);

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
