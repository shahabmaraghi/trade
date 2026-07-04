import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 300000;

type Bar = { time: number; open: number; high: number; low: number; close: number; volume: number };

const RES_TO_MEXC: Record<string, string> = {
  '1': '1m', '5': '5m', '15': '15m', '30': '30m',
  '60': '60m', '240': '4h',
  'D': '1d', '1D': '1d', 'W': '1W', '1W': '1W', 'M': '1M', '1M': '1M',
};

const RES_TO_BYBIT: Record<string, string> = {
  '1': '1', '3': '3', '5': '5', '15': '15', '30': '30',
  '60': '60', '120': '120', '240': '240', '360': '360', '720': '720',
  'D': 'D', '1D': 'D', 'W': 'W', '1W': 'W', 'M': 'M', '1M': 'M',
};

async function fetchFromMexc(symbol: string, resolution: string, from: number, to: number): Promise<Bar[]> {
  const interval = RES_TO_MEXC[resolution] || '1d';
  const url = `https://api.mexc.com/api/v3/klines?symbol=${symbol}&interval=${interval}&startTime=${from * 1000}&endTime=${to * 1000}&limit=1000`;

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    signal: AbortSignal.timeout(8000),
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`MEXC HTTP ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error(`MEXC bad response: ${JSON.stringify(data).slice(0, 200)}`);
  }

  return data.map((k: any) => ({
    time: Math.floor(k[0] / 1000),
    open: parseFloat(k[1]),
    high: parseFloat(k[2]),
    low: parseFloat(k[3]),
    close: parseFloat(k[4]),
    volume: parseFloat(k[5]),
  }));
}

async function fetchFromBybit(symbol: string, resolution: string, from: number, to: number): Promise<Bar[]> {
  const interval = RES_TO_BYBIT[resolution] || 'D';
  const url = `https://api.bybit.com/v5/market/kline?category=spot&symbol=${symbol}&interval=${interval}&start=${from * 1000}&end=${to * 1000}&limit=1000`;

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    signal: AbortSignal.timeout(8000),
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Bybit HTTP ${res.status}: ${text.slice(0, 200)}`);
  }

  const json = await res.json();
  if (json.retCode !== 0 || !json.result?.list) {
    throw new Error(`Bybit bad response: ${JSON.stringify(json).slice(0, 200)}`);
  }

  const list = json.result.list as string[][];
  return list
    .map((k) => ({
      time: Math.floor(Number(k[0]) / 1000),
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
      volume: parseFloat(k[5]),
    }))
    .sort((a, b) => a.time - b.time);
}

async function fetchKlines(symbol: string, resolution: string, from: number, to: number): Promise<Bar[]> {
  const providers: Array<{ name: string; fn: () => Promise<Bar[]> }> = [
    { name: 'MEXC', fn: () => fetchFromMexc(symbol, resolution, from, to) },
    { name: 'Bybit', fn: () => fetchFromBybit(symbol, resolution, from, to) },
  ];

  let lastError: any = null;
  for (const provider of providers) {
    try {
      const bars = await provider.fn();
      console.log(`[${provider.name}] OK, ${bars.length} bars`);
      return bars;
    } catch (err: any) {
      console.error(`[${provider.name}] failed:`, err?.message || err);
      lastError = err;
    }
  }
  throw lastError || new Error('All providers failed');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const resolution = searchParams.get('resolution');
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    if (!symbol || !resolution || !fromParam || !toParam) {
      return NextResponse.json({ s: 'error', errmsg: 'Missing parameters' }, { status: 400 });
    }

    const from = parseInt(fromParam, 10);
    const to = parseInt(toParam, 10);

    if (!Number.isFinite(from) || !Number.isFinite(to) || from >= to) {
      return NextResponse.json({ s: 'error', errmsg: 'Invalid time range' }, { status: 400 });
    }

    const fromRounded = Math.floor(from / 600) * 600;
    const toRounded = Math.ceil(to / 600) * 600;
    const cacheKey = `${symbol}-${resolution}-${fromRounded}-${toRounded}`;

    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('Cache hit:', cacheKey);
      return NextResponse.json(cached.data);
    }

    const cleanSymbol = symbol.replace(/^crypto::/i, '').replace(/\//g, '').toUpperCase();

    console.log('Fetching klines:', { cleanSymbol, resolution, from, to });

    let bars: Bar[];
    try {
      bars = await fetchKlines(cleanSymbol, resolution, from, to);
    } catch (err: any) {
      console.error('All providers failed:', err?.message || err);
      return NextResponse.json({ s: 'no_data' });
    }

    if (!bars || bars.length === 0) {
      console.log('No data returned for this range');
      return NextResponse.json({ s: 'no_data', nextTime: from });
    }

    const result = {
      s: 'ok' as const,
      t: bars.map((b) => b.time),
      o: bars.map((b) => b.open),
      h: bars.map((b) => b.high),
      l: bars.map((b) => b.low),
      c: bars.map((b) => b.close),
      v: bars.map((b) => b.volume),
    };

    cache.set(cacheKey, { data: result, timestamp: Date.now() });
    console.log(`Cached ${result.t.length} bars for ${cacheKey}`);

    if (cache.size > 200) {
      const now = Date.now();
      for (const [key, value] of cache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          cache.delete(key);
        }
      }
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('History error:', error?.message || error);
    return NextResponse.json({ s: 'no_data' });
  }
}