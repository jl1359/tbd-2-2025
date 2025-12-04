// frontend/src/pages/ReportesImpactoAcumulado.jsx
import { useEffect, useMemo, useState } from "react";
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
import { getReporteImpactoAcumulado } from "../services/api";
import hoja from "../assets/hoja.png";
import {
  Leaf,
  Droplets,
  Zap,
  Repeat2,
  Users,
  Gauge,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const TIPOS_REPORTE = [
  { id: 1, label: "Mensual" },
  { id: 2, label: "Trimestral" },
  { id: 3, label: "Anual" },
];

function isArray(v) {
  return Array.isArray(v);
}

const COLORS = ["#1e3a8a", "#047857", "#0d9488"];

const formatNumber = (n) =>
  Number(n || 0).toLocaleString("es-BO", {
    maximumFractionDigits: 2,
  });

export default function ReportesImpactoAcumulado() {
  const [tipoReporte, setTipoReporte] = useState(1);
  const [idPeriodo, setIdPeriodo] = useState(1);
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function cargar(customTipo = tipoReporte, customPeriodo = idPeriodo) {
    try {
      setLoading(true);
      setError(null);

      const res = await getReporteImpactoAcumulado({
        idTipoReporte: customTipo,
        idPeriodo: customPeriodo,
      });

      setDatos(isArray(res) ? res : []);
    } catch (e) {
      console.error(e);
      setError("Error cargando impacto acumulado.");
      setDatos([]);
    } finally {
      setLoading(false);
    }
  }

  // Cargar al entrar por primera vez
  useEffect(() => {
    cargar(1, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tipoLabel =
    TIPOS_REPORTE.find((t) => t.id === tipoReporte)?.label || "—";

  function cambiarPeriodo(delta) {
    const nuevo = Math.max(1, Number(idPeriodo || 1) + delta);
    setIdPeriodo(nuevo);
    cargar(tipoReporte, nuevo);
  }

  // =========================
  // MÉTRICAS IMPACTO ACUMULADO
  // =========================
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

    return datos.reduce(
      (acc, r) => ({
        co2: acc.co2 + Number(r.total_co2_ahorrado || 0),
        agua: acc.agua + Number(r.total_agua_ahorrada || 0),
        energia: acc.energia + Number(r.total_energia_ahorrada || 0),
        transacciones:
          acc.transacciones + Number(r.total_transacciones || 0),
        usuariosActivos:
          acc.usuariosActivos + Number(r.total_usuarios_activos || 0),
      }),
      { co2: 0, agua: 0, energia: 0, transacciones: 0, usuariosActivos: 0 }
    );
  }, [datos]);

  // =========================
  // DATOS PARA GRÁFICOS
  // =========================
  const barData = useMemo(
    () => [
      {
        indicador: "CO₂ (kg)",
        valor: Number(metrics.co2.toFixed(2)),
      },
      {
        indicador: "Agua (L)",
        valor: Number(metrics.agua.toFixed(2)),
      },
      {
        indicador: "Energía (kWh)",
        valor: Number(metrics.energia.toFixed(2)),
      },
    ],
    [metrics]
  );

  const pieData = useMemo(
    () =>
      [
        { name: "Agua", value: metrics.agua },
        { name: "CO₂", value: metrics.co2 },
        { name: "Energía", value: metrics.energia },
      ].filter((d) => d.value > 0),
    [metrics]
  );

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
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center border border-emerald-600/30">
              <img src={hoja} className="w-10 h-10" alt="Créditos verdes" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wide">
                  Panel ambiental
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-emerald-900 tracking-tight">
                Impacto ambiental acumulado
              </h1>
              <p className="text-sm text-emerald-800/80 mt-1">
                Resumen de CO₂, agua y energía ahorrados, junto a la
                actividad del sistema en el período seleccionado.
              </p>
            </div>
          </div>

          {/* FILTROS */}
          <div className="bg-white/90 px-4 py-3 rounded-2xl shadow border border-emerald-100 backdrop-blur-sm w-full md:w-auto">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {TIPOS_REPORTE.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTipoReporte(t.id);
                      cargar(t.id, idPeriodo);
                    }}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition ${
                      tipoReporte === t.id
                        ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                        : "bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50"
                    }`}
                    disabled={loading}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-end gap-3">
                <div className="flex flex-col">
                  <label className="text-[11px] font-semibold text-emerald-900 mb-1">
                    ID período
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => cambiarPeriodo(-1)}
                      className="p-1 rounded-full border border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading || idPeriodo <= 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      min={1}
                      className="border border-emerald-200 rounded-xl px-3 py-2 text-xs md:text-sm w-24 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={idPeriodo}
                      onChange={(e) =>
                        setIdPeriodo(Math.max(1, Number(e.target.value) || 1))
                      }
                    />
                    <button
                      type="button"
                      onClick={() => cambiarPeriodo(1)}
                      className="p-1 rounded-full border border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="mt-1 text-[10px] text-emerald-800/70">
                    Corresponde al período definido en PERIODO/REPORTE_IMPACTO.
                  </span>
                </div>

                <button
                  onClick={() => cargar()}
                  disabled={loading}
                  className="ml-auto bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-2xl shadow-md transition flex items-center gap-2 text-xs md:text-sm"
                >
                  {loading ? (
                    <>
                      <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Actualizando…
                    </>
                  ) : (
                    <>Actualizar</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* SUBINFO */}
        <div className="flex items-center justify-between gap-2 text-xs text-emerald-900/70">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
            <Gauge className="w-3 h-3" />
            <span>Tipo:</span>
            <span className="font-semibold">{tipoLabel}</span>
            <span>|</span>
            <span>Período ID:</span>
            <span className="font-semibold">{idPeriodo}</span>
          </span>
          {!loading && (
            <span className="hidden sm:inline text-[11px]">
              {datos.length} fila(s) de resumen de impacto.
            </span>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded-xl shadow-sm text-sm">
            {error}
          </div>
        )}

        {/* CARDS DE MÉTRICAS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100 flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-emerald-900/80 uppercase tracking-wide">
                CO₂ ahorrado
              </p>
              <Leaf className="w-4 h-4 text-emerald-700/80" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-emerald-900">
              {formatNumber(metrics.co2)}
            </p>
            <p className="text-[11px] text-emerald-900/70 mt-1">kg</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100 flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-emerald-900/80 uppercase tracking-wide">
                Agua ahorrada
              </p>
              <Droplets className="w-4 h-4 text-emerald-700/80" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-emerald-900">
              {formatNumber(metrics.agua)}
            </p>
            <p className="text-[11px] text-emerald-900/70 mt-1">L</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100 flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-emerald-900/80 uppercase tracking-wide">
                Energía ahorrada
              </p>
              <Zap className="w-4 h-4 text-emerald-700/80" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-emerald-900">
              {formatNumber(metrics.energia)}
            </p>
            <p className="text-[11px] text-emerald-900/70 mt-1">kWh</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100 flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-emerald-900/80 uppercase tracking-wide">
                Transacciones
              </p>
              <Repeat2 className="w-4 h-4 text-emerald-700/80" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-emerald-900">
              {formatNumber(metrics.transacciones)}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100 flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-emerald-900/80 uppercase tracking-wide">
                Usuarios activos
              </p>
              <Users className="w-4 h-4 text-emerald-700/80" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-emerald-900">
              {formatNumber(metrics.usuariosActivos)}
            </p>
          </div>
        </section>

        {/* GRÁFICOS */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* BARRAS */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100 h-80 flex flex-col">
            <h2 className="text-base font-bold text-emerald-900">
              Impacto ambiental acumulado
            </h2>
            <p className="text-[11px] text-emerald-900/70 mb-2">
              Comparación total entre CO₂, agua y energía ahorrados en el
              período.
            </p>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="indicador" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="valor" fill="#047857" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* PIE */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100 h-80 flex flex-col">
            <h2 className="text-base font-bold text-emerald-900">
              Distribución del impacto
            </h2>
            <p className="text-[11px] text-emerald-900/70 mb-2">
              Proporción de cada indicador dentro del impacto total
              acumulado.
            </p>
            <div className="flex-1 flex items-center justify-center">
              {pieData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={90}
                      label
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-emerald-700">
                  Sin datos para el período seleccionado.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* TABLA DETALLE */}
        <section className="bg-white border border-emerald-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b bg-emerald-50 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-emerald-900 text-sm">
                Detalle de impacto por usuario/período
              </h2>
              <p className="text-[11px] text-emerald-900/70">
                Información agregada desde la tabla REPORTE_IMPACTO.
              </p>
            </div>
            <span className="text-[11px] text-emerald-800/70 bg-white px-2 py-0.5 rounded-full border border-emerald-100">
              {datos.length} registro(s)
            </span>
          </div>

          <div className="overflow-x-auto max-h-[420px]">
            <table className="min-w-full text-sm">
              <thead className="bg-emerald-100 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-emerald-900">
                    Usuario (ID)
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-emerald-900">
                    CO₂ (kg)
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-emerald-900">
                    Agua (L)
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-emerald-900">
                    Energía (kWh)
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-emerald-900">
                    Transacciones
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-emerald-900">
                    Usuarios activos
                  </th>
                </tr>
              </thead>
              <tbody>
                {datos.map((r, i) => (
                  <tr
                    key={r.id_usuario ?? `${i}-${Math.random()}`}
                    className={`${
                      i % 2 === 0 ? "bg-white" : "bg-emerald-50/60"
                    } hover:bg-emerald-50 transition-colors`}
                  >
                    <td className="px-3 py-2 border-b border-emerald-100 text-emerald-900">
                      {r.id_usuario ?? "—"}
                    </td>
                    <td className="px-3 py-2 border-b border-emerald-100 text-right">
                      {formatNumber(r.total_co2_ahorrado)}
                    </td>
                    <td className="px-3 py-2 border-b border-emerald-100 text-right">
                      {formatNumber(r.total_agua_ahorrada)}
                    </td>
                    <td className="px-3 py-2 border-b border-emerald-100 text-right">
                      {formatNumber(r.total_energia_ahorrada)}
                    </td>
                    <td className="px-3 py-2 border-b border-emerald-100 text-right">
                      {formatNumber(r.total_transacciones)}
                    </td>
                    <td className="px-3 py-2 border-b border-emerald-100 text-right">
                      {formatNumber(r.total_usuarios_activos)}
                    </td>
                  </tr>
                ))}

                {!datos.length && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-4 text-center text-xs text-emerald-700"
                    >
                      No hay datos para el período seleccionado. Ajusta el
                      tipo de reporte o el ID de período y vuelve a
                      actualizar.
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
