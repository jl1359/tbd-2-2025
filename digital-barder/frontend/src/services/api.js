export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export async function api(path, options) {
  const res = await fetch(API_URL + path, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...options,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
