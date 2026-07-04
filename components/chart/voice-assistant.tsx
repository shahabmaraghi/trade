"use client"

import { Button } from "@/components/ui/button"
import { Bot, Mic, MicOff, Volume2, VolumeX, Loader2, AlertCircle, ChartCandlestick, Sofa } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect, useRef, useState, useCallback } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useOpenAITTS } from "@/hooks/chart/use-openai-tts"
import { useWhisperSTT } from "@/hooks/chart/use-whisper-stt"
import { cn } from "@/lib/utils"

type AssistantStatus = "idle" | "listening" | "processing" | "speaking"

export default function VoiceAssistant({ drawingMode = "public" }: { drawingMode?: "public" | "mentor" }) {
    const scrollAreaRef = useRef<HTMLDivElement>(null)
    const [chartMode, setChartMode] = useState(true)
    const [conversationStarted, setConversationStarted] = useState(false)
    const [microphoneStatus, setMicrophoneStatus] = useState<"checking" | "available" | "denied" | "unavailable">("checking")
    const [messages, setMessages] = useState<any[]>([])
    const [assistantStatus, setAssistantStatus] = useState<AssistantStatus>("idle")

    const chatAbortControllerRef = useRef<AbortController | null>(null)
    const isButtonPressedRef = useRef(false)

    const { generateAndPlaySpeech, stopSpeech, isPlaying, isLoading: ttsLoading } = useOpenAITTS()
    const { startRecording, stopRecordingAndTranscribe, error: sttError } = useWhisperSTT()

    const isBusy = assistantStatus === "processing" || ttsLoading
    const isListening = assistantStatus === "listening"
    const isSpeaking = assistantStatus === "speaking"

    const checkMicrophoneAccess = useCallback(async () => {
        setMicrophoneStatus("checking")
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setMicrophoneStatus("unavailable"); return
            }
            const permission = await navigator.permissions.query({ name: "microphone" as PermissionName })
            if (permission.state === 'granted') {
                setMicrophoneStatus("available"); return
            }
            if (permission.state === 'denied') {
                setMicrophoneStatus("denied"); return
            }
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            stream.getTracks().forEach(track => track.stop())
            setMicrophoneStatus("available")
        } catch (error) {
            console.error("Microphone access error:", error)
            setMicrophoneStatus("denied")
        }
    }, [])

    useEffect(() => { checkMicrophoneAccess() }, [checkMicrophoneAccess])

    useEffect(() => {
        const savedChartMode = localStorage.getItem("voice-chat-chart-mode")
        if (savedChartMode !== null) setChartMode(JSON.parse(savedChartMode))
    }, [])
    useEffect(() => {
        localStorage.setItem("voice-chat-chart-mode", JSON.stringify(chartMode))
    }, [chartMode])
    
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

            try {
                if (typeof tvWidget.load === "function" && chartData) {
                    await tvWidget.load(chartData)
                    return
                }
            } catch (e) {
                console.warn("tvWidget.load failed; falling back to symbol/resolution only.", e)
            }

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

    const cleanupOngoingOperations = useCallback(() => {
        console.log("Cleaning up ongoing operations...")
        chatAbortControllerRef.current?.abort()
        stopSpeech()
    }, [stopSpeech])

    const handleChatSubmission = async (userInput: string) => {
        if (!userInput.trim()) {
            setAssistantStatus("idle")
            return
        }
        
        setAssistantStatus("processing")
        if (!conversationStarted) setConversationStarted(true)

        chatAbortControllerRef.current = new AbortController()
        
        let chartContext: { symbol: string; interval: string, chartMode?: boolean } | undefined
        if (chartMode) {
            try {
                const twWidget = (window as any).__tradingViewWidget__
                const chart = typeof twWidget?.activeChart === "function" ? twWidget.activeChart() : twWidget?.activeChart
                const symbol = typeof chart?.symbol === "function" ? chart.symbol() : chart?.symbol
                const interval = typeof chart?.resolution === "function" ? chart.resolution() : chart?.resolution
                if (symbol && interval) { chartContext = { symbol, interval, chartMode } }
            } catch (err) { console.log("Unable to get chart context:", err) }
        }

        const newUserMessage = {
            id: Date.now().toString(),
            role: "user",
            content: userInput,
            data: chartContext,
        }
        setMessages((prev) => [...prev, newUserMessage])

        try {
            const response = await fetch("/api/chart/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: [...messages, newUserMessage], chartMode, drawingOwner: drawingMode }),
                signal: chatAbortControllerRef.current.signal
            })

            if (!response.ok) throw new Error("Failed to fetch AI response")

            const data = await response.json()
            const rawContent = data.content as string
            
            let parsed = { message: rawContent, chartSaveLoadId: null }
            try {
                const maybeJSON = JSON.parse(rawContent)
                if (maybeJSON && typeof maybeJSON === "object" && "message" in maybeJSON) {
                    parsed = {
                        message: String(maybeJSON.message ?? ""),
                        chartSaveLoadId: maybeJSON.chartSaveLoadId ?? null,
                    }
                }
            } catch {}

            const newAiMessage = { id: Date.now().toString() + "-ai", role: "assistant", content: parsed.message }

            // Load chart FIRST, then speak
            if (parsed.chartSaveLoadId) { 
                await loadChartStateById(parsed.chartSaveLoadId) 
            }

            if (parsed.message) {
                setAssistantStatus("speaking")
                setMessages((prev) => [...prev, { ...newAiMessage, isHidden: true }])
                
                await generateAndPlaySpeech(parsed.message, newAiMessage.id)

                setMessages((prev) => prev.map((msg) => (msg.id === newAiMessage.id ? { ...msg, isHidden: false } : msg)))
            } else {
                setMessages((prev) => [...prev, newAiMessage])
            }

        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error("Chat API Error:", error)
                setMessages((prev) => [
                    ...prev,
                    { id: Date.now().toString() + "-error", role: "assistant", content: "متاسفانه مشکلی پیش آمد. لطفا دوباره تلاش کنید." },
                ])
            }
        } finally {
            setAssistantStatus("idle")
            chatAbortControllerRef.current = null
        }
    }

    const handleInteractionStart = useCallback(() => {
        if (isBusy || isSpeaking) {
            cleanupOngoingOperations()
            setAssistantStatus("idle")
        }
        isButtonPressedRef.current = true
        setAssistantStatus("listening")
        startRecording()
    }, [isBusy, isSpeaking, startRecording, cleanupOngoingOperations])

    const handleInteractionEnd = useCallback(async () => {
        if (!isButtonPressedRef.current || assistantStatus !== 'listening') return
        isButtonPressedRef.current = false
        
        try {
            setAssistantStatus("processing")
            const transcript = await stopRecordingAndTranscribe()
            await handleChatSubmission(transcript)
        } catch (error) {
            console.error("Error during transcription or submission:", error)
            setAssistantStatus("idle")
        }
    }, [assistantStatus, stopRecordingAndTranscribe, handleChatSubmission])

    useEffect(() => {
        const handleGlobalMouseUp = () => { if (isButtonPressedRef.current) handleInteractionEnd() }
        window.addEventListener('mouseup', handleGlobalMouseUp)
        window.addEventListener('touchend', handleGlobalMouseUp)
        const preventContext = (e: MouseEvent) => { if(isButtonPressedRef.current) e.preventDefault() }
        window.addEventListener('contextmenu', preventContext)
        
        return () => {
            window.removeEventListener('mouseup', handleGlobalMouseUp)
            window.removeEventListener('touchend', handleGlobalMouseUp)
            window.removeEventListener('contextmenu', preventContext)
        }
    }, [handleInteractionEnd])

    useEffect(() => {
        if (scrollAreaRef.current) {
            const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
            if (viewport) viewport.scrollTop = viewport.scrollHeight
        }
    }, [messages])
    
    useEffect(() => () => cleanupOngoingOperations(), [cleanupOngoingOperations]);

    const renderStatusText = () => {
        switch (assistantStatus) {
            case "listening": return "در حال گوش دادن... رها کنید تا ارسال شود"
            case "processing": return isBusy && !isSpeaking ? "در حال پردازش..." : "در حال ارسال درخواست..."
            case "speaking": return "در حال پخش پاسخ..."
            case "idle":
                return conversationStarted ? "نگه دارید تا صحبت کنید" : "نگه دارید تا شروع کنید"
            default: return ""
        }
    }

    const renderIcon = () => {
        if (assistantStatus === 'processing' || ttsLoading) return <Loader2 className="h-12 w-12 text-white animate-spin" />
        if (assistantStatus === 'speaking') return <Volume2 className="h-12 w-12 text-white" />
        if (assistantStatus === 'listening') return <MicOff className="h-12 w-12 text-white animate-pulse" />
        return <Mic className="h-12 w-12 text-white" />
    }

    const renderMicrophoneStatus = () => {
        switch (microphoneStatus) {
            case "checking":
                return (
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">در حال بررسی دسترسی میکروفون...</p>
                    </div>
                )
            case "denied":
                return (
                    <div className="text-center">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
                        <p className="text-sm text-red-600 dark:text-red-400 mb-2">دسترسی به میکروفون رد شده است</p>
                        <p className="text-xs text-muted-foreground mb-3">لطفا دسترسی میکروفون را در تنظیمات مرورگر فعال کنید</p>
                        <Button variant="outline" size="sm" onClick={checkMicrophoneAccess}>
                            تلاش مجدد
                        </Button>
                    </div>
                )
            case "unavailable":
                return (
                    <div className="text-center">
                        <MicOff className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-2">میکروفون در دسترس نیست</p>
                        <p className="text-xs text-muted-foreground">لطفا میکروفون را وصل کنید و صفحه را تازه کنید</p>
                    </div>
                )
            default:
                return null
        }
    }

    if (microphoneStatus !== "available") {
        return (
            <div className="flex flex-col h-full bg-gradient-to-br from-background via-background to-muted/20">
                <div className="p-4 border-b bg-background/80 backdrop-blur-sm">
                    {/* Header */}
                </div>
                <div className="flex-1 flex items-center justify-center p-8">{renderMicrophoneStatus()}</div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-background via-background to-muted/20">
            {/* Header */}
            <div className="p-4 border-b bg-background/80 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                     <div className="flex items-center space-x-2">
                        <Switch id="voice-chart-mode" checked={chartMode} onCheckedChange={setChartMode} />
                        <Label htmlFor="voice-chart-mode" className="text-sm font-medium">
                            {chartMode ? <ChartCandlestick className="h-4 w-4 text-green-600" /> : <Sofa className="h-4 w-4 text-muted-foreground" />}
                        </Label>
                    </div>
                    <div className="flex items-center space-x-3 text-right">
                        <div>
                            <h3 className="font-semibold text-sm">دستیار صوتی هوشمند</h3>
                            <p className="text-xs text-muted-foreground">پلاس چارت</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                            <Bot className="h-4 w-4 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Interaction Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
                <div className="relative mb-8">
                    {(isListening || isSpeaking) && (
                        <>
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-600/20 animate-ping" />
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-600/10 animate-ping animation-delay-75" />
                        </>
                    )}
                    <div
                        className={cn(
                            "relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300",
                            "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
                            "shadow-lg hover:shadow-xl cursor-pointer",
                            isListening && "scale-110 shadow-2xl",
                            isSpeaking && "bg-gradient-to-r from-green-500 to-blue-600",
                            isBusy && !isSpeaking && "bg-gradient-to-r from-orange-500 to-red-600",
                        )}
                        onMouseDown={handleInteractionStart}
                        onMouseLeave={() => isButtonPressedRef.current && handleInteractionEnd()}
                        onTouchStart={(e) => { e.preventDefault(); handleInteractionStart(); }}
                        style={{ userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'manipulation' }}
                    >
                        {renderIcon()}
                    </div>
                </div>
                
                <div className="text-center mb-6 h-16 flex flex-col justify-center items-center">
                    <h2 className="text-lg font-semibold mb-2" style={{ direction: "rtl" }}>
                        {renderStatusText()}
                    </h2>
                    {sttError && <p className="text-sm text-red-500 mt-2">خطا در پردازش صدا. لطفا دوباره تلاش کنید.</p>}
                     {!conversationStarted && (
                        <p className="text-sm text-muted-foreground mt-4 max-w-md mx-auto">
                            دکمه را نگه دارید و سوال خود را در مورد بازارهای مالی و تحلیل چارت بپرسید
                        </p>
                    )}
                </div>

                {conversationStarted && (
                    <div className="flex gap-2">
                        {isSpeaking && (
                            <Button variant="outline" size="sm" onClick={stopSpeech} className="text-xs">
                                <VolumeX className="h-3 w-3 ml-1" /> توقف پخش
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Conversation History */}
            {conversationStarted && messages.length > 0 && (
                <div className="border-t bg-background/50 backdrop-blur-sm">
                    <ScrollArea className="h-48 p-4" ref={scrollAreaRef}>
                        <div className="space-y-3">
                            {messages.filter((message) => !message.isHidden).slice(-3).map((message) => (
                                <div key={message.id} className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[80%] rounded-lg p-2 text-xs ${message.role === "user" ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white" : "bg-muted text-foreground"}`}>
                                        <div className="flex items-center gap-1 mb-1">
                                            {message.role === "user" ? <Mic className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                                            <span className="font-medium">{message.role === "user" ? "شما" : "دستیار"}</span>
                                        </div>
                                        <p className="leading-relaxed">{message.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            )}

            {/* Footer */}
            <div className="p-3 border-t bg-background/80 backdrop-blur-sm">
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        {chartMode ? (
                            <><ChartCandlestick className="h-3 w-3 text-green-600" /><span>تحلیل چارت فعال</span></>
                        ) : (
                            <><Sofa className="h-3 w-3" /><span>چت عمومی</span></>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        <div className={cn("w-2 h-2 rounded-full", microphoneStatus === "available" && "bg-green-500")} />
                        <span>میکروفون {microphoneStatus === "available" ? "متصل" : "قطع"}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}