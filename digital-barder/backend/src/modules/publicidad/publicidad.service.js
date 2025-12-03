// src/modules/publicidad/publicidad.service.js
import { prisma } from "../../config/prisma.js";

const ESTADOS = ["PROGRAMADA", "ACTIVA", "PAUSADA", "FINALIZADA", "CANCELADA", "ELIMINADA"];

export const listarPublicidadActivaService = () =>
  prisma.$queryRaw`
    SELECT p.*, u.nombre AS usuario
    FROM PUBLICIDAD p
    JOIN USUARIO u ON u.id_usuario = p.id_usuario
    WHERE p.estado = 'ACTIVA'
      AND NOW() BETWEEN p.fecha_inicio AND p.fecha_fin
    ORDER BY p.fecha_inicio DESC, p.id_publicidad DESC
  `;

export const listarPublicidadAdminService = () =>
  prisma.$queryRaw`
    SELECT p.*, u.nombre AS usuario
    FROM PUBLICIDAD p
    JOIN USUARIO u ON u.id_usuario = p.id_usuario
    ORDER BY p.fecha_inicio DESC, p.id_publicidad DESC
  `;

export const crearPublicidadService = async (idUsuario, body) => {
  const {
    id_ubicacion,
    titulo,
    descripcion,
    url_destino,
    fecha_inicio,
    fecha_fin,
    costo_creditos,
    tipo_media,
    url_media,
  } = body;

  if (!id_ubicacion || !titulo || !fecha_inicio || !fecha_fin || !costo_creditos) {
    const err = new Error("Faltan datos obligatorios de publicidad");
    err.status = 400;
    throw err;
  }

  return await prisma.$transaction(async (tx) => {
    // 1) Ver saldo actual
    const [billetera] = await tx.$queryRaw`
      SELECT saldo_creditos
      FROM BILLETERA
      WHERE id_usuario = ${idUsuario}
      LIMIT 1
    `;

    const saldoActual = Number(billetera?.saldo_creditos ?? 0);
    if (saldoActual < costo_creditos) {
      const err = new Error("Saldo insuficiente para publicar publicidad");
      err.status = 400;
      throw err;
    }

    // 2) Insertar publicidad
    await tx.$queryRaw`
      INSERT INTO PUBLICIDAD (
        id_usuario, id_ubicacion, estado,
        titulo, descripcion, url_destino,
        fecha_inicio, fecha_fin, costo_creditos,
        tipo_media, url_media
      )
      VALUES (
        ${idUsuario}, ${id_ubicacion}, 'PROGRAMADA',
        ${titulo}, ${descripcion || null}, ${url_destino || null},
        ${fecha_inicio}, ${fecha_fin}, ${costo_creditos},
        ${tipo_media || null}, ${url_media || null}
      )
    `;

    const [pub] = await tx.$queryRaw`
      SELECT *
      FROM PUBLICIDAD
      WHERE id_publicidad = LAST_INSERT_ID()
      LIMIT 1
    `;

    // 3) Registrar movimiento en billetera (tipo PUBLICIDAD)
    const saldoNuevo = saldoActual - costo_creditos;

    await tx.$queryRaw`
      INSERT INTO MOVIMIENTO_BILLETERA (
        id_usuario,
        tipo_movimiento,
        descripcion,
        creditos,
        saldo_resultante
      )
      VALUES (
        ${idUsuario},
        'PUBLICIDAD',
        ${`Publicación de anuncio #${pub.id_publicidad}`},
        ${-costo_creditos},
        ${saldoNuevo}
      )
    `;

    await tx.$queryRaw`
      UPDATE BILLETERA
      SET saldo_creditos = ${saldoNuevo}
      WHERE id_usuario = ${idUsuario}
    `;

    return pub;
  });
};


/* =====================================================
   NUEVO: CAMBIAR ESTADO
===================================================== */
export const cambiarEstadoPublicidadService = async (idPublicidad, estado) => {
  if (!ESTADOS.includes(estado)) {
    const err = new Error(`Estado inválido. Permitidos: ${ESTADOS.join(", ")}`);
    err.status = 400;
    throw err;
  }

  await prisma.$queryRaw`
    UPDATE PUBLICIDAD
    SET estado = ${estado}
    WHERE id_publicidad = ${idPublicidad}
  `;

  const [row] = await prisma.$queryRaw`
    SELECT *
    FROM PUBLICIDAD
    WHERE id_publicidad = ${idPublicidad}
    LIMIT 1
  `;

  return row;
};

/* =====================================================
   NUEVO: ELIMINAR (LOGICO)
===================================================== */
export const eliminarPublicidadService = async (idPublicidad) => {
  return cambiarEstadoPublicidadService(idPublicidad, "ELIMINADA");
};
