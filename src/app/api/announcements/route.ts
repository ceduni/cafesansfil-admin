import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://api.cafesansfil.ca/v1';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');

        if (!authHeader) {
            return NextResponse.json(
                { error: 'Authorization required' },
                { status: 401 }
            );
        }

        const response = await fetch(
            `${API_BASE_URL}/announcements`,
            {
                method: 'GET',
                headers: {
                    'Authorization': authHeader,
                    'accept': 'application/json',
                },
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data.detail || 'Failed to fetch announcements' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Announcements fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch announcements' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');

        if (!authHeader) {
            return NextResponse.json(
                { error: 'Authorization required' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');

        if (!slug) {
            return NextResponse.json(
                { error: 'Cafe slug is required' },
                { status: 400 }
            );
        }

        const body = await request.json();

        console.log('Creating announcement for slug:', slug);
        console.log('Request body:', body);

        const response = await fetch(
            `${API_BASE_URL}/cafes/${slug}/announcements`,
            {
                method: 'POST',
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json',
                    'accept': 'application/json',
                },
                body: JSON.stringify(body),
            }
        );

        const data = await response.json();
        console.log('Backend response:', response.status, data);

        if (!response.ok) {
            return NextResponse.json(
                { error: data.detail || 'Failed to create announcement' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Announcement create error:', error);
        return NextResponse.json(
            { error: 'Failed to create announcement' },
            { status: 500 }
        );
    }
}
