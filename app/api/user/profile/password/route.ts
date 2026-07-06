import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { connectDBOr503 } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import { User } from "@/models"

export async function PATCH(req: NextRequest) {
    try {
        const dbError = await connectDBOr503()
        if (dbError) return dbError

        const cookieStore = await cookies()
        const token = cookieStore.get("auth_token")?.value

        if (!token) {
            return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
        }

        const authUser = await verifyToken(token)
        if (!authUser) {
            return NextResponse.json({ message: "Invalid token" }, { status: 401 })
        }

        const { currentPassword, newPassword, confirmPassword } = await req.json()

        if (!currentPassword || !newPassword || !confirmPassword) {
            return NextResponse.json({ message: "All fields required" }, { status: 400 })
        }

        if (newPassword !== confirmPassword) {
            return NextResponse.json({ message: "Passwords not match" }, { status: 400 })
        }

        const user = await User.findById(authUser.id)
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 })
        }

        // check old password
        const isValid = await user.comparePassword(currentPassword)

        if (!isValid) {
            return NextResponse.json({ message: "Wrong current password" }, { status: 400 })
        }

        // IMPORTANT: let mongoose pre-save hash it
        user.password = newPassword
        await user.save()

        return NextResponse.json({
            success: true,
            message: "Password updated successfully",
        })
    } catch (err) {
        return NextResponse.json({ message: "Server error" }, { status: 500 })
    }
}