import { prisma } from "../../config/prisma.js";

export const listarPromocionesService = () =>
  prisma.$queryRaw`
    SELECT * FROM PROMOCION
    ORDER BY fecha_inicio DESC
  `;

export async function crearPromocionService(body) {
  const {
    id_tipo_promocion,
    nombre,
    descripcion,
    creditos_otorgados,
    fecha_inicio,
    fecha_fin,
    estado = "ACTIVA",
  } = body;

  if (!id_tipo_promocion || !nombre || !creditos_otorgados || !fecha_inicio || !fecha_fin) {
    const err = new Error("Faltan datos obligatorios de promoción");
    err.status = 400;
    throw err;
  }

  await prisma.$queryRaw`
    INSERT INTO PROMOCION
      (id_tipo_promocion, nombre, descripcion, creditos_otorgados,
       fecha_inicio, fecha_fin, estado)
    VALUES
      (${id_tipo_promocion}, ${nombre}, ${descripcion || null}, ${creditos_otorgados},
       ${fecha_inicio}, ${fecha_fin}, ${estado})
  `;

  const [row] = await prisma.$queryRaw`
    SELECT * FROM PROMOCION
    WHERE id_promocion = LAST_INSERT_ID()
    LIMIT 1
  `;
  return row;
}

export async function actualizarEstadoPromocionService(idPromocion, estado) {
  await prisma.$queryRaw`
    UPDATE PROMOCION
    SET estado = ${estado}
    WHERE id_promocion = ${idPromocion}
  `;
  const [row] = await prisma.$queryRaw`
    SELECT * FROM PROMOCION
    WHERE id_promocion = ${idPromocion}
    LIMIT 1
  `;
  return row;
}

export async function vincularPublicacionService(idPromocion, idPublicacion) {
  if (!idPublicacion) {
    const err = new Error("id_publicacion es obligatorio");
    err.status = 400;
    throw err;
  }
  await prisma.$queryRaw`
    INSERT IGNORE INTO PROMOCION_PUBLICACION (id_promocion, id_publicacion)
    VALUES (${idPromocion}, ${idPublicacion})
  `;
}
