import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api"; // para llamar a la API de campañas
import hoja from "../assets/hoja.png"; // logo

export default function Campanas() {
  const [campanas, setCampanas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    cargarCampanas();
  }, []);

  async function cargarCampanas() {
    setLoading(true);
    setError("");
    try {
      const data = await api("/campanas"); // Llamada para obtener las campañas
      setCampanas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudieron cargar las campañas.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#082b1f] text-white p-6 md:p-10">
      {/* HEADER */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={hoja} alt="logo" className="w-10 h-10 drop-shadow-lg" />
            <h1 className="text-3xl font-bold text-emerald-400">Campañas</h1>
          </div>
        </div>
      </div>

      {/* ERRORES */}
      {error && (
        <div className="mb-4 rounded-md border border-red-400 bg-red-900/40 px-4 py-2 text-sm text-red-100">
          {error}
        </div>
      )}

      {/* CARGANDO O CAMPAÑAS */}
      {loading ? (
        <div className="text-center text-emerald-100/80">Cargando...</div>
      ) : campanas.length === 0 ? (
        <div className="text-center text-emerald-100/80">
          No hay campañas activas en este momento.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {campanas.map((campana) => (
            <article
              key={campana.id}
              className="bg-[#E9FFD9] text-[#013726] rounded-3xl shadow-lg overflow-hidden flex flex-col min-h-[360px]"
            >
              {/* Imagen de campaña */}
              <div className="w-full h-40 bg-[#E9FFD9] border-b border-[#c5f0b8] overflow-hidden">
                {campana.imagen_url && (
                  <button
                    type="button"
                    className="block w-full h-full"
                  >
                    <img
                      src={campana.imagen_url}
                      className="w-full h-full object-cover hover:scale-105 transition-all"
                      alt={campana.titulo}
                    />
                  </button>
                )}
              </div>

              {/* Detalles de la campaña */}
              <div className="px-4 pt-3 pb-4 flex flex-col flex-1">
                <h2 className="mt-1 text-sm md:text-base font-semibold">
                  {campana.titulo}
                </h2>

                <p className="mt-2 text-xs text-gray-700">{campana.descripcion}</p>

                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <p className="font-semibold text-lg">{campana.valor_creditos} Cr.</p>
                    <p className="text-[0.65rem] uppercase tracking-wide">Green Credits</p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <button className="text-[0.75rem] text-[#0056D6] hover:text-[#003B8E]">
                      Ver Detalle
                    </button>
                    <button className="mt-1 px-3 py-1 rounded-lg bg-[#0b7a35] hover:bg-[#0cb652] text-[0.7rem] text-white">
                      Participar
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
