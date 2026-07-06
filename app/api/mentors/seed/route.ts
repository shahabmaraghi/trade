import { connectDBOr503 } from "@/lib/db"
import { NextResponse } from "next/server"
import Mentor from "@/models/Mentor"

export async function GET() {
  try {
    const dbError = await connectDBOr503()
    if (dbError) return dbError

    
    // Check if mentor already exists
    const existingMentor = await Mentor.findOne({ username: "hirmand" })
    if (existingMentor) {
      return NextResponse.json({
        message: "Seed mentor already exists",
        mentor: {
          username: "hirmand",
          password: "demo123",
        },
      })
    }

    // Create demo mentor
    const mentor = await Mentor.create({
      username: "hirmand",
      password: "demo123",
      name: "Demo Mentor User",
    })

    return NextResponse.json({
      message: "Seed mentor created successfully",
      mentor: {
        email: "hirmand",
        password: "demo123",
        id: mentor._id,
      },
    })
  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
