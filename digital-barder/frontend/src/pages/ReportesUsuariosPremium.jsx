import React, { useEffect, useState } from "react";
import { getReporteUsuariosPremium } from "../services/api";

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function hace30DiasISO() {
  const d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

export default function ReportesUsuariosPremium() {
  const [desde, setDesde] = useState(hace30DiasISO());
  const [hasta, setHasta] = useState(hoyISO());
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function cargar() {
    try {
      setLoading(true);
      setError("");
      const res = await getReporteUsuariosPremium({ desde, hasta });
      setDatos(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error(e);
      setError("Error cargando reporte de usuarios premium");
      setDatos([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    cargar();
  }

  return (
    <div className="p-4 space-y-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Usuarios premium</h1>
          <p className="text-sm text-gray-500">
            Adopción del plan premium e ingresos por suscripción.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-wrap gap-2 items-end"
        >
          <div className="flex flex-col text-sm">
            <label className="mb-1 font-medium">Desde</label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
          <div className="flex flex-col text-sm">
            <label className="mb-1 font-medium">Hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
          <button
            type="submit"
            className="bg-emerald-600 text-white px-3 py-1.5 rounded text-sm"
          >
            {loading ? "Cargando…" : "Actualizar"}
          </button>
        </form>
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
                <th className="px-2 py-1 text-left">Desde</th>
                <th className="px-2 py-1 text-left">Hasta</th>
                <th className="px-2 py-1 text-right">Usuarios activos</th>
                <th className="px-2 py-1 text-right">Nuevos premium</th>
                <th className="px-2 py-1 text-right">Premium activos</th>
                <th className="px-2 py-1 text-right">Ingresos (Bs)</th>
                <th className="px-2 py-1 text-right">% adopción</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="px-2 py-1">{r.desde}</td>
                  <td className="px-2 py-1">{r.hasta}</td>
                  <td className="px-2 py-1 text-right">
                    {r.total_usuarios_activos}
                  </td>
                  <td className="px-2 py-1 text-right">
                    {r.usuarios_nuevos_premium}
                  </td>
                  <td className="px-2 py-1 text-right">
                    {r.usuarios_premium_activos}
                  </td>
                  <td className="px-2 py-1 text-right">
                    {r.ingresos_suscripcion_bs}
                  </td>
                  <td className="px-2 py-1 text-right">
                    {r.porcentaje_adopcion_premium}%
                  </td>
                </tr>
              ))}
              {datos.length === 0 && (
                <tr>
                  <td
                    className="px-2 py-2 text-center text-gray-400"
                    colSpan={7}
                  >
                    Sin datos de suscripciones premium en el rango.
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
