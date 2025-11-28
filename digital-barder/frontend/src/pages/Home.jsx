// frontend/src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getHealth } from "../services/api.js";

export default function Home() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    getHealth()
      .then((data) => {
        if (isMounted) setHealth(data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || "Error consultando API");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <section className="flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Bienvenido al panel
          </h2>
          <p className="text-sm text-gray-500">
            Aquí irán las tarjetas de saldo, publicaciones, estadísticas, etc.
          </p>
        </div>
      </section>

      {/* TARJETAS DEL HOME */}
      <section className="grid gap-4 md:grid-cols-3">
        {/* TARJETA: ESTADO API */}
        <div className="card">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Estado de la API
          </p>
          {error && (
            <p className="text-sm text-red-600">
              Error: <span className="font-medium">{error}</span>
            </p>
          )}
          {!error && !health && (
            <p className="text-sm text-gray-500">Verificando API…</p>
          )}
          {health && (
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">ok:</span>{" "}
                {String(health.ok ?? health.status ?? "desconocido")}
              </p>
              {health.env && (
                <p>
                  <span className="font-medium">Entorno:</span> {health.env}
                </p>
              )}
            </div>
          )}
        </div>

        {/* TARJETA: CRÉDITOS */}
        <div className="card">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Créditos
          </p>
          <p className="text-sm text-gray-500">
            Aquí puedes mostrar el saldo de créditos de la billetera del
            usuario.
          </p>
        </div>

        {/* TARJETA: ACTIVIDAD RECIENTE */}
        <div className="card">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Actividad reciente
          </p>
          <p className="text-sm text-gray-500">
            Listado de últimas publicaciones, intercambios, etc.
          </p>
        </div>
        
          <Link
            to="/backend-lab"
            className="card hover:shadow-md transition"
          >
            <p className="text-xs font-medium text-gray-500 uppercase mb-1">
              Laboratorio Backend
            </p>
            <p className="text-sm font-semibold">
              Probar todos los módulos (QA)
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Registro, login, wallet, publicaciones, intercambios, actividades,
              reportes y más desde una sola pantalla.
            </p>
          </Link>

        {/* ⭐ NUEVA TARJETA: REPORTES ⭐ */}
        <div className="card flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Reportes
            </p>
            <p className="text-sm text-gray-500">
              Accede a reportes de actividad, créditos e impacto ambiental.
            </p>
          </div>

          <div className="mt-3">
            <Link
              to="/reportes"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Ver reportes →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
