import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "@/store/AppContext.jsx";

const ROLE_ROUTES = {
    usuario: "/perfil/usuario",
    administrador: "/perfil/administrador",
    organizacion: "/perfil/organizacion",
};

export default function UserMenu() {
    const { user, setRole, logout } = useApp();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const navigate = useNavigate();

    // cerrar con click afuera o Esc
    useEffect(() => {
        function onDoc(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
        function onEsc(e) { if (e.key === "Escape") setOpen(false); }
        document.addEventListener("mousedown", onDoc);
        document.addEventListener("keydown", onEsc);
        return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onEsc); };
    }, []);

    const toProfile = () => navigate(ROLE_ROUTES[user.role] || "/perfil/usuario");

    return (
        <div className="relative" ref={ref}>
        {/* Botón avatar */}
        <button
            onClick={() => setOpen(o => !o)}
            className={`w-9 h-9 rounded-full grid place-items-center ring-2 ${open ? "ring-black" : "ring-transparent"} bg-gray-100 hover:bg-gray-200`}
            aria-haspopup="menu" aria-expanded={open}
            title="Menú de usuario"
        >
            {/* ícono / avatar */}
            <img src={user.avatar} alt="avatar" className="w-9 h-9 rounded-full object-cover" />
        </button>

        {/* Dropdown */}
        {open && (
            <div
            role="menu"
            className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50"
            >
            <div className="p-3 flex items-center gap-3">
                <img src={user.avatar} className="w-10 h-10 rounded-full object-cover" />
                <div className="leading-tight">
                <div className="font-semibold">{user.name}</div>
                <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                </div>
            </div>
            <hr />

            <button onClick={toProfile} className="w-full text-left px-4 py-2 hover:bg-gray-50" role="menuitem">Perfil</button>
            <Link to="/seguridad" className="block px-4 py-2 hover:bg-gray-50" role="menuitem">Contraseña y Seguridad</Link>
            <Link to="/reportes" className="block px-4 py-2 hover:bg-gray-50" role="menuitem">Reportes & Estadísticos</Link>

            <div className="px-4 pt-2 pb-1 text-xs text-gray-500">Cambiar rol (demo)</div>
            <div className="px-3 pb-2 grid grid-cols-3 gap-2">
                {["usuario","administrador","organizacion"].map(r => (
                <button
                    key={r}
                    onClick={() => { setRole(r); setOpen(false); toProfile(); }}
                    className={`text-xs rounded-lg px-2 py-1 border ${user.role===r ? "bg-emerald-600 text-white border-emerald-600" : "border-gray-200 hover:bg-gray-50"}`}
                >
                    {r[0].toUpperCase() + r.slice(1)}
                </button>
                ))}
            </div>

            <hr />
            <button onClick={logout} className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600" role="menuitem">
                Cerrar sesión
            </button>
            </div>
        )}
        </div>
    );
}
