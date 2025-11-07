import { getAccessToken } from './post';

export interface UpdateUserPayload {
    username?: string;
    email?: string;
    password?: string;
    first_name?: string;
    last_name?: string;
    photo_url?: string;
}

export async function updateUser(payload: UpdateUserPayload): Promise<any> {
    try {
        const accessToken = getAccessToken();

        if (!accessToken) {
            throw new Error('Not authenticated');
        }

        const response = await fetch('/api/users/@me', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to update user');
        }

        return await response.json();
    } catch (error) {
        console.error('Update user error:', error);
        throw error;
    }
}
