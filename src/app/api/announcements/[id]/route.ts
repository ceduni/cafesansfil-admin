import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://api.cafesansfil.ca/v1';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params;
        const body = await request.json();

        const response = await fetch(
            `${API_BASE_URL}/cafes/${slug}/announcements/${id}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json',
                    'accept': 'application/json',
                },
                body: JSON.stringify(body),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data.detail || 'Failed to update announcement' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Announcement update error:', error);
        return NextResponse.json(
            { error: 'Failed to update announcement' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params;

        const response = await fetch(
            `${API_BASE_URL}/cafes/${slug}/announcements/${id}`,
            {
                method: 'DELETE',
                headers: {
                    'Authorization': authHeader,
                    'accept': 'application/json',
                },
            }
        );

        if (!response.ok) {
            const data = await response.json();
            return NextResponse.json(
                { error: data.detail || 'Failed to delete announcement' },
                { status: response.status }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Announcement delete error:', error);
        return NextResponse.json(
            { error: 'Failed to delete announcement' },
            { status: 500 }
        );
    }
}
