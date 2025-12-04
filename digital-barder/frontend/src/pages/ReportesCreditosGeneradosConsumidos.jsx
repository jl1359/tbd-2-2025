// src/pages/ReportesCreditosGenerados.jsx
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
  Cell,
  Legend,
} from "recharts";
import { getReporteCreditosGeneradosVsConsumidos } from "../services/api";
import hoja from "../assets/hoja.png";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  PieChart as PieChartIcon,
  BarChart3,
} from "lucide-react";

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function hace30DiasISO() {
  const d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

export default function ReportesCreditosGenerados() {
  const [desde, setDesde] = useState(hace30DiasISO());
  const [hasta, setHasta] = useState(hoyISO());
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function cargar() {
    try {
      setLoading(true);
      setError("");
      const res = await getReporteCreditosGeneradosVsConsumidos({
        desde,
        hasta,
      });
      setResumen(res || null);
    } catch (e) {
      console.error(e);
      setError("Error cargando resumen de créditos");
      setResumen(null);
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

  // =======================
  // MÉTRICAS DERIVADAS
  // =======================
  const metrics = useMemo(() => {
    if (!resumen) {
      return {
        generados: 0,
        consumidos: 0,
        saldo: 0,
        tasaConsumo: 0,
        estado: "Sin datos",
      };
    }

    const generados = Number(resumen.creditos_generados || 0);
    const consumidos = Number(resumen.creditos_consumidos || 0);
    const saldo = Number(resumen.saldo_neto || generados - consumidos);
    const tasaConsumo = generados > 0 ? (consumidos / generados) * 100 : 0;

    let estado = "Equilibrado";
    if (saldo > 0 && tasaConsumo < 70) estado = "Sostenible";
    else if (saldo < 0 || tasaConsumo > 90) estado = "En riesgo";

    return { generados, consumidos, saldo, tasaConsumo, estado };
  }, [resumen]);

  // =======================
  // DATOS PARA GRÁFICOS
  // =======================
  const barData = useMemo(() => {
    if (!resumen) return [];
    return [
      { name: "Generados", valor: metrics.generados },
      { name: "Consumidos", valor: metrics.consumidos },
    ];
  }, [resumen, metrics.generados, metrics.consumidos]);

  const pieData = useMemo(() => {
    if (!resumen) return [];
    const total = metrics.generados + metrics.consumidos;
    if (total === 0) return [];
    return [
      { name: "Generados", value: metrics.generados },
      { name: "Consumidos", value: metrics.consumidos },
    ];
  }, [resumen, metrics.generados, metrics.consumidos]);

  const COLORS = ["#047857", "#1e3a8a"];

  const estadoStyles =
    metrics.estado === "Sostenible"
      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
      : metrics.estado === "En riesgo"
      ? "bg-red-100 text-red-800 border-red-300"
      : metrics.estado === "Equilibrado"
      ? "bg-amber-50 text-amber-800 border-amber-200"
      : "bg-gray-100 text-gray-700 border-gray-200";

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
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/80 shadow-md flex items-center justify-center border border-emerald-700/10">
              <img src={hoja} alt="Créditos verdes" className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-emerald-900 tracking-tight">
                Créditos generados vs consumidos
              </h1>
              <p className="mt-1 text-sm md:text-base text-emerald-800/80">
                Visión global de créditos emitidos, gastados y el saldo neto en
                el periodo seleccionado.
              </p>
              <p className="mt-2 inline-flex items-center gap-2 text-xs text-emerald-900/70 bg-emerald-50/70 border border-emerald-100 rounded-full px-3 py-1">
                <Activity className="w-3 h-3" />
                Rango analizado:{" "}
                <span className="font-semibold">
                  {desde} &nbsp;–&nbsp; {hasta}
                </span>
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-wrap gap-3 bg-white/80 px-4 py-3 rounded-2xl shadow-md backdrop-blur-sm border border-emerald-100"
          >
            <div className="flex flex-col text-xs md:text-sm">
              <label className="font-semibold text-emerald-900 mb-1">
                Desde
              </label>
              <input
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                className="border border-emerald-100 rounded-lg px-2 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:border-emerald-500"
              />
            </div>
            <div className="flex flex-col text-xs md:text-sm">
              <label className="font-semibold text-emerald-900 mb-1">
                Hasta
              </label>
              <input
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
                className="border border-emerald-100 rounded-lg px-2 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="self-end md:self-center bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl font-semibold shadow-md text-sm flex items-center gap-2 transition"
            >
              <BarChart3 className="w-4 h-4" />
              {loading ? "Actualizando…" : "Actualizar"}
            </button>
          </form>
        </header>

        {loading && (
          <div className="flex items-center gap-2 text-xs text-emerald-900/80 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl shadow-sm w-fit">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Cargando datos del reporte…
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded-xl shadow-sm text-sm">
            {error}
          </div>
        )}

        {/* MÉTRICAS PRINCIPALES */}
        <section className="grid md:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white shadow-md border border-emerald-100 rounded-2xl p-4 flex flex-col gap-2 hover:shadow-lg transition">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wide">
                Créditos generados
              </p>
              <span className="inline-flex items-center justify-center rounded-full bg-emerald-50 p-1">
                <TrendingUp className="w-4 h-4 text-emerald-700" />
              </span>
            </div>
            <p className="text-3xl font-extrabold text-emerald-900 drop-shadow-sm">
              {metrics.generados}
            </p>
            <p className="text-[11px] text-emerald-700/70">
              Créditos otorgados por compras y actividades.
            </p>
          </div>

          <div className="bg-white shadow-md border border-emerald-100 rounded-2xl p-4 flex flex-col gap-2 hover:shadow-lg transition">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wide">
                Créditos consumidos
              </p>
              <span className="inline-flex items-center justify-center rounded-full bg-sky-50 p-1">
                <TrendingDown className="w-4 h-4 text-sky-800" />
              </span>
            </div>
            <p className="text-3xl font-extrabold text-emerald-900 drop-shadow-sm">
              {metrics.consumidos}
            </p>
            <p className="text-[11px] text-emerald-700/70">
              Créditos usados en intercambios y consumos.
            </p>
          </div>

          <div className="bg-white shadow-md border border-emerald-100 rounded-2xl p-4 flex flex-col gap-2 hover:shadow-lg transition">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wide">
                Saldo neto
              </p>
              <span className="inline-flex items-center justify-center rounded-full bg-emerald-50 p-1">
                <Activity className="w-4 h-4 text-emerald-700" />
              </span>
            </div>
            <p
              className={`text-3xl font-extrabold drop-shadow-sm ${
                metrics.saldo >= 0 ? "text-emerald-900" : "text-red-600"
              }`}
            >
              {metrics.saldo}
            </p>
            <p className="text-[11px] text-emerald-700/70">
              Diferencia entre créditos generados y consumidos.
            </p>
          </div>

          <div className="bg-white shadow-md border border-emerald-100 rounded-2xl p-4 flex flex-col gap-2 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wide">
                  Tasa de consumo
                </p>
                <p className="mt-1 text-xl font-bold text-emerald-900">
                  {metrics.tasaConsumo.toFixed(1)}%
                </p>
              </div>
              <span
                className={`text-[10px] border rounded-full px-2 py-1 font-semibold ${estadoStyles}`}
              >
                {metrics.estado}
              </span>
            </div>
            <div className="mt-2 h-2 w-full bg-emerald-50 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500"
                style={{
                  width: `${Math.min(metrics.tasaConsumo, 100)}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-emerald-700/70">
              Proporción de créditos consumidos respecto a los generados.
            </p>
          </div>
        </section>

        {/* DASHBOARDS */}
        <section className="grid lg:grid-cols-2 gap-6">
          {/* BARRAS */}
          <div className="bg-white/95 rounded-2xl border border-emerald-100 shadow-md p-4 md:p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold text-emerald-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-700" />
                  Comparación de créditos
                </h2>
                <p className="text-xs text-emerald-700/80">
                  Comparación directa entre créditos generados y consumidos.
                </p>
              </div>
            </div>
            <div className="h-72">
              {barData.length > 0 ? (
                <ResponsiveContainer>
                  <BarChart data={barData}>
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="valor" radius={[8, 8, 0, 0]}>
                      {barData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index === 0 ? COLORS[0] : COLORS[1]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">
                  Sin datos para mostrar el gráfico.
                </div>
              )}
            </div>
          </div>

          {/* PIE */}
          <div className="bg-white/95 rounded-2xl border border-emerald-100 shadow-md p-4 md:p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold text-emerald-900 flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-emerald-700" />
                  Distribución generados vs consumidos
                </h2>
                <p className="text-xs text-emerald-700/80">
                  Proporción de créditos generados frente a los consumidos.
                </p>
              </div>
            </div>
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

        {/* RESUMEN DETALLADO */}
        <section className="bg-white/95 border border-emerald-100 rounded-2xl shadow-md overflow-hidden">
          <div className="px-4 py-3 border-b bg-emerald-50/80 flex items-center justify-between">
            <h2 className="font-semibold text-emerald-900 text-sm md:text-base">
              Resumen detallado del periodo
            </h2>
            <span className="text-[11px] text-emerald-800/80">
              {desde} &nbsp;–&nbsp; {hasta}
            </span>
          </div>
          <div className="px-4 py-4 text-sm">
            {resumen ? (
              <div className="grid sm:grid-cols-2 gap-3 text-emerald-900">
                <div className="space-y-1">
                  <p>
                    <span className="font-semibold">
                      Créditos generados:
                    </span>{" "}
                    {metrics.generados}
                  </p>
                  <p>
                    <span className="font-semibold">
                      Créditos consumidos:
                    </span>{" "}
                    {metrics.consumidos}
                  </p>
                  <p>
                    <span className="font-semibold">Saldo neto:</span>{" "}
                    {metrics.saldo}
                  </p>
                </div>
                <div className="space-y-1">
                  <p>
                    <span className="font-semibold">
                      Tasa de consumo:
                    </span>{" "}
                    {metrics.tasaConsumo.toFixed(1)}%
                  </p>
                  <p>
                    <span className="font-semibold">Estado global:</span>{" "}
                    <span className={`px-2 py-0.5 rounded-full text-xs border ${estadoStyles}`}>
                      {metrics.estado}
                    </span>
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                Sin datos de créditos generados/consumidos para el rango
                seleccionado.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
