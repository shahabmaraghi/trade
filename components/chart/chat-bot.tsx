"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot, User, Loader2, ChartCandlestick, Sofa } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect, useRef, useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

const welcomeMessage = `سلام! من دستیار معاملاتی هوشمند شما هستم. می‌توانم در زمینه تحلیل بازار، مدیریت ریسک و استراتژی‌های معاملاتی به شما کمک کنم. همچنین می‌توانم خطوط تحلیلی و اشکال را مستقیماً روی چارت برایتان رسم کنم. چه سوالی دارید؟`

export default function ChatBot({ drawingMode = "public" }: { drawingMode?: "public" | "mentor" }) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [chartMode, setChartMode] = useState(true)

  // Load preferences from localStorage
  useEffect(() => {
    const savedChartMode = localStorage.getItem("chat-chart-mode")
    if (savedChartMode !== null) {
      setChartMode(JSON.parse(savedChartMode))
    }
  }, [])

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem("chat-chart-mode", JSON.stringify(chartMode))
  }, [chartMode])

  // Manual state management for messages, input, and loading
  const [messages, setMessages] = useState<any[]>([
    {
      id: "welcome",
      role: "assistant",
      content: welcomeMessage,
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Helper: load TradingView chart state by ID (calls API and loads data into widget)
  const loadChartStateById = async (chartSaveLoadId: string) => {
    try {
      const res = await fetch(`/api/chart/chart-state/${chartSaveLoadId}`)
      if (!res.ok) {
        console.error("Failed to fetch chart state", await res.text())
        return
      }
      const data = await res.json()
      const { chartData, symbol, interval } = data || {}

      const tvWidget = (window as any).__tradingViewWidget__
      if (!tvWidget) {
        console.warn("TradingView widget is not ready yet.")
        return
      }

      // Prefer native load if available
      try {
        if (typeof tvWidget.load === "function" && chartData) {
          await tvWidget.load(chartData)
          return
        }
      } catch (e) {
        console.warn("tvWidget.load failed; falling back to symbol/resolution only.", e)
      }

      // Fallback: set symbol and interval only
      const chart = typeof tvWidget.activeChart === "function" ? tvWidget.activeChart() : tvWidget.activeChart
      if (chart) {
        if (symbol && typeof chart.setSymbol === "function") {
          try { chart.setSymbol(symbol, () => { }) } catch { }
        }
        if (interval && typeof chart.setResolution === "function") {
          try { chart.setResolution(interval, () => { }) } catch { }
        }
      }
    } catch (err) {
      console.error("Error loading chart state:", err)
    }
  }

  const customHandleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const userInput = input
    if (!userInput.trim()) return

    setInput("")
    setIsLoading(true)

    // Collect current chart context
    let chartContext: { symbol: string; interval: string, chartMode?: boolean } | undefined = undefined
    if (chartMode) {
      try {
        const twWidget = (window as any).__tradingViewWidget__
        const chart = typeof twWidget?.activeChart === "function" ? twWidget.activeChart() : twWidget?.activeChart
        const symbol = typeof chart?.symbol === "function" ? chart.symbol() : chart?.symbol
        const interval = typeof chart?.resolution === "function" ? chart.resolution() : chart?.resolution
        if (symbol && interval) {
          chartContext = { symbol, interval, chartMode }
        }
      } catch (err) {
        console.log("Unable to get chart context:", err)
      }
    }

    const newUserMessage = {
      id: Date.now().toString(),
      role: "user",
      content: userInput,
      data: chartContext ? { symbol: chartContext.symbol, interval: chartContext.interval, chartMode } : undefined,
    }

    setMessages((prevMessages) => [...prevMessages, newUserMessage])

    try {
      const response = await fetch("/api/chart/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: [...messages, newUserMessage], chartMode, drawingOwner: drawingMode }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch AI response")
      }

      const data = await response.json()
      const rawContent = data.content as string

      let parsed: { message: string; chartSaveLoadId: string | null } = {
        message: rawContent,
        chartSaveLoadId: null,
      }
      try {
        const maybeJSON = JSON.parse(rawContent)
        if (maybeJSON && typeof maybeJSON === "object" && "message" in maybeJSON) {
          parsed = {
            message: String((maybeJSON as any).message ?? ""),
            chartSaveLoadId: (maybeJSON as any).chartSaveLoadId ?? null,
          }
        }
      } catch {
        // If parsing fails, treat entire content as the message text
      }

      const newAiMessage = {
        id: Date.now().toString() + "-ai",
        role: "assistant",
        content: parsed.message,
      }

      // Add the new AI message to the chat
      setMessages((prevMessages) => [...prevMessages, newAiMessage])

      // If we have a chart state id, load it
      if (parsed.chartSaveLoadId && typeof parsed.chartSaveLoadId === "string") {
        await loadChartStateById(parsed.chartSaveLoadId)
      }
    } catch (error) {
      console.error("Chat API Error:", error)
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now().toString() + "-error",
          role: "assistant",
          content: "متاسفانه مشکلی پیش آمد. لطفا دوباره تلاش کنید.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // Scroll to bottom on new message
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  return (
    <div className="flex flex-col" style={{ height: "calc(86dvh - 58.6px)" }}>
      {/* Settings Header */}
      <div className="p-3 border-b bg-muted/30">
        <div className="space-y-3">
          {/* Chart Mode Settings */}
          <div className="flex items-center justify-between">
            <Switch id="chart-mode" checked={chartMode} onCheckedChange={setChartMode} />
            <div className="flex items-center space-x-2">
              <Label htmlFor="chart-mode" className="text-sm font-medium">
                چت با چارت
              </Label>
              {chartMode ? (
                <ChartCandlestick className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Sofa className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4 max-h[62vh]" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                <div
                  className={`rounded-lg p-3 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
                >
                  <div className="text-sm leading-relaxed whitespace-pre-wrap text-justify" style={{direction: "rtl"}}>{message.content}</div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex gap-3 max-w-[85%]">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-muted text-muted-foreground">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-lg p-3 bg-muted text-foreground">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm" style={{direction: "rtl"}}>در حال تایپ...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Message Input Form */}
      <div className="p-4 border-t bg-background flex-shrink-0">
        <form onSubmit={customHandleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="سوال خود را بپرسید..."
            className="flex-1"
            disabled={isLoading}
            dir="rtl"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>

        {/* Short Guide */}
        <div className="mt-2 text-xs text-muted-foreground" style={{direction: "rtl"}}>
          {chartMode ? (
            <>
              <ChartCandlestick className="inline h-3 w-3 m-1" />
              چت با چارت - پیام شما با توجه به چارت پاسخ داده خواهد شد و خطوط تحلیلی در صورت نیاز رسم خواهد شد
            </>
          ) : (
            <>
              <Sofa className="inline h-3 w-3 m-1" />
              چت عمومی - می‌توانید سوالات خود را در رابطه با بازارهای مالی بپرسید
            </>
          )}
        </div>
      </div>
    </div>
  )
}