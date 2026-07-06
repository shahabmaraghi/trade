"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { safeStorage } from "@/lib/storage";
import { Eye, EyeOff } from "lucide-react";
export default function RegisterForm() {
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [referrer, setReferrer] = useState("");
  const [mentorReferrer, setMentorReferrer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [showUserRef, setShowUserRef] = useState(false);
  const [showMentorRef, setShowMentorRef] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    // Capture referral codes first so they are not lost if we redirect
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get("ref");
    if (refCode) {
      setReferrer(refCode);
      safeStorage.setItem("referral_code", refCode, "local");
    } else {
      const storedRef = safeStorage.getItem("referral_code", "local");
      if (storedRef) setReferrer(storedRef);
    }

    const mentorCode = urlParams.get("mentor");
    if (mentorCode) {
      setMentorReferrer(mentorCode);
      safeStorage.setItem("mentor_referral_code", mentorCode, "local");
    } else {
      const storedMentor = safeStorage.getItem("mentor_referral_code", "local");
      if (storedMentor) setMentorReferrer(storedMentor);
    }

    // Get phone from session storage, redirect if missing (codes already persisted)
    const storedPhone = safeStorage.getItem("auth_phone", "session");
    if (!storedPhone) {
      router.replace("/auth/login");
      return;
    }
    setPhone(storedPhone);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Register user
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          phone,
          fullName,
          password,
          referrer,
          mentorReferrer,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "خطا در ثبت نام");
      }

      // Refresh user data in auth context
      await refreshUser();

      // Clear session storage and referral code
      safeStorage.removeItem("auth_phone", "session");
      safeStorage.removeItem("referral_code", "local");
      safeStorage.removeItem("mentor_referral_code", "local");

      // Redirect to user dashboard
      window.location.assign("/user")
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطایی رخ داد");
    } finally {
      setIsLoading(false);
    }
  };
const toPersianDigits = (value: string) =>
  value.replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);

const toEnglishDigits = (value: string) =>
  value.replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)));
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert
          variant="destructive"
          className="bg-red-900/20 border-red-900 text-red-300"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-white">
          شماره تلفن همراه
        </Label>
       <Input
  id="phone"
  type="tel"
  value={toPersianDigits(phone)}
  readOnly
  className="bg-gray-800/50 [font-family:var(--font-iransans-fanum)] border-gray-700 text-white text-right opacity-70"
  dir="ltr"
/>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-white">
          نام و نام خانوادگی (اختیاری)
        </Label>
        <Input
          id="fullName"
          type="text"
          placeholder="نام و نام خانوادگی خود را وارد کنید"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 text-right"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-white">
          رمز عبور (اختیاری)
        </Label>

        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="رمز عبور خود را وارد کنید"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 pl-10"
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            aria-label={showPassword ? "پنهان کردن رمز عبور" : "نمایش رمز عبور"}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        <p className="text-xs text-gray-400">
          در صورت عدم تعیین رمز عبور، ورود به سیستم فقط از طریق کد تایید
          امکان‌پذیر خواهد بود.
        </p>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="referrer"
          className="text-white flex items-center justify-between cursor-pointer select-none"
          onClick={() => setShowUserRef((s) => !s)}
        >
          <span>کد معرف (اختیاری)</span>
          {showUserRef ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Label>
        {showUserRef && (
          <Input
            id="referrer"
            type="text"
            placeholder="در صورت وجود، کد معرف را وارد کنید"
            value={referrer}
            onChange={(e) => setReferrer(e.target.value)}
            className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 text-right"
          />
        )}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="mentorReferrer"
          className="text-white flex items-center justify-between cursor-pointer select-none"
          onClick={() => setShowMentorRef((s) => !s)}
        >
          <span>کد معرف منتور (اختیاری)</span>
          {showMentorRef ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Label>
        {showMentorRef && (
          <Input
            id="mentorReferrer"
            type="text"
            placeholder="در صورت وجود، کد یا نام کاربری منتور را وارد کنید"
            value={mentorReferrer}
            onChange={(e) => setMentorReferrer(e.target.value)}
            className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 text-right"
          />
        )}
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-black font-medium"
        disabled={isLoading}
      >
        {isLoading ? "در حال ثبت نام..." : "تکمیل ثبت نام"}
      </Button>
    </form>
  );
}
