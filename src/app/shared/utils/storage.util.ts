export class StorageUtil {
    static get<T>(key: string): T | null {
        try {
            if (typeof localStorage === 'undefined') return null;
            const raw = localStorage.getItem(key);
            if (!raw) return null;
            return JSON.parse(raw) as T;
        } catch {
            return null;
        }
    }

    static set<T>(key: string, value: T): void {
        try {
            if (typeof localStorage === 'undefined') return;
            localStorage.setItem(key, JSON.stringify(value));
        } catch {
            // ignore
        }
    }

    static remove(key: string): void {
        try {
            if (typeof localStorage === 'undefined') return;
            localStorage.removeItem(key);
        } catch {
            // ignore
        }
    }
}