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

  // 👇 LEER SIEMPRE COMO TEXTO PARA EVITAR "Unexpected end of JSON input"
  const text = await res.text();

  if (!res.ok) {
    let message =
      res.statusText || `Error HTTP ${res.status}` || "Error en la solicitud";

    if (text) {
      // Intentar extraer message de un JSON de error del backend
      try {
        const parsed = JSON.parse(text);
        if (parsed && parsed.message) {
          message = parsed.message;
        }
      } catch {
        // Si no es JSON, usamos el texto tal cual
        message = text;
      }
    }

    throw new Error(message);
  }

  // 204 No Content o body vacío ⇒ devolvemos null sin parsear JSON
  if (!text) {
    return null;
  }

  // Intentar parsear JSON; si no es JSON válido, devolver el texto crudo
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

// ---------- REPORTES ----------

export function getReporteUsuariosActivos({ desde, hasta } = {}) {
  return api(`/reportes/usuarios-activos${buildRangeQuery(desde, hasta)}`);
}

export function getReporteUsuariosAbandonados({ desde, hasta } = {}) {
  return api(`/reportes/usuarios-abandonados${buildRangeQuery(desde, hasta)}`);
}

export function getReporteIngresosCreditos({ desde, hasta } = {}) {
  return api(`/reportes/ingresos-creditos${buildRangeQuery(desde, hasta)}`);
}

export function getReporteCreditosGeneradosVsConsumidos({ desde, hasta } = {}) {
  return api(
    `/reportes/creditos-generados-consumidos${buildRangeQuery(desde, hasta)}`
  );
}

export function getReporteIntercambiosCategoria({ desde, hasta } = {}) {
  return api(
    `/reportes/intercambios-categoria${buildRangeQuery(desde, hasta)}`
  );
}

export function getReportePublicacionesVsIntercambios({ desde, hasta } = {}) {
  return api(
    `/reportes/publicaciones-vs-intercambios${buildRangeQuery(desde, hasta)}`
  );
}

export function getReporteImpactoAcumulado({ idTipoReporte, idPeriodo }) {
  const params = new URLSearchParams();
  if (idTipoReporte != null) params.append("idTipoReporte", idTipoReporte);
  if (idPeriodo != null) params.append("idPeriodo", idPeriodo);
  const qs = params.toString();
  return api(`/reportes/impacto-acumulado?${qs}`);
}
