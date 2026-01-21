import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://api.cafesansfil.ca/v1';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = searchParams.get('page') || '1';
        const size = searchParams.get('size') || '20';
        const cafeId = searchParams.get('cafe_id') || null;
        const authHeader = request.headers.get('authorization');
        // filter by cafe_id if available
        const url = cafeId ? `${API_BASE_URL}/announcements?page=${page}&size=${size}&cafe_id=${cafeId}` : `${API_BASE_URL}/announcements?page=${page}&size=${size}`;

        const headers: HeadersInit = {
            'accept': 'application/json',
        };

        if (authHeader) {
            headers['Authorization'] = authHeader;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch announcements' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Cafes fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch announcements' },
            { status: 500 }
        );
    }
}