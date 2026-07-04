import { type NextRequest, NextResponse } from "next/server"
import Mentor from "@/models/Mentor"
import { createSession } from "@/lib/mentors/auth"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "نام کاربری و رمز عبوری اجباری هستند" }, { status: 400 })
    }

    const mentor = await Mentor.findOne({ username })
    if (!mentor) {
      return NextResponse.json({ error: "نام کاربری یا رمز عبور اشتباه است" }, { status: 401 })
    }

    const isPasswordValid = await mentor.comparePassword(password)
    if (!isPasswordValid) {
      return NextResponse.json({ error: "نام کاربری یا رمز عبور اشتباه است" }, { status: 401 })
    }

    await createSession({
      userId: mentor._id?.toString() || "",
      username: mentor.username,
      name: mentor.name,
    })

    return NextResponse.json({
      success: true,
      mentor: {
        id: mentor._id?.toString() || "",
        username: mentor.username,
        name: mentor.name,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
