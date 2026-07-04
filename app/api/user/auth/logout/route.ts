import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

export async function POST() {
    try {
        const response = NextResponse.json(
            { message: 'Logout successful' },
            { status: 200 }
        );

        clearAuthCookie(response);

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