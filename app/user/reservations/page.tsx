"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/main/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/main/ui/tabs"
import { Badge } from "@/components/main/ui/badge"
import { Button } from "@/components/main/ui/button"
import { Skeleton } from "@/components/main/ui/skeleton"
import { Calendar, Clock, User, MapPin, AlertCircle } from "lucide-react"
import { useToast } from "@/components/main/ui/use-toast"
import Link from "next/link"

export default function UserReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    fetchReservations()
  }, [])

  const fetchReservations = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/reservations/user")

      if (!response.ok) {
        throw new Error("Failed to fetch reservations")
      }

      const data = await response.json()
      setReservations(data)
    } catch (error) {
      console.error("Error fetching reservations:", error)
      toast({
        title: "خطا در دریافت اطلاعات",
        description: "متأسفانه در دریافت لیست رزروها مشکلی پیش آمده است. لطفاً دوباره تلاش کنید.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-500">
            در انتظار تایید
          </Badge>
        )
      case "confirmed":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500">
            تایید شده
          </Badge>
        )
      case "completed":
        return <Badge className="bg-green-600">انجام شده</Badge>
      case "cancelled":
        return <Badge variant="destructive">لغو شده</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Get payment status badge
  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-600">پرداخت شده</Badge>
      case "pending":
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-500">
            در انتظار پرداخت
          </Badge>
        )
      case "failed":
        return <Badge variant="destructive">ناموفق</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Filter reservations based on active tab
  const getFilteredReservations = () => {
    if (activeTab === "all") return reservations
    return reservations.filter((r) => r.status === activeTab)
  }

  const filteredReservations = getFilteredReservations()

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">رزروهای مشاوره من</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="all">همه</TabsTrigger>
          <TabsTrigger value="confirmed">تایید شده</TabsTrigger>
          <TabsTrigger value="completed">انجام شده</TabsTrigger>
          <TabsTrigger value="cancelled">لغو شده</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border border-gray-800 bg-[#161616]">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredReservations.length > 0 ? (
            <div className="space-y-4">
              {filteredReservations.map((reservation) => (
                <Card key={reservation._id} className="border border-gray-800 bg-[#161616]">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{reservation.consultantId?.name || "مشاور"}</CardTitle>
                        <CardDescription>{reservation.consultantId?.specialty || ""}</CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {getStatusBadge(reservation.status)}
                        {getPaymentBadge(reservation.paymentStatus)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-400 ml-1">تاریخ:</span>
                        <span>{formatDate(reservation.date)}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-400 ml-1">ساعت:</span>
                        <span>{reservation.time}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        {reservation.type === "online" ? (
                          <User className="h-4 w-4 text-gray-400" />
                        ) : (
                          <MapPin className="h-4 w-4 text-gray-400" />
                        )}
                        <span className="text-gray-400 ml-1">نوع مشاوره:</span>
                        <span>{reservation.type === "online" ? "آنلاین" : "حضوری"}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-400 ml-1">مبلغ:</span>
                        <span>{reservation.paymentAmount?.toLocaleString()} تومان</span>
                      </div>

                      {reservation.status === "confirmed" && (
                        <div className="mt-4 p-3 bg-[#1a1a1a] rounded-lg border border-gray-800 text-sm">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                            <p className="text-amber-400">
                              مشاوران ما راس ساعت اعلام شده با شما تماس خواهند گرفت. لطفاً در زمان تعیین شده در دسترس
                              باشید.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-[#161616] rounded-lg border border-gray-800">
              <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-gray-800/50 mb-4">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">هیچ رزروی یافت نشد</h3>
              <p className="text-gray-400 mb-6">شما هنوز هیچ رزرو مشاوره‌ای در این وضعیت ندارید.</p>
              <Button
                asChild
                className="bg-gradient-to-r from-amber-500 to-yellow-600 text-black hover:from-amber-600 hover:to-yellow-700"
              >
                <Link href="/reservation">رزرو مشاوره جدید</Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
