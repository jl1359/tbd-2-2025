// src/pages/ReportesImpactoAcumulado.jsx
import React, { useMemo, useState } from "react";
import { getReporteImpactoAcumulado } from "../services/api";
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

export default function ReportesImpactoAcumulado() {
  const [tipoReporte, setTipoReporte] = useState("1"); // 1=Mensual
  const [idPeriodo, setIdPeriodo] = useState("1");
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function cargar() {
    try {
      setLoading(true);
      setError("");
      const res = await getReporteImpactoAcumulado({
        idTipoReporte: tipoReporte,
        idPeriodo,
      });
      setDatos(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error(e);
      setError("Error cargando impacto acumulado");
      setDatos([]);
    } finally {
      setLoading(false);
    }
  }

  // ===============================
  // MÉTRICAS GLOBALES
  // ===============================
  const metrics = useMemo(() => {
    if (!datos.length) {
      return {
        co2: 0,
        agua: 0,
        energia: 0,
        transacciones: 0,
        usuariosActivos: 0,
      };
    }

    // Sumatoria global
    const total = datos.reduce(
      (acc, r) => {
        acc.co2 += Number(r.total_co2_ahorrado || 0);
        acc.agua += Number(r.total_agua_ahorrada || 0);
        acc.energia += Number(r.total_energia_ahorrada || 0);
        acc.transacciones += Number(r.total_transacciones || 0);
        acc.usuariosActivos += Number(r.total_usuarios_activos || 0);
        return acc;
      },
      { co2: 0, agua: 0, energia: 0, transacciones: 0, usuariosActivos: 0 }
    );

    return total;
  }, [datos]);

  // ===============================
  // GRÁFICOS
  // ===============================
  const barDatos = [
    { name: "CO₂ (kg)", valor: metrics.co2 },
    { name: "Agua (L)", valor: metrics.agua },
    { name: "Energía (kWh)", valor: metrics.energia },
  ];

  const pieDatos = [
    { name: "CO₂", value: metrics.co2 },
    { name: "Agua", value: metrics.agua },
    { name: "Energía", value: metrics.energia },
  ];

  const COLORS = ["#047857", "#1e3a8a", "#0d9488"];

  // ===============================
  // UI
  // ===============================
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
              <img src={hoja} alt="Hoja" className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-emerald-800 drop-shadow">
                Impacto ambiental acumulado
              </h1>
              <p className="text-sm text-emerald-700/80">
                Datos provenientes de la tabla REPORTE_IMPACTO según período.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 bg-white/70 px-4 py-3 rounded-xl shadow backdrop-blur text-sm">
            <div className="flex flex-col">
              <label className="font-semibold text-emerald-900">
                Tipo de reporte
              </label>
              <select
                value={tipoReporte}
                onChange={(e) => setTipoReporte(e.target.value)}
                className="border rounded px-2 py-1 text-sm shadow-sm"
              >
                <option value="1">Mensual</option>
                <option value="2">Diario</option>
                <option value="3">Anual</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="font-semibold text-emerald-900">
                ID período
              </label>
              <input
                type="number"
                min="1"
                value={idPeriodo}
                onChange={(e) => setIdPeriodo(e.target.value)}
                className="border rounded px-2 py-1 text-sm shadow-sm w-24"
              />
            </div>

            <button
              onClick={cargar}
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg font-semibold shadow-md"
            >
              {loading ? "Cargando…" : "Actualizar"}
            </button>
          </div>
        </header>

        {error && (
          <div className="bg-red-100 text-red-700 border border-red-300 px-4 py-2 rounded-lg shadow-sm">
            {error}
          </div>
        )}

        {/* MÉTRICAS PRINCIPALES */}
        <section className="grid md:grid-cols-5 gap-6">
          <div className="bg-white shadow-md border border-emerald-200/40 rounded-xl p-4">
            <p className="text-xs uppercase font-semibold text-emerald-700">
              CO₂ Ahorrado
            </p>
            <p className="text-3xl font-extrabold text-emerald-900 mt-2">
              {metrics.co2.toLocaleString()}
            </p>
          </div>

          <div className="bg-white shadow-md border border-emerald-200/40 rounded-xl p-4">
            <p className="text-xs uppercase font-semibold text-blue-700">
              Agua Ahorrada
            </p>
            <p className="text-3xl font-extrabold text-blue-900 mt-2">
              {metrics.agua.toLocaleString()}
            </p>
          </div>

          <div className="bg-white shadow-md border border-emerald-200/40 rounded-xl p-4">
            <p className="text-xs uppercase font-semibold text-teal-700">
              Energía Ahorrada
            </p>
            <p className="text-3xl font-extrabold text-teal-900 mt-2">
              {metrics.energia.toLocaleString()}
            </p>
          </div>

          <div className="bg-white shadow-md border border-emerald-200/40 rounded-xl p-4">
            <p className="text-xs uppercase font-semibold text-slate-700">
              Transacciones
            </p>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">
              {metrics.transacciones.toLocaleString()}
            </p>
          </div>

          <div className="bg-white shadow-md border border-emerald-200/40 rounded-xl p-4">
            <p className="text-xs uppercase font-semibold text-emerald-700">
              Usuarios activos
            </p>
            <p className="text-3xl font-extrabold text-emerald-900 mt-2">
              {metrics.usuariosActivos.toLocaleString()}
            </p>
          </div>
        </section>

        {/* GRÁFICOS */}
        <section className="grid lg:grid-cols-2 gap-6">
          {/* BARRAS */}
          <div className="bg-white rounded-xl shadow border border-emerald-200/40 p-4">
            <h2 className="text-lg font-semibold text-emerald-900 mb-2">
              Impacto ambiental (acumulado)
            </h2>
            <p className="text-xs mb-3 text-emerald-700/80">
              Comparación total entre CO₂, Agua y Energía ahorrados.
            </p>

            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={barDatos}>
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="valor" radius={[8, 8, 0, 0]}>
                    {barDatos.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* PIE */}
          <div className="bg-white rounded-xl shadow border border-emerald-200/40 p-4">
            <h2 className="text-lg font-semibold text-emerald-900 mb-2">
              Distribución del impacto
            </h2>
            <p className="text-xs mb-3 text-emerald-700/80">
              Proporción de los distintos tipos de impacto ambiental.
            </p>

            <div className="h-72">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieDatos}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label
                    dataKey="value"
                  >
                    {pieDatos.map((entry, index) => (
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
            </div>
          </div>
        </section>

        {/* TABLA DETALLADA */}
        <section className="bg-white shadow border border-emerald-200/40 rounded-xl">
          <div className="px-4 py-3 border-b bg-emerald-50 rounded-t-xl">
            <h2 className="font-semibold text-emerald-900">
              Detalle de impacto por usuario/período
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-3 py-2 text-left">Usuario (ID)</th>
                  <th className="px-3 py-2 text-right">CO₂ (kg)</th>
                  <th className="px-3 py-2 text-right">Agua (L)</th>
                  <th className="px-3 py-2 text-right">Energía (kWh)</th>
                  <th className="px-3 py-2 text-right">Transacciones</th>
                  <th className="px-3 py-2 text-right">Usuarios activos</th>
                </tr>
              </thead>

              <tbody>
                {datos.map((r, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-3 py-2">{r.id_usuario ?? "GLOBAL"}</td>
                    <td className="px-3 py-2 text-right">
                      {r.total_co2_ahorrado}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {r.total_agua_ahorrada}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {r.total_energia_ahorrada}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {r.total_transacciones}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {r.total_usuarios_activos}
                    </td>
                  </tr>
                ))}

                {datos.length === 0 && (
                  <tr>
                    <td
                      className="px-3 py-4 text-center text-gray-400"
                      colSpan={6}
                    >
                      Sin datos en REPORTE_IMPACTO para ese período.
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
