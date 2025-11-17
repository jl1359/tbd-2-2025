// src/modules/reportes/reportes.controller.js
import { prisma } from '../../config/prisma.js'

// Rango de fechas por defecto: últimos 30 días
function getRangoFechas(req) {
  const { desde, hasta } = req.query

  const ahora = new Date()
  const defaultHasta = ahora.toISOString().slice(0, 19).replace('T', ' ')
  const defaultDesdeDate = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000)
  const defaultDesde = defaultDesdeDate.toISOString().slice(0, 19).replace('T', ' ')

  return {
    desde: desde ? `${desde} 00:00:00` : defaultDesde,
    hasta: hasta ? `${hasta} 23:59:59` : defaultHasta,
  }
}

// C1) Usuarios activos
export async function getUsuariosActivos(req, res, next) {
  try {
    const { desde, hasta } = getRangoFechas(req)
    const result = await prisma.$queryRawUnsafe(
      'CALL sp_rep_usuarios_activos(?, ?)',
      desde,
      hasta
    )
    const rows = Array.isArray(result) ? result[0] : result
    res.json(rows)
  } catch (err) {
    next(err)
  }
}

// C2) Usuarios abandonados
export async function getUsuariosAbandonados(req, res, next) {
  try {
    const { desde, hasta } = getRangoFechas(req)
    const result = await prisma.$queryRawUnsafe(
      'CALL sp_rep_usuarios_abandonados(?, ?)',
      desde,
      hasta
    )
    const rows = Array.isArray(result) ? result[0] : result
    res.json(rows)
  } catch (err) {
    next(err)
  }
}

// C3) Ingresos por venta de créditos
export async function getIngresosCreditos(req, res, next) {
  try {
    const { desde, hasta } = getRangoFechas(req)
    const result = await prisma.$queryRawUnsafe(
      'CALL sp_rep_ingresos_creditos(?, ?)',
      desde,
      hasta
    )
    const rows = Array.isArray(result) ? result[0] : result
    res.json(rows)
  } catch (err) {
    next(err)
  }
}

// C4) Créditos generados vs consumidos
export async function getCreditosGeneradosVsConsumidos(req, res, next) {
  try {
    const { desde, hasta } = getRangoFechas(req)
    const result = await prisma.$queryRawUnsafe(
      'CALL sp_rep_creditos_generados_vs_consumidos(?, ?)',
      desde,
      hasta
    )
    const rows = Array.isArray(result) ? result[0] : result
    // este SP devuelve una sola fila, tomamos la primera
    res.json(rows?.[0] ?? { creditos_generados: 0, creditos_consumidos: 0 })
  } catch (err) {
    next(err)
  }
}

// C5) Intercambios por categoría
export async function getIntercambiosPorCategoria(req, res, next) {
  try {
    const { desde, hasta } = getRangoFechas(req)
    const result = await prisma.$queryRawUnsafe(
      'CALL sp_rep_intercambios_por_categoria(?, ?)',
      desde,
      hasta
    )
    const rows = Array.isArray(result) ? result[0] : result
    res.json(rows)
  } catch (err) {
    next(err)
  }
}

// C6) Publicaciones vs intercambios
export async function getPublicacionesVsIntercambios(req, res, next) {
  try {
    const { desde, hasta } = getRangoFechas(req)
    const result = await prisma.$queryRawUnsafe(
      'CALL sp_rep_publicaciones_vs_intercambios(?, ?)',
      desde,
      hasta
    )
    const rows = Array.isArray(result) ? result[0] : result
    res.json(rows)
  } catch (err) {
    next(err)
  }
}

// C7) Impacto acumulado (usa tabla REPORTE_IMPACTO)
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

    const result = await prisma.$queryRawUnsafe(
      'CALL sp_rep_impacto_acumulado(?, ?)',
      idTipoReporte,
      idPeriodo
    )

    const rows = Array.isArray(result) ? result[0] : result
    res.json(rows)
  } catch (err) {
    next(err)
  }
}
