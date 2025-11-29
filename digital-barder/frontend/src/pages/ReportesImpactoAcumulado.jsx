import React, { useState } from "react";
import { getReporteImpactoAcumulado } from "../services/api";

export default function ReportesImpactoAcumulado() {
  const [tipoReporte, setTipoReporte] = useState("1"); // 1=Mensual
  const [idPeriodo, setIdPeriodo] = useState("1");
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function cargar() {
    try {
      setLoading(true);
      setError("");
      const res = await getReporteImpactoAcumulado({
        idTipoReporte: tipoReporte,
        idPeriodo,
      });
      setDatos(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error(e);
      setError("Error cargando impacto acumulado");
      setDatos([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 space-y-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Impacto ambiental acumulado</h1>
          <p className="text-sm text-gray-500">
            Datos provenientes de la tabla REPORTE_IMPACTO (por período).
          </p>
        </div>

        <div className="flex flex-wrap gap-2 items-end text-sm">
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Tipo de reporte</label>
            <select
              value={tipoReporte}
              onChange={(e) => setTipoReporte(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="1">Mensual</option>
              <option value="2">Diario</option>
              <option value="3">Anual</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium">ID período</label>
            <input
              type="number"
              min="1"
              value={idPeriodo}
              onChange={(e) => setIdPeriodo(e.target.value)}
              className="border rounded px-2 py-1 text-sm w-24"
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
                <th className="px-2 py-1 text-right">Usuarios activos</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="px-2 py-1">{r.id_usuario ?? "GLOBAL"}</td>
                  <td className="px-2 py-1 text-right">
                    {r.total_co2_ahorrado}
                  </td>
                  <td className="px-2 py-1 text-right">
                    {r.total_agua_ahorrada}
                  </td>
                  <td className="px-2 py-1 text-right">
                    {r.total_energia_ahorrada}
                  </td>
                  <td className="px-2 py-1 text-right">
                    {r.total_transacciones}
                  </td>
                  <td className="px-2 py-1 text-right">
                    {r.total_usuarios_activos}
                  </td>
                </tr>
              ))}
              {datos.length === 0 && (
                <tr>
                  <td
                    className="px-2 py-2 text-center text-gray-400"
                    colSpan={6}
                  >
                    Sin datos en REPORTE_IMPACTO para ese período.
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
