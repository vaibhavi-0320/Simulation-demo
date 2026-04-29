let tokenGetter = null;
export function setAuthTokenGetter(getter) {
    tokenGetter = getter;
}
export async function authFetch(input, init = {}) {
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
