import { getAccessToken } from './post';
import { MenuItem, MenuItemsResponse } from '../types/cafe';

export interface CreateMenuItemPayload {
    category_ids: string[];
    name: string;
    description?: string | null;
    tags?: string[];
    image_url?: string | null;
    price: number;
    in_stock?: boolean;
    options?: Array<{
        type: string;
        value: string;
        fee: number;
    }>;
}

export interface UpdateMenuItemPayload {
    category_ids?: string[];
    name?: string;
    description?: string | null;
    tags?: string[];
    image_url?: string | null;
    price?: number;
    in_stock?: boolean;
    options?: Array<{
        type: string;
        value: string;
        fee: number;
    }>;
}

export async function fetchMenuItems(cafeSlug: string, page = 1, size = 50): Promise<MenuItemsResponse> {
    try {
        const accessToken = getAccessToken();
        const headers: HeadersInit = {};

        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const response = await fetch(`/api/cafes/${cafeSlug}/menu/items?page=${page}&size=${size}`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to fetch menu items');
        }

        return await response.json();
    } catch (error) {
        console.error('Fetch menu items error:', error);
        throw error;
    }
}

export async function createMenuItem(cafeSlug: string, payload: CreateMenuItemPayload): Promise<MenuItem> {
    try {
        const accessToken = getAccessToken();

        if (!accessToken) {
            throw new Error('Not authenticated');
        }

        const response = await fetch(`/api/cafes/${cafeSlug}/menu/items`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to create menu item');
        }

        return await response.json();
    } catch (error) {
        console.error('Create menu item error:', error);
        throw error;
    }
}

export async function updateMenuItem(
    cafeSlug: string,
    itemId: string,
    payload: UpdateMenuItemPayload
): Promise<MenuItem> {
    try {
        const accessToken = getAccessToken();

        if (!accessToken) {
            throw new Error('Not authenticated');
        }

        const response = await fetch(`/api/cafes/${cafeSlug}/menu/items/${itemId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to update menu item');
        }

        return await response.json();
    } catch (error) {
        console.error('Update menu item error:', error);
        throw error;
    }
}

export async function deleteMenuItem(cafeSlug: string, itemId: string): Promise<void> {
    try {
        const accessToken = getAccessToken();

        if (!accessToken) {
            throw new Error('Not authenticated');
        }

        const response = await fetch(`/api/cafes/${cafeSlug}/menu/items/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to delete menu item');
        }
    } catch (error) {
        console.error('Delete menu item error:', error);
        throw error;
    }
}

export async function fetchCategories(cafeSlug: string) {
    try {
        const accessToken = getAccessToken();
        const headers: HeadersInit = {};

        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const response = await fetch(`/api/cafes/${cafeSlug}/menu/categories`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to fetch categories');
        }

        return await response.json();
    } catch (error) {
        console.error('Fetch categories error:', error);
        throw error;
    }
}

export async function createCategory(cafeSlug: string, payload: { name: string; description?: string }) {
    try {
        const accessToken = getAccessToken();

        if (!accessToken) {
            throw new Error('Not authenticated');
        }

        const response = await fetch(`/api/cafes/${cafeSlug}/menu/categories`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to create category');
        }

        return await response.json();
    } catch (error) {
        console.error('Create category error:', error);
        throw error;
    }
}
