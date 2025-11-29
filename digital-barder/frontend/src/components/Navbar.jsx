// src/components/Navbar.jsx
import React from "react";
import hoja from "../assets/hoja.png";

export default function Navbar() {
  return (
    <nav className="w-full bg-[#0b3a2c] border-b border-emerald-600 px-6 py-4 flex items-center justify-between shadow-md">
      
      {/* LOGO */}
      <div className="flex items-center gap-3 cursor-pointer"
        onClick={() => (window.location.href = "/home")}
      >
        <img src={hoja} className="w-9 h-9 drop-shadow-lg" />
        <h1 className="text-2xl font-bold text-emerald-400">
          Digital Barter
        </h1>
      </div>

      {/* BOTONES DE NAVEGACIÓN */}
      <div className="flex items-center gap-6">

        {/* PERFIL */}
        <a
          href="/perfil"
          className="text-white hover:text-emerald-400 transition font-semibold"
        >
          Perfil
        </a>

        {/* WALLET */}
        <a
          href="/wallet"
          className="text-white hover:text-emerald-400 transition font-semibold"
        >
          Wallet
        </a>

        {/* PUBLICACIONES */}
        <a
          href="/publicaciones"
          className="text-white hover:text-emerald-400 transition font-semibold"
        >
          Publicaciones
        </a>

        {/* ACTIVIDADES */}
        <a
          href="/actividades"
          className="text-white hover:text-emerald-400 transition font-semibold"
        >
          Actividades
        </a>

        {/* PREMIUM */}
        <a
          href="/premium"
          className="text-white hover:text-yellow-400 transition font-semibold"
        >
          Premium
        </a>
        {/* INTERCAMBIOS */}
        <a
          href="/intercambios"
          className="text-white hover:text-emerald-400 transition font-semibold"
        >
          Intercambios
        </a>


        {/* CERRAR SESIÓN */}
        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
          className="bg-emerald-500 hover:bg-emerald-600 px-4 py-1 rounded-lg text-white font-semibold transition"
        >
          Salir
        </button>
      </div>
    </nav>
  );
}
