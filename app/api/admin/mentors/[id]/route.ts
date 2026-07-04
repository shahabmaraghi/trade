import { NextResponse } from 'next/server';
import Mentor from '@/models/Mentor';
import { getAdminFromSession } from '@/lib/auth';
import { Types } from 'mongoose';

// GET /api/admin/mentors/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ message: 'دسترسی غیر مجاز' }, { status: 403 });
    }

    const { id } = await params

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'شناسه نامعتبر' }, { status: 400 });
    }

    const mentor = await Mentor.findById(id, { password: 0 });

    if (!mentor) {
      return NextResponse.json(
        { message: 'منتور مورد نظر یافت نشد' },
        { status: 404 }
      );
    }

    return NextResponse.json(mentor);
  } catch (error) {
    console.error('Error fetching mentor:', error);
    return NextResponse.json(
      { message: 'خطا در دریافت اطلاعات منتور' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/mentors/[id]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json(
        { message: "دسترسی غیر مجاز" },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "شناسه نامعتبر" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { username, name, password, referral_percent } = body;

    if (
      password &&
      username === undefined &&
      name === undefined &&
      referral_percent === undefined
    ) {
      const mentor = await Mentor.findById(id);

      if (!mentor) {
        return NextResponse.json(
          { message: "منتور مورد نظر یافت نشد" },
          { status: 404 }
        );
      }

      mentor.password = password;
      await mentor.save();

      return NextResponse.json({
        message: "رمز عبور با موفقیت بروزرسانی شد",
      });
    }

  
    if (!username || !name || referral_percent === undefined) {
      return NextResponse.json(
        { message: "لطفا تمام فیلدهای ضروری را پر کنید" },
        { status: 400 }
      );
    }

  
    const existingMentor = await Mentor.findOne({
      username,
      _id: { $ne: id },
    });

    if (existingMentor) {
      return NextResponse.json(
        { message: "این نام کاربری قبلا ثبت شده است" },
        { status: 400 }
      );
    }

    if (
      Number(referral_percent) < 0 ||
      Number(referral_percent) > 100
    ) {
      return NextResponse.json(
        { message: "درصد معرف باید بین ۰ تا ۱۰۰ باشد" },
        { status: 400 }
      );
    }

    const updateData: any = {
      username,
      name,
      referral_percent: Number(referral_percent),
    };

    if (password) {
      updateData.password = password;
    }

    const updatedMentor = await Mentor.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        select: "-password",
      }
    );

    if (!updatedMentor) {
      return NextResponse.json(
        { message: "منتور مورد نظر یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedMentor);
  } catch (error) {
    console.error("Error updating mentor:", error);

    return NextResponse.json(
      { message: "خطا در بروزرسانی منتور" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/mentors/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ message: 'دسترسی غیر مجاز' }, { status: 403 });
    }

    const { id } = await params

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'شناسه نامعتبر' }, { status: 400 });
    }

    const deletedMentor = await Mentor.findByIdAndDelete(id);

    if (!deletedMentor) {
      return NextResponse.json(
        { message: 'منتور مورد نظر یافت نشد' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'منتور با موفقیت حذف شد' });
  } catch (error) {
    console.error('Error deleting mentor:', error);
    return NextResponse.json(
      { message: 'خطا در حذف منتور' },
      { status: 500 }
    );
  }
}
