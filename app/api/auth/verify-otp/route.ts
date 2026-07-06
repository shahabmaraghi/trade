import { type NextRequest, NextResponse } from "next/server"
import { OTPVerification } from "@/models/OTPVerification"
import { User } from "@/models"
import { signToken, applyAuthCookie, type TokenData } from "@/lib/auth"
import { connectDB } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const { phone, code } = await req.json()

    // Validate phone number and code
    if (!phone || !/^09\d{9}$/.test(phone)) {
      return NextResponse.json({ error: "شماره تلفن نامعتبر است" }, { status: 400 })
    }

    if (!code || code.length !== 6) {
      return NextResponse.json({ error: "کد تایید نامعتبر است" }, { status: 400 })
    }

    // Find the OTP verification record
    const otpVerification = await OTPVerification.findOne({ phone, code })

    if (!otpVerification) {
      return NextResponse.json({ error: "کد تایید نامعتبر است یا منقضی شده است", phone, code }, { status: 400 })
    }

    // Check if OTP is expired
    if (new Date() > new Date(otpVerification.expiresAt)) {
      await OTPVerification.deleteOne({ _id: otpVerification._id })
      return NextResponse.json({ error: "کد تایید منقضی شده است" }, { status: 400 })
    }

    // Delete the used OTP
    await OTPVerification.deleteOne({ _id: otpVerification._id })

    // Check if user exists
    const user = await User.findOne({ phone }).populate("subscriptionPlan")
    const userExists = !!user

    if (userExists && user) {
      // User exists, create token and log them in
      // Update last login
      await user.updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } })

      // Create token data with subscription status
      const hasActiveSubscription = user.subscriptionExpiry && new Date(user.subscriptionExpiry) > new Date();
      const tokenData: TokenData = {
        _id: user._id,
        id: user._id?.toString(),
        phone: user.phone,
        role: user.role,
        subscriptionPlan: user.subscriptionPlan?._id?.toString() || "",
        subscriptionExpiry: user.subscriptionExpiry?.toISOString(),
        hasActiveSubscription: hasActiveSubscription ?? false,
      }

      // Sign token and set cookie
      const token = await signToken(tokenData)

      const response = NextResponse.json({
        success: true,
        userExists: true,
        user: {
          id: user._id,
          phone: user.phone,
          fullName: user.fullName,
          role: user.role,
          subscriptionPlan: user.subscriptionPlan
            ? {
              id: user.subscriptionPlan._id,
              title: user.subscriptionPlan.title,
            }
            : null,
          subscriptionExpiry: user.subscriptionExpiry,
        },
      })

      applyAuthCookie(response, token, req.headers.get("host") ?? undefined)

      return response
    }

    // If user doesn't exist, return success but indicate registration is needed
    return NextResponse.json({
      success: true,
      userExists: false,
      message: "کد تایید صحیح است. لطفا ثبت نام را تکمیل کنید",
    })
  } catch (error) {
    console.error("Error verifying OTP:", error)
    return NextResponse.json({ error: "خطا در تایید کد" }, { status: 500 })
  }
}
