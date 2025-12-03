import { prisma } from "../../config/prisma.js";

/**
 * Listar catálogo de logros (opcionalmente filtrado por tipo)
 * @param {number | undefined} idTipoLogro
 */
export const listarLogrosService = (idTipoLogro) => {
  if (idTipoLogro) {
    return prisma.$queryRaw`
      SELECT 
        l.*, 
        tl.nombre AS tipo_logro
      FROM LOGRO l
      JOIN TIPO_LOGRO tl ON tl.id_tipo_logro = l.id_tipo_logro
      WHERE l.id_tipo_logro = ${idTipoLogro}
      ORDER BY l.id_logro
    `;
  }

  // Sin filtro
  return prisma.$queryRaw`
    SELECT 
      l.*, 
      tl.nombre AS tipo_logro
    FROM LOGRO l
    JOIN TIPO_LOGRO tl ON tl.id_tipo_logro = l.id_tipo_logro
    ORDER BY l.id_logro
  `;
};

/**
 * Logros del usuario actual (catálogo + progreso)
 * @param {number} idUsuario
 */
export const misLogrosService = (idUsuario) =>
  prisma.$queryRaw`
    SELECT
      ul.id_usuario_logro,
      ul.id_usuario,
      ul.id_logro,
      ul.progreso_actual,
      ul.creado_en,
      ul.obtenido_en,
      l.nombre,
      l.descripcion,
      l.meta_requerida,
      l.creditos_recompensa,
      tl.nombre AS tipo_logro
    FROM USUARIO_LOGRO ul
    JOIN LOGRO l ON l.id_logro = ul.id_logro
    JOIN TIPO_LOGRO tl ON tl.id_tipo_logro = l.id_tipo_logro
    WHERE ul.id_usuario = ${idUsuario}
    ORDER BY l.id_logro
  `;
