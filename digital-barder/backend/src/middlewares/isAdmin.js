// src/middlewares/isAdmin.js

// Middleware simple: solo ADMIN
export function isAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "No autenticado" });
  }

  if (req.user.rol !== "ADMIN") {
    return res.status(403).json({ message: "Acceso solo para administradores" });
  }

  next();
}

// Middleware más general: aceptar varios roles
export function hasRole(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({ message: "No tienes permisos suficientes" });
    }

    next();
  };
}
