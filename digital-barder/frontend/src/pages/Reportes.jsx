// frontend/src/pages/Reportes.jsx
import { Link } from "react-router-dom";

const reportesList = [
  {
    path: "/reportes/usuarios",
    title: "Usuarios activos y abandonados",
    description: "Quiénes están usando la plataforma y quiénes no.",
  },
  {
    path: "/reportes/ingresos-creditos",
    title: "Ingresos por venta de créditos",
    description: "Créditos vendidos e ingresos en bolivianos.",
  },
  {
    path: "/reportes/creditos-generados-consumidos",
    title: "Créditos generados vs consumidos",
    description: "Balance global de créditos generados y consumidos.",
  },
  {
    path: "/reportes/intercambios-categoria",
    title: "Intercambios por categoría",
    description: "Qué categorías tienen más movimiento en los intercambios.",
  },
  {
    path: "/reportes/publicaciones-intercambios",
    title: "Publicaciones vs intercambios",
    description: "Relación entre lo publicado y lo que realmente se intercambia.",
  },
  {
    path: "/reportes/impacto-acumulado",
    title: "Impacto ambiental acumulado",
    description: "CO₂, agua y energía ahorrados en un período.",
  },
  {
    path: "/reportes/ranking-usuarios",
    title: "Ranking de usuarios por impacto",
    description: "Top de usuarios según su impacto ambiental.",
  },
  {
    path: "/reportes/usuarios-premium",
    title: "Usuarios Premium",
    description: "Adopción, actividad e ingresos por suscripciones premium.",
  },
  {
    path: "/reportes/saldos-usuarios",
    title: "Saldos de créditos por usuario",
    description: "Créditos disponibles actualmente en las billeteras.",
  },
  {
    path: "/reportes/actividades-sostenibles",
    title: "Actividades sostenibles",
    description: "Acciones ecológicas registradas por los usuarios.",
  },
  {
    path: "/reportes/impacto-categoria",
    title: "Impacto ambiental por categoría",
    description: "Impacto ecológico agrupado por categoría de publicación.",
  },
];

export default function Reportes() {
  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reportes</h1>
          <p className="text-sm text-gray-500">
            Explora los reportes disponibles o abre el dashboard completo.
          </p>
        </div>

        <Link
          to="/reportes-dashboard"
          className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition"
        >
          Ver dashboard completo
        </Link>
      </header>

      {/* Tarjetas de reportes */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reportesList.map((rep, idx) => (
          <div
            key={idx}
            className="border rounded-lg p-4 bg-white shadow-sm flex flex-col justify-between hover:shadow-md transition"
          >
            <div>
              <h2 className="font-semibold text-lg mb-1">{rep.title}</h2>
              <p className="text-sm text-gray-500 mb-3">{rep.description}</p>
            </div>

            <div className="flex justify-end">
              <Link
                to={rep.path}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Ver detalle →
              </Link>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
