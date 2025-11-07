import { getAccessToken } from './post';

export interface CafeUpdatePayload {
    name?: string;
    features?: string[];
    description?: string;
    logo_url?: string;
    banner_url?: string;
    photo_urls?: string[];
    affiliation?: {
        university: string;
        faculty: string;
    };
    is_open?: boolean;
    status_message?: string;
    opening_hours?: Array<{
        day: string;
        blocks: Array<{
            start: string;
            end: string;
        }>;
    }>;
    location?: {
        pavillon: string;
        local: string;
        floor: string;
        geometry: {
            type: string;
            coordinates: number[];
        };
    };
    contact?: {
        email: string;
        phone_number: string;
        website: string;
    };
    social_media?: {
        facebook: string | null;
        instagram: string | null;
        x: string | null;
    };
    payment_details?: Array<{
        method: string;
        minimum?: number;
    }>;
    owner_id?: string;
    owner?: {
        id: string;
        username: string;
        email: string;
        first_name: string;
        last_name: string;
        photo_url: string;
        diet_profile: any;
    };
    staff?: Array<{
        id: string;
        username: string;
        email: string;
        first_name: string;
        last_name: string;
        photo_url: string;
        diet_profile: any;
    }>;
}

export async function updateCafe(slug: string, payload: CafeUpdatePayload) {
    try {
        const accessToken = getAccessToken();

        if (!accessToken) {
            throw new Error('Not authenticated');
        }

        const response = await fetch(`/api/cafes/${slug}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        console.log('Response not ok:', response);
        if (!response.ok) {

            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to update cafe');
        }

        return await response.json();
    } catch (error) {
        console.error('Update cafe error:', error);
        throw error;
    }
}

export async function uploadImage(file: File): Promise<string> {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/images/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to upload image');
        }

        const data = await response.json();
        return data.url;
    } catch (error) {
        console.error('Upload image error:', error);
        throw error;
    }
}
