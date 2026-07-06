import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { clearAuthCookie } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        // Get the cookies instance
        const cookieStore = await cookies();

        // Check if the auth cookie exists
        const hasAuthCookie = cookieStore.has('auth_token');

        if (!hasAuthCookie) {
            return NextResponse.json(
                { message: 'Already logged out' },
                { status: 200 }
            );
        }

        const response = NextResponse.json(
            { message: 'Logout successful' },
            { status: 200 }
        );

        clearAuthCookie(response, request.headers.get("host") ?? undefined);

        return response;
    } catch (error) {
        console.error('User logout error:', error);
        return NextResponse.json(
            {
                message: 'Logout failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}