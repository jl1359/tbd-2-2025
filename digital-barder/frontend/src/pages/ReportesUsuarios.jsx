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
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Activity,
} from "lucide-react";

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

  const hasData =
    metrics.totalActivos +
      metrics.totalAbandonados +
      metrics.totalNuevos >
    0;

  return (
    <div
      className="min-h-screen p-6 md:p-8"
      style={{
        background:
          "radial-gradient(circle at top left, #bbf7d0 0, #ecfdf5 40%, #ffffff 100%)",
        backgroundImage: `url(${hoja})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "top right",
        backgroundSize: "160px",
      }}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/80 shadow-md flex items-center justify-center border border-emerald-700/15">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200">
                📊
              </span>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-emerald-900 tracking-tight drop-shadow-sm">
                Reporte de usuarios activos, abandonados y nuevos
              </h1>
              <p className="mt-1 text-sm md:text-base text-emerald-800/80 max-w-2xl">
                Analiza el comportamiento de los usuarios en un rango de fechas:
                quiénes se mantienen activos, quiénes abandonan y quiénes
                ingresan por primera vez a la plataforma.
              </p>
              <div className="mt-2 inline-flex flex-wrap items-center gap-2 text-xs text-emerald-900/80">
                <span className="inline-flex items-center gap-1 bg-white/80 px-2.5 py-1 rounded-full shadow-sm border border-emerald-200/60">
                  <Activity className="w-3 h-3" />
                  Rango analizado:{" "}
                  <span className="font-semibold">
                    {desde} &nbsp;–&nbsp; {hasta}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200 text-emerald-900">
                  <Users className="w-3 h-3" />
                  Total en análisis:{" "}
                  <span className="font-semibold">
                    {metrics.totalUsuariosPeriodo}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* FILTROS */}
          <section className="bg-white/85 backdrop-blur rounded-2xl shadow-lg border border-emerald-100 px-4 py-3 flex flex-col gap-3 min-w-[260px]">
            <p className="text-xs font-semibold text-emerald-900 tracking-wide">
              Filtros de fecha
            </p>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-3 text-sm"
            >
              <div className="flex flex-wrap gap-3">
                <div className="flex flex-col flex-1 min-w-[120px]">
                  <label className="block text-xs font-semibold text-emerald-900 mb-1">
                    Desde
                  </label>
                  <input
                    type="date"
                    value={desde}
                    onChange={(e) => setDesde(e.target.value)}
                    className="w-full rounded-lg bg-white border border-emerald-200 px-2 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500"
                  />
                </div>
                <div className="flex flex-col flex-1 min-w-[120px]">
                  <label className="block text-xs font-semibold text-emerald-900 mb-1">
                    Hasta
                  </label>
                  <input
                    type="date"
                    value={hasta}
                    onChange={(e) => setHasta(e.target.value)}
                    className="w-full rounded-lg bg-white border border-emerald-200 px-2 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold shadow-md transition
                ${
                  loading
                    ? "bg-emerald-300 text-emerald-900 cursor-wait"
                    : "bg-emerald-700 hover:bg-emerald-800 text-white"
                }`}
              >
                {loading ? "Cargando…" : "Actualizar reporte"}
              </button>
            </form>

            {error && (
              <p className="mt-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            {loading && !error && (
              <p className="mt-1 text-[11px] text-emerald-700/80 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Cargando datos de usuarios…
              </p>
            )}
          </section>
        </header>

        {/* MENSAJE SIN DATOS */}
        {!loading && !error && !hasData && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm px-4 py-3 rounded-xl shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            No se encontraron usuarios para el rango seleccionado. Prueba con
            otras fechas o revisa la actividad registrada.
          </div>
        )}

        {/* Tarjetas de métricas */}
        <section className="grid md:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white shadow-md border border-emerald-100 rounded-2xl p-4 flex flex-col justify-between hover:shadow-lg transition">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide">
                  Usuarios activos
                </p>
                <p className="mt-2 text-3xl font-extrabold text-emerald-900 tabular-nums">
                  {metrics.totalActivos}
                </p>
              </div>
              <span className="inline-flex items-center justify-center rounded-full bg-emerald-50 p-2">
                <UserCheck className="w-5 h-5 text-emerald-700" />
              </span>
            </div>
            <p className="mt-2 text-[11px] text-emerald-700/80">
              Usuarios con actividad reciente en el período.
            </p>
          </div>

          <div className="bg-white shadow-md border border-rose-100 rounded-2xl p-4 flex flex-col justify-between hover:shadow-lg transition">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold text-rose-700 uppercase tracking-wide">
                  Usuarios abandonados
                </p>
                <p className="mt-2 text-3xl font-extrabold text-rose-900 tabular-nums">
                  {metrics.totalAbandonados}
                </p>
              </div>
              <span className="inline-flex items-center justify-center rounded-full bg-rose-50 p-2">
                <UserX className="w-5 h-5 text-rose-700" />
              </span>
            </div>
            <p className="mt-2 text-[11px] text-rose-800/80">
              Usuarios que dejaron de usar la plataforma en el período.
            </p>
          </div>

          <div className="bg-white shadow-md border border-sky-100 rounded-2xl p-4 flex flex-col justify-between hover:shadow-lg transition">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold text-sky-700 uppercase tracking-wide">
                  Nuevos usuarios
                </p>
                <p className="mt-2 text-3xl font-extrabold text-sky-900 tabular-nums">
                  {metrics.totalNuevos}
                </p>
              </div>
              <span className="inline-flex items-center justify-center rounded-full bg-sky-50 p-2">
                <UserPlus className="w-5 h-5 text-sky-700" />
              </span>
            </div>
            <p className="mt-2 text-[11px] text-sky-800/80">
              Usuarios cuyo primer login está dentro del rango.
            </p>
          </div>

          <div className="bg-white shadow-md border border-emerald-100 rounded-2xl p-4 flex flex-col justify-between hover:shadow-lg transition">
            <div>
              <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide">
                Tasa de retención
              </p>
              <p className="mt-2 text-3xl font-extrabold text-emerald-900 tabular-nums">
                {metrics.tasaRetencion.toFixed(1)}%
              </p>
              <p className="mt-1 text-[11px] text-emerald-700/80">
                Abandono: {metrics.tasaAbandono.toFixed(1)}%
              </p>
            </div>
            <div className="mt-2 h-2 w-full bg-emerald-50 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500"
                style={{
                  width: `${Math.min(metrics.tasaRetencion, 100)}%`,
                }}
              />
            </div>
            <p className="mt-1 text-[11px] text-emerald-700/80">
              Proporción de usuarios que se mantienen activos.
            </p>
          </div>
        </section>

        {/* Gráfico resumen + resumen textual */}
        <section className="grid lg:grid-cols-2 gap-6 mb-2">
          <div className="bg-white rounded-2xl border border-emerald-100 shadow-md p-4 md:p-5">
            <h2 className="text-base md:text-lg font-semibold text-emerald-900 mb-2">
              Distribución de usuarios por tipo
            </h2>
            <p className="text-xs text-emerald-700/80 mb-3">
              Comparación entre usuarios activos, abandonados y nuevos.
            </p>
            <div className="h-72">
              {hasData ? (
                <ResponsiveContainer>
                  <BarChart data={chartResumen}>
                    <XAxis
                      dataKey="tipo"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={{ stroke: "#e5e7eb" }}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar
                      dataKey="cantidad"
                      name="Usuarios"
                      radius={[8, 8, 0, 0]}
                      fill="#047857"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">
                  Sin datos para mostrar el gráfico.
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-emerald-100 shadow-md p-4 md:p-5 flex flex-col justify-center">
            <h2 className="text-base md:text-lg font-semibold text-emerald-900 mb-3">
              Resumen del periodo
            </h2>
            <ul className="text-sm text-emerald-900 space-y-1.5">
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
        <section className="space-y-2 bg-white border border-emerald-100 rounded-2xl shadow-md">
          <div className="px-4 py-3 border-b bg-emerald-50 rounded-t-2xl flex items-center justify-between">
            <h2 className="font-semibold text-emerald-900 text-sm md:text-base">
              Usuarios activos ({activos.length})
            </h2>
          </div>
          <div className="overflow-x-auto max-h-[320px]">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 sticky top-0 z-10">
                <tr>
                  <th className="px-2 py-1 text-left font-semibold text-slate-600">
                    Usuario
                  </th>
                  <th className="px-2 py-1 text-left font-semibold text-slate-600">
                    Correo
                  </th>
                  <th className="px-2 py-1 text-right font-semibold text-slate-600">
                    Primera actividad
                  </th>
                  <th className="px-2 py-1 text-right font-semibold text-slate-600">
                    Última actividad
                  </th>
                  <th className="px-2 py-1 text-right font-semibold text-slate-600">
                    Total acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {activos.map((u, i) => (
                  <tr
                    key={i}
                    className={i % 2 === 0 ? "bg-white" : "bg-slate-50/70"}
                  >
                    <td className="px-2 py-1 text-slate-800">
                      {u.nombre}
                    </td>
                    <td className="px-2 py-1 text-slate-800">
                      {u.correo}
                    </td>
                    <td className="px-2 py-1 text-right tabular-nums">
                      {u.primera_actividad || "-"}
                    </td>
                    <td className="px-2 py-1 text-right tabular-nums">
                      {u.ultima_actividad || "-"}
                    </td>
                    <td className="px-2 py-1 text-right tabular-nums">
                      {u.total_acciones}
                    </td>
                  </tr>
                ))}
                {activos.length === 0 && (
                  <tr>
                    <td
                      className="px-2 py-3 text-center text-gray-400"
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
        <section className="space-y-2 bg-white border border-emerald-100 rounded-2xl shadow-md">
          <div className="px-4 py-3 border-b bg-emerald-50 rounded-t-2xl flex items-center justify-between">
            <h2 className="font-semibold text-emerald-900 text-sm md:text-base">
              Usuarios abandonados ({abandonados.length})
            </h2>
          </div>
          <div className="overflow-x-auto max-h-[320px]">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 sticky top-0 z-10">
                <tr>
                  <th className="px-2 py-1 text-left font-semibold text-slate-600">
                    Usuario
                  </th>
                  <th className="px-2 py-1 text-left font-semibold text-slate-600">
                    Correo
                  </th>
                  <th className="px-2 py-1 text-right font-semibold text-slate-600">
                    Última actividad
                  </th>
                </tr>
              </thead>
              <tbody>
                {abandonados.map((u, i) => (
                  <tr
                    key={i}
                    className={i % 2 === 0 ? "bg-white" : "bg-slate-50/70"}
                  >
                    <td className="px-2 py-1 text-slate-800">
                      {u.nombre}
                    </td>
                    <td className="px-2 py-1 text-slate-800">
                      {u.correo}
                    </td>
                    <td className="px-2 py-1 text-right tabular-nums">
                      {u.ultima_actividad || "-"}
                    </td>
                  </tr>
                ))}
                {abandonados.length === 0 && (
                  <tr>
                    <td
                      className="px-2 py-3 text-center text-gray-400"
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
        <section className="space-y-2 bg-white border border-emerald-100 rounded-2xl shadow-md mb-4">
          <div className="px-4 py-3 border-b bg-emerald-50 rounded-t-2xl flex items-center justify-between">
            <h2 className="font-semibold text-emerald-900 text-sm md:text-base">
              Usuarios nuevos (primer login) ({nuevos.length})
            </h2>
          </div>
          <div className="overflow-x-auto max-h-[320px]">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 sticky top-0 z-10">
                <tr>
                  <th className="px-2 py-1 text-left font-semibold text-slate-600">
                    Usuario
                  </th>
                  <th className="px-2 py-1 text-left font-semibold text-slate-600">
                    Correo
                  </th>
                  <th className="px-2 py-1 text-right font-semibold text-slate-600">
                    Fecha primer login
                  </th>
                </tr>
              </thead>
              <tbody>
                {nuevos.map((u, i) => (
                  <tr
                    key={i}
                    className={i % 2 === 0 ? "bg-white" : "bg-slate-50/70"}
                  >
                    <td className="px-2 py-1 text-slate-800">
                      {u.nombre}
                    </td>
                    <td className="px-2 py-1 text-slate-800">
                      {u.correo}
                    </td>
                    <td className="px-2 py-1 text-right tabular-nums">
                      {u.fecha_primer_login || "-"}
                    </td>
                  </tr>
                ))}
                {nuevos.length === 0 && (
                  <tr>
                    <td
                      className="px-2 py-3 text-center text-gray-400"
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
