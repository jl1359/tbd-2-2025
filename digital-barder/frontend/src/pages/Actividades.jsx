// digital-barder/frontend/src/pages/Actividades.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registrarActividadSostenible } from "../services/api";
import { ArrowLeft, Leaf, CheckCircle2 } from "lucide-react";
import hoja from "../assets/hoja.png";

export default function Actividades() {
  const navigate = useNavigate();

  const [idTipoActividad, setIdTipoActividad] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [creditos, setCreditos] = useState("");
  const [evidenciaUrl, setEvidenciaUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mensajeOk, setMensajeOk] = useState("");
  const [ultimaActividad, setUltimaActividad] = useState(null);

  // Tipos de actividad como en el primer código
  const tiposActividad = [
    { id: "1", nombre: "Reciclaje" },
    { id: "2", nombre: "Movilidad sostenible" },
    { id: "3", nombre: "Voluntariado" },
    { id: "4", nombre: "Ahorro de energía" },
    { id: "5", nombre: "Consumo responsable" },
    { id: "6", nombre: "Educación ambiental" },
    { id: "7", nombre: "Agricultura urbana" },
    { id: "8", nombre: "Otros" },
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMensajeOk("");
    setUltimaActividad(null);

    const id_tipo_actividad = Number(idTipoActividad);
    const creditos_otorgados = Number(creditos);

    if (
      Number.isNaN(id_tipo_actividad) ||
      Number.isNaN(creditos_otorgados) ||
      !descripcion.trim()
    ) {
      setError(
        "Tipo de actividad, descripción y créditos otorgados son obligatorios."
      );
      return;
    }

    try {
      setLoading(true);

      const act = await registrarActividadSostenible({
        id_tipo_actividad,
        descripcion,
        creditos_otorgados,
        evidencia_url: evidenciaUrl || null,
      });

      setMensajeOk("Actividad registrada correctamente 🌱");
      setUltimaActividad(act);

      // limpiar parcialmente
      setDescripcion("");
      setCreditos("");
      setEvidenciaUrl("");
      setIdTipoActividad("");
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Ocurrió un error al registrar la actividad sostenible."
      );
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
            <div>
              <h1 className="text-3xl font-bold text-emerald-400">
                Actividades Sostenibles
              </h1>
              <p className="text-sm text-emerald-100/80">
                Registra tus acciones ecológicas y gana créditos verdes.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-lg border border-emerald-500 text-sm hover:bg-emerald-500/10 transition-all"
            >
              ← Volver
            </button>
            <button
              type="button"
              onClick={() => navigate("/actividades/mias")}
              className="flex items-center gap-2 bg-[#038547] hover:bg-[#026636] px-4 py-2 rounded-lg font-semibold text-sm shadow-md transition-all"
            >
              <span>📋</span>
              <span>Mis Actividades</span>
            </button>
          </div>
        </div>
      </div>

      {/* MENSAJES */}
      {error && (
        <div className="mb-4 rounded-md border border-red-400 bg-red-900/40 px-4 py-2 text-sm text-red-100">
          {error}
        </div>
      )}

      {mensajeOk && (
        <div className="mb-4 rounded-md border border-emerald-400 bg-emerald-900/40 px-4 py-2 text-sm text-emerald-100 flex items-center gap-2">
          <CheckCircle2 size={18} />
          <span>{mensajeOk}</span>
        </div>
      )}

      {/* DESCRIPCIÓN */}
      <div className="bg-[#0f3f2d] border border-emerald-700 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-900/50">
            <Leaf size={24} className="text-emerald-300" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-emerald-300">
              ¿Cómo funciona?
            </h2>
            <p className="text-sm text-emerald-100/80">
              Registra acciones ecológicas que realices y recibe créditos verdes como recompensa.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-emerald-900/30 border border-emerald-800 rounded-lg p-3">
            <div className="font-semibold text-emerald-300 mb-1">1. Describe tu acción</div>
            <p className="text-emerald-100/70">Explica qué actividad realizaste y su impacto ambiental.</p>
          </div>
          <div className="bg-emerald-900/30 border border-emerald-800 rounded-lg p-3">
            <div className="font-semibold text-emerald-300 mb-1">2. Añade evidencia</div>
            <p className="text-emerald-100/70">Opcionalmente, incluye una URL con fotos o documentos que comprueben tu actividad.</p>
          </div>
          <div className="bg-emerald-900/30 border border-emerald-800 rounded-lg p-3">
            <div className="font-semibold text-emerald-300 mb-1">3. Recibe créditos</div>
            <p className="text-emerald-100/70">Tu actividad será revisada y recibirás los créditos correspondientes.</p>
          </div>
        </div>
      </div>

      {/* FORMULARIO */}
      <div className="bg-[#0f3f2d] border border-emerald-700 rounded-xl p-6 md:p-8 max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de actividad - SELECT en lugar de input numérico */}
          <div>
            <label className="block text-sm font-semibold text-emerald-200 mb-2">
              Tipo de actividad *
            </label>
            <div className="relative">
              <select
                value={idTipoActividad}
                onChange={(e) => setIdTipoActividad(e.target.value)}
                className="appearance-none w-full bg-[#038547] border border-[#026636] rounded-lg px-3 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <option value="">Selecciona un tipo de actividad</option>
                {tiposActividad.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                <svg
                  className="h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-emerald-300/70 mt-2">
              Selecciona la categoría que mejor describe tu actividad sostenible.
            </p>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-semibold text-emerald-200 mb-2">
              Descripción detallada *
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={4}
              className="w-full bg-[#e9ffd9] text-[#454343] border-none rounded-lg px-3 py-3 outline-none focus:ring-2 focus:ring-emerald-400 text-base font-medium placeholder:text-[#666666] resize-y"
              placeholder="Describe detalladamente la actividad que realizaste, incluyendo:
• Qué hiciste exactamente
• Dónde y cuándo fue realizada
• Duración o cantidad
• Impacto ambiental estimado
• Participantes (si aplica)..."
            />
          </div>

          {/* Créditos */}
          <div>
            <label className="block text-sm font-semibold text-emerald-200 mb-2">
              Créditos solicitados *
            </label>
            <input
              type="number"
              min="1"
              value={creditos}
              onChange={(e) => setCreditos(e.target.value)}
              className="w-full bg-[#e9ffd9] text-[#454343] border-none rounded-lg px-3 py-3 outline-none focus:ring-2 focus:ring-emerald-400 text-base font-medium placeholder:text-[#666666]"
              placeholder="Ej. 10, 25, 50..."
            />
            <p className="text-xs text-emerald-300/70 mt-2">
              Los créditos serán revisados y ajustados según las directrices del sistema.
            </p>
          </div>

          {/* URL de evidencia - Mantenemos el input URL del segundo código */}
          <div>
            <label className="block text-sm font-semibold text-emerald-200 mb-2">
              URL de evidencia (opcional)
            </label>
            <input
              type="url"
              value={evidenciaUrl}
              onChange={(e) => setEvidenciaUrl(e.target.value)}
              className="w-full bg-[#e9ffd9] text-[#454343] border-none rounded-lg px-3 py-3 outline-none focus:ring-2 focus:ring-emerald-400 text-base font-medium placeholder:text-[#666666]"
              placeholder="https://drive.google.com/... o https://photos.google.com/..."
            />
            <p className="text-xs text-emerald-300/70 mt-2">
              Puedes incluir enlaces a fotos, documentos PDF, formularios de participación, etc.
            </p>
          </div>

          {/* BOTONES */}
          <div className="flex justify-end gap-3 pt-6 border-t border-emerald-800">
            <button
              type="button"
              onClick={() => {
                setDescripcion("");
                setCreditos("");
                setEvidenciaUrl("");
                setIdTipoActividad("");
                setError("");
                setMensajeOk("");
              }}
              className="px-4 py-2 rounded-lg border border-emerald-500 text-sm hover:bg-emerald-500/10 transition-all"
            >
              Limpiar formulario
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all
                ${
                  loading
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-[#038547] hover:bg-[#026636] shadow-md"
                }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registrando...
                </>
              ) : (
                "Registrar Actividad"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ÚLTIMA ACTIVIDAD REGISTRADA */}
      {ultimaActividad && (
        <div className="max-w-3xl mx-auto mt-8 bg-[#0f3f2d] border border-emerald-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-900/50">
              <CheckCircle2 size={20} className="text-emerald-300" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-emerald-300">
                Actividad Registrada Exitosamente
              </h3>
              <p className="text-sm text-emerald-100/80">
                Tu actividad ha sido registrada y está pendiente de revisión.
              </p>
            </div>
          </div>

          <div className="bg-[#082b1f] border border-emerald-800 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-emerald-300/70">ID de Actividad</p>
                <p className="font-semibold text-emerald-200">
                  {ultimaActividad.id_actividad || ultimaActividad.id}
                </p>
              </div>
              <div>
                <p className="text-xs text-emerald-300/70">Créditos Otorgados</p>
                <p className="font-semibold text-emerald-200">
                  {ultimaActividad.creditos_otorgados} cr.
                </p>
              </div>
              <div>
                <p className="text-xs text-emerald-300/70">Estado</p>
                <span className="inline-flex px-3 py-1 rounded-full bg-emerald-900/50 text-emerald-300 text-xs font-medium border border-emerald-700">
                  {ultimaActividad.estado || "PENDIENTE"}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs text-emerald-300/70 mb-1">Descripción</p>
              <p className="text-sm text-emerald-100">{ultimaActividad.descripcion}</p>
            </div>

            {ultimaActividad.evidencia_url && (
              <div>
                <p className="text-xs text-emerald-300/70 mb-1">Evidencia</p>
                <a
                  href={ultimaActividad.evidencia_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-emerald-300 hover:text-emerald-200 hover:underline"
                >
                  {ultimaActividad.evidencia_url}
                </a>
              </div>
            )}

            <button
              type="button"
              onClick={() => navigate("/actividades/mias")}
              className="mt-4 w-full rounded-lg bg-emerald-700 hover:bg-emerald-600 py-2 text-sm font-semibold transition-all"
            >
              Ver todas mis actividades
            </button>
          </div>
        </div>
      )}
    </div>
  );
}