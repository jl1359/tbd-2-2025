// frontend/src/pages/ReportesActividadesSostenibles.jsx
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
  Legend,
  Cell,
} from "recharts";
import { getReporteActividadesSostenibles } from "../services/api";
import hoja from "../assets/hoja.png";

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function hace30DiasISO() {
  const d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

export default function ReportesActividadesSostenibles() {
  const [desde, setDesde] = useState(hace30DiasISO());
  const [hasta, setHasta] = useState(hoyISO());
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function cargar() {
    try {
      setLoading(true);
      setError("");
      const res = await getReporteActividadesSostenibles({ desde, hasta });
      setDatos(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error(e);
      setError("Error cargando actividades sostenibles.");
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

  const sinDatos = !loading && datos.length === 0;

  // MÉTRICAS
  const metrics = useMemo(() => {
    if (!datos.length) {
      return {
        totalUsuarios: 0,
        totalActividades: 0,
        totalCreditos: 0,
        promedioCreditos: 0,
        topUsuario: null,
      };
    }

    const totalUsuarios = datos.length;
    const totalActividades = datos.reduce(
      (acc, it) => acc + Number(it.total_actividades || 0),
      0
    );
    const totalCreditos = datos.reduce(
      (acc, it) => acc + Number(it.creditos_otorgados || 0),
      0
    );
    const promedioCreditos =
      totalUsuarios ? totalCreditos / totalUsuarios : 0;

    const top = datos.reduce(
      (best, it) =>
        Number(it.creditos_otorgados || 0) >
        Number(best?.creditos_otorgados || 0)
          ? it
          : best,
      null
    );

    return {
      totalUsuarios,
      totalActividades,
      totalCreditos,
      promedioCreditos,
      topUsuario: top,
    };
  }, [datos]);

  // DATA GRÁFICOS
  const dataBarActividades = datos.map((d) => ({
    nombre: d.nombre,
    actividades: Number(d.total_actividades) || 0,
  }));

  const dataPieTop5 = (() => {
    const top5 = [...datos]
      .sort(
        (a, b) =>
          Number(b.creditos_otorgados || 0) -
          Number(a.creditos_otorgados || 0)
      )
      .slice(0, 5);

    return top5.map((u) => ({
      name: u.nombre,
      value: Number(u.creditos_otorgados) || 0,
    }));
  })();

  const COLORS = ["#047857", "#0d9488", "#1e3a8a", "#6d28d9", "#0f766e"];

  return (
    <div
      className="min-h-screen p-6 md:p-8"
      style={{
        background: "radial-gradient(circle at top, #bbf7d0 0, #ecfdf5 40%, #f9fafb 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center border border-emerald-600/30">
              <img src={hoja} className="w-10 h-10" alt="Créditos verdes" />
            </div>

            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-emerald-900 tracking-tight">
                Reporte de actividades sostenibles
              </h1>
              <p className="text-sm text-emerald-800/80 mt-1">
                Análisis por usuario de actividades registradas y créditos otorgados.
              </p>
            </div>
          </div>

          {/* FILTRO DE FECHAS */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-wrap gap-3 bg-white/80 px-4 py-3 rounded-2xl shadow border border-emerald-100 backdrop-blur"
          >
            <div className="flex flex-col text-xs md:text-sm">
              <label className="font-semibold text-emerald-900 mb-0.5">
                Desde
              </label>
              <input
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                className="border border-emerald-200 rounded-lg px-2 py-1 shadow-sm focus:outline-none focus:ring focus:ring-emerald-400/60"
              />
            </div>

            <div className="flex flex-col text-xs md:text-sm">
              <label className="font-semibold text-emerald-900 mb-0.5">
                Hasta
              </label>
              <input
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
                className="border border-emerald-200 rounded-lg px-2 py-1 shadow-sm focus:outline-none focus:ring focus:ring-emerald-400/60"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="self-end md:self-center bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl font-semibold text-sm shadow-md flex items-center gap-2"
            >
              {loading ? "Actualizando…" : "Actualizar"}
            </button>
          </form>
        </header>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded-xl shadow-sm text-sm">
            {error}
          </div>
        )}

        {/* MÉTRICAS */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              label: "Usuarios con actividades",
              value: metrics.totalUsuarios,
            },
            {
              label: "Total de actividades",
              value: metrics.totalActividades,
            },
            {
              label: "Créditos otorgados",
              value: metrics.totalCreditos,
            },
            {
              label: "Promedio por usuario",
              value: metrics.promedioCreditos.toFixed(1),
            },
          ].map((m, i) => (
            <div
              key={i}
              className="bg-white shadow-sm border border-emerald-100 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition"
            >
              <p className="text-[11px] font-semibold text-emerald-900/80 uppercase tracking-wide">
                {m.label}
              </p>
              <p className="mt-2 text-2xl font-extrabold text-emerald-900">
                {m.value}
              </p>
            </div>
          ))}

          {/* TOP USUARIO */}
          <div className="bg-emerald-900 text-emerald-50 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-100/90">
              Usuario destacado
            </p>
            {metrics.topUsuario ? (
              <>
                <p className="mt-1 text-sm font-semibold">
                  {metrics.topUsuario.nombre}
                </p>
                <p className="text-xs text-emerald-100/80">
                  {metrics.topUsuario.correo}
                </p>
                <p className="mt-2 text-xs">
                  Créditos otorgados:{" "}
                  <span className="font-bold">
                    {Number(
                      metrics.topUsuario.creditos_otorgados || 0
                    ).toLocaleString("es-BO")}
                  </span>
                </p>
              </>
            ) : (
              <p className="mt-2 text-xs text-emerald-100/80">
                No hay datos en el rango seleccionado.
              </p>
            )}
          </div>
        </section>

        {/* GRÁFICOS */}
        <section className="grid lg:grid-cols-2 gap-6">
          {/* BARRAS */}
          <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-4 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-emerald-900">
                Actividades registradas por usuario
              </h2>
              <span className="text-[11px] text-emerald-700/70">
                Top {Math.min(dataBarActividades.length, 10)} usuarios
              </span>
            </div>

            <div className="h-72">
              {sinDatos ? (
                <div className="h-full flex items-center justify-center text-sm text-gray-400">
                  No hay actividades registradas en el rango seleccionado.
                </div>
              ) : (
                <ResponsiveContainer>
                  <BarChart data={dataBarActividades.slice(0, 10)}>
                    <XAxis dataKey="nombre" hide />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar
                      dataKey="actividades"
                      fill="#047857"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* PIE */}
          <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-4 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-emerald-900">
                Top 5 usuarios por créditos otorgados
              </h2>
              <span className="text-[11px] text-emerald-700/70">
                Distribución porcentual
              </span>
            </div>

            <div className="h-72">
              {sinDatos ? (
                <div className="h-full flex items-center justify-center text-sm text-gray-400">
                  No hay créditos otorgados en el rango seleccionado.
                </div>
              ) : (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={dataPieTop5}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label
                      dataKey="value"
                    >
                      {dataPieTop5.map((entry, index) => (
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
              )}
            </div>
          </div>
        </section>

        {/* TABLA */}
        <section className="bg-white border border-emerald-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b bg-emerald-50 flex items-center justify-between">
            <h2 className="font-semibold text-emerald-900 text-sm">
              Detalle de actividades por usuario
            </h2>
            <span className="text-[11px] text-emerald-800/70">
              {datos.length} registro(s)
            </span>
          </div>

          {sinDatos ? (
            <div className="px-4 py-6 text-sm text-gray-500">
              No hay registros de actividades sostenibles para el rango
              seleccionado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">
                      Usuario
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">
                      Correo
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-700">
                      Actividades
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-700">
                      Créditos otorgados
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {datos.map((a, i) => (
                    <tr
                      key={i}
                      className={i % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
                    >
                      <td className="px-3 py-2 text-slate-800">
                        {a.nombre}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {a.correo}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-800">
                        {a.total_actividades}
                      </td>
                      <td className="px-3 py-2 text-right text-emerald-700 font-semibold">
                        {a.creditos_otorgados}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
