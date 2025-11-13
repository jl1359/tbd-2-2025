import { NavLink } from "react-router-dom";

export default function ProfileSidebar({ rol = "usuario", nombre = "Usuario" }) {
    const MENU = {
        administrador: [
        { to: "#", label: "Contraseña y Seguridad" },
        { to: "#", label: "Emitir reportes estadísticos" },
        { to: "#", label: "Información de Rol y permisos" },
        { to: "/login", label: "Cerrar sesión" },
        ],
        organizacion: [
        { to: "#", label: "Contraseña y Seguridad" },
        { to: "#", label: "Mi organización" },
        { to: "#", label: "Mi equipo" },
        { to: "/login", label: "Cerrar sesión" },
        ],
        usuario: [
        { to: "#", label: "Contraseña y Seguridad" },
        { to: "#", label: "Mis pedidos" },
        { to: "#", label: "Notificaciones" },
        { to: "/login", label: "Cerrar sesión" },
        ],
    }[rol];

    return (
        <aside className="w-full sm:w-64 bg-emerald-700 text-white rounded-r-2xl sm:rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-white/20 grid place-items-center text-xl font-bold">
            {nombre?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="leading-tight">
            <p className="text-sm opacity-90 capitalize">{rol}</p>
            <p className="font-semibold">{nombre}</p>
            </div>
        </div>

        <nav className="space-y-1">
            {MENU.map((it) => (
            <NavLink
                key={it.label}
                to={it.to}
                className="block px-3 py-2 rounded-lg hover:bg-white/10 focus:bg-white/10 focus:outline-none"
            >
                {it.label}
            </NavLink>
            ))}
        </nav>
        </aside>
    );
}
