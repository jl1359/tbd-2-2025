// premium.service.js
import { prisma } from "../../config/prisma.js";

export const miPlanPremiumService = (idUsuario) =>
  prisma.$queryRaw`
    SELECT * FROM SUSCRIPCION_PREMIUM
    WHERE id_usuario = ${idUsuario}
    ORDER BY fecha_inicio DESC
    LIMIT 1
  `;
