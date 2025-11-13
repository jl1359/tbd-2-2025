import { useApp } from "@/store/AppContext.jsx";
import UserMenu from "@/components/UserMenu.jsx";

export default function Topbar({ query, onQuery }) {
  const { balance, logout } = useApp(); // ⬅️ trae logout del contexto

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center gap-3">
        {/* Logo y saldo */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-emerald-600 grid place-items-center">
            <span className="text-white font-bold">DB</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
            <span className="text-xs font-semibold text-gray-600">GRC</span>
            <span className="text-sm font-bold">
              {balance.toLocaleString("es-BO", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

        {/* Buscador */}
        <div className="flex-1 max-w-xl">
          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2">
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 text-gray-500"
            >
              <path
                fill="currentColor"
                d="M10 2a8 8 0 015.292 13.708l4 4-1.414 1.414-4-4A8 8 0 1110 2m0 2a6 6 0 100 12 6 6 0 000-12z"
              />
            </svg>
            <input
              className="bg-transparent outline-none w-full text-sm"
              placeholder="¿Qué quieres comprar?"
              value={query}
              onChange={(e) => onQuery?.(e.target.value)}
            />
          </div>
        </div>

        {/* Botones del menú derecho */}
        <nav className="ml-auto flex items-center gap-2">
          {["🏠", "🛍️", "⚙️", "🔔"].map((i) => (
            <button
              key={i}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 grid place-items-center"
            >
              {i}
            </button>
          ))}

          <UserMenu />

          {/* Botón "Comprar" */}
          <button className="whitespace-nowrap rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-2">
            Comprar Green Credits
          </button>

          {/* ✅ NUEVO BOTÓN: Cerrar sesión */}
          <button
            onClick={logout}
            className="rounded-full border border-red-600 text-red-600 font-semibold px-3 py-2 hover:bg-red-50 transition"
          >
            Cerrar sesión
          </button>
        </nav>
      </div>
    </header>
  );
}

