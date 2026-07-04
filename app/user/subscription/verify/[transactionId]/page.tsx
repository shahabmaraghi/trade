import PaymentStatus from "@/components/user/subscription/payment-status"

export default async function VerifyPaymentPage({ params }: { params: Promise<{ transactionId: string }> }) {
  return <PaymentStatus transactionId={(await params).transactionId} />
}
