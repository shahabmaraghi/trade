import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
    try {
        // Get the cookies instance
        const cookieStore = await cookies()

        // Check if the auth cookie exists
        const hasAuthCookie = cookieStore.has('auth_token')

        if (!hasAuthCookie) {
            return NextResponse.json(
                { message: 'Already logged out' },
                { status: 200 }
            )
        }

        // Delete the auth cookie
        cookieStore.delete('auth_token')

        // Return success response
        return NextResponse.json(
            { message: 'Logout successful' },
            {
                status: 200,
            }
        )
    } catch (error) {
        console.error('Logout error:', error)
        return NextResponse.json(
            { message: 'Logout failed', error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}