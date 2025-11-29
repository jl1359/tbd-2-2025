import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma.js";

// Helper: obtener id_rol por nombre
async function getRolId(nombreRol) {
  const rows = await prisma.$queryRaw`
    SELECT id_rol FROM ROL WHERE nombre = ${nombreRol} LIMIT 1
  `;
  if (!rows.length) {
    throw new Error(`No existe el rol ${nombreRol}`);
  }
  return rows[0].id_rol;
}

// Helper: obtener id_resultado de BITACORA_ACCESO (OK / FAIL)
async function getResultadoAccesoId(nombre) {
  const rows = await prisma.$queryRaw`
    SELECT id_resultado FROM RESULTADO_ACCESO WHERE nombre = ${nombre} LIMIT 1
  `;
  if (!rows.length) {
    throw new Error(`No existe RESULTADO_ACCESO '${nombre}'`);
  }
  return rows[0].id_resultado;
}

export async function registrarUsuarioService({
  nombre,
  apellido,
  correo,
  password,
  telefono,
}) {
  // ¿Correo ya existe?
  const existente = await prisma.$queryRaw`
    SELECT id_usuario FROM USUARIO WHERE correo = ${correo} LIMIT 1
  `;
  if (existente.length) {
    const error = new Error("El correo ya está registrado");
    error.status = 409;
    throw error;
  }

  const hash = await bcrypt.hash(password, 10);
  const idRolComprador = await getRolId("COMPRADOR");

  await prisma.$queryRaw`
    INSERT INTO USUARIO (id_rol, estado, nombre, apellido, correo, password_hash, telefono, url_perfil)
    VALUES (${idRolComprador}, 'ACTIVO', ${nombre}, ${apellido || null}, ${correo},
            ${hash}, ${telefono || null}, NULL)
  `;

  // Volver a leer el usuario insertado
  const usuarioRows = await prisma.$queryRaw`
    SELECT u.id_usuario, u.nombre, u.apellido, u.correo, u.telefono, r.nombre AS rol
    FROM USUARIO u
    JOIN ROL r ON r.id_rol = u.id_rol
    WHERE u.correo = ${correo}
    LIMIT 1
  `;

  return usuarioRows[0];
}

export async function loginService({ correo, password, ip, userAgent }) {
  const usuarios = await prisma.$queryRaw`
    SELECT u.id_usuario, u.password_hash, u.nombre, u.apellido, u.correo,
           u.estado, r.nombre AS rol
    FROM USUARIO u
    JOIN ROL r ON r.id_rol = u.id_rol
    WHERE u.correo = ${correo}
    LIMIT 1
  `;

  const user = usuarios[0];
  let resultadoNombre = "FAIL";

  if (!user) {
    const idFail = await getResultadoAccesoId(resultadoNombre);
    // Podrías registrar intento fallido sin usuario si quisieras
    const error = new Error("Credenciales inválidas");
    error.status = 401;
    throw error;
  }

  // ===== CAMBIO IMPORTANTE: compatibilidad con hashes bcrypt y texto plano =====
  let ok = false;

  try {
    // Si parece un hash bcrypt ($2a$, $2b$, $2y$...), usamos bcrypt.compare
    if (user.password_hash && user.password_hash.startsWith("$2")) {
      ok = await bcrypt.compare(password, user.password_hash);
    } else {
      // Si NO parece hash, asumimos que está en texto plano (ej: '123456')
      ok = password === user.password_hash;
    }
  } catch (e) {
    // Si bcrypt truena por hash inválido, hacemos fallback a texto plano
    ok = password === user.password_hash;
  }

  if (!ok) {
    const idFail = await getResultadoAccesoId(resultadoNombre);
    await prisma.$queryRaw`
      INSERT INTO BITACORA_ACCESO (id_usuario, fecha, direccion_ip, user_agent, id_resultado)
      VALUES (${user.id_usuario}, NOW(), ${ip}, ${userAgent}, ${idFail})
    `;
    const error = new Error("Credenciales inválidas");
    error.status = 401;
    throw error;
  }

  // Login correcto
  resultadoNombre = "OK";
  const idOk = await getResultadoAccesoId(resultadoNombre);
  await prisma.$queryRaw`
    INSERT INTO BITACORA_ACCESO (id_usuario, fecha, direccion_ip, user_agent, id_resultado)
    VALUES (${user.id_usuario}, NOW(), ${ip}, ${userAgent}, ${idOk})
  `;

  const payload = {
    id_usuario: user.id_usuario,
    correo: user.correo,
    rol: user.rol,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "2h",
  });

  // No devolver hash
  delete user.password_hash;

  return {
    token,
    usuario: {
      id_usuario: user.id_usuario,
      nombre: user.nombre,
      apellido: user.apellido,
      correo: user.correo,
      rol: user.rol,
      estado: user.estado,
    },
  };
}

export async function obtenerPerfilService(idUsuario) {
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
