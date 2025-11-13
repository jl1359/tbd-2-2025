import { api } from "./api";

export async function login({ correo, password }) {
    const r = await api("/auth/login", { method: "POST", body: JSON.stringify({ correo, password }) });
    if (r?.token) localStorage.setItem("token", r.token);
    return r;
}

export async function register(data) {
    return api("/auth/register", { method: "POST", body: JSON.stringify(data) });
}

export function logout() {
    localStorage.removeItem("token");
}
