import { prisma } from "../../config/prisma.js";

export async function registrarActividadService({
  idUsuario,
  id_tipo_actividad,
  descripcion,
  creditos_otorgados,
  evidencia_url,
}) {
  if (!id_tipo_actividad || !descripcion || !creditos_otorgados) {
    const err = new Error("id_tipo_actividad, descripcion y creditos_otorgados son obligatorios");
    err.status = 400;
    throw err;
  }

  await prisma.$executeRawUnsafe(
    "CALL sp_registrar_actividad_sostenible(?, ?, ?, ?, ?)",
    idUsuario,
    id_tipo_actividad,
    descripcion,
    creditos_otorgados,
    evidencia_url || null
  );

  // devolver ultima actividad del usuario
  const [act] = await prisma.$queryRaw`
    SELECT *
    FROM ACTIVIDAD_SOSTENIBLE
    WHERE id_usuario = ${idUsuario}
    ORDER BY creado_en DESC, id_actividad DESC
    LIMIT 1
  `;
  return act;
}

export async function misActividadesService(idUsuario) {
  return prisma.$queryRaw`
    SELECT * FROM ACTIVIDAD_SOSTENIBLE
    WHERE id_usuario = ${idUsuario}
    ORDER BY creado_en DESC
  `;
}
