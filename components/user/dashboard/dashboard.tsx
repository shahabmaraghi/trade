"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { LineChart, LifeBuoy, CreditCard, Clock, ArrowRight } from "lucide-react"

interface DashboardData {
  stats: {
    analysesCount: number
    openTicketsCount: number
    subscription: {
      plan: {
        _id: string
        name: string
        price: number
      }
      expiryDate: string
      isActive: boolean
    } | null
  }
  recentAnalyses: Array<{
    _id: string
    title: string
    createdAt: string
    type: string
    isPremium: boolean
  }>
  recentTickets: Array<{
    _id: string
    subject: string
    status: string
    createdAt: string
  }>
}

export default function UserDashboard() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/")
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("/api/user/dashboard")
        if (response.ok) {
          const data = await response.json()
          setDashboardData(data)
        } else {
          console.error("Failed to fetch dashboard data")
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoadingData(false)
      }
    }

    if (isAuthenticated) {
      fetchDashboardData()
    }
  }, [isAuthenticated])

  if (isLoading || !isAuthenticated) {
    return <DashboardSkeleton />
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
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

  const getAnalysisTypeLabel = (type: string) => {
    switch (type) {
      case "technical":
        return "تکنیکال"
      case "fundamental":
        return "بنیادی"
      case "market":
        return "بازار"
      default:
        return "سایر"
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تحلیل‌های من</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingData ? <Skeleton className="h-8 w-20" /> : dashboardData?.stats.analysesCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">تعداد کل تحلیل‌های منتشر شده توسط شما</p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/user/analyses">
                مشاهده تحلیل‌ها
                <ArrowRight className="mr-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تیکت‌های باز</CardTitle>
            <LifeBuoy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingData ? <Skeleton className="h-8 w-20" /> : dashboardData?.stats.openTicketsCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">تعداد تیکت‌های باز و در انتظار پاسخ</p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/user/support">
                مشاهده تیکت‌ها
                <ArrowRight className="mr-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">وضعیت اشتراک</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingData ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold">{dashboardData?.stats.subscription?.plan.name || "رایگان"}</div>
                  <Badge variant={dashboardData?.stats.subscription?.isActive ? "default" : "destructive"}>
                    {dashboardData?.stats.subscription?.isActive ? "فعال" : "منقضی شده"}
                  </Badge>
                </div>
                {dashboardData?.stats.subscription?.expiryDate && (
                  <div className="mt-2 flex items-center text-xs text-muted-foreground">
                    <Clock className="ml-1 h-3 w-3" />
                    تا تاریخ {formatDate(dashboardData.stats.subscription.expiryDate)}
                  </div>
                )}
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/user/subscription">
                مدیریت اشتراک
                <ArrowRight className="mr-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>آخرین تحلیل‌ها</CardTitle>
            <CardDescription>تحلیل‌های اخیر منتشر شده توسط شما</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingData ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : dashboardData?.recentAnalyses && dashboardData.recentAnalyses.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentAnalyses.map((analysis) => (
                  <div key={analysis._id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{analysis.title}</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span>{formatDate(analysis.createdAt)}</span>
                        <span className="mx-2">•</span>
                        <span>{getAnalysisTypeLabel(analysis.type)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {analysis.isPremium && <Badge variant="secondary">ویژه</Badge>}
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/user/analyses/${analysis._id}/edit`}>ویرایش</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">هنوز تحلیلی منتشر نکرده‌اید.</p>
            )}
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/user/analyses/new">ایجاد تحلیل جدید</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>آخرین تیکت‌ها</CardTitle>
            <CardDescription>تیکت‌های پشتیبانی اخیر شما</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingData ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : dashboardData?.recentTickets && dashboardData.recentTickets.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentTickets.map((ticket) => (
                  <div key={ticket._id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{ticket.subject}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(ticket.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${getStatusColor(ticket.status)}`} />
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/user/support/${ticket._id}`}>مشاهده</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">هنوز تیکتی ثبت نکرده‌اید.</p>
            )}
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/user/support/new">ایجاد تیکت جدید</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-[180px] w-full" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Skeleton key={i} className="h-[300px] w-full" />
        ))}
      </div>
    </div>
  )
}
