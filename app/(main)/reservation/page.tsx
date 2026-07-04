import type { Metadata } from "next"
import ReservationPage from "@/components/main/Reservation/ReservationPage"
import "react-multi-date-picker/styles/backgrounds/bg-dark.css"
import "react-multi-date-picker/styles/layouts/mobile.css"
import "@/styles/calendar-custom.css"

export const metadata: Metadata = {
  title: "رزرو تایم مشاوره | پلاس چارت",
  description: "رزرو وقت مشاوره آنلاین و حضوری با کارشناسان و تحلیلگران بازار سرمایه در پلاس چارت. همین حالا نوبت خود را ثبت کنید.",
  alternates: {
    canonical: "https://hirmandtrade.ir/reservation",
  },
  openGraph: {
    title: "رزرو تایم مشاوره | پلاس چارت",
    description: "رزرو وقت مشاوره آنلاین و حضوری با کارشناسان و تحلیلگران بازار سرمایه",
    url: "https://hirmandtrade.ir/reservation",
    siteName: "پلاس چارت",
    locale: "fa_IR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "رزرو تایم مشاوره | پلاس چارت",
    description: "رزرو وقت مشاوره آنلاین و حضوری با کارشناسان و تحلیلگران بازار سرمایه",
  },
}

export default function ReservationRoute() {
  return (
    <>
      <ReservationPage />
    </>
  )
}