"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, CheckCircle, XCircle, AlertTriangle, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Project {
  _id: string
  platform_name: string
  platform_website: string
  user_description: string
  admin_description: string
  status: "pending" | "approved" | "rejected" | "caution"
  created_at: string
  updated_at: string
}

export default function ProjectsList() {
  const router = useRouter()
  const { toast } = useToast()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/user/projects")
        if (!response.ok) {
          throw new Error("Failed to fetch projects")
        }
        const data = await response.json()
        setProjects(data)
      } catch (error) {
        toast({
          title: "خطا در دریافت پروژه‌ها",
          description: "متأسفانه مشکلی در دریافت پروژه‌ها رخ داد. لطفاً صفحه را رفرش کنید.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [toast])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            در انتظار بررسی
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            تأیید شده
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            رد شده
          </Badge>
        )
      case "caution":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            هشدار
          </Badge>
        )
      default:
        return <Badge variant="outline">نامشخص</Badge>
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

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">پروژه‌های من</h1>
        <Button onClick={() => router.push("/user/projects/new")}>
          <Plus className="mr-2 h-4 w-4" /> پروژه جدید
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>هیچ پروژه‌ای یافت نشد</CardTitle>
            <CardDescription>
              شما هنوز هیچ پروژه‌ای برای بررسی ثبت نکرده‌اید. برای ثبت پروژه جدید روی دکمه بالا کلیک کنید.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        projects.map((project) => (
          <Card key={project._id} className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="mb-2">{project.platform_name}</CardTitle>
                  <CardDescription>
                    <a
                      href={project.platform_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {project.platform_website}
                    </a>
                  </CardDescription>
                </div>
                {getStatusBadge(project.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">توضیحات شما:</h3>
                  <p className="text-sm text-gray-500">{project.user_description}</p>
                </div>
                {project.admin_description && (
                  <div>
                    <h3 className="text-sm font-medium mb-1">نظر کارشناس:</h3>
                    <p className="text-sm text-gray-500">{project.admin_description}</p>
                  </div>
                )}
                <div className="text-xs text-gray-400">تاریخ ثبت: {formatDate(project.created_at)}</div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
