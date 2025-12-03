// premium.service.js
import { prisma } from "../../config/prisma.js";

/**
 * Devuelve la suscripción premium más reciente del usuario,
 * o null si no tiene.
 */
export const miPlanPremiumService = async (idUsuario) => {
  const rows = await prisma.$queryRaw`
    SELECT *
    FROM SUSCRIPCION_PREMIUM
    WHERE id_usuario = ${idUsuario}
    ORDER BY fecha_inicio DESC
    LIMIT 1
  `;
  return rows[0] || null;
};

/**
 * Activa una suscripción premium de 30 días.
 * - Cierra suscripciones ACTIVA previas (las marca como VENCIDA).
 * - Crea una nueva suscripción ACTIVA con monto fijo.
 */
export async function activarPremiumService(idUsuario) {
  // 1) ¿Ya tiene una suscripción ACTIVA que aún no venció?
  const [activa] = await prisma.$queryRaw`
    SELECT *
    FROM SUSCRIPCION_PREMIUM
    WHERE id_usuario = ${idUsuario}
      AND estado = 'ACTIVA'
      AND (fecha_fin IS NULL OR fecha_fin > NOW())
    ORDER BY fecha_inicio DESC
    LIMIT 1
  `;

  if (activa) {
    const err = new Error(
      "Ya tienes una suscripción premium activa actualmente"
    );
    err.status = 400;
    throw err;
  }

  // 2) Cerrar cualquier ACTIVA “vieja” que quedó sin fecha_fin coherente
  await prisma.$executeRaw`
    UPDATE SUSCRIPCION_PREMIUM
    SET estado = 'VENCIDA',
        fecha_fin = IFNULL(fecha_fin, NOW())
    WHERE id_usuario = ${idUsuario}
      AND estado = 'ACTIVA'
      AND fecha_inicio <= NOW()
  `;

  // 3) Crear nueva suscripción de 30 días
  const fin = new Date();
  fin.setDate(fin.getDate() + 30);

  const monto = 20.0; // 💰 aquí puedes parametrizar el precio si después tienes planes distintos

  await prisma.$executeRaw`
    INSERT INTO SUSCRIPCION_PREMIUM (
      id_usuario,
      fecha_fin,
      estado,
      monto_bs
    )
    VALUES (
      ${idUsuario},
      ${fin},
      'ACTIVA',
      ${monto}
    )
  `;

  // 4) Devolver la suscripción recién creada
  const [row] = await prisma.$queryRaw`
    SELECT *
    FROM SUSCRIPCION_PREMIUM
    WHERE id_usuario = ${idUsuario}
    ORDER BY fecha_inicio DESC
    LIMIT 1
  `;

  return row;
}
