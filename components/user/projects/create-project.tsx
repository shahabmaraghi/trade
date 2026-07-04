"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export default function CreateProject() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    platform_name: "",
    platform_website: "",
    user_description: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/user/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to submit project")
      }

      toast({
        title: "پروژه با موفقیت ثبت شد",
        description: "درخواست بررسی پروژه شما با موفقیت ثبت شد و در انتظار بررسی است.",
        variant: "default",
      })

      router.push("/user/projects")
      router.refresh()
    } catch (error) {
      toast({
        title: "خطا در ثبت پروژه",
        description: "متأسفانه مشکلی در ثبت پروژه رخ داد. لطفاً دوباره تلاش کنید.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>ثبت پروژه جدید برای بررسی</CardTitle>
          <CardDescription>اطلاعات پروژه خود را وارد کنید تا توسط کارشناسان ما بررسی شود.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform_name">نام پلتفرم</Label>
              <Input
                id="platform_name"
                name="platform_name"
                placeholder="نام پلتفرم مورد نظر را وارد کنید"
                value={formData.platform_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="platform_website">آدرس وب‌سایت</Label>
              <Input
                id="platform_website"
                name="platform_website"
                placeholder="آدرس وب‌سایت پلتفرم را وارد کنید"
                value={formData.platform_website}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user_description">توضیحات</Label>
              <Textarea
                id="user_description"
                name="user_description"
                placeholder="توضیحات پروژه و دلیل درخواست بررسی را وارد کنید"
                value={formData.user_description}
                onChange={handleChange}
                rows={5}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              انصراف
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "در حال ثبت..." : "ثبت درخواست"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
