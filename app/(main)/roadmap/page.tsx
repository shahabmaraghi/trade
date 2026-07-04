import type { Metadata } from "next"
import RoadMap from "@/components/main/RoadMap"

export const metadata: Metadata = {
  title: "نقشه راه | پلاس چارت",
  description: "نقشه راه پروژه پلاس چارت، اهداف آینده، ویژگی‌های در دست توسعه و چشم‌انداز پروژه را مشاهده کنید.",
  alternates: {
    canonical: "https://hirmandtrade.ir/roadmap",
  },
  openGraph: {
    title: "نقشه راه | پلاس چارت",
    description: "نقشه راه پروژه پلاس چارت، اهداف آینده، ویژگی‌های در دست توسعه و چشم‌انداز پروژه را مشاهده کنید.",
    url: "https://hirmandtrade.ir/roadmap",
    siteName: "پلاس چارت",
    locale: "fa_IR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "نقشه راه | پلاس چارت",
    description: "نقشه راه پروژه پلاس چارت، اهداف آینده، ویژگی‌های در دست توسعه و چشم‌انداز پروژه را مشاهده کنید.",
  },
}

export default function RoadMapPage() {
  return <RoadMap />
}