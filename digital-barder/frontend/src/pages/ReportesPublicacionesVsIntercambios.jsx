// src/pages/ReportesPublicacionesIntercambios.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getReportePublicacionesVsIntercambios } from "../services/api";
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
  Layers,
  Shuffle,
  Percent,
  BarChart2,
  Calendar,
} from "lucide-react";

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function haceNDiasISO(n) {
  const d = new Date();
  d.setDate(d.getDate() - (n - 1));
  return d.toISOString().slice(0, 10);
}

const RANGOS_RAPIDOS = [
  { id: "7d", label: "Últimos 7 días", dias: 7 },
  { id: "30d", label: "Últimos 30 días", dias: 30 },
  { id: "90d", label: "Últimos 90 días", dias: 90 },
  { id: "1y", label: "Último año", dias: 365 },
];

const COLORS = ["#047857", "#1e3a8a", "#0d9488", "#6d28d9", "#f59e0b"];

export default function ReportesPublicacionesIntercambios() {
  const [desde, setDesde] = useState(haceNDiasISO(30));
  const [hasta, setHasta] = useState(hoyISO());
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rangoActivo, setRangoActivo] = useState("30d");

  async function cargar(customDesde = desde, customHasta = hasta) {
    try {
      setLoading(true);
      setError("");
      const res = await getReportePublicacionesVsIntercambios({
        desde: customDesde,
        hasta: customHasta,
      });
      setDatos(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error(e);
      setError("Error cargando publicaciones vs intercambios.");
      setDatos([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar(desde, hasta);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    setRangoActivo(null); // el usuario puso fechas manuales
    cargar(desde, hasta);
  }

  function aplicarRangoRapido(rango) {
    const nuevoHasta = hoyISO();
    const nuevoDesde = haceNDiasISO(rango.dias);
    setDesde(nuevoDesde);
    setHasta(nuevoHasta);
    setRangoActivo(rango.id);
    cargar(nuevoDesde, nuevoHasta);
  }

  const sinDatos = !loading && datos.length === 0;

  // ======================
  // MÉTRICAS
  // ======================
  const metrics = useMemo(() => {
    if (!datos.length) {
      return {
        totalPublicaciones: 0,
        totalIntercambios: 0,
        categorias: 0,
        promedioRatio: 0,
        mejorCategoria: null,
        tasaConversionGlobal: 0,
      };
    }

    const totalPublicaciones = datos.reduce(
      (acc, p) => acc + Number(p.publicaciones || 0),
      0
    );
    const totalIntercambios = datos.reduce(
      (acc, p) => acc + Number(p.intercambios || 0),
      0
    );
    const categorias = datos.length;

    const ratiosNumericos = datos
      .map((p) => Number(p.ratio_intercambio ?? 0))
      .filter((r) => !Number.isNaN(r));

    const promedioRatio =
      ratiosNumericos.length > 0
        ? ratiosNumericos.reduce((a, b) => a + b, 0) / ratiosNumericos.length
        : 0;

    const mejorCategoria = datos.reduce(
      (best, p) =>
        Number(p.ratio_intercambio ?? 0) >
        Number(best?.ratio_intercambio ?? 0)
          ? p
          : best,
      null
    );

    const tasaConversionGlobal =
      totalPublicaciones > 0
        ? (totalIntercambios / totalPublicaciones) * 100
        : 0;

    return {
      totalPublicaciones,
      totalIntercambios,
      categorias,
      promedioRatio,
      mejorCategoria,
      tasaConversionGlobal,
    };
  }, [datos]);

  // ======================
  // DATOS GRÁFICOS
  // ======================
  const barData = useMemo(
    () =>
      datos
        .map((p) => ({
          categoria: p.categoria,
          publicaciones: Number(p.publicaciones || 0),
          intercambios: Number(p.intercambios || 0),
        }))
        // Ordenamos por más intercambios (de mayor a menor)
        .sort((a, b) => b.intercambios - a.intercambios),
    [datos]
  );

  const pieData = useMemo(
    () =>
      datos
        .map((p) => ({
          name: p.categoria,
          value: Number(p.intercambios || 0),
        }))
        .filter((p) => p.value > 0),
    [datos]
  );

  const formatInt = (n) =>
    Number(n || 0).toLocaleString("es-BO", {
      maximumFractionDigits: 0,
    });

  const formatRatio = (n) => `${Number(n || 0).toFixed(2)} : 1`;

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
              <img src={hoja} alt="Hoja" className="w-10 h-10" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wide">
                  Panel marketplace
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-emerald-900 tracking-tight">
                Publicaciones vs intercambios por categoría
              </h1>
              <p className="text-sm text-emerald-800/80 mt-1">
                Analiza qué tan bien convierten las publicaciones en
                intercambios dentro de cada categoría.
              </p>
            </div>
          </div>

          {/* RANGOS RÁPIDOS + FILTRO DE FECHAS */}
          <div className="flex flex-col gap-3 items-stretch md:items-end min-w-[260px]">
            {/* Botones de rango rápido */}
            <div className="flex flex-wrap gap-2 justify-end">
              {RANGOS_RAPIDOS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => aplicarRangoRapido(r)}
                  disabled={loading}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition
                    ${
                      rangoActivo === r.id
                        ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                        : "bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50"
                    }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Fechas manuales */}
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
                  <>Aplicar fechas</>
                )}
              </button>
            </form>
          </div>
        </header>

        {/* RANGO INFO */}
        <div className="flex items-center justify-between gap-2 text-xs text-emerald-900/70">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
            <Calendar className="w-3 h-3" />
            <span>Rango analizado:</span>
            <span className="font-semibold">{rangoLabel}</span>
          </span>
          {!sinDatos && !loading && (
            <span className="hidden sm:inline text-[11px]">
              {datos.length} categoría(s) activas en el periodo.
            </span>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-xl shadow-sm">
            {error}
          </div>
        )}

        {/* KPIs */}
        <section className="grid md:grid-cols-4 gap-4">
          {/* Publicaciones totales */}
          <div className="bg-white shadow-sm border border-emerald-200/60 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-emerald-800 uppercase">
                Publicaciones totales
              </p>
              <Layers className="w-4 h-4 text-emerald-700/80" />
            </div>
            <p className="mt-2 text-2xl md:text-3xl font-extrabold text-emerald-900">
              {formatInt(metrics.totalPublicaciones)}
            </p>
            <p className="mt-1 text-[11px] text-emerald-900/70">
              Suma de publicaciones consideradas.
            </p>
          </div>

          {/* Intercambios totales */}
          <div className="bg-white shadow-sm border border-teal-200/60 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-teal-800 uppercase">
                Intercambios totales
              </p>
              <Shuffle className="w-4 h-4 text-teal-700/80" />
            </div>
            <p className="mt-2 text-2xl md:text-3xl font-extrabold text-teal-900">
              {formatInt(metrics.totalIntercambios)}
            </p>
            <p className="mt-1 text-[11px] text-teal-900/70">
              Intercambios concretados a partir de publicaciones.
            </p>
          </div>

          {/* Categorías activas */}
          <div className="bg-white shadow-sm border border-slate-200/70 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-slate-800 uppercase">
                Categorías activas
              </p>
              <BarChart2 className="w-4 h-4 text-slate-700/80" />
            </div>
            <p className="mt-2 text-2xl md:text-3xl font-extrabold text-slate-900">
              {metrics.categorias}
            </p>
            <p className="mt-1 text-[11px] text-slate-900/70">
              Categorías con al menos una publicación.
            </p>
          </div>

          {/* Ratio promedio + tasa global */}
          <div className="bg-white shadow-sm border border-emerald-200/70 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-emerald-800 uppercase">
                Ratio promedio
              </p>
              <Percent className="w-4 h-4 text-emerald-700/80" />
            </div>
            <p className="mt-1 text-xl md:text-2xl font-extrabold text-emerald-900">
              {formatRatio(metrics.promedioRatio)}
            </p>
            <p className="mt-1 text-[11px] text-emerald-900/80">
              Tasa global de conversión:{" "}
              <span className="font-semibold">
                {metrics.tasaConversionGlobal.toFixed(1)}%
              </span>
            </p>
            {metrics.mejorCategoria ? (
              <p className="mt-1 text-[11px] text-emerald-900/80">
                Mejor categoría:{" "}
                <span className="font-semibold">
                  {metrics.mejorCategoria.categoria} (
                  {formatRatio(metrics.mejorCategoria.ratio_intercambio)}
                </span>
                )
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-emerald-900/70">
                Aún no hay suficientes datos para el cálculo.
              </p>
            )}
          </div>
        </section>

        {/* GRÁFICOS */}
        <section className="grid lg:grid-cols-2 gap-6">
          {/* Barras: publicaciones vs intercambios */}
          <div className="bg-white rounded-2xl border border-emerald-200/40 shadow-sm p-4 flex flex-col">
            <h2 className="text-base font-bold text-emerald-900 mb-1">
              Publicaciones vs intercambios por categoría
            </h2>
            <p className="text-[11px] text-emerald-800/80 mb-2">
              Compara el volumen de publicaciones frente a los intercambios
              concretados.
            </p>

            <div className="h-72">
              {barData.length > 0 ? (
                <ResponsiveContainer>
                  <BarChart data={barData}>
                    <XAxis
                      dataKey="categoria"
                      tick={{ fontSize: 11 }}
                      interval={0}
                      height={50}
                      tickLine={false}
                      axisLine={{ stroke: "#e5e7eb" }}
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                      formatter={(value, name) => [
                        formatInt(value),
                        name === "publicaciones"
                          ? "Publicaciones"
                          : "Intercambios",
                      ]}
                    />
                    <Legend />
                    <Bar
                      dataKey="publicaciones"
                      name="Publicaciones"
                      fill="#1e3a8a"
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar
                      dataKey="intercambios"
                      name="Intercambios"
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

          {/* Pie: distribución de intercambios */}
          <div className="bg-white rounded-2xl border border-emerald-200/40 shadow-sm p-4 flex flex-col">
            <h2 className="text-base font-bold text-emerald-900 mb-1">
              Distribución de intercambios por categoría
            </h2>
            <p className="text-[11px] text-emerald-800/80 mb-2">
              Muestra qué categorías concentran la mayor cantidad de
              intercambios.
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
                      formatter={(value, name) => [
                        formatInt(value),
                        `Intercambios en ${name}`,
                      ]}
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
                Detalle por categoría
              </h2>
              <p className="text-[11px] text-emerald-900/70">
                Publicaciones, intercambios y ratio de conversión por
                categoría.
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
                    Categoría
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-slate-700">
                    Publicaciones
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-slate-700">
                    Intercambios
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-slate-700">
                    Ratio (Intercambio / Pub.)
                  </th>
                </tr>
              </thead>
              <tbody>
                {datos.map((p, i) => (
                  <tr
                    key={i}
                    className={`${
                      i % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                    } hover:bg-emerald-50/70 transition-colors`}
                  >
                    <td className="px-3 py-2 text-slate-800 border-b border-slate-200/70">
                      {p.categoria}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-800 border-b border-slate-200/70">
                      {formatInt(p.publicaciones)}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-800 border-b border-slate-200/70">
                      {formatInt(p.intercambios)}
                    </td>
                    <td className="px-3 py-2 text-right text-emerald-800 font-semibold border-b border-slate-200/70">
                      {p.ratio_intercambio != null
                        ? formatRatio(p.ratio_intercambio)
                        : "—"}
                    </td>
                  </tr>
                ))}
                {datos.length === 0 && (
                  <tr>
                    <td
                      className="px-3 py-4 text-center text-gray-400"
                      colSpan={4}
                    >
                      Sin datos para el rango seleccionado.
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
