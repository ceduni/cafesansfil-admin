import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const cloudflareToken = process.env.CLOUDFLARE_API_TOKEN;
        const cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;

        if (!cloudflareToken || !cloudflareAccountId) {
            return NextResponse.json(
                { error: 'Cloudflare credentials not configured' },
                { status: 500 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Create new FormData for Cloudflare
        const cloudflareFormData = new FormData();
        cloudflareFormData.append('file', file);
        cloudflareFormData.append('requireSignedURLs', 'false');
        cloudflareFormData.append('metadata', JSON.stringify({ key: 'cafe_image' }));

        const response = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId}/images/v1`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${cloudflareToken}`,
                },
                body: cloudflareFormData,
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Cloudflare upload error:', errorData);
            return NextResponse.json(
                { error: 'Failed to upload image to Cloudflare' },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log('Cloudflare upload response:', data);

        // Return the public variant URL (2nd variant)
        if (data.result && data.result.variants && data.result.variants.length >= 2) {
            return NextResponse.json({
                success: true,
                url: data.result.variants[1] // The "public" variant
            });
        }

        return NextResponse.json(
            { error: 'No public variant URL in response' },
            { status: 500 }
        );
    } catch (error) {
        console.error('Error uploading image:', error);
        return NextResponse.json(
            { error: 'Failed to upload image' },
            { status: 500 }
        );
    }
}
