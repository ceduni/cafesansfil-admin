import { getAccessToken } from './post';

export interface NotificationPayload {
    title: string;
    body: string;
}

export async function sendNotification(payload: NotificationPayload): Promise<void> {
    try {
        const accessToken = getAccessToken();

        if (!accessToken) {
            throw new Error('Not authenticated');
        }

        const response = await fetch('/api/notifications/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to send notification');
        }

        return await response.json();
    } catch (error) {
        console.error('Send notification error:', error);
        throw error;
    }
}
