// frontend/src/pages/Actividades.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registrarActividadSostenible } from "../services/api";
import { ArrowLeft, Leaf, CheckCircle2 } from "lucide-react";
import hoja from "../assets/hoja.png";

// Lista REAL de actividades según la base de datos
const TIPOS_ACTIVIDAD = [
  { id: 1, nombre: "RECICLAJE" },
  { id: 2, nombre: "Reciclaje de Plástico" },
  { id: 3, nombre: "Reciclaje de Papel" },
  { id: 4, nombre: "Reciclaje de Electrónicos" },
  { id: 5, nombre: "Limpieza de Parques" },
  { id: 6, nombre: "Limpieza de Calles" },
  { id: 7, nombre: "Reforestación" },
  { id: 8, nombre: "Educación Ambiental" },
  { id: 9, nombre: "Compostaje" },
  { id: 10, nombre: "Transporte Sostenible" },
  { id: 11, nombre: "Reciclaje de Vidrio" }
];

export default function Actividades() {
  const navigate = useNavigate();

  // Estados
  const [idTipoActividad, setIdTipoActividad] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [creditosOtorgados, setCreditosOtorgados] = useState("");
  const [fileEvidencia, setFileEvidencia] = useState(null);

  const [loading, setLoading] = useState(false);
  const [mensajeOk, setMensajeOk] = useState("");
  const [mensajeError, setMensajeError] = useState("");

  // Enviar formulario
  async function handleSubmit(e) {
    e.preventDefault();
    setMensajeOk("");
    setMensajeError("");

    if (!idTipoActividad || !descripcion || !creditosOtorgados) {
      setMensajeError("Todos los campos obligatorios deben ser completados.");
      return;
    }

    try {
      setLoading(true);

      // FormData para enviar archivos
      const formData = new FormData();
      formData.append("id_tipo_actividad", Number(idTipoActividad));
      formData.append("descripcion", descripcion);
      formData.append("creditos_otorgados", Number(creditosOtorgados));
      if (fileEvidencia) {
        formData.append("evidencia", fileEvidencia);
      }

      await registrarActividadSostenible(formData);

      setMensajeOk("Actividad registrada correctamente ✔");
      setIdTipoActividad("");
      setDescripcion("");
      setCreditosOtorgados("");
      setFileEvidencia(null);
      e.target.reset();
    } catch (err) {
      setMensajeError(err.message || "Error registrando la actividad.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-emerald-950 text-emerald-50">

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-emerald-800 bg-emerald-950/80 backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-emerald-200 hover:text-emerald-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>

          <div className="flex items-center gap-2 ml-4">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20">
              <Leaf className="w-4 h-4 text-emerald-300" />
            </span>
            <h1 className="text-lg font-semibold">Actividades Sostenibles</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/mis-actividades")}
            className="px-4 py-2 text-sm rounded-full border border-emerald-600 hover:bg-emerald-800"
          >
            Mis actividades
          </button>

          <button
            onClick={() => navigate("/actividades-pendientes")}
            className="px-4 py-2 text-sm rounded-full border border-amber-400 text-amber-200 hover:bg-amber-500/10"
          >
            Actividades pendientes
          </button>

          <img src={hoja} alt="hoja" className="w-8 h-8" />
        </div>
      </header>

      {/* Contenido */}
      <main className="px-4 py-8 flex justify-center">
        <div className="w-full max-w-3xl bg-emerald-900/50 p-8 border border-emerald-700 rounded-3xl">

          <h2 className="text-2xl font-semibold mb-2">Registrar actividad sostenible</h2>
          <p className="text-sm text-emerald-200 mb-6">
            Registra acciones ecológicas que realizaste. El sistema calculará los créditos según las políticas definidas.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5" encType="multipart/form-data">

            {/* Tipo de actividad */}
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de actividad *</label>

              <select
                className="w-full rounded-2xl bg-emerald-900 text-white border border-emerald-700 px-4 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={idTipoActividad}
                onChange={(e) => setIdTipoActividad(e.target.value)}
              >
                <option value="" className="bg-emerald-900 text-white">
                  Selecciona un tipo de actividad
                </option>

                {TIPOS_ACTIVIDAD.map((tipo) => (
                  <option
                    key={tipo.id}
                    value={tipo.id}
                    className="bg-emerald-900 text-white"
                  >
                    {tipo.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium mb-1">Descripción *</label>
              <textarea
                className="w-full rounded-2xl bg-emerald-900/80 border border-emerald-700 px-4 py-2 text-sm min-h-[90px]
                  focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Describe lo que realizaste..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>

            {/* Créditos otorgados */}
            <div>
              <label className="block text-sm font-medium mb-1">Créditos otorgados *</label>
              <input
                type="number"
                min="1"
                className="w-full rounded-2xl bg-emerald-900/80 border border-emerald-700 px-4 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Ej. 10"
                value={creditosOtorgados}
                onChange={(e) => setCreditosOtorgados(e.target.value)}
              />
            </div>

            {/* Evidencia (archivo opcional) */}
            <div>
              <label className="block text-sm font-medium mb-1">Evidencia (opcional)</label>

              <input
                type="file"
                accept="image/*,application/pdf,video/*"
                className="block w-full text-sm text-emerald-100
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-emerald-600 file:text-emerald-50
                  hover:file:bg-emerald-500"
                onChange={(e) =>
                  setFileEvidencia(e.target.files ? e.target.files[0] : null)
                }
              />
            </div>

            {/* Mensajes */}
            {mensajeOk && (
              <div className="flex items-center gap-2 text-sm text-emerald-200 bg-emerald-800/60 border border-emerald-500 px-3 py-2 rounded-2xl">
                <CheckCircle2 className="w-4 h-4" />
                <span>{mensajeOk}</span>
              </div>
            )}

            {mensajeError && (
              <div className="text-sm text-red-200 bg-red-900/60 border border-red-500 px-3 py-2 rounded-2xl">
                {mensajeError}
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex justify-center py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm disabled:opacity-60"
            >
              {loading ? "Registrando..." : "Registrar actividad"}
            </button>

          </form>
        </div>
      </main>
    </div>
  );
}
