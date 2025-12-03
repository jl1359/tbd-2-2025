// frontend/src/pages/ReportesImpactoAcumulado.jsx
import { useMemo, useState } from "react";
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

const TIPOS_REPORTE = [
  { id: 1, label: "Mensual" },
  { id: 2, label: "Trimestral" },
  { id: 3, label: "Anual" },
];

function isArray(v) {
  return Array.isArray(v);
}

export default function ReportesImpactoAcumulado() {
  const [tipoReporte, setTipoReporte] = useState(1);
  const [idPeriodo, setIdPeriodo] = useState(1);
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function cargar() {
    try {
      setLoading(true);
      setError(null);

      const res = await getReporteImpactoAcumulado({
        idTipoReporte: tipoReporte,
        idPeriodo,
      });

      setDatos(isArray(res) ? res : []);
    } catch (e) {
      console.error(e);
      setError("Error cargando impacto acumulado");
      setDatos([]);
    } finally {
      setLoading(false);
    }
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
  }, [datos]); // 👈 IMPORTANTE: depender de datos

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

  const COLORS = ["#1e3a8a", "#047857", "#0d9488"];

  const formatNumber = (n) =>
    Number(n || 0).toLocaleString("es-BO", {
      maximumFractionDigits: 2,
    });

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
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-emerald-600 flex items-center justify-center shadow-lg">
            <span className="text-3xl">🌱</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-emerald-900">
              Impacto ambiental acumulado
            </h1>
            <p className="text-sm text-emerald-800">
              Datos provenientes de la tabla REPORTE_IMPACTO según período.
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-end gap-4 bg-white/80 p-4 rounded-2xl shadow">
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-emerald-900 mb-1">
              Tipo de reporte
            </label>
            <select
              className="border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={tipoReporte}
              onChange={(e) => setTipoReporte(Number(e.target.value))}
            >
              {TIPOS_REPORTE.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-semibold text-emerald-900 mb-1">
              ID período
            </label>
            <input
              type="number"
              min={1}
              className="border rounded-xl px-3 py-2 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={idPeriodo}
              onChange={(e) => setIdPeriodo(Number(e.target.value))}
            />
          </div>

          <button
            onClick={cargar}
            disabled={loading}
            className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2 rounded-2xl shadow-lg transition disabled:opacity-60"
          >
            {loading ? "Cargando..." : "Actualizar"}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-800 px-4 py-2 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Cards de métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white/90 rounded-2xl p-4 shadow">
            <p className="text-xs font-semibold text-emerald-900">
              CO₂ AHORRADO
            </p>
            <p className="mt-2 text-2xl font-bold text-emerald-700">
              {formatNumber(metrics.co2)}
            </p>
            <p className="text-xs text-emerald-800 mt-1">kg</p>
          </div>

          <div className="bg-white/90 rounded-2xl p-4 shadow">
            <p className="text-xs font-semibold text-emerald-900">
              AGUA AHORRADA
            </p>
            <p className="mt-2 text-2xl font-bold text-emerald-700">
              {formatNumber(metrics.agua)}
            </p>
            <p className="text-xs text-emerald-800 mt-1">L</p>
          </div>

          <div className="bg-white/90 rounded-2xl p-4 shadow">
            <p className="text-xs font-semibold text-emerald-900">
              ENERGÍA AHORRADA
            </p>
            <p className="mt-2 text-2xl font-bold text-emerald-700">
              {formatNumber(metrics.energia)}
            </p>
            <p className="text-xs text-emerald-800 mt-1">kWh</p>
          </div>

          <div className="bg-white/90 rounded-2xl p-4 shadow">
            <p className="text-xs font-semibold text-emerald-900">
              TRANSACCIONES
            </p>
            <p className="mt-2 text-2xl font-bold text-emerald-700">
              {formatNumber(metrics.transacciones)}
            </p>
          </div>

          <div className="bg-white/90 rounded-2xl p-4 shadow">
            <p className="text-xs font-semibold text-emerald-900">
              USUARIOS ACTIVOS
            </p>
            <p className="mt-2 text-2xl font-bold text-emerald-700">
              {formatNumber(metrics.usuariosActivos)}
            </p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar */}
          <div className="bg-white/90 rounded-2xl p-4 shadow h-80 flex flex-col">
            <h2 className="text-lg font-semibold text-emerald-900">
              Impacto ambiental (acumulado)
            </h2>
            <p className="text-xs text-emerald-800 mb-2">
              Comparación total entre CO₂, Agua y Energía ahorrados.
            </p>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="indicador" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="valor" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie */}
          <div className="bg-white/90 rounded-2xl p-4 shadow h-80 flex flex-col">
            <h2 className="text-lg font-semibold text-emerald-900">
              Distribución del impacto
            </h2>
            <p className="text-xs text-emerald-800 mb-2">
              Proporción de los distintos tipos de impacto ambiental.
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
        </div>

        {/* Detalle por usuario/período */}
        <div className="bg-emerald-50/80 rounded-2xl p-4 shadow">
          <h2 className="text-lg font-semibold text-emerald-900 mb-2">
            Detalle de impacto por usuario/período
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-emerald-100">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-emerald-900">
                    Usuario (ID)
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-emerald-900">
                    CO₂ (kg)
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-emerald-900">
                    Agua (L)
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-emerald-900">
                    Energía (kWh)
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-emerald-900">
                    Transacciones
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-emerald-900">
                    Usuarios activos
                  </th>
                </tr>
              </thead>
              <tbody>
                {datos.map((r) => (
                  <tr key={r.id_usuario ?? Math.random()}>
                    <td className="px-3 py-2 border-b border-emerald-100">
                      {r.id_usuario ?? "—"}
                    </td>
                    <td className="px-3 py-2 border-b border-emerald-100">
                      {formatNumber(r.total_co2_ahorrado)}
                    </td>
                    <td className="px-3 py-2 border-b border-emerald-100">
                      {formatNumber(r.total_agua_ahorrada)}
                    </td>
                    <td className="px-3 py-2 border-b border-emerald-100">
                      {formatNumber(r.total_energia_ahorrada)}
                    </td>
                    <td className="px-3 py-2 border-b border-emerald-100">
                      {formatNumber(r.total_transacciones)}
                    </td>
                    <td className="px-3 py-2 border-b border-emerald-100">
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
                      No hay datos para el período seleccionado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
