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
import {
  Users,
  Activity as ActivityIcon,
  Leaf,
  Gauge,
  Trophy,
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

export default function ReportesActividadesSostenibles() {
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
      const res = await getReporteActividadesSostenibles({
        desde: customDesde,
        hasta: customHasta,
      });
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
    // Carga inicial con rango por defecto (30 días)
    cargar(desde, hasta);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    setRangoActivo(null); // el usuario eligió fechas manuales
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
    const promedioCreditos = totalUsuarios
      ? totalCreditos / totalUsuarios
      : 0;

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
  const dataBarActividades = useMemo(() => {
    if (!datos.length) return [];
    return [...datos]
      .slice()
      .sort(
        (a, b) =>
          Number(b.total_actividades || 0) -
          Number(a.total_actividades || 0)
      )
      .map((d) => ({
        nombre: d.nombre,
        actividades: Number(d.total_actividades) || 0,
        creditos: Number(d.creditos_otorgados) || 0,
      }));
  }, [datos]);

  const dataPieTop5 = useMemo(() => {
    const top5 = [...datos]
      .slice()
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
  }, [datos]);

  const COLORS = ["#047857", "#0d9488", "#1e3a8a", "#6d28d9", "#0f766e"];

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
                Actividades sostenibles
              </h1>
              <p className="text-sm text-emerald-800/80 mt-1">
                Visualiza qué usuarios generan más impacto, cuántas
                actividades se registran y cuántos créditos se otorgan.
              </p>
            </div>
          </div>

          {/* FILTROS: RANGOS RÁPIDOS + FECHAS */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2 justify-end">
              {RANGOS_RAPIDOS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => aplicarRangoRapido(r)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition ${
                    rangoActivo === r.id
                      ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                      : "bg-white/90 text-emerald-800 border-emerald-200 hover:bg-emerald-50"
                  }`}
                  disabled={loading}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-wrap gap-3 bg-white/90 px-4 py-3 rounded-2xl shadow border border-emerald-100 backdrop-blur-sm"
            >
              <div className="flex flex-col text-xs md:text-sm">
                <label className="font-semibold text-emerald-900 mb-0.5">
                  Desde
                </label>
                <input
                  type="date"
                  value={desde}
                  onChange={(e) => setDesde(e.target.value)}
                  className="border border-emerald-200 rounded-lg px-2 py-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/60 focus:border-emerald-400 text-xs md:text-sm"
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
                  className="border border-emerald-200 rounded-lg px-2 py-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/60 focus:border-emerald-400 text-xs md:text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="self-end md:self-center bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl font-semibold text-xs md:text-sm shadow-md flex items-center gap-2"
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

        {/* RANGO ACTUAL */}
        <div className="flex items-center justify-between gap-2 text-xs text-emerald-900/70">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
            <Leaf className="w-3 h-3" />
            <span>Rango analizado:</span>
            <span className="font-semibold">{rangoLabel}</span>
          </span>
          {!sinDatos && !loading && (
            <span className="hidden sm:inline text-[11px]">
              {datos.length} usuario(s) con al menos una actividad registrada.
            </span>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded-xl shadow-sm text-sm">
            {error}
          </div>
        )}

        {/* MÉTRICAS */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Usuarios */}
          <div className="bg-white shadow-sm border border-emerald-100 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-emerald-900/80 uppercase tracking-wide">
                Usuarios con actividades
              </p>
              <Users className="w-4 h-4 text-emerald-700/80" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-emerald-900">
              {metrics.totalUsuarios}
            </p>
            <p className="mt-1 text-[11px] text-emerald-900/70">
              Personas que reportaron al menos una actividad.
            </p>
          </div>

          {/* Actividades */}
          <div className="bg-white shadow-sm border border-emerald-100 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-emerald-900/80 uppercase tracking-wide">
                Total de actividades
              </p>
              <ActivityIcon className="w-4 h-4 text-emerald-700/80" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-emerald-900">
              {metrics.totalActividades}
            </p>
            <p className="mt-1 text-[11px] text-emerald-900/70">
              Suma de actividades sostenibles registradas.
            </p>
          </div>

          {/* Créditos otorgados */}
          <div className="bg-white shadow-sm border border-emerald-100 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-emerald-900/80 uppercase tracking-wide">
                Créditos otorgados
              </p>
              <Leaf className="w-4 h-4 text-emerald-700/80" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-emerald-900">
              {metrics.totalCreditos}
            </p>
            <p className="mt-1 text-[11px] text-emerald-900/70">
              Total de créditos verdes entregados.
            </p>
          </div>

          {/* Promedio por usuario */}
          <div className="bg-white shadow-sm border border-emerald-100 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-emerald-900/80 uppercase tracking-wide">
                Promedio por usuario
              </p>
              <Gauge className="w-4 h-4 text-emerald-700/80" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-emerald-900">
              {metrics.promedioCreditos.toFixed(1)}
            </p>
            <p className="mt-1 text-[11px] text-emerald-900/70">
              Créditos otorgados en promedio por usuario.
            </p>
          </div>

          {/* TOP USUARIO */}
          <div className="bg-emerald-900 text-emerald-50 rounded-2xl p-4 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-8 -top-8 opacity-10">
              <Trophy className="w-20 h-20" />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-100/90">
              Usuario destacado
            </p>
            {metrics.topUsuario ? (
              <>
                <p className="mt-1 text-sm font-semibold relative z-10">
                  {metrics.topUsuario.nombre}
                </p>
                <p className="text-xs text-emerald-100/80 relative z-10">
                  {metrics.topUsuario.correo}
                </p>
                <p className="mt-2 text-xs relative z-10">
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
              <div>
                <h2 className="text-base font-bold text-emerald-900">
                  Actividades y créditos por usuario
                </h2>
                <p className="text-[11px] text-emerald-900/70">
                  Usuarios más activos en el periodo, comparando actividades y
                  créditos obtenidos.
                </p>
              </div>
              <span className="text-[11px] text-emerald-700/70 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                Top {Math.min(dataBarActividades.length || 0, 10)} usuarios
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
                    <Legend />
                    <Bar
                      dataKey="actividades"
                      name="Actividades"
                      fill="#047857"
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar
                      dataKey="creditos"
                      name="Créditos"
                      fill="#0d9488"
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
              <div>
                <h2 className="text-base font-bold text-emerald-900">
                  Top 5 por créditos otorgados
                </h2>
                <p className="text-[11px] text-emerald-900/70">
                  Distribución de créditos entre los usuarios más destacados.
                </p>
              </div>
              <span className="text-[11px] text-emerald-700/70 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
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
            <div>
              <h2 className="font-semibold text-emerald-900 text-sm">
                Detalle de actividades por usuario
              </h2>
              <p className="text-[11px] text-emerald-900/70">
                Listado completo de usuarios que registraron actividades
                sostenibles.
              </p>
            </div>
            <span className="text-[11px] text-emerald-800/70 bg-white px-2 py-0.5 rounded-full border border-emerald-100">
              {datos.length} registro(s)
            </span>
          </div>

          {sinDatos ? (
            <div className="px-4 py-6 text-sm text-gray-500">
              No hay registros de actividades sostenibles para el rango
              seleccionado. Ajusta las fechas para ver más información.
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[420px]">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700 text-xs">
                      Usuario
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700 text-xs">
                      Correo
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-700 text-xs">
                      Actividades
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-700 text-xs">
                      Créditos otorgados
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {datos.map((a, i) => (
                    <tr
                      key={i}
                      className={`${
                        i % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                      } hover:bg-emerald-50/70 transition-colors`}
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
