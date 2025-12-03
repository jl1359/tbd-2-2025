// src/pages/ReportesUsuarios.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  getReporteUsuariosActivos,
  getReporteUsuariosAbandonados,
  getReporteUsuariosNuevos,
} from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import hoja from "../assets/hoja.png";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    cargar();
  }

  // =========================
  // MÉTRICAS
  // =========================
  const metrics = useMemo(() => {
    const totalActivos = activos.length;
    const totalAbandonados = abandonados.length;
    const totalNuevos = nuevos.length;
    const totalUsuariosPeriodo =
      totalActivos + totalAbandonados + totalNuevos;

    const tasaRetencion =
      totalUsuariosPeriodo > 0
        ? (totalActivos / totalUsuariosPeriodo) * 100
        : 0;
    const tasaAbandono =
      totalUsuariosPeriodo > 0
        ? (totalAbandonados / totalUsuariosPeriodo) * 100
        : 0;

    return {
      totalActivos,
      totalAbandonados,
      totalNuevos,
      totalUsuariosPeriodo,
      tasaRetencion,
      tasaAbandono,
    };
  }, [activos, abandonados, nuevos]);

  const chartResumen = useMemo(
    () => [
      { tipo: "Activos", cantidad: metrics.totalActivos },
      { tipo: "Abandonados", cantidad: metrics.totalAbandonados },
      { tipo: "Nuevos", cantidad: metrics.totalNuevos },
    ],
    [metrics.totalActivos, metrics.totalAbandonados, metrics.totalNuevos]
  );

  return (
    <div
      className="min-h-screen p-8"
      style={{
        background: "linear-gradient(to bottom right, #f0fdf4, #d1fae5)",
        backgroundImage: `url(${hoja})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "top right",
        backgroundSize: "160px",
      }}
    >
      <div className="max-w-6xl mx-auto bg-emerald-900/90 rounded-2xl shadow-xl text-white p-6 md:p-8">
        <header className="mb-6 border-b border-emerald-500/40 pb-4">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-400/60">
              📊
            </span>
            Reporte de usuarios activos, abandonados y nuevos (primer login)
          </h1>
          <p className="mt-2 text-sm text-emerald-100/80">
            Analiza el comportamiento de los usuarios en un rango de fechas:
            quiénes se mantienen activos, quiénes abandonan y quiénes ingresan
            por primera vez a la plataforma.
          </p>
        </header>

        {/* Filtros */}
        <section className="mb-6 bg-emerald-800/80 rounded-xl p-4 border border-emerald-500/40">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col md:flex-row md:items-end gap-4"
          >
            <div className="flex-1">
              <label className="block text-xs font-semibold text-emerald-200 mb-1">
                Desde
              </label>
              <input
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                className="w-full rounded-lg bg-emerald-900/60 border border-emerald-500/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-emerald-200 mb-1">
                Hasta
              </label>
              <input
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
                className="w-full rounded-lg bg-emerald-900/60 border border-emerald-500/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-sm font-semibold shadow-md transition-colors"
            >
              Actualizar reporte
            </button>
          </form>

          {error && (
            <p className="mt-3 text-xs text-red-300 bg-red-900/30 border border-red-400/60 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          {loading && (
            <p className="mt-3 text-xs text-emerald-100/80">
              Cargando datos...
            </p>
          )}
        </section>

        {/* Tarjetas de métricas */}
        <section className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white shadow-md border border-emerald-200/60 rounded-xl p-4">
            <p className="text-xs font-semibold text-emerald-700 uppercase">
              Usuarios activos
            </p>
            <p className="mt-2 text-3xl font-extrabold text-emerald-900">
              {metrics.totalActivos}
            </p>
            <p className="text-[11px] text-emerald-700/80 mt-1">
              Usuarios con actividad reciente en el período.
            </p>
          </div>

          <div className="bg-white shadow-md border border-emerald-200/60 rounded-xl p-4">
            <p className="text-xs font-semibold text-emerald-700 uppercase">
              Usuarios abandonados
            </p>
            <p className="mt-2 text-3xl font-extrabold text-emerald-900">
              {metrics.totalAbandonados}
            </p>
            <p className="text-[11px] text-emerald-700/80 mt-1">
              Usuarios que dejaron de usar la plataforma en el período.
            </p>
          </div>

          <div className="bg-white shadow-md border border-emerald-200/60 rounded-xl p-4">
            <p className="text-xs font-semibold text-emerald-700 uppercase">
              Nuevos usuarios
            </p>
            <p className="mt-2 text-3xl font-extrabold text-emerald-900">
              {metrics.totalNuevos}
            </p>
            <p className="text-[11px] text-emerald-700/80 mt-1">
              Usuarios cuyo primer login está dentro del rango.
            </p>
          </div>

          <div className="bg-white shadow-md border border-emerald-200/60 rounded-xl p-4">
            <p className="text-xs font-semibold text-emerald-700 uppercase">
              Tasa de retención
            </p>
            <p className="mt-2 text-3xl font-extrabold text-emerald-900">
              {metrics.tasaRetencion.toFixed(1)}%
            </p>
            <p className="text-[11px] text-emerald-700/80 mt-1">
              Abandono: {metrics.tasaAbandono.toFixed(1)}%
            </p>
          </div>
        </section>

        {/* Gráfico resumen */}
        <section className="grid lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl border border-emerald-200/40 shadow p-4">
            <h2 className="text-lg font-semibold text-emerald-900 mb-2">
              Distribución de usuarios por tipo
            </h2>
            <p className="text-xs text-emerald-700/80 mb-3">
              Comparación entre usuarios activos, abandonados y nuevos.
            </p>
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={chartResumen}>
                  <XAxis dataKey="tipo" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="cantidad"
                    name="Usuarios"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-emerald-200/40 shadow p-4 flex flex-col justify-center">
            <h2 className="text-lg font-semibold text-emerald-900 mb-2">
              Resumen del periodo
            </h2>
            <ul className="text-sm text-emerald-900 space-y-1">
              <li>
                <span className="font-semibold">
                  Total usuarios en análisis:{" "}
                </span>
                {metrics.totalUsuariosPeriodo}
              </li>
              <li>
                <span className="font-semibold">Activos: </span>
                {metrics.totalActivos}
              </li>
              <li>
                <span className="font-semibold">Abandonados: </span>
                {metrics.totalAbandonados}
              </li>
              <li>
                <span className="font-semibold">Nuevos: </span>
                {metrics.totalNuevos}
              </li>
              <li>
                <span className="font-semibold">Tasa de retención: </span>
                {metrics.tasaRetencion.toFixed(1)}%
              </li>
              <li>
                <span className="font-semibold">Tasa de abandono: </span>
                {metrics.tasaAbandono.toFixed(1)}%
              </li>
            </ul>
          </div>
        </section>

        {/* Usuarios activos */}
        <section className="space-y-2 bg-white border border-emerald-200/40 rounded-xl shadow mb-6">
          <div className="px-4 py-3 border-b bg-emerald-50 rounded-t-xl">
            <h2 className="font-semibold text-emerald-900">
              Usuarios activos ({activos.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-100">
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
                    <td className="px-2 py-1 text-right">
                      {u.total_acciones}
                    </td>
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
        <section className="space-y-2 bg-white border border-emerald-200/40 rounded-xl shadow mb-6">
          <div className="px-4 py-3 border-b bg-emerald-50 rounded-t-xl">
            <h2 className="font-semibold text-emerald-900">
              Usuarios abandonados ({abandonados.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-2 py-1 text-left">Usuario</th>
                  <th className="px-2 py-1 text-left">Correo</th>
                  <th className="px-2 py-1 text-right">Última actividad</th>
                </tr>
              </thead>
              <tbody>
                {abandonados.map((u, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-2 py-1">{u.nombre}</td>
                    <td className="px-2 py-1">{u.correo}</td>
                    <td className="px-2 py-1 text-right">
                      {u.ultima_actividad || "-"}
                    </td>
                  </tr>
                ))}
                {abandonados.length === 0 && (
                  <tr>
                    <td
                      className="px-2 py-2 text-center text-gray-400"
                      colSpan={3}
                    >
                      Sin usuarios abandonados en el rango.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Usuarios nuevos */}
        <section className="space-y-2 bg-white border border-emerald-200/40 rounded-xl shadow">
          <div className="px-4 py-3 border-b bg-emerald-50 rounded-t-xl">
            <h2 className="font-semibold text-emerald-900">
              Usuarios nuevos (primer login) ({nuevos.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-100">
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
                      {u.fecha_primer_login || "-"}
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
    </div>
  );
}
