import { connectDB } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import ChartState from "@/models/ChartState"
import { getSession } from "@/lib/mentors/auth"

// Get a specific chart
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { id } = await params

    const chart = await ChartState.findOne({
      _id: id,
      userId: session.userId,
    })

    if (!chart) {
      return NextResponse.json({ error: "Chart not found" }, { status: 404 })
    }

    return NextResponse.json({ chart })
  } catch (error) {
    console.error("Get chart error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Update a chart
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { id } = await params
    const { name, chartData, symbol, interval } = await request.json()

    const chart = await ChartState.findOneAndUpdate(
      { _id: id, userId: session.userId },
      {
        ...(name && { name }),
        ...(chartData && { chartData }),
        ...(symbol && { symbol }),
        ...(interval && { interval }),
        updatedAt: new Date(),
      },
      { new: true },
    )

    if (!chart) {
      return NextResponse.json({ error: "Chart not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      chart: {
        id: chart._id,
        name: chart.name,
        symbol: chart.symbol,
        interval: chart.interval,
        updatedAt: chart.updatedAt,
      },
    })
  } catch (error) {
    console.error("Update chart error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Delete a chart
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { id } = await params

    const chart = await ChartState.findOneAndDelete({
      _id: id,
      userId: session.userId,
    })

    if (!chart) {
      return NextResponse.json({ error: "Chart not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete chart error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
