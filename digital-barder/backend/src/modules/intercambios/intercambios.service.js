// backend/src/modules/intercambios/intercambios.service.js
import { prisma } from "../../config/prisma.js";

/**
 * Inicia un intercambio con RETENCIÓN de créditos.
 * Usa el SP: sp_iniciar_intercambio_retencion(p_id_comprador, p_id_publicacion)
 */
export async function crearIntercambioService({
  idComprador,
  id_publicacion,
  creditos, // opcional, el SP usa PUBLICACION.valor_creditos
}) {
  if (!id_publicacion) {
    const err = new Error("id_publicacion es obligatorio");
    err.status = 400;
    throw err;
  }

  // Validación suave de 'creditos' por si el front lo envía
  if (creditos != null) {
    const creditosNum = Number(creditos);
    if (!Number.isFinite(creditosNum) || creditosNum <= 0) {
      const err = new Error("creditos debe ser un número mayor a 0");
      err.status = 400;
      throw err;
    }
  }

  //  Llamamos al SP con retención
  await prisma.$executeRawUnsafe(
    "CALL sp_iniciar_intercambio_retencion(?, ?)",
    idComprador,
    id_publicacion
  );

  // Devolvemos la última transacción del comprador (la recién creada)
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

/**
 * Confirma un intercambio con retención:
 * - Libera créditos bloqueados del comprador
 * - Acredita al vendedor
 * - Marca la transacción como COMPLETADA
 */
export async function confirmarIntercambioService({
  idUsuarioAccion,
  idTransaccion,
}) {
  await prisma.$executeRawUnsafe(
    "CALL sp_confirmar_intercambio_retencion(?, ?)",
    idTransaccion,
    idUsuarioAccion
  );

  const [tx] = await prisma.$queryRaw`
    SELECT t.*, p.titulo
    FROM TRANSACCION t
    JOIN PUBLICACION p ON p.id_publicacion = t.id_publicacion
    WHERE t.id_transaccion = ${idTransaccion}
    LIMIT 1
  `;

  return tx;
}

/**
 * Cancela un intercambio con retención:
 * - Devuelve créditos al comprador
 * - Reduce creditos_bloqueados
 * - Marca la transacción como CANCELADA
 */
export async function cancelarIntercambioService({
  idUsuarioAccion,
  idTransaccion,
}) {
  await prisma.$executeRawUnsafe(
    "CALL sp_cancelar_intercambio_retencion(?, ?)",
    idTransaccion,
    idUsuarioAccion
  );

  const [tx] = await prisma.$queryRaw`
    SELECT t.*, p.titulo
    FROM TRANSACCION t
    JOIN PUBLICACION p ON p.id_publicacion = t.id_publicacion
    WHERE t.id_transaccion = ${idTransaccion}
    LIMIT 1
  `;

  return tx;
}

/**
 * Lista de compras del usuario (como comprador)
 */
export async function misComprasService(idUsuario) {
  return prisma.$queryRaw`
    SELECT t.*, p.titulo
    FROM TRANSACCION t
    JOIN PUBLICACION p ON p.id_publicacion = t.id_publicacion
    WHERE t.id_comprador = ${idUsuario}
    ORDER BY t.creado_en DESC
  `;
}

/**
 * Lista de ventas del usuario (como vendedor)
 */
export async function misVentasService(idUsuario) {
  return prisma.$queryRaw`
    SELECT t.*, p.titulo
    FROM TRANSACCION t
    JOIN PUBLICACION p ON p.id_publicacion = t.id_publicacion
    WHERE t.id_vendedor = ${idUsuario}
    ORDER BY t.creado_en DESC
  `;
}

/**
 * Detalle de una transacción específica
 */
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
