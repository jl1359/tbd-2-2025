// src/pages/ReportesIngresosCreditos.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getReporteIngresosCreditos } from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
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

export default function ReportesIngresosCreditos() {
  const [desde, setDesde] = useState(hace30DiasISO());
  const [hasta, setHasta] = useState(hoyISO());
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function cargar() {
    try {
      setLoading(true);
      setError("");
      const res = await getReporteIngresosCreditos({ desde, hasta });
      setDatos(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error(e);
      setError("Error cargando ingresos por créditos");
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
        totalCreditos: 0,
        totalBs: 0,
        diasConVentas: 0,
        promedioTicket: 0,
      };
    }

    const totalCreditos = datos.reduce(
      (acc, r) => acc + Number(r.total_creditos || 0),
      0
    );
    const totalBs = datos.reduce(
      (acc, r) => acc + Number(r.total_bs || 0),
      0
    );
    const diasConVentas = datos.filter(
      (r) => Number(r.total_bs || 0) > 0
    ).length;
    const promedioTicket =
      diasConVentas > 0 ? totalBs / diasConVentas : 0;

    return { totalCreditos, totalBs, diasConVentas, promedioTicket };
  }, [datos]);

  // =========================
  // DATOS GRÁFICOS
  // =========================
  const chartData = useMemo(
    () =>
      datos.map((r) => ({
        fecha: r.fecha,
        creditos: Number(r.total_creditos || 0),
        monto: Number(r.total_bs || 0),
      })),
    [datos]
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
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center border border-emerald-700/20">
              <img src={hoja} alt="Créditos verdes" className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-emerald-800 drop-shadow">
                Ingresos por venta de créditos
              </h1>
              <p className="text-sm text-emerald-700/80">
                Créditos vendidos y monto recaudado por día en el rango
                seleccionado.
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
              Créditos vendidos
            </p>
            <p className="mt-2 text-3xl font-extrabold text-emerald-900">
              {metrics.totalCreditos.toLocaleString()}
            </p>
          </div>

          <div className="bg-white shadow-md border border-blue-200/60 rounded-xl p-4">
            <p className="text-xs font-semibold text-blue-700 uppercase">
              Monto total (Bs)
            </p>
            <p className="mt-2 text-3xl font-extrabold text-blue-900">
              {metrics.totalBs.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          <div className="bg-white shadow-md border border-teal-200/60 rounded-xl p-4">
            <p className="text-xs font-semibold text-teal-700 uppercase">
              Días con ventas
            </p>
            <p className="mt-2 text-3xl font-extrabold text-teal-900">
              {metrics.diasConVentas}
            </p>
          </div>

          <div className="bg-white shadow-md border border-emerald-200/40 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-700 uppercase">
              Ticket promedio (Bs/día)
            </p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">
              {metrics.promedioTicket.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </section>

        {/* GRÁFICOS */}
        <section className="grid lg:grid-cols-2 gap-6">
          {/* Créditos por día (barras) */}
          <div className="bg-white rounded-xl border border-emerald-200/40 shadow p-4">
            <h2 className="text-lg font-semibold text-emerald-900 mb-2">
              Créditos vendidos por día
            </h2>
            <p className="text-xs text-emerald-700/80 mb-3">
              Distribución de créditos vendidos en el periodo.
            </p>
            <div className="h-72">
              {chartData.length > 0 ? (
                <ResponsiveContainer>
                  <BarChart data={chartData}>
                    <XAxis dataKey="fecha" hide />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar
                      dataKey="creditos"
                      name="Créditos"
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

          {/* Monto por día (línea) */}
          <div className="bg-white rounded-xl border border-emerald-200/40 shadow p-4">
            <h2 className="text-lg font-semibold text-emerald-900 mb-2">
              Monto recaudado por día
            </h2>
            <p className="text-xs text-emerald-700/80 mb-3">
              Evolución del ingreso por ventas de créditos.
            </p>
            <div className="h-72">
              {chartData.length > 0 ? (
                <ResponsiveContainer>
                  <LineChart data={chartData}>
                    <XAxis dataKey="fecha" hide />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="monto"
                      name="Monto (Bs)"
                      stroke="#1e3a8a"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
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
              Detalle diario de ingresos
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-3 py-2 text-left">Fecha</th>
                  <th className="px-3 py-2 text-right">Créditos</th>
                  <th className="px-3 py-2 text-right">Monto (Bs)</th>
                </tr>
              </thead>
              <tbody>
                {datos.map((r, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-3 py-2">{r.fecha}</td>
                    <td className="px-3 py-2 text-right">
                      {r.total_creditos}
                    </td>
                    <td className="px-3 py-2 text-right">{r.total_bs}</td>
                  </tr>
                ))}
                {datos.length === 0 && (
                  <tr>
                    <td
                      className="px-3 py-4 text-center text-gray-400"
                      colSpan={3}
                    >
                      Sin compras de créditos en el rango.
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
