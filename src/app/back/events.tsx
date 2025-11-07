import { getAccessToken } from './post';

export interface Ticketing {
    ticket_url: string;
    ticket_price: number;
}

export interface EventBase {
    name: string;
    description?: string | null;
    image_url?: string | null;
    start_date: string;
    end_date: string;
    location?: string | null;
    ticket?: Ticketing | null;
    max_support?: number;
}

export interface Event extends EventBase {
    id: string;
    cafe_ids: string[];
    creator_id: string;
    editor_ids: string[];
}

export interface CreateEventPayload extends EventBase {
    cafe_ids?: string[];
}

export interface UpdateEventPayload {
    name?: string;
    description?: string | null;
    image_url?: string | null;
    start_date?: string;
    end_date?: string;
    location?: string | null;
    ticket?: Ticketing | null;
    max_support?: number;
    editor_ids?: string[];
}

export async function fetchEvents(): Promise<Event[]> {
    try {
        const accessToken = getAccessToken();

        if (!accessToken) {
            throw new Error('Not authenticated');
        }

        const response = await fetch('/api/events', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            // If 404, return empty array (no events yet)
            if (response.status === 404) {
                return [];
            }
            throw new Error(errorData.error || 'Failed to fetch events');
        }

        const data = await response.json();
        // Ensure we always return an array
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Fetch events error:', error);
        throw error;
    }
}

export async function fetchEvent(eventId: string): Promise<Event> {
    try {
        const accessToken = getAccessToken();

        if (!accessToken) {
            throw new Error('Not authenticated');
        }

        const response = await fetch(`/api/events/${eventId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to fetch event');
        }

        return await response.json();
    } catch (error) {
        console.error('Fetch event error:', error);
        throw error;
    }
}

export async function createEvent(payload: CreateEventPayload): Promise<Event> {
    try {
        const accessToken = getAccessToken();

        if (!accessToken) {
            throw new Error('Not authenticated');
        }

        const response = await fetch('/api/events', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to create event');
        }

        return await response.json();
    } catch (error) {
        console.error('Create event error:', error);
        throw error;
    }
}

export async function updateEvent(eventId: string, payload: UpdateEventPayload): Promise<Event> {
    try {
        const accessToken = getAccessToken();

        if (!accessToken) {
            throw new Error('Not authenticated');
        }

        const response = await fetch(`/api/events/${eventId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to update event');
        }

        return await response.json();
    } catch (error) {
        console.error('Update event error:', error);
        throw error;
    }
}

export async function deleteEvent(eventId: string): Promise<void> {
    try {
        const accessToken = getAccessToken();

        if (!accessToken) {
            throw new Error('Not authenticated');
        }

        const response = await fetch(`/api/events/${eventId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to delete event');
        }
    } catch (error) {
        console.error('Delete event error:', error);
        throw error;
    }
}
