"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { safeStorage } from "@/lib/storage";

export default function LoginForm() {
  const [phone, setPhone] = useState("");
  const [userRefCode, setUserRefCode] = useState("");
  const [mentorRefCode, setMentorRefCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [showUserRef, setShowUserRef] = useState(false);
  const [showMentorRef, setShowMentorRef] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    const mentor = params.get("mentor");
    if (ref) {
      setUserRefCode(ref);
      safeStorage.setItem("referral_code", ref, "local");
    } else {
      const storedRef = safeStorage.getItem("referral_code", "local");
      if (storedRef) setUserRefCode(storedRef);
    }
    if (mentor) {
      setMentorRefCode(mentor);
      safeStorage.setItem("mentor_referral_code", mentor, "local");
    } else {
      const storedMentor = safeStorage.getItem("mentor_referral_code", "local");
      if (storedMentor) setMentorRefCode(storedMentor);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate phone number
      if (!phone || !/^09\d{9}$/.test(phone)) {
        throw new Error("لطفا یک شماره تلفن معتبر وارد کنید");
      }

      // Send OTP request
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "خطا در ارسال کد تایید");
      }

      // Store phone in session storage for the next step
      safeStorage.setItem("auth_phone", phone, "session");
      // Persist referral info for registration step
      if (userRefCode)
        safeStorage.setItem("referral_code", userRefCode, "local");
      if (mentorRefCode)
        safeStorage.setItem("mentor_referral_code", mentorRefCode, "local");

      // Redirect to verification page
      router.push("/auth/verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطایی رخ داد");
    } finally {
      setIsLoading(false);
    }
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
          placeholder="۰۹۱۲۱۲۳۴۵۶۷"
          value={toPersianDigits(phone)}
          onChange={(e) => {
            const value = toEnglishDigits(e.target.value)
              .replace(/\D/g, "")
              .slice(0, 11);

            setPhone(value);
          }}
          className="bg-gray-800/50 [font-family:var(--font-iransans-fanum)] border-gray-700 text-white placeholder:text-gray-500 text-right"
          dir="ltr"
          required
        />
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="userRefCode"
          className="text-white flex items-center justify-between cursor-pointer select-none"
          onClick={() => setShowUserRef((s) => !s)}
        >
          <span>کد معرف کاربر (اختیاری)</span>
          {showUserRef ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Label>
        {showUserRef && (
          <Input
            id="userRefCode"
            type="text"
            placeholder="کد یا شماره معرف"
            value={toPersianDigits(userRefCode)}
            onChange={(e) => setUserRefCode(toEnglishDigits(e.target.value))}
            className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 text-right"
            dir="ltr"
          />
        )}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="mentorRefCode"
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
            id="mentorRefCode"
            type="text"
            placeholder="کد یا نام کاربری منتور"
            value={toPersianDigits(mentorRefCode)}
            onChange={(e) => setMentorRefCode(toEnglishDigits(e.target.value))}
            className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 text-right"
            dir="ltr"
          />
        )}
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-black font-medium"
        disabled={isLoading}
      >
        {isLoading ? "در حال ارسال..." : "دریافت کد تایید"}
      </Button>
    </form>
  );
}
