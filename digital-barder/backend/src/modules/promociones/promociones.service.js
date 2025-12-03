import { prisma } from "../../config/prisma.js";

/**
 * Listar promociones (panel admin).
 * Más adelante podrías agregar filtros:
 *   - por estado (?estado=ACTIVA)
 *   - por rango de fechas (?desde, ?hasta)
 */
export const listarPromocionesService = () =>
  prisma.$queryRaw`
    SELECT *
    FROM PROMOCION
    ORDER BY fecha_inicio DESC
  `;

// Valores válidos según ENUM de la BD
const ESTADOS_VALIDOS = [
  "PROGRAMADA",
  "ACTIVA",
  "PAUSADA",
  "FINALIZADA",
  "CANCELADA",
];

export async function crearPromocionService(body) {
  const {
    id_tipo_promocion,
    nombre,
    descripcion,
    creditos_otorgados,
    fecha_inicio,
    fecha_fin,
    estado = "PROGRAMADA", // 👉 mejor default coherente con la BD
  } = body;

  if (
    !id_tipo_promocion ||
    !nombre ||
    !creditos_otorgados ||
    !fecha_inicio ||
    !fecha_fin
  ) {
    const err = new Error("Faltan datos obligatorios de promoción");
    err.status = 400;
    throw err;
  }

  // Validar estado (si viene)
  if (estado && !ESTADOS_VALIDOS.includes(estado)) {
    const err = new Error("Estado de promoción inválido");
    err.status = 400;
    throw err;
  }

  // Validar fechas mínimamente
  const ini = new Date(fecha_inicio);
  const fin = new Date(fecha_fin);
  if (!(ini instanceof Date && !isNaN(ini)) || !(fin instanceof Date && !isNaN(fin))) {
    const err = new Error("fecha_inicio o fecha_fin inválidas");
    err.status = 400;
    throw err;
  }
  if (fin <= ini) {
    const err = new Error("fecha_fin debe ser mayor a fecha_inicio");
    err.status = 400;
    throw err;
  }

  await prisma.$queryRaw`
    INSERT INTO PROMOCION (
      id_tipo_promocion,
      nombre,
      descripcion,
      creditos_otorgados,
      fecha_inicio,
      fecha_fin,
      estado
    )
    VALUES (
      ${id_tipo_promocion},
      ${nombre},
      ${descripcion || null},
      ${creditos_otorgados},
      ${fecha_inicio},
      ${fecha_fin},
      ${estado}
    )
  `;

  const [row] = await prisma.$queryRaw`
    SELECT *
    FROM PROMOCION
    WHERE id_promocion = LAST_INSERT_ID()
    LIMIT 1
  `;

  return row;
}

export async function actualizarEstadoPromocionService(idPromocion, estado) {
  if (!ESTADOS_VALIDOS.includes(estado)) {
    const err = new Error("Estado de promoción inválido");
    err.status = 400;
    throw err;
  }

  await prisma.$queryRaw`
    UPDATE PROMOCION
    SET estado = ${estado}
    WHERE id_promocion = ${idPromocion}
  `;

  const [row] = await prisma.$queryRaw`
    SELECT *
    FROM PROMOCION
    WHERE id_promocion = ${idPromocion}
    LIMIT 1
  `;

  if (!row) {
    const err = new Error("Promoción no encontrada");
    err.status = 404;
    throw err;
  }

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

  // El trigger trg_promopub_after_ins_bono se encarga del bono de créditos
}
