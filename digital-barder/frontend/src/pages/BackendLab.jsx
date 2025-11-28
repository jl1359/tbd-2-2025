// frontend/src/pages/BackendLab.jsx
import React, { useEffect, useState } from "react";

// Usa la misma URL base del backend que ya usas en el proyecto
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

function loadToken() {
  return localStorage.getItem("token") || "";
}

export default function BackendLab() {
  const [token, setToken] = useState(loadToken());
  const [loading, setLoading] = useState(false);
  const [lastRequest, setLastRequest] = useState(null);
  const [lastResponse, setLastResponse] = useState(null);
  const [error, setError] = useState("");

  // ====== AUTH: registro / login ======
  const [regNombre, setRegNombre] = useState("Ana");
  const [regApellido, setRegApellido] = useState("Demo");
  const [regCorreo, setRegCorreo] = useState("ana.demo@example.com");
  const [regPassword, setRegPassword] = useState("ana12345");
  const [regTelefono, setRegTelefono] = useState("70000001");

  const [loginCorreo, setLoginCorreo] = useState("ana.demo@example.com");
  const [loginPassword, setLoginPassword] = useState("ana12345");

  // ====== Usuarios / historial ======
  const [userIdHistorial, setUserIdHistorial] = useState("");

  // ====== Wallet ======
  const [idPaquete, setIdPaquete] = useState("1");
  const [montoPagado, setMontoPagado] = useState("100");
  const [refPago, setRefPago] = useState("TEST-001");

  // ====== Intercambios ======
  const [idPublicacionInter, setIdPublicacionInter] = useState("");
  const [creditosInter, setCreditosInter] = useState("");

  // ====== Actividades ======
  const [idTipoAct, setIdTipoAct] = useState("1");
  const [descAct, setDescAct] = useState("Entregó 5kg de papel para reciclaje");
  const [credAct, setCredAct] = useState("10");

  // ====== Reportes ======
  const [desdeRep, setDesdeRep] = useState("2025-11-01");
  const [hastaRep, setHastaRep] = useState("2025-11-30");

  // ====== Request manual ======
  const [manualPath, setManualPath] = useState("/wallet/mis-creditos");
  const [manualMethod, setManualMethod] = useState("GET");
  const [manualBody, setManualBody] = useState("{\n  \n}");

  useEffect(() => {
    if (token) localStorage.setItem("token", token);
  }, [token]);

  async function callApi(moduleName, actionName, path, options = {}) {
    setError("");
    setLastResponse(null);

    const method = options.method || "GET";
    const bodyObj = options.body || null;

    setLastRequest({
      moduleName,
      actionName,
      method,
      url: API_BASE_URL + path,
      body: bodyObj,
    });

    try {
      setLoading(true);

      const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(API_BASE_URL + path, {
        method,
        headers,
        body:
          bodyObj && ["POST", "PUT", "PATCH"].includes(method)
            ? JSON.stringify(bodyObj)
            : undefined,
      });

      let rawText = "";
      let data = null;
      try {
        rawText = await res.text();
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        data = rawText;
      }

      setLastResponse({
        status: res.status,
        ok: res.ok,
        data,
      });

      if (!res.ok) {
        setError(`Respuesta con error HTTP ${res.status}`);
      }
    } catch (err) {
      setError(err.message || "Error en la llamada");
    } finally {
      setLoading(false);
    }
  }

  // ====== AUTH: registro ======
  async function handleRegister(e) {
    e.preventDefault();
    await callApi("Auth", "POST /auth/register", "/auth/register", {
      method: "POST",
      body: {
        nombre: regNombre,
        apellido: regApellido,
        correo: regCorreo,
        password: regPassword,
        telefono: regTelefono,
      },
    });
  }

  // ====== AUTH: login ======
  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);

      const res = await fetch(API_BASE_URL + "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo: loginCorreo,
          password: loginPassword,
        }),
      });

      let raw = "";
      let data = null;
      try {
        raw = await res.text();
        data = raw ? JSON.parse(raw) : null;
      } catch {
        data = raw;
      }

      setLastRequest({
        moduleName: "Auth",
        actionName: "POST /auth/login",
        method: "POST",
        url: API_BASE_URL + "/auth/login",
        body: { correo: loginCorreo, password: "***" },
      });
      setLastResponse({
        status: res.status,
        ok: res.ok,
        data,
      });

      if (!res.ok) {
        setError(`Login falló con HTTP ${res.status}`);
        return;
      }

      if (data && data.token) {
        setToken(data.token);
      } else {
        setError("La respuesta de login no contiene token");
      }
    } catch (err) {
      setError(err.message || "Error en login");
    } finally {
      setLoading(false);
    }
  }

  // ====== REQUEST MANUAL ======
  async function handleManualCall(e) {
    e.preventDefault();
    let bodyParsed = null;
    if (manualMethod !== "GET" && manualBody.trim()) {
      try {
        bodyParsed = JSON.parse(manualBody);
      } catch {
        setError("El body manual no es JSON válido");
        return;
      }
    }
    await callApi(
      "Manual",
      `${manualMethod} ${manualPath}`,
      manualPath,
      {
        method: manualMethod,
        body: bodyParsed,
      }
    );
  }

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <header className="flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Laboratorio completo de Backend
          </h2>
          <p className="text-sm text-gray-500">
            Registro, login e interacción con todos los módulos del backend para
            comprobar si las rutas responden correctamente.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            API_BASE_URL: <code>{API_BASE_URL}</code>
          </p>
        </div>
        <div className="text-right text-xs">
          <p className="font-semibold">Token actual:</p>
          <p className="truncate max-w-xs text-gray-500">
            {token ? token : "(sin token)"}
          </p>
          <button
            className="mt-1 text-xs text-red-600 underline"
            onClick={() => {
              setToken("");
              localStorage.removeItem("token");
            }}
          >
            Limpiar token
          </button>
          {loading && (
            <p className="mt-1 text-emerald-600 font-medium">
              Ejecutando request...
            </p>
          )}
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border-red-200 border text-red-700 text-sm px-3 py-2 rounded">
          {error}
        </div>
      )}

      {/* =========================================================
          1. AUTH: REGISTRO / LOGIN / ME
         ========================================================= */}
      <section className="card space-y-3">
        <p className="text-xs font-semibold uppercase text-gray-500">
          1. Autenticación (Registro / Login / Perfil)
        </p>

        <div className="grid gap-3 md:grid-cols-2 text-xs">
          {/* REGISTRO */}
          <form onSubmit={handleRegister} className="space-y-2">
            <p className="font-semibold">Registro rápido</p>
            <div>
              <label className="block mb-1 font-medium">Nombre</label>
              <input
                type="text"
                value={regNombre}
                onChange={(e) => setRegNombre(e.target.value)}
                className="w-full border rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Apellido</label>
              <input
                type="text"
                value={regApellido}
                onChange={(e) => setRegApellido(e.target.value)}
                className="w-full border rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Correo</label>
              <input
                type="email"
                value={regCorreo}
                onChange={(e) => setRegCorreo(e.target.value)}
                className="w-full border rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Teléfono</label>
              <input
                type="text"
                value={regTelefono}
                onChange={(e) => setRegTelefono(e.target.value)}
                className="w-full border rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Contraseña</label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full border rounded px-2 py-1"
              />
            </div>
            <button type="submit" className="btn-secondary">
              Registrar usuario
            </button>
          </form>

          {/* LOGIN */}
          <form onSubmit={handleLogin} className="space-y-2">
            <p className="font-semibold">Login</p>
            <div>
              <label className="block mb-1 font-medium">Correo</label>
              <input
                type="email"
                value={loginCorreo}
                onChange={(e) => setLoginCorreo(e.target.value)}
                className="w-full border rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Contraseña</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full border rounded px-2 py-1"
              />
            </div>
            <button type="submit" className="btn-primary">
              Iniciar sesión
            </button>

            <div className="mt-2">
              <button
                type="button"
                className="btn-secondary"
                onClick={() =>
                  callApi("Auth", "GET /auth/me", "/auth/me")
                }
              >
                Probar /auth/me
              </button>
            </div>
          </form>
        </div>

        {/* Usuarios / historial */}
        <div className="border-t pt-2 mt-2 text-xs">
          <p className="font-semibold mb-1">Usuarios / historial</p>
          <div className="flex flex-wrap gap-2 items-end">
            <button
              className="btn-secondary"
              onClick={() =>
                callApi("Usuarios", "GET /usuarios", "/usuarios")
              }
            >
              Listar /usuarios (ADMIN)
            </button>
            <div className="flex gap-2 items-end">
              <div>
                <label className="block mb-1 font-medium">
                  ID usuario para historial:
                </label>
                <input
                  type="number"
                  value={userIdHistorial}
                  onChange={(e) => setUserIdHistorial(e.target.value)}
                  className="border rounded px-2 py-1"
                  placeholder="Ej: 1"
                />
              </div>
              <button
                className="btn-secondary"
                onClick={() =>
                  userIdHistorial &&
                  callApi(
                    "Usuarios",
                    `GET /usuarios/${userIdHistorial}/historial`,
                    `/usuarios/${userIdHistorial}/historial`
                  )
                }
              >
                Ver historial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          2. CATÁLOGOS
         ========================================================= */}
      <section className="card space-y-2">
        <p className="text-xs font-semibold uppercase text-gray-500">
          2. Catálogos
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            className="btn-secondary"
            onClick={() =>
              callApi("Catálogos", "GET /catalogos/categorias", "/catalogos/categorias")
            }
          >
            Categorías
          </button>
          <button
            className="btn-secondary"
            onClick={() =>
              callApi(
                "Catálogos",
                "GET /catalogos/paquetes-creditos",
                "/catalogos/paquetes-creditos"
              )
            }
          >
            Paquetes créditos
          </button>
          <button
            className="btn-secondary"
            onClick={() =>
              callApi(
                "Catálogos",
                "GET /catalogos/tipos-actividad",
                "/catalogos/tipos-actividad"
              )
            }
          >
            Tipos actividad
          </button>
          <button
            className="btn-secondary"
            onClick={() =>
              callApi("Catálogos", "GET /catalogos/periodos", "/catalogos/periodos")
            }
          >
            Periodos
          </button>
          <button
            className="btn-secondary"
            onClick={() =>
              callApi(
                "Catálogos",
                "GET /catalogos/tipos-reporte",
                "/catalogos/tipos-reporte"
              )
            }
          >
            Tipos reporte
          </button>
        </div>
      </section>

      {/* =========================================================
          3. WALLET
         ========================================================= */}
      <section className="card space-y-2">
        <p className="text-xs font-semibold uppercase text-gray-500">
          3. Wallet / Billetera
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            className="btn-secondary"
            onClick={() =>
              callApi("Wallet", "GET /wallet/mis-creditos", "/wallet/mis-creditos")
            }
          >
            Mis créditos
          </button>
          <button
            className="btn-secondary"
            onClick={() =>
              callApi(
                "Wallet",
                "GET /wallet/mis-movimientos",
                "/wallet/mis-movimientos"
              )
            }
          >
            Mis movimientos
          </button>
          <button
            className="btn-secondary"
            onClick={() =>
              callApi("Wallet", "GET /wallet/compras", "/wallet/compras")
            }
          >
            Mis compras
          </button>
        </div>

        <div className="grid gap-2 md:grid-cols-4 text-xs mt-3">
          <div>
            <label className="block mb-1 font-medium">ID Paquete</label>
            <input
              type="number"
              value={idPaquete}
              onChange={(e) => setIdPaquete(e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Monto pagado (Bs.)</label>
            <input
              type="number"
              value={montoPagado}
              onChange={(e) => setMontoPagado(e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Referencia pago</label>
            <input
              type="text"
              value={refPago}
              onChange={(e) => setRefPago(e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
                    <button
            className="btn-primary w-full"
            onClick={() =>
                callApi(
                "Wallet",
                "POST /wallet/compra-creditos",
                "/wallet/compra-creditos",
                {
                    method: "POST",
                    body: {
                    idPaquete: Number(idPaquete),
                    montoPagado: Number(montoPagado),
                    referenciaPago: refPago,
                    },
                }
                )
            }
            >
            Comprar créditos
            </button>

        </div>
      </section>

      {/* =========================================================
          4. PUBLICACIONES
         ========================================================= */}
      <section className="card space-y-2">
        <p className="text-xs font-semibold uppercase text-gray-500">
          4. Publicaciones
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            className="btn-secondary"
            onClick={() =>
              callApi("Publicaciones", "GET /publicaciones", "/publicaciones")
            }
          >
            Listar /publicaciones
          </button>
          <button
            className="btn-secondary"
            onClick={() =>
              callApi(
                "Publicaciones",
                "GET /publicaciones/mias",
                "/publicaciones/mias"
              )
            }
          >
            Mis publicaciones
          </button>
          <button
            className="btn-secondary"
            onClick={() =>
              callApi(
                "Publicaciones",
                "GET /publicaciones/busqueda?q=bici",
                "/publicaciones/busqueda?q=bici"
              )
            }
          >
            Buscar (q=bici)
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          ⚠️ Para crear publicaciones de prueba con todos los campos (producto /
          servicio) es más cómodo usar tu Postman o el módulo de publicaciones del
          frontend final. Aquí nos enfocamos en comprobar que los listados devuelven
          datos y no rompen.
        </p>
      </section>

      {/* =========================================================
          5. INTERCAMBIOS
         ========================================================= */}
      <section className="card space-y-2">
        <p className="text-xs font-semibold uppercase text-gray-500">
          5. Intercambios
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            className="btn-secondary"
            onClick={() =>
              callApi(
                "Intercambios",
                "GET /intercambios/mis-compras",
                "/intercambios/mis-compras"
              )
            }
          >
            Mis compras
          </button>
          <button
            className="btn-secondary"
            onClick={() =>
              callApi(
                "Intercambios",
                "GET /intercambios/mis-ventas",
                "/intercambios/mis-ventas"
              )
            }
          >
            Mis ventas
          </button>
        </div>

        <div className="grid gap-2 md:grid-cols-3 text-xs mt-3">
          <div>
            <label className="block mb-1 font-medium">ID Publicación</label>
            <input
              type="number"
              value={idPublicacionInter}
              onChange={(e) => setIdPublicacionInter(e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">
              Créditos a intercambiar
            </label>
            <input
              type="number"
              value={creditosInter}
              onChange={(e) => setCreditosInter(e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div className="flex items-end">
            <button
              className="btn-primary w-full"
              onClick={() =>
                idPublicacionInter &&
                creditosInter &&
                callApi(
                  "Intercambios",
                  "POST /intercambios",
                  "/intercambios",
                  {
                    method: "POST",
                    body: {
                      id_publicacion: Number(idPublicacionInter),
                      creditos: Number(creditosInter),
                    },
                  }
                )
              }
            >
              Crear intercambio
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================
          6. ACTIVIDADES SOSTENIBLES
         ========================================================= */}
      <section className="card space-y-2">
        <p className="text-xs font-semibold uppercase text-gray-500">
          6. Actividades sostenibles
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            className="btn-secondary"
            onClick={() =>
              callApi(
                "Actividades",
                "GET /actividades-sostenibles/mias",
                "/actividades-sostenibles/mias"
              )
            }
          >
            Mis actividades
          </button>
        </div>

        <div className="grid gap-2 md:grid-cols-4 text-xs mt-3">
          <div>
            <label className="block mb-1 font-medium">ID tipo actividad</label>
            <input
              type="number"
              value={idTipoAct}
              onChange={(e) => setIdTipoAct(e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Créditos otorgados</label>
            <input
              type="number"
              value={credAct}
              onChange={(e) => setCredAct(e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block mb-1 font-medium">Descripción</label>
            <input
              type="text"
              value={descAct}
              onChange={(e) => setDescAct(e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div className="md:col-span-4 flex justify-end">
            <button
              className="btn-primary"
              onClick={() =>
                callApi(
                  "Actividades",
                  "POST /actividades-sostenibles",
                  "/actividades-sostenibles",
                  {
                    method: "POST",
                    body: {
                      id_tipo_actividad: Number(idTipoAct),
                      descripcion: descAct,
                      creditos_otorgados: Number(credAct),
                      evidencia_url: null,
                    },
                  }
                )
              }
            >
              Registrar actividad
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================
          7. PUBLICIDAD / PROMOS / LOGROS / PREMIUM
         ========================================================= */}
      <section className="card space-y-2">
        <p className="text-xs font-semibold uppercase text-gray-500">
          7. Publicidad / Promos / Logros / Premium
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            className="btn-secondary"
            onClick={() =>
              callApi("Publicidad", "GET /publicidad", "/publicidad")
            }
          >
            Publicidad activa
          </button>
          <button
            className="btn-secondary"
            onClick={() =>
              callApi(
                "Promociones",
                "GET /promociones/vigentes",
                "/promociones/vigentes"
              )
            }
          >
            Promos vigentes
          </button>
          <button
            className="btn-secondary"
            onClick={() =>
              callApi("Logros", "GET /logros/mis-logros", "/logros/mis-logros")
            }
          >
            Mis logros
          </button>
          <button
            className="btn-secondary"
            onClick={() =>
              callApi("Premium", "GET /premium/mi-plan", "/premium/mi-plan")
            }
          >
            Mi plan premium
          </button>
        </div>
      </section>

      {/* =========================================================
          8. REPORTES
         ========================================================= */}
      <section className="card space-y-2">
        <p className="text-xs font-semibold uppercase text-gray-500">
          8. Reportes (ADMIN)
        </p>

        <div className="grid gap-2 md:grid-cols-3 text-xs">
          <div>
            <label className="block mb-1 font-medium">Desde</label>
            <input
              type="date"
              value={desdeRep}
              onChange={(e) => setDesdeRep(e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Hasta</label>
            <input
              type="date"
              value={hastaRep}
              onChange={(e) => setHastaRep(e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs mt-3">
          <button
            className="btn-secondary"
            onClick={() =>
              callApi(
                "Reportes",
                "GET /reportes/usuarios-activos",
                `/reportes/usuarios-activos?desde=${desdeRep}&hasta=${hastaRep}`
              )
            }
          >
            Usuarios activos
          </button>
          <button
            className="btn-secondary"
            onClick={() =>
              callApi(
                "Reportes",
                "GET /reportes/usuarios-abandonados",
                `/reportes/usuarios-abandonados?desde=${desdeRep}&hasta=${hastaRep}`
              )
            }
          >
            Usuarios abandonados
          </button>
          <button
            className="btn-secondary"
            onClick={() =>
              callApi(
                "Reportes",
                "GET /reportes/ingresos-creditos",
                `/reportes/ingresos-creditos?desde=${desdeRep}&hasta=${hastaRep}`
              )
            }
          >
            Ingresos créditos
          </button>
          <button
            className="btn-secondary"
            onClick={() =>
              callApi(
                "Reportes",
                "GET /reportes/creditos-generados-consumidos",
                `/reportes/creditos-generados-consumidos?desde=${desdeRep}&hasta=${hastaRep}`
              )
            }
          >
            Créditos gen. vs cons.
          </button>
          <button
            className="btn-secondary"
            onClick={() =>
              callApi(
                "Reportes",
                "GET /reportes/intercambios-categoria",
                `/reportes/intercambios-categoria?desde=${desdeRep}&hasta=${hastaRep}`
              )
            }
          >
            Intercambios x categoría
          </button>
          <button
            className="btn-secondary"
            onClick={() =>
              callApi(
                "Reportes",
                "GET /reportes/publicaciones-intercambios",
                `/reportes/publicaciones-intercambios?desde=${desdeRep}&hasta=${hastaRep}`
              )
            }
          >
            Publ. vs intercambios
          </button>
          <button
            className="btn-secondary"
            onClick={() =>
                callApi(
                "Reportes",
                "GET /reportes/impacto-acumulado",
                `/reportes/impacto-acumulado?id_tipo_reporte=1&id_periodo=1`
                )
            }
            >
            Impacto acumulado
</button>

          <button
  className="btn-secondary"
  onClick={() =>
    callApi(
      "Reportes",
      "GET /reportes/ranking-usuarios",
      `/reportes/ranking-usuarios?id_periodo=1&limit=10`
    )
  }
>
  Ranking usuarios
</button>

        </div>
      </section>

      {/* =========================================================
          9. REQUEST MANUAL
         ========================================================= */}
      <section className="card space-y-2">
        <p className="text-xs font-semibold uppercase text-gray-500">
          9. Request manual (cualquier endpoint)
        </p>
        <form onSubmit={handleManualCall} className="space-y-2 text-xs">
          <div className="flex gap-2">
            <select
              value={manualMethod}
              onChange={(e) => setManualMethod(e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option>GET</option>
              <option>POST</option>
              <option>PUT</option>
              <option>PATCH</option>
              <option>DELETE</option>
            </select>
            <input
              type="text"
              value={manualPath}
              onChange={(e) => setManualPath(e.target.value)}
              className="flex-1 border rounded px-2 py-1"
              placeholder="/ruta/del/endpoint"
            />
            <button type="submit" className="btn-primary">
              Ejecutar
            </button>
          </div>
          {manualMethod !== "GET" && (
            <textarea
              rows={4}
              value={manualBody}
              onChange={(e) => setManualBody(e.target.value)}
              className="w-full border rounded px-2 py-1 font-mono"
            />
          )}
        </form>
      </section>

      {/* =========================================================
          PANEL DE RESULTADOS
         ========================================================= */}
      <section className="card space-y-2">
        <p className="text-xs font-semibold uppercase text-gray-500">
          Resultado de la última llamada
        </p>

        {lastRequest ? (
          <div className="text-xs space-y-1">
            <p>
              <span className="font-semibold">Módulo:</span>{" "}
              {lastRequest.moduleName}
            </p>
            <p>
              <span className="font-semibold">Acción:</span>{" "}
              {lastRequest.actionName}
            </p>
            <p>
              <span className="font-semibold">Método:</span>{" "}
              {lastRequest.method}
            </p>
            <p>
              <span className="font-semibold">URL:</span>{" "}
              <code>{lastRequest.url}</code>
            </p>
            {lastRequest.body && (
              <details className="mt-1">
                <summary className="cursor-pointer text-gray-600">
                  Body enviado
                </summary>
                <pre className="bg-gray-50 border rounded p-2 mt-1 overflow-x-auto">
{JSON.stringify(lastRequest.body, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-400">
            Aún no ejecutaste ninguna llamada.
          </p>
        )}

        {lastResponse && (
          <div className="mt-3 text-xs">
            <p>
              <span className="font-semibold">Status:</span>{" "}
              {lastResponse.status}{" "}
              {lastResponse.ok ? "(OK)" : "(Error)"}
            </p>
            <details className="mt-1" open>
              <summary className="cursor-pointer text-gray-600">
                Ver JSON de respuesta
              </summary>
              <pre className="bg-gray-50 border rounded p-2 mt-1 overflow-x-auto">
{JSON.stringify(lastResponse.data, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </section>
    </div>
  );
}
