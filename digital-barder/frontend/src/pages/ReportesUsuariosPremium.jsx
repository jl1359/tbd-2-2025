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
  Line,
  ComposedChart, // 👈 usamos ComposedChart para combinar barra + línea
} from "recharts";
import hoja from "../assets/hoja.png";
import { Crown, Users, TrendingUp, Wallet, Calendar } from "lucide-react";

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
      setError("Error cargando reporte de usuarios premium.");
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

  const sinDatos = !loading && datos.length === 0;

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
        label:
          r.desde && r.hasta ? `${r.desde} → ${r.hasta}` : `Periodo ${i + 1}`,
        usuariosActivos: Number(r.total_usuarios_activos || 0),
        nuevosPremium: Number(r.usuarios_nuevos_premium || 0),
        premiumActivos: Number(r.usuarios_premium_activos || 0),
        ingresos: Number(r.ingresos_suscripcion_bs || 0),
        adopcion: Number(r.porcentaje_adopcion_premium || 0),
      })),
    [datos]
  );

  const formatBs = (n) =>
    Number(n || 0).toLocaleString("es-BO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatInt = (n) =>
    Number(n || 0).toLocaleString("es-BO", {
      maximumFractionDigits: 0,
    });

  const formatPercent = (n) => `${Number(n || 0).toFixed(1)}%`;

  const rangoLabel = `Del ${desde} al ${hasta}`;

  return (
    <div
      className="min-h-screen p-4 md:p-8"
      style={{
        background:
          "radial-gradient(circle at top, #bbf7d0 0, #ecfdf5 40%, #f9fafb 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center border border-emerald-700/20">
              <img src={hoja} alt="Premium verde" className="w-10 h-10" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wide">
                  Panel premium
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-emerald-900 tracking-tight">
                Usuarios premium
              </h1>
              <p className="text-sm text-emerald-800/80 mt-1">
                Adopción del plan premium e ingresos por suscripción en el rango
                seleccionado.
              </p>
            </div>
          </div>

          {/* FILTROS */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-wrap gap-3 items-end bg-white/90 px-4 py-3 rounded-2xl shadow border border-emerald-100 backdrop-blur-sm text-sm w-full md:w-auto"
          >
            <div className="flex flex-col">
              <label className="mb-1 font-semibold text-emerald-900 text-xs">
                Desde
              </label>
              <input
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                className="border border-emerald-200 rounded-lg px-2 py-1 text-xs md:text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-semibold text-emerald-900 text-xs">
                Hasta
              </label>
              <input
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
                className="border border-emerald-200 rounded-lg px-2 py-1 text-xs md:text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl font-semibold shadow-md flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-xs md:text-sm"
            >
              {loading ? (
                <>
                  <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Actualizando…
                </>
              ) : (
                <>Actualizar</>
              )}
            </button>
          </form>
        </header>

        {/* INFO DE RANGO */}
        <div className="flex items-center justify-between gap-2 text-xs text-emerald-900/70">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
            <Calendar className="w-3 h-3" />
            <span>Rango analizado:</span>
            <span className="font-semibold">{rangoLabel}</span>
          </span>
          {!sinDatos && !loading && (
            <span className="hidden sm:inline text-[11px]">
              {metrics.periodos} periodo(s) consolidados.
            </span>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-xl shadow-sm">
            {error}
          </div>
        )}

        {/* MENSAJE SIN DATOS */}
        {!loading && !error && sinDatos && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm px-4 py-3 rounded-xl shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            No se encontraron datos de suscripciones premium para el rango
            seleccionado. Prueba con otras fechas o revisa la actividad
            registrada.
          </div>
        )}

        {/* KPIs */}
        <section className="grid md:grid-cols-4 gap-4">
          {/* Premium activos */}
          <div className="bg-white shadow-sm border border-emerald-200/60 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-emerald-800 uppercase">
                Premium activos
              </p>
              <Crown className="w-4 h-4 text-emerald-700/80" />
            </div>
            <p className="mt-2 text-2xl md:text-3xl font-extrabold text-emerald-900">
              {formatInt(metrics.totalPremiumActivos)}
            </p>
            <p className="text-[11px] text-emerald-800/80 mt-1">
              Suma de usuarios premium activos en los períodos.
            </p>
          </div>

          {/* Nuevos premium */}
          <div className="bg-white shadow-sm border border-teal-200/60 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-teal-800 uppercase">
                Nuevos premium
              </p>
              <Users className="w-4 h-4 text-teal-700/80" />
            </div>
            <p className="mt-2 text-2xl md:text-3xl font-extrabold text-teal-900">
              {formatInt(metrics.totalNuevosPremium)}
            </p>
            <p className="text-[11px] text-teal-800/80 mt-1">
              Nuevas altas de premium en el rango.
            </p>
          </div>

          {/* Ingresos */}
          <div className="bg-white shadow-sm border border-blue-200/60 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-blue-800 uppercase">
                Ingresos por suscripción (Bs)
              </p>
              <Wallet className="w-4 h-4 text-blue-700/80" />
            </div>
            <p className="mt-2 text-2xl md:text-3xl font-extrabold text-blue-900">
              {formatBs(metrics.ingresosTotales)}
            </p>
            <p className="text-[11px] text-blue-900/80 mt-1">
              Monto total recaudado por planes premium.
            </p>
          </div>

          {/* Adopción */}
          <div className="bg-white shadow-sm border border-emerald-200/60 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-emerald-800 uppercase">
                Adopción promedio premium
              </p>
              <TrendingUp className="w-4 h-4 text-emerald-700/80" />
            </div>
            <p className="mt-2 text-2xl md:text-3xl font-extrabold text-emerald-900">
              {formatPercent(metrics.adopcionPromedio)}
            </p>
            <p className="text-[11px] text-emerald-800/80 mt-1">
              Promedio de % de adopción en los distintos periodos.
            </p>
          </div>
        </section>

        {/* GRÁFICOS */}
        <section className="grid lg:grid-cols-2 gap-6">
          {/* Ingresos por periodo */}
          <div className="bg-white rounded-2xl border border-emerald-200/40 shadow-sm p-4 flex flex-col">
            <h2 className="text-base font-bold text-emerald-900 mb-1">
              Ingresos por suscripciones premium
            </h2>
            <p className="text-[11px] text-emerald-800/80 mb-2">
              Evolución de los ingresos por período dentro del rango
              seleccionado.
            </p>

            <div className="h-72">
              {chartPorPeriodo.length > 0 ? (
                <ResponsiveContainer>
                  <BarChart data={chartPorPeriodo}>
                    <XAxis dataKey="label" hide />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [formatBs(value), "Ingresos (Bs)"]}
                    />
                    <Legend />
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

          {/* Adopción vs usuarios activos */}
          <div className="bg-white rounded-2xl border border-emerald-200/40 shadow-sm p-4 flex flex-col">
            <h2 className="text-base font-bold text-emerald-900 mb-1">
              Adopción premium vs usuarios activos
            </h2>
            <p className="text-[11px] text-emerald-800/80 mb-2">
              Relación entre usuarios activos totales y porcentaje de adopción
              del plan premium.
            </p>

            <div className="h-72">
              {chartPorPeriodo.length > 0 ? (
                <ResponsiveContainer>
                  {/* 👇 ComposedChart para combinar barra + línea */}
                  <ComposedChart data={chartPorPeriodo}>
                    <XAxis dataKey="label" hide />
                    <YAxis
                      yAxisId="left"
                      tickFormatter={(v) => formatInt(v)}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      formatter={(value, key) => {
                        if (key === "adopcion") {
                          return [formatPercent(value), "% adopción premium"];
                        }
                        if (key === "usuariosActivos") {
                          return [formatInt(value), "Usuarios activos"];
                        }
                        return [value, key];
                      }}
                    />
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
                  </ComposedChart>
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
        <section className="bg-white border border-emerald-200/60 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b bg-emerald-50 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-emerald-900 text-sm">
                Detalle de adopción premium por período
              </h2>
              <p className="text-[11px] text-emerald-900/70">
                Usuarios activos, altas premium, activos y % de adopción por
                tramo de tiempo.
              </p>
            </div>
            <span className="text-[11px] text-emerald-800/70 bg-white px-2 py-0.5 rounded-full border border-emerald-100">
              {datos.length} registro(s)
            </span>
          </div>

          <div className="overflow-x-auto max-h-[420px]">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 sticky top-0 z-10">
                <tr>
                  <th className="px-2 py-1 text-left text-xs font-semibold text-slate-700">
                    Desde
                  </th>
                  <th className="px-2 py-1 text-left text-xs font-semibold text-slate-700">
                    Hasta
                  </th>
                  <th className="px-2 py-1 text-right text-xs font-semibold text-slate-700">
                    Usuarios activos
                  </th>
                  <th className="px-2 py-1 text-right text-xs font-semibold text-slate-700">
                    Nuevos premium
                  </th>
                  <th className="px-2 py-1 text-right text-xs font-semibold text-slate-700">
                    Premium activos
                  </th>
                  <th className="px-2 py-1 text-right text-xs font-semibold text-slate-700">
                    Ingresos (Bs)
                  </th>
                  <th className="px-2 py-1 text-right text-xs font-semibold text-slate-700">
                    % adopción
                  </th>
                </tr>
              </thead>
              <tbody>
                {datos.map((r, i) => (
                  <tr
                    key={i}
                    className={`${
                      i % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                    } hover:bg-emerald-50/70 transition-colors`}
                  >
                    <td className="px-2 py-1 border-b border-slate-200/70">
                      {r.desde}
                    </td>
                    <td className="px-2 py-1 border-b border-slate-200/70">
                      {r.hasta}
                    </td>
                    <td className="px-2 py-1 text-right border-b border-slate-200/70">
                      {formatInt(r.total_usuarios_activos)}
                    </td>
                    <td className="px-2 py-1 text-right border-b border-slate-200/70">
                      {formatInt(r.usuarios_nuevos_premium)}
                    </td>
                    <td className="px-2 py-1 text-right border-b border-slate-200/70">
                      {formatInt(r.usuarios_premium_activos)}
                    </td>
                    <td className="px-2 py-1 text-right border-b border-slate-200/70">
                      {formatBs(r.ingresos_suscripcion_bs)}
                    </td>
                    <td className="px-2 py-1 text-right border-b border-slate-200/70">
                      {formatPercent(r.porcentaje_adopcion_premium)}
                    </td>
                  </tr>
                ))}
                {datos.length === 0 && (
                  <tr>
                    <td
                      className="px-2 py-3 text-center text-gray-400"
                      colSpan={7}
                    >
                      Sin datos de suscripciones premium en el rango
                      seleccionado.
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
