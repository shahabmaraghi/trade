import type { Metadata } from "next"
import Analyses from "@/components/main/Analyses"

export const metadata: Metadata = {
  title: "تحلیل‌های بازار | پلاس چارت",
  description: "جدیدترین تحلیل‌های تکنیکال و بنیادی بازارهای مالی، ارزهای دیجیتال و بورس توسط کارشناسان پلاس چارت.",
  alternates: {
    canonical: "https://hirmandtrade.ir/analyses",
  },
  openGraph: {
    title: "تحلیل‌های بازار | پلاس چارت",
    description: "جدیدترین تحلیل‌های تکنیکال و بنیادی بازارهای مالی، ارزهای دیجیتال و بورس.",
    url: "https://hirmandtrade.ir/analyses",
    siteName: "پلاس چارت",
    locale: "fa_IR",
    type: "website",
  },
}

export default function AnalysesPage() {
  return <Analyses />
}