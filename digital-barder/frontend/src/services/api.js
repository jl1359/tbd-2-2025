// frontend/src/services/api.js
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

function authHeaders() {
  const token = localStorage.getItem("token");
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function api(path, { method = "GET", body, headers = {} } = {}) {
  const isJsonBody = body && !(body instanceof FormData);

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...(isJsonBody ? { "Content-Type": "application/json" } : {}),
      ...authHeaders(),
      ...headers,
    },
    body: isJsonBody ? JSON.stringify(body) : body,
  });

  const text = await res.text();

  if (!res.ok) {
    let message =
      res.statusText || `Error HTTP ${res.status}` || "Error en la solicitud";

    if (text) {
      try {
        const parsed = JSON.parse(text);
        if (parsed && parsed.message) {
          message = parsed.message;
        }
      } catch {
        message = text;
      }
    }

    throw new Error(message);
  }

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    console.warn("Respuesta no JSON para", path, "=>", text);
    return text;
  }
}

export async function login({ correo, password }) {
  const data = await api("/auth/login", {
    method: "POST",
    body: { correo, password },
  });

  if (data?.token) {
    localStorage.setItem("token", data.token);
    if (data.usuario) {
      localStorage.setItem("usuario", JSON.stringify(data.usuario));
    }
  }

  return data;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
}

export async function getHealth() {
  return api("/health");
}

function buildRangeQuery(desde, hasta) {
  const params = new URLSearchParams();
  if (desde) params.append("desde", desde);
  if (hasta) params.append("hasta", hasta);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function register({ nombre, apellido, correo, password, telefono }) {
  return api("/auth/register", {
    method: "POST",
    body: { nombre, apellido, correo, password, telefono },
  });
}

//REPORTES

// Usuarios activos
export function getReporteUsuariosActivos({ desde, hasta } = {}) {
  return api(`/reportes/usuarios-activos${buildRangeQuery(desde, hasta)}`);
}

// Usuarios abandonados
export function getReporteUsuariosAbandonados({ desde, hasta } = {}) {
  return api(`/reportes/usuarios-abandonados${buildRangeQuery(desde, hasta)}`);
}

// Ingresos por venta de créditos
export function getReporteIngresosCreditos({ desde, hasta } = {}) {
  return api(`/reportes/ingresos-creditos${buildRangeQuery(desde, hasta)}`);
}

// Créditos generados vs consumidos
export function getReporteCreditosGeneradosVsConsumidos({ desde, hasta } = {}) {
  return api(
    `/reportes/creditos-generados-consumidos${buildRangeQuery(desde, hasta)}`
  );
}

// Intercambios por categoría
export function getReporteIntercambiosCategoria({ desde, hasta } = {}) {
  return api(
    `/reportes/intercambios-categoria${buildRangeQuery(desde, hasta)}`
  );
}

// Publicaciones vs intercambios
export function getReportePublicacionesVsIntercambios({ desde, hasta } = {}) {
  return api(
    `/reportes/publicaciones-vs-intercambios${buildRangeQuery(desde, hasta)}`
  );
}

// Impacto acumulado (REPORTE_IMPACTO)
export function getReporteImpactoAcumulado({ idTipoReporte, idPeriodo }) {
  const params = new URLSearchParams();
  if (idTipoReporte != null) params.append("idTipoReporte", idTipoReporte);
  if (idPeriodo != null) params.append("idPeriodo", idPeriodo);
  const qs = params.toString();
  return api(`/reportes/impacto-acumulado?${qs}`);
}

//REPORTES 

// Ranking de usuarios por impacto
export function getReporteRankingUsuarios({ idPeriodo = null, limit = 10 } = {}) {
  const params = new URLSearchParams();
  if (idPeriodo != null && idPeriodo !== "") {
    params.append("idPeriodo", idPeriodo);
  }
  if (limit != null) {
    params.append("limit", String(limit));
  }
  const qs = params.toString();
  return api(`/reportes/ranking-usuarios?${qs}`);
}

// Usuarios premium
export function getReporteUsuariosPremium({ desde, hasta } = {}) {
  return api(`/reportes/usuarios-premium${buildRangeQuery(desde, hasta)}`);
}

// Usuarios nuevos (primer login)
export function getReporteUsuariosNuevos({ desde, hasta } = {}) {
  return api(`/reportes/usuarios-nuevos${buildRangeQuery(desde, hasta)}`);
}

// Saldos de créditos por usuario (top N)
export function getReporteSaldosUsuarios({ limit = 20 } = {}) {
  const params = new URLSearchParams();
  params.append("limit", String(limit));
  const qs = params.toString();
  return api(`/reportes/saldos-usuarios?${qs}`);
}

// Actividades sostenibles por usuario
export function getReporteActividadesSostenibles({ desde, hasta } = {}) {
  return api(
    `/reportes/actividades-sostenibles${buildRangeQuery(desde, hasta)}`
  );
}

// Impacto ambiental por categoría
export function getReporteImpactoPorCategoria({ idPeriodo }) {
  const params = new URLSearchParams();
  if (idPeriodo != null) params.append("idPeriodo", idPeriodo);
  const qs = params.toString();
  return api(`/reportes/impacto-categoria?${qs}`);
}
// ================= WALLET / CRÉDITOS =================

// Saldo de créditos del usuario logueado
// GET /api/wallet/mis-creditos
export function getMisCreditos() {
  return api("/wallet/mis-creditos");
}

// Movimientos de la billetera
// GET /api/wallet/mis-movimientos
export function getMisMovimientos() {
  return api("/wallet/mis-movimientos");
}

// Paquetes de créditos disponibles
// GET /api/catalogos/paquetes-creditos  (ajusta si tu ruta es otra)
export function getPaquetesCreditos() {
  return api("/catalogos/paquetes-creditos");
}

// Registrar compra de un paquete de créditos
// POST /api/wallet/compra-creditos
export function crearCompraCreditos({ idPaquete, idTransaccionPago = null }) {
  return api("/wallet/compra-creditos", {
    method: "POST",
    body: {
      idPaquete,
      idTransaccionPago,
    },
  });
}

// Historial de compras de créditos
// GET /api/wallet/compras
export function getMisComprasCreditos() {
  return api("/wallet/compras");
}

// ================= INTERCAMBIOS =================

// Crear un intercambio (comprar una publicación con créditos)
// body: { id_publicacion, creditos }
export function crearIntercambio({ id_publicacion, creditos }) {
  return api("/intercambios", {
    method: "POST",
    body: { id_publicacion, creditos },
  });
}

// Listar mis compras (donde yo soy el comprador)
export function getMisComprasIntercambios() {
  return api("/intercambios/mis-compras");
}

// Listar mis ventas (donde yo soy el vendedor)
export function getMisVentasIntercambios() {
  return api("/intercambios/mis-ventas");
}

// Detalle de una transacción individual
export function getDetalleTransaccion(idTransaccion) {
  return api(`/intercambios/${idTransaccion}`);
}
// =============== ACTIVIDADES SOSTENIBLES ===============

// Registrar una nueva actividad sostenible del usuario actual
export function registrarActividadSostenible({
  id_tipo_actividad,
  descripcion,
  creditos_otorgados,
  evidencia_url,
}) {
  return api("/actividades-sostenibles", {
    method: "POST",
    body: {
      id_tipo_actividad,
      descripcion,
      creditos_otorgados,
      evidencia_url,
    },
  });
}

// Obtener MIS actividades sostenibles (historial)
export function getMisActividadesSostenibles() {
  return api("/actividades-sostenibles/mias");
}

// =============== LOGROS ===============

// Lista de logros ganados por el usuario actual
export function getMisLogros() {
  return api("/logros/mios");
}
// =============== PROMOCIONES ===============

// Listar todas las promociones (admin)
export function getPromociones() {
  return api("/promociones");
}

// Crear una nueva promoción
export function crearPromocion(body) {
  return api("/promociones", {
    method: "POST",
    body,
  });
}

// Cambiar estado de una promoción (ACTIVA / INACTIVA / etc.)
export function cambiarEstadoPromocion(id_promocion, estado) {
  return api(`/promociones/${id_promocion}/estado`, {
    method: "PATCH",
    body: { estado },
  });
}

// Vincular una publicación a una promoción
export function vincularPublicacionPromocion(id_promocion, id_publicacion) {
  return api(`/promociones/${id_promocion}/publicaciones`, {
    method: "POST",
    body: { id_publicacion },
  });
}
// =============== PUBLICIDAD ===============

// =============== PUBLICIDAD ===============

// Publica: listar publicidad ACTIVA (sin auth)
export function getPublicidadActiva() {
  // backend: GET /api/publicidad/activa
  return api("/publicidad/activa");
}

// Admin: listar todas las publicidades
export function getPublicidadAdmin() {
  // backend: GET /api/publicidad/admin
  return api("/publicidad/admin");
}

// Admin: crear una nueva campaña de publicidad
export function crearPublicidad(body) {
  // backend: POST /api/publicidad
  return api("/publicidad", {
    method: "POST",
    body,
  });
}

// Admin: cambiar estado (PROGRAMADA → ACTIVA, etc.)
export function cambiarEstadoPublicidad(idPublicidad, estado) {
  // backend: PATCH /api/publicidad/:id/estado
  return api(`/publicidad/${idPublicidad}/estado`, {
    method: "PATCH",
    body: { estado },
  });
}

// Admin: eliminar publicidad (lógico)
export function eliminarPublicidad(idPublicidad) {
  // backend: DELETE /api/publicidad/:id
  return api(`/publicidad/${idPublicidad}`, {
    method: "DELETE",
  });
}

