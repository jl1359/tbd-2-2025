import {
  listarPublicacionesService,
  obtenerPublicacionService,
  crearPublicacionProductoService,
  crearPublicacionServicioService,
  misPublicacionesService,
  buscarPublicacionesService,
  crearCalificacionService,
  listarCalificacionesService,
} from "./publicaciones.service.js";

export const listarPublicacionesController = async (req, res, next) => {
  try {
    const { categoria, estado } = req.query;
    res.json(await listarPublicacionesService({ categoria, estado }));
  } catch (e) { next(e); }
};

export const obtenerPublicacionController = async (req, res, next) => {
  try { res.json(await obtenerPublicacionService(+req.params.id)); }
  catch (e) { next(e); }
};

export const crearPublicacionProductoController = async (req, res, next) => {
  try {
    const idUsuario = req.user.id_usuario;
    const pub = await crearPublicacionProductoService(idUsuario, req.body);
    res.status(201).json(pub);
  } catch (e) { next(e); }
};

export const crearPublicacionServicioController = async (req, res, next) => {
  try {
    const idUsuario = req.user.id_usuario;
    const pub = await crearPublicacionServicioService(idUsuario, req.body);
    res.status(201).json(pub);
  } catch (e) { next(e); }
};

export const misPublicacionesController = async (req, res, next) => {
  try {
    const idUsuario = req.user.id_usuario;
    res.json(await misPublicacionesService(idUsuario));
  } catch (e) { next(e); }
};

export const buscarPublicacionesController = async (req, res, next) => {
  try { res.json(await buscarPublicacionesService(req.query.q || "")); }
  catch (e) { next(e); }
};

export const crearCalificacionController = async (req, res, next) => {
  try {
    const idUsuario = req.user.id_usuario;
    const idPublicacion = +req.params.id;
    const { estrellas, comentario } = req.body;
    const calif = await crearCalificacionService({
      idUsuario, idPublicacion, estrellas, comentario,
    });
    res.status(201).json(calif);
  } catch (e) { next(e); }
};

export const listarCalificacionesController = async (req, res, next) => {
  try {
    res.json(await listarCalificacionesService(+req.params.id));
  } catch (e) { next(e); }
};
