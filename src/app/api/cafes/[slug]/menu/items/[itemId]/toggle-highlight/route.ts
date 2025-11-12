import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://api.cafesansfil.ca/v1';

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string; itemId: string }> }
) {
    try {
        const authHeader = req.headers.get('authorization');

        if (!authHeader) {
            return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
        }

        const { slug, itemId } = await params;

        const response = await fetch(`${API_BASE_URL}/cafes/${slug}/menu/items/${itemId}/toggle-highlight`, {
            method: 'PUT',
            headers: {
                'Authorization': authHeader,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.error || errorData.message || 'Failed to toggle highlight' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Toggle highlight error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
