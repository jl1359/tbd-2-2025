// backend/src/modules/wallet/wallet.service.js
import { prisma } from "../../config/prisma.js";

// =======================================
// Helper: convertir BigInt / Decimal a Number
// =======================================
function toNumberSafe(value, def = 0) {
  if (value == null) return def;

  if (typeof value === "bigint") return Number(value);

  if (typeof value === "object" && typeof value.toNumber === "function") {
    return value.toNumber();
  }

  const num = Number(value);
  return Number.isNaN(num) ? def : num;
}

// =======================================
// Normalizadores
// =======================================

// Saldo de billetera
function normalizeBilleteraRow(row) {
  if (!row) {
    return {
      saldo_creditos: 0,
      saldo_bs: 0,
      saldo: 0,
      creditos: 0,
      saldo_bloqueado: 0,
      bloqueado: 0,
    };
  }

  const saldoCreditos = toNumberSafe(row.saldo_creditos, 0);
  const saldoBs = toNumberSafe(row.saldo_bs, 0);
  const saldoBloqueado = toNumberSafe(row.saldo_bloqueado ?? 0, 0);

  return {
    // nombres originales de la consulta
    saldo_creditos: saldoCreditos,
    saldo_bs: saldoBs,

    // alias que usan Home, Perfil y Wallet en el front
    saldo: saldoCreditos,
    creditos: saldoCreditos,
    saldo_bloqueado: saldoBloqueado,
    bloqueado: saldoBloqueado,
  };
}

// Movimiento de créditos
function normalizeMovimientoRow(row) {
  if (!row) return row;

  const cantidad = toNumberSafe(row.cantidad, 0);

  return {
    ...row,
    cantidad,
    creditos: cantidad, // el front muestra a.creditos en Home
    saldo_anterior: toNumberSafe(row.saldo_anterior, 0),
    saldo_posterior: toNumberSafe(row.saldo_posterior, 0),
    // creado_en queda como Date y Express lo serializa a ISO
  };
}

// Compra de paquete de créditos
function normalizeCompraRow(row) {
  if (!row) return row;

  const cant = toNumberSafe(row.cantidad_creditos, 0);
  const monto = toNumberSafe(row.monto_bs, 0);

  return {
    ...row,
    cantidad_creditos: cant,
    creditos: cant,          // para tablas que leen c.creditos
    creditos_compra: cant,   // para tablas que leen c.creditos_compra
    monto_bs: monto,
    monto,                   // alias genérico
  };
}

// =======================================
// Servicios públicos del módulo
// =======================================

// Saldo actual de la billetera del usuario logueado
export async function obtenerMisCreditosService(idUsuario) {
  const rows = await prisma.$queryRaw`
    SELECT saldo_creditos, saldo_bs
    FROM BILLETERA
    WHERE id_usuario = ${idUsuario}
    LIMIT 1
  `;

  return normalizeBilleteraRow(rows[0]);
}

// Movimientos de la billetera del usuario
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

  return rows.map(normalizeMovimientoRow);
}

// Compra de un paquete de créditos (llama al SP y devuelve la billetera actualizada)
export async function comprarCreditosService({
  idUsuario,
  idPaquete,
  idTransaccionPago,
}) {
  // SP: sp_compra_creditos_aprobar(p_id_usuario, p_id_paquete, p_id_transaccion_pago)
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

// Historial de compras de paquetes de créditos
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

  return rows.map(normalizeCompraRow);
}
