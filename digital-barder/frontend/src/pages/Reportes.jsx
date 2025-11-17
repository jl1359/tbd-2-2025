import { useEffect, useState } from "react";
import {
  getReporteUsuariosActivos,
  getReporteUsuariosAbandonados,
  getReporteIngresosCreditos,
  getReporteCreditosGeneradosVsConsumidos,
  getReporteIntercambiosCategoria,
  getReportePublicacionesVsIntercambios,
  getReporteImpactoAcumulado,
} from "../services/api";

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function hace30DiasISO() {
  const d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

export default function Reportes() {
  const [desde, setDesde] = useState(hace30DiasISO());
  const [hasta, setHasta] = useState(hoyISO());

  const [usuariosActivos, setUsuariosActivos] = useState([]);
  const [usuariosAbandonados, setUsuariosAbandonados] = useState([]);
  const [ingresos, setIngresos] = useState([]);
  const [credResumen, setCredResumen] = useState(null);
  const [intercambiosCat, setIntercambiosCat] = useState([]);
  const [pubVsInt, setPubVsInt] = useState([]);

  const [impacto, setImpacto] = useState([]);
  const [tipoReporte, setTipoReporte] = useState("2"); // ej: 1=diario, 2=mensual, 3=anual (depende de tu BD)
  const [idPeriodo, setIdPeriodo] = useState("1");     // un periodo de prueba

  const [loading, setLoading] = useState(false);
  const [loadingImpacto, setLoadingImpacto] = useState(false);
  const [error, setError] = useState(null);

  async function cargarReportes() {
    setLoading(true);
    setError(null);
    try {
      const [activos, aband, ing, cgvc, interc, pubInt] = await Promise.all([
        getReporteUsuariosActivos({ desde, hasta }),
        getReporteUsuariosAbandonados({ desde, hasta }),
        getReporteIngresosCreditos({ desde, hasta }),
        getReporteCreditosGeneradosVsConsumidos({ desde, hasta }),
        getReporteIntercambiosCategoria({ desde, hasta }),
        getReportePublicacionesVsIntercambios({ desde, hasta }),
      ]);

      setUsuariosActivos(activos ?? []);
      setUsuariosAbandonados(aband ?? []);
      setIngresos(ing ?? []);
      setCredResumen(cgvc?.[0] ?? null);
      setIntercambiosCat(interc ?? []);
      setPubVsInt(pubInt ?? []);
    } catch (e) {
      console.error(e);
      setError(e.message || "Error cargando reportes");
    } finally {
      setLoading(false);
    }
  }

  async function cargarImpacto() {
    setLoadingImpacto(true);
    setError(null);
    try {
      const rows = await getReporteImpactoAcumulado({
        idTipoReporte: tipoReporte,
        idPeriodo,
      });
      setImpacto(rows ?? []);
    } catch (e) {
      console.error(e);
      setError(e.message || "Error cargando impacto acumulado");
    } finally {
      setLoadingImpacto(false);
    }
  }

  useEffect(() => {
    cargarReportes();
  }, []);

  return (
    <div className="p-4 space-y-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reportes</h1>
          <p className="text-sm text-gray-500">
            Panel de analítica de Créditos Verdes (BD CREDITOS_VERDES2)
          </p>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div className="flex flex-col">
            <label className="text-xs text-gray-500">Desde</label>
            <input
              type="date"
              className="border rounded px-2 py-1 text-sm"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500">Hasta</label>
            <input
              type="date"
              className="border rounded px-2 py-1 text-sm"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
            />
          </div>
          <button
            onClick={cargarReportes}
            className="mt-2 md:mt-0 bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700"
          >
            {loading ? "Cargando..." : "Actualizar reportes"}
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      {/* 1) Usuarios activos */}
      <section className="space-y-2">
        <h2 className="font-semibold">Usuarios activos en el rango</h2>
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 py-1 text-left">Usuario</th>
                <th className="px-2 py-1 text-left">Correo</th>
                <th className="px-2 py-1 text-left">Primera actividad</th>
                <th className="px-2 py-1 text-left">Última actividad</th>
                <th className="px-2 py-1 text-right">Total acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosActivos.map((u) => (
                <tr key={u.id_usuario} className="border-t">
                  <td className="px-2 py-1">{u.nombre}</td>
                  <td className="px-2 py-1">{u.correo}</td>
                  <td className="px-2 py-1">{u.primera_actividad}</td>
                  <td className="px-2 py-1">{u.ultima_actividad}</td>
                  <td className="px-2 py-1 text-right">
                    {u.total_acciones}
                  </td>
                </tr>
              ))}
              {usuariosActivos.length === 0 && (
                <tr>
                  <td className="px-2 py-2 text-center text-gray-400" colSpan={5}>
                    Sin datos para el rango seleccionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 2) Usuarios abandonados */}
      <section className="space-y-2">
        <h2 className="font-semibold">Usuarios abandonados</h2>
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 py-1 text-left">Usuario</th>
                <th className="px-2 py-1 text-left">Correo</th>
                <th className="px-2 py-1 text-left">Estado</th>
              </tr>
            </thead>
            <tbody>
              {usuariosAbandonados.map((u) => (
                <tr key={u.id_usuario} className="border-t">
                  <td className="px-2 py-1">{u.nombre}</td>
                  <td className="px-2 py-1">{u.correo}</td>
                  <td className="px-2 py-1">{u.estado}</td>
                </tr>
              ))}
              {usuariosAbandonados.length === 0 && (
                <tr>
                  <td className="px-2 py-2 text-center text-gray-400" colSpan={3}>
                    Sin usuarios abandonados en el rango.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3) Ingresos por créditos */}
      <section className="space-y-2">
        <h2 className="font-semibold">Ingresos por venta de créditos</h2>
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 py-1 text-left">Fecha</th>
                <th className="px-2 py-1 text-right">Créditos</th>
                <th className="px-2 py-1 text-right">Monto (Bs)</th>
              </tr>
            </thead>
            <tbody>
              {ingresos.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="px-2 py-1">{r.fecha}</td>
                  <td className="px-2 py-1 text-right">
                    {r.total_creditos}
                  </td>
                  <td className="px-2 py-1 text-right">
                    {r.total_bs}
                  </td>
                </tr>
              ))}
              {ingresos.length === 0 && (
                <tr>
                  <td className="px-2 py-2 text-center text-gray-400" colSpan={3}>
                    Sin compras de créditos en el rango.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4) Créditos generados vs consumidos */}
      <section className="space-y-2">
        <h2 className="font-semibold">Créditos generados vs consumidos</h2>
        {credResumen ? (
          <div className="grid gap-3 md:grid-cols-2">
            <div className="border rounded p-3">
              <p className="text-xs text-gray-500">Créditos generados</p>
              <p className="text-2xl font-bold">
                {credResumen.creditos_generados}
              </p>
            </div>
            <div className="border rounded p-3">
              <p className="text-xs text-gray-500">Créditos consumidos</p>
              <p className="text-2xl font-bold">
                {credResumen.creditos_consumidos}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400">
            No hay movimientos de créditos en el rango.
          </p>
        )}
      </section>

      {/* 5) Intercambios por categoría */}
      <section className="space-y-2">
        <h2 className="font-semibold">Intercambios por categoría</h2>
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 py-1 text-left">Categoría</th>
                <th className="px-2 py-1 text-right">Total intercambios</th>
              </tr>
            </thead>
            <tbody>
              {intercambiosCat.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="px-2 py-1">{r.categoria}</td>
                  <td className="px-2 py-1 text-right">
                    {r.total_intercambios}
                  </td>
                </tr>
              ))}
              {intercambiosCat.length === 0 && (
                <tr>
                  <td className="px-2 py-2 text-center text-gray-400" colSpan={2}>
                    Sin intercambios en el rango.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 6) Publicaciones vs intercambios */}
      <section className="space-y-2">
        <h2 className="font-semibold">Publicaciones vs intercambios</h2>
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 py-1 text-left">Categoría</th>
                <th className="px-2 py-1 text-right">Publicaciones</th>
                <th className="px-2 py-1 text-right">Intercambios</th>
                <th className="px-2 py-1 text-right">Ratio</th>
              </tr>
            </thead>
            <tbody>
              {pubVsInt.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="px-2 py-1">{r.categoria}</td>
                  <td className="px-2 py-1 text-right">
                    {r.publicaciones}
                  </td>
                  <td className="px-2 py-1 text-right">
                    {r.intercambios}
                  </td>
                  <td className="px-2 py-1 text-right">
                    {r.ratio_intercambio ?? "-"}
                  </td>
                </tr>
              ))}
              {pubVsInt.length === 0 && (
                <tr>
                  <td className="px-2 py-2 text-center text-gray-400" colSpan={4}>
                    Sin datos para el rango.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 7) Impacto acumulado */}
      <section className="space-y-2">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <h2 className="font-semibold">Impacto acumulado (REPORTE_IMPACTO)</h2>
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="flex flex-col">
              <label className="text-xs text-gray-500">Tipo reporte</label>
              <select
                className="border rounded px-2 py-1 text-sm"
                value={tipoReporte}
                onChange={(e) => setTipoReporte(e.target.value)}
              >
                <option value="1">Diario (ej.)</option>
                <option value="2">Mensual (ej.)</option>
                <option value="3">Anual (ej.)</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-500">ID período</label>
              <input
                type="number"
                className="border rounded px-2 py-1 text-sm w-24"
                value={idPeriodo}
                onChange={(e) => setIdPeriodo(e.target.value)}
              />
            </div>
            <button
              onClick={cargarImpacto}
              className="mt-2 md:mt-0 bg-emerald-600 text-white px-3 py-1.5 rounded text-sm hover:bg-emerald-700"
            >
              {loadingImpacto ? "Cargando..." : "Ver impacto"}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 py-1 text-left">Usuario</th>
                <th className="px-2 py-1 text-right">CO₂ ahorrado</th>
                <th className="px-2 py-1 text-right">Agua ahorrada</th>
                <th className="px-2 py-1 text-right">Energía ahorrada</th>
                <th className="px-2 py-1 text-right">Transacciones</th>
                <th className="px-2 py-1 text-right">Usuarios activos</th>
              </tr>
            </thead>
            <tbody>
              {impacto.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="px-2 py-1">{r.id_usuario}</td>
                  <td className="px-2 py-1 text-right">
                    {r.total_co2_ahorrado}
                  </td>
                  <td className="px-2 py-1 text-right">
                    {r.total_agua_ahorrada}
                  </td>
                  <td className="px-2 py-1 text-right">
                    {r.total_energia_ahorrada}
                  </td>
                  <td className="px-2 py-1 text-right">
                    {r.total_transacciones}
                  </td>
                  <td className="px-2 py-1 text-right">
                    {r.total_usuarios_activos}
                  </td>
                </tr>
              ))}
              {impacto.length === 0 && (
                <tr>
                  <td className="px-2 py-2 text-center text-gray-400" colSpan={6}>
                    Sin datos en REPORTE_IMPACTO para ese tipo/periodo. Asegúrate
                    de haber ejecutado sp_generar_reporte_impacto en la BD.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
