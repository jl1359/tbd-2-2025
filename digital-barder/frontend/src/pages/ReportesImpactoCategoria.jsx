// src/pages/ReportesImpactoCategoria.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getReporteImpactoPorCategoria } from "../services/api";
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

export default function ReportesImpactoCategoria() {
  const [idPeriodo, setIdPeriodo] = useState("1");
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function cargar() {
    try {
      setLoading(true);
      setError("");
      const res = await getReporteImpactoPorCategoria({ idPeriodo });
      setDatos(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error(e);
      setError("Error cargando impacto por categoría");
      setDatos([]);
    } finally {
      setLoading(false);
    }
  }

  // Carga inicial
  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =========================
  // MÉTRICAS GLOBALES
  // =========================
  const metrics = useMemo(() => {
    if (!datos.length) {
      return {
        totalCo2: 0,
        totalAgua: 0,
        totalEnergia: 0,
        categorias: 0,
        topCategoria: null,
      };
    }

    const totalCo2 = datos.reduce(
      (acc, c) => acc + Number(c.co2_total || 0),
      0
    );
    const totalAgua = datos.reduce(
      (acc, c) => acc + Number(c.agua_total || 0),
      0
    );
    const totalEnergia = datos.reduce(
      (acc, c) => acc + Number(c.energia_total || 0),
      0
    );
    const categorias = datos.length;

    const topCategoria = datos.reduce(
      (best, c) =>
        Number(c.co2_total || 0) +
          Number(c.agua_total || 0) +
          Number(c.energia_total || 0) >
        (Number(best?.co2_total || 0) +
          Number(best?.agua_total || 0) +
          Number(best?.energia_total || 0))
          ? c
          : best,
      null
    );

    return { totalCo2, totalAgua, totalEnergia, categorias, topCategoria };
  }, [datos]);

  // =========================
  // DATOS PARA GRÁFICOS
  // =========================
  const barData = useMemo(
    () =>
      datos.map((c) => ({
        categoria: c.categoria,
        co2: Number(c.co2_total || 0),
        agua: Number(c.agua_total || 0),
        energia: Number(c.energia_total || 0),
      })),
    [datos]
  );

  const pieData = useMemo(() => {
    if (!datos.length) return [];
    return datos.map((c) => ({
      name: c.categoria,
      value:
        Number(c.co2_total || 0) +
        Number(c.agua_total || 0) +
        Number(c.energia_total || 0),
    }));
  }, [datos]);

  const COLORS = ["#047857", "#1e3a8a", "#0d9488", "#6d28d9", "#f59e0b"];

  const hasData = datos.length > 0;

  return (
    <div
      className="min-h-screen p-6 md:p-8"
      style={{
        background: "radial-gradient(circle at top left, #bbf7d0, #ecfdf5)",
        backgroundImage: `url(${hoja})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "top right",
        backgroundSize: "180px",
      }}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER */}
        <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center border border-emerald-700/20">
              <img src={hoja} alt="Hoja" className="w-9 h-9 opacity-90" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl md:text-4xl font-extrabold text-emerald-900 drop-shadow-sm">
                Impacto ambiental por categoría
              </h1>
              <p className="text-sm md:text-base text-emerald-800/80 max-w-xl">
                Análisis del CO₂, agua y energía ahorrados agrupados por
                categoría, a partir de la tabla{" "}
                <span className="font-mono text-xs bg-emerald-100/80 px-1.5 py-0.5 rounded">
                  IMPACTO_AMBIENTAL
                </span>
                .
              </p>
              <div className="inline-flex items-center gap-2 mt-1 text-xs text-emerald-900/80">
                <span className="inline-flex items-center gap-1 bg-white/70 px-2.5 py-1 rounded-full shadow-sm border border-emerald-200/60">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Período seleccionado:{" "}
                  <span className="font-semibold">#{idPeriodo}</span>
                </span>
                {hasData && metrics.topCategoria && (
                  <span className="inline-flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-full border border-amber-200 text-amber-900">
                    ⭐ Mayor impacto:{" "}
                    <span className="font-semibold">
                      {metrics.topCategoria.categoria}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg border border-emerald-100 px-4 py-3 flex flex-col gap-3 min-w-[240px]">
            <p className="text-xs font-semibold text-emerald-900 tracking-wide">
              Filtros
            </p>
            <div className="flex items-end gap-3">
              <div className="flex flex-col flex-1">
                <label className="mb-1 text-xs font-semibold text-emerald-900">
                  ID período
                </label>
                <input
                  type="number"
                  min="1"
                  value={idPeriodo}
                  onChange={(e) => setIdPeriodo(e.target.value)}
                  className="border border-emerald-200 rounded-lg px-2 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500"
                />
              </div>
              <button
                type="button"
                onClick={cargar}
                disabled={loading}
                className={`px-4 py-2 rounded-lg text-sm font-semibold shadow-md transition
                ${
                  loading
                    ? "bg-emerald-300 text-emerald-900 cursor-wait"
                    : "bg-emerald-700 hover:bg-emerald-800 text-white"
                }`}
              >
                {loading ? "Cargando…" : "Actualizar"}
              </button>
            </div>
            {loading && (
              <p className="text-[11px] text-emerald-700/80 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Calculando impacto para el período…
              </p>
            )}
          </div>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-xl shadow-sm">
            {error}
          </div>
        )}

        {/* KPIs */}
        <section className="grid md:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white shadow-sm border border-emerald-100 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide">
                CO₂ total (kg)
              </p>
              <p className="mt-2 text-3xl font-extrabold text-emerald-900 tabular-nums">
                {metrics.totalCo2.toLocaleString()}
              </p>
            </div>
            <p className="mt-1 text-[11px] text-emerald-700/75">
              Suma de emisiones evitadas por todas las categorías.
            </p>
          </div>

          <div className="bg-white shadow-sm border border-blue-100 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <p className="text-[11px] font-semibold text-blue-700 uppercase tracking-wide">
                Agua total (L)
              </p>
              <p className="mt-2 text-3xl font-extrabold text-blue-900 tabular-nums">
                {metrics.totalAgua.toLocaleString()}
              </p>
            </div>
            <p className="mt-1 text-[11px] text-blue-800/75">
              Litros de agua ahorrada en el período.
            </p>
          </div>

          <div className="bg-white shadow-sm border border-teal-100 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <p className="text-[11px] font-semibold text-teal-700 uppercase tracking-wide">
                Energía total (kWh)
              </p>
              <p className="mt-2 text-3xl font-extrabold text-teal-900 tabular-nums">
                {metrics.totalEnergia.toLocaleString()}
              </p>
            </div>
            <p className="mt-1 text-[11px] text-teal-800/75">
              Energía equivalente ahorrada en el período.
            </p>
          </div>

          <div className="bg-white shadow-sm border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">
                Categorías registradas
              </p>
              <p className="mt-2 text-3xl font-extrabold text-slate-900 tabular-nums">
                {metrics.categorias}
              </p>
              {metrics.topCategoria && (
                <p className="mt-2 text-xs text-emerald-800 flex flex-wrap gap-1">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px]">
                    Top impacto:
                    <span className="ml-1 font-semibold">
                      {metrics.topCategoria.categoria}
                    </span>
                  </span>
                </p>
              )}
            </div>
            <p className="mt-1 text-[11px] text-slate-600/80">
              Número de categorías con impacto registrado.
            </p>
          </div>
        </section>

        {/* Mensaje de vacío global */}
        {!loading && !error && !hasData && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm px-4 py-3 rounded-xl shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            No se encontró impacto ambiental para el período seleccionado. Prueba
            con otro <strong className="ml-1">ID de período</strong> o genera
            nuevas transacciones.
          </div>
        )}

        {/* GRÁFICOS */}
        <section className="grid lg:grid-cols-2 gap-6">
          {/* Barras */}
          <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base md:text-lg font-semibold text-emerald-900">
                  Impacto por categoría (CO₂, Agua, Energía)
                </h2>
                <p className="text-xs text-emerald-700/80">
                  Comparación de indicadores ambientales por cada categoría.
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
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="co2" name="CO₂ (kg)" fill="#047857" />
                    <Bar dataKey="agua" name="Agua (L)" fill="#1e3a8a" />
                    <Bar dataKey="energia" name="Energía (kWh)" fill="#0d9488" />
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
          <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base md:text-lg font-semibold text-emerald-900">
                  Distribución de impacto por categoría
                </h2>
                <p className="text-xs text-emerald-700/80">
                  Proporción del impacto total (CO₂ + Agua + Energía) por
                  categoría.
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
        <section className="bg-white border border-emerald-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b bg-emerald-50 flex items-center justify-between">
            <h2 className="font-semibold text-emerald-900 text-sm md:text-base">
              Detalle de impacto por categoría
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
                    CO₂ total (kg)
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600">
                    Agua total (L)
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600">
                    Energía total (kWh)
                  </th>
                </tr>
              </thead>
              <tbody>
                {datos.map((c, i) => (
                  <tr
                    key={i}
                    className={
                      i % 2 === 0 ? "bg-white" : "bg-slate-50/60 border-t"
                    }
                  >
                    <td className="px-3 py-2 text-sm text-slate-800">
                      {c.categoria}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {c.co2_total}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {c.agua_total}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {c.energia_total}
                    </td>
                  </tr>
                ))}
                {datos.length === 0 && (
                  <tr>
                    <td
                      className="px-3 py-4 text-center text-gray-400 text-sm"
                      colSpan={4}
                    >
                      Sin impacto registrado para ese período.
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
