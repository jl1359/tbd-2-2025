// src/pages/ReportesUsuariosPremium.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getReporteUsuariosPremium } from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";
import hoja from "../assets/hoja.png";

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function hace30DiasISO() {
  const d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

export default function ReportesUsuariosPremium() {
  const [desde, setDesde] = useState(hace30DiasISO());
  const [hasta, setHasta] = useState(hoyISO());
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function cargar() {
    try {
      setLoading(true);
      setError("");
      const res = await getReporteUsuariosPremium({ desde, hasta });
      setDatos(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error(e);
      setError("Error cargando reporte de usuarios premium");
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
  // MÉTRICAS GLOBALES
  // =========================
  const metrics = useMemo(() => {
    if (!datos.length) {
      return {
        totalUsuariosActivos: 0,
        totalNuevosPremium: 0,
        totalPremiumActivos: 0,
        ingresosTotales: 0,
        adopcionPromedio: 0,
        periodos: 0,
      };
    }

    const totalUsuariosActivos = datos.reduce(
      (acc, r) => acc + Number(r.total_usuarios_activos || 0),
      0
    );
    const totalNuevosPremium = datos.reduce(
      (acc, r) => acc + Number(r.usuarios_nuevos_premium || 0),
      0
    );
    const totalPremiumActivos = datos.reduce(
      (acc, r) => acc + Number(r.usuarios_premium_activos || 0),
      0
    );
    const ingresosTotales = datos.reduce(
      (acc, r) => acc + Number(r.ingresos_suscripcion_bs || 0),
      0
    );

    const porcentajes = datos
      .map((r) => Number(r.porcentaje_adopcion_premium || 0))
      .filter((v) => !Number.isNaN(v));

    const adopcionPromedio =
      porcentajes.length > 0
        ? porcentajes.reduce((a, b) => a + b, 0) / porcentajes.length
        : 0;

    return {
      totalUsuariosActivos,
      totalNuevosPremium,
      totalPremiumActivos,
      ingresosTotales,
      adopcionPromedio,
      periodos: datos.length,
    };
  }, [datos]);

  // =========================
  // DATOS PARA GRÁFICOS
  // =========================
  const chartPorPeriodo = useMemo(
    () =>
      datos.map((r, i) => ({
        label: r.desde && r.hasta ? `${r.desde} → ${r.hasta}` : `Periodo ${i + 1}`,
        usuariosActivos: Number(r.total_usuarios_activos || 0),
        nuevosPremium: Number(r.usuarios_nuevos_premium || 0),
        premiumActivos: Number(r.usuarios_premium_activos || 0),
        ingresos: Number(r.ingresos_suscripcion_bs || 0),
        adopcion: Number(r.porcentaje_adopcion_premium || 0),
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
              <img src={hoja} alt="Premium verde" className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-emerald-800 drop-shadow">
                Usuarios premium
              </h1>
              <p className="text-sm text-emerald-700/80">
                Adopción del plan premium e ingresos por suscripción en el
                rango seleccionado.
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
              Premium activos
            </p>
            <p className="mt-2 text-3xl font-extrabold text-emerald-900">
              {metrics.totalPremiumActivos.toLocaleString()}
            </p>
            <p className="text-[11px] text-emerald-700/80 mt-1">
              Suma de usuarios premium activos en los periodos.
            </p>
          </div>

          <div className="bg-white shadow-md border border-teal-200/60 rounded-xl p-4">
            <p className="text-xs font-semibold text-teal-700 uppercase">
              Nuevos premium
            </p>
            <p className="mt-2 text-3xl font-extrabold text-teal-900">
              {metrics.totalNuevosPremium.toLocaleString()}
            </p>
            <p className="text-[11px] text-teal-700/80 mt-1">
              Nuevas altas de premium en el periodo.
            </p>
          </div>

          <div className="bg-white shadow-md border border-blue-200/60 rounded-xl p-4">
            <p className="text-xs font-semibold text-blue-700 uppercase">
              Ingresos por suscripción (Bs)
            </p>
            <p className="mt-2 text-3xl font-extrabold text-blue-900">
              {metrics.ingresosTotales.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          <div className="bg-white shadow-md border border-emerald-200/60 rounded-xl p-4">
            <p className="text-xs font-semibold text-emerald-700 uppercase">
              Adopción promedio premium
            </p>
            <p className="mt-2 text-3xl font-extrabold text-emerald-900">
              {metrics.adopcionPromedio.toFixed(1)}%
            </p>
            <p className="text-[11px] text-emerald-700/80 mt-1">
              Promedio de % adopción en los periodos.
            </p>
          </div>
        </section>

        {/* GRÁFICO INGRESOS + ADOPCIÓN */}
        <section className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-emerald-200/40 shadow p-4">
            <h2 className="text-lg font-semibold text-emerald-900 mb-2">
              Ingresos por suscripciones premium
            </h2>
            <p className="text-xs text-emerald-700/80 mb-3">
              Evolución de los ingresos por periodo en el rango seleccionado.
            </p>

            <div className="h-72">
              {chartPorPeriodo.length > 0 ? (
                <ResponsiveContainer>
                  <BarChart data={chartPorPeriodo}>
                    <XAxis dataKey="label" hide />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="ingresos"
                      name="Ingresos (Bs)"
                      fill="#1e3a8a"
                      radius={[8, 8, 0, 0]}
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

          <div className="bg-white rounded-xl border border-emerald-200/40 shadow p-4">
            <h2 className="text-lg font-semibold text-emerald-900 mb-2">
              Adopción premium vs usuarios activos
            </h2>
            <p className="text-xs text-emerald-700/80 mb-3">
              Relación entre usuarios activos y porcentaje de adopción premium.
            </p>

            <div className="h-72">
              {chartPorPeriodo.length > 0 ? (
                <ResponsiveContainer>
                  <LineChart data={chartPorPeriodo}>
                    <XAxis dataKey="label" hide />
                    <YAxis yAxisId="left" />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="usuariosActivos"
                      name="Usuarios activos"
                      fill="#047857"
                      radius={[8, 8, 0, 0]}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="adopcion"
                      name="% adopción premium"
                      stroke="#f59e0b"
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
              Detalle de adopción premium por periodo
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-2 py-1 text-left">Desde</th>
                  <th className="px-2 py-1 text-left">Hasta</th>
                  <th className="px-2 py-1 text-right">Usuarios activos</th>
                  <th className="px-2 py-1 text-right">Nuevos premium</th>
                  <th className="px-2 py-1 text-right">Premium activos</th>
                  <th className="px-2 py-1 text-right">Ingresos (Bs)</th>
                  <th className="px-2 py-1 text-right">% adopción</th>
                </tr>
              </thead>
              <tbody>
                {datos.map((r, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-2 py-1">{r.desde}</td>
                    <td className="px-2 py-1">{r.hasta}</td>
                    <td className="px-2 py-1 text-right">
                      {r.total_usuarios_activos}
                    </td>
                    <td className="px-2 py-1 text-right">
                      {r.usuarios_nuevos_premium}
                    </td>
                    <td className="px-2 py-1 text-right">
                      {r.usuarios_premium_activos}
                    </td>
                    <td className="px-2 py-1 text-right">
                      {r.ingresos_suscripcion_bs}
                    </td>
                    <td className="px-2 py-1 text-right">
                      {r.porcentaje_adopcion_premium}%
                    </td>
                  </tr>
                ))}
                {datos.length === 0 && (
                  <tr>
                    <td
                      className="px-2 py-2 text-center text-gray-400"
                      colSpan={7}
                    >
                      Sin datos de suscripciones premium en el rango.
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
