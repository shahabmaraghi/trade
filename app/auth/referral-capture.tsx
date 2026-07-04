"use client"
import dynamic from "next/dynamic"

const ReferralCapture = dynamic(() => import("@/components/auth/referral-capture"), { ssr: false })

export default function ReferralCaptureComponent() {
    return <ReferralCapture />
}
