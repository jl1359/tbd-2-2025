import React, { useState } from "react";
import { getReporteRankingUsuarios } from "../services/api";

export default function ReportesRankingUsuarios() {
  const [idPeriodo, setIdPeriodo] = useState("");
  const [limit, setLimit] = useState(10);
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function cargar() {
    try {
      setLoading(true);
      setError("");
      const res = await getReporteRankingUsuarios({ idPeriodo, limit });
      setDatos(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error(e);
      setError("Error cargando ranking de usuarios");
      setDatos([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 space-y-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Ranking de usuarios por impacto</h1>
          <p className="text-sm text-gray-500">
            Usuarios ordenados por impacto ambiental (CO₂, agua, energía).
          </p>
        </div>

        <div className="flex flex-wrap gap-2 items-end text-sm">
          <div className="flex flex-col">
            <label className="mb-1 font-medium">ID período (opcional)</label>
            <input
              type="number"
              min="1"
              value={idPeriodo}
              onChange={(e) => setIdPeriodo(e.target.value)}
              className="border rounded px-2 py-1 text-sm w-24"
              placeholder="ej. 1"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Top N</label>
            <input
              type="number"
              min="1"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="border rounded px-2 py-1 text-sm w-20"
            />
          </div>
          <button
            type="button"
            onClick={cargar}
            className="bg-emerald-600 text-white px-3 py-1.5 rounded text-sm"
          >
            {loading ? "Cargando…" : "Actualizar"}
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border-red-200 border text-red-700 text-sm px-3 py-2 rounded">
          {error}
        </div>
      )}

      <section>
        <div className="overflow-x-auto border rounded bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 py-1 text-left">Usuario (ID)</th>
                <th className="px-2 py-1 text-right">CO₂ total (kg)</th>
                <th className="px-2 py-1 text-right">Agua total (L)</th>
                <th className="px-2 py-1 text-right">Energía total (kWh)</th>
                <th className="px-2 py-1 text-right">Transacciones</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="px-2 py-1">{r.id_usuario}</td>
                  <td className="px-2 py-1 text-right">{r.co2_total}</td>
                  <td className="px-2 py-1 text-right">{r.agua_total}</td>
                  <td className="px-2 py-1 text-right">{r.energia_total}</td>
                  <td className="px-2 py-1 text-right">{r.transacciones}</td>
                </tr>
              ))}
              {datos.length === 0 && (
                <tr>
                  <td
                    className="px-2 py-2 text-center text-gray-400"
                    colSpan={5}
                  >
                    Sin datos de ranking para los filtros actuales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
