"use client"
import { Suspense } from "react"
import RegisterForm from "@/components/auth/register-form"
import AuthLayout from "@/components/auth/auth-layout"

export default function RegisterPage() {
  return (
    <AuthLayout title="تکمیل ثبت نام">
      <Suspense fallback={<div>در حال بارگذاری...</div>}>
          <RegisterForm />
      </Suspense>
    </AuthLayout>
  )
}
