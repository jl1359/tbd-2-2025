import React from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/api.js";

export default function Navbar() {
  const navigate = useNavigate();
  const usuarioJson = localStorage.getItem("usuario");
  let usuario = null;

  try {
    usuario = usuarioJson ? JSON.parse(usuarioJson) : null;
  } catch {
    usuario = null;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="font-bold text-lg text-blue-700">Digital Barter</span>
        <span className="text-xs text-gray-500 hidden sm:inline">
          Panel principal
        </span>
      </div>

      <div className="flex items-center gap-3">
        {usuario && (
          <div className="text-right">
            <p className="text-sm font-medium">
              {usuario.nombre ?? usuario.correo ?? "Usuario"}
            </p>
            <p className="text-xs text-gray-500">
              {usuario.rol ?? "Rol no asignado"}
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="px-3 py-1 text-xs rounded-md border border-gray-300 hover:bg-gray-100"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
