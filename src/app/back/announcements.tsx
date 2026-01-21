import { getAccessToken } from './post';
import { 
    CreateAnnouncementResponse, 
    FetchAnnouncementsResponse,
    CreateAnnouncementRequest,
    Announcement
} from './announcements.types';

// TODO : implement fetch Announcements
export async function fetchAnnouncements(cafeId ?: string): Promise<FetchAnnouncementsResponse> {
    try {
        const accessToken = await getAccessToken();
        const url = cafeId ? `/api/announcements?cafe_id=${cafeId}` : `/api/announcements`;

        if (!accessToken) {
            throw new Error("Not authenticated");
        }
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization' : `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to fetch announcements');
        }
        
        return await response.json();
    }
    catch (error) {
        console.error('Fetch announcements error:', error);
        throw error;
    }
}

export async function createAnnouncement(payload: Announcement, slug : string): Promise<CreateAnnouncementResponse> {
    try {
        const accessToken = getAccessToken();

        if (!accessToken) {
            throw new Error('Not authenticated');
        }

        const response = await fetch(`/api/announcements/${slug}`, {
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

// TODO : implement update Announcement
// export async function updateAnnouncement(AnnouncementId: string, payload: ): Promise<AnnouncementBody> {}

// TODO : implement delete Announcement
// export async function deleteAnnouncement(AnnouncementId: string): Promise<void> {}