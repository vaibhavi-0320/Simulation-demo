const MAIN_API_PATH = "/api/main";
export function buildMainApiUrl(action, query) {
    const params = new URLSearchParams();
    params.set("action", action);
    if (query) {
        for (const [key, value] of Object.entries(query)) {
            if (value !== undefined && value !== null) {
                params.set(key, String(value));
            }
        }
    }
    return `${MAIN_API_PATH}?${params.toString()}`;
}
