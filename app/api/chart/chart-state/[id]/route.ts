import { connectDB } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
// import { getAuthUser } from "@/lib/auth"
import { ChartState } from "@/models/ChartStates"
import mongoose from "mongoose"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    // const authUser = await getAuthUser()

    // if (!authUser) {
    //   return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 })
    // }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid((await params).id)) {
      return NextResponse.json({ error: "شناسه نامعتبر است" }, { status: 400 })
    }

    // Find chart state by ID
    const chartState = await ChartState.findOne({
      _id: (await params).id,
    })

    if (!chartState) {
      return NextResponse.json({ error: "وضعیت چارت یافت نشد" }, { status: 404 })
    }

    return NextResponse.json({
      _id: chartState._id,
      name: chartState.name,
      symbol: chartState.symbol,
      interval: chartState.interval,
      chartData: chartState.chartData,
      createdAt: chartState.createdAt,
      updatedAt: chartState.updatedAt,
    })
  } catch (error) {
    console.error("Chart state fetch error:", error)
    return NextResponse.json({ error: "خطا در دریافت وضعیت چارت" }, { status: 500 })
  }
}
