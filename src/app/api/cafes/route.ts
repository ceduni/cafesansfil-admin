import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://cafesansfil-api-r0kj.onrender.com/api';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = searchParams.get('page') || '1';
        const size = searchParams.get('size') || '20';
        const authHeader = request.headers.get('authorization');

        const headers: HeadersInit = {
            'accept': 'application/json',
        };

        if (authHeader) {
            headers['Authorization'] = authHeader;
        }

        const response = await fetch(`${API_BASE_URL}/cafes?page=${page}&size=${size}`, {
            method: 'GET',
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch cafes' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Cafes fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch cafes' },
            { status: 500 }
        );
    }
}
