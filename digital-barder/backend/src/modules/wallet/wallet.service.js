import { prisma } from "../../config/prisma.js";

// Helper para convertir BigInt / Decimal a Number
function toNumberSafe(value, def = 0) {
  if (value == null) return def;

  if (typeof value === "bigint") return Number(value);

  if (typeof value === "object" && typeof value.toNumber === "function") {
    return value.toNumber();
  }

  const num = Number(value);
  return Number.isNaN(num) ? def : num;
}

function normalizeBilleteraRow(row) {
  if (!row) {
    return {
      saldo_creditos: 0,
      saldo_bs: 0,
    };
  }

  return {
    saldo_creditos: toNumberSafe(row.saldo_creditos, 0),
    saldo_bs: toNumberSafe(row.saldo_bs, 0),
  };
}

export async function obtenerMisCreditosService(idUsuario) {
  const rows = await prisma.$queryRaw`
    SELECT saldo_creditos, saldo_bs
    FROM BILLETERA
    WHERE id_usuario = ${idUsuario}
    LIMIT 1
  `;

  return normalizeBilleteraRow(rows[0]);
}

export async function obtenerMisMovimientosService(idUsuario) {
  const rows = await prisma.$queryRaw`
    SELECT m.id_movimiento,
           m.cantidad,
           m.saldo_anterior,
           m.saldo_posterior,
           m.id_referencia,
           m.creado_en,
           tm.nombre AS tipo_movimiento,
           tr.nombre AS tipo_referencia
    FROM MOVIMIENTO_CREDITOS m
    JOIN TIPO_MOVIMIENTO tm ON tm.id_tipo_movimiento = m.id_tipo_movimiento
    JOIN TIPO_REFERENCIA tr ON tr.id_tipo_referencia = m.id_tipo_referencia
    WHERE m.id_usuario = ${idUsuario}
    ORDER BY m.creado_en DESC, m.id_movimiento DESC
  `;

  // si quieres, aquí también podrías normalizar BigInt, pero por ahora lo dejamos
  return rows;
}

export async function comprarCreditosService({
  idUsuario,
  idPaquete,
  idTransaccionPago,
}) {
  // Llamar al SP
  await prisma.$executeRawUnsafe(
    "CALL sp_compra_creditos_aprobar(?, ?, ?)",
    idUsuario,
    idPaquete,
    idTransaccionPago
  );

  const rows = await prisma.$queryRaw`
    SELECT saldo_creditos, saldo_bs
    FROM BILLETERA
    WHERE id_usuario = ${idUsuario}
    LIMIT 1
  `;

  return normalizeBilleteraRow(rows[0]);
}

export async function obtenerMisComprasService(idUsuario) {
  const rows = await prisma.$queryRaw`
    SELECT c.id_compra,
           c.id_paquete,
           p.nombre AS paquete,
           p.cantidad_creditos,
           c.monto_bs,
           c.estado,
           c.id_transaccion_pago,
           c.creado_en
    FROM COMPRA_CREDITOS c
    JOIN PAQUETE_CREDITOS p ON p.id_paquete = c.id_paquete
    WHERE c.id_usuario = ${idUsuario}
    ORDER BY c.creado_en DESC, c.id_compra DESC
  `;
  return rows;
}
