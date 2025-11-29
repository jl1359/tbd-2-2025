// src/modules/publicidad/publicidad.service.js
import { prisma } from "../../config/prisma.js";

// Publicidad visible para el FRONT (activa y en rango de fechas)
export const listarPublicidadActivaService = () =>
  prisma.$queryRaw`
    SELECT p.*, u.nombre AS usuario
    FROM PUBLICIDAD p
    JOIN USUARIO u ON u.id_usuario = p.id_usuario
    WHERE p.estado = 'ACTIVA'
      AND NOW() BETWEEN p.fecha_inicio AND p.fecha_fin
    ORDER BY p.fecha_inicio DESC, p.id_publicidad DESC
  `;

// Publicidad para ADMIN (toda la publicidad)
export const listarPublicidadAdminService = () =>
  prisma.$queryRaw`
    SELECT p.*, u.nombre AS usuario
    FROM PUBLICIDAD p
    JOIN USUARIO u ON u.id_usuario = p.id_usuario
    ORDER BY p.fecha_inicio DESC, p.id_publicidad DESC
  `;

// Crear una nueva PUBLICIDAD
export const crearPublicidadService = async (idUsuario, body) => {
  const {
    id_ubicacion,
    titulo,
    descripcion,
    url_destino,
    fecha_inicio,
    fecha_fin,
    costo_creditos,
  } = body;

  if (!id_ubicacion || !titulo || !fecha_inicio || !fecha_fin || !costo_creditos) {
    const err = new Error("Faltan datos obligatorios de publicidad");
    err.status = 400;
    throw err;
  }

  // INSERT
  await prisma.$queryRaw`
    INSERT INTO PUBLICIDAD
      (id_usuario, id_ubicacion, estado, titulo, descripcion, url_destino,
       fecha_inicio, fecha_fin, costo_creditos)
    VALUES
      (
        ${idUsuario},
        ${id_ubicacion},
        'PROGRAMADA',
        ${titulo},
        ${descripcion || null},
        ${url_destino || null},
        ${fecha_inicio},
        ${fecha_fin},
        ${costo_creditos}
      )
  `;

  // Devolver el registro recién creado
  const [row] = await prisma.$queryRaw`
    SELECT *
    FROM PUBLICIDAD
    WHERE id_publicidad = LAST_INSERT_ID()
    LIMIT 1
  `;
  return row;
};
