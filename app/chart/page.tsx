import TradingPlatform from "@/components/chart/trading-platform"
import { getUserFromSession, hasActiveSubscription } from "@/lib/auth"
import { getUserSubscription } from "@/lib/subscription"

export default async function Home() {
  const user = await getUserFromSession()
  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-bold">نیاز به ورود</h1>
          <p className="text-muted-foreground">برای مشاهده چارت ابتدا وارد حساب کاربری خود شوید.</p>
          <a className="inline-block px-4 py-2 rounded-md bg-primary text-primary-foreground" href="/auth/login">
            ورود به حساب
          </a>
        </div>
      </main>
    )
  }

  const active = await hasActiveSubscription(user.id)
  if (!active) {
    const sub = await getUserSubscription(user.id).catch(() => null)
    const expiryText = sub?.expiryDate
      ? new Date(sub.expiryDate).toLocaleString("fa-IR", { dateStyle: "full", timeStyle: "short" })
      : null

    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-xl w-full text-center space-y-4 border rounded-lg p-6 bg-card text-card-foreground">
          <h1 className="text-2xl font-bold">پایان اشتراک</h1>
          <p className="leading-7">
            اشتراک شما فعال نیست یا به پایان رسیده است{expiryText ? ` (تاریخ پایان: ${expiryText})` : ""}. برای ادامه استفاده از
            چارت، لطفاً اشتراک خود را تمدید کنید.
          </p>
          <a
            className="inline-block px-4 py-2 rounded-md bg-primary text-primary-foreground"
            href="/user/subscription"
          >
            تمدید اشتراک
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <TradingPlatform />
    </main>
  )
}
