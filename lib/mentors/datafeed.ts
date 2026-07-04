const getBarsCache = new Map<string, { data: any[]; ts: number }>();
const GETBARS_TTL = 10000;

const realtimeSubscriptions = new Map<string, { interval: any; callback: any }>();

export const configureDatafeed = () => {
  return {
    onReady: (callback: any) => {
      setTimeout(() => {
        callback({
          supported_resolutions: [
            "1", "5", "10", "15", "30", "45", "60", "120", "240", "D", "W", "M",
          ],
          symbols_types: [
            { name: "crypto", value: "crypto" },
          ],
        });
      }, 0);
    },

    searchSymbols: (
      userInput: string,
      exchange: string,
      symbolType: string,
      onResultReadyCallback: any
    ) => {
      onResultReadyCallback([]);
    },

    resolveSymbol: async (
      symbolName: string,
      onSymbolResolvedCallback: any,
      onResolveErrorCallback: any
    ) => {
      try {
        const response = await fetch(`/api/chart/symbols?symbol=${symbolName}`);
        const data = await response.json();

        const symbolInfo = {
          name: data.name,
          ticker: data.name,
          full_name: data.name,
          description: data.description || `${data.name}/USDT`,
          type: data.type || "crypto",
          session: data.session || "24x7",
          timezone: data.timezone || "Etc/UTC",
          exchange: data["exchange-listed"] || "Binance",
          minmov: data.minmov || 1,
          pricescale: data.pricescale || 100,
          has_intraday: true,
          has_daily: true,
          has_weekly_and_monthly: true,
          supported_resolutions: data.supported_resolutions || [
            "1", "5", "10", "15", "30", "45", "60", "120", "240", "D", "W", "M",
          ],
          volume_precision: 8,
          data_status: "streaming",
        };

        onSymbolResolvedCallback(symbolInfo);
      } catch (error) {
        console.error(error);
        onResolveErrorCallback("Cannot resolve symbol");
      }
    },

    getBars: async (
      symbolInfo: any,
      resolution: string,
      periodParams: any,
      onHistoryCallback: any,
      onErrorCallback: any
    ) => {
      try {
        let { from, to, countBack, firstDataRequest } = periodParams;
        const nowTimestamp = Math.floor(Date.now() / 1000);

        if (firstDataRequest || !from || from < 0 || from > nowTimestamp) {
          const daysBack =
            resolution === "D" ? 300 : resolution === "W" ? 520 : resolution === "M" ? 1200 : 100;
          from = nowTimestamp - daysBack * 24 * 60 * 60;
        }

        if (!to || to < 0 || to < from || to > nowTimestamp + 86400) {
          to = nowTimestamp;
        }

        if (!countBack || countBack < 0 || countBack > 1000) {
          countBack = 300;
        }

        const fromRounded = Math.floor(from / 60) * 60;
        const toRounded = Math.floor(to / 60) * 60;
        const cacheKey = `${symbolInfo.name}-${resolution}-${fromRounded}-${toRounded}`;

        const cached = getBarsCache.get(cacheKey);
        if (cached && Date.now() - cached.ts < GETBARS_TTL) {
          onHistoryCallback(cached.data, { noData: cached.data.length === 0 });
          return;
        }

        const url = `/api/chart/history?symbol=${symbolInfo.name}&resolution=${resolution}&from=${from}&to=${to}`;
        const response = await fetch(url);
        const data = await response.json();

        if (!data || data.s === "no_data" || !data.t || data.t.length === 0) {
          getBarsCache.set(cacheKey, { data: [], ts: Date.now() });
          onHistoryCallback([], { noData: true });
          return;
        }

        const bars = data.t.map((time: number, index: number) => ({
          time: time * 1000,
          open: Number(data.o[index]),
          high: Number(data.h[index]),
          low: Number(data.l[index]),
          close: Number(data.c[index]),
          volume: Number(data.v?.[index] || 0),
        }));

        getBarsCache.set(cacheKey, { data: bars, ts: Date.now() });
        onHistoryCallback(bars, { noData: false });
      } catch (error) {
        console.error("getBars Error:", error);
        onErrorCallback(error instanceof Error ? error.message : "Unknown error");
      }
    },

    subscribeBars: (
      symbolInfo: any,
      resolution: string,
      onRealtimeCallback: any,
      subscriberUID: string,
      onResetCacheNeededCallback: any
    ) => {
      console.log("Subscribe to:", symbolInfo.name, resolution);

      const interval = setInterval(() => {
        const now = Math.floor(Date.now() / 1000);
        const from = now - 86400; 

        fetch(`/api/chart/history?symbol=${symbolInfo.name}&resolution=${resolution}&from=${from}&to=${now}`)
          .then((res) => res.json())
          .then((data) => {
            if (data && data.s === "ok" && data.t && data.t.length > 0) {
              const lastIndex = data.t.length - 1;
              const lastBar = {
                time: data.t[lastIndex] * 1000,
                open: Number(data.o[lastIndex]),
                high: Number(data.h[lastIndex]),
                low: Number(data.l[lastIndex]),
                close: Number(data.c[lastIndex]),
                volume: Number(data.v?.[lastIndex] || 0),
              };
              onRealtimeCallback(lastBar);
            }
          })
          .catch((err) => console.error("Realtime error:", err));
      }, 5000);

      realtimeSubscriptions.set(subscriberUID, { interval, callback: onRealtimeCallback });
    },

    unsubscribeBars: (subscriberUID: string) => {
      console.log("Unsubscribe:", subscriberUID);
      const sub = realtimeSubscriptions.get(subscriberUID);
      if (sub) {
        clearInterval(sub.interval);
        realtimeSubscriptions.delete(subscriberUID);
      }
    },
  };
};