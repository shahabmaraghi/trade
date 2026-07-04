import { type NextRequest, NextResponse } from "next/server"
import ChartState from "@/models/ChartState"
import { getSession } from "@/lib/mentors/auth"

// Get all charts for the current user
export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const charts = await ChartState.find({ userId: session.userId })
      .sort({ updatedAt: -1 })
      .select("_id name symbol interval createdAt updatedAt")

    return NextResponse.json({ charts })
  } catch (error) {
    console.error("Get charts error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Create a new chart
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { name, chartData, symbol, interval } = await request.json()

    if (!name || !chartData) {
      return NextResponse.json({ error: "Name and chart data are required" }, { status: 400 })
    }

    if (!symbol || !interval) {
      return NextResponse.json({ error: "Symbol and interval are required" }, { status: 400 })
    }

    const chart = await ChartState.create({
      userId: session.userId,
      name,
      chartData,
      symbol: symbol,
      interval: interval,
    })

    return NextResponse.json({
      success: true,
      chart: {
        id: chart._id,
        name: chart.name,
        symbol: chart.symbol,
        interval: chart.interval,
        createdAt: chart.createdAt,
        updatedAt: chart.updatedAt,
      },
    })
  } catch (error) {
    console.error("Create chart error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
