import { prisma } from "../../config/prisma.js";

const ESTADOS_PUBLICACION = [
  "BORRADOR",
  "PUBLICADA",
  "PAUSADA",
  "AGOTADA",
  "OCULTA",
  "ELIMINADA",
];

/* ============================================================
   LISTADO + PAGINACIÓN
   ============================================================ */

// Si NO mandas page/pageSize → devuelve array simple (compatibilidad)
// Si mandas page → devuelve { items, total, page, pageSize }
export async function listarPublicacionesService({
  categoria,
  estado,
  page,
  pageSize,
}) {
  let where = "WHERE 1=1";
  const params = [];

  if (categoria) {
    const catNum = Number(categoria);
    if (Number.isFinite(catNum)) {
      where += " AND p.id_categoria = ?";
      params.push(catNum);
    }
  }

  if (estado) {
    where += " AND p.estado = ?";
    params.push(estado);
  }

  const baseFrom = `
    FROM PUBLICACION p
    JOIN CATEGORIA c ON c.id_categoria = p.id_categoria
    JOIN USUARIO u   ON u.id_usuario   = p.id_usuario
    ${where}
  `;

  // Sin paginación → comportamiento anterior
  if (!page) {
    const sql = `
      SELECT
        p.id_publicacion,
        p.titulo,
        p.descripcion,
        p.valor_creditos,
        p.estado,
        p.imagen_url,
        c.nombre AS categoria,
        u.nombre AS usuario
      ${baseFrom}
      ORDER BY p.creado_en DESC
    `;
    return prisma.$queryRawUnsafe(sql, ...params);
  }

  // Con paginación
  const currentPage = Math.max(Number(page) || 1, 1);
  const size = Math.max(Number(pageSize) || 10, 1);
  const offset = (currentPage - 1) * size;

  // total
  const [countRow] = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*) AS total ${baseFrom}`,
    ...params
  );
  const total = Number(countRow?.total || 0);

  // items
  const paramsWithLimit = [...params, offset, size];
  const itemsSql = `
    SELECT
      p.id_publicacion,
      p.titulo,
      p.descripcion,
      p.valor_creditos,
      p.estado,
      p.imagen_url,
      c.nombre AS categoria,
      u.nombre AS usuario
    ${baseFrom}
    ORDER BY p.creado_en DESC
    LIMIT ?, ?
  `;
  const items = await prisma.$queryRawUnsafe(itemsSql, ...paramsWithLimit);

  return {
    items,
    total,
    page: currentPage,
    pageSize: size,
    totalPages: Math.ceil(total / size),
  };
}

/* ============================================================
   BÁSICOS
   ============================================================ */

export async function obtenerPublicacionService(idPublicacion) {
  const [row] = await prisma.$queryRaw`
    SELECT
      p.*,
      c.nombre AS categoria,
      u.nombre AS usuario
    FROM PUBLICACION p
    JOIN CATEGORIA c ON c.id_categoria = p.id_categoria
    JOIN USUARIO u   ON u.id_usuario   = p.id_usuario
    WHERE p.id_publicacion = ${idPublicacion}
    LIMIT 1
  `;
  if (!row) {
    const err = new Error("Publicación no encontrada");
    err.status = 404;
    throw err;
  }
  return row;
}

export async function misPublicacionesService(idUsuario) {
  return prisma.$queryRaw`
    SELECT *
    FROM PUBLICACION
    WHERE id_usuario = ${idUsuario}
    ORDER BY creado_en DESC
  `;
}

/* ============================================================
   CREAR PRODUCTO / SERVICIO
   ============================================================ */

// Crear PRODUCTO + PUBLICACION + PUBLICACION_PRODUCTO
export async function crearPublicacionProductoService(idUsuario, body) {
  const {
    titulo,
    descripcion,
    id_categoria,
    valor_creditos,
    imagen_url,
    producto, // { nombre, descripcion, precio, peso }
    cantidad,
    id_um,
  } = body;

  if (
    !titulo ||
    !descripcion ||
    !id_categoria ||
    !valor_creditos ||
    !producto ||
    !cantidad ||
    !id_um
  ) {
    const err = new Error("Faltan datos obligatorios");
    err.status = 400;
    throw err;
  }

  return prisma.$transaction(async (tx) => {
    // 1) Producto
    await tx.$queryRaw`
      INSERT INTO PRODUCTO (id_categoria, nombre, descripcion, precio, peso)
      VALUES (
        ${id_categoria},
        ${producto.nombre},
        ${producto.descripcion || null},
        ${producto.precio || null},
        ${producto.peso || null}
      )
    `;

    const [newProd] = await tx.$queryRaw`
      SELECT *
      FROM PRODUCTO
      WHERE id_producto = LAST_INSERT_ID()
      LIMIT 1
    `;

    // 2) Tipo de publicación PRODUCTO
    const tipoProducto = await tx.$queryRaw`
      SELECT id_tipo_publicacion
      FROM TIPO_PUBLICACION
      WHERE nombre = 'PRODUCTO'
      LIMIT 1
    `;
    if (!tipoProducto.length) {
      const err = new Error("No existe TIPO_PUBLICACION PRODUCTO");
      err.status = 500;
      throw err;
    }

    // 3) Publicación
    await tx.$queryRaw`
      INSERT INTO PUBLICACION (
        id_usuario,
        id_categoria,
        id_tipo_publicacion,
        titulo,
        descripcion,
        valor_creditos,
        imagen_url
      )
      VALUES (
        ${idUsuario},
        ${id_categoria},
        ${tipoProducto[0].id_tipo_publicacion},
        ${titulo},
        ${descripcion},
        ${valor_creditos},
        ${imagen_url || null}
      )
    `;

    const [pub] = await tx.$queryRaw`
      SELECT *
      FROM PUBLICACION
      WHERE id_publicacion = LAST_INSERT_ID()
      LIMIT 1
    `;

    // 4) Relación PUBLICACION_PRODUCTO
    await tx.$queryRaw`
      INSERT INTO PUBLICACION_PRODUCTO (id_publicacion, id_producto, cantidad, id_um)
      VALUES (
        ${pub.id_publicacion},
        ${newProd.id_producto},
        ${cantidad},
        ${id_um}
      )
    `;

    return pub;
  });
}

// Crear SERVICIO + PUBLICACION + PUBLICACION_SERVICIO
export async function crearPublicacionServicioService(idUsuario, body) {
  const {
    titulo,
    descripcion,
    id_categoria,
    valor_creditos,
    imagen_url,
    servicio, // { nombre, descripcion, precio, duracion_min }
    horario,
  } = body;

  if (!titulo || !descripcion || !id_categoria || !valor_creditos || !servicio || !horario) {
    const err = new Error("Faltan datos obligatorios");
    err.status = 400;
    throw err;
  }

  return prisma.$transaction(async (tx) => {
    // 1) Servicio
    await tx.$queryRaw`
      INSERT INTO SERVICIO (id_categoria, estado, nombre, descripcion, precio, duracion_min)
      VALUES (
        ${id_categoria},
        'ACTIVO',
        ${servicio.nombre},
        ${servicio.descripcion || null},
        ${servicio.precio || null},
        ${servicio.duracion_min || null}
      )
    `;

    const [serv] = await tx.$queryRaw`
      SELECT *
      FROM SERVICIO
      WHERE id_servicio = LAST_INSERT_ID()
      LIMIT 1
    `;

    // 2) Tipo de publicación SERVICIO
    const tipoServicio = await tx.$queryRaw`
      SELECT id_tipo_publicacion
      FROM TIPO_PUBLICACION
      WHERE nombre = 'SERVICIO'
      LIMIT 1
    `;
    if (!tipoServicio.length) {
      const err = new Error("No existe TIPO_PUBLICACION SERVICIO");
      err.status = 500;
      throw err;
    }

    // 3) Publicación
    await tx.$queryRaw`
      INSERT INTO PUBLICACION (
        id_usuario,
        id_categoria,
        id_tipo_publicacion,
        titulo,
        descripcion,
        valor_creditos,
        imagen_url
      )
      VALUES (
        ${idUsuario},
        ${id_categoria},
        ${tipoServicio[0].id_tipo_publicacion},
        ${titulo},
        ${descripcion},
        ${valor_creditos},
        ${imagen_url || null}
      )
    `;

    const [pub] = await tx.$queryRaw`
      SELECT *
      FROM PUBLICACION
      WHERE id_publicacion = LAST_INSERT_ID()
      LIMIT 1
    `;

    // 4) Relación PUBLICACION_SERVICIO
    await tx.$queryRaw`
      INSERT INTO PUBLICACION_SERVICIO (id_publicacion, id_servicio, horario)
      VALUES (
        ${pub.id_publicacion},
        ${serv.id_servicio},
        ${horario}
      )
    `;

    return pub;
  });
}

/* ============================================================
   BÚSQUEDA FULLTEXT
   ============================================================ */

export async function buscarPublicacionesService(q) {
  if (!q.trim()) return [];

  return prisma.$queryRawUnsafe(
    `
      SELECT
        id_publicacion,
        titulo,
        descripcion,
        valor_creditos,
        imagen_url
      FROM PUBLICACION
      WHERE MATCH(titulo, descripcion) AGAINST (? IN NATURAL LANGUAGE MODE)
        AND estado = 'PUBLICADA'
      ORDER BY creado_en DESC
    `,
    q
  );
}

/* ============================================================
   CALIFICACIONES
   ============================================================ */

export async function crearCalificacionService({
  idUsuario,
  idPublicacion,
  estrellas,
  comentario,
}) {
  if (!estrellas) {
    const err = new Error("estrellas es obligatorio");
    err.status = 400;
    throw err;
  }

  await prisma.$queryRaw`
    INSERT INTO CALIFICACION (id_usuario, id_publicacion, estrellas, comentario)
    VALUES (${idUsuario}, ${idPublicacion}, ${estrellas}, ${comentario || null})
    ON DUPLICATE KEY UPDATE
      estrellas  = VALUES(estrellas),
      comentario = VALUES(comentario)
  `;

  const [row] = await prisma.$queryRaw`
    SELECT *
    FROM CALIFICACION
    WHERE id_usuario = ${idUsuario}
      AND id_publicacion = ${idPublicacion}
    LIMIT 1
  `;
  return row;
}

export async function listarCalificacionesService(idPublicacion) {
  return prisma.$queryRaw`
    SELECT c.*, u.nombre
    FROM CALIFICACION c
    JOIN USUARIO u ON u.id_usuario = c.id_usuario
    WHERE c.id_publicacion = ${idPublicacion}
    ORDER BY c.id_calificacion DESC
  `;
}

/* ============================================================
   NUEVO: EDITAR / ESTADO / ELIMINAR
   ============================================================ */

// Helper: verificar que el usuario sea dueño o ADMIN
async function assertPuedeEditar(idUsuario, rol, idPublicacion) {
  const [row] = await prisma.$queryRaw`
    SELECT id_usuario
    FROM PUBLICACION
    WHERE id_publicacion = ${idPublicacion}
    LIMIT 1
  `;
  if (!row) {
    const err = new Error("Publicación no encontrada");
    err.status = 404;
    throw err;
  }

  const esAdmin = rol === "ADMIN";
  if (!esAdmin && row.id_usuario !== idUsuario) {
    const err = new Error("No tienes permiso para modificar esta publicación");
    err.status = 403;
    throw err;
  }
}

export async function actualizarPublicacionService(
  idUsuario,
  rol,
  idPublicacion,
  datos
) {
  await assertPuedeEditar(idUsuario, rol, idPublicacion);

  const {
    titulo,
    descripcion,
    id_categoria,
    valor_creditos,
    imagen_url,
  } = datos;

  // No obligo a mandar todo, actualizo solo lo que viene definido
  await prisma.$queryRaw`
    UPDATE PUBLICACION
    SET
      titulo        = COALESCE(${titulo}, titulo),
      descripcion   = COALESCE(${descripcion}, descripcion),
      id_categoria  = COALESCE(${id_categoria}, id_categoria),
      valor_creditos= COALESCE(${valor_creditos}, valor_creditos),
      imagen_url    = COALESCE(${imagen_url}, imagen_url)
    WHERE id_publicacion = ${idPublicacion}
  `;

  return obtenerPublicacionService(idPublicacion);
}

export async function cambiarEstadoPublicacionService(
  idUsuario,
  rol,
  idPublicacion,
  estado
) {
  if (!estado || !ESTADOS_PUBLICACION.includes(estado)) {
    const err = new Error(
      `Estado inválido. Permitidos: ${ESTADOS_PUBLICACION.join(", ")}`
    );
    err.status = 400;
    throw err;
  }

  await assertPuedeEditar(idUsuario, rol, idPublicacion);

  await prisma.$queryRaw`
    UPDATE PUBLICACION
    SET estado = ${estado}
    WHERE id_publicacion = ${idPublicacion}
  `;

  return obtenerPublicacionService(idPublicacion);
}

export async function eliminarPublicacionService(
  idUsuario,
  rol,
  idPublicacion
) {
  // Eliminación lógica ≈ estado = 'ELIMINADA'
  return cambiarEstadoPublicacionService(
    idUsuario,
    rol,
    idPublicacion,
    "ELIMINADA"
  );
}
