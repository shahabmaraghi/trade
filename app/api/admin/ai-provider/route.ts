import { NextRequest, NextResponse } from "next/server";
import AiSetting from "@/models/AiSetting";
import { connectDBOr503 } from "@/lib/db";

type AiProvider = "chatgpt" | "gapgpt";

export async function GET() {
  try {
    const dbError = await connectDBOr503();
    if (dbError) return dbError;

    const setting = await AiSetting.findOneAndUpdate(
      { key: "global" },
      {
        $setOnInsert: {
          activeProvider: "chatgpt",
        },
      },
      {
        new: true,
        upsert: true,
      },
    );

    return NextResponse.json({
      success: true,
      activeProvider: setting.activeProvider,
    });
  } catch (error) {
    console.error("GET AI Provider Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "خطا در دریافت تنظیمات هوش مصنوعی",
      },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const dbError = await connectDBOr503();
    if (dbError) return dbError;

    const body = await req.json();
    const activeProvider = body.activeProvider as AiProvider;

    if (!["chatgpt", "gapgpt"].includes(activeProvider)) {
      return NextResponse.json(
        {
          success: false,
          message: "سرویس انتخاب‌شده معتبر نیست",
        },
        { status: 400 },
      );
    }

    const setting = await AiSetting.findOneAndUpdate(
      { key: "global" },
      {
        activeProvider,
      },
      {
        new: true,
        upsert: true,
      },
    );

    return NextResponse.json({
      success: true,
      message: "تنظیمات هوش مصنوعی ذخیره شد",
      activeProvider: setting.activeProvider,
    });
  } catch (error) {
    console.error("PUT AI Provider Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "خطا در ذخیره تنظیمات هوش مصنوعی",
      },
      { status: 500 },
    );
  }
}
