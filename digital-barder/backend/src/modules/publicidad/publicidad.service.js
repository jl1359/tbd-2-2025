// src/modules/publicidad/publicidad.service.js
import { prisma } from "../../config/prisma.js";

const ESTADOS = [
  "PROGRAMADA",
  "ACTIVA",
  "PAUSADA",
  "FINALIZADA",
  "CANCELADA",
  "ELIMINADA",
];

/**
 * Lista de publicidad ACTIVA (para mostrar en el sistema)
 */
export const listarPublicidadActivaService = () =>
  prisma.$queryRaw`
    SELECT 
      p.*,
      u.nombre AS usuario,
      up.nombre AS nombre_ubicacion
    FROM PUBLICIDAD p
    JOIN USUARIO u ON u.id_usuario = p.id_usuario
    LEFT JOIN UBICACION_PUBLICIDAD up 
      ON up.id_ubicacion = p.id_ubicacion
    WHERE p.estado = 'ACTIVA'
      AND NOW() BETWEEN p.fecha_inicio AND p.fecha_fin
    ORDER BY p.fecha_inicio DESC, p.id_publicidad DESC
  `;

/**
 * Listado completo (admin)
 */
export const listarPublicidadAdminService = () =>
  prisma.$queryRaw`
    SELECT 
      p.*,
      u.nombre AS usuario,
      up.nombre AS nombre_ubicacion
    FROM PUBLICIDAD p
    JOIN USUARIO u ON u.id_usuario = p.id_usuario
    LEFT JOIN UBICACION_PUBLICIDAD up 
      ON up.id_ubicacion = p.id_ubicacion
    ORDER BY p.fecha_inicio DESC, p.id_publicidad DESC
  `;

/**
 * Crear nueva campaña de publicidad.
 * Siempre se crea como PROGRAMADA (sin cobrar todavía).
 */
export const crearPublicidadService = async (idUsuario, body) => {
  const {
    id_ubicacion,
    titulo,
    descripcion,
    url_destino,
    fecha_inicio,
    fecha_fin,
    costo_creditos,
    // 🔹 vienen del front y hay que guardarlos
    banner_url,
    archivo_url,
  } = body;

  const costo = Number(costo_creditos);

  if (
    !id_ubicacion ||
    !titulo ||
    !fecha_inicio ||
    !fecha_fin ||
    !costo ||
    !Number.isFinite(costo) ||
    costo <= 0
  ) {
    const err = new Error(
      "Faltan datos obligatorios o costo inválido en publicidad"
    );
    err.status = 400;
    throw err;
  }

  await prisma.$queryRaw`
    INSERT INTO PUBLICIDAD (
      id_usuario,
      id_ubicacion,
      estado,
      titulo,
      descripcion,
      url_destino,
      fecha_inicio,
      fecha_fin,
      costo_creditos,
      banner_url,
      archivo_url
    )
    VALUES (
      ${idUsuario},
      ${id_ubicacion},
      'PROGRAMADA',
      ${titulo},
      ${descripcion || null},
      ${url_destino || null},
      ${fecha_inicio},
      ${fecha_fin},
      ${costo},
      ${banner_url || null},
      ${archivo_url || null}
    )
  `;

  const [row] = await prisma.$queryRaw`
    SELECT *
    FROM PUBLICIDAD
    WHERE id_publicidad = LAST_INSERT_ID()
    LIMIT 1
  `;

  return row;
};

/* 
   CAMBIAR ESTADO (ADMIN / DUEÑO)
   Se apoya en los SP de retención:
   - ACTIVA     -> sp_publicidad_activar_retencion
   - FINALIZADA -> sp_publicidad_finalizar_retencion
   - CANCELADA  -> sp_publicidad_cancelar_retencion
   - Otros      -> UPDATE directo de estado
===================================================== */
export const cambiarEstadoPublicidadService = async (idPublicidad, estado) => {
  if (!ESTADOS.includes(estado)) {
    const err = new Error(`Estado inválido. Permitidos: ${ESTADOS.join(", ")}`);
    err.status = 400;
    throw err;
  }

  // Traemos info actual de la campaña
  const [pub] = await prisma.$queryRaw`
    SELECT id_usuario, estado, costo_creditos
    FROM PUBLICIDAD
    WHERE id_publicidad = ${idPublicidad}
    LIMIT 1
  `;

  if (!pub) {
    const err = new Error("Publicidad no encontrada");
    err.status = 404;
    throw err;
  }

  const estadoActual = pub.estado;
  const idUsuarioDueno = pub.id_usuario;

  // Evitar cambios redundantes
  if (estado === estadoActual) {
    return pub; // no hacemos nada
  }

  // Según el nuevo estado, llamamos al SP apropiado
  if (estado === "ACTIVA") {
    // Activa campaña + retiene créditos
    await prisma.$executeRawUnsafe(
      "CALL sp_publicidad_activar_retencion(?, ?)",
      idPublicidad,
      idUsuarioDueno
    );
  } else if (estado === "FINALIZADA") {
    // Finaliza campaña + consume definitivamente lo bloqueado
    await prisma.$executeRawUnsafe(
      "CALL sp_publicidad_finalizar_retencion(?)",
      idPublicidad
    );
  } else if (estado === "CANCELADA") {
    // Cancela campaña + devuelve créditos si estaban retenidos
    await prisma.$executeRawUnsafe(
      "CALL sp_publicidad_cancelar_retencion(?, ?)",
      idPublicidad,
      idUsuarioDueno
    );
  } else {
    // PROGRAMADA, PAUSADA, ELIMINADA -> solo cambio de estado
    await prisma.$queryRaw`
      UPDATE PUBLICIDAD
      SET estado = ${estado}
      WHERE id_publicidad = ${idPublicidad}
    `;
  }

  // Volvemos a leer la campaña ya actualizada
  const [row] = await prisma.$queryRaw`
    SELECT *
    FROM PUBLICIDAD
    WHERE id_publicidad = ${idPublicidad}
    LIMIT 1
  `;

  return row;
};

/* 
   ELIMINAR (LÓGICO)
 */
export const eliminarPublicidadService = async (idPublicidad) => {
  // La tratamos como un cambio de estado a ELIMINADA
  return cambiarEstadoPublicidadService(idPublicidad, "ELIMINADA");
};
