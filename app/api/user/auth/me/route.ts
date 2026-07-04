import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const authToken = cookieStore.get('auth_token');
        const token = authToken?.value;

        if (!token) {
            return NextResponse.json(
                { message: 'Not authenticated' },
                { status: 401 }
            );
        }

        const user = await verifyToken(token);
        
        if (!user) {
            return NextResponse.json(
                { message: 'Invalid or expired token' },
                { status: 401 }
            );
        }

        // Create a safe user object without any potential sensitive data
        const { _id, id, phone, role, subscriptionPlan, subscriptionExpiry, hasActiveSubscription } = user;
        const safeUser = {
            id: id || _id?.toString(),
            phone,
            role,
            subscriptionPlan,
            subscriptionExpiry,
            hasActiveSubscription
        };
        
        return NextResponse.json(safeUser);

    } catch (error) {
        console.error('Error fetching user data:', error);
        return NextResponse.json(
            { 
                message: 'Error fetching user data',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
