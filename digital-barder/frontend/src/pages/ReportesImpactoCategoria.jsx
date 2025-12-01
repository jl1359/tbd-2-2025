// src/pages/ReportesImpactoCategoria.jsx
import React, { useMemo, useState } from "react";
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
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center border border-emerald-700/20">
              <img src={hoja} alt="Hoja" className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-emerald-800 drop-shadow">
                Impacto ambiental por categoría
              </h1>
              <p className="text-sm text-emerald-700/80">
                Suma de CO₂, agua y energía ahorrada por cada categoría
                (IMPACTO_AMBIENTAL).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-end text-sm bg-white/70 px-4 py-3 rounded-xl shadow backdrop-blur">
            <div className="flex flex-col">
              <label className="mb-1 font-semibold text-emerald-900">
                ID período
              </label>
              <input
                type="number"
                min="1"
                value={idPeriodo}
                onChange={(e) => setIdPeriodo(e.target.value)}
                className="border rounded px-2 py-1 text-sm w-24 shadow-sm"
              />
            </div>
            <button
              type="button"
              onClick={cargar}
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md"
            >
              {loading ? "Cargando…" : "Actualizar"}
            </button>
          </div>
        </header>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 text-sm px-4 py-2 rounded-lg shadow-sm">
            {error}
          </div>
        )}

        {/* KPIs */}
        <section className="grid md:grid-cols-4 gap-6">
          <div className="bg-white shadow-md border border-emerald-200/40 rounded-xl p-4">
            <p className="text-xs font-semibold text-emerald-700 uppercase">
              CO₂ total (kg)
            </p>
            <p className="mt-2 text-3xl font-extrabold text-emerald-900">
              {metrics.totalCo2.toLocaleString()}
            </p>
          </div>

          <div className="bg-white shadow-md border border-blue-200/60 rounded-xl p-4">
            <p className="text-xs font-semibold text-blue-700 uppercase">
              Agua total (L)
            </p>
            <p className="mt-2 text-3xl font-extrabold text-blue-900">
              {metrics.totalAgua.toLocaleString()}
            </p>
          </div>

          <div className="bg-white shadow-md border border-teal-200/60 rounded-xl p-4">
            <p className="text-xs font-semibold text-teal-700 uppercase">
              Energía total (kWh)
            </p>
            <p className="mt-2 text-3xl font-extrabold text-teal-900">
              {metrics.totalEnergia.toLocaleString()}
            </p>
          </div>

          <div className="bg-white shadow-md border border-emerald-200/40 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-700 uppercase">
              Categorías registradas
            </p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">
              {metrics.categorias}
            </p>
            {metrics.topCategoria && (
              <p className="mt-1 text-[11px] text-emerald-700/80">
                Mayor impacto:{" "}
                <span className="font-semibold">
                  {metrics.topCategoria.categoria}
                </span>
              </p>
            )}
          </div>
        </section>

        {/* GRÁFICOS */}
        <section className="grid lg:grid-cols-2 gap-6">
          {/* Barras */}
          <div className="bg-white rounded-xl border border-emerald-200/40 shadow p-4">
            <h2 className="text-lg font-semibold text-emerald-900 mb-2">
              Impacto por categoría (CO₂, Agua, Energía)
            </h2>
            <p className="text-xs text-emerald-700/80 mb-3">
              Comparación de indicadores ambientales por categoría.
            </p>

            <div className="h-72">
              {barData.length > 0 ? (
                <ResponsiveContainer>
                  <BarChart data={barData}>
                    <XAxis dataKey="categoria" hide />
                    <YAxis />
                    <Tooltip />
                    <Legend />
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
          <div className="bg-white rounded-xl border border-emerald-200/40 shadow p-4">
            <h2 className="text-lg font-semibold text-emerald-900 mb-2">
              Distribución de impacto por categoría
            </h2>
            <p className="text-xs text-emerald-700/80 mb-3">
              Proporción del impacto ambiental total por categoría (CO₂ + Agua +
              Energía).
            </p>

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
                    <Legend />
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
        <section className="bg-white border border-emerald-200/40 rounded-xl shadow">
          <div className="px-4 py-3 border-b bg-emerald-50 rounded-t-xl">
            <h2 className="font-semibold text-emerald-900">
              Detalle de impacto por categoría
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-3 py-2 text-left">Categoría</th>
                  <th className="px-3 py-2 text-right">CO₂ total (kg)</th>
                  <th className="px-3 py-2 text-right">Agua total (L)</th>
                  <th className="px-3 py-2 text-right">Energía total (kWh)</th>
                </tr>
              </thead>
              <tbody>
                {datos.map((c, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-3 py-2">{c.categoria}</td>
                    <td className="px-3 py-2 text-right">
                      {c.co2_total}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {c.agua_total}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {c.energia_total}
                    </td>
                  </tr>
                ))}
                {datos.length === 0 && (
                  <tr>
                    <td
                      className="px-3 py-4 text-center text-gray-400"
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
