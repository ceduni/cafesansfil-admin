import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://api.cafesansfil.ca/v1';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await context.params;
        const authHeader = request.headers.get('authorization');

        const headers: HeadersInit = {
            'accept': 'application/json',
        };

        if (authHeader) {
            headers['Authorization'] = authHeader;
        }

        const response = await fetch(`${API_BASE_URL}/cafes/${slug}`, {
            method: 'GET',
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch cafe data' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Cafe fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch cafe data' },
            { status: 500 }
        );
    }
}
