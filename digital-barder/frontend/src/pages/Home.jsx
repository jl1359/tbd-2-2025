import React, { useEffect, useState } from "react";
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

      <section className="grid gap-4 md:grid-cols-3">
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

        <div className="card">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Créditos
          </p>
          <p className="text-sm text-gray-500">
            Aquí puedes mostrar el saldo de créditos de la billetera del
            usuario.
          </p>
        </div>

        <div className="card">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Actividad reciente
          </p>
          <p className="text-sm text-gray-500">
            Listado de últimas publicaciones, intercambios, etc.
          </p>
        </div>
      </section>
    </div>
  );
}
