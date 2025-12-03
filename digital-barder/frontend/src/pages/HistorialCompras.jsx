import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import hoja from "../assets/hoja.png";
import { getMisComprasCreditos } from "../services/api";

export default function HistorialCompras() {
  const [compras, setCompras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    try {
      setCargando(true);
      setError("");
      const data = await getMisComprasCreditos();
      setCompras(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Error al cargar el historial de compras de créditos.");
      setCompras([]);
    } finally {
      setCargando(false);
    }
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#082b1f] text-white flex items-center justify-center">
        Cargando historial de compras.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#082b1f] text-white p-6 md:p-10">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            className="bg-black/30 hover:bg-black/40 px-3 py-1 rounded-full text-xs"
            onClick={() => navigate(-1)}
          >
            Volver
          </button>
          <h1 className="text-2xl font-semibold text-emerald-300">
            Historial de compras de créditos
          </h1>
        </div>
        <img src={hoja} alt="logo" className="w-9 h-9 drop-shadow-md" />
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-400 bg-red-900/40 px-4 py-2 text-sm text-red-100">
          {error}
        </div>
      )}

      {/* TABLA */}
      <div className="bg-[#0f3f2d] border border-emerald-700 rounded-2xl p-4 md:p-6 shadow-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-emerald-200 border-b border-emerald-700/60">
                <th className="px-3 py-2">Fecha</th>
                <th className="px-3 py-2">Paquete</th>
                <th className="px-3 py-2 text-right">Créditos</th>
                <th className="px-3 py-2 text-right">Monto (Bs)</th>
                <th className="px-3 py-2 text-right">Estado</th>
              </tr>
            </thead>
            <tbody>
              {compras.map((c) => (
                <tr
                  key={c.id_compra}
                  className="border-b border-emerald-800/40 last:border-0"
                >
                  <td className="px-3 py-2">
                    {c.creado_en
                      ? new Date(c.creado_en).toLocaleString()
                      : ""}
                  </td>
                  <td className="px-3 py-2">{c.paquete}</td>
                  <td className="px-3 py-2 text-right">
                    {c.cantidad_creditos}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {c.monto_bs?.toFixed
                      ? c.monto_bs.toFixed(2)
                      : Number(c.monto_bs || 0).toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-black/30 border border-emerald-500/60">
                      {c.estado}
                    </span>
                  </td>
                </tr>
              ))}

              {compras.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-4 text-center text-emerald-100/70"
                  >
                    No tienes compras de créditos registradas todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
