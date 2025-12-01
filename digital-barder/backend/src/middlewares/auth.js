// src/middlewares/auth.js
import jwt from "jsonwebtoken";

// Middleware principal: requiere token válido
export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  // Esperamos "Authorization: Bearer <token>"
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token de autenticación faltante" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // En el payload nosotros pusimos: id_usuario, correo, rol
    req.user = payload;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Token inválido o expirado" });
  }
}

// Versión opcional: si hay token lo lee, si no, deja pasar
export function optionalAuth(req, _res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
  } catch {
    // si falla, simplemente no ponemos req.user
  }
  next();
}
