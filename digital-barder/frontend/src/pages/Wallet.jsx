import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import hoja from "../assets/hoja.png";

export default function Wallet() {
  const [saldo, setSaldo] = useState(0);
  const [bloqueado, setBloqueado] = useState(0);
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      setCargando(true);
      setError("");

      const [resCreditos, resMovs] = await Promise.all([
        api("/wallet/mis-creditos"),
        api("/wallet/mis-movimientos"),
      ]);

      // 👇 AQUÍ usamos saldo_creditos que viene del backend
      const saldoDisponible =
        resCreditos?.saldo_creditos ??
        resCreditos?.saldo ??
        resCreditos?.creditos ??
        0;

      const saldoBloqueado =
        resCreditos?.saldo_bloqueado ??
        resCreditos?.bloqueado ??
        0;

      setSaldo(saldoDisponible);
      setBloqueado(saldoBloqueado);

      setMovimientos(
        Array.isArray(resMovs) ? resMovs.slice(0, 10) : []
      );
    } catch (err) {
      console.error("Error cargando wallet:", err);
      setError(err.message || "Error al cargar la información de la wallet.");
    } finally {
      setCargando(false);
    }
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#082b1f] text-white flex items-center justify-center">
        Cargando billetera...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#082b1f] text-white p-6 md:p-10">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-8">
        <img src={hoja} alt="logo" className="w-10 h-10 drop-shadow-lg" />
        <h1 className="text-3xl font-bold text-emerald-400">Mi Wallet</h1>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-4 rounded-md border border-red-400 bg-red-900/40 px-4 py-2 text-sm text-red-100">
          {error}
        </div>
      )}

      {/* TARJETAS RESUMEN */}
      <div className="grid gap-6 md:grid-cols-3 mb-10">
        {/* Créditos disponibles */}
        <div className="rounded-2xl border border-emerald-700 bg-[#0f3f2d] p-6 shadow-lg">
          <p className="text-emerald-200 text-sm mb-2">Créditos disponibles</p>
          <p className="text-4xl font-bold text-emerald-300">{saldo}</p>
        </div>

        {/* Créditos bloqueados */}
        <div className="rounded-2xl border border-emerald-700 bg-[#0f3f2d] p-6 shadow-lg">
          <p className="text-emerald-200 text-sm mb-2">Créditos bloqueados</p>
          <p className="text-4xl font-bold text-yellow-300">{bloqueado}</p>
        </div>

        {/* Acciones rápidas */}
        <div className="rounded-2xl border border-emerald-700 bg-[#0f3f2d] p-6 shadow-lg flex flex-col gap-3">
          <p className="text-emerald-200 text-sm mb-2">Acciones rápidas</p>

          <button
            onClick={() => navigate("/comprar-creditos")}
            className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 py-2 text-sm font-semibold"
          >
            Comprar créditos
          </button>

          <button
            onClick={() => navigate("/wallet/movimientos")}
            className="w-full rounded-xl bg-[#0f3f2d] border border-emerald-500 hover:bg-emerald-700 py-2 text-sm font-semibold"
          >
            Ver movimientos
          </button>

          <button
            onClick={() => navigate("/wallet/compras")}
            className="w-full rounded-xl bg-[#0f3f2d] border border-emerald-500 hover:bg-emerald-700 py-2 text-sm font-semibold"
          >
            Historial de compras
          </button>
        </div>
      </div>

      {/* ÚLTIMOS MOVIMIENTOS */}
      <section className="rounded-2xl border border-emerald-700 bg-[#0f3f2d] p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-emerald-300 mb-4">
          Últimos movimientos
        </h2>

        {movimientos.length === 0 ? (
          <p className="text-sm text-emerald-100/80">
            Aún no tienes movimientos en tu billetera.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {movimientos.map((m) => (
              <div
                key={m.id_movimiento}
                className="flex items-center justify-between rounded-xl border border-emerald-700 bg-[#0e3a2a] px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-emerald-200">
                    {m.tipo_movimiento || "MOVIMIENTO"}
                  </p>
                  <p className="text-xs text-emerald-100/70">
                    {m.tipo_referencia || "Sin descripción"}
                  </p>
                  <p className="text-[11px] text-emerald-100/60 mt-1">
                    {m.creado_en
                      ? new Date(m.creado_en).toLocaleString()
                      : ""}
                  </p>
                </div>

                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      m.cantidad >= 0 ? "text-emerald-300" : "text-red-300"
                    }`}
                  >
                    {m.cantidad >= 0 ? "+" : ""}
                    {m.cantidad} cr.
                  </p>
                  <p className="text-[11px] text-emerald-100/60 mt-1">
                    Saldo: {m.saldo_posterior ?? m.saldo_posterior ?? "-"} cr.
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
