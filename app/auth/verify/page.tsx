import { Suspense } from "react"
import AuthLayout from "@/components/auth/auth-layout"
import VerifyOTPForm from "@/components/auth/verify-otp-form"

export default function VerifyPage() {
  return (
    <AuthLayout title="تایید شماره تلفن">
      <Suspense fallback={<div>در حال بارگذاری...</div>}>
        <VerifyOTPForm />
      </Suspense>
    </AuthLayout>
  )
}
