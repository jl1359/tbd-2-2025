import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import hoja from "../assets/hoja.png";

export default function Home() {
  const [statusAPI, setStatusAPI] = useState("Cargando...");
  const [misCreditos, setMisCreditos] = useState(null);
  const [actividadReciente, setActividadReciente] = useState([]);

  useEffect(() => {
    cargarTodo();
  }, []);

  async function cargarTodo() {
    try {
      const estado = await api("/health");
      setStatusAPI(estado.message || "OK");

      const creditos = await api("/wallet/mis-creditos");
      setMisCreditos(creditos.saldo);

      const act = await api("/wallet/mis-movimientos");
      setActividadReciente(act.slice(0, 5));
    } catch (err) {
      setStatusAPI("Error conectando al backend");
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#082b1f] text-white px-6 py-10">
      
      {/* ENCABEZADO */}
      <div className="flex items-center gap-3 mb-10">
        <img src={hoja} alt="logo" className="w-12 h-12 drop-shadow-lg" />
        <h1 className="text-3xl font-bold text-emerald-400 drop-shadow-md">
          Digital Barter – Inicio
        </h1>
      </div>

      {/* ESTADO DEL SISTEMA */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-emerald-300 mb-3">
          Estado del sistema
        </h2>

        <div className="bg-[#0f3f2d] p-5 rounded-xl border border-emerald-600 shadow-lg">
          <p className="text-lg">{statusAPI}</p>
        </div>
      </section>

      {/* RESUMEN RÁPIDO */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-emerald-300 mb-4">
          Resumen rápido
        </h2>

        <div className="grid md:grid-cols-3 gap-6">

          {/* TARJETA CREDITOS */}
          <div className="bg-[#0e4330] p-6 rounded-xl border border-emerald-500 shadow-md hover:scale-[1.02] transition transform cursor-pointer">
            <h3 className="text-lg font-bold text-emerald-300">Mis Créditos</h3>
            <p className="text-4xl font-bold mt-2 text-emerald-400 drop-shadow-md">
              {misCreditos !== null ? misCreditos : "—"}
            </p>
          </div>

          {/* TARJETA PUBLICACIONES */}
          <a
            href="/publicaciones"
            className="bg-[#0e4330] p-6 rounded-xl border border-emerald-500 shadow-md hover:bg-[#14694c] hover:scale-[1.02] transition transform cursor-pointer"
          >
            <h3 className="text-lg font-bold text-emerald-300">Marketplace</h3>
            <p className="opacity-80 mt-1">Explora productos y servicios</p>
          </a>

          {/* TARJETA WALLET */}
          <a
            href="/wallet"
            className="bg-[#0e4330] p-6 rounded-xl border border-emerald-500 shadow-md hover:bg-[#14694c] hover:scale-[1.02] transition transform cursor-pointer"
          >
            <h3 className="text-lg font-bold text-emerald-300">Mi Billetera</h3>
            <p className="opacity-80 mt-1">Ver movimientos y saldo</p>
          </a>
        </div>
      </section>

      {/* ACTIVIDAD RECIENTE */}
      <section className="mb-20">
        <h2 className="text-xl font-semibold text-emerald-300 mb-4">
          Actividad reciente
        </h2>

        <div className="bg-[#0f3f2d] p-5 rounded-xl border border-emerald-600 shadow-lg">
          {actividadReciente.length === 0 ? (
            <p className="opacity-80">No hay actividad reciente.</p>
          ) : (
            <ul className="space-y-3">
              {actividadReciente.map((a, i) => (
                <li
                  key={i}
                  className="bg-[#0e4330] p-4 rounded-lg border border-emerald-500 shadow-md"
                >
                  <p className="text-emerald-300 font-semibold">
                    {a.tipo_movimiento}
                  </p>
                  <p className="text-sm opacity-80">{a.descripcion || "Movimiento realizado"}</p>
                  <p className="mt-1 text-emerald-400 font-bold">
                    {a.creditos} créditos
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

    </div>
  );
}
