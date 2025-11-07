import { getAccessToken } from './post';

export default async function fetchCafe(url: string) {
    try {
        const accessToken = getAccessToken();
        const headers: HeadersInit = {};

        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const response = await fetch(`/api/cafes/${url}`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        return null;
    }
}

interface CafeQueryParams {
    page?: number;
    size?: number;
}

export async function fetchAllCafes(params?: CafeQueryParams) {
    try {
        const accessToken = getAccessToken();
        const queryParams = new URLSearchParams({
            page: String(params?.page || 1),
            size: String(params?.size || 20),
        });

        const headers: HeadersInit = {};

        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const response = await fetch(`/api/cafes?${queryParams}`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        return null;
    }
}

export async function fetchUserOwnedCafes() {
    try {
        const data = await fetchAllCafes();
        if (!data) return null;

        // Get user from localStorage
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;

        const user = JSON.parse(userStr);
        const ownedCafeIds = user.cafes
            .filter((cafe: any) => cafe.role === 'OWNER')
            .map((cafe: any) => cafe.id);

        // Filter cafes to only show owned ones
        const ownedCafes = data.items.filter((cafe: any) =>
            ownedCafeIds.includes(cafe.id)
        );

        return {
            ...data,
            items: ownedCafes,
            total: ownedCafes.length
        };
    } catch (error) {
        console.error('Fetch error:', error);
        return null;
    }
}