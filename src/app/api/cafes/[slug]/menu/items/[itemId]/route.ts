import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://cafesansfil-api-r0kj.onrender.com/api';

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ slug: string; itemId: string }> }
) {
    try {
        const { slug, itemId } = await context.params;
        const authHeader = request.headers.get('authorization');

        if (!authHeader) {
            return NextResponse.json(
                { error: 'No authorization header' },
                { status: 401 }
            );
        }

        const body = await request.json();

        const response = await fetch(
            `${API_BASE_URL}/cafes/${slug}/menu/items/${itemId}`,
            {
                method: 'PUT',
                headers: {
                    'accept': 'application/json',
                    'Authorization': authHeader,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data.detail || 'Failed to update menu item' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Menu item update error:', error);
        return NextResponse.json(
            { error: 'Failed to update menu item' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ slug: string; itemId: string }> }
) {
    try {
        const { slug, itemId } = await context.params;
        const authHeader = request.headers.get('authorization');

        if (!authHeader) {
            return NextResponse.json(
                { error: 'No authorization header' },
                { status: 401 }
            );
        }

        const response = await fetch(
            `${API_BASE_URL}/cafes/${slug}/menu/items/${itemId}`,
            {
                method: 'DELETE',
                headers: {
                    'accept': 'application/json',
                    'Authorization': authHeader,
                },
            }
        );

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            return NextResponse.json(
                { error: data.detail || 'Failed to delete menu item' },
                { status: response.status }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Menu item delete error:', error);
        return NextResponse.json(
            { error: 'Failed to delete menu item' },
            { status: 500 }
        );
    }
}
