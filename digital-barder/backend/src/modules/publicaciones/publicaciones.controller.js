import {
  listarPublicacionesService,
  obtenerPublicacionService,
  crearPublicacionProductoService,
  crearPublicacionServicioService,
  misPublicacionesService,
  buscarPublicacionesService,
  crearCalificacionService,
  listarCalificacionesService,
  actualizarPublicacionService,
  cambiarEstadoPublicacionService,
  eliminarPublicacionService,
} from "./publicaciones.service.js";

export const listarPublicacionesController = async (req, res, next) => {
  try {
    const { categoria, estado, page, pageSize } = req.query;

    const pageNum = page ? Number(page) : undefined;
    const pageSizeNum = pageSize ? Number(pageSize) : undefined;

    const data = await listarPublicacionesService({
      categoria,
      estado,
      page: pageNum,
      pageSize: pageSizeNum,
    });

    res.json(data);
  } catch (e) {
    next(e);
  }
};

export const obtenerPublicacionController = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ message: "ID de publicación inválido" });
    }
    const pub = await obtenerPublicacionService(id);
    res.json(pub);
  } catch (e) {
    next(e);
  }
};

export const crearPublicacionProductoController = async (req, res, next) => {
  try {
    const idUsuario = req.user.id_usuario;
    const pub = await crearPublicacionProductoService(idUsuario, req.body);
    res.status(201).json(pub);
  } catch (e) {
    next(e);
  }
};

export const crearPublicacionServicioController = async (req, res, next) => {
  try {
    const idUsuario = req.user.id_usuario;
    const pub = await crearPublicacionServicioService(idUsuario, req.body);
    res.status(201).json(pub);
  } catch (e) {
    next(e);
  }
};

export const misPublicacionesController = async (req, res, next) => {
  try {
    const idUsuario = req.user.id_usuario;
    const pubs = await misPublicacionesService(idUsuario);
    res.json(pubs);
  } catch (e) {
    next(e);
  }
};

export const buscarPublicacionesController = async (req, res, next) => {
  try {
    const q = req.query.q || "";
    const result = await buscarPublicacionesService(q);
    res.json(result);
  } catch (e) {
    next(e);
  }
};

export const crearCalificacionController = async (req, res, next) => {
  try {
    const idUsuario = req.user.id_usuario;
    const idPublicacion = Number(req.params.id);

    if (!Number.isFinite(idPublicacion)) {
      return res.status(400).json({ message: "ID de publicación inválido" });
    }

    const { estrellas, comentario } = req.body;
    const calif = await crearCalificacionService({
      idUsuario,
      idPublicacion,
      estrellas,
      comentario,
    });

    res.status(201).json(calif);
  } catch (e) {
    next(e);
  }
};

export const listarCalificacionesController = async (req, res, next) => {
  try {
    const idPublicacion = Number(req.params.id);
    if (!Number.isFinite(idPublicacion)) {
      return res.status(400).json({ message: "ID de publicación inválido" });
    }

    const califs = await listarCalificacionesService(idPublicacion);
    res.json(califs);
  } catch (e) {
    next(e);
  }
};

/* ============================================================
   NUEVO: Editar, cambiar estado y eliminar publicación
   ============================================================ */

/**
 * PUT /api/publicaciones/:id
 * Permite al dueño (o ADMIN) actualizar datos básicos de la publicación.
 */
export const actualizarPublicacionController = async (req, res, next) => {
  try {
    const idPublicacion = Number(req.params.id);
    if (!Number.isFinite(idPublicacion)) {
      return res.status(400).json({ message: "ID de publicación inválido" });
    }

    const idUsuario = req.user.id_usuario;
    const rol = req.user.rol;

    const pub = await actualizarPublicacionService(
      idUsuario,
      rol,
      idPublicacion,
      req.body
    );

    res.json({
      message: "Publicación actualizada correctamente",
      publicacion: pub,
    });
  } catch (e) {
    next(e);
  }
};

/**
 * PATCH /api/publicaciones/:id/estado
 * Cambia el estado de la publicación (BORRADOR, PUBLICADA, PAUSADA, AGOTADA, OCULTA, ELIMINADA)
 */
export const cambiarEstadoPublicacionController = async (req, res, next) => {
  try {
    const idPublicacion = Number(req.params.id);
    if (!Number.isFinite(idPublicacion)) {
      return res.status(400).json({ message: "ID de publicación inválido" });
    }

    const { estado } = req.body;
    const idUsuario = req.user.id_usuario;
    const rol = req.user.rol;

    const pub = await cambiarEstadoPublicacionService(
      idUsuario,
      rol,
      idPublicacion,
      estado
    );

    res.json({
      message: "Estado de publicación actualizado",
      publicacion: pub,
    });
  } catch (e) {
    next(e);
  }
};

/**
 * DELETE /api/publicaciones/:id
 * Eliminación lógica → se marca estado = 'ELIMINADA'
 */
export const eliminarPublicacionController = async (req, res, next) => {
  try {
    const idPublicacion = Number(req.params.id);
    if (!Number.isFinite(idPublicacion)) {
      return res.status(400).json({ message: "ID de publicación inválido" });
    }

    const idUsuario = req.user.id_usuario;
    const rol = req.user.rol;

    const pub = await eliminarPublicacionService(idUsuario, rol, idPublicacion);

    res.json({
      message: "Publicación eliminada (estado = ELIMINADA)",
      publicacion: pub,
    });
  } catch (e) {
    next(e);
  }
};
