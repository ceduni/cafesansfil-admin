import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://cafesansfil-api-r0kj.onrender.com/api';

export async function PUT(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');

        if (!authHeader) {
            return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
        }

        const body = await req.json();

        const response = await fetch(`${API_BASE_URL}/users/@me`, {
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
                { error: errorData.error || errorData.message || 'Failed to update user' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Update user error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
