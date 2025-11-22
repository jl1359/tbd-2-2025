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

// -------- AUTH --------

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

// -------- UTILS --------

function buildRangeQuery(desde, hasta) {
  const params = new URLSearchParams();
  if (desde) params.append("desde", desde);
  if (hasta) params.append("hasta", hasta);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

// ---------- REPORTES BÁSICOS ----------

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

// ---------- REPORTES AVANZADOS ----------

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
