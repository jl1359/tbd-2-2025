import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import hoja from "../assets/hoja.png";

export default function HistorialCompras() {
  const [compras, setCompras] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarCompras();
  }, []);

  async function cargarCompras() {
    try {
      // ajusta la ruta si tu backend usa otro nombre
      const res = await api("/wallet/mis-compras-creditos");
      setCompras(res);
    } catch (err) {
      console.error("Error cargando compras:", err);
    } finally {
      setCargando(false);
    }
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#082b1f] text-white flex items-center justify-center">
        Cargando historial de compras...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#082b1f] text-white p-6 md:p-10">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-8">
        <img src={hoja} alt="logo" className="w-10 h-10 drop-shadow-lg" />
        <h1 className="text-3xl font-bold text-emerald-400">
          Historial de Compras de Créditos
        </h1>
      </div>

      {/* TABLA */}
      <div className="bg-[#0f3f2d] border border-emerald-600 rounded-xl shadow-lg p-4 md:p-6 overflow-x-auto">
        {compras.length === 0 ? (
          <p className="opacity-80">Todavía no tienes compras registradas.</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="border-b border-emerald-600 text-emerald-300">
              <tr>
                <th className="py-2 text-left">Fecha</th>
                <th className="py-2 text-left">Paquete</th>
                <th className="py-2 text-right">Créditos</th>
                <th className="py-2 text-right">Monto (Bs)</th>
                <th className="py-2 text-left">Estado</th>
              </tr>
            </thead>
            <tbody>
              {compras.map((c, idx) => (
                <tr
                  key={idx}
                  className="border-b border-emerald-800/60 last:border-0"
                >
                  <td className="py-2 pr-4">
                    {c.fecha_compra || c.fecha || "-"}
                  </td>
                  <td className="py-2 pr-4">
                    {c.paquete || c.nombre_paquete || "Paquete"}
                  </td>
                  <td className="py-2 pr-4 text-right">
                    {c.creditos || c.creditos_compra || "—"}
                  </td>
                  <td className="py-2 pr-4 text-right">
                    {(c.monto_bs ?? c.monto) || "—"}
                  </td>
                  <td className="py-2 pr-4">
                    <span className="px-3 py-1 rounded-full bg-emerald-700/40 border border-emerald-500 text-xs uppercase tracking-wide">
                      {c.estado || "DESCONOCIDO"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
