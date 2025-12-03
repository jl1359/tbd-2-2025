// frontend/src/pages/Reportes.jsx
import React from "react";
import { Link } from "react-router-dom";
import hoja from "../assets/hoja.png";

const reportesList = [
  {
    path: "/reportes/usuarios",
    title: "Usuarios activos y abandonados",
    description: "Quiénes están usando la plataforma y quiénes no.",
    categoria: "Usuarios",
  },
  {
    path: "/reportes/ingresos-creditos",
    title: "Ingresos por venta de créditos",
    description: "Créditos vendidos e ingresos en bolivianos.",
    categoria: "Finanzas",
  },
  {
    path: "/reportes/creditos-generados-consumidos",
    title: "Créditos generados vs consumidos",
    description: "Balance global de créditos generados y consumidos.",
    categoria: "Créditos",
  },
  {
    path: "/reportes/intercambios-categoria",
    title: "Intercambios por categoría",
    description: "Qué categorías tienen más movimiento en los intercambios.",
    categoria: "Intercambios",
  },
  {
    path: "/reportes/publicaciones-intercambios",
    title: "Publicaciones vs intercambios",
    description:
      "Relación entre lo publicado y lo que realmente se intercambia.",
    categoria: "Intercambios",
  },
  {
    path: "/reportes/impacto-acumulado",
    title: "Impacto ambiental acumulado",
    description: "CO₂, agua y energía ahorrados en un período.",
    categoria: "Impacto ambiental",
  },
  {
    path: "/reportes/ranking-usuarios",
    title: "Ranking de usuarios por impacto",
    description: "Top de usuarios según su impacto ambiental.",
    categoria: "Usuarios",
  },
  {
    path: "/reportes/usuarios-premium",
    title: "Usuarios Premium",
    description: "Adopción, actividad e ingresos por suscripciones premium.",
    categoria: "Premium",
  },
  {
    path: "/reportes/saldos-usuarios",
    title: "Saldos de créditos por usuario",
    description: "Créditos disponibles actualmente en las billeteras.",
    categoria: "Créditos",
  },
  {
    path: "/reportes/actividades-sostenibles",
    title: "Actividades sostenibles",
    description: "Acciones ecológicas registradas por los usuarios.",
    categoria: "Actividades",
  },
  {
    path: "/reportes/impacto-categoria",
    title: "Impacto ambiental por categoría",
    description: "Impacto ecológico agrupado por categoría de publicación.",
    categoria: "Impacto ambiental",
  },
];

export default function Reportes() {
  return (
    <div className="min-h-screen bg-[#082b1f] text-emerald-50 px-4 py-8 md:px-8">
      {/* HEADER */}
      <header className="max-w-6xl mx-auto mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-400/70 flex items-center justify-center overflow-hidden">
            <img
              src={hoja}
              alt="Reportes Digital Barder"
              className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]"
            />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-emerald-300">
              Reportes y analíticas
            </h1>
            <p className="text-sm text-emerald-100/80">
              Explora los reportes clave de usuarios, créditos, intercambios e
              impacto ambiental.
            </p>
          </div>
        </div>
      </header>

      {/* CONTENIDO */}
      <main className="max-w-6xl mx-auto">
        <section>
          <h2 className="text-lg font-semibold text-emerald-200 mb-1">
            Tipos de reportes disponibles
          </h2>
          <p className="text-sm text-emerald-100/80 mb-4">
            Haz clic en cualquiera de los reportes para ver tablas detalladas,
            filtros por fecha y métricas específicas.
          </p>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {reportesList.map((rep) => (
              <Link
                key={rep.path}
                to={rep.path}
                className="group rounded-2xl border border-emerald-700 bg-[#0f3f2d] p-4 shadow-lg hover:border-emerald-400 hover:bg-[#14533b] transition flex flex-col justify-between"
              >
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-emerald-300/90 mb-1">
                    {rep.categoria}
                  </p>
                  <h3 className="text-base font-semibold text-emerald-50">
                    {rep.title}
                  </h3>
                  <p className="mt-1 text-sm text-emerald-100/80">
                    {rep.description}
                  </p>
                </div>

                <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-200 group-hover:text-emerald-50">
                  Ver reporte detallado
                  <span aria-hidden className="translate-y-[1px]">
                    →
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
