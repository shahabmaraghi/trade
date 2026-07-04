import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const result = await extractApiKey();

        if (!result) {
            return NextResponse.json(
                { error: 'Failed to extract URL' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, apiKey: result });
    } catch (error) {
        console.error('Error in tradingview API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

async function extractApiKey(): Promise<string | null> {
    const siteUrl = "https://apis.sourcearena.ir/tradingview/last__/";
    const baseUrl = "https://tradingview.sourcearena.ir/bourse-data/";

    try {
        const response = await fetch(siteUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const content = await response.text();
        const pattern = /[a-f0-9]{64}/g;
        const matches = content.match(pattern);

        if (!matches || matches.length === 0) {
            return null;
        }

        const apiKey = matches[0];
        const testUrl = `${baseUrl}${apiKey}/config`;

        // Test if the URL is valid
        const testResponse = await fetch(testUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (testResponse.ok) {
            return `${apiKey}`;
        } else {
            return null;
        }

    } catch (error) {
        console.error('Error extracting URL:', error);
        return null;
    }
}

export { extractApiKey };