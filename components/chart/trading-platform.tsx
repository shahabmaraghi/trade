"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, X, MessageCircle, Eraser, Headphones } from "lucide-react"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer"
import TradingViewWidget, { type TradingViewWidgetRef } from "@/components/chart/trading-view-widget"
import ChatBot from "@/components/chart/chat-bot"
import VoiceAssistant from "@/components/chart/voice-assistant"
import Header from "@/components/chart/header"
import { useMobile } from "@/hooks/chart/use-mobile"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


export default function TradingPlatform() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("text") // "text" or "voice"
  const tradingViewRef = useRef<TradingViewWidgetRef>(null)
  const isMobile = useMobile()
  const [drawingMode, setDrawingMode] = useState<"public" | "mentor">("public")

  useEffect(() => {
    if (!isMobile) {
      setIsChatOpen(true)
      setIsDrawerOpen(false)
    } else {
      setIsChatOpen(false)
    }
  }, [isMobile])

  const handleChatToggle = () => {
    if (isMobile) {
      setIsDrawerOpen(!isDrawerOpen)
    } else {
      setIsChatOpen(!isChatOpen)
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <Header />

      <div className="flex flex-1 overflow-hidden relative">
        {!isMobile && (
          <>
            <div
              className={`${
                isChatOpen ? "w-1/3 lg:w-1/4" : "w-0"
              } transition-all duration-300 ease-in-out h-full relative bg-background border-l border-border`}
            >
              {isChatOpen && (
                <Card className="h-full rounded-none border-0 flex flex-col">
                  <div className="flex items-center justify-between py-2 px-4 border-b">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold">دستیار هوشمند</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={drawingMode} onValueChange={(v) => setDrawingMode(v as any)}>
                        <SelectTrigger className="w-44">
                          <SelectValue placeholder="حالت رسم" />
                        </SelectTrigger>
                        <SelectContent align="end">
                          <SelectItem value="public">حالت رسم عمومی</SelectItem>
                          <SelectItem value="mentor">حالت رسم منتور</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" onClick={() => setIsChatOpen(false)}>
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  {/* Tabs for switching between text and voice */}
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
                    <TabsList className="grid w-full grid-cols-2 my-2 mx-auto w-[95%]">
                      <TabsTrigger value="text" className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        چت متنی
                      </TabsTrigger>
                      <TabsTrigger value="voice" className="flex items-center gap-2">
                        <Headphones className="h-4 w-4" />
                        چت صوتی
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="text" className="flex-1 m-0">
                      <ChatBot drawingMode={drawingMode} />
                    </TabsContent>

                    <TabsContent value="voice" className="flex-1 m-0">
                      <VoiceAssistant drawingMode={drawingMode} />
                    </TabsContent>
                  </Tabs>
                </Card>
              )}
            </div>

            {/* دکمه باز کردن چت در دسکتاپ */}
            {!isChatOpen && (
              <Button
                className="absolute top-1/2 right-0 z-10 h-12 px-1 rounded-l-full rounded-r-none"
                onClick={() => setIsChatOpen(true)}
                variant="secondary"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
          </>
        )}

        {/* نمایش موبایل - Drawer */}
        {isMobile && (
          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <DrawerContent className="h-[85vh]">
              <DrawerHeader className="border-b">
                <div className="flex items-center justify-between">
                  <DrawerTitle>دستیار هوشمند</DrawerTitle>
                  <div className="flex items-center gap-2">
                    <Select value={drawingMode} onValueChange={(v) => setDrawingMode(v as any)}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="حالت رسم" />
                      </SelectTrigger>
                      <SelectContent align="end">
                        <SelectItem value="public">حالت رسم عمومی</SelectItem>
                        <SelectItem value="mentor">حالت رسم منتور</SelectItem>
                      </SelectContent>
                    </Select>
                    <DrawerClose asChild>
                      <Button variant="ghost" size="icon">
                        <X className="h-5 w-5" />
                      </Button>
                    </DrawerClose>
                  </div>
                </div>
              </DrawerHeader>

              <div className="flex-1 overflow-hidden">
                {/* Tabs for mobile */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
                  <TabsList className="grid w-full grid-cols-2 m-2">
                    <TabsTrigger value="text" className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      چت متنی
                    </TabsTrigger>
                    <TabsTrigger value="voice" className="flex items-center gap-2">
                      <Headphones className="h-4 w-4" />
                      حالت سخنگو
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="text" className="flex-1 m-0">
                    <ChatBot drawingMode={drawingMode} />
                  </TabsContent>

                  <TabsContent value="voice" className="flex-1 m-0">
                    <VoiceAssistant />
                  </TabsContent>
                </Tabs>
              </div>
            </DrawerContent>
          </Drawer>
        )}

        {/* بخش نمودار */}
        <div
          className={`${
            !isMobile && isChatOpen ? "w-2/3 lg:w-3/4" : "w-full"
          } transition-all duration-300 ease-in-out h-full bg-background relative`}
        >
          <TradingViewWidget ref={tradingViewRef} />
        </div>

        {/* دکمه شناور چت در موبایل */}
        {isMobile && (
          <Button
            className="fixed bottom-6 left-6 z-50 h-14 w-14 rounded-full shadow-lg"
            onClick={handleChatToggle}
            size="icon"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        )}
      </div>
    </div>
  )
}
