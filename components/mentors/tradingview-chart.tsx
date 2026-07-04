"use client"

import { useEffect, useRef, useState } from "react"

interface TradingViewChartProps {
  onSave?: (chartData: any) => void
  onSymbolChange?: (symbol: string) => void
  onIntervalChange?: (interval: string) => void
  initialData?: any
  symbol?: string
  interval?: string
}

declare global {
  interface Window {
    TradingView: any
    Datafeeds: any
  }
}

export function TradingViewChart({ 
  onSave, 
  onSymbolChange,
  onIntervalChange,
  initialData, 
  symbol = process.env.NEXT_PUBLIC_DEFAULT_SYMBOL || "BTCUSDT", 
  interval = process.env.NEXT_PUBLIC_DEFAULT_INTERVAL || "1D" 
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [scriptsLoaded, setScriptsLoaded] = useState(false)

  // Load API key and scripts once on mount
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await fetch("/api/mentors/tradingview")
        const data = await response.json()
        if (data.success && data.apiKey) {
          setApiKey(data.apiKey)
          return data.apiKey as string
        }
        throw new Error("Failed to get API key from server")
      } catch (err) {
        console.error("Error fetching API key:", err)
        setError("Failed to fetch API key. Please try again later.")
        setIsLoading(false)
        return null
      }
    }

    const loadScripts = async () => {
      const key = await fetchApiKey()
      if (!key) return
      // Load charting library
      if (!document.getElementById("tradingview-script")) {
        const script = document.createElement("script")
        script.id = "tradingview-script"
        script.type = "text/javascript"
        script.src = "/static/charting_library/charting_library.standalone.js"
        script.async = false
        await new Promise((resolve, reject) => {
          script.onload = resolve
          script.onerror = () => {
            setError("Failed to load TradingView library.")
            setIsLoading(false)
            reject(new Error("script load failed"))
          }
          document.head.appendChild(script)
        })
      }

      // Load datafeeds script second
      if (!document.getElementById("datafeeds-script")) {
        const datafeedsScript = document.createElement("script")
        datafeedsScript.id = "datafeeds-script"
        datafeedsScript.type = "text/javascript"
        datafeedsScript.src = "/static/datafeeds/udf/dist/bundle.js"
        datafeedsScript.async = false
        await new Promise((resolve, reject) => {
          datafeedsScript.onload = resolve
          datafeedsScript.onerror = () => {
            setError("Failed to load Datafeeds library.")
            setIsLoading(false)
            reject(new Error("datafeeds load failed"))
          }
          document.head.appendChild(datafeedsScript)
        })
      }

      setScriptsLoaded(true)
    }

    loadScripts().catch(console.error)
  }, [])

  // Initialize the widget once when scripts are loaded and apiKey is available
  useEffect(() => {
    const checkTradingView = () => {
      return typeof window !== "undefined" && window.TradingView && window.Datafeeds
    }

    if (!scriptsLoaded || !apiKey || !containerRef.current) return
    if (!checkTradingView()) return
    if (widgetRef.current) return // already initialized

    try {
      const datafeed = new window.Datafeeds.UDFCompatibleDatafeed(
        `https://tradingview.sourcearena.ir/bourse-data/${apiKey}`,
        10000,
        {
          supports_search: true,
          supports_group_request: false,
          supports_marks: false,
          supports_timescale_marks: false,
          supports_time: true,
        }
      )

      widgetRef.current = new window.TradingView.widget({
        container: containerRef.current,
        library_path: "/static/charting_library/",
        locale: "en",
        disabled_features: ["use_localstorage_for_settings"],
        enabled_features: ["study_templates"],
        charts_storage_url: "https://saveload.tradingview.com",
        charts_storage_api_version: "1.1",
        client_id: "hirmand-trade-panel",
        user_id: "hirmandtrade",
        fullscreen: false,
        autosize: true,
        symbol: symbol,
        interval: interval,
        theme: "dark",
        toolbar_bg: "#1a1a1a",
        datafeed,
        overrides: {
          "mainSeriesProperties.candleStyle.upColor": "#26a69a",
          "mainSeriesProperties.candleStyle.downColor": "#ef5350",
          "mainSeriesProperties.candleStyle.borderUpColor": "#26a69a",
          "mainSeriesProperties.candleStyle.borderDownColor": "#ef5350",
          "mainSeriesProperties.candleStyle.wickUpColor": "#26a69a",
          "mainSeriesProperties.candleStyle.wickDownColor": "#ef5350",
        },
        saved_data: initialData || undefined,
      })

      widgetRef.current.onChartReady(() => {
        setIsLoading(false)
        setError(null)

        if (onSymbolChange) {
          widgetRef.current.activeChart().onSymbolChanged().subscribe(null, () => {
            const newSymbol = widgetRef.current.activeChart().symbol()
            onSymbolChange(newSymbol)
          })
        }

        if (onIntervalChange) {
          widgetRef.current.activeChart().onIntervalChanged().subscribe(null, () => {
            const newInterval = widgetRef.current.activeChart().resolution()
            onIntervalChange(newInterval)
          })
        }
      })
    } catch (err) {
      console.error("Error initializing TradingView:", err)
      setError("Failed to initialize chart. Please ensure TradingView library is properly installed.")
      setIsLoading(false)
    }

    return () => {
      if (widgetRef.current) {
        try {
          widgetRef.current.remove()
        } catch (err) {
          console.error("Error removing widget:", err)
        }
        widgetRef.current = null
      }
    }
  }, [scriptsLoaded, apiKey])

  // Update symbol without re-creating the widget
  useEffect(() => {
    if (widgetRef.current) {
      const current = widgetRef.current.activeChart().symbol()
      if (symbol && current !== symbol) {
        widgetRef.current.activeChart().setSymbol(symbol, () => {})
      }
    }
  }, [symbol])

  // Update interval without re-creating the widget
  useEffect(() => {
    if (widgetRef.current) {
      const current = widgetRef.current.activeChart().resolution()
      if (interval && current !== interval) {
        widgetRef.current.activeChart().setResolution(interval, () => {})
      }
    }
  }, [interval])

  const handleSaveChart = () => {
    if (widgetRef.current && onSave) {
      widgetRef.current.save((data: any) => {
        console.log("Saving chart data:", data)
        onSave(data)
      })
    }
  }

  useEffect(() => {
    if (widgetRef.current && onSave) {
      (window as any).saveChart = handleSaveChart
    }
  }, [onSave])

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/20 rounded-lg border border-border">
        <div className="text-center p-8 max-w-md">
          <h3 className="text-lg font-semibold mb-2 text-foreground">Chart Initialization Error</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <div className="text-xs text-muted-foreground bg-muted p-4 rounded-md text-left">
            <p className="font-mono mb-2">{"To add TradingView Charting Library:"}</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>{"Download the library from TradingView"}</li>
              <li>{"Extract to /public/static/charting_library/"}</li>
              <li>{"Ensure datafeeds/udf/dist/bundle.js exists"}</li>
              <li>{"Refresh the page"}</li>
            </ol>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">درحال بارگذاری چارت...</p>
          </div>
        </div>
      )}
      <div ref={containerRef} className="h-full w-full" />
    </div>
  )
}