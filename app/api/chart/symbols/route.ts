import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    if (!symbol) {
        return NextResponse.json({ error: 'Symbol required' }, { status: 400 });
    }

    const cleanSymbol = symbol.replace(/^crypto::/, '').replace('/', '').toUpperCase();

    const symbolInfo = {
        name: cleanSymbol,
        ticker: cleanSymbol,
        full_name: cleanSymbol,
        description: `${cleanSymbol} / USDT`,
        type: 'crypto',
        session: '24x7',
        timezone: 'Etc/UTC',
        exchange: 'Binance',
        listed_exchange: 'Binance',
        minmov: 1,
        pricescale: 100,
        has_intraday: true,
        has_daily: true,
        has_weekly_and_monthly: true,
        has_empty_bars: true,
        supported_resolutions: ['1', '5', '15', '30', '60', '240', 'D', 'W', 'M'],
        volume_precision: 8,
        data_status: 'streaming',
    };

    return NextResponse.json(symbolInfo);
}