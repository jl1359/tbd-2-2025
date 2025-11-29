import { prisma } from "../../config/prisma.js";

// Listar básicas (sin joins pesados)
export async function listarPublicacionesService({ categoria, estado }) {
  let where = "WHERE 1=1";
  const params = [];

  if (categoria) {
    where += " AND p.id_categoria = ?";
    params.push(parseInt(categoria, 10));
  }
  if (estado) {
    where += " AND p.estado = ?";
    params.push(estado);
  }

  const sql = `
    SELECT p.id_publicacion, p.titulo, p.descripcion, p.valor_creditos,
           p.estado, p.imagen_url, c.nombre AS categoria, u.nombre AS usuario
    FROM PUBLICACION p
    JOIN CATEGORIA c ON c.id_categoria = p.id_categoria
    JOIN USUARIO u ON u.id_usuario = p.id_usuario
    ${where}
    ORDER BY p.creado_en DESC
  `;
  // @ts-ignore
  return prisma.$queryRawUnsafe(sql, ...params);
}

export async function obtenerPublicacionService(idPublicacion) {
  const [row] = await prisma.$queryRaw`
    SELECT p.*, c.nombre AS categoria, u.nombre AS usuario
    FROM PUBLICACION p
    JOIN CATEGORIA c ON c.id_categoria = p.id_categoria
    JOIN USUARIO u ON u.id_usuario = p.id_usuario
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
    SELECT p.*
    FROM PUBLICACION p
    WHERE p.id_usuario = ${idUsuario}
    ORDER BY p.creado_en DESC
  `;
}

// Crear PRODUCTO + PUBLICACION + PUBLICACION_PRODUCTO
export async function crearPublicacionProductoService(idUsuario, body) {
  const {
    titulo,
    descripcion,
    id_categoria,
    valor_creditos,
    imagen_url,
    producto,         // { nombre, descripcion, precio, peso }
    cantidad,
    id_um,
  } = body;

  if (!titulo || !descripcion || !id_categoria || !valor_creditos || !producto || !cantidad || !id_um) {
    const err = new Error("Faltan datos obligatorios");
    err.status = 400;
    throw err;
  }

  return prisma.$transaction(async (tx) => {
    const prod = await tx.$queryRaw`
      INSERT INTO PRODUCTO (id_categoria, nombre, descripcion, precio, peso)
      VALUES (${id_categoria}, ${producto.nombre}, ${producto.descripcion || null},
              ${producto.precio || null}, ${producto.peso || null})
    `;

    const [newProd] = await tx.$queryRaw`
      SELECT * FROM PRODUCTO
      WHERE id_producto = LAST_INSERT_ID()
      LIMIT 1
    `;

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

    await tx.$queryRaw`
      INSERT INTO PUBLICACION
        (id_usuario, id_categoria, id_tipo_publicacion, titulo, descripcion, valor_creditos, imagen_url)
      VALUES
        (${idUsuario}, ${id_categoria}, ${tipoProducto[0].id_tipo_publicacion},
         ${titulo}, ${descripcion}, ${valor_creditos}, ${imagen_url || null})
    `;

    const [pub] = await tx.$queryRaw`
      SELECT * FROM PUBLICACION WHERE id_publicacion = LAST_INSERT_ID() LIMIT 1
    `;

    await tx.$queryRaw`
      INSERT INTO PUBLICACION_PRODUCTO (id_publicacion, id_producto, cantidad, id_um)
      VALUES (${pub.id_publicacion}, ${newProd.id_producto}, ${cantidad}, ${id_um})
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
    await tx.$queryRaw`
      INSERT INTO SERVICIO (id_categoria, estado, nombre, descripcion, precio, duracion_min)
      VALUES (${id_categoria}, 'ACTIVO', ${servicio.nombre}, ${servicio.descripcion || null},
              ${servicio.precio || null}, ${servicio.duracion_min || null})
    `;

    const [serv] = await tx.$queryRaw`
      SELECT * FROM SERVICIO WHERE id_servicio = LAST_INSERT_ID() LIMIT 1
    `;

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

    await tx.$queryRaw`
      INSERT INTO PUBLICACION
        (id_usuario, id_categoria, id_tipo_publicacion, titulo, descripcion, valor_creditos, imagen_url)
      VALUES
        (${idUsuario}, ${id_categoria}, ${tipoServicio[0].id_tipo_publicacion},
         ${titulo}, ${descripcion}, ${valor_creditos}, ${imagen_url || null})
    `;

    const [pub] = await tx.$queryRaw`
      SELECT * FROM PUBLICACION WHERE id_publicacion = LAST_INSERT_ID() LIMIT 1
    `;

    await tx.$queryRaw`
      INSERT INTO PUBLICACION_SERVICIO (id_publicacion, id_servicio, horario)
      VALUES (${pub.id_publicacion}, ${serv.id_servicio}, ${horario})
    `;

    return pub;
  });
}

// Búsqueda FULLTEXT
export async function buscarPublicacionesService(q) {
  if (!q.trim()) return [];
  return prisma.$queryRawUnsafe(
    `
    SELECT id_publicacion, titulo, descripcion, valor_creditos, imagen_url
    FROM PUBLICACION
    WHERE MATCH(titulo, descripcion) AGAINST (? IN NATURAL LANGUAGE MODE)
      AND estado = 'PUBLICADA'
    ORDER BY creado_en DESC
    `,
    q
  );
}

// Calificaciones
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
      estrellas = VALUES(estrellas),
      comentario = VALUES(comentario)
  `;

  const [row] = await prisma.$queryRaw`
    SELECT * FROM CALIFICACION
    WHERE id_usuario = ${idUsuario} AND id_publicacion = ${idPublicacion}
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
