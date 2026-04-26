let tokenGetter: (() => Promise<string | null>) | null = null;

export function setAuthTokenGetter(getter: (() => Promise<string | null>) | null) {
  tokenGetter = getter;
}

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const token = tokenGetter ? await tokenGetter() : null;
  const headers = new Headers(init.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(input, {
    ...init,
    credentials: "include",
    headers,
  });
}
