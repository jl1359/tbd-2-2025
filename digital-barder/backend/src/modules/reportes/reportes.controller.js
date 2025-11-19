// src/modules/reportes/reportes.controller.js
import { prisma } from '../../config/prisma.js'

/* ---------------------------------------------
   Helper: BigInt -> Number
--------------------------------------------- */
function toPlain(value) {
  if (Array.isArray(value)) return value.map(toPlain)
  if (value && typeof value === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(value)) {
      out[k] = toPlain(v)
    }
    return out
  }
  return typeof value === 'bigint' ? Number(value) : value
}

/* ---------------------------------------------
   Normaliza el resultado de CALL:
   - Puede venir como [ [rows] ] o como [rows] o como objeto suelto
--------------------------------------------- */
function normalizeResult(raw) {
  if (!raw) return []

  if (Array.isArray(raw)) {
    // Caso CALL MySQL clásico: [ [rows], [meta] ]
    if (raw.length > 0 && Array.isArray(raw[0])) return raw[0]
    // Ya es array de filas
    return raw
  }

  if (typeof raw === 'object') {
    // Objeto suelto -> lo envolvemos en array
    return [raw]
  }

  return []
}

/* ---------------------------------------------
   Rango de fechas por defecto: últimos 30 días
--------------------------------------------- */
function getRangoFechas(req) {
  const { desde, hasta } = req.query

  const ahora = new Date()
  const defaultHasta = ahora.toISOString().slice(0, 19).replace('T', ' ')
  const defaultDesdeDate = new Date(
    ahora.getTime() - 30 * 24 * 60 * 60 * 1000
  )
  const defaultDesde = defaultDesdeDate
    .toISOString()
    .slice(0, 19)
    .replace('T', ' ')

  return {
    desde: desde ? `${desde} 00:00:00` : defaultDesde,
    hasta: hasta ? `${hasta} 23:59:59` : defaultHasta,
  }
}

/* ---------------------------------------------
   Helpers de mapeo: convierten f0, f1, ... a nombres
--------------------------------------------- */

function mapUsuarioActivo(r) {
  return {
    id_usuario: r.id_usuario ?? r.f0 ?? null,
    nombre: r.nombre ?? r.f1 ?? null,
    correo: r.correo ?? r.f2 ?? null,
    ultimo_login: r.ultimo_login ?? r.f3 ?? null,
    creditos_disponibles: r.creditos_disponibles ?? r.f4 ?? null,
    total_intercambios: r.total_intercambios ?? r.f5 ?? null,
  }
}

function mapUsuarioAbandonado(r) {
  return {
    id_usuario: r.id_usuario ?? r.f0 ?? null,
    nombre: r.nombre ?? r.f1 ?? null,
    correo: r.correo ?? r.f2 ?? null,
    ultima_actividad: r.ultima_actividad ?? r.f3 ?? null,
    creditos_disponibles: r.creditos_disponibles ?? r.f4 ?? null,
  }
}

function mapIngresoCreditos(r) {
  return {
    fecha: r.fecha ?? r.f0 ?? null,
    total_creditos: r.total_creditos ?? r.f1 ?? null,
    total_bs: r.total_bs ?? r.f2 ?? null,
  }
}

function mapIntercambiosCategoria(r) {
  return {
    categoria: r.categoria ?? r.f0 ?? null,
    total_intercambios: r.total_intercambios ?? r.f1 ?? null,
  }
}

function mapPublicacionesVsIntercambios(r) {
  return {
    categoria: r.categoria ?? r.f0 ?? null,
    publicaciones: r.publicaciones ?? r.f1 ?? null,
    intercambios: r.intercambios ?? r.f2 ?? null,
    ratio_intercambio: r.ratio_intercambio ?? r.f3 ?? null,
  }
}

function mapImpacto(r) {
  return {
    id_usuario: r.id_usuario ?? r.f0 ?? null,
    total_co2_ahorrado: r.total_co2_ahorrado ?? r.f1 ?? null,
    total_agua_ahorrada: r.total_agua_ahorrada ?? r.f2 ?? null,
    total_energia_ahorrada: r.total_energia_ahorrada ?? r.f3 ?? null,
    total_transacciones: r.total_transacciones ?? r.f4 ?? null,
    total_usuarios_activos: r.total_usuarios_activos ?? r.f5 ?? null,
  }
}

/* =============================================
   CONTROLADORES
============================================= */

/* C1) Usuarios activos en el rango */
export async function getUsuariosActivos(req, res, next) {
  try {
    const { desde, hasta } = getRangoFechas(req)
    const raw = await prisma.$queryRawUnsafe(
      'CALL sp_rep_usuarios_activos(?, ?)',
      desde,
      hasta
    )
    const rows = normalizeResult(raw).map(mapUsuarioActivo)
    res.json(toPlain(rows))
  } catch (err) {
    next(err)
  }
}

/* C2) Usuarios abandonados en el rango */
export async function getUsuariosAbandonados(req, res, next) {
  try {
    const { desde, hasta } = getRangoFechas(req)
    const raw = await prisma.$queryRawUnsafe(
      'CALL sp_rep_usuarios_abandonados(?, ?)',
      desde,
      hasta
    )
    const rows = normalizeResult(raw).map(mapUsuarioAbandonado)
    res.json(toPlain(rows))
  } catch (err) {
    next(err)
  }
}

/* C3) Ingresos por venta de créditos */
export async function getIngresosCreditos(req, res, next) {
  try {
    const { desde, hasta } = getRangoFechas(req)
    const raw = await prisma.$queryRawUnsafe(
      'CALL sp_rep_ingresos_creditos(?, ?)',
      desde,
      hasta
    )
    const rows = normalizeResult(raw).map(mapIngresoCreditos)
    res.json(toPlain(rows))
  } catch (err) {
    next(err)
  }
}

/* C4) Créditos generados vs consumidos */
export async function getCreditosGeneradosVsConsumidos(req, res, next) {
  try {
    const { desde, hasta } = getRangoFechas(req)
    const raw = await prisma.$queryRawUnsafe(
      'CALL sp_rep_creditos_generados_vs_consumidos(?, ?)',
      desde,
      hasta
    )

    const rows = normalizeResult(raw)
    const base = rows[0] || {}

    const creditos_generados =
      base.creditos_generados ?? base.f0 ?? 0
    const creditos_consumidos =
      base.creditos_consumidos ?? base.f1 ?? 0

    const resumen = {
      creditos_generados: Number(creditos_generados ?? 0),
      creditos_consumidos: Number(creditos_consumidos ?? 0),
      saldo_neto:
        Number(creditos_generados ?? 0) -
        Number(creditos_consumidos ?? 0),
    }

    res.json(toPlain(resumen))
  } catch (err) {
    next(err)
  }
}

/* C5) Intercambios por categoría */
export async function getIntercambiosPorCategoria(req, res, next) {
  try {
    const { desde, hasta } = getRangoFechas(req)
    const raw = await prisma.$queryRawUnsafe(
      'CALL sp_rep_intercambios_por_categoria(?, ?)',
      desde,
      hasta
    )
    const rows = normalizeResult(raw).map(mapIntercambiosCategoria)
    res.json(toPlain(rows))
  } catch (err) {
    next(err)
  }
}

/* C6) Publicaciones vs intercambios por categoría */
export async function getPublicacionesVsIntercambios(req, res, next) {
  try {
    const { desde, hasta } = getRangoFechas(req)
    const raw = await prisma.$queryRawUnsafe(
      'CALL sp_rep_publicaciones_vs_intercambios(?, ?)',
      desde,
      hasta
    )
    const rows = normalizeResult(raw).map(mapPublicacionesVsIntercambios)
    res.json(toPlain(rows))
  } catch (err) {
    next(err)
  }
}

/* C7) Impacto ambiental acumulado (usa TIPO_REPORTE + PERIODO) */
export async function getImpactoAcumulado(req, res, next) {
  try {
    let { idTipoReporte, idPeriodo } = req.query

    if (!idTipoReporte || !idPeriodo) {
      return res.status(400).json({
        ok: false,
        message: 'idTipoReporte e idPeriodo son requeridos',
      })
    }

    idTipoReporte = Number(idTipoReporte)
    idPeriodo = Number(idPeriodo)

    const raw = await prisma.$queryRawUnsafe(
      'CALL sp_rep_impacto_acumulado(?, ?)',
      idTipoReporte,
      idPeriodo
    )

    const rows = normalizeResult(raw).map(mapImpacto)
    res.json(toPlain(rows))
  } catch (err) {
    next(err)
  }
}
