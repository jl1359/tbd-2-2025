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
      setError("Error cargando saldos de usuarios");
      setDatos([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

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
      datos.map((u) => ({
        name: u.nombre,
        value: Number(u.saldo_creditos || 0),
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
                Saldos de créditos por usuario
              </h1>
              <p className="text-sm text-emerald-700/80">
                Top de usuarios con mayor saldo en su billetera.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-end text-sm bg-white/70 px-4 py-3 rounded-xl shadow backdrop-blur">
            <div className="flex flex-col">
              <label className="mb-1 font-semibold text-emerald-900">
                Top N
              </label>
              <input
                type="number"
                min="1"
                value={limit}
                onChange={(e) =>
                  setLimit(Math.max(1, Number(e.target.value) || 1))
                }
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
        <section className="grid md:grid-cols-3 gap-6">
          <div className="bg-white shadow-md border border-emerald-200/40 rounded-xl p-4">
            <p className="text-xs font-semibold text-emerald-700 uppercase">
              Usuarios en el ranking
            </p>
            <p className="mt-2 text-3xl font-extrabold text-emerald-900">
              {metrics.totalUsuarios}
            </p>
          </div>

          <div className="bg-white shadow-md border border-blue-200/60 rounded-xl p-4">
            <p className="text-xs font-semibold text-blue-700 uppercase">
              Saldo total (créditos)
            </p>
            <p className="mt-2 text-3xl font-extrabold text-blue-900">
              {metrics.totalSaldo.toLocaleString()}
            </p>
          </div>

          <div className="bg-white shadow-md border border-teal-200/60 rounded-xl p-4">
            <p className="text-xs font-semibold text-teal-700 uppercase">
              Saldo promedio
            </p>
            <p className="mt-2 text-3xl font-extrabold text-teal-900">
              {metrics.promedioSaldo.toFixed(1)}
            </p>
          </div>
        </section>

        {/* Usuario Top */}
        <section className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-3 bg-white shadow-md border border-emerald-200/40 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-emerald-700 uppercase">
                Usuario con mayor saldo
              </p>
              {metrics.topUsuario ? (
                <>
                  <p className="mt-1 text-lg font-bold text-emerald-900">
                    {metrics.topUsuario.nombre}
                  </p>
                  <p className="text-xs text-slate-700">
                    {metrics.topUsuario.correo}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-sm text-emerald-700/80">
                  No hay datos para mostrar.
                </p>
              )}
            </div>
            {metrics.topUsuario && (
              <div className="text-right">
                <p className="text-xs font-semibold text-slate-700 uppercase">
                  Saldo créditos
                </p>
                <p className="mt-1 text-3xl font-extrabold text-emerald-900">
                  {Number(
                    metrics.topUsuario.saldo_creditos || 0
                  ).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* GRÁFICOS */}
        <section className="grid lg:grid-cols-2 gap-6">
          {/* Barras */}
          <div className="bg-white rounded-xl border border-emerald-200/40 shadow p-4">
            <h2 className="text-lg font-semibold text-emerald-900 mb-2">
              Saldos por usuario
            </h2>
            <p className="text-xs text-emerald-700/80 mb-3">
              Comparación del saldo de créditos entre los usuarios del top.
            </p>

            <div className="h-72">
              {barData.length > 0 ? (
                <ResponsiveContainer>
                  <BarChart data={barData}>
                    <XAxis dataKey="etiqueta" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name, props) => [
                        value,
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
          <div className="bg-white rounded-xl border border-emerald-200/40 shadow p-4">
            <h2 className="text-lg font-semibold text-emerald-900 mb-2">
              Distribución de saldos
            </h2>
            <p className="text-xs text-emerald-700/80 mb-3">
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
              Detalle de saldos por usuario
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-3 py-2 text-left">Usuario</th>
                  <th className="px-3 py-2 text-left">Correo</th>
                  <th className="px-3 py-2 text-right">Saldo créditos</th>
                </tr>
              </thead>
              <tbody>
                {datos.map((u, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-3 py-2">{u.nombre}</td>
                    <td className="px-3 py-2">{u.correo}</td>
                    <td className="px-3 py-2 text-right">
                      {u.saldo_creditos}
                    </td>
                  </tr>
                ))}
                {datos.length === 0 && (
                  <tr>
                    <td
                      className="px-3 py-4 text-center text-gray-400"
                      colSpan={3}
                    >
                      Sin datos de saldos para mostrar.
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
