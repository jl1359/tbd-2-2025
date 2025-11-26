import {
  registrarUsuarioService,
  loginService,
  obtenerPerfilService,
} from "./auth.service.js";

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

export async function meController(req, res, next) {
  try {
    const idUsuario = req.user.id_usuario;
    const perfil = await obtenerPerfilService(idUsuario);
    res.json(perfil);
  } catch (err) {
    next(err);
  }
}
