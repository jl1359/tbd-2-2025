import { prisma } from "../../config/prisma.js";

export async function registrarActividadService({
  idUsuario,
  id_tipo_actividad,
  descripcion,
  creditos_otorgados,
  evidencia_url,
}) {
  if (!id_tipo_actividad || !descripcion || creditos_otorgados == null) {
    const err = new Error(
      "id_tipo_actividad, descripcion y creditos_otorgados son obligatorios"
    );
    err.status = 400;
    throw err;
  }

  const creditosNum = Number(creditos_otorgados);
  if (!Number.isFinite(creditosNum) || creditosNum <= 0) {
    const err = new Error("creditos_otorgados debe ser un número mayor a 0");
    err.status = 400;
    throw err;
  }

  // Llamar SP que encapsula la lógica de negocio
  await prisma.$executeRawUnsafe(
    "CALL sp_registrar_actividad_sostenible(?, ?, ?, ?, ?)",
    idUsuario,
    id_tipo_actividad,
    descripcion,
    creditosNum,
    evidencia_url || null
  );

  // devolver la última actividad del usuario (reciente)
  const [act] = await prisma.$queryRaw`
    SELECT *
    FROM ACTIVIDAD_SOSTENIBLE
    WHERE id_usuario = ${idUsuario}
    ORDER BY creado_en DESC, id_actividad DESC
    LIMIT 1
  `;
  return act;
}

export async function misActividadesService(idUsuario) {
  return prisma.$queryRaw`
    SELECT *
    FROM ACTIVIDAD_SOSTENIBLE
    WHERE id_usuario = ${idUsuario}
    ORDER BY creado_en DESC
  `;
}

/**
 * Listado ADMIN con filtros opcionales:
 *  - id_usuario
 *  - id_tipo_actividad
 *  - desde / hasta (sobre columna creado_en)
 *
 * Versión pro: incluye nombre de usuario y nombre del tipo de actividad.
 */
export async function listarActividadesAdminService({
  id_usuario,
  id_tipo_actividad,
  desde,
  hasta,
}) {
  let sql = `
    SELECT
      a.*,
      u.nombre       AS nombre_usuario,
      u.correo       AS correo_usuario,
      ta.nombre      AS nombre_tipo_actividad
    FROM ACTIVIDAD_SOSTENIBLE a
    JOIN USUARIO u
      ON u.id_usuario = a.id_usuario
    JOIN TIPO_ACTIVIDAD ta
      ON ta.id_tipo_actividad = a.id_tipo_actividad
    WHERE 1=1
  `;
  const params = [];

  if (id_usuario) {
    sql += " AND a.id_usuario = ?";
    params.push(id_usuario);
  }

  if (id_tipo_actividad) {
    sql += " AND a.id_tipo_actividad = ?";
    params.push(id_tipo_actividad);
  }

  if (desde) {
    sql += " AND DATE(a.creado_en) >= ?";
    params.push(desde);
  }

  if (hasta) {
    sql += " AND DATE(a.creado_en) <= ?";
    params.push(hasta);
  }

  sql += " ORDER BY a.creado_en DESC, a.id_actividad DESC";

  return prisma.$queryRawUnsafe(sql, ...params);
}
