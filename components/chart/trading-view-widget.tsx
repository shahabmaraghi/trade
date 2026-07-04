"use client"

import { useRef, memo, useState, useImperativeHandle, useCallback } from "react"
import type { ChartingLibraryWidgetOptions, ResolutionString } from "@/public/static/charting_library/charting_library"
import dynamic from "next/dynamic"
import Script from "next/script"

const defaultWidgetProps: Partial<ChartingLibraryWidgetOptions> = {
  symbol: "BTCUSDT",
  interval: "1D" as ResolutionString,
  library_path: "/static/charting_library/",
  locale: "en",
  charts_storage_url: "https://saveload.tradingview.com",
  charts_storage_api_version: "1.1",
  client_id: "tradingview.com",
  user_id: "public_user_id",
  fullscreen: false,
  autosize: true,
  disabled_features: [],
  enabled_features: [],
}

const TVChartContainer = dynamic(() => import("@/components/chart/TVChartContainer").then((mod) => mod.TVChartContainer), {
  ssr: false,
})

export interface TradingViewWidgetRef {
  executeDrawingCommand: (command: any) => void
  clearAllDrawings: () => void
  getWidget: () => any
  activateDrawingTool: (tool: string) => void
  addStudy: (options: { name: string; inputs?: Record<string, any>; newPane?: boolean }) => void
}

interface DrawingCommand {
  type: string
  params: string[]
}

interface TradingViewAdvancedChartProps {
  ref: React.Ref<TradingViewWidgetRef>
}

const TradingViewAdvancedChart: React.FC<TradingViewAdvancedChartProps> = ({ ref }) => {
  const container = useRef<HTMLDivElement>(null)
  const [isScriptReady, setIsScriptReady] = useState(false)
  const widgetRef = useRef<any>(null)
  const [drawingCommands, setDrawingCommands] = useState<DrawingCommand[]>([])

  useImperativeHandle(ref, () => ({
    executeDrawingCommand: (command: DrawingCommand) => {
      if (widgetRef.current) {
        executeDrawingOnChart(widgetRef.current, command)
      } else {
        setDrawingCommands((prev) => [...prev, command])
      }
    },
    clearAllDrawings: () => {
      if (widgetRef.current) {
        clearAllDrawingsFromChart(widgetRef.current)
      }
    },
    getWidget: () => widgetRef.current,
    activateDrawingTool: (tool: string) => {
      if (widgetRef.current) {
        activateDrawingToolOnChart(widgetRef.current, tool)
      }
    },
    addStudy: ({ name, inputs, newPane }: { name: string; inputs?: Record<string, any>; newPane?: boolean }) => {
      if (widgetRef.current) {
        addStudyOnChart(widgetRef.current, { name, inputs, newPane })
      }
    },
  }))

  const executeDrawingOnChart = (tvWidget: any, command: DrawingCommand) => {
    try {
      tvWidget.onChartReady(() => {
        const chart = tvWidget.activeChart()
        if (!chart) return

        const { type, params } = command
        const visibleRange = chart.getVisibleRange()
        const priceScale = chart.getSeries().priceScale()

        switch (type.toUpperCase()) {
          case "LINE":
          case "TRENDLINE": {
            const [x1, y1, x2, y2, color = "#ff0000", width = "2"] = params;
            const point1 = convertToChartCoordinates(chart, x1, y1, visibleRange, priceScale);
            const point2 = convertToChartCoordinates(chart, x2, y2, visibleRange, priceScale);

            if (
              point1 && Number.isFinite(point1.time) && Number.isFinite(point1.price) &&
              point2 && Number.isFinite(point2.time) && Number.isFinite(point2.price)
            ) {
              chart.createMultipointShape([point1, point2], {
                shape: "trend_line",
                points: [point1, point2],
                overrides: {
                  linecolor: parseColor(color),
                  linewidth: Number.parseInt(width),
                  linestyle: 0,
                },
              })
            } else {
              console.error("Cannot draw Trendline due to invalid coordinates.", { point1, point2 });
            }
            break;
          }
          case "HORIZONTAL":
          case "SUPPORT":
          case "RESISTANCE": {
            const [y, color = "#00ff00", width = "2"] = params
            const price = Number.parseFloat(y)
            const timeRange = chart.getVisibleRange()
            const startTime = timeRange.from
            const endTime = timeRange.to

            const point1 = { time: startTime, price: price }
            const point2 = { time: endTime, price: price }

            chart.createShape(point1, {
              shape: "horizontal_line",
              overrides: {
                linecolor: parseColor(color),
                linewidth: Number.parseInt(width),
                linestyle: type.toUpperCase() === "SUPPORT" ? 2 : type.toUpperCase() === "RESISTANCE" ? 1 : 0,
                showLabel: true,
                text:
                  type.toUpperCase() === "SUPPORT"
                    ? "Support"
                    : type.toUpperCase() === "RESISTANCE"
                      ? "Resistance"
                      : "Level",
              },
            })
            break
          }
          case "VERTICAL": {
            const [x, color = "#0000ff", width = "2"] = params
            const time = Number.parseFloat(x)

            chart.createShape(
              { time: time },
              {
                shape: "vertical_line",
                overrides: {
                  linecolor: parseColor(color),
                  linewidth: Number.parseInt(width),
                },
              },
            )
            break
          }
          case "RECTANGLE": {
            const [x1, y1, x2, y2, color = "#0000ff", width = "2", fill] = params
            const point1 = convertToChartCoordinates(chart, x1, y1, visibleRange, priceScale)
            const point2 = convertToChartCoordinates(chart, x2, y2, visibleRange, priceScale)

            if (point1 && point2) {
              chart
                .createShape(point1, {
                  shape: "rectangle",
                  overrides: {
                    color: parseColor(color),
                    transparency: fill ? 80 : 100,
                    linewidth: Number.parseInt(width),
                  },
                })
                .then((shapeId: string) => {
                  chart.getShapeById(shapeId).setPoints([point1, point2])
                })
            }
            break
          }
          case "ARROW": {
            const [x1, y1, x2, y2, color = "#ff0000", width = "2"] = params
            const point1 = convertToChartCoordinates(chart, x1, y1, visibleRange, priceScale)
            const point2 = convertToChartCoordinates(chart, x2, y2, visibleRange, priceScale)

            if (point1 && point2) {
              chart.createShape(point1, {
                shape: "arrow_up",
                overrides: {
                  color: parseColor(color),
                  transparency: 0,
                },
              })
            }
            break
          }
          case "TEXT": {
            const [x, y, text, color = "#000000", size = "14"] = params
            const point = convertToChartCoordinates(chart, x, y, visibleRange, priceScale)

            if (point) {
              chart.createShape(point, {
                shape: "text",
                overrides: {
                  color: parseColor(color),
                  fontsize: Number.parseInt(size),
                  text: text,
                  bold: false,
                  italic: false,
                },
              })
            }
            break
          }
          case "FIBONACCI": {
            const [x1, y1, x2, y2, color = "#ffa500"] = params
            const point1 = convertToChartCoordinates(chart, x1, y1, visibleRange, priceScale)
            const point2 = convertToChartCoordinates(chart, x2, y2, visibleRange, priceScale)

            if (point1 && point2) {
              chart
                .createShape(point1, {
                  shape: "fib_retracement",
                  overrides: {
                    linecolor: parseColor(color),
                    transparency: 50,
                  },
                })
                .then((shapeId: string) => {
                  chart.getShapeById(shapeId).setPoints([point1, point2])
                })
            }
            break
          }
        }
      })
    } catch (error) {
      console.error("Error executing drawing command:", error)
    }
  }

  const convertToChartCoordinates = (chart: any, x: string, y: string, visibleRange: any, priceScale: any) => {
    try {
      let time: number
      let price: number

      if (x.includes("%")) {
        const percentage = Number.parseFloat(x) / 100
        const timeRange = visibleRange.to - visibleRange.from
        time = visibleRange.from + timeRange * percentage
      } else {
        time = Number.parseFloat(x)
      }

      if (y.includes("%")) {
        const percentage = Number.parseFloat(y) / 100
        const priceRange = priceScale.getVisiblePriceRange()
        if (priceRange) {
          price = priceRange.from + (priceRange.to - priceRange.from) * (1 - percentage)
        } else {
          price = Number.parseFloat(y)
        }
      } else {
        price = Number.parseFloat(y)
      }

      return { time: time, price: price }
    } catch (error) {
      console.error("Error converting coordinates:", error)
      return null
    }
  }

  const parseColor = (color: string) => {
    const colorMap: { [key: string]: string } = {
      red: "#ff0000",
      green: "#00ff00",
      blue: "#0000ff",
      yellow: "#ffff00",
      orange: "#ffa500",
      purple: "#800080",
      black: "#000000",
      white: "#ffffff",
    }
    return colorMap[color.toLowerCase()] || color
  }

  const clearAllDrawingsFromChart = (tvWidget: any) => {
    try {
      tvWidget.onChartReady(() => {
        const chart = tvWidget.activeChart()
        if (chart) {
          chart.removeAllShapes()
        }
      })
    } catch (error) {
      console.error("Error clearing drawings:", error)
    }
  }

  // Helper to resolve executeActionById on different widget versions
  const resolveActionExecutor = (tvWidget: any) => {
    const chart = typeof tvWidget.activeChart === "function" ? tvWidget.activeChart() : undefined
    const exec = chart?.executeActionById
      ? chart.executeActionById.bind(chart)
      : typeof tvWidget.executeActionById === "function"
        ? tvWidget.executeActionById.bind(tvWidget)
        : undefined
    return { chart, exec }
  }

  const mapToolToActionId = (tool: string): string | undefined => {
    const key = (tool || "").toLowerCase().replace(/\s+/g, "")
    const map: Record<string, string> = {
      trendline: "lineToolTrendLine",
      line: "lineToolTrendLine",
      "ترندلاین": "lineToolTrendLine",
      "خطروند": "lineToolTrendLine",
      horizontalline: "lineToolHorizontalLine",
      "خطافقی": "lineToolHorizontalLine",
      verticalline: "lineToolVerticalLine",
      "خطعمودی": "lineToolVerticalLine",
      rectangle: "lineToolRectangle",
      "مستطیل": "lineToolRectangle",
      arrow: "lineToolArrow",
      "فلش": "lineToolArrow",
      text: "text",
      "متن": "text",
      fibonacciretracement: "fibRetracement",
      "فیبوناچی": "fibRetracement",
      fibonaccifan: "fibFans",
      fibonacciarc: "fibCircles",
      pitchfork: "pitchfork",
    }
    return map[key]
  }

  const activateDrawingToolOnChart = (tvWidget: any, tool: string) => {
    try {
      tvWidget.onChartReady(() => {
        const { exec } = resolveActionExecutor(tvWidget)
        if (!exec) {
          console.warn("executeActionById not available; cannot activate tool:", tool)
          return
        }
        const actionId = mapToolToActionId(tool)
        if (!actionId) {
          console.warn("Unknown tool:", tool)
          return
        }
        exec(actionId)
      })
    } catch (error) {
      console.error("Error activating drawing tool:", error)
    }
  }

  const addStudyOnChart = (
    tvWidget: any,
    { name, inputs, newPane }: { name: string; inputs?: Record<string, any>; newPane?: boolean },
  ) => {
    try {
      tvWidget.onChartReady(() => {
        const chart = tvWidget.activeChart?.()
        if (!chart || typeof chart.createStudy !== "function") return
        chart.createStudy(name, false, !!newPane, inputs || {})
      })
    } catch (error) {
      console.error("Error adding study:", error)
    }
  }

  const handleWidgetReady = useCallback((tvWidget: any) => {
    widgetRef.current = tvWidget;
    if (drawingCommands.length > 0) {
      drawingCommands.forEach((command) => {
        executeDrawingOnChart(tvWidget, command)
      })
      setDrawingCommands([])
    }
  }, [drawingCommands]);

  return (
    <div className="w-full h-full">
      <div ref={container} className="chart-container w-full h-full flex flex-col min-h-0">
        <Script
          src="/static/datafeeds/udf/dist/bundle.js"
          strategy="lazyOnload"
          onReady={() => {
            setIsScriptReady(true)
          }}
        />
        {isScriptReady && <TVChartContainer {...defaultWidgetProps} onWidgetReady={handleWidgetReady} />}
      </div>
    </div>
  )
}
TradingViewAdvancedChart.displayName = "TradingViewAdvancedChart"
export default memo(TradingViewAdvancedChart)