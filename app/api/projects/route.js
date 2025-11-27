import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        // Get all projects with both enquiry and customer lead counts
        const query = `
            SELECT 
                pd.proj_id,
                pd.poj_name,
                COALESCE(enq_counts.enquiry_count, 0) as enquiry_count,
                COALESCE(cust_counts.customer_count, 0) as customer_count,
                (COALESCE(enq_counts.enquiry_count, 0) + COALESCE(cust_counts.customer_count, 0)) as total_count
            FROM project_details pd
            LEFT JOIN (
                SELECT project_id, COUNT(*) as enquiry_count
                FROM project_enquiry
                GROUP BY project_id
            ) enq_counts ON pd.proj_id = enq_counts.project_id
            LEFT JOIN (
                SELECT project_id, COUNT(DISTINCT user_id) as customer_count
                FROM project_wishlist
                GROUP BY project_id
            ) cust_counts ON pd.proj_id = cust_counts.project_id
            ORDER BY total_count DESC, pd.poj_name ASC
        `;

        const [projects] = await pool.query(query);

        return NextResponse.json({ projects });

    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
