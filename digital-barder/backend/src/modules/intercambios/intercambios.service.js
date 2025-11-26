import { prisma } from "../../config/prisma.js";

export async function crearIntercambioService({ idComprador, id_publicacion, creditos }) {
  if (!id_publicacion || !creditos) {
    const err = new Error("id_publicacion y creditos son obligatorios");
    err.status = 400;
    throw err;
  }

  await prisma.$executeRawUnsafe(
    "CALL sp_realizar_intercambio(?, ?, ?)",
    idComprador,
    id_publicacion,
    creditos
  );

  // La última transacción creada
  const [tx] = await prisma.$queryRaw`
    SELECT *
    FROM TRANSACCION
    WHERE id_comprador = ${idComprador}
    ORDER BY id_transaccion DESC
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
    SELECT t.*, p.titulo, p.descripcion, p.valor_creditos
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
