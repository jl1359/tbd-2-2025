// backend/src/modules/intercambios/intercambios.service.js
import { prisma } from "../../config/prisma.js";

export async function crearIntercambioService({
  idComprador,
  id_publicacion,
  creditos, // lo dejamos por compatibilidad, pero NO lo usamos
}) {
  if (!id_publicacion) {
    const err = new Error("id_publicacion es obligatorio");
    err.status = 400;
    throw err;
  }

  // Si quieres puedes validar que creditos sea > 0, pero el monto real
  // lo toma el SP desde PUBLICACION.valor_creditos
  if (creditos != null) {
    const creditosNum = Number(creditos);
    if (!Number.isFinite(creditosNum) || creditosNum <= 0) {
      const err = new Error("creditos debe ser un número mayor a 0");
      err.status = 400;
      throw err;
    }
  }

  // ✅ NUEVO: usar el SP con RETENCIÓN
  // CALL sp_iniciar_intercambio_retencion(p_id_comprador, p_id_publicacion)
  await prisma.$executeRawUnsafe(
    "CALL sp_iniciar_intercambio_retencion(?, ?)",
    idComprador,
    id_publicacion
  );

  // Última transacción creada por el comprador (más reciente)
  const [tx] = await prisma.$queryRaw`
    SELECT t.*, p.titulo
    FROM TRANSACCION t
    JOIN PUBLICACION p ON p.id_publicacion = t.id_publicacion
    WHERE t.id_comprador = ${idComprador}
    ORDER BY t.creado_en DESC, t.id_transaccion DESC
    LIMIT 1
  `;

  return tx;
}

export async function misComprasService(idUsuario) {
  return prisma.$queryRaw`
    SELECT t.*, p.titulo
    FROM TRANSACCION t
    JOIN PUBLICACION p ON p.id_publicacion = t.id_publicacion
    WHERE t.id_comprador = ${idUsuario}
    ORDER BY t.creado_en DESC
  `;
}

export async function misVentasService(idUsuario) {
  return prisma.$queryRaw`
    SELECT t.*, p.titulo
    FROM TRANSACCION t
    JOIN PUBLICACION p ON p.id_publicacion = t.id_publicacion
    WHERE t.id_vendedor = ${idUsuario}
    ORDER BY t.creado_en DESC
  `;
}

export async function detalleTransaccionService(idTransaccion) {
  const [row] = await prisma.$queryRaw`
    SELECT
      t.*,
      p.titulo,
      p.descripcion,
      p.valor_creditos
    FROM TRANSACCION t
    JOIN PUBLICACION p ON p.id_publicacion = t.id_publicacion
    WHERE t.id_transaccion = ${idTransaccion}
    LIMIT 1
  `;

  if (!row) {
    const err = new Error("Transacción no encontrada");
    err.status = 404;
    throw err;
  }

  return row;
}
