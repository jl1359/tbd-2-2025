import { createContext, useContext, useMemo, useState } from "react";

const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

export default function AppProvider({ children }) {
  const [balance, setBalance] = useState(150000);
  const [favorites, setFavorites] = useState(new Set());
  const [user, setUser] = useState({
    name: "Gustavo",
    email: "gustavo@email.com",
    role: "usuario", // 'usuario' | 'administrador' | 'organizacion'
    avatar: "https://i.pravatar.cc/120?img=12",
  });

    const toggleFav = (id) =>
        setFavorites(s => {
        const n = new Set(s);
        n.has(id) ? n.delete(id) : n.add(id);
        return n;
        });

    const setRole = (role) => setUser(u => ({ ...u, role }));
    const logout = () => {
        localStorage.removeItem("db_token");
        window.location.href = "/login";
    };

    const value = useMemo(() => ({
        balance, setBalance,
        favorites, toggleFav,
        user, setUser, setRole, logout,
    }), [balance, favorites, user]);

    return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

