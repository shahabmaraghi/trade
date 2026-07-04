"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, MessageCircle, AlertCircle } from "lucide-react"

interface SupportTicket {
  _id: string
  subject: string
  message: string
  status: "open" | "in-progress" | "closed"
  priority: "low" | "medium" | "high"
  responses: {
    message: string
    isAdmin: boolean
    createdAt: string
  }[]
  createdAt: string
  updatedAt: string
}

interface TicketsResponse {
  tickets: SupportTicket[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export default function UserSupport() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/")
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setIsLoadingData(true)
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: "10",
        })

        if (activeTab !== "all") {
          queryParams.append("status", activeTab)
        }

        const response = await fetch(`/api/user/support?${queryParams}`)
        if (response.ok) {
          const data: TicketsResponse = await response.json()
          setTickets(data.tickets)
          setTotalPages(data.pagination.pages)
        } else {
          console.error("Failed to fetch tickets")
        }
      } catch (error) {
        console.error("Error fetching tickets:", error)
      } finally {
        setIsLoadingData(false)
      }
    }

    if (isAuthenticated) {
      fetchTickets()
    }
  }, [isAuthenticated, currentPage, activeTab])

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open":
        return "باز"
      case "in-progress":
        return "در حال بررسی"
      case "closed":
        return "بسته شده"
      default:
        return status
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "low":
        return "کم"
      case "medium":
        return "متوسط"
      case "high":
        return "زیاد"
      default:
        return priority
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-500"
      case "in-progress":
        return "bg-blue-500"
      case "closed":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  if (isLoading || !isAuthenticated) {
    return <SupportSkeleton />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">پشتیبانی</h2>
          <p className="text-muted-foreground">مدیریت تیکت‌های پشتیبانی</p>
        </div>
        <Button asChild>
          <Link href="/user/support/new">
            <Plus className="ml-2 h-4 w-4" /> ایجاد تیکت جدید
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">همه</TabsTrigger>
          <TabsTrigger value="open">باز</TabsTrigger>
          <TabsTrigger value="in-progress">در حال بررسی</TabsTrigger>
          <TabsTrigger value="closed">بسته شده</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {isLoadingData ? (
            <SupportSkeleton />
          ) : tickets.length > 0 ? (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <Card key={ticket._id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                      <Badge variant={ticket.status === "closed" ? "outline" : "default"}>
                        {getStatusLabel(ticket.status)}
                      </Badge>
                    </div>
                    <CardDescription>
                      {formatDate(ticket.createdAt)} • اولویت: {getPriorityLabel(ticket.priority)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <p className="text-sm line-clamp-1">{ticket.message.replace(/<[^>]*>/g, "")}</p>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${getStatusColor(ticket.status)}`} />
                        <span className="text-xs text-muted-foreground">{ticket.responses.length} پاسخ</span>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/user/support/${ticket._id}`}>
                            <MessageCircle className="ml-1 h-4 w-4" /> مشاهده
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">تیکتی یافت نشد</h3>
              <p className="text-muted-foreground mt-2 mb-6">هنوز تیکتی در این وضعیت ثبت نکرده‌اید.</p>
              <Button asChild>
                <Link href="/user/support/new">
                  <Plus className="ml-2 h-4 w-4" /> ایجاد تیکت جدید
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2 space-x-reverse">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              قبلی
            </Button>
            <div className="flex items-center space-x-1 space-x-reverse">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              بعدی
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function SupportSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-[100px] w-full" />
      ))}
    </div>
  )
}
