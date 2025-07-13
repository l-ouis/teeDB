export const API_BASE_URL = "http://localhost:5000";

export function getImageURL(name: string): string {
    return `${API_BASE_URL}/mapres/image/${encodeURIComponent(name)}`;
}

export function getExampleURL(name: string): string {
    return `${API_BASE_URL}/mapres/example/${encodeURIComponent(name)}`;
}

export function getRulesURL(name: string): string {
    return `${API_BASE_URL}/mapres/rules/${encodeURIComponent(name)}`;
}

export async function checkAuth(key: string): Promise<boolean> {
    const res = await fetch(`${API_BASE_URL}/check_auth?key=${encodeURIComponent(key)}`);
    return res.status === 200;
}

export async function deleteMapres(name: string, key: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/delete/${encodeURIComponent(name)}?key=${encodeURIComponent(key)}`, {
        method: "DELETE",
    });
    if (!res.ok) {
        throw new Error("Failed to delete mapres");
    }
}

export async function getMapres(): Promise<any> {
    const cacheKey = "mapres_cache";
    const cacheExpiryKey = "mapres_cache_expiry";
    const cacheDuration = 1000 * 60 * 10; // 10 minutes

    const cached = localStorage.getItem(cacheKey);
    const expiry = localStorage.getItem(cacheExpiryKey);

    // skip caching for now
    // if (cached && expiry && Date.now() < Number(expiry)) {
    //     try {
    //         return JSON.parse(cached);
    //     } catch {
    //         // fall through to fetch
    //     }
    // }

    const res = await fetch(`${API_BASE_URL}/mapres`);
    if (!res.ok) throw new Error("Failed to fetch mapres");
    const data = await res.json();

    localStorage.setItem(cacheKey, JSON.stringify(data));
    localStorage.setItem(cacheExpiryKey, (Date.now() + cacheDuration).toString());

    return data;
}

export function setAPIKey(key: string): void {
    localStorage.setItem("key", key);
}

export function getAPIKey(): string | null {
    let key = localStorage.getItem("key");
    if (!key || key === "null") {
        key = "";
    }
    return key;
}