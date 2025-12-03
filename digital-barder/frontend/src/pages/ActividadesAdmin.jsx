// frontend/src/pages/ActividadesAdmin.jsx
import { useEffect, useState } from "react";
import {
  aprobarActividad,
  rechazarActividad,
  getActividadesAdmin,
} from "../services/api";
import hoja from "../assets/hoja.png";

export default function ActividadesAdmin() {
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function cargar() {
    try {
      setLoading(true);
      setError("");
      // Llamamos al endpoint ADMIN: GET /actividades-sostenibles/admin
      const lista = await getActividadesAdmin({});
      setActividades(Array.isArray(lista) ? lista : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error cargando actividades");
    } finally {
      setLoading(false);
    }
  }

  async function handleAprobar(id) {
    try {
      await aprobarActividad(id);
      await cargar();
    } catch (err) {
      alert(err.message || "Error al aprobar la actividad");
    }
  }

  async function handleRechazar(id) {
    try {
      await rechazarActividad(id);
      await cargar();
    } catch (err) {
      alert(err.message || "Error al rechazar la actividad");
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  return (
    <div className="min-h-screen bg-[#082b1f] text-white p-6">
      {/* HEADER */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Panel de Actividades Sostenibles</h1>
          <p className="text-sm text-emerald-100/80">
            Revisión y aprobación de actividades registradas por los usuarios.
          </p>
        </div>
        <img src={hoja} className="w-10 h-10" alt="logo" />
      </header>

      {/* ESTADOS */}
      {loading && <p className="text-emerald-100/80">Cargando actividades...</p>}
      {error && (
        <p className="text-red-400 mb-4">
          {error}
        </p>
      )}

      {!loading && !error && actividades.length === 0 && (
        <p className="text-emerald-100/80">
          No hay actividades registradas aún.
        </p>
      )}

      {/* TABLA */}
      {!loading && !error && actividades.length > 0 && (
        <div className="overflow-x-auto mt-4 bg-[#0f3f2d] border border-emerald-700 rounded-xl">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-emerald-900/40 text-emerald-200">
                <th className="p-2 border border-emerald-700">ID</th>
                <th className="p-2 border border-emerald-700">Usuario</th>
                <th className="p-2 border border-emerald-700">Correo</th>
                <th className="p-2 border border-emerald-700">Tipo</th>
                <th className="p-2 border border-emerald-700">Créditos</th>
                <th className="p-2 border border-emerald-700">Estado</th>
                <th className="p-2 border border-emerald-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {actividades.map((a) => (
                <tr key={a.id_actividad} className="border border-emerald-800">
                  <td className="p-2">{a.id_actividad}</td>
                  <td className="p-2">{a.nombre_usuario}</td>
                  <td className="p-2">{a.correo_usuario}</td>
                  <td className="p-2">
                    {a.nombre_tipo_actividad || a.descripcion}
                  </td>
                  <td className="p-2">{a.creditos_otorgados}</td>
                  <td className="p-2 font-bold">
                    {a.estado === "PENDIENTE" && (
                      <span className="text-yellow-300">PENDIENTE</span>
                    )}
                    {a.estado === "APROBADA" && (
                      <span className="text-emerald-300">APROBADA</span>
                    )}
                    {a.estado === "RECHAZADA" && (
                      <span className="text-red-300">RECHAZADA</span>
                    )}
                    {!a.estado && (
                      <span className="text-emerald-100/70">-</span>
                    )}
                  </td>
                  <td className="p-2">
                    {a.estado === "PENDIENTE" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAprobar(a.id_actividad)}
                          className="px-3 py-1 bg-emerald-500 text-black rounded text-xs"
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleRechazar(a.id_actividad)}
                          className="px-3 py-1 bg-red-500 text-black rounded text-xs"
                        >
                          Rechazar
                        </button>
                      </div>
                    ) : a.estado === "APROBADA" ? (
                      <span className="text-emerald-300 text-xs">
                        Aprobada ✔
                      </span>
                    ) : (
                      <span className="text-red-300 text-xs">
                        Rechazada ✘
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
