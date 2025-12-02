import { prisma } from "../../config/prisma.js";

/* =======================
   LISTADOS
   ======================= */

export const listarCategorias = () =>
  prisma.$queryRaw`SELECT * FROM CATEGORIA ORDER BY nombre`;

export const listarUnidadesMedida = () =>
  prisma.$queryRaw`SELECT * FROM UNIDAD_MEDIDA ORDER BY nombre`;

export const listarPaquetesCreditos = () =>
  prisma.$queryRaw`SELECT * FROM PAQUETE_CREDITOS WHERE activo = TRUE ORDER BY cantidad_creditos`;

export const listarTiposActividad = () =>
  prisma.$queryRaw`SELECT * FROM TIPO_ACTIVIDAD ORDER BY nombre`;

export const listarTiposPromocion = () =>
  prisma.$queryRaw`SELECT * FROM TIPO_PROMOCION ORDER BY nombre`;

export const listarUbicacionesPublicidad = () =>
  prisma.$queryRaw`SELECT * FROM UBICACION_PUBLICIDAD ORDER BY nombre`;

export const listarTiposLogro = () =>
  prisma.$queryRaw`SELECT * FROM TIPO_LOGRO ORDER BY nombre`;

/* =======================
   CRUD OPCIONAL (ADMIN)
   ======================= */

/**
 * Solo catálogos "simples" (id, nombre, descripcion opcional)
 * que admiten INSERT(nombre) sin campos extra obligatorios.
 */
const tablasPermitidas = {
  categoria: {
    tabla: "CATEGORIA",
    idCol: "id_categoria",
  },
  tipo_actividad: {
    tabla: "TIPO_ACTIVIDAD",
    idCol: "id_tipo_actividad",
  },
  tipo_promocion: {
    tabla: "TIPO_PROMOCION",
    idCol: "id_tipo_promocion",
  },
  tipo_logro: {
    tabla: "TIPO_LOGRO",
    idCol: "id_tipo_logro",
  },
  // NOTA:
  // UNIDAD_MEDIDA y UBICACION_PUBLICIDAD quedan solo lectura,
  // porque requieren más campos (simbolo, precio_base, etc.).
};

/**
 * Crear registro en catálogo genérico (ADMIN)
 */
export async function crearCatalogoService(tabla, nombre) {
  const meta = tablasPermitidas[tabla];
  if (!meta) {
    const err = new Error("Catálogo no permitido para creación genérica");
    err.status = 400;
    throw err;
  }

  if (!nombre) {
    const err = new Error("El nombre es obligatorio");
    err.status = 400;
    throw err;
  }

  await prisma.$queryRawUnsafe(
    `INSERT INTO ${meta.tabla} (nombre) VALUES (?)`,
    nombre
  );

  // devolver el último creado (por nombre)
  const [row] = await prisma.$queryRawUnsafe(
    `SELECT * FROM ${meta.tabla} WHERE nombre = ? ORDER BY ${meta.idCol} DESC LIMIT 1`,
    nombre
  );

  return row || { tabla: meta.tabla, nombre };
}

/**
 * Editar registro en catálogo genérico (ADMIN)
 */
export async function editarCatalogoService(tabla, id, nombre) {
  const meta = tablasPermitidas[tabla];
  if (!meta) {
    const err = new Error("Catálogo no permitido para edición genérica");
    err.status = 400;
    throw err;
  }

  if (!id || !nombre) {
    const err = new Error("id y nombre son obligatorios");
    err.status = 400;
    throw err;
  }

  await prisma.$queryRawUnsafe(
    `UPDATE ${meta.tabla} SET nombre = ? WHERE ${meta.idCol} = ?`,
    nombre,
    id
  );

  const [row] = await prisma.$queryRawUnsafe(
    `SELECT * FROM ${meta.tabla} WHERE ${meta.idCol} = ? LIMIT 1`,
    id
  );

  return row || { tabla: meta.tabla, id, nombre };
}
