"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { ArrowRight, AlertCircle, Loader2, Send, User, UserCog } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TicketResponse {
  message: string
  isAdmin: boolean
  createdAt: string
}

interface Ticket {
  _id: string
  subject: string
  message: string
  status: "open" | "in-progress" | "closed"
  priority: "low" | "medium" | "high"
  responses: TicketResponse[]
  createdAt: string
  updatedAt: string
}

export default function TicketDetail({ id }: { id: string }) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const { toast } = useToast()

  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [isLoadingTicket, setIsLoadingTicket] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [response, setResponse] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/")
    }
  }, [isLoading, isAuthenticated, router])

  // Fetch ticket details
  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setIsLoadingTicket(true)
        const response = await fetch(`/api/user/support/${id}`)

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("تیکت مورد نظر یافت نشد")
          }
          throw new Error("خطا در دریافت اطلاعات تیکت")
        }

        const data = await response.json()
        setTicket(data)
      } catch (error) {
        console.error("Error fetching ticket:", error)
        setError(error instanceof Error ? error.message : "خطا در دریافت اطلاعات تیکت")
      } finally {
        setIsLoadingTicket(false)
      }
    }

    if (isAuthenticated && id) {
      fetchTicket()
    }
  }, [id, isAuthenticated])

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!response.trim()) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "متن پاسخ نمی‌تواند خالی باشد",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const apiResponse = await fetch(`/api/user/support/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: response,
        }),
      })

      if (!apiResponse.ok) {
        const data = await apiResponse.json()
        throw new Error(data.error || "خطا در ثبت پاسخ")
      }

      const data = await apiResponse.json()
      setTicket(data.ticket)
      setResponse("")

      toast({
        title: "پاسخ با موفقیت ثبت شد",
        description: "پاسخ شما با موفقیت به تیکت اضافه شد.",
      })
    } catch (error) {
      console.error("Error submitting response:", error)
      toast({
        variant: "destructive",
        title: "خطا",
        description: error instanceof Error ? error.message : "خطا در ثبت پاسخ",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open":
        return "باز"
      case "in-progress":
        return "در حال بررسی"
      case "closed":
        return "ب��ته شده"
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  if (isLoading || !isAuthenticated) {
    return <TicketDetailSkeleton />
  }

  if (isLoadingTicket) {
    return <TicketDetailSkeleton />
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" className="ml-2" onClick={() => router.push("/user/support")}>
            <ArrowRight className="h-4 w-4 ml-1" />
            بازگشت
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">جزئیات تیکت</h2>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>خطا</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <Button onClick={() => router.push("/user/support")}>بازگشت به لیست تیکت‌ها</Button>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" className="ml-2" onClick={() => router.push("/user/support")}>
            <ArrowRight className="h-4 w-4 ml-1" />
            بازگشت
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">جزئیات تیکت</h2>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>تیکت یافت نشد</AlertTitle>
          <AlertDescription>تیکت مورد نظر یافت نشد یا شما دسترسی به آن ندارید.</AlertDescription>
        </Alert>

        <Button onClick={() => router.push("/user/support")}>بازگشت به لیست تیکت‌ها</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" className="ml-2" onClick={() => router.push("/user/support")}>
          <ArrowRight className="h-4 w-4 ml-1" />
          بازگشت
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">جزئیات تیکت</h2>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <CardTitle className="text-xl">{ticket.subject}</CardTitle>
              <CardDescription>
                {formatDate(ticket.createdAt)} • اولویت: {getPriorityLabel(ticket.priority)}
              </CardDescription>
            </div>
            <Badge variant={ticket.status === "closed" ? "outline" : "default"}>{getStatusLabel(ticket.status)}</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-start gap-3">
              <div className="bg-primary text-primary-foreground rounded-full p-2 mt-1">
                <User className="h-4 w-4" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex justify-between">
                  <p className="text-sm font-medium">شما</p>
                  <p className="text-xs text-muted-foreground">{formatDate(ticket.createdAt)}</p>
                </div>
                <div className="text-sm whitespace-pre-wrap">{ticket.message}</div>
              </div>
            </div>
          </div>

          {ticket.responses.length > 0 && (
            <div className="space-y-4">
              <Separator />
              <h3 className="text-lg font-semibold">پاسخ‌ها</h3>

              <div className="space-y-4">
                {ticket.responses.map((resp, index) => (
                  <div key={index} className={`p-4 rounded-lg ${resp.isAdmin ? "bg-primary/10" : "bg-muted"}`}>
                    <div className="flex items-start gap-3">
                      <div
                        className={`rounded-full p-2 mt-1 ${
                          resp.isAdmin ? "bg-primary text-primary-foreground" : "bg-primary text-primary-foreground"
                        }`}
                      >
                        {resp.isAdmin ? <UserCog className="h-4 w-4" /> : <User className="h-4 w-4" />}
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium">{resp.isAdmin ? "پشتیبانی" : "شما"}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(resp.createdAt)}</p>
                        </div>
                        <div className="text-sm whitespace-pre-wrap">{resp.message}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {ticket.status !== "closed" && (
            <div className="space-y-4">
              <Separator />
              <h3 className="text-lg font-semibold">ارسال پاسخ</h3>

              <form onSubmit={handleSubmitResponse}>
                <div className="space-y-4">
                  <Textarea
                    placeholder="پاسخ خود را بنویسید..."
                    rows={4}
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                  />

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                          در حال ارسال...
                        </>
                      ) : (
                        <>
                          <Send className="ml-2 h-4 w-4" />
                          ارسال پاسخ
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {ticket.status === "closed" && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>تیکت بسته شده است</AlertTitle>
              <AlertDescription>
                این تیکت بسته شده است و امکان ارسال پاسخ جدید وجود ندارد. در صورت نیاز به پیگیری مجدد، لطفاً تیکت جدیدی
                ایجاد کنید.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter>
          <Button variant="outline" className="w-full" onClick={() => router.push("/user/support")}>
            بازگشت به لیست تیکت‌ها
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

function TicketDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Skeleton className="h-10 w-24 ml-2" />
        <Skeleton className="h-8 w-40" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>

        <CardContent className="space-y-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>

        <CardFooter>
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    </div>
  )
}
