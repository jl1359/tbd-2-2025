import { api } from "./api";

export async function getFeed(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return api(`/publicaciones${qs ? "?" + qs : ""}`);
}

export async function search(q) {
    if (!q) return [];
    return api(`/publicaciones/buscar?q=${encodeURIComponent(q)}`);
}
