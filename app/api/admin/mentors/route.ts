import { NextResponse } from 'next/server';
import Mentor from '@/models/Mentor';
import { getAdminFromSession } from '@/lib/auth';
import randomString from '@/lib/randomString';

// GET /api/admin/mentors
export async function GET() {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ message: 'دسترسی غیر مجاز' }, { status: 403 });
    }

    const mentors = await Mentor.find({}, { password: 0 }).sort({ createdAt: -1 });
    return NextResponse.json(mentors);
  } catch (error) {
    console.error('Error fetching mentors:', error);
    return NextResponse.json(
      { message: 'خطا در دریافت اطلاعات منتورها' },
      { status: 500 }
    );
  }
}

// POST /api/admin/mentors
export async function POST(request: Request) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ message: 'دسترسی غیر مجاز' }, { status: 403 });
    }

    const { username, name, password, referral_percent } = await request.json();
    
    if (!username || !name || !password || referral_percent === undefined) {
      return NextResponse.json(
        { message: 'لطفا تمام فیلدهای ضروری را پر کنید' },
        { status: 400 }
      );
    }
    
    // Check if username already exists
    const existingMentor = await Mentor.findOne({ username });
    if (existingMentor) {
      return NextResponse.json(
        { message: 'این نام کاربری قبلا ثبت شده است' },
        { status: 400 }
      );
    }

    // Validate referral percent
    if (Number(referral_percent) < 0 || Number(referral_percent) > 100) {
      return NextResponse.json(
        { message: 'درصد معرف باید بین ۰ تا ۱۰۰ باشد' },
        { status: 400 }
      );
    }

    const mentor = new Mentor({
      username,
      name,
      referral_percent: Number(referral_percent) || 0,
      password, // Password will be hashed by the pre-save hook
      referralCode: randomString(20),
      wallet: 0,
    });

    await mentor.save();
    
    // Exclude password from the response
    const { password: _, ...result } = mentor.toObject();
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating mentor:', error);
    return NextResponse.json(
      { message: 'خطا در ایجاد منتور جدید' },
      { status: 500 }
    );
  }
}
