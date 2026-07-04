"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/main/ui/tabs"
import { Skeleton } from "@/components/main/ui/skeleton"
import { Button } from "@/components/main/ui/button"
import { useToast } from "@/components/main/ui/use-toast"
import ConsultantCard from "./ConsultantCard"
import ReservationCalendar from "./ReservationCalendar"
import { CalendarClock, Users, AlertCircle } from "lucide-react"

export default function ReservationPage() {
  const [consultants, setConsultants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedConsultant, setSelectedConsultant] = useState<any>(null)
  const [reservationType, setReservationType] = useState("online")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error("Error checking authentication:", error)
        setIsAuthenticated(false)
      } finally {
        setAuthChecking(false)
      }
    }

    checkAuth()
  }, [])

  // Fetch consultants
  useEffect(() => {
    const fetchConsultants = async () => {
      try {
        setLoading(true)

        // Build query parameters based on reservation type
        const queryParams = new URLSearchParams()
        if (reservationType === "online") {
          queryParams.append("onlineAvailable", "true")
        } else {
          queryParams.append("offlineAvailable", "true")
        }

        const response = await fetch(`/api/consultants?${queryParams.toString()}`)

        if (!response.ok) {
          throw new Error("Failed to fetch consultants")
        }

        const data = await response.json()
        setConsultants(data)
      } catch (error) {
        console.error("Error fetching consultants:", error)
        toast({
          title: "خطا در دریافت اطلاعات",
          description: "متأسفانه در دریافت لیست مشاوران مشکلی پیش آمده است. لطفاً دوباره تلاش کنید.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (!authChecking) {
      fetchConsultants()
    }
  }, [reservationType, authChecking, toast])

  // Redirect to login if not authenticated
  const handleLoginRedirect = () => {
    router.push("/auth/login?redirect=/reservation")
  }

  const handleConsultantSelect = (consultant: any) => {
    setSelectedConsultant(consultant)

    // Scroll to calendar section on mobile
    if (window.innerWidth < 768) {
      setTimeout(() => {
        document.getElementById("calendar-section")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }, 100)
    }
  }

  const handleReservationTypeChange = (value: string) => {
    setReservationType(value)
    setSelectedConsultant(null)
  }

  return (
    <div className="bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] min-h-screen pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300">
            رزرو تایم مشاوره
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
            با مشاوران متخصص ما گفتگو کنید و از راهنمایی‌های حرفه‌ای بهره‌مند شوید. می‌توانید به صورت آنلاین یا حضوری وقت
            مشاوره رزرو کنید.
          </p>
        </div>

        {authChecking ? (
          <div className="flex justify-center items-center py-20">
            <Skeleton className="h-32 w-full max-w-md rounded-xl" />
          </div>
        ) : !isAuthenticated ? (
          <div className="bg-[#161616] rounded-xl shadow-xl overflow-hidden border border-gray-800 p-8 text-center">
            <AlertCircle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-white">
              برای رزرو مشاوره نیاز به ورود به حساب کاربری دارید
            </h2>
            <p className="text-gray-400 mb-6">
              لطفاً وارد حساب کاربری خود شوید یا ثبت‌نام کنید تا بتوانید از خدمات مشاوره استفاده کنید.
            </p>
            <Button
              onClick={handleLoginRedirect}
              className="bg-gradient-to-r from-amber-500 to-yellow-600 text-black hover:from-amber-600 hover:to-yellow-700"
            >
              ورود به حساب کاربری
            </Button>
          </div>
        ) : (
          <div className="bg-[#161616] rounded-xl shadow-xl overflow-hidden border border-gray-800">
            <Tabs defaultValue="online" onValueChange={handleReservationTypeChange} className="w-full">
              <div className="bg-[#0d0d0d] p-2 border-b border-gray-800">
                <TabsList className="grid w-full grid-cols-2 h-12 bg-[#1a1a1a] rounded-lg">
                  <TabsTrigger
                    value="online"
                    className="flex items-center gap-2 text-sm md:text-base rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-yellow-600 data-[state=active]:text-black"
                  >
                    <CalendarClock className="h-4 w-4" />
                    مشاوره آنلاین
                  </TabsTrigger>
                  <TabsTrigger
                    value="offline"
                    className="flex items-center gap-2 text-sm md:text-base rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-yellow-600 data-[state=active]:text-black"
                  >
                    <Users className="h-4 w-4" />
                    مشاوره حضوری
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-4 md:p-6">
                <TabsContent value="online" className="mt-0">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4 text-white">انتخاب مشاور</h2>

                    {loading ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="bg-[#1d1d1d] rounded-lg p-4 border border-gray-800">
                            <Skeleton className="h-[180px] w-full rounded-lg mb-4" />
                            <Skeleton className="h-6 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-4 w-2/3" />
                          </div>
                        ))}
                      </div>
                    ) : consultants.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {consultants
                          .filter((c) => c.onlineAvailable)
                          .map((consultant) => (
                            <ConsultantCard
                              key={consultant._id}
                              consultant={consultant}
                              selected={selectedConsultant?._id === consultant._id}
                              onSelect={() => handleConsultantSelect(consultant)}
                              type="online"
                            />
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 bg-[#1d1d1d] rounded-lg border border-gray-800">
                        <p className="text-gray-400">در حال حاضر مشاوری در دسترس نیست.</p>
                      </div>
                    )}
                  </div>

                  {selectedConsultant && (
                    <div id="calendar-section" className="mt-8 pt-4 border-t border-gray-800">
                      <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
                        <CalendarClock className="h-5 w-5 text-amber-400" />
                        انتخاب زمان مشاوره با {selectedConsultant.name}
                      </h2>
                      <ReservationCalendar consultant={selectedConsultant} type="online" />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="offline" className="mt-0">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4 text-white">انتخاب مشاور حضوری</h2>

                    {loading ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="bg-[#1d1d1d] rounded-lg p-4 border border-gray-800">
                            <Skeleton className="h-[180px] w-full rounded-lg mb-4" />
                            <Skeleton className="h-6 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-4 w-2/3" />
                          </div>
                        ))}
                      </div>
                    ) : consultants.filter((c) => c.offlineAvailable).length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {consultants
                          .filter((c) => c.offlineAvailable)
                          .map((consultant) => (
                            <ConsultantCard
                              key={consultant._id}
                              consultant={consultant}
                              selected={selectedConsultant?._id === consultant._id}
                              onSelect={() => handleConsultantSelect(consultant)}
                              type="offline"
                            />
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 bg-[#1d1d1d] rounded-lg border border-gray-800">
                        <p className="text-gray-400">در حال حاضر مشاوری برای مشاوره حضوری در دسترس نیست.</p>
                      </div>
                    )}
                  </div>

                  {selectedConsultant && (
                    <div id="calendar-section" className="mt-8 pt-4 border-t border-gray-800">
                      <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
                        <CalendarClock className="h-5 w-5 text-amber-400" />
                        انتخاب زمان مشاوره حضوری با {selectedConsultant.name}
                      </h2>
                      <ReservationCalendar consultant={selectedConsultant} type="offline" />
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}
