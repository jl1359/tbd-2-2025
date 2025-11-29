// premium.service.js
import { prisma } from "../../config/prisma.js";

export const miPlanPremiumService = (idUsuario) =>
  prisma.$queryRaw`
    SELECT *
    FROM SUSCRIPCION_PREMIUM
    WHERE id_usuario = ${idUsuario}
    ORDER BY fecha_inicio DESC
    LIMIT 1
  `;

// 👉 NUEVO / CORREGIDO
export async function activarPremiumService(idUsuario) {
  // 30 días de duración
  const fin = new Date();
  fin.setDate(fin.getDate() + 30);

  // fecha_inicio tiene default CURRENT_TIMESTAMP, así que no es obligatorio mandarla
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
      'ACTIVA',      -- 👈 tiene que ser ACTIVA (no ACTIVO ni VIGENTE)
      20.00          -- monto que tú quieras
    )
  `;

  const [row] = await prisma.$queryRaw`
    SELECT *
    FROM SUSCRIPCION_PREMIUM
    WHERE id_usuario = ${idUsuario}
    ORDER BY fecha_inicio DESC
    LIMIT 1
  `;

  return row;
}
