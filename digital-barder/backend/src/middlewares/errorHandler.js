// src/middlewares/errorHandler.js
export function errorHandler(err, req, res, _next) {
  console.error('❌ Error:', err)

  // Errores personalizados SQL (SIGNAL 45000)
  if (err?.code === 'P2010' || err?.errno === 1644) {
    return res.status(400).json({
      ok: false,
      message: err.message ?? 'Error de negocio en la base de datos',
    })
  }

  res.status(500).json({
    ok: false,
    message: 'Error interno del servidor',
  })
}
