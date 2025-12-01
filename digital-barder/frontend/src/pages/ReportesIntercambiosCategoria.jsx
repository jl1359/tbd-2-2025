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
                Intercambios por categoría
              </h1>
              <p className="text-sm text-emerald-700/80">
                Número de intercambios agrupados por categoría de publicación.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-wrap gap-4 items-end bg-white/70 px-4 py-3 rounded-xl shadow backdrop-blur text-sm"
          >
            <div className="flex flex-col">
              <label className="mb-1 font-semibold text-emerald-900">
                Desde
              </label>
              <input
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                className="border rounded px-2 py-1 text-sm shadow-sm"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-semibold text-emerald-900">
                Hasta
              </label>
              <input
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
                className="border rounded px-2 py-1 text-sm shadow-sm"
              />
            </div>
            <button
              type="submit"
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg font-semibold shadow-md"
            >
              {loading ? "Cargando…" : "Actualizar"}
            </button>
          </form>
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
              Intercambios totales
            </p>
            <p className="mt-2 text-3xl font-extrabold text-emerald-900">
              {metrics.totalIntercambios.toLocaleString()}
            </p>
          </div>

          <div className="bg-white shadow-md border border-slate-200/60 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-700 uppercase">
              Categorías con actividad
            </p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">
              {metrics.categorias}
            </p>
          </div>

          <div className="bg-white shadow-md border border-teal-200/60 rounded-xl p-4">
            <p className="text-xs font-semibold text-teal-700 uppercase">
              Promedio x categoría
            </p>
            <p className="mt-2 text-3xl font-extrabold text-teal-900">
              {metrics.promedioPorCategoria.toFixed(1)}
            </p>
          </div>

          <div className="bg-white shadow-md border border-emerald-200/60 rounded-xl p-4">
            <p className="text-xs font-semibold text-emerald-700 uppercase">
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
        </section>

        {/* GRÁFICOS */}
        <section className="grid lg:grid-cols-2 gap-6">
          {/* Barras */}
          <div className="bg-white rounded-xl border border-emerald-200/40 shadow p-4">
            <h2 className="text-lg font-semibold text-emerald-900 mb-2">
              Intercambios por categoría
            </h2>
            <p className="text-xs text-emerald-700/80 mb-3">
              Comparación de volumen de intercambios entre categorías.
            </p>

            <div className="h-72">
              {barData.length > 0 ? (
                <ResponsiveContainer>
                  <BarChart data={barData}>
                    <XAxis dataKey="categoria" hide />
                    <YAxis allowDecimals={false} />
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
          <div className="bg-white rounded-xl border border-emerald-200/40 shadow p-4">
            <h2 className="text-lg font-semibold text-emerald-900 mb-2">
              Distribución de intercambios
            </h2>
            <p className="text-xs text-emerald-700/80 mb-3">
              Proporción de intercambios por categoría dentro del periodo.
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
              Detalle por categoría
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-3 py-2 text-left">Categoría</th>
                  <th className="px-3 py-2 text-right">Intercambios</th>
                </tr>
              </thead>
              <tbody>
                {datos.map((c, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-3 py-2">{c.categoria}</td>
                    <td className="px-3 py-2 text-right">
                      {c.total_intercambios}
                    </td>
                  </tr>
                ))}
                {datos.length === 0 && (
                  <tr>
                    <td
                      className="px-3 py-4 text-center text-gray-400"
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
