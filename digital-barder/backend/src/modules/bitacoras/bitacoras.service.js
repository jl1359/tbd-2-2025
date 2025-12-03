// src/modules/bitacoras/bitacoras.service.js
import { prisma } from "../../config/prisma.js";

/**
 * Listar accesos (BITACORA_ACCESO) con paginación.
 * Si se envía idUsuario, filtra por ese usuario.
 */
export async function listarAccesosService({
  page = 1,
  pageSize = 20,
  idUsuario = null,
}) {
  const limit = Math.max(1, Math.min(Number(pageSize) || 20, 100));
  const pageNum = Math.max(Number(page) || 1, 1);
  const offset = (pageNum - 1) * limit;

  let where = "WHERE 1=1";
  const params = [];

  if (idUsuario) {
    where += " AND b.id_usuario = ?";
    params.push(Number(idUsuario));
  }

  const countSql = `
    SELECT COUNT(*) AS total
    FROM BITACORA_ACCESO b
    ${where}
  `;
  const [countRow] = await prisma.$queryRawUnsafe(countSql, ...params);
  const total = Number(countRow?.total || 0);

  const dataSql = `
    SELECT
      b.id_acceso AS id_bitacora,
      b.id_usuario,
      u.nombre,
      u.correo,
      b.fecha,
      b.direccion_ip,
      b.user_agent,
      r.nombre AS resultado
    FROM BITACORA_ACCESO b
    JOIN USUARIO u ON u.id_usuario = b.id_usuario
    JOIN RESULTADO_ACCESO r ON r.id_resultado = b.id_resultado
    ${where}
    ORDER BY b.fecha DESC, b.id_acceso DESC
    LIMIT ? OFFSET ?
  `;
  const data = await prisma.$queryRawUnsafe(
    dataSql,
    ...params,
    limit,
    offset
  );

  return {
    page: pageNum,
    pageSize: limit,
    total,
    data,
  };
}

/**
 * Bitácora de intercambios (BITACORA_INTERCAMBIO) con paginación.
 * Opcional: filtrar por idTransaccion o idUsuario (origen/destino).
 */
export async function listarBitacoraIntercambiosService({
  page = 1,
  pageSize = 20,
  idTransaccion = null,
  idUsuario = null,
}) {
  const limit = Math.max(1, Math.min(Number(pageSize) || 20, 100));
  const pageNum = Math.max(Number(page) || 1, 1);
  const offset = (pageNum - 1) * limit;

  let where = "WHERE 1=1";
  const params = [];

  if (idTransaccion) {
    where += " AND bi.id_transaccion = ?";
    params.push(Number(idTransaccion));
  }

  if (idUsuario) {
    where +=
      " AND (bi.id_usuario_origen = ? OR bi.id_usuario_destino = ?)";
    params.push(Number(idUsuario), Number(idUsuario));
  }

  const countSql = `
    SELECT COUNT(*) AS total
    FROM BITACORA_INTERCAMBIO bi
    ${where}
  `;
  const [countRow] = await prisma.$queryRawUnsafe(countSql, ...params);
  const total = Number(countRow?.total || 0);

  const dataSql = `
    SELECT
      bi.id_bitacora,
      bi.id_transaccion,
      bi.id_usuario_origen,
      uo.nombre  AS usuario_origen,
      bi.id_usuario_destino,
      ud.nombre  AS usuario_destino,
      bi.cantidad_creditos,
      bi.descripcion,
      t.estado   AS estado_transaccion,
      t.creado_en AS fecha_transaccion
    FROM BITACORA_INTERCAMBIO bi
    JOIN TRANSACCION t
      ON t.id_transaccion = bi.id_transaccion
    JOIN USUARIO uo
      ON uo.id_usuario = bi.id_usuario_origen
    JOIN USUARIO ud
      ON ud.id_usuario = bi.id_usuario_destino
    ${where}
    ORDER BY bi.id_bitacora DESC
    LIMIT ? OFFSET ?
  `;
  const data = await prisma.$queryRawUnsafe(
    dataSql,
    ...params,
    limit,
    offset
  );

  return {
    page: pageNum,
    pageSize: limit,
    total,
    data,
  };
}
