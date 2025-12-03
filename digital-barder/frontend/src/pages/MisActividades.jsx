// digital-barder/frontend/src/pages/MisActividades.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMisActividadesSostenibles } from "../services/api";
import { ArrowLeft, Leaf } from "lucide-react";
import hoja from "../assets/hoja.png";

export default function MisActividades() {
  const navigate = useNavigate();

  const [actividades, setActividades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarMisActividades();
  }, []);

  async function cargarMisActividades() {
    try {
      setCargando(true);
      setError("");
      const data = await getMisActividadesSostenibles();
      setActividades(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(
        err.message || "No se pudo cargar tu historial de actividades."
      );
    } finally {
      setCargando(false);
    }
  }

  // pequeña ayuda para formatear fecha si viene como string ISO
  function formatFecha(fecha) {
    if (!fecha) return "-";
    try {
      const d = new Date(fecha);
      if (Number.isNaN(d.getTime())) return fecha; // la dejo tal cual
      return d.toLocaleString();
    } catch {
      return fecha;
    }
  }

  return (
    <div className="min-h-screen bg-[#082b1f] text-white p-6 md:p-10">
      {/* HEADER */}
      <header className="flex items-center justify-between gap-3 mb-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full bg-black/30 px-3 py-1 text-sm hover:bg-black/40"
          >
            <ArrowLeft size={16} />
            Volver
          </button>
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-900/70 px-3 py-2 text-sm">
            <Leaf size={18} className="text-emerald-300" />
            <span className="font-semibold">Mis actividades</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/actividades")}
          className="px-4 py-2 rounded-lg border border-emerald-500 text-sm hover:bg-emerald-500/10 font-semibold"
        >
          Registrar nueva actividad
        </button>
      </header>

      {/* ERROR */}
      {error && (
        <div className="mb-4 rounded-md border border-red-400 bg-red-900/40 px-4 py-2 text-sm text-red-100">
          {error}
        </div>
      )}

      {/* CONTENIDO */}
      {cargando ? (
        <div className="text-center text-emerald-100/80">
          Cargando tu historial...
        </div>
      ) : actividades.length === 0 ? (
        <div className="text-center text-emerald-100/80">
          Aún no has registrado actividades sostenibles.
          <br />
          Participa en alguna para empezar a ganar créditos verdes.
        </div>
      ) : (
        <div className="bg-[#0f3f2d] border border-emerald-700 rounded-xl overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-emerald-600 text-emerald-300">
              <tr>
                <th className="text-left py-2 px-4">Descripción</th>
                <th className="text-left py-2 px-4">Créditos</th>
                <th className="text-left py-2 px-4">Estado</th>
                <th className="text-left py-2 px-4">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {actividades.map((a, idx) => (
                <tr
                  key={a.id_actividad || idx}
                  className="border-b border-emerald-800/50 last:border-0"
                >
                  <td className="py-2 px-4">
                    {a.descripcion || (
                      <span className="text-emerald-100/70 text-xs">
                        Sin descripción
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-4">
                    {a.creditos_otorgados != null
                      ? a.creditos_otorgados
                      : "—"}
                  </td>
                  <td className="py-2 px-4">
                    {a.estado || "PENDIENTE"}
                  </td>
                  <td className="py-2 px-4">
                    {formatFecha(a.creado_en)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <img src={hoja} alt="logo" className="w-10 h-10 opacity-80" />
      </div>
    </div>
  );
}
