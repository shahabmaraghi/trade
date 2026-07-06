"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/admin/auth/AuthProvider";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { Button } from "@/components/admin/ui/button";
import { Label } from "@/components/admin/ui/label";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin/dashboard";

  // Check if the user might be an admin based on phone number pattern
  // This is just a UI enhancement - actual role check happens on the server
  useEffect(() => {
    // TODO: Extend checking logic
    setIsAdmin(phone.startsWith("0912") || phone.length >= 10);
  }, [phone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate phone number
    if (!phone || !/^09\d{9}$/.test(phone)) {
      setError("لطفا شماره موبایل معتبر وارد کنید");
      return;
    }

    // Validate password for admin users
    if (isAdmin && !password) {
      setError("برای ورود به پنل، رمز عبور الزامی است");
      return;
    }

    try {
      const user = await login(phone, password);

      // Check if user is admin before redirecting to admin dashboard
      if (user && user.role === "admin") {
        router.push(from);
      } else {
        setError("شما دسترسی به پنل را ندارید");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message || "خطا در ورود. لطفا دوباره تلاش کنید.");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const toPersianDigits = (value: string) => {
    return value.replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
  };

  const toEnglishDigits = (value: string) => {
    return value
      .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
      .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
  };
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>ورود به پلاس چارت</CardTitle>
          <CardDescription>
            برای ورود شماره موبایل خود را وارد کنید
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">شماره موبایل</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="09121234567"
                  value={toPersianDigits(phone)}
                  onChange={(e) => {
                    const value = toEnglishDigits(e.target.value)
                      .replace(/\D/g, "")
                      .slice(0, 11);

                    setPhone(value);
                  }}
                  dir="ltr"
                />
              </div>

              {/* Password field - shown for admin users */}
              {isAdmin && (
                <div className="space-y-2">
                  <Label htmlFor="password">رمز عبور</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="رمز عبور خود را وارد کنید"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      dir="ltr"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {showPassword
                          ? "پنهان کردن رمز عبور"
                          : "نمایش رمز عبور"}
                      </span>
                    </Button>
                  </div>
                </div>
              )}

              {error && <div className="text-red-500 text-sm">{error}</div>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "در حال پردازش..." : "ورود"}
            </Button>
            {/* <div className="text-center text-sm">
              حساب کاربری ندارید؟{" "}
              <Link href="/register" className="text-primary hover:underline">
                ثبت نام کنید
              </Link>
            </div> */}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
