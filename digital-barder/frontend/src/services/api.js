// ================== CONFIGURACIÓN BASE ==================

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";
const API_BASE_URL = API_URL.replace(/\/api\/?$/, "");

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

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    console.warn("Respuesta no JSON para", path, "=>", text);
    return text;
  }
}

// ================== AUTENTICACIÓN ==================

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

export async function register({
  nombre,
  apellido,
  correo,
  password,
  telefono,
}) {
  return api("/auth/register", {
    method: "POST",
    body: { nombre, apellido, correo, password, telefono },
  });
}

// =====================================================
// ======================= REPORTES =====================
// =====================================================

function buildRangeQuery(desde, hasta) {
  const params = new URLSearchParams();
  if (desde) params.append("desde", desde);
  if (hasta) params.append("hasta", hasta);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

// Usuarios activos
export function getReporteUsuariosActivos({ desde, hasta } = {}) {
  return api(`/reportes/usuarios-activos${buildRangeQuery(desde, hasta)}`);
}

// Usuarios abandonados
export function getReporteUsuariosAbandonados({ desde, hasta } = {}) {
  return api(
    `/reportes/usuarios-abandonados${buildRangeQuery(desde, hasta)}`
  );
}

// Ingresos por créditos
export function getReporteIngresosCreditos({ desde, hasta } = {}) {
  return api(`/reportes/ingresos-creditos${buildRangeQuery(desde, hasta)}`);
}

// Créditos generados vs consumidos
export function getReporteCreditosGeneradosVsConsumidos({
  desde,
  hasta,
} = {}) {
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
export function getReportePublicacionesVsIntercambios({
  desde,
  hasta,
} = {}) {
  return api(
    `/reportes/publicaciones-vs-intercambios${buildRangeQuery(desde, hasta)}`
  );
}

// Impacto acumulado
export function getReporteImpactoAcumulado({ idTipoReporte, idPeriodo }) {
  const params = new URLSearchParams();
  if (idTipoReporte != null) params.append("idTipoReporte", idTipoReporte);
  if (idPeriodo != null) params.append("idPeriodo", idPeriodo);
  const qs = params.toString();
  return api(`/reportes/impacto-acumulado?${qs}`);
}

// Ranking de usuarios
export function getReporteRankingUsuarios({ idPeriodo = null, limit = 10 } = {}) {
  const params = new URLSearchParams();
  if (idPeriodo != null && idPeriodo !== "")
    params.append("idPeriodo", idPeriodo);
  params.append("limit", String(limit));
  return api(`/reportes/ranking-usuarios?${params.toString()}`);
}

// Usuarios premium
export function getReporteUsuariosPremium({ desde, hasta } = {}) {
  return api(`/reportes/usuarios-premium${buildRangeQuery(desde, hasta)}`);
}

// Usuarios nuevos
export function getReporteUsuariosNuevos({ desde, hasta } = {}) {
  return api(`/reportes/usuarios-nuevos${buildRangeQuery(desde, hasta)}`);
}

// Saldos de créditos
export function getReporteSaldosUsuarios({ limit = 20 } = {}) {
  const params = new URLSearchParams();
  params.append("limit", String(limit));
  return api(`/reportes/saldos-usuarios?${params.toString()}`);
}

// Reporte Actividades Sostenibles
export function getReporteActividadesSostenibles({ desde, hasta } = {}) {
  return api(
    `/reportes/actividades-sostenibles${buildRangeQuery(desde, hasta)}`
  );
}

// Impacto por categoría
export function getReporteImpactoPorCategoria({ idPeriodo }) {
  const params = new URLSearchParams();
  if (idPeriodo != null) params.append("idPeriodo", idPeriodo);
  return api(`/reportes/impacto-categoria?${params.toString()}`);
}

// =====================================================
// ======================== WALLET ======================
// =====================================================

export function getMisCreditos() {
  return api("/wallet/mis-creditos");
}

export function getMisMovimientos() {
  return api("/wallet/mis-movimientos");
}

export function getPaquetesCreditos() {
  return api("/catalogos/paquetes-creditos");
}

export function crearCompraCreditos({ idPaquete, idTransaccionPago = null }) {
  return api("/wallet/compra-creditos", {
    method: "POST",
    body: { idPaquete, idTransaccionPago },
  });
}

export function getMisComprasCreditos() {
  return api("/wallet/compras");
}

// =====================================================
// ===================== INTERCAMBIOS ===================
// =====================================================

export function crearIntercambio({ id_publicacion, creditos }) {
  return api("/intercambios", {
    method: "POST",
    body: { id_publicacion, creditos },
  });
}

export function getMisComprasIntercambios() {
  return api("/intercambios/mis-compras");
}

export function getMisVentasIntercambios() {
  return api("/intercambios/mis-ventas");
}

export function getDetalleTransaccion(idTransaccion) {
  return api(`/intercambios/${idTransaccion}`);
}

// =====================================================
// ================= ACTIVIDADES SOSTENIBLES ============
// =====================================================

// ⭐ Opción A aplicada: devolver SOLO la actividad
export async function registrarActividadSostenible({
  id_tipo_actividad,
  descripcion,
  creditos_otorgados,
  evidencia_url,
}) {
  const data = await api("/actividades-sostenibles", {
    method: "POST",
    body: {
      id_tipo_actividad,
      descripcion,
      creditos_otorgados,
      evidencia_url,
    },
  });

  return data.actividad; // devolvemos solo la fila registrada
}

// MIS actividades (usuario actual)
export function getMisActividadesSostenibles() {
  return api("/actividades-sostenibles/mias");
}

// 👇 NUEVO: listado ADMIN de actividades con filtros opcionales
export async function getActividadesAdmin(params = {}) {
  const search = new URLSearchParams();

  if (params.id_usuario) search.append("id_usuario", params.id_usuario);
  if (params.id_tipo_actividad)
    search.append("id_tipo_actividad", params.id_tipo_actividad);
  if (params.desde) search.append("desde", params.desde);
  if (params.hasta) search.append("hasta", params.hasta);

  const qs = search.toString();
  const data = await api(
    `/actividades-sostenibles/admin${qs ? `?${qs}` : ""}`
  );

  // backend responde: { message, filtros, data: [...] }
  return Array.isArray(data?.data) ? data.data : [];
}

// Aprobar actividad (ADMIN)
export function aprobarActividad(idActividad) {
  return api(`/actividades-sostenibles/${idActividad}/aprobar`, {
    method: "PATCH",
  });
}

// Rechazar actividad (ADMIN)
export function rechazarActividad(idActividad) {
  return api(`/actividades-sostenibles/${idActividad}/rechazar`, {
    method: "PATCH",
  });
}

// =====================================================
// ======================== LOGROS ======================
// =====================================================

export function getMisLogros() {
  return api("/logros/mios");
}

// =====================================================
// ===================== PROMOCIONES ====================
// =====================================================

// catálogo: tipos de promoción
export function getTiposPromocion() {
  // backend: GET /api/catalogos/tipos-promocion
  return api("/catalogos/tipos-promocion");
}

export function getPromociones() {
  return api("/promociones");
}

export function crearPromocion(body) {
  return api("/promociones", {
    method: "POST",
    body,
  });
}

export function cambiarEstadoPromocion(id_promocion, estado) {
  return api(`/promociones/${id_promocion}/estado`, {
    method: "PATCH",
    body: { estado },
  });
}

export function vincularPublicacionPromocion(id_promocion, id_publicacion) {
  return api(`/promociones/${id_promocion}/publicaciones`, {
    method: "POST",
    body: { id_publicacion },
  });
}

// =====================================================
// ======================= PUBLICIDAD ===================
// =====================================================

export function getPublicidadActiva() {
  return api("/publicidad");
}

export function crearPublicidad(body) {
  return api("/publicidad", {
    method: "POST",
    body,
  });
}

// =====================================================
// ===================== UTILIDADES =====================
// =====================================================

export function buildUploadUrl(url) {
  if (!url) return "";

  if (/^https?:\/\//i.test(url)) return url;

  if (url.startsWith("/")) {
    return `${API_BASE_URL}${url}`;
  }

  return `${API_BASE_URL}/${url}`;
}
