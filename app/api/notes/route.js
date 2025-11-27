import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const body = await request.json();
        const { custid, enqid, note, addedby, status, followupdate, followuptime } = body;

        if (!note || !addedby) {
            return NextResponse.json({ error: 'Note and Added By are required' }, { status: 400 });
        }

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            if (enqid) {
                // Insert into project_enquiry_notes
                const insertNoteQuery = `
          INSERT INTO project_enquiry_notes(enq_id, note, added_by, status, followup_date, followup_time, added_at)
VALUES(?, ?, ?, ?, ?, ?, NOW())
    `;
                await connection.query(insertNoteQuery, [
                    enqid,
                    note,
                    addedby,
                    status,
                    followupdate || null,  // Convert empty string to null
                    followuptime || null   // Convert empty string to null
                ]);

                // Update project_enquiry
                if (followupdate) {
                    const updateEnquiryQuery = `
            UPDATE project_enquiry 
            SET followup_date = ?, followup_time = ?, status = ?
    WHERE enq_id = ?
        `;
                    await connection.query(updateEnquiryQuery, [followupdate, followuptime || null, status, enqid]);
                } else if (status) {
                    const updateEnquiryQuery = `
            UPDATE project_enquiry 
            SET status = ?, followup_date = NULL, followup_time = NULL
            WHERE enq_id = ?
    `;
                    await connection.query(updateEnquiryQuery, [status, enqid]);
                }


            } else if (custid) {
                // Insert into customer_notes
                const insertNoteQuery = `
          INSERT INTO customer_notes(cust_id, note, added_by, status, followup_date, followup_time, added_at)
VALUES(?, ?, ?, ?, ?, ?, NOW())
    `;
                await connection.query(insertNoteQuery, [
                    custid,
                    note,
                    addedby,
                    status,
                    followupdate || null,  // Convert empty string to null
                    followuptime || null   // Convert empty string to null
                ]);

                // Update customers
                if (followupdate) {
                    const updateCustomerQuery = `
            UPDATE customers 
            SET followup_date = ?, followup_time = ?, status = ?
    WHERE cust_id = ?
        `;
                    await connection.query(updateCustomerQuery, [followupdate, followuptime || null, status, custid]);
                } else if (status) {
                    const updateCustomerQuery = `
            UPDATE customers 
            SET status = ?, followup_date = NULL, followup_time = NULL
            WHERE cust_id = ?
    `;
                    await connection.query(updateCustomerQuery, [status, custid]);
                }
            } else {
                throw new Error('Either enqid or custid is required');
            }

            await connection.commit();
            return NextResponse.json({ message: 'Note added successfully' });

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
