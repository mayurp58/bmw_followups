import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-this-in-prod');

export async function POST(request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        // Check user in database
        const query = `
            SELECT admin_id, password, role, fname, lname, email, status 
            FROM admin 
            WHERE email = ? AND role = 'admin' AND status = 'active'
        `;
        const [rows] = await pool.query(query, [email]);

        if (rows.length === 0) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const user = rows[0];

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Create JWT
        const token = await new SignJWT({
            userId: user.admin_id,
            email: user.email,
            role: user.role,
            name: `${user.fname} ${user.lname}`
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('24h')
            .sign(SECRET_KEY);

        // Create response
        const response = NextResponse.json({
            success: true,
            user: {
                id: user.admin_id,
                name: `${user.fname} ${user.lname}`,
                email: user.email,
                role: user.role
            }
        });

        // Set Cookie
        response.cookies.set({
            name: 'session_token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 // 24 hours
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
