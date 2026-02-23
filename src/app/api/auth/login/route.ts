import { NextResponse } from 'next/server';
import { verifyCredentials, createSession, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json(
                { error: 'Username dan password wajib diisi' },
                { status: 400 }
            );
        }

        if (!verifyCredentials(username, password)) {
            return NextResponse.json(
                { error: 'Username atau password salah' },
                { status: 401 }
            );
        }

        const token = createSession(username);

        const response = NextResponse.json({ success: true });
        response.cookies.set(SESSION_COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 24 * 60 * 60, // 24 hours
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Login gagal' }, { status: 500 });
    }
}
