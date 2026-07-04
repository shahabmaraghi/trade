"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
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
import { useToast } from "@/hooks/use-toast"
import { Save, FolderOpen, Trash2 } from "lucide-react"

interface ChartItem {
  _id: string
  name: string
  symbol: string
  interval: string
  createdAt: string
  updatedAt: string
}

interface ChartSidebarProps {
  onSave: () => void
  onLoad: (chartId: string) => void
  userName: string
}

export function ChartSidebar({ onSave, onLoad, userName }: ChartSidebarProps) {
  const [charts, setCharts] = useState<ChartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchCharts = async () => {
    try {
      const response = await fetch("/api/mentors/charts")
      const data = await response.json()

      if (response.ok) {
        setCharts(data.charts)
      }
    } catch (error) {
      console.error("Error fetching charts:", error)
    }
  }

  useEffect(() => {
    fetchCharts()
  }, [])

  const handleDelete = async (id: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/mentors/charts/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "نمودار حذف شد",
          description: "نمودار شما با موفقیت حذف شد.",
        })
        fetchCharts()
      } else {
        toast({
          title: "خطا",
          description: "حذف نمودار با خطا مواجه شد.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطایی در حذف نمودار رخ داد.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setDeleteId(null)
    }
  }

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Action Buttons Section */}
      <div className="p-3 space-y-2 bg-muted/20">
        <Button onClick={onSave} className="w-full bg-green-600 hover:bg-green-700 text-white" size="sm">
          <span className="flex items-center justify-center gap-2">
            <Save className="h-4 w-4" />
            ذخیره نمودار فعلی
          </span>
        </Button>
      </div>

      {/* Charts List Section */}
      <div className="flex-1 overflow-hidden">
        <div className="px-4 py-2 bg-muted/10 border-b border-border/50">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            نمودارهای ذخیره شده
          </h3>
          <p className="text-xs text-muted-foreground mt-1">{charts.length} نمودار</p>
        </div>
        <ScrollArea className="h-[calc(100vh-140px)] px-2">
          <div className="space-y-2 py-2">
            {charts.length === 0 ? (
              <Card className="bg-muted/30 border-dashed">
                <CardContent className="p-4">
                  <div className="text-center space-y-1">
                    <FolderOpen className="h-6 w-6 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">هنوز نموداری ذخیره نشده است</p>
                    <p className="text-xs text-muted-foreground">نمودارهای خود را با استفاده از دکمه بالا ذخیره کنید</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              charts.map((chart) => (
                <Card key={chart._id} className="hover:bg-accent/50 transition-all duration-200 hover:shadow-sm">
                  <CardContent className="p-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-foreground truncate">{chart.name}</h4>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-primary/10 text-primary">
                            {chart.symbol}
                          </span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{chart.interval}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(chart.updatedAt).toLocaleDateString('fa-IR')}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:bg-primary/10"
                          onClick={() => onLoad(chart._id)}
                          disabled={isLoading}
                          title="بارگذاری نمودار"
                        >
                          <FolderOpen className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteId(chart._id)}
                          disabled={isLoading}
                          title="حذف نمودار"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              حذف نمودار
            </AlertDialogTitle>
            <AlertDialogDescription>
              آیا مطمئن هستید که می‌خواهید این نمودار را حذف کنید؟ این عمل قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
