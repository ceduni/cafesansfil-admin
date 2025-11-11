import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://cafesansfil-api-r0kj.onrender.com/api';

export async function PUT(
    req: NextRequest,
    { params }: { params: { slug: string; categoryId: string } }
) {
    try {
        const authHeader = req.headers.get('authorization');

        if (!authHeader) {
            return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
        }

        const body = await req.json();
        const { slug, categoryId } = params;

        const response = await fetch(`${API_BASE_URL}/cafes/${slug}/menu/categories/${categoryId}`, {
            method: 'PUT',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.error || errorData.message || 'Failed to update category' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Update category error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { slug: string; categoryId: string } }
) {
    try {
        const authHeader = req.headers.get('authorization');

        if (!authHeader) {
            return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
        }

        const { slug, categoryId } = params;

        const response = await fetch(`${API_BASE_URL}/cafes/${slug}/menu/categories/${categoryId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': authHeader,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.error || errorData.message || 'Failed to delete category' },
                { status: response.status }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete category error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
