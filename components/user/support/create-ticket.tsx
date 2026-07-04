"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

export default function CreateTicket() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const { toast } = useToast()

  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [priority, setPriority] = useState("medium")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect if not authenticated
  if (!isLoading && !isAuthenticated) {
    router.push("/")
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!subject.trim()) {
      setError("موضوع تیکت الزامی است")
      return
    }

    if (!message.trim()) {
      setError("متن پیام الزامی است")
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      const response = await fetch("/api/user/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject,
          message,
          priority,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "خطا در ثبت تیکت")
      }

      const data = await response.json()

      toast({
        title: "تیکت با موفقیت ثبت شد",
        description: "تیکت شما با موفقیت ثبت شد و در اسرع وقت بررسی خواهد شد.",
      })

      // Redirect to ticket detail page
      router.push(`/user/support/${data.ticket.id}`)
    } catch (error) {
      console.error("Error creating ticket:", error)
      setError(error instanceof Error ? error.message : "خطا در ثبت تیکت")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" className="ml-2" onClick={() => router.push("/user/support")}>
          <ArrowRight className="h-4 w-4 ml-1" />
          بازگشت
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">ایجاد تیکت جدید</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>تیکت پشتیبانی جدید</CardTitle>
          <CardDescription>
            لطفاً اطلاعات مورد نیاز را وارد کنید. تیم پشتیبانی در اسرع وقت به تیکت شما پاسخ خواهد داد.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>خطا</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="subject">موضوع</Label>
              <Input
                id="subject"
                placeholder="موضوع تیکت را وارد کنید"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">اولویت</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب اولویت" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">کم</SelectItem>
                  <SelectItem value="medium">متوسط</SelectItem>
                  <SelectItem value="high">زیاد</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">متن پیام</Label>
              <Textarea
                id="message"
                placeholder="توضیحات خود را وارد کنید"
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push("/user/support")}>
              انصراف
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              ثبت تیکت
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
