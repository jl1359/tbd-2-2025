// src/middlewares/errorHandler.js

// Middleware de manejo global de errores (SIEMPRE 4 parámetros)
export function errorHandler(err, req, res, next) {
  console.error("❌ Error:", err);

  // Si ya se empezó a enviar la respuesta, delega a Express
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || err.statusCode || 500;
  const message =
    err.message || "Ocurrió un error inesperado en el servidor";

  const response = { message };

  // En desarrollo podemos enviar más detalles
  if (process.env.NODE_ENV !== "production") {
    response.stack = err.stack;
    if (err.code) response.code = err.code;
  }

  res.status(status).json(response);
}
