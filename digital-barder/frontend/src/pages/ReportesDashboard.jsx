import { useEffect, useState, useMemo } from "react";
import {
  getReporteUsuariosActivos,
  getReporteIngresosCreditos,
  getReporteCreditosGeneradosVsConsumidos,
  getReporteIntercambiosCategoria,
  getReportePublicacionesVsIntercambios,
  getReporteImpactoAcumulado,
} from "../services/api";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

/* Utilidades */
function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function hace30DiasISO() {
  const d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

const nf = new Intl.NumberFormat("es-BO");

export default function ReportesDashboard() {
  const [desde, setDesde] = useState(hace30DiasISO());
  const [hasta, setHasta] = useState(hoyISO());

  const [usuariosActivos, setUsuariosActivos] = useState([]);
  const [ingresos, setIngresos] = useState([]);
  const [intercambiosCat, setIntercambiosCat] = useState([]);
  const [pubVsInt, setPubVsInt] = useState([]);
  const [credResumen, setCredResumen] = useState(null);
  const [impacto, setImpacto] = useState([]);

  const [tipoReporte, setTipoReporte] = useState("2"); // mensual
  const [idPeriodo, setIdPeriodo] = useState("1");

  const [loading, setLoading] = useState(false);
  const [loadingImpacto, setLoadingImpacto] = useState(false);
  const [error, setError] = useState("");

  /* ====
     Carga de datos
     ==== */

  async function cargarDatosBasicos() {
    try {
      setLoading(true);
      setError("");

      const [activos, ing, cgvc, interc, pubInt] = await Promise.all([
        getReporteUsuariosActivos({ desde, hasta }),
        getReporteIngresosCreditos({ desde, hasta }),
        getReporteCreditosGeneradosVsConsumidos({ desde, hasta }),
        getReporteIntercambiosCategoria({ desde, hasta }),
        getReportePublicacionesVsIntercambios({ desde, hasta }),
      ]);

      setUsuariosActivos(Array.isArray(activos) ? activos : []);
      setIngresos(Array.isArray(ing) ? ing : []);
      setIntercambiosCat(Array.isArray(interc) ? interc : []);
      setPubVsInt(Array.isArray(pubInt) ? pubInt : []);
      setCredResumen(cgvc || null);
    } catch (e) {
      console.error(e);
      setError("Error cargando datos de reportes");
      setUsuariosActivos([]);
      setIngresos([]);
      setIntercambiosCat([]);
      setPubVsInt([]);
      setCredResumen(null);
    } finally {
      setLoading(false);
    }
  }

  async function cargarImpacto() {
    try {
      setLoadingImpacto(true);
      setError("");

      const datos = await getReporteImpactoAcumulado({
        idTipoReporte: tipoReporte,
        idPeriodo,
      });

      setImpacto(Array.isArray(datos) ? datos : []);
    } catch (e) {
      console.error(e);
      setError("Error cargando impacto ambiental");
      setImpacto([]);
    } finally {
      setLoadingImpacto(false);
    }
  }

  function onSubmitRango(e) {
    e.preventDefault();
    cargarDatosBasicos();
  }

  useEffect(() => {
    cargarDatosBasicos();
  }, []);

  /* ====
     Datos preparados para gráficos
     ==== */

  // Ingresos por día
  const ingresosChartData = useMemo(
    () =>
      ingresos.map((r) => ({
        fecha: r.fecha?.slice(0, 10) || "",
        total_bs: Number(r.total_bs ?? 0),
        total_creditos: Number(r.total_creditos ?? 0),
      })),
    [ingresos]
  );

  // Intercambios por categoría
  const intercambiosChartData = useMemo(
    () =>
      intercambiosCat.map((c) => ({
        categoria: c.categoria,
        total_intercambios: Number(c.total_intercambios ?? 0),
      })),
    [intercambiosCat]
  );

  // Publicaciones vs intercambios
  const pubVsIntChartData = useMemo(
    () =>
      pubVsInt.map((p) => ({
        categoria: p.categoria,
        publicaciones: Number(p.publicaciones ?? 0),
        intercambios: Number(p.intercambios ?? 0),
      })),
    [pubVsInt]
  );

  // Créditos generados/consumidos/saldo
  const credChartData = useMemo(() => {
    if (!credResumen) return [];
    return [
      {
        nombre: "Generados",
        valor: Number(credResumen.creditos_generados ?? 0),
      },
      {
        nombre: "Consumidos",
        valor: Number(credResumen.creditos_consumidos ?? 0),
      },
      {
        nombre: "Saldo neto",
        valor: Number(credResumen.saldo_neto ?? 0),
      },
    ];
  }, [credResumen]);

  // Impacto ambiental por usuario
  const impactoChartData = useMemo(
    () =>
      impacto.map((r) => ({
        usuario: r.id_usuario ?? "GLOBAL",
        co2: Number(r.total_co2_ahorrado ?? 0),
        agua: Number(r.total_agua_ahorrada ?? 0),
        energia: Number(r.total_energia_ahorrada ?? 0),
      })),
    [impacto]
  );

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 lg:px-8">
      {/* HEADER */}
      <header className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Dashboard de reportes
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Actividad del sistema, créditos e impacto ambiental.
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Rango seleccionado:{" "}
            <span className="font-medium text-slate-600">{desde}</span> –{" "}
            <span className="font-medium text-slate-600">{hasta}</span>
          </p>
        </div>

        <form
          onSubmit={onSubmitRango}
          className="flex flex-wrap items-end gap-3 rounded-lg bg-white px-4 py-3 shadow-sm"
        >
          <div className="flex flex-col text-xs">
            <label className="mb-1 font-medium text-slate-600">Desde</label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="rounded-md border border-slate-300 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-col text-xs">
            <label className="mb-1 font-medium text-slate-600">Hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="rounded-md border border-slate-300 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
          >
            {loading ? "Cargando…" : "Actualizar datos"}
          </button>
        </form>
      </header>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* 1) RESUMEN RÁPIDO */}
      <section className="mb-6 space-y-2">
        <h2 className="text-sm font-semibold text-slate-800">
          Resumen general
        </h2>
        <div className="grid gap-4 text-sm md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Usuarios activos
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {nf.format(usuariosActivos.length)}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Usuarios con actividad en el rango.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Días con ingresos
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {nf.format(ingresosChartData.length)}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Días con ventas de créditos registradas.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Categorías con intercambios
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {nf.format(intercambiosChartData.length)}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Categorías en las que hubo al menos un intercambio.
            </p>
          </div>
        </div>
      </section>

      {/* 2) INGRESOS POR DÍA */}
      <section className="mb-6 space-y-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">
            Ingresos por venta de créditos
          </h2>
          <p className="text-xs text-slate-500">
            Monto total diario en bolivianos.
          </p>
        </div>

        <div className="h-80 w-full rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          {ingresosChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ingresosChartData}
                margin={{ top: 12, right: 16, left: 0, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="fecha"
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  tickLine={false}
                />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="total_bs"
                  name="Monto (Bs)"
                  fill="#22c55e"
                  radius={[6, 6, 0, 0]}
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
              Sin datos de ingresos en el rango.
            </div>
          )}
        </div>
      </section>

      {/* 3) CRÉDITOS GENERADOS / CONSUMIDOS */}
      <section className="mb-6 space-y-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">
            Créditos generados vs consumidos
          </h2>
          <p className="text-xs text-slate-500">
            Resumen global de créditos y saldo neto.
          </p>
        </div>

        <div className="h-80 w-full rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          {credChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={credChartData}
                margin={{ top: 12, right: 16, left: 0, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="nombre"
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  tickLine={false}
                />
                <Tooltip />
                <Bar
                  dataKey="valor"
                  name="Créditos"
                  fill="#22c55e"
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
              Sin datos de créditos para el rango.
            </div>
          )}
        </div>
      </section>

      {/* 4) INTERCAMBIOS POR CATEGORÍA */}
      <section className="mb-6 space-y-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">
            Intercambios por categoría
          </h2>
          <p className="text-xs text-slate-500">
            Total de intercambios registrados por categoría.
          </p>
        </div>

        <div className="h-80 w-full rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          {intercambiosChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={intercambiosChartData}
                margin={{ top: 12, right: 16, left: 0, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="categoria"
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                  tickLine={false}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  tickLine={false}
                />
                <Tooltip />
                <Bar
                  dataKey="total_intercambios"
                  name="Intercambios"
                  fill="#22c55e"
                  radius={[6, 6, 0, 0]}
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
              No hay intercambios en el rango.
            </div>
          )}
        </div>
      </section>

      {/* 5) PUBLICACIONES VS INTERCAMBIOS */}
      <section className="mb-6 space-y-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">
            Publicaciones vs intercambios
          </h2>
          <p className="text-xs text-slate-500">
            Comparación por categoría entre publicaciones e intercambios.
          </p>
        </div>

        <div className="h-80 w-full rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          {pubVsIntChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={pubVsIntChartData}
                margin={{ top: 12, right: 16, left: 0, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="categoria"
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                  tickLine={false}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  tickLine={false}
                />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="publicaciones"
                  name="Publicaciones"
                  fill="#22c55e"
                  radius={[6, 6, 0, 0]}
                  barSize={26}
                />
                <Bar
                  dataKey="intercambios"
                  name="Intercambios"
                  fill="#16a34a"
                  radius={[6, 6, 0, 0]}
                  barSize={26}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
              Sin datos de publicaciones/intercambios.
            </div>
          )}
        </div>
      </section>

      {/* 6) IMPACTO AMBIENTAL */}
      <section className="mb-2 space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              Impacto ambiental acumulado
            </h2>
            <p className="text-xs text-slate-500">
              CO₂ ahorrado por usuario según el período seleccionado.
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-3 rounded-lg bg-white px-4 py-3 text-sm shadow-sm">
            <div className="flex flex-col">
              <label className="mb-1 text-xs font-medium text-slate-600">
                Tipo de período
              </label>
              <select
                value={tipoReporte}
                onChange={(e) => setTipoReporte(e.target.value)}
                className="w-32 rounded-md border border-slate-300 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="1">Diario</option>
                <option value="2">Mensual</option>
                <option value="3">Anual</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="mb-1 text-xs font-medium text-slate-600">
                ID período
              </label>
              <input
                type="number"
                min="1"
                value={idPeriodo}
                onChange={(e) => setIdPeriodo(e.target.value)}
                className="w-24 rounded-md border border-slate-300 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <button
              type="button"
              onClick={cargarImpacto}
              className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
            >
              {loadingImpacto ? "Cargando…" : "Actualizar"}
            </button>
          </div>
        </div>

        <div className="h-80 w-full rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          {impactoChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={impactoChartData}
                margin={{ top: 12, right: 16, left: 0, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="usuario"
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  tickLine={false}
                />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="co2"
                  name="CO₂ (kg)"
                  fill="#22c55e"
                  radius={[6, 6, 0, 0]}
                  barSize={30}
                />
                {/* Si luego quieres mostrar agua/energía:
                <Bar dataKey="agua" name="Agua (L)" fill="#0ea5e9" radius={[6,6,0,0]} />
                <Bar dataKey="energia" name="Energía (kWh)" fill="#eab308" radius={[6,6,0,0]} />
                */}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
              Sin datos de impacto para ese período.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
