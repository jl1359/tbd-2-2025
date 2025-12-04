// src/pages/ReportesIntercambiosCategoria.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getReporteIntercambiosCategoria } from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Legend,
  Cell,
} from "recharts";
import hoja from "../assets/hoja.png";
import {
  ArrowLeftRight,
  Layers,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function hace30DiasISO() {
  const d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

export default function ReportesIntercambiosCategoria() {
  const [desde, setDesde] = useState(hace30DiasISO());
  const [hasta, setHasta] = useState(hoyISO());
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function cargar() {
    try {
      setLoading(true);
      setError("");
      const res = await getReporteIntercambiosCategoria({ desde, hasta });
      setDatos(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error(e);
      setError("Error cargando intercambios por categoría");
      setDatos([]);
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
    if (!datos.length) {
      return {
        totalIntercambios: 0,
        categorias: 0,
        promedioPorCategoria: 0,
        topCategoria: null,
      };
    }

    const totalIntercambios = datos.reduce(
      (acc, c) => acc + Number(c.total_intercambios || 0),
      0
    );
    const categorias = datos.length;
    const promedioPorCategoria =
      categorias > 0 ? totalIntercambios / categorias : 0;

    const topCategoria = datos.reduce(
      (best, c) =>
        Number(c.total_intercambios || 0) >
        Number(best?.total_intercambios || 0)
          ? c
          : best,
      null
    );

    return { totalIntercambios, categorias, promedioPorCategoria, topCategoria };
  }, [datos]);

  // =========================
  // DATOS GRÁFICOS
  // =========================
  const barData = useMemo(
    () =>
      datos.map((c) => ({
        categoria: c.categoria,
        intercambios: Number(c.total_intercambios || 0),
      })),
    [datos]
  );

  const pieData = useMemo(
    () =>
      datos.map((c) => ({
        name: c.categoria,
        value: Number(c.total_intercambios || 0),
      })),
    [datos]
  );

  const COLORS = ["#047857", "#1e3a8a", "#0d9488", "#6d28d9", "#f59e0b"];
  const hasData = datos.length > 0;

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
              <img src={hoja} alt="Hoja" className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-emerald-900 tracking-tight drop-shadow-sm">
                Intercambios por categoría
              </h1>
              <p className="mt-1 text-sm md:text-base text-emerald-800/80 max-w-xl">
                Análisis del número de intercambios agrupados por categoría de
                publicación en el rango de fechas seleccionado.
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-emerald-900/80">
                <span className="inline-flex items-center gap-1 bg-white/80 px-2.5 py-1 rounded-full shadow-sm border border-emerald-200/60">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Rango:{" "}
                  <span className="font-semibold">
                    {desde} &nbsp;–&nbsp; {hasta}
                  </span>
                </span>
                {hasData && metrics.topCategoria && (
                  <span className="inline-flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-full border border-amber-200 text-amber-900">
                    ⭐ Categoría más activa:{" "}
                    <span className="font-semibold">
                      {metrics.topCategoria.categoria}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Filtros */}
          <form
            onSubmit={handleSubmit}
            className="bg-white/85 backdrop-blur rounded-2xl shadow-lg border border-emerald-100 px-4 py-3 flex flex-col gap-3 min-w-[260px]"
          >
            <p className="text-xs font-semibold text-emerald-900 tracking-wide">
              Filtros
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="flex flex-col flex-1 min-w-[120px]">
                <label className="mb-1 text-xs font-semibold text-emerald-900">
                  Desde
                </label>
                <input
                  type="date"
                  value={desde}
                  onChange={(e) => setDesde(e.target.value)}
                  className="border border-emerald-200 rounded-lg px-2 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500"
                />
              </div>
              <div className="flex flex-col flex-1 min-w-[120px]">
                <label className="mb-1 text-xs font-semibold text-emerald-900">
                  Hasta
                </label>
                <input
                  type="date"
                  value={hasta}
                  onChange={(e) => setHasta(e.target.value)}
                  className="border border-emerald-200 rounded-lg px-2 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`mt-1 px-4 py-2 rounded-xl text-sm font-semibold shadow-md flex items-center gap-2 transition
              ${
                loading
                  ? "bg-emerald-300 text-emerald-900 cursor-wait"
                  : "bg-emerald-700 hover:bg-emerald-800 text-white"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              {loading ? "Cargando…" : "Actualizar"}
            </button>
            {loading && (
              <p className="text-[11px] text-emerald-700/80 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Calculando intercambios para el rango…
              </p>
            )}
          </form>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl shadow-sm">
            {error}
          </div>
        )}

        {/* KPIs */}
        <section className="grid md:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white shadow-md border border-emerald-100 rounded-2xl p-4 flex flex-col justify-between hover:shadow-lg transition">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide">
                  Intercambios totales
                </p>
                <p className="mt-2 text-3xl font-extrabold text-emerald-900 tabular-nums">
                  {metrics.totalIntercambios.toLocaleString()}
                </p>
              </div>
              <span className="inline-flex items-center justify-center rounded-full bg-emerald-50 p-2">
                <ArrowLeftRight className="w-5 h-5 text-emerald-700" />
              </span>
            </div>
            <p className="mt-2 text-[11px] text-emerald-700/75">
              Total de intercambios realizados en el período.
            </p>
          </div>

          <div className="bg-white shadow-md border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:shadow-lg transition">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">
                  Categorías con actividad
                </p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900 tabular-nums">
                  {metrics.categorias}
                </p>
              </div>
              <span className="inline-flex items-center justify-center rounded-full bg-slate-50 p-2">
                <Layers className="w-5 h-5 text-slate-700" />
              </span>
            </div>
            <p className="mt-2 text-[11px] text-slate-700/75">
              Número de categorías que tuvieron al menos un intercambio.
            </p>
          </div>

          <div className="bg-white shadow-md border border-teal-200 rounded-2xl p-4 flex flex-col justify-between hover:shadow-lg transition">
            <div>
              <p className="text-[11px] font-semibold text-teal-700 uppercase tracking-wide">
                Promedio por categoría
              </p>
              <p className="mt-2 text-3xl font-extrabold text-teal-900 tabular-nums">
                {metrics.promedioPorCategoria.toFixed(1)}
              </p>
            </div>
            <p className="mt-2 text-[11px] text-teal-800/80">
              Intercambios promedio por cada categoría activa.
            </p>
          </div>

          <div className="bg-white shadow-md border border-emerald-200 rounded-2xl p-4 flex flex-col justify-between hover:shadow-lg transition">
            <div>
              <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide">
                Categoría más activa
              </p>
              {metrics.topCategoria ? (
                <>
                  <p className="mt-2 text-base font-semibold text-emerald-900">
                    {metrics.topCategoria.categoria}
                  </p>
                  <p className="text-xs text-emerald-700/80">
                    {metrics.topCategoria.total_intercambios} intercambios
                  </p>
                </>
              ) : (
                <p className="mt-2 text-sm text-emerald-700/80">
                  Sin datos en el rango.
                </p>
              )}
            </div>
            <p className="mt-2 text-[11px] text-emerald-700/75">
              Mayor volumen de intercambios dentro del rango.
            </p>
          </div>
        </section>

        {/* Mensaje vacío global */}
        {!loading && !error && !hasData && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm px-4 py-3 rounded-xl shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            No se registraron intercambios para el rango seleccionado. Prueba
            con otras fechas o genera nuevas operaciones.
          </div>
        )}

        {/* GRÁFICOS */}
        <section className="grid lg:grid-cols-2 gap-6">
          {/* Barras */}
          <div className="bg-white rounded-2xl border border-emerald-100 shadow-md p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base md:text-lg font-semibold text-emerald-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-700" />
                  Intercambios por categoría
                </h2>
                <p className="text-xs text-emerald-700/80">
                  Comparación del volumen de intercambios entre categorías.
                </p>
              </div>
            </div>

            <div className="h-72">
              {barData.length > 0 ? (
                <ResponsiveContainer>
                  <BarChart data={barData}>
                    <XAxis
                      dataKey="categoria"
                      tick={{ fontSize: 11 }}
                      interval={0}
                      height={50}
                      tickLine={false}
                      axisLine={{ stroke: "#e5e7eb" }}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar
                      dataKey="intercambios"
                      name="Intercambios"
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

          {/* Pie */}
          <div className="bg-white rounded-2xl border border-emerald-100 shadow-md p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base md:text-lg font-semibold text-emerald-900 flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-emerald-700" />
                  Distribución de intercambios
                </h2>
                <p className="text-xs text-emerald-700/80">
                  Proporción de intercambios por categoría dentro del período.
                </p>
              </div>
            </div>

            <div className="h-72">
              {pieData.length > 0 ? (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`slice-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">
                  Sin datos para mostrar el gráfico.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* TABLA DETALLADA */}
        <section className="bg-white border border-emerald-100 rounded-2xl shadow-md">
          <div className="px-4 py-3 border-b bg-emerald-50 flex items-center justify-between">
            <h2 className="font-semibold text-emerald-900 text-sm md:text-base">
              Detalle por categoría
            </h2>
            {hasData && (
              <span className="text-[11px] text-emerald-800 bg-white/80 border border-emerald-200 px-2 py-0.5 rounded-full">
                {datos.length} categoría(s)
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200/80">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">
                    Categoría
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600">
                    Intercambios
                  </th>
                </tr>
              </thead>
              <tbody>
                {datos.map((c, i) => (
                  <tr
                    key={i}
                    className={i % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
                  >
                    <td className="px-3 py-2 text-slate-800">
                      {c.categoria}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {c.total_intercambios}
                    </td>
                  </tr>
                ))}
                {datos.length === 0 && (
                  <tr>
                    <td
                      className="px-3 py-4 text-center text-gray-400 text-sm"
                      colSpan={2}
                    >
                      No hay intercambios en el rango.
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
