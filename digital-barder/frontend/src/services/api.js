const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

function authHeaders() {
  const token = localStorage.getItem("token");
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`
  };
}

export async function api(path, { method = "GET", body, headers = {} } = {}) {
  const isJson = body && !(body instanceof FormData);

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...(isJson ? { "Content-Type": "application/json" } : {}),
      ...authHeaders(),
      ...headers
    },
    body: isJson ? JSON.stringify(body) : body
  });

  const contentType = res.headers.get("content-type") || "";
  const isJsonResp = contentType.includes("application/json");
  const data = isJsonResp ? await res.json() : await res.text();

  if (!res.ok) {
    const message =
      (isJsonResp && data && data.message) ||
      (typeof data === "string" ? data : "Error en la solicitud");
    throw new Error(message);
  }

  return data;
}

export async function login({ correo, password }) {
  const data = await api("/auth/login", {
    method: "POST",
    body: { correo, password }
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
