// src/pages/ReportesRankingUsuarios.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getReporteRankingUsuarios } from "../services/api";
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
  Trophy,
  Users,
  Activity,
  Droplets,
  Bolt,
  BarChart3,
} from "lucide-react";

export default function ReportesRankingUsuarios() {
  const [idPeriodo, setIdPeriodo] = useState("");
  const [limit, setLimit] = useState(10);
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hasData = datos.length > 0;

  const formatNumber = (n) =>
    Number(n || 0).toLocaleString("es-BO", {
      maximumFractionDigits: 2,
    });

  const formatInt = (n) =>
    Number(n || 0).toLocaleString("es-BO", {
      maximumFractionDigits: 0,
    });

  async function cargar() {
    try {
      setLoading(true);
      setError("");
      const res = await getReporteRankingUsuarios({ idPeriodo, limit });
      setDatos(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error(e);
      setError("Error cargando ranking de usuarios");
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
        totalTransacciones: 0,
        usuarios: 0,
        topUsuario: null,
      };
    }

    const totalCo2 = datos.reduce(
      (acc, r) => acc + Number(r.co2_total || 0),
      0
    );
    const totalAgua = datos.reduce(
      (acc, r) => acc + Number(r.agua_total || 0),
      0
    );
    const totalEnergia = datos.reduce(
      (acc, r) => acc + Number(r.energia_total || 0),
      0
    );
    const totalTransacciones = datos.reduce(
      (acc, r) => acc + Number(r.transacciones || 0),
      0
    );
    const usuarios = datos.length;

    const topUsuario = datos.reduce(
      (best, r) => {
        const impacto =
          Number(r.co2_total || 0) +
          Number(r.agua_total || 0) +
          Number(r.energia_total || 0);
        const bestImpacto =
          Number(best?.co2_total || 0) +
          Number(best?.agua_total || 0) +
          Number(best?.energia_total || 0);
        return impacto > bestImpacto ? r : best;
      },
      null
    );

    return {
      totalCo2,
      totalAgua,
      totalEnergia,
      totalTransacciones,
      usuarios,
      topUsuario,
    };
  }, [datos]);

  // =========================
  // DATOS PARA GRÁFICOS
  // =========================
  const chartImpacto = useMemo(
    () =>
      datos
        .map((r) => ({
          usuario: `U${r.id_usuario}`,
          impacto:
            Number(r.co2_total || 0) +
            Number(r.agua_total || 0) +
            Number(r.energia_total || 0),
        }))
        .sort((a, b) => b.impacto - a.impacto),
    [datos]
  );

  const chartTransacciones = useMemo(
    () =>
      datos
        .map((r) => ({
          usuario: `U${r.id_usuario}`,
          transacciones: Number(r.transacciones || 0),
        }))
        .sort((a, b) => b.transacciones - a.transacciones),
    [datos]
  );

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
                Ranking de usuarios por impacto
              </h1>
              <p className="mt-1 text-sm md:text-base text-emerald-800/80 max-w-xl">
                Usuarios ordenados por impacto ambiental combinado
                (CO₂, agua y energía), según los filtros seleccionados.
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-emerald-900/80">
                <span className="inline-flex items-center gap-1 bg-white/80 px-2.5 py-1 rounded-full shadow-sm border border-emerald-200/60">
                  <Users className="w-3 h-3" />
                  Usuarios en listado:{" "}
                  <span className="font-semibold">
                    {metrics.usuarios}
                  </span>
                </span>
                {limit && (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200 text-emerald-900">
                    Top N:{" "}
                    <span className="font-semibold">{limit}</span>
                  </span>
                )}
                {idPeriodo && (
                  <span className="inline-flex items-center gap-1 bg-sky-50 px-2 py-1 rounded-full border border-sky-200 text-sky-900">
                    Período:{" "}
                    <span className="font-semibold">#{idPeriodo}</span>
                  </span>
                )}
                {metrics.topUsuario && (
                  <span className="inline-flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-full border border-amber-200 text-amber-900">
                    <Trophy className="w-3 h-3" />
                    Top 1:{" "}
                    <span className="font-semibold">
                      U{metrics.topUsuario.id_usuario}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white/85 backdrop-blur rounded-2xl shadow-lg border border-emerald-100 px-4 py-3 flex flex-col gap-3 min-w-[260px] text-sm">
            <p className="text-xs font-semibold text-emerald-900 tracking-wide">
              Filtros
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="flex flex-col flex-1 min-w-[120px]">
                <label className="mb-1 font-semibold text-emerald-900 text-xs">
                  ID período (opcional)
                </label>
                <input
                  type="number"
                  min="1"
                  value={idPeriodo}
                  onChange={(e) => setIdPeriodo(e.target.value)}
                  className="border border-emerald-200 rounded-lg px-2 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500"
                  placeholder="ej. 1"
                />
                <span className="mt-1 text-[10px] text-emerald-800/70">
                  Corresponde al período de REPORTE_IMPACTO.
                </span>
              </div>

              <div className="flex flex-col flex-1 min-w-[110px]">
                <label className="mb-1 font-semibold text-emerald-900 text-xs">
                  Top N
                </label>
                <input
                  type="number"
                  min="1"
                  value={limit}
                  onChange={(e) =>
                    setLimit(Number(e.target.value) || 1)
                  }
                  className="border border-emerald-200 rounded-lg px-2 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500"
                />
                <span className="mt-1 text-[10px] text-emerald-800/70">
                  Cantidad máxima de usuarios en el ranking.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={cargar}
              disabled={loading}
              className={`mt-1 px-4 py-2 rounded-xl text-sm font-semibold shadow-md flex items-center gap-2 transition
              ${
                loading
                  ? "bg-emerald-300 text-emerald-900 cursor-wait"
                  : "bg-emerald-700 hover:bg-emerald-800 text-white"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              {loading ? "Cargando…" : "Actualizar ranking"}
            </button>

            {loading && (
              <p className="text-[11px] text-emerald-700/80 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Calculando ranking de usuarios…
              </p>
            )}
          </div>
        </header>

        {error && (
          <div className="bg-emerald-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl shadow-sm">
            {error}
          </div>
        )}

        {/* KPIs */}
        <section className="grid md:grid-cols-5 gap-4 md:gap-6">
          <div className="bg-white shadow-md border border-emerald-100 rounded-2xl p-4 flex flex-col justify-between hover:shadow-lg transition">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide">
                  CO₂ total (kg)
                </p>
                <p className="mt-2 text-3xl font-extrabold text-emerald-900 tabular-nums">
                  {formatNumber(metrics.totalCo2)}
                </p>
              </div>
              <span className="inline-flex items-center justify-center rounded-full bg-emerald-50 p-2">
                <Activity className="w-5 h-5 text-emerald-700" />
              </span>
            </div>
            <p className="mt-2 text-[11px] text-emerald-700/75">
              Emisiones de CO₂ evitadas por usuarios del ranking.
            </p>
          </div>

          <div className="bg-white shadow-md border border-sky-100 rounded-2xl p-4 flex flex-col justify-between hover:shadow-lg transition">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold text-sky-700 uppercase tracking-wide">
                  Agua total (L)
                </p>
                <p className="mt-2 text-3xl font-extrabold text-sky-900 tabular-nums">
                  {formatNumber(metrics.totalAgua)}
                </p>
              </div>
              <span className="inline-flex items-center justify-center rounded-full bg-sky-50 p-2">
                <Droplets className="w-5 h-5 text-sky-700" />
              </span>
            </div>
            <p className="mt-2 text-[11px] text-sky-800/80">
              Agua ahorrada por las acciones de los usuarios.
            </p>
          </div>

          <div className="bg-white shadow-md border border-teal-100 rounded-2xl p-4 flex flex-col justify-between hover:shadow-lg transition">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold text-teal-700 uppercase tracking-wide">
                  Energía total (kWh)
                </p>
                <p className="mt-2 text-3xl font-extrabold text-teal-900 tabular-nums">
                  {formatNumber(metrics.totalEnergia)}
                </p>
              </div>
              <span className="inline-flex items-center justify-center rounded-full bg-teal-50 p-2">
                <Bolt className="w-5 h-5 text-teal-700" />
              </span>
            </div>
            <p className="mt-2 text-[11px] text-teal-800/80">
              Energía equivalente ahorrada por el ranking.
            </p>
          </div>

          <div className="bg-white shadow-md border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:shadow-lg transition">
            <div>
              <p className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">
                Transacciones
              </p>
              <p className="mt-2 text-3xl font-extrabold text-slate-900 tabular-nums">
                {formatInt(metrics.totalTransacciones)}
              </p>
            </div>
            <p className="mt-2 text-[11px] text-slate-600/80">
              Número total de transacciones involucradas.
            </p>
          </div>

          <div className="bg-white shadow-md border border-emerald-100 rounded-2xl p-4 flex flex-col justify-between hover:shadow-lg transition">
            <div>
              <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide">
                Usuarios en ranking
              </p>
              <p className="mt-2 text-3xl font-extrabold text-emerald-900 tabular-nums">
                {metrics.usuarios}
              </p>
              {metrics.topUsuario && (
                <p className="mt-2 text-[11px] text-emerald-700/85 flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-500" />
                  Top 1:{" "}
                  <span className="font-semibold">
                    U{metrics.topUsuario.id_usuario}
                  </span>
                </p>
              )}
            </div>
            <p className="mt-2 text-[11px] text-emerald-700/75">
              Usuarios incluidos según el filtro seleccionado.
            </p>
          </div>
        </section>

        {/* Mensaje vacío */}
        {!loading && !error && !hasData && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm px-4 py-3 rounded-xl shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            No hay datos de ranking para los filtros actuales. Ajusta el{" "}
            <strong className="ml-1">Top N</strong> o el{" "}
            <strong className="ml-1">ID de período</strong>.
          </div>
        )}

        {/* GRÁFICOS */}
        <section className="grid lg:grid-cols-2 gap-6">
          {/* Impacto total por usuario */}
          <div className="bg-white rounded-2xl border border-emerald-100 shadow-md p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base md:text-lg font-semibold text-emerald-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-700" />
                  Impacto ambiental total por usuario
                </h2>
                <p className="text-xs text-emerald-700/80">
                  Suma de CO₂, agua y energía por usuario en el ranking.
                </p>
              </div>
            </div>

            <div className="h-72">
              {chartImpacto.length > 0 ? (
                <ResponsiveContainer>
                  <BarChart data={chartImpacto}>
                    <XAxis
                      dataKey="usuario"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={{ stroke: "#e5e7eb" }}
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value) => [formatNumber(value), "Impacto"]}
                    />
                    <Bar
                      dataKey="impacto"
                      name="Impacto total (unidades combinadas)"
                      fill="#047857"
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

          {/* Transacciones por usuario */}
          <div className="bg-white rounded-2xl border border-emerald-100 shadow-md p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base md:text-lg font-semibold text-emerald-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-sky-700" />
                  Transacciones por usuario
                </h2>
                <p className="text-xs text-emerald-700/80">
                  Volumen de transacciones de los usuarios en el ranking.
                </p>
              </div>
            </div>

            <div className="h-72">
              {chartTransacciones.length > 0 ? (
                <ResponsiveContainer>
                  <BarChart data={chartTransacciones}>
                    <XAxis
                      dataKey="usuario"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={{ stroke: "#e5e7eb" }}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value) => [formatInt(value), "Transacciones"]}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar
                      dataKey="transacciones"
                      name="Transacciones"
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
        </section>

        {/* TABLA DETALLADA */}
        <section className="bg-white border border-emerald-100 rounded-2xl shadow-md">
          <div className="px-4 py-3 border-b bg-emerald-50 flex items-center justify-between">
            <h2 className="font-semibold text-emerald-900 text-sm md:text-base">
              Detalle del ranking de usuarios
            </h2>
            {hasData && (
              <span className="text-[11px] text-emerald-800 bg-white/80 border border-emerald-200 px-2 py-0.5 rounded-full">
                {datos.length} usuario(s)
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200/80">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">
                    Usuario (ID)
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
                  <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600">
                    Transacciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {datos.map((r, i) => (
                  <tr
                    key={i}
                    className={i % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
                  >
                    <td className="px-3 py-2 text-slate-800">
                      U{r.id_usuario}
                    </td>

                    {/* 🔽 AQUÍ AÑADÍ text-slate-800 PARA QUE SE VEAN BIEN */}
                    <td className="px-3 py-2 text-right tabular-nums text-slate-800">
                      {formatNumber(r.co2_total)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-slate-800">
                      {formatNumber(r.agua_total)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-slate-800">
                      {formatNumber(r.energia_total)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-slate-800">
                      {formatInt(r.transacciones)}
                    </td>
                  </tr>
                ))}
                {datos.length === 0 && (
                  <tr>
                    <td
                      className="px-3 py-4 text-center text-gray-400 text-sm"
                      colSpan={5}
                    >
                      Sin datos de ranking para los filtros actuales.
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
