// src/pages/ReportesCreditosGenerados.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { getReporteCreditosGeneradosVsConsumidos } from "../services/api";
import hoja from "../assets/hoja.png";

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function hace30DiasISO() {
  const d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

export default function ReportesCreditosGenerados() {
  const [desde, setDesde] = useState(hace30DiasISO());
  const [hasta, setHasta] = useState(hoyISO());
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function cargar() {
    try {
      setLoading(true);
      setError("");
      const res = await getReporteCreditosGeneradosVsConsumidos({
        desde,
        hasta,
      });
      setResumen(res || null);
    } catch (e) {
      console.error(e);
      setError("Error cargando resumen de créditos");
      setResumen(null);
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

  // =======================
  // MÉTRICAS DERIVADAS
  // =======================
  const metrics = useMemo(() => {
    if (!resumen) {
      return {
        generados: 0,
        consumidos: 0,
        saldo: 0,
        tasaConsumo: 0,
        estado: "Sin datos",
      };
    }

    const generados = Number(resumen.creditos_generados || 0);
    const consumidos = Number(resumen.creditos_consumidos || 0);
    const saldo = Number(resumen.saldo_neto || generados - consumidos);
    const tasaConsumo =
      generados > 0 ? (consumidos / generados) * 100 : 0;

    let estado = "Equilibrado";
    if (saldo > 0 && tasaConsumo < 70) estado = "Sostenible";
    else if (saldo < 0 || tasaConsumo > 90) estado = "En riesgo";

    return { generados, consumidos, saldo, tasaConsumo, estado };
  }, [resumen]);

  // =======================
  // DATOS PARA GRÁFICOS
  // =======================
  const barData = useMemo(() => {
    if (!resumen) return [];
    return [
      { name: "Generados", valor: metrics.generados },
      { name: "Consumidos", valor: metrics.consumidos },
    ];
  }, [resumen, metrics.generados, metrics.consumidos]);

  const pieData = useMemo(() => {
    if (!resumen) return [];
    const total = metrics.generados + metrics.consumidos;
    if (total === 0) return [];
    return [
      { name: "Generados", value: metrics.generados },
      { name: "Consumidos", value: metrics.consumidos },
    ];
  }, [resumen, metrics.generados, metrics.consumidos]);

  const COLORS = ["#047857", "#1e3a8a"];

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
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center border border-emerald-700/20">
              <img src={hoja} alt="Créditos verdes" className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-emerald-800 drop-shadow">
                Créditos generados vs consumidos
              </h1>
              <p className="text-sm text-emerald-700/80">
                Resumen global de créditos emitidos, gastados y saldo neto en el
                periodo seleccionado.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-wrap gap-4 bg-white/70 px-4 py-3 rounded-xl shadow backdrop-blur"
          >
            <div className="flex flex-col text-sm">
              <label className="font-semibold text-emerald-900">Desde</label>
              <input
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                className="border rounded px-2 py-1 text-sm shadow-sm"
              />
            </div>
            <div className="flex flex-col text-sm">
              <label className="font-semibold text-emerald-900">Hasta</label>
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
          <div className="bg-red-100 text-red-700 border border-red-300 px-4 py-2 rounded-lg shadow-sm">
            {error}
          </div>
        )}

        {/* MÉTRICAS PRINCIPALES */}
        <section className="grid md:grid-cols-4 gap-6">
          <div className="bg-white shadow-md border border-emerald-200/40 rounded-xl p-4 hover:shadow-lg transition">
            <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
              Créditos generados
            </p>
            <p className="mt-2 text-3xl font-extrabold text-emerald-900 drop-shadow">
              {metrics.generados}
            </p>
          </div>

          <div className="bg-white shadow-md border border-emerald-200/40 rounded-xl p-4 hover:shadow-lg transition">
            <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
              Créditos consumidos
            </p>
            <p className="mt-2 text-3xl font-extrabold text-emerald-900 drop-shadow">
              {metrics.consumidos}
            </p>
          </div>

          <div className="bg-white shadow-md border border-emerald-200/40 rounded-xl p-4 hover:shadow-lg transition">
            <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
              Saldo neto
            </p>
            <p className="mt-2 text-3xl font-extrabold text-emerald-900 drop-shadow">
              {metrics.saldo}
            </p>
          </div>

          <div className="bg-white shadow-md border border-emerald-200/40 rounded-xl p-4 hover:shadow-lg transition">
            <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
              Tasa de consumo
            </p>
            <p className="mt-2 text-3xl font-extrabold text-emerald-900 drop-shadow">
              {metrics.tasaConsumo.toFixed(1)}%
            </p>
            <p className="mt-1 text-xs text-emerald-700/80">
              Estado:{" "}
              <span className="font-semibold">
                {metrics.estado}
              </span>
            </p>
          </div>
        </section>

        {/* DASHBOARDS */}
        <section className="grid lg:grid-cols-2 gap-6">
          {/* BARRAS */}
          <div className="bg-white rounded-xl border border-emerald-200/40 shadow p-4">
            <h2 className="text-lg font-bold text-emerald-800 mb-2">
              Comparación de créditos
            </h2>
            <p className="text-xs text-emerald-700/80 mb-3">
              Comparación directa entre créditos generados y consumidos.
            </p>
            <div className="h-72">
              {barData.length > 0 ? (
                <ResponsiveContainer>
                  <BarChart data={barData}>
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="valor" radius={[8, 8, 0, 0]}>
                      {barData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index === 0 ? COLORS[0] : COLORS[1]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">
                  Sin datos para mostrar el gráfico.
                </div>
              )}
            </div>
          </div>

          {/* PIE */}
          <div className="bg-white rounded-xl border border-emerald-200/40 shadow p-4">
            <h2 className="text-lg font-bold text-emerald-800 mb-2">
              Distribución generados vs consumidos
            </h2>
            <p className="text-xs text-emerald-700/80 mb-3">
              Proporción de créditos generados frente a los consumidos.
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

        {/* RESUMEN DETALLADO */}
        <section className="bg-white border border-emerald-200/40 rounded-xl shadow-md">
          <div className="px-4 py-3 border-b bg-emerald-50 rounded-t-xl">
            <h2 className="font-semibold text-emerald-900">
              Resumen detallado del periodo
            </h2>
          </div>
          <div className="px-4 py-4 text-sm">
            {resumen ? (
              <ul className="space-y-1 text-emerald-900">
                <li>
                  <span className="font-semibold">Créditos generados:</span>{" "}
                  {metrics.generados}
                </li>
                <li>
                  <span className="font-semibold">Créditos consumidos:</span>{" "}
                  {metrics.consumidos}
                </li>
                <li>
                  <span className="font-semibold">Saldo neto:</span>{" "}
                  {metrics.saldo}
                </li>
                <li>
                  <span className="font-semibold">Tasa de consumo:</span>{" "}
                  {metrics.tasaConsumo.toFixed(1)}%
                </li>
                <li>
                  <span className="font-semibold">Estado global:</span>{" "}
                  {metrics.estado}
                </li>
              </ul>
            ) : (
              <p className="text-gray-500">
                Sin datos de créditos generados/consumidos para el rango
                seleccionado.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
