"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Pencil, Trash2, Plus, AlertCircle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import Image from "next/image"

interface Analysis {
  _id: string
  title: string
  description: string
  image: string
  type: string
  tags: string[]
  isPremium: boolean
  createdAt: string
  updatedAt: string
}

interface AnalysesResponse {
  analyses: Analysis[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export default function UserAnalyses() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [activeTab, setActiveTab] = useState("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [analysisToDelete, setAnalysisToDelete] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/")
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        setIsLoadingData(true)
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: "10",
        })

        if (activeTab !== "all") {
          queryParams.append("type", activeTab)
        }

        const response = await fetch(`/api/user/analyses?${queryParams}`)
        if (response.ok) {
          const data: AnalysesResponse = await response.json()
          setAnalyses(data.analyses)
          setTotalPages(data.pagination.pages)
        } else {
          console.error("Failed to fetch analyses")
        }
      } catch (error) {
        console.error("Error fetching analyses:", error)
      } finally {
        setIsLoadingData(false)
      }
    }

    if (isAuthenticated) {
      fetchAnalyses()
    }
  }, [isAuthenticated, currentPage, activeTab])

  const handleDeleteClick = (id: string) => {
    setAnalysisToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!analysisToDelete) return

    try {
      const response = await fetch(`/api/user/analyses/${analysisToDelete}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setAnalyses((prev) => prev.filter((analysis) => analysis._id !== analysisToDelete))
        toast.success("تحلیل با موفقیت حذف شد")
      } else {
        toast.error("خطا در حذف تحلیل")
      }
    } catch (error) {
      console.error("Error deleting analysis:", error)
      toast.error("خطا در حذف تحلیل")
    } finally {
      setDeleteDialogOpen(false)
      setAnalysisToDelete(null)
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  if (isLoading || !isAuthenticated) {
    return <AnalysesSkeleton />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">تحلیل‌های من</h2>
          <p className="text-muted-foreground">مدیریت تحلیل‌های منتشر شده توسط شما</p>
        </div>
        <Button asChild>
          <Link href="/user/analyses/new">
            <Plus className="ml-2 h-4 w-4" /> ایجاد تحلیل جدید
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">همه</TabsTrigger>
          <TabsTrigger value="technical">تکنیکال</TabsTrigger>
          <TabsTrigger value="fundamental">بنیادی</TabsTrigger>
          <TabsTrigger value="market">بازار</TabsTrigger>
          <TabsTrigger value="other">سایر</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {isLoadingData ? (
            <AnalysesSkeleton />
          ) : analyses.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {analyses.map((analysis) => (
                <Card key={analysis._id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{analysis.title}</CardTitle>
                      {analysis.isPremium && <Badge variant="secondary">ویژه</Badge>}
                    </div>
                    <CardDescription>
                      {getAnalysisTypeLabel(analysis.type)} • {formatDate(analysis.createdAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative aspect-video overflow-hidden rounded-md mb-2">
                      <Image
                        src={analysis.image || "/placeholder.svg"}
                        alt={analysis.title}
                        fill
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <p className="text-sm line-clamp-2">{analysis.description.replace(/<[^>]*>/g, "")}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/user/analyses/${analysis._id}/edit`}>
                        <Pencil className="ml-2 h-4 w-4" /> ویرایش
                      </Link>
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(analysis._id)}>
                      <Trash2 className="ml-2 h-4 w-4" /> حذف
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">تحلیلی یافت نشد</h3>
              <p className="text-muted-foreground mt-2 mb-6">هنوز تحلیلی در این دسته‌بندی منتشر نکرده‌اید.</p>
              <Button asChild>
                <Link href="/user/analyses/new">
                  <Plus className="ml-2 h-4 w-4" /> ایجاد تحلیل جدید
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>آیا از حذف این تحلیل اطمینان دارید؟</AlertDialogTitle>
            <AlertDialogDescription>
              این عملیات غیرقابل بازگشت است. تحلیل شما به طور دائمی حذف خواهد شد.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function AnalysesSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-[300px] w-full" />
      ))}
    </div>
  )
}
