import { Link, NavLink } from "react-router-dom";

const Item = ({ to, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `block rounded px-3 py-2 ${isActive ? "bg-gray-900 text-white" : "hover:bg-gray-100"}`
    }
  >
    {label}
  </NavLink>
);

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r min-h-screen p-4 space-y-4">
      <Link to="/home" className="inline-block text-2xl font-black text-green-700">
        Digital Barter
      </Link>
      <div className="space-y-1">
        <Item to="/home" label="Inicio" />
        <Item to="/register" label="Crear cuenta" />
        <Item to="/login" label="Iniciar sesión" />
      </div>
    </aside>
  );
}
