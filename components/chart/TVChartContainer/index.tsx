"use client"

import type React from "react"

import styles from "./index.module.css"
import { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import {
  type ChartingLibraryWidgetOptions,
  CustomIndicator,
  type LanguageCode,
  PineJS,
  type ResolutionString,
  widget,
} from "@/public/static/charting_library"

import { Loader2, TriangleAlert } from "lucide-react"
import { configureDatafeed } from "@/lib/mentors/datafeed"

interface TVChartContainerProps extends Partial<ChartingLibraryWidgetOptions> {
  onWidgetReady?: (widget: any) => void
}

export const TVChartContainer = (props: TVChartContainerProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()
  const router = useRouter()
  const [tvWidget, setTvWidget] = useState<any>(null)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const widgetRef = useRef<any>(null);
  // Fetch the API key from our endpoint
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/chart/tradingview")
        const data = await response.json()

        if (data.success && data.apiKey) {
          setApiKey(data.apiKey)
        } else {
          setError("Failed to get API key from server")
        }
      } catch (err) {
        console.error('Error fetching API key:', err)
        setError("Failed to fetch API key")
      } finally {
        setLoading(false)
      }
    }

    fetchApiKey()
  }, [])

  useEffect(() => {
    // Don't initialize widget until we have the API key and container is ready
    if (!apiKey || !chartContainerRef.current || loading) {
      return
    }

    const datafeed = configureDatafeed()

    const widgetOptions: ChartingLibraryWidgetOptions = {
      theme: theme === 'dark' ? 'dark' : 'light',
      custom_indicators_getter: (async function (PineJS: PineJS): Promise<readonly CustomIndicator[]> {
        console.log("Loading custom indicators with PineJS", PineJS)
        return Promise.resolve([]) // you can put your custom indicators here. example: Promise.resolve([emaBandsIndicator(PineJS), anotherIndicator(PineJS), ...])
      }),
      symbol: props.symbol,
      datafeed: datafeed,
      interval: (props.interval || '1D') as ResolutionString,
      container: chartContainerRef.current,
      library_path: props.library_path,
      locale: props.locale as LanguageCode,
      disabled_features: [
        "use_localstorage_for_settings",
        "save_chart_properties_to_local_storage",
      ],
      enabled_features: [
        "study_templates",
        "create_volume_indicator_by_default",
        "chart_property_page_scales",
        "chart_property_page_trading",
        "left_toolbar",
        "control_bar",
        "timeframes_toolbar",
        "edit_buttons_in_legend",
        "context_menus",
        "control_bar"
      ],
      charts_storage_url: props.charts_storage_url,
      charts_storage_api_version: props.charts_storage_api_version,
      client_id: props.client_id,
      user_id: props.user_id,
      fullscreen: props.fullscreen || true,
      autosize: props.autosize,
    }

    if (widgetRef.current) {
      widgetRef.current.remove();
      widgetRef.current = null;
    }
    const widgetInstance = new widget(widgetOptions);
    widgetRef.current = widgetInstance;
    setTvWidget(widgetInstance);

    // Store widget instance globally for screenshot access
    (window as any).__tradingViewWidget__ = widgetInstance

    widgetInstance.onChartReady(() => {
      widgetInstance.headerReady().then(() => {

        console.log("Chart is ready")

        const button = widgetInstance.createButton()
        button.innerHTML = "🧠 Replay"
        button.setAttribute('title', 'حالت ریپلی و تحلیل هوش مصنوعی')
        button.classList.add('apply-common-tooltip')
        button.style.cursor = 'pointer'
        button.addEventListener('click', () => {
          const symbol = props.symbol || 'BTCUSDT'
          const interval = props.interval || '1D'
          router.push(`/chart/replay?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}`)
        })

      })

      // Notify parent component that widget is ready
      if (props.onWidgetReady) {
        props.onWidgetReady(widgetInstance)
      }

    })

    return () => {
      // Clean up global reference
      if ((window as any).__tradingViewWidget__) {
        delete (window as any).__tradingViewWidget__
      }
      // Remove the specific instance created in this effect
      if (widgetRef.current) {
        widgetRef.current.remove();
        widgetRef.current = null;
      }
    }
  }, [apiKey, theme, props.symbol, props.interval])

  // Show loading state
  if (loading) {
    return <div className={styles.TVChartContainer}>
      <div className="flex items-center justify-center h-full w-full">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-12 h-12 animate-spin" />
          <span >درحال بارگذاری چارت</span>
        </div>
      </div>
    </div>
  }

  // Show error state
  if (error) {
    return <div className={styles.TVChartContainer}>
      <div className="flex items-center justify-center h-full w-full">
        <div className="flex flex-col items-center gap-2">
          <TriangleAlert className="w-12 h-12" />
          <span >خطا در بارگذاری چارت</span>
          <span>{error}</span>
        </div>
      </div>
    </div>
  }

  return (
    <>
      <div ref={chartContainerRef} className={styles.TVChartContainer} />
    </>
  )
}