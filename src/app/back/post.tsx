interface LoginResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
}

interface User {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    photo_url: string;
    diet_profile: any;
    cafes: Array<{
        id: string;
        name: string;
        slug: string;
        logo_url: string;
        banner_url: string;
        role: string;
    }>;
    cafe_favs: any[];
    articles_favs: any[];
}

export async function login(username: string, password: string): Promise<LoginResponse> {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Invalid username or password');
    }

    return await response.json();
}

export async function getCurrentUser(accessToken: string): Promise<User> {
    const response = await fetch('/api/users/me', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch user data');
    }

    return await response.json();
}

export function saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
}

export function getAccessToken(): string | null {
    return localStorage.getItem('access_token');
}

export function getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
}

export function clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
}

export function saveUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
}

export function getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

export function logout(): void {
    clearTokens();
    if (typeof window !== 'undefined') {
        window.location.href = '/pages/Login';
    }
}
