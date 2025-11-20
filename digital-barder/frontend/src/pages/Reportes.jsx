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

/* Utilidades */
function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function hace30DiasISO() {
  const d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

export default function Reportes() {
  /* Estados */
  const [desde, setDesde] = useState(hace30DiasISO());
  const [hasta, setHasta] = useState(hoyISO());

  const [usuariosActivos, setUsuariosActivos] = useState([]);
  const [usuariosAbandonados, setUsuariosAbandonados] = useState([]);
  const [ingresos, setIngresos] = useState([]);
  const [intercambiosCat, setIntercambiosCat] = useState([]);
  const [pubVsInt, setPubVsInt] = useState([]);
  const [credResumen, setCredResumen] = useState(null);

  const [impacto, setImpacto] = useState([]);
  // Según tu BD: 1 = MENSUAL, 2 = DIARIO, 3 = ANUAL
  const [tipoReporte, setTipoReporte] = useState("1");
  const [idPeriodo, setIdPeriodo] = useState("1");

  const [loading, setLoading] = useState(false);
  const [loadingImpacto, setLoadingImpacto] = useState(false);
  const [error, setError] = useState("");

  /* ----------------------------------------------------
     Cargar los reportes principales
     ---------------------------------------------------- */
  async function cargarReportes() {
    try {
      setLoading(true);
      setError("");

      const [activos, aband, ing, cgvc, interc, pubInt] = await Promise.all([
        getReporteUsuariosActivos({ desde, hasta }),
        getReporteUsuariosAbandonados({ desde, hasta }),
        getReporteIngresosCreditos({ desde, hasta }),
        getReporteCreditosGeneradosVsConsumidos({ desde, hasta }),
        getReporteIntercambiosCategoria({ desde, hasta }),
        getReportePublicacionesVsIntercambios({ desde, hasta }),
      ]);

      setUsuariosActivos(Array.isArray(activos) ? activos : []);
      setUsuariosAbandonados(Array.isArray(aband) ? aband : []);
      setIngresos(Array.isArray(ing) ? ing : []);
      setIntercambiosCat(Array.isArray(interc) ? interc : []);
      setPubVsInt(Array.isArray(pubInt) ? pubInt : []);

      setCredResumen(cgvc || null);
    } catch (e) {
      console.error(e);
      setError("Error cargando reportes");
      setUsuariosActivos([]);
      setUsuariosAbandonados([]);
      setIngresos([]);
      setIntercambiosCat([]);
      setPubVsInt([]);
      setCredResumen(null);
    } finally {
      setLoading(false);
    }
  }

  /* ----------------------------------------------------
     Cargar impacto acumulado
     ---------------------------------------------------- */
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
      setError("Error cargando impacto acumulado");
      setImpacto([]);
    } finally {
      setLoadingImpacto(false);
    }
  }

  function onSubmitRango(e) {
    e.preventDefault();
    cargarReportes();
  }

  useEffect(() => {
    cargarReportes();
  }, []);

  return (
    <div className="p-4 space-y-8">
      {/* ---------------------------------------------
          HEADER
         --------------------------------------------- */}
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reportes</h1>
          <p className="text-sm text-gray-500">
            Panel de analítica de Créditos Verdes (BD CREDITOS_VERDES2)
          </p>
        </div>

        <form
          onSubmit={onSubmitRango}
          className="flex flex-wrap gap-2 items-end"
        >
          <div className="flex flex-col text-sm">
            <label className="mb-1 font-medium">Desde</label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>

          <div className="flex flex-col text-sm">
            <label className="mb-1 font-medium">Hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm"
          >
            {loading ? "Cargando…" : "Actualizar"}
          </button>
        </form>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded">
          {error}
        </div>
      )}

      {/* ---------------------------------------------
          1) USUARIOS ACTIVOS Y ABANDONADOS
         --------------------------------------------- */}
      <section className="space-y-2">
        <h2 className="font-semibold">Usuarios activos y abandonados</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* USUARIOS ACTIVOS */}
          <div className="border rounded p-3 text-sm">
            <h3 className="font-medium mb-2">
              Usuarios activos ({usuariosActivos.length})
            </h3>

            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-1 text-left">Usuario</th>
                    <th className="px-2 py-1 text-left">Correo</th>
                    <th className="px-2 py-1 text-right">
                      Primera actividad
                    </th>
                    <th className="px-2 py-1 text-right">
                      Última actividad
                    </th>
                    <th className="px-2 py-1 text-right">Total acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {usuariosActivos.map((u, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-2 py-1">{u.nombre}</td>
                      <td className="px-2 py-1">{u.correo}</td>
                      <td className="px-2 py-1 text-right">
                        {u.primera_actividad || "-"}
                      </td>
                      <td className="px-2 py-1 text-right">
                        {u.ultima_actividad || "-"}
                      </td>
                      <td className="px-2 py-1 text-right">
                        {u.total_acciones}
                      </td>
                    </tr>
                  ))}

                  {usuariosActivos.length === 0 && (
                    <tr>
                      <td
                        className="px-2 py-2 text-center text-gray-400"
                        colSpan={5}
                      >
                        Sin datos para el rango seleccionado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* USUARIOS ABANDONADOS */}
          <div className="border rounded p-3 text-sm">
            <h3 className="font-medium mb-2">
              Usuarios abandonados ({usuariosAbandonados.length})
            </h3>

            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-1 text-left">Usuario</th>
                    <th className="px-2 py-1 text-left">Correo</th>
                    <th className="px-2 py-1 text-right">Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {usuariosAbandonados.map((u, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-2 py-1">{u.nombre}</td>
                      <td className="px-2 py-1">{u.correo}</td>
                      <td className="px-2 py-1 text-right">{u.estado}</td>
                    </tr>
                  ))}

                  {usuariosAbandonados.length === 0 && (
                    <tr>
                      <td
                        className="px-2 py-2 text-center text-gray-400"
                        colSpan={3}
                      >
                        Sin datos para el rango seleccionado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------
          2) INGRESOS POR VENTA DE CRÉDITOS
         --------------------------------------------- */}
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
                  <td className="px-2 py-1 text-right">{r.total_creditos}</td>
                  <td className="px-2 py-1 text-right">{r.total_bs}</td>
                </tr>
              ))}

              {ingresos.length === 0 && (
                <tr>
                  <td
                    className="px-2 py-2 text-center text-gray-400"
                    colSpan={3}
                  >
                    Sin compras de créditos en el rango.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------------------------------------------
          3) CRÉDITOS GENERADOS VS CONSUMIDOS
         --------------------------------------------- */}
      <section className="space-y-2">
        <h2 className="font-semibold">Créditos generados vs consumidos</h2>

        <div className="border rounded p-3 text-sm">
          {credResumen ? (
            <ul className="space-y-1">
              <li>
                <span className="font-semibold">Créditos generados:</span>{" "}
                {credResumen.creditos_generados}
              </li>

              <li>
                <span className="font-semibold">Créditos consumidos:</span>{" "}
                {credResumen.creditos_consumidos}
              </li>

              <li>
                <span className="font-semibold">Saldo neto:</span>{" "}
                {credResumen.saldo_neto}
              </li>
            </ul>
          ) : (
            <p className="text-gray-500">
              Sin datos de créditos generados/consumidos para el rango.
            </p>
          )}
        </div>
      </section>

      {/* ---------------------------------------------
          4) INTERCAMBIOS POR CATEGORÍA
         --------------------------------------------- */}
      <section className="space-y-2">
        <h2 className="font-semibold">Intercambios por categoría</h2>

        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 py-1 text-left">Categoría</th>
                <th className="px-2 py-1 text-right">Intercambios</th>
              </tr>
            </thead>

            <tbody>
              {intercambiosCat.map((c, i) => (
                <tr key={i} className="border-t">
                  <td className="px-2 py-1">{c.categoria}</td>
                  <td className="px-2 py-1 text-right">
                    {c.total_intercambios}
                  </td>
                </tr>
              ))}

              {intercambiosCat.length === 0 && (
                <tr>
                  <td
                    className="px-2 py-2 text-center text-gray-400"
                    colSpan={2}
                  >
                    No hay intercambios en el rango.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------------------------------------------
          5) PUBLICACIONES VS INTERCAMBIOS
         --------------------------------------------- */}
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
              {pubVsInt.map((p, i) => (
                <tr key={i} className="border-t">
                  <td className="px-2 py-1">{p.categoria}</td>
                  <td className="px-2 py-1 text-right">{p.publicaciones}</td>
                  <td className="px-2 py-1 text-right">{p.intercambios}</td>
                  <td className="px-2 py-1 text-right">
                    {p.ratio_intercambio ?? "-"}
                  </td>
                </tr>
              ))}

              {pubVsInt.length === 0 && (
                <tr>
                  <td
                    className="px-2 py-2 text-center text-gray-400"
                    colSpan={4}
                  >
                    Sin datos de publicaciones vs intercambios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------------------------------------------
          6) IMPACTO AMBIENTAL ACUMULADO
         --------------------------------------------- */}
      <section className="space-y-2">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h2 className="font-semibold">Impacto ambiental acumulado</h2>
          </div>

          <div className="flex flex-wrap gap-2 items-end text-sm">
            <div className="flex flex-col">
              <label className="mb-1 font-medium">Tipo</label>
              <select
                value={tipoReporte}
                onChange={(e) => setTipoReporte(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="1">Mensual</option>
                <option value="2">Diario</option>
                <option value="3">Anual</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="mb-1 font-medium">ID período</label>
              <input
                type="number"
                min="1"
                value={idPeriodo}
                onChange={(e) => setIdPeriodo(e.target.value)}
                className="border rounded px-2 py-1 text-sm w-24"
              />
            </div>

            <button
              type="button"
              onClick={cargarImpacto}
              className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm"
            >
              {loadingImpacto ? "Cargando…" : "Actualizar"}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 py-1 text-left">Usuario (ID)</th>
                <th className="px-2 py-1 text-right">CO₂ (kg)</th>
                <th className="px-2 py-1 text-right">Agua (L)</th>
                <th className="px-2 py-1 text-right">Energía (kWh)</th>
                <th className="px-2 py-1 text-right">Transacciones</th>
                <th className="px-2 py-1 text-right">Usuarios activos</th>
              </tr>
            </thead>

            <tbody>
              {impacto.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="px-2 py-1">{r.id_usuario ?? "GLOBAL"}</td>
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
                  <td
                    className="px-2 py-2 text-center text-gray-400"
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
  );
}

