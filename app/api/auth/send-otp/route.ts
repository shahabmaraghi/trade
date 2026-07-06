import { type NextRequest, NextResponse } from "next/server";
import { OTPVerification } from "@/models/OTPVerification";
import { User } from "@/models";
import normalizePhonenumber from "@/lib/normalizePhonenumber";
import sendPattern from "@/lib/sendPattern";
import { connectDBOr503 } from "@/lib/db";

// Function to generate a random 6-digit code
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendSMS(phone: string, code: string): Promise<boolean> {
  console.log(`Sending OTP ${code} to ${phone}`);

  const result = await sendPattern(
    "p1GTRIEWAXYZBKxSg0Ai6DhGeG8X0zvjYLcJOsb56FjmDt0fLV",
    // normalizePhonenumber(phone),
    phone,
    {
      "code": code,
    },
  );

  return result;
}
export async function POST(req: NextRequest) {
  try {
    const dbError = await connectDBOr503();
    if (dbError) return dbError;

    const { phone } = await req.json();
    console.log("PHONE:", phone);

    if (!phone || !/^09\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: "شماره تلفن نامعتبر است" },
        { status: 400 },
      );
    }

    const code = generateOTP();
    console.log("OTP:", code);

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 2);

    console.log("Deleting old OTP...");
    await OTPVerification.deleteMany({ phone });

    console.log("Creating OTP...");
    await OTPVerification.create({ phone, code, expiresAt });

    console.log("Sending SMS...");
    const smsSent = await sendSMS(phone, code);

    console.log("SMS RESULT:", smsSent);

    if (!smsSent) {
      return NextResponse.json(
        { error: "خطا در ارسال پیامک" },
        { status: 500 },
      );
    }

    const userExists = await User.exists({ phone });

    return NextResponse.json({
      success: true,
      message: "کد تایید با موفقیت ارسال شد",
      userExists: !!userExists,
    });
  } catch (error) {
    console.error("🔥 FULL OTP ERROR:", error);
    return NextResponse.json(
      { error: "خطا در ارسال کد تایید", detail: String(error) },
      { status: 500 },
    );
  }
}
