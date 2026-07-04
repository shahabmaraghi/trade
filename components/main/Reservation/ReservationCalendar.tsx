"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/main/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/main/ui/dialog"
import { useToast } from "@/components/main/ui/use-toast"
import { Clock, CalendarIcon, AlertCircle, Star } from "lucide-react"
import Image from "next/image"
import { Calendar as CalendarComponent, DateObject } from "react-multi-date-picker"
import persian from "react-date-object/calendars/persian"
import persian_fa from "react-date-object/locales/persian_fa"
import "react-multi-date-picker/styles/backgrounds/bg-dark.css"
import "react-multi-date-picker/styles/layouts/mobile.css"

interface ReservationCalendarProps {
  consultant: any
  type: "online" | "offline"
}

export default function ReservationCalendar({ consultant, type }: ReservationCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<DateObject | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookedSlots, setBookedSlots] = useState<Record<string, string[]>>({})
  const { toast } = useToast()

  // Persian weekdays - ordered to match the admin panel's weekday order
  // Indexes: 0:شنبه, 1:یکشنبه, 2:دوشنبه, 3:سه‌شنبه, 4:چهارشنبه, 5:پنجشنبه, 6:جمعه
  const persianWeekdays = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"]

  // Fetch booked slots for this consultant
  useEffect(() => {
    const fetchBookedSlots = async () => {
      try {
        if (!consultant._id) return

        const response = await fetch(`/api/reservations?consultantId=${consultant._id}&status=confirmed,pending`)

        if (!response.ok) {
          throw new Error("Failed to fetch booked slots")
        }

        const reservations = await response.json()

        // Organize booked slots by date
        const slots: Record<string, string[]> = {}

        reservations.forEach((reservation: any) => {
          const date = new Date(reservation.date).toISOString().split("T")[0]
          if (!slots[date]) {
            slots[date] = []
          }
          slots[date].push(reservation.time)
        })

        setBookedSlots(slots)
      } catch (error) {
        console.error("Error fetching booked slots:", error)
      }
    }

    fetchBookedSlots()
  }, [consultant._id])

  // Generate time slots based on consultant availability
  useEffect(() => {
    if (!selectedDate) {
      setAvailableTimeSlots([])
      return
    }

    // Get day of week (0-6, where 0 is Sunday in JS Date)
    const dayOfWeek = selectedDate.weekDay.index
    const persianDayName = persianWeekdays[dayOfWeek]

    // Check if consultant is available on this day
    const consultantSchedule = consultant.schedule || {}
    const daySchedule = consultantSchedule[persianDayName]

    if (!daySchedule) {
      setAvailableTimeSlots([])
      return
    }

    // Generate time slots in 30-minute intervals
    const slots = []
    const [startHour, startMinute] = daySchedule.start.split(":").map(Number)
    const [endHour, endMinute] = daySchedule.end.split(":").map(Number)

    let currentHour = startHour
    let currentMinute = startMinute

    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      const timeString = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`
      slots.push(timeString)

      // Increment by 30 minutes
      currentMinute += 30
      if (currentMinute >= 60) {
        currentHour += 1
        currentMinute = 0
      }
    }

    // Filter out already booked slots
    const dateString = selectedDate.format("YYYY-MM-DD")
    const bookedTimesForDate = bookedSlots[dateString] || []

    setAvailableTimeSlots(slots.filter((slot) => !bookedTimesForDate.includes(slot)))
  }, [selectedDate, consultant.schedule, bookedSlots]) // Depend on selectedDate, consultant.schedule, and bookedSlots

  const handleDateSelect = (date: DateObject) => {
    setSelectedDate(date)
    setSelectedTime(null)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handleReservation = async () => {
    if (!selectedDate || !selectedTime) return

    setIsSubmitting(true)

    try {
      // Prepare reservation data
      const reservationData = {
        consultantId: consultant._id,
        date: selectedDate.toDate(),
        time: selectedTime,
        type,
        paymentAmount: consultant.fee || 0,
      }

      // Initiate payment process
      const response = await fetch("/api/reservations/payment/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reservationData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to initiate payment")
      }

      // Store reservation ID in localStorage for verification after payment
      if (data.reservationId) {
        if (typeof window !== "undefined") {
          const { safeStorage } = await import("@/lib/storage")
          safeStorage.setItem("currentReservationId", data.reservationId)
        }
      }

      // Redirect to payment gateway
      if (data.gatewayUrl) {
        window.location.href = data.gatewayUrl
      } else {
        throw new Error("No payment gateway URL provided")
      }
    } catch (error) {
      console.error("Error initiating payment:", error)
      toast({
        title: "خطا در رزرو",
        description:
          error instanceof Error ? error.message : "متأسفانه مشکلی در رزرو وقت مشاوره پیش آمد. لطفاً دوباره تلاش کنید.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  // Check if a day is disabled (before today or after 30 days, or consultant not available)
  const isDateDisabled = (date: DateObject) => {
    const today = new DateObject({ calendar: persian })
    const maxDate = new DateObject({ calendar: persian }).add(30, "day")

    // Check if date is before today or after max date
    if (date.unix < today.unix || date.unix > maxDate.unix) {
      return true
    }

    // Check if consultant is available on this day
    const dayOfWeek = date.weekDay.index
    const persianDayName = persianWeekdays[dayOfWeek]
    return !consultant.schedule || !consultant.schedule[persianDayName]
  }

  // Custom class names for calendar days
  const mapDays = ({ date }: { date: DateObject }) => {
    const isDisabled = isDateDisabled(date)

    if (isDisabled) {
      return {
        disabled: true,
        className: "text-gray-500 opacity-50",
      }
    }

    return {}
  }

  // Format date for display
  const formatDate = (date: DateObject) => {
    return date.format("dddd DD MMMM YYYY", persian_fa as any)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-1/2 bg-[#1a1a1a] rounded-xl p-4 border border-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-white font-medium">تقویم شمسی</h3>
          {selectedDate && <div className="text-sm text-amber-400">{formatDate(selectedDate)}</div>}
        </div>

        <div className="calendar-container" dir="rtl">
          <CalendarComponent
            calendar={persian}
            locale={persian_fa}
            value={selectedDate}
            onChange={handleDateSelect}
            mapDays={mapDays}
            className="bg-dark custom-calendar w-full h-auto rounded-lg p-4 text-white"
            shadow={false}
            hideWeekDays={false}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-gray-400">روز انتخاب شده</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-gray-700"></div>
            <span className="text-gray-400">روز غیرقابل انتخاب</span>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 bg-[#1a1a1a] rounded-xl p-4 border border-gray-800">
        {selectedDate ? (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-white font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-400" />
                زمان‌های در دسترس
              </h3>
              <div className="text-sm text-amber-400 font-medium">{formatDate(selectedDate)}</div>
            </div>

            {availableTimeSlots.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {availableTimeSlots.map((time) => (
                  <button
                    key={time}
                    className={`py-3 px-2 rounded-lg text-sm transition-all ${time === selectedTime
                        ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-medium"
                        : "bg-[#252525] text-white hover:bg-[#303030]"
                      }`}
                    onClick={() => handleTimeSelect(time)}
                  >
                    {time}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <Clock size={40} className="mx-auto mb-3 text-gray-600" />
                <p className="text-gray-400">زمان در دسترسی برای این روز وجود ندارد.</p>
              </div>
            )}

            {selectedTime && (
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="w-full mt-6 bg-gradient-to-r from-amber-500 to-yellow-600 text-black hover:from-amber-600 hover:to-yellow-700"
              >
                تأیید و رزرو وقت مشاوره
              </Button>
            )}
          </>
        ) : (
          <div className="text-center py-10">
            <CalendarIcon size={40} className="mx-auto mb-3 text-gray-600" />
            <p className="text-gray-400">لطفاً ابتدا یک تاریخ را از تقویم انتخاب کنید.</p>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md bg-[#161616] border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-center text-xl text-white">تأیید رزرو وقت مشاوره</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-start gap-4 mb-6">
              <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={consultant.image || "/placeholder.svg?height=100&width=100&query=consultant"}
                  alt={consultant.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold text-white">{consultant.name}</h3>
                <p className="text-sm text-gray-400">{consultant.specialty}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs text-amber-400">{consultant.rating}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#1d1d1d] p-4 rounded-lg border border-gray-800 mb-4">
              <div className="flex items-center gap-2 mb-3 text-amber-400">
                <CalendarIcon className="h-4 w-4" />
                <span className="font-medium">جزئیات رزرو</span>
              </div>

              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="text-gray-400">تاریخ:</div>
                <div className="text-white">{selectedDate ? formatDate(selectedDate) : ""}</div>

                <div className="text-gray-400">ساعت:</div>
                <div className="text-white">{selectedTime}</div>

                <div className="text-gray-400">نوع مشاوره:</div>
                <div className="text-white">{type === "online" ? "آنلاین" : "حضوری"}</div>

                <div className="text-gray-400">هزینه مشاوره:</div>
                <div className="text-white">{consultant.fee?.toLocaleString()} تومان</div>

                {type === "offline" && (
                  <>
                    <div className="text-gray-400">محل مشاوره:</div>
                    <div className="text-white">تهران، خیابان ولیعصر، ساختمان پلاس چارت</div>
                  </>
                )}
              </div>
            </div>

            <div className="text-xs text-gray-400 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-500" />
              <p>
                لطفاً توجه داشته باشید که در صورت عدم حضور در جلسه مشاوره، هزینه پرداختی قابل استرداد نخواهد بود. لغو
                رزرو تا ۲۴ ساعت قبل از زمان مشاوره امکان‌پذیر است.
              </p>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="w-full sm:w-auto border-gray-700 text-gray-900 hover:bg-gray-800 hover:text-white"
            >
              انصراف
            </Button>
            <Button
              onClick={handleReservation}
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-yellow-600 text-black hover:from-amber-600 hover:to-yellow-700"
            >
              {isSubmitting ? "در حال ثبت..." : "تأیید و پرداخت"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
