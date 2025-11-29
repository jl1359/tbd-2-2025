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
      setError("Error cargando actividades sostenibles");
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

  // PALETA PARA PIECHART
  const COLORS = ["#047857", "#0d9488", "#1e3a8a", "#6d28d9", "#0f766e"];

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
              <img src={hoja} className="w-10 h-10" />
            </div>

            <div>
              <h1 className="text-3xl font-extrabold text-emerald-800 drop-shadow">
                Reporte de Actividades Sostenibles
              </h1>
              <p className="text-sm text-emerald-700/80">
                Informe y análisis avanzado por usuario
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex gap-4 bg-white/60 px-4 py-3 rounded-xl shadow backdrop-blur"
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

        {/* MÉTRICAS */}
        <section className="grid md:grid-cols-4 gap-6">
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
              label: "Total créditos otorgados",
              value: metrics.totalCreditos,
            },
            {
              label: "Promedio por usuario",
              value: metrics.promedioCreditos.toFixed(1),
            },
          ].map((m, i) => (
            <div
              key={i}
              className="bg-white shadow-md border border-emerald-200/40 rounded-xl p-4 hover:shadow-lg transition"
            >
              <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
                {m.label}
              </p>
              <p className="mt-2 text-3xl font-extrabold text-emerald-900 drop-shadow">
                {m.value}
              </p>
            </div>
          ))}
        </section>

        {/* GRÁFICOS */}
        <section className="grid lg:grid-cols-2 gap-6">
          {/* BARRAS */}
          <div className="bg-white rounded-xl border border-emerald-200/40 shadow p-4">
            <h2 className="text-lg font-bold text-emerald-800 mb-2">
              Actividades por Usuario
            </h2>

            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={dataBarActividades}>
                  <XAxis dataKey="nombre" hide />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="actividades" fill="#065f46" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* PIE */}
          <div className="bg-white rounded-xl border border-emerald-200/40 shadow p-4">
            <h2 className="text-lg font-bold text-emerald-800 mb-2">
              Top 5 por Créditos Otorgados
            </h2>

            <div className="h-72">
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
                    {COLORS.map((col, i) => (
                      <Cell key={i} fill={col} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* TABLA */}
        <section className="bg-white border border-emerald-200/40 rounded-xl shadow-md">
          <div className="px-4 py-3 border-b bg-emerald-50 rounded-t-xl">
            <h2 className="font-semibold text-emerald-900">Detalle por Usuario</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-3 py-2 text-left">Usuario</th>
                  <th className="px-3 py-2 text-left">Correo</th>
                  <th className="px-3 py-2 text-right">Actividades</th>
                  <th className="px-3 py-2 text-right">Créditos</th>
                </tr>
              </thead>
              <tbody>
                {datos.map((a, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-3 py-2">{a.nombre}</td>
                    <td className="px-3 py-2">{a.correo}</td>
                    <td className="px-3 py-2 text-right">{a.total_actividades}</td>
                    <td className="px-3 py-2 text-right">{a.creditos_otorgados}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
