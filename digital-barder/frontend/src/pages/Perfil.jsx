import React, { useEffect, useState } from "react";
import hoja from "../assets/hoja.png";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

const PLACEHOLDER_FOTO =
  "https://via.placeholder.com/120?text=Foto";

export default function Perfil() {
  const [usuario, setUsuario] = useState(null);
  const [creditos, setCreditos] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      const datosUsuario = await api("/auth/me");
      const wallet = await api("/wallet/mis-creditos");

      const saldo =
        wallet?.saldo_creditos ??
        wallet?.saldo ??
        wallet?.creditos ??
        0;

      setUsuario(datosUsuario);
      setCreditos(saldo);
    } catch (err) {
      console.error("Error cargando perfil:", err);
    }
  }

  if (!usuario) {
    return (
      <div className="min-h-screen bg-[#082b1f] flex items-center justify-center text-white">
        <p>Cargando perfil…</p>
      </div>
    );
  }

  // URL de foto: usamos url_perfil del backend
  const fotoUrl = usuario.url_perfil && usuario.url_perfil.trim() !== ""
    ? usuario.url_perfil
    : PLACEHOLDER_FOTO;

  return (
    <div className="min-h-screen bg-[#082b1f] text-white p-6 md:p-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <img src={hoja} className="w-12 h-12 drop-shadow-lg" alt="logo" />
        <h1 className="text-3xl font-bold text-emerald-400">Mi Perfil</h1>
      </div>

      {/* Tarjeta principal */}
      <div className="bg-[#0e4330] border border-emerald-500 rounded-xl p-6 md:p-8 shadow-xl mb-10">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Foto */}
          <div>
            <img
              src={fotoUrl}
              alt="Foto de perfil"
              className="w-28 h-28 rounded-full object-cover border-4 border-emerald-500 shadow-lg"
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-emerald-300">
              {usuario.nombre}
            </h2>

            <p className="opacity-90">{usuario.correo}</p>

            <p className="mt-2 text-sm">
              Estado:{" "}
              <span className="font-bold text-emerald-300">
                Cuenta Normal
              </span>
            </p>

            <button
              onClick={() => navigate("/perfil/editar")}
              className="mt-4 bg-emerald-500 hover:bg-emerald-600 px-5 py-2 rounded-lg font-semibold transition"
            >
              Editar Perfil
            </button>
          </div>
        </div>
      </div>

      {/* Tarjetas secundarias */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Créditos */}
        <div className="bg-[#0e4330] border border-emerald-500 p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-emerald-300">
            Mis Créditos
          </h3>
          <p className="text-4xl font-bold text-emerald-400 mt-2">
            {creditos !== null ? creditos : "—"}
          </p>
        </div>

        {/* Logros */}
        <div
          onClick={() => navigate("/logros")}
          className="bg-[#0e4330] border border-emerald-500 p-6 rounded-xl shadow-lg 
          hover:bg-[#14694c] transition cursor-pointer"
        >
          <h3 className="text-lg font-semibold text-emerald-300">Logros</h3>
          <p className="opacity-80 mt-1">Ver mis insignias ganadas</p>
        </div>

        {/* Actividades */}
        <div
          onClick={() => navigate("/actividades")}
          className="bg-[#0e4330] border border-emerald-500 p-6 rounded-xl shadow-lg
          hover:bg-[#14694c] transition cursor-pointer"
        >
          <h3 className="text-lg font-semibold text-emerald-300">
            Actividades sostenibles
          </h3>
          <p className="opacity-80 mt-1">
            Mi impacto positivo registrado
          </p>
        </div>
      </div>

      {/* Botón extra */}
      <button
        onClick={() => navigate("/logros")}
        className="mt-6 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl 
        text-white font-semibold shadow-md transition"
      >
        Ver logros
      </button>
    </div>
  );
}
