const API_BASE = import.meta.env.VITE_API_URL || '';
const MAIN_API_PATH = `${API_BASE}/api/main`;

export function buildMainApiUrl(
  action: string,
  query?: Record<string, string | number | boolean | null | undefined>
) {
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
