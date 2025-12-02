// src/modules/usuarios/usuarios.service.js
import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma.js";

export async function listarUsuariosService() {
  const rows = await prisma.$queryRaw`
    SELECT u.id_usuario, u.nombre, u.apellido, u.correo, u.telefono,
           u.estado, r.nombre AS rol
    FROM USUARIO u
    JOIN ROL r ON r.id_rol = u.id_rol
    ORDER BY u.id_usuario DESC
  `;
  return rows;
}

export async function crearUsuarioAdminService({
  nombre,
  apellido,
  correo,
  telefono,
  password,
  id_rol,
  estado = "ACTIVO",
}) {
  if (!nombre || !correo || !password || !id_rol) {
    const err = new Error("nombre, correo, password e id_rol son obligatorios");
    err.status = 400;
    throw err;
  }

  const existente = await prisma.$queryRaw`
    SELECT id_usuario FROM USUARIO WHERE correo = ${correo} LIMIT 1
  `;
  if (existente.length) {
    const error = new Error("El correo ya está registrado");
    error.status = 409;
    throw error;
  }

  const hash = await bcrypt.hash(password, 10);

  await prisma.$queryRaw`
    INSERT INTO USUARIO (id_rol, estado, nombre, apellido, correo, password_hash, telefono, url_perfil)
    VALUES (${id_rol}, ${estado}, ${nombre}, ${apellido || null}, ${correo}, ${hash},
            ${telefono || null}, NULL)
  `;

  const rows = await prisma.$queryRaw`
    SELECT u.id_usuario, u.nombre, u.apellido, u.correo, u.telefono,
           u.estado, r.nombre AS rol
    FROM USUARIO u
    JOIN ROL r ON r.id_rol = u.id_rol
    WHERE u.correo = ${correo}
    LIMIT 1
  `;
  return rows[0];
}

export async function actualizarUsuarioService(idUsuario, data) {
  const { nombre, apellido, telefono, id_rol } = data;

  // Normalizar undefined → null para que COALESCE funcione como "no cambiar"
  const nombreParam = nombre === undefined ? null : nombre;
  const apellidoParam = apellido === undefined ? null : apellido;
  const telefonoParam = telefono === undefined ? null : telefono;
  const rolParam = id_rol === undefined ? null : id_rol;

  await prisma.$queryRaw`
    UPDATE USUARIO
    SET nombre  = COALESCE(${nombreParam}, nombre),
        apellido = COALESCE(${apellidoParam}, apellido),
        telefono = COALESCE(${telefonoParam}, telefono),
        id_rol   = COALESCE(${rolParam}, id_rol)
    WHERE id_usuario = ${idUsuario}
  `;

  const rows = await prisma.$queryRaw`
    SELECT u.id_usuario, u.nombre, u.apellido, u.correo, u.telefono,
           u.estado, r.nombre AS rol
    FROM USUARIO u
    JOIN ROL r ON r.id_rol = u.id_rol
    WHERE u.id_usuario = ${idUsuario}
    LIMIT 1
  `;
  if (!rows.length) {
    const err = new Error("Usuario no encontrado");
    err.status = 404;
    throw err;
  }
  return rows[0];
}

export async function cambiarEstadoUsuarioService(idUsuario, estado) {
  if (!estado) {
    const err = new Error("estado es obligatorio");
    err.status = 400;
    throw err;
  }

  await prisma.$queryRaw`
    UPDATE USUARIO
    SET estado = ${estado}
    WHERE id_usuario = ${idUsuario}
  `;

  const rows = await prisma.$queryRaw`
    SELECT u.id_usuario, u.nombre, u.apellido, u.correo, u.telefono,
           u.estado, r.nombre AS rol
    FROM USUARIO u
    JOIN ROL r ON r.id_rol = u.id_rol
    WHERE u.id_usuario = ${idUsuario}
    LIMIT 1
  `;
  if (!rows.length) {
    const err = new Error("Usuario no encontrado");
    err.status = 404;
    throw err;
  }
  return rows[0];
}

export async function obtenerHistorialUsuarioService(idUsuario) {
  // Llama a tu SP sp_obtener_historial_usuario
  const [rows] = await prisma.$queryRawUnsafe(
    "CALL sp_obtener_historial_usuario(?)",
    idUsuario
  );
  // rows ya es el primer resultset del CALL
  return rows;
}
