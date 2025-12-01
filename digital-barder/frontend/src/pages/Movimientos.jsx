import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import hoja from "../assets/hoja.png";

export default function Movimientos() {
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarMovimientos();
  }, []);

  async function cargarMovimientos() {
    try {
      const res = await api("/wallet/mis-movimientos");
      setMovimientos(res);
    } catch (err) {
      console.error("Error cargando movimientos:", err);
    } finally {
      setCargando(false);
    }
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#082b1f] text-white flex items-center justify-center">
        Cargando movimientos...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#082b1f] text-white p-6 md:p-10">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-8">
        <img src={hoja} alt="logo" className="w-10 h-10 drop-shadow-lg" />
        <h1 className="text-3xl font-bold text-emerald-400">
          Movimientos de Wallet
        </h1>
      </div>

      {/* TABLA */}
      <div className="bg-[#0f3f2d] border border-emerald-600 rounded-xl shadow-lg p-4 md:p-6 overflow-x-auto">
        {movimientos.length === 0 ? (
          <p className="opacity-80">Todavía no tienes movimientos.</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="border-b border-emerald-600 text-emerald-300">
              <tr>
                <th className="py-2 text-left">Fecha</th>
                <th className="py-2 text-left">Tipo</th>
                <th className="py-2 text-left">Descripción</th>
                <th className="py-2 text-right">Créditos</th>
                <th className="py-2 text-right">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((m, idx) => (
                <tr
                  key={idx}
                  className="border-b border-emerald-800/60 last:border-0"
                >
                  <td className="py-2 pr-4">
                    {m.fecha || m.fecha_movimiento || "-"}
                  </td>
                  <td className="py-2 pr-4">
                    {m.tipo_movimiento || m.tipo || "Movimiento"}
                  </td>
                  <td className="py-2 pr-4">
                    {m.descripcion || "—"}
                  </td>
                  <td
                    className={`py-2 pr-4 text-right font-semibold ${
                      m.creditos >= 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {m.creditos >= 0 ? "+" : ""}
                    {m.creditos} cr
                  </td>
                  <td className="py-2 pl-4 text-right">
                    {m.saldo_resultante ?? m.saldo ?? "—"}
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
