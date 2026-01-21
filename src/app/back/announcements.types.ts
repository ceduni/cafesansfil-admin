interface errorDetail {
    "loc"?: any[],
    "msg": string,
    "type"?: string
}

export interface Announcement {
    "title" : string,
    "content" : string,
    "active_until" : Date,
    "tags" : string[]
}

export interface CreateAnnouncementRequest extends Announcement {
    "slug" : string;
}

interface CreateAnnouncementSuccess {
    "id": string,
    "cafe_id": string,
    "title": string,
    "content": string,
    "created_at": Date,
    "updated_at": Date,
    "active_until": Date,
    "tags": string[]
}

interface CreateAnnouncementError {
    "detail": errorDetail[]
}

export type CreateAnnouncementResponse = CreateAnnouncementSuccess | CreateAnnouncementError;

// New interfaces for FetchAnnouncementSuccess
export interface DietProfile {
    diet_ids: string[];
    preferred_nutrients: Record<string, number>;
    allergens: Record<string, number>;
}

export interface AnnouncementAuthor {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    photo_url: string;
    diet_profile: DietProfile | null;
}

export interface AnnouncementInteraction {
    type: string;
    count: number;
    me: boolean;
}

export interface AnnouncementItem {
    id: string;
    cafe_id: string;
    title: string;
    content: string;
    created_at: string;
    updated_at: string;
    active_until: string;
    tags: string[];
    author: AnnouncementAuthor;
    interactions: AnnouncementInteraction[];
}

export interface PaginationLinks {
    first: string;
    last: string;
    self: string;
    next: string | null;
    prev: string | null;
}

export interface FetchAnnouncementSuccess {
    items: AnnouncementItem[];
    total: number;
    page: number;
    size: number;
    pages: number;
    links: PaginationLinks;
}

export interface FetchAnnouncementError {
    "detail": errorDetail[]
}

export type FetchAnnouncementsResponse = FetchAnnouncementSuccess | FetchAnnouncementSuccess;