// src/pages/ReportesRankingUsuarios.jsx
import React, { useMemo, useState } from "react";
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

export default function ReportesRankingUsuarios() {
  const [idPeriodo, setIdPeriodo] = useState("");
  const [limit, setLimit] = useState(10);
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      datos.map((r) => ({
        usuario: `U${r.id_usuario}`,
        impacto:
          Number(r.co2_total || 0) +
          Number(r.agua_total || 0) +
          Number(r.energia_total || 0),
      })),
    [datos]
  );

  const chartTransacciones = useMemo(
    () =>
      datos.map((r) => ({
        usuario: `U${r.id_usuario}`,
        transacciones: Number(r.transacciones || 0),
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
              <img src={hoja} alt="Hoja" className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-emerald-800 drop-shadow">
                Ranking de usuarios por impacto
              </h1>
              <p className="text-sm text-emerald-700/80">
                Usuarios ordenados por impacto ambiental (CO₂, agua, energía).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-end text-sm bg-white/70 px-4 py-3 rounded-xl shadow backdrop-blur">
            <div className="flex flex-col">
              <label className="mb-1 font-semibold text-emerald-900">
                ID período (opcional)
              </label>
              <input
                type="number"
                min="1"
                value={idPeriodo}
                onChange={(e) => setIdPeriodo(e.target.value)}
                className="border rounded px-2 py-1 text-sm w-24 shadow-sm"
                placeholder="ej. 1"
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-1 font-semibold text-emerald-900">
                Top N
              </label>
              <input
                type="number"
                min="1"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value) || 1)}
                className="border rounded px-2 py-1 text-sm w-20 shadow-sm"
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
        <section className="grid md:grid-cols-5 gap-6">
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

          <div className="bg-white shadow-md border border-slate-200/60 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-700 uppercase">
              Transacciones
            </p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">
              {metrics.totalTransacciones.toLocaleString()}
            </p>
          </div>

          <div className="bg-white shadow-md border border-emerald-200/40 rounded-xl p-4">
            <p className="text-xs font-semibold text-emerald-700 uppercase">
              Usuarios en ranking
            </p>
            <p className="mt-2 text-3xl font-extrabold text-emerald-900">
              {metrics.usuarios}
            </p>
            {metrics.topUsuario && (
              <p className="mt-1 text-[11px] text-emerald-700/80">
                Top 1:{" "}
                <span className="font-semibold">
                  U{metrics.topUsuario.id_usuario}
                </span>
              </p>
            )}
          </div>
        </section>

        {/* GRÁFICOS */}
        <section className="grid lg:grid-cols-2 gap-6">
          {/* Impacto total por usuario */}
          <div className="bg-white rounded-xl border border-emerald-200/40 shadow p-4">
            <h2 className="text-lg font-semibold text-emerald-900 mb-2">
              Impacto ambiental total por usuario
            </h2>
            <p className="text-xs text-emerald-700/80 mb-3">
              Suma de CO₂, agua y energía por usuario en el ranking.
            </p>

            <div className="h-72">
              {chartImpacto.length > 0 ? (
                <ResponsiveContainer>
                  <BarChart data={chartImpacto}>
                    <XAxis dataKey="usuario" />
                    <YAxis />
                    <Tooltip />
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
          <div className="bg-white rounded-xl border border-emerald-200/40 shadow p-4">
            <h2 className="text-lg font-semibold text-emerald-900 mb-2">
              Transacciones por usuario
            </h2>
            <p className="text-xs text-emerald-700/80 mb-3">
              Volumen de transacciones de los usuarios en el ranking.
            </p>

            <div className="h-72">
              {chartTransacciones.length > 0 ? (
                <ResponsiveContainer>
                  <BarChart data={chartTransacciones}>
                    <XAxis dataKey="usuario" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
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
        <section className="bg-white border border-emerald-200/40 rounded-xl shadow">
          <div className="px-4 py-3 border-b bg-emerald-50 rounded-t-xl">
            <h2 className="font-semibold text-emerald-900">
              Detalle del ranking de usuarios
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-3 py-2 text-left">Usuario (ID)</th>
                  <th className="px-3 py-2 text-right">CO₂ total (kg)</th>
                  <th className="px-3 py-2 text-right">Agua total (L)</th>
                  <th className="px-3 py-2 text-right">Energía total (kWh)</th>
                  <th className="px-3 py-2 text-right">Transacciones</th>
                </tr>
              </thead>
              <tbody>
                {datos.map((r, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-3 py-2">U{r.id_usuario}</td>
                    <td className="px-3 py-2 text-right">
                      {r.co2_total}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {r.agua_total}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {r.energia_total}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {r.transacciones}
                    </td>
                  </tr>
                ))}
                {datos.length === 0 && (
                  <tr>
                    <td
                      className="px-3 py-4 text-center text-gray-400"
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
