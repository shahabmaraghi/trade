import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { verifyToken } from "@/lib/auth";
import { User } from "@/models";
import { connectDBOr503 } from "@/lib/db";

export async function GET() {
    try {
        const dbError = await connectDBOr503();
        if (dbError) return dbError;

        const cookieStore = await cookies();
        const authToken = cookieStore.get("auth_token");
        const token = authToken?.value;

        if (!token) {
            return NextResponse.json(
                { message: "Not authenticated" },
                { status: 401 }
            );
        }

        const authUser = await verifyToken(token);

        if (!authUser) {
            return NextResponse.json(
                { message: "Invalid or expired token" },
                { status: 401 }
            );
        }

        const user = await User.findById(authUser.id)
            .select("-password");

        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const dbError = await connectDBOr503();
        if (dbError) return dbError;

        const cookieStore = await cookies();
        const authToken = cookieStore.get("auth_token");
        const token = authToken?.value;

        if (!token) {
            return NextResponse.json(
                { message: "Not authenticated" },
                { status: 401 }
            );
        }

        const authUser = await verifyToken(token);

        if (!authUser) {
            return NextResponse.json(
                { message: "Invalid or expired token" },
                { status: 401 }
            );
        }

        const body = await req.json();

        const user = await User.findById(authUser.id);

        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        user.fullName = body.fullName ?? user.fullName;
        user.email = body.email ?? user.email;
        user.avatarUrl = body.avatarUrl ?? user.avatarUrl;

        await user.save();

        return NextResponse.json({
            success: true,
            message: "Profile updated successfully",
            data: {
                fullName: user.fullName,
                phone: user.phone,
                email: user.email,
                referralCode: user.referralCode,
                avatarUrl: user.avatarUrl,
            },
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}