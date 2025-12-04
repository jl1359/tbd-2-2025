// src/pages/ReportesSaldosUsuarios.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getReporteSaldosUsuarios } from "../services/api";
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
  Users,
  Wallet,
  Gauge,
  Crown,
  SlidersHorizontal,
} from "lucide-react";

export default function ReportesSaldosUsuarios() {
  const [limit, setLimit] = useState(20);
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function cargar() {
    try {
      setLoading(true);
      setError("");
      const res = await getReporteSaldosUsuarios({ limit });
      setDatos(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error(e);
      setError("Error cargando saldos de usuarios.");
      setDatos([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sinDatos = !loading && datos.length === 0;

  // =========================
  // MÉTRICAS
  // =========================
  const metrics = useMemo(() => {
    if (!datos.length) {
      return {
        totalUsuarios: 0,
        totalSaldo: 0,
        promedioSaldo: 0,
        topUsuario: null,
      };
    }

    const totalUsuarios = datos.length;
    const totalSaldo = datos.reduce(
      (acc, u) => acc + Number(u.saldo_creditos || 0),
      0
    );
    const promedioSaldo =
      totalUsuarios > 0 ? totalSaldo / totalUsuarios : 0;

    const topUsuario = datos.reduce(
      (best, u) =>
        Number(u.saldo_creditos || 0) >
        Number(best?.saldo_creditos || 0)
          ? u
          : best,
      null
    );

    return { totalUsuarios, totalSaldo, promedioSaldo, topUsuario };
  }, [datos]);

  // =========================
  // DATOS GRÁFICOS
  // =========================
  const barData = useMemo(
    () =>
      datos.map((u, index) => ({
        etiqueta: `U${index + 1}`,
        nombre: u.nombre,
        saldo: Number(u.saldo_creditos || 0),
      })),
    [datos]
  );

  const pieData = useMemo(
    () =>
      datos
        .map((u) => ({
          name: u.nombre,
          value: Number(u.saldo_creditos || 0),
        }))
        .filter((p) => p.value > 0),
    [datos]
  );

  const COLORS = ["#047857", "#1e3a8a", "#0d9488", "#6d28d9", "#f59e0b"];

  const formatCredits = (n) =>
    Number(n || 0).toLocaleString("es-BO", {
      maximumFractionDigits: 2,
    });

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
              <img src={hoja} alt="Hoja" className="w-10 h-10" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wide">
                  Panel billetera
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-emerald-900 tracking-tight">
                Saldos de créditos por usuario
              </h1>
              <p className="text-sm text-emerald-800/80 mt-1">
                Ranking de usuarios con mayor saldo disponible en su
                billetera de créditos verdes.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-end text-sm bg-white/90 px-4 py-3 rounded-2xl shadow border border-emerald-100 backdrop-blur-sm w-full md:w-auto">
            <div className="flex items-center gap-2 w-full">
              <SlidersHorizontal className="w-4 h-4 text-emerald-700/80" />
              <span className="text-[11px] text-emerald-900/80">
                Configura cuántos usuarios quieres ver en el ranking.
              </span>
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-semibold text-emerald-900 text-xs">
                Top N usuarios
              </label>
              <input
                type="number"
                min="1"
                value={limit}
                onChange={(e) =>
                  setLimit(Math.max(1, Number(e.target.value) || 1))
                }
                className="border border-emerald-200 rounded-lg px-2 py-1 text-xs md:text-sm w-24 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
              />
            </div>
            <button
              type="button"
              onClick={cargar}
              disabled={loading}
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs md:text-sm font-semibold shadow-md flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Actualizando…
                </>
              ) : (
                <>Aplicar</>
              )}
            </button>
          </div>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-xl shadow-sm">
            {error}
          </div>
        )}

        {/* KPIs PRINCIPALES */}
        <section className="grid md:grid-cols-3 gap-4">
          <div className="bg-white shadow-sm border border-emerald-200/60 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-emerald-800 uppercase">
                Usuarios en el ranking
              </p>
              <Users className="w-4 h-4 text-emerald-700/80" />
            </div>
            <p className="mt-2 text-2xl md:text-3xl font-extrabold text-emerald-900">
              {metrics.totalUsuarios}
            </p>
            <p className="mt-1 text-[11px] text-emerald-900/70">
              Usuarios incluidos en el Top {limit}.
            </p>
          </div>

          <div className="bg-white shadow-sm border border-blue-200/60 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-blue-800 uppercase">
                Saldo total (créditos)
              </p>
              <Wallet className="w-4 h-4 text-blue-700/80" />
            </div>
            <p className="mt-2 text-2xl md:text-3xl font-extrabold text-blue-900">
              {formatCredits(metrics.totalSaldo)}
            </p>
            <p className="mt-1 text-[11px] text-blue-900/70">
              Suma de los saldos de todos los usuarios listados.
            </p>
          </div>

          <div className="bg-white shadow-sm border border-teal-200/60 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-teal-800 uppercase">
                Saldo promedio
              </p>
              <Gauge className="w-4 h-4 text-teal-700/80" />
            </div>
            <p className="mt-2 text-2xl md:text-3xl font-extrabold text-teal-900">
              {formatCredits(metrics.promedioSaldo)}
            </p>
            <p className="mt-1 text-[11px] text-teal-900/70">
              Promedio de créditos por usuario del ranking.
            </p>
          </div>
        </section>

        {/* USUARIO TOP */}
        <section className="bg-white shadow-sm border border-emerald-200/60 rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 opacity-10">
            <Crown className="w-24 h-24 text-emerald-700" />
          </div>
          <div className="relative z-10">
            <p className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wide">
              Usuario con mayor saldo
            </p>
            {metrics.topUsuario ? (
              <>
                <p className="mt-1 text-lg md:text-xl font-bold text-emerald-900">
                  {metrics.topUsuario.nombre}
                </p>
                <p className="text-xs md:text-sm text-slate-700">
                  {metrics.topUsuario.correo}
                </p>
              </>
            ) : (
              <p className="mt-1 text-sm text-emerald-700/80">
                No hay datos para mostrar el usuario destacado.
              </p>
            )}
          </div>
          {metrics.topUsuario && (
            <div className="relative z-10 text-right">
              <p className="text-[11px] font-semibold text-slate-700 uppercase">
                Saldo créditos
              </p>
              <p className="mt-1 text-3xl md:text-4xl font-extrabold text-emerald-900">
                {formatCredits(metrics.topUsuario.saldo_creditos)}
              </p>
              <p className="text-[11px] text-slate-700/80 mt-1">
                Usuario en primera posición del ranking.
              </p>
            </div>
          )}
        </section>

        {/* GRÁFICOS */}
        <section className="grid lg:grid-cols-2 gap-6">
          {/* Barras */}
          <div className="bg-white rounded-2xl border border-emerald-200/40 shadow-sm p-4 flex flex-col">
            <h2 className="text-base font-bold text-emerald-900 mb-1">
              Saldos por usuario
            </h2>
            <p className="text-[11px] text-emerald-800/80 mb-2">
              Comparación del saldo de créditos entre los usuarios del
              ranking.
            </p>

            <div className="h-72">
              {barData.length > 0 ? (
                <ResponsiveContainer>
                  <BarChart data={barData}>
                    <XAxis dataKey="etiqueta" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, _name, props) => [
                        formatCredits(value),
                        props.payload.nombre,
                      ]}
                    />
                    <Bar
                      dataKey="saldo"
                      name="Saldo créditos"
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

          {/* Pie */}
          <div className="bg-white rounded-2xl border border-emerald-200/40 shadow-sm p-4 flex flex-col">
            <h2 className="text-base font-bold text-emerald-900 mb-1">
              Distribución de saldos
            </h2>
            <p className="text-[11px] text-emerald-800/80 mb-2">
              Proporción del saldo total que concentra cada usuario.
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
                    <Tooltip
                      formatter={(value) => [formatCredits(value), "Saldo"]}
                    />
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
        <section className="bg-white border border-emerald-200/60 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b bg-emerald-50 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-emerald-900 text-sm">
                Detalle de saldos por usuario
              </h2>
              <p className="text-[11px] text-emerald-900/70">
                Lista de usuarios y sus saldos de créditos en la billetera.
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
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">
                    Usuario
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">
                    Correo
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-slate-700">
                    Saldo créditos
                  </th>
                </tr>
              </thead>
              <tbody>
                {datos.map((u, i) => (
                  <tr
                    key={i}
                    className={`${
                      i % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                    } hover:bg-emerald-50/70 transition-colors`}
                  >
                    <td className="px-3 py-2 text-slate-800 border-b border-slate-200/70">
                      {u.nombre}
                    </td>
                    <td className="px-3 py-2 text-slate-700 border-b border-slate-200/70">
                      {u.correo}
                    </td>
                    <td className="px-3 py-2 text-right text-emerald-800 font-semibold border-b border-slate-200/70">
                      {formatCredits(u.saldo_creditos)}
                    </td>
                  </tr>
                ))}
                {datos.length === 0 && (
                  <tr>
                    <td
                      className="px-3 py-4 text-center text-gray-400"
                      colSpan={3}
                    >
                      Sin datos de saldos para mostrar. Ajusta el Top N y
                      vuelve a actualizar.
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
