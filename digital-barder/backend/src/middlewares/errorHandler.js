// src/middlewares/errorHandler.js
export function errorHandler(err, req, res, _next) {
  console.error("❌ Error en la API:", err);

  // Errores de negocio levantados con SIGNAL o validaciones
  if (err?.errno === 1644 || err?.code === "P2010") {
    return res.status(400).json({
      ok: false,
      message: err.message ?? "Error de negocio en la base de datos",
    });
  }

  // Errores de Prisma en consultas RAW
  if (err?.code && err?.clientVersion) {
    return res.status(500).json({
      ok: false,
      message: err.message || "Error de base de datos (Prisma)",
    });
  }

  // Genérico
  return res.status(500).json({
    ok: false,
    message: err.message || "Error interno del servidor",
  });
}
