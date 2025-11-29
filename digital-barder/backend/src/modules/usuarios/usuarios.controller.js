import {
  listarUsuariosService,
  crearUsuarioAdminService,
  actualizarUsuarioService,
  cambiarEstadoUsuarioService,
  obtenerHistorialUsuarioService,
} from "./usuarios.service.js";

export async function listarUsuariosController(req, res, next) {
  try {
    const usuarios = await listarUsuariosService();
    res.json(usuarios);
  } catch (err) {
    next(err);
  }
}

export async function crearUsuarioAdminController(req, res, next) {
  try {
    const usuario = await crearUsuarioAdminService(req.body);
    res.status(201).json(usuario);
  } catch (err) {
    next(err);
  }
}

export async function actualizarUsuarioController(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const usuario = await actualizarUsuarioService(id, req.body);
    res.json(usuario);
  } catch (err) {
    next(err);
  }
}

export async function cambiarEstadoUsuarioController(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const { estado } = req.body;
    const usuario = await cambiarEstadoUsuarioService(id, estado);
    res.json(usuario);
  } catch (err) {
    next(err);
  }
}

export async function obtenerHistorialUsuarioController(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const historial = await obtenerHistorialUsuarioService(id);
    res.json(historial);
  } catch (err) {
    next(err);
  }
}
