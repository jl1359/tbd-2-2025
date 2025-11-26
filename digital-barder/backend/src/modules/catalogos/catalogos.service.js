import { prisma } from "../../config/prisma.js";

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
