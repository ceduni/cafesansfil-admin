import { getAccessToken, getUser } from './post';

export interface Author {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    photo_url: string | null;
    diet_profile: any;
}

export interface Announcement {
    id: string;
    cafe_id: string;
    title: string;
    content: string;
    created_at: string;
    updated_at: string;
    active_until: string;
    tags: string[];
    author: Author;
    interactions: any[];
}

export interface CreateAnnouncementPayload {
    title: string;
    content: string;
    active_until: string;
    tags: string[];
}

export interface UpdateAnnouncementPayload {
    title?: string;
    content?: string;
    active_until?: string;
    tags?: string[];
}

export interface AnnouncementsResponse {
    items: Announcement[];
    total: number;
    page: number;
    size: number;
    pages: number;
    links: {
        first: string;
        last: string;
        self: string;
        next: string | null;
        prev: string | null;
    };
}

export async function fetchAnnouncements(cafeId?: string): Promise<Announcement[]> {
    try {
        const accessToken = getAccessToken();

        if (!accessToken) {
            throw new Error('Not authenticated');
        }

        const response = await fetch('/api/announcements', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            // If 404, return empty array (no announcements yet)
            if (response.status === 404) {
                return [];
            }
            throw new Error(errorData.error || 'Failed to fetch announcements');
        }

        const data: AnnouncementsResponse = await response.json();

        // Filter by cafe_id if provided
        if (cafeId) {
            return data.items.filter(ann => ann.cafe_id === cafeId);
        }

        // Otherwise, filter by the user's cafes
        const user = getUser();
        if (user && user.cafes.length > 0) {
            const ownedCafeIds = user.cafes
                .filter(cafe => cafe.role === 'OWNER')
                .map(cafe => cafe.id);
            return data.items.filter(ann => ownedCafeIds.includes(ann.cafe_id));
        }

        return data.items;
    } catch (error) {
        console.error('Fetch announcements error:', error);
        throw error;
    }
}

export async function createAnnouncement(slug: string, payload: CreateAnnouncementPayload): Promise<Announcement> {
    try {
        const accessToken = getAccessToken();

        if (!accessToken) {
            throw new Error('Not authenticated');
        }

        const response = await fetch(`/api/announcements?slug=${slug}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to create announcement');
        }

        return await response.json();
    } catch (error) {
        console.error('Create announcement error:', error);
        throw error;
    }
}

export async function updateAnnouncement(slug: string, announcementId: string, payload: UpdateAnnouncementPayload): Promise<Announcement> {
    try {
        const accessToken = getAccessToken();

        if (!accessToken) {
            throw new Error('Not authenticated');
        }

        const response = await fetch(`/api/announcements/${announcementId}?slug=${slug}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to update announcement');
        }

        return await response.json();
    } catch (error) {
        console.error('Update announcement error:', error);
        throw error;
    }
}

export async function deleteAnnouncement(slug: string, announcementId: string): Promise<void> {
    try {
        const accessToken = getAccessToken();

        if (!accessToken) {
            throw new Error('Not authenticated');
        }

        const response = await fetch(`/api/announcements/${announcementId}?slug=${slug}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to delete announcement');
        }
    } catch (error) {
        console.error('Delete announcement error:', error);
        throw error;
    }
}
