import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    return NextResponse.json({
        supports_search: true,
        supports_group_request: false,
        supported_resolutions: ['1', '3', '5', '15', '30', '45', '60', '120', '240', 'D', '1D', 'W', '1W', 'M', '1M'],
        supports_marks: false,
        supports_timescale_marks: false,
        supports_time: true,
        exchanges: [
            { value: 'Binance', name: 'Binance', desc: 'Binance' },
        ],
        symbols_types: [
            { name: 'crypto', value: 'crypto' },
        ],
    });
}