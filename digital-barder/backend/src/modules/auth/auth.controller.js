import {
  registrarUsuarioService,
  loginService,
  obtenerPerfilService,
  actualizarPerfilService,
  cambiarPasswordService,
} from "./auth.service.js";

/**
 * POST /api/auth/register
 * Registro público (rol USUARIO)
 */
export async function registerController(req, res, next) {
  try {
    const { nombre, apellido, correo, password, telefono } = req.body;

    if (!nombre || !correo || !password) {
      return res
        .status(400)
        .json({ message: "nombre, correo y password son obligatorios" });
    }

    const usuario = await registrarUsuarioService({
      nombre,
      apellido,
      correo,
      password,
      telefono,
    });

    res.status(201).json({
      message: "Usuario registrado correctamente",
      usuario,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 */
export async function loginController(req, res, next) {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res
        .status(400)
        .json({ message: "correo y password son obligatorios" });
    }

    const result = await loginService({
      correo,
      password,
      ip: req.ip,
      userAgent: req.headers["user-agent"] || "",
    });

    res.json(result); // { token, usuario }
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 * Perfil del usuario actual
 */
export async function meController(req, res, next) {
  try {
    const idUsuario = req.user.id_usuario;
    const perfil = await obtenerPerfilService(idUsuario);
    res.json(perfil);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/auth/me
 * Actualizar perfil del usuario logueado
 * Campos permitidos: nombre, apellido, telefono, url_perfil
 */
export async function updateProfileController(req, res, next) {
  try {
    const idUsuario = req.user.id_usuario;
    const { nombre, apellido, telefono, url_perfil } = req.body;

    if (
      nombre === undefined &&
      apellido === undefined &&
      telefono === undefined &&
      url_perfil === undefined
    ) {
      return res
        .status(400)
        .json({ message: "No se envió ningún campo para actualizar" });
    }

    const usuarioActualizado = await actualizarPerfilService(idUsuario, {
      nombre,
      apellido,
      telefono,
      url_perfil,
    });

    return res.json({
      message: "Perfil actualizado correctamente",
      usuario: usuarioActualizado,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/auth/me/password
 * Cambiar contraseña del usuario logueado
 * Body: { password_actual, password_nueva }
 */
export async function changePasswordController(req, res, next) {
  try {
    const idUsuario = req.user.id_usuario;
    const { password_actual, password_nueva } = req.body;

    if (!password_actual || !password_nueva) {
      return res.status(400).json({
        message: "password_actual y password_nueva son obligatorios",
      });
    }

    if (password_nueva.length < 6) {
      return res.status(400).json({
        message: "La nueva contraseña debe tener al menos 6 caracteres",
      });
    }

    await cambiarPasswordService(idUsuario, password_actual, password_nueva);

    return res.json({
      message: "Contraseña actualizada correctamente",
    });
  } catch (err) {
    next(err);
  }
}
