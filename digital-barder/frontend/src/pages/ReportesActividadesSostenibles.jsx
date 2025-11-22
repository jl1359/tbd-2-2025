import React, { useEffect, useState } from "react";
import { getReporteActividadesSostenibles } from "../services/api";

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function hace30DiasISO() {
  const d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

export default function ReportesActividadesSostenibles() {
  const [desde, setDesde] = useState(hace30DiasISO());
  const [hasta, setHasta] = useState(hoyISO());
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function cargar() {
    try {
      setLoading(true);
      setError("");
      const res = await getReporteActividadesSostenibles({ desde, hasta });
      setDatos(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error(e);
      setError("Error cargando actividades sostenibles");
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
          <h1 className="text-2xl font-bold">
            Actividades sostenibles por usuario
          </h1>
          <p className="text-sm text-gray-500">
            Cantidad de actividades y créditos otorgados en el rango.
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
                <th className="px-2 py-1 text-left">Usuario</th>
                <th className="px-2 py-1 text-left">Correo</th>
                <th className="px-2 py-1 text-right">Total actividades</th>
                <th className="px-2 py-1 text-right">Créditos otorgados</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((a, i) => (
                <tr key={i} className="border-t">
                  <td className="px-2 py-1">{a.nombre}</td>
                  <td className="px-2 py-1">{a.correo}</td>
                  <td className="px-2 py-1 text-right">
                    {a.total_actividades}
                  </td>
                  <td className="px-2 py-1 text-right">
                    {a.creditos_otorgados}
                  </td>
                </tr>
              ))}
              {datos.length === 0 && (
                <tr>
                  <td
                    className="px-2 py-2 text-center text-gray-400"
                    colSpan={4}
                  >
                    Sin actividades sostenibles en el rango.
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
