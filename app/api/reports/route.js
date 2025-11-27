import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const fromDate = searchParams.get('fromDate');
        const toDate = searchParams.get('toDate');
        const agent = searchParams.get('agent');

        let dateFilter = '';
        const params = [];

        if (fromDate) {
            dateFilter += ' AND DATE(date_added) >= ?';
            params.push(fromDate);
        }
        if (toDate) {
            dateFilter += ' AND DATE(date_added) <= ?';
            params.push(toDate);
        }

        // 1. Leads by Status
        const statusQuery = `
      SELECT status, COUNT(*) as count 
      FROM project_enquiry 
      WHERE 1 = 1 ${dateFilter}
      GROUP BY status
    `;
        const [statusData] = await pool.query(statusQuery, params);

        // 2. Project-wise Distribution
        const projectQuery = `
      SELECT pd.poj_name, COUNT(*) as count
      FROM project_enquiry pe
      JOIN project_details pd ON pe.project_id = pd.proj_id
      WHERE 1 = 1 ${dateFilter}
      GROUP BY pd.poj_name
      ORDER BY count DESC
      LIMIT 10
    `;
        const [projectData] = await pool.query(projectQuery, params);

        // 3. Conversion Funnel (Simplified based on status)
        // Stages: New -> Interested -> Site Visit -> Booking
        // This is tricky without a status history table. I'll just count current statuses.
        // Assuming 'New' is leads without status or 'New'.
        const funnelData = [
            { name: 'Total Leads', value: 0, fill: '#8884d8' },
            { name: 'Interested', value: 0, fill: '#83a6ed' },
            { name: 'Site Visit', value: 0, fill: '#8dd1e1' },
            { name: 'Booking', value: 0, fill: '#82ca9d' }
        ];

        // Fetch total counts for these categories
        // I'll reuse statusData to populate this.
        let totalLeads = 0;
        statusData.forEach(row => {
            totalLeads += row.count;
            if (row.status === 'Interested') funnelData[1].value += row.count;
            if (row.status === 'Site visit done') funnelData[2].value += row.count;
            if (row.status === 'Booking done' || row.status === 'Already Booked') funnelData[3].value += row.count;
        });
        funnelData[0].value = totalLeads;


        return NextResponse.json({
            statusData,
            projectData,
            funnelData
        });

    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
