// src/pages/ReportesIngresosCreditos.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getReporteIngresosCreditos } from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import hoja from "../assets/hoja.png";
import {
  CreditCard,
  Wallet,
  Calendar,
  TrendingUp,
  BarChart3,
} from "lucide-react";

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function haceNDiasISO(n) {
  const d = new Date();
  d.setDate(d.getDate() - (n - 1));
  return d.toISOString().slice(0, 10);
}

function hace30DiasISO() {
  return haceNDiasISO(30);
}

const RANGOS_RAPIDOS = [
  { id: "7d", label: "Últimos 7 días", dias: 7 },
  { id: "30d", label: "Últimos 30 días", dias: 30 },
  { id: "90d", label: "Últimos 90 días", dias: 90 },
  { id: "1y", label: "Último año", dias: 365 },
];

export default function ReportesIngresosCreditos() {
  const [desde, setDesde] = useState(hace30DiasISO());
  const [hasta, setHasta] = useState(hoyISO());
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rangoActivo, setRangoActivo] = useState("30d");

  async function cargar(customDesde = desde, customHasta = hasta) {
    try {
      setLoading(true);
      setError("");
      const res = await getReporteIngresosCreditos({
        desde: customDesde,
        hasta: customHasta,
      });
      setDatos(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error(e);
      setError("Error cargando ingresos por créditos.");
      setDatos([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Carga inicial con el rango por defecto (30 días)
    cargar(desde, hasta);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    setRangoActivo(null); // el usuario escogió fechas manuales
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

  // =========================
  // MÉTRICAS
  // =========================
  const metrics = useMemo(() => {
    if (!datos.length) {
      return {
        totalCreditos: 0,
        totalBs: 0,
        diasConVentas: 0,
        promedioTicket: 0,
        mejorDia: null,
      };
    }

    const totalCreditos = datos.reduce(
      (acc, r) => acc + Number(r.total_creditos || 0),
      0
    );
    const totalBs = datos.reduce(
      (acc, r) => acc + Number(r.total_bs || 0),
      0
    );
    const diasConVentas = datos.filter(
      (r) => Number(r.total_bs || 0) > 0
    ).length;
    const promedioTicket =
      diasConVentas > 0 ? totalBs / diasConVentas : 0;

    const mejorDia = datos.reduce(
      (best, r) =>
        Number(r.total_bs || 0) >
        Number(best?.total_bs || 0)
          ? r
          : best,
      null
    );

    return { totalCreditos, totalBs, diasConVentas, promedioTicket, mejorDia };
  }, [datos]);

  // =========================
  // DATOS GRÁFICOS
  // =========================
  const chartData = useMemo(
    () =>
      datos.map((r) => ({
        fecha: r.fecha,
        creditos: Number(r.total_creditos || 0),
        monto: Number(r.total_bs || 0),
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
            <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center border border-emerald-700/30">
              <img src={hoja} alt="Créditos verdes" className="w-10 h-10" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wide">
                  Panel financiero
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-emerald-900 tracking-tight">
                Ingresos por venta de créditos
              </h1>
              <p className="text-sm text-emerald-800/80 mt-1">
                Créditos vendidos y monto recaudado por día en el rango
                seleccionado.
              </p>
            </div>
          </div>

          {/* FILTROS (rangos rápidos + fechas) */}
          <div className="flex flex-col gap-3 items-stretch md:items-end">
            {/* Rangos rápidos */}
            <div className="flex flex-wrap gap-2 justify-end">
              {RANGOS_RAPIDOS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => aplicarRangoRapido(r)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition ${
                    rangoActivo === r.id
                      ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                      : "bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50"
                  }`}
                  disabled={loading}
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
                <BarChart3 className="w-4 h-4" />
                {loading ? "Actualizando…" : "Aplicar fechas"}
              </button>
            </form>
          </div>
        </header>

        {/* SUBINFO RANGO */}
        <div className="flex items-center justify-between gap-2 text-xs text-emerald-900/70">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
            <Calendar className="w-3 h-3" />
            <span>Rango analizado:</span>
            <span className="font-semibold">{rangoLabel}</span>
          </span>
          {!sinDatos && !loading && (
            <span className="hidden sm:inline text-[11px]">
              {datos.length} día(s) con datos.
            </span>
          )}
        </div>

        {loading && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs px-3 py-2 rounded-xl shadow-sm inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Cargando datos de ingresos…
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-xl shadow-sm">
            {error}
          </div>
        )}

        {/* KPIs */}
        <section className="grid md:grid-cols-4 gap-4">
          {/* Créditos vendidos */}
          <div className="bg-white shadow-sm border border-emerald-200/60 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-emerald-800 uppercase">
                Créditos vendidos
              </p>
              <CreditCard className="w-4 h-4 text-emerald-700/80" />
            </div>
            <p className="mt-2 text-2xl md:text-3xl font-extrabold text-emerald-900">
              {formatInt(metrics.totalCreditos)}
            </p>
            <p className="text-[11px] text-emerald-900/70 mt-1">
              Total de créditos comercializados.
            </p>
          </div>

          {/* Monto total Bs */}
          <div className="bg-white shadow-sm border border-blue-200/60 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-blue-800 uppercase">
                Monto total (Bs)
              </p>
              <Wallet className="w-4 h-4 text-blue-700/80" />
            </div>
            <p className="mt-2 text-2xl md:text-3xl font-extrabold text-blue-900">
              {formatBs(metrics.totalBs)}
            </p>
            <p className="text-[11px] text-blue-900/70 mt-1">
              Ingreso bruto por la venta de créditos.
            </p>
          </div>

          {/* Días con ventas */}
          <div className="bg-white shadow-sm border border-teal-200/60 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-teal-800 uppercase">
                Días con ventas
              </p>
              <Calendar className="w-4 h-4 text-teal-700/80" />
            </div>
            <p className="mt-2 text-2xl md:text-3xl font-extrabold text-teal-900">
              {formatInt(metrics.diasConVentas)}
            </p>
            <p className="text-[11px] text-teal-900/70 mt-1">
              Días en los que se registraron compras.
            </p>
          </div>

          {/* Ticket promedio + mejor día */}
          <div className="bg-white shadow-sm border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-slate-800 uppercase">
                promedio (Bs/día)
              </p>
              <TrendingUp className="w-4 h-4 text-slate-700/80" />
            </div>
            <p className="mt-2 text-2xl md:text-3xl font-extrabold text-slate-900">
              {formatBs(metrics.promedioTicket)}
            </p>
            {metrics.mejorDia && (
              <p className="mt-2 text-[11px] text-slate-900/80">
                Mejor día:{" "}
                <span className="font-semibold">{metrics.mejorDia.fecha}</span>{" "}
                ({formatBs(metrics.mejorDia.total_bs)} Bs)
              </p>
            )}
            {!metrics.mejorDia && (
              <p className="text-[11px] text-slate-900/70 mt-1">
                Aún no hay días con ventas en el rango.
              </p>
            )}
          </div>
        </section>

        {/* Mensaje cuando no hay datos */}
        {!loading && !error && sinDatos && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm px-4 py-3 rounded-xl shadow-sm">
            No se registraron compras de créditos en el rango seleccionado.
            Ajusta las fechas o el rango rápido para ver más información.
          </div>
        )}

        {/* GRÁFICOS */}
        <section className="grid lg:grid-cols-2 gap-6">
          {/* Créditos por día (barras) */}
          <div className="bg-white rounded-2xl border border-emerald-200/40 shadow-sm p-4 flex flex-col">
            <h2 className="text-base font-bold text-emerald-900 mb-1">
              Créditos vendidos por día
            </h2>
            <p className="text-[11px] text-emerald-800/80 mb-2">
              Distribución diaria de créditos vendidos en el período.
            </p>
            <div className="h-72">
              {chartData.length > 0 ? (
                <ResponsiveContainer>
                  <BarChart data={chartData}>
                    <XAxis dataKey="fecha" hide />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                      formatter={(value, name) =>
                        name === "Créditos"
                          ? [formatInt(value), "Créditos"]
                          : [value, name]
                      }
                    />
                    <Bar
                      dataKey="creditos"
                      name="Créditos"
                      radius={[8, 8, 0, 0]}
                      fill="#047857"
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

          {/* Monto por día (línea) */}
          <div className="bg-white rounded-2xl border border-emerald-200/40 shadow-sm p-4 flex flex-col">
            <h2 className="text-base font-bold text-emerald-900 mb-1">
              Monto recaudado por día
            </h2>
            <p className="text-[11px] text-emerald-800/80 mb-2">
              Evolución de los ingresos por ventas de créditos.
            </p>
            <div className="h-72">
              {chartData.length > 0 ? (
                <ResponsiveContainer>
                  <LineChart data={chartData}>
                    <XAxis dataKey="fecha" hide />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) =>
                        name === "Monto (Bs)"
                          ? [formatBs(value), "Monto (Bs)"]
                          : [value, name]
                      }
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="monto"
                      name="Monto (Bs)"
                      stroke="#1e3a8a"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
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
                Detalle diario de ingresos
              </h2>
              <p className="text-[11px] text-emerald-900/70">
                Listado de créditos vendidos y monto recaudado por día.
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
                    Fecha
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-slate-700">
                    Créditos
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-slate-700">
                    Monto (Bs)
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
                    <td className="px-3 py-2 text-slate-800 border-b border-slate-200/70">
                      {r.fecha}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-800 border-b border-slate-200/70">
                      {formatInt(r.total_creditos)}
                    </td>
                    <td className="px-3 py-2 text-right text-emerald-800 font-semibold border-b border-slate-200/70">
                      {formatBs(r.total_bs)}
                    </td>
                  </tr>
                ))}
                {datos.length === 0 && (
                  <tr>
                    <td
                      className="px-3 py-4 text-center text-gray-400"
                      colSpan={3}
                    >
                      Sin compras de créditos en el rango seleccionado.
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
