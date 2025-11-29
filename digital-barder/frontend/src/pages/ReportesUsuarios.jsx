import React, { useEffect, useState } from "react";
import {
  getReporteUsuariosActivos,
  getReporteUsuariosAbandonados,
  getReporteUsuariosNuevos,
} from "../services/api";

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function hace30DiasISO() {
  const d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

export default function ReportesUsuarios() {
  const [desde, setDesde] = useState(hace30DiasISO());
  const [hasta, setHasta] = useState(hoyISO());

  const [activos, setActivos] = useState([]);
  const [abandonados, setAbandonados] = useState([]);
  const [nuevos, setNuevos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function cargar() {
    try {
      setLoading(true);
      setError("");
      const [a, b, n] = await Promise.all([
        getReporteUsuariosActivos({ desde, hasta }),
        getReporteUsuariosAbandonados({ desde, hasta }),
        getReporteUsuariosNuevos({ desde, hasta }),
      ]);
      setActivos(Array.isArray(a) ? a : []);
      setAbandonados(Array.isArray(b) ? b : []);
      setNuevos(Array.isArray(n) ? n : []);
    } catch (e) {
      console.error(e);
      setError("Error cargando reportes de usuarios");
      setActivos([]);
      setAbandonados([]);
      setNuevos([]);
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
          <h1 className="text-2xl font-bold">Reporte de usuarios</h1>
          <p className="text-sm text-gray-500">
            Usuarios activos, abandonados y nuevos (primer login).
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
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded">
          {error}
        </div>
      )}

      {/* Usuarios activos */}
      <section className="space-y-2">
        <h2 className="font-semibold">Usuarios activos ({activos.length})</h2>
        <div className="overflow-x-auto border rounded bg-white">
          <table className="min-w-full text-xs">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 py-1 text-left">Usuario</th>
                <th className="px-2 py-1 text-left">Correo</th>
                <th className="px-2 py-1 text-right">Primera actividad</th>
                <th className="px-2 py-1 text-right">Última actividad</th>
                <th className="px-2 py-1 text-right">Total acciones</th>
              </tr>
            </thead>
            <tbody>
              {activos.map((u, i) => (
                <tr key={i} className="border-t">
                  <td className="px-2 py-1">{u.nombre}</td>
                  <td className="px-2 py-1">{u.correo}</td>
                  <td className="px-2 py-1 text-right">
                    {u.primera_actividad || "-"}
                  </td>
                  <td className="px-2 py-1 text-right">
                    {u.ultima_actividad || "-"}
                  </td>
                  <td className="px-2 py-1 text-right">{u.total_acciones}</td>
                </tr>
              ))}
              {activos.length === 0 && (
                <tr>
                  <td
                    className="px-2 py-2 text-center text-gray-400"
                    colSpan={5}
                  >
                    Sin datos en el rango.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Usuarios abandonados */}
      <section className="space-y-2">
        <h2 className="font-semibold">
          Usuarios abandonados ({abandonados.length})
        </h2>
        <div className="overflow-x-auto border rounded bg-white">
          <table className="min-w-full text-xs">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 py-1 text-left">Usuario</th>
                <th className="px-2 py-1 text-left">Correo</th>
                <th className="px-2 py-1 text-right">Estado</th>
              </tr>
            </thead>
            <tbody>
              {abandonados.map((u, i) => (
                <tr key={i} className="border-t">
                  <td className="px-2 py-1">{u.nombre}</td>
                  <td className="px-2 py-1">{u.correo}</td>
                  <td className="px-2 py-1 text-right">{u.estado}</td>
                </tr>
              ))}
              {abandonados.length === 0 && (
                <tr>
                  <td
                    className="px-2 py-2 text-center text-gray-400"
                    colSpan={3}
                  >
                    Sin datos en el rango.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Usuarios nuevos (primer login) */}
      <section className="space-y-2">
        <h2 className="font-semibold">
          Usuarios nuevos (primer login) ({nuevos.length})
        </h2>
        <div className="overflow-x-auto border rounded bg-white">
          <table className="min-w-full text-xs">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 py-1 text-left">Usuario</th>
                <th className="px-2 py-1 text-left">Correo</th>
                <th className="px-2 py-1 text-right">Fecha primer login</th>
              </tr>
            </thead>
            <tbody>
              {nuevos.map((u, i) => (
                <tr key={i} className="border-t">
                  <td className="px-2 py-1">{u.nombre}</td>
                  <td className="px-2 py-1">{u.correo}</td>
                  <td className="px-2 py-1 text-right">
                    {u.fecha_primer_login}
                  </td>
                </tr>
              ))}
              {nuevos.length === 0 && (
                <tr>
                  <td
                    className="px-2 py-2 text-center text-gray-400"
                    colSpan={3}
                  >
                    Sin usuarios nuevos en el rango.
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
