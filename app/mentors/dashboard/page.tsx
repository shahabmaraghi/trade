"use client"

import { useState, useEffect, useRef } from "react"
import { TradingViewChart } from "@/components/mentors/tradingview-chart"
import { ChartSidebar } from "@/components/mentors/chart-sidebar"
import { TopBar } from "@/components/mentors/topbar"
import { SaveChartDialog } from "@/components/mentors/save-chart-dialog"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [currentChartData, setCurrentChartData] = useState<any>(null)
  const [loadedChartId, setLoadedChartId] = useState<string | null>(null)
  const [currentSymbol, setCurrentSymbol] = useState<string>(process.env.NEXT_PUBLIC_DEFAULT_SYMBOL || "BTCUSDT")
  const [currentInterval, setCurrentInterval] = useState<string>(process.env.NEXT_PUBLIC_DEFAULT_INTERVAL || "1D")
  const chartKeyRef = useRef(0)
  const sidebarKeyRef = useRef(0)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/mentors/auth/me")
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          router.push("/")
        }
      } catch (error) {
        console.error("Error fetching user:", error)
        router.push("/")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [router])

  const handleSaveChart = () => {
    // Trigger chart save from TradingView widget
    if ((window as any).saveChart) {
      ; (window as any).saveChart()
    }
    setShowSaveDialog(true)
  }

  const handleChartDataSaved = (data: any) => {
    setCurrentChartData(data)
  }

  const handleSaveWithName = async (name: string) => {
    if (!currentChartData) {
      toast({
        title: "خطا",
        description: "دیتایی برای ذخیره یافت نشد. اطمینان حاصل کنید که روی دکمهٔ `Save` در نمودار کلیک کرده‌اید، سپس روی دکمهٔ سبز رنگ `ذخیره نمودار فعلی` در صفحه کلیک کنید",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/mentors/charts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          chartData: currentChartData,
          symbol: currentSymbol,
          interval: currentInterval,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "چارت ذخیره شد",
          description: "چارت شما با موفقیت ذخیره شد",
        })
        setShowSaveDialog(false)
        setLoadedChartId(data.chart.id)
        // Refresh sidebar list without remounting the chart
        sidebarKeyRef.current += 1
      } else {
        toast({
          title: "Error",
          description: data.error || "خطا در ذخیره چارت",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "یک خطا در هنگام ذخیره چارت رخ داد",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleLoadChart = async (chartId: string) => {
    try {
      const response = await fetch(`/api/mentors/charts/${chartId}`)
      const data = await response.json()

      if (response.ok) {
        setCurrentChartData(data.chart.chartData)
        setLoadedChartId(chartId)
        // Force chart re-render with new data
        chartKeyRef.current += 1
        toast({
          title: "چارت بارگذاری شد",
          description: `"${data.chart.name}" بارگذاری شد`,
        })
      } else {
        toast({
          title: "Error",
          description: "خطا در بارگذاری چارت",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "خطایی درهنگام بارگذاری چارت رخ داد",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">در حال بارگزاری...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Full-width TopBar */}
      <TopBar userName={user.name} />

      {/* Main content area with sidebar and chart */}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-80 flex-shrink-0">
          <ChartSidebar
            key={sidebarKeyRef.current}
            onSave={handleSaveChart}
            onLoad={handleLoadChart}
            userName={user.name}
          />
        </div>
        <div className="flex-1 p-4">
          <TradingViewChart
            key={`chart-${chartKeyRef.current}`}
            onSave={handleChartDataSaved}
            initialData={currentChartData}
            symbol={currentSymbol}
            interval={currentInterval}
            onSymbolChange={setCurrentSymbol}
            onIntervalChange={setCurrentInterval}
          />
        </div>
      </div>

      <SaveChartDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        onSave={handleSaveWithName}
        isLoading={isSaving}
      />
    </div>
  )
}
