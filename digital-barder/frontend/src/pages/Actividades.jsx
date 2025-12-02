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
  const [archivoEvidencia, setArchivoEvidencia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mensajeOk, setMensajeOk] = useState("");
  const [ultimaActividad, setUltimaActividad] = useState(null);

  const tiposActividad = [
    { id: "1", nombre: "Reciclaje" },
    { id: "2", nombre: "Movilidad sostenible" },
    { id: "3", nombre: "Voluntariado" },
    // Agrega más tipos de actividades aquí
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
      !descripcion.trim() ||
      !archivoEvidencia
    ) {
      setError(
        "Tipo de actividad, descripción, créditos otorgados y evidencia (archivo) son obligatorios."
      );
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("id_tipo_actividad", id_tipo_actividad);
      formData.append("descripcion", descripcion);
      formData.append("creditos_otorgados", creditos_otorgados);
      formData.append("evidencia", archivoEvidencia);

      const act = await registrarActividadSostenible(formData);

      setMensajeOk("Actividad registrada correctamente 🌱");
      setUltimaActividad(act);

      // Limpiar el formulario
      setDescripcion("");
      setCreditos("");
      setArchivoEvidencia(null);
      setIdTipoActividad(""); // Limpiar el tipo de actividad seleccionado
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Ocurrió un error al registrar la actividad sostenible."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleArchivoEvidenciaChange(e) {
    const file = e.target.files?.[0];
    setArchivoEvidencia(file || null);
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
            <span className="font-semibold">Actividades sostenibles</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/actividades/mias")}
            className="px-4 py-2 rounded-lg border border-emerald-500 text-sm hover:bg-emerald-500/10 font-semibold"
          >
            Mis actividades
          </button>
          <img src={hoja} alt="logo" className="w-9 h-9 drop-shadow-md" />
        </div>
      </header>

      {/* DESCRIPCIÓN */}
      <section className="mb-6 max-w-3xl">
        <h1 className="text-2xl font-semibold mb-2">
          Registrar actividad sostenible
        </h1>
        <p className="text-sm text-emerald-100/80">
          Aquí puedes registrar acciones ecológicas que realizaste (reciclaje,
          voluntariado, movilidad sostenible, etc.). El sistema las guardará en
          tu historial y te otorgará créditos verdes según las reglas
          definidas por el administrador.
        </p>
      </section>

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

      {/* FORMULARIO */}
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl bg-[#0f3f2d] border border-emerald-700 rounded-2xl p-5 shadow-md space-y-4"
      >
        {/* Tipo de actividad */}
        <div>
          <label className="block text-xs mb-1">Tipo de actividad *</label>
          <select
            value={idTipoActividad}
            onChange={(e) => setIdTipoActividad(e.target.value)}
            className="w-full rounded-lg border border-emerald-700 bg-emerald-950/80 px-3 py-2 text-sm outline-none focus:ring focus:ring-emerald-500/60"
          >
            <option value="">Selecciona un tipo de actividad</option>
            {tiposActividad.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-xs mb-1">Descripción *</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-emerald-700 bg-emerald-950/80 px-3 py-2 text-sm outline-none focus:ring focus:ring-emerald-500/60"
            placeholder="Ej. Participé 3 horas en una campaña de reforestación en el parque..."
          />
        </div>

        {/* Créditos */}
        <div>
          <label className="block text-xs mb-1">Créditos otorgados *</label>
          <input
            type="number"
            value={creditos}
            onChange={(e) => setCreditos(e.target.value)}
            className="w-full rounded-lg border border-emerald-700 bg-emerald-950/80 px-3 py-2 text-sm outline-none focus:ring focus:ring-emerald-500/60"
            placeholder="Ej. 10"
          />
        </div>

        {/* Subir archivo de evidencia */}
        <div>
          <label className="block text-xs mb-1">Evidencia (archivo) *</label>
          <input
            type="file"
            onChange={handleArchivoEvidenciaChange}
            className="w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-emerald-500 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-emerald-950 hover:file:bg-emerald-600"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-semibold text-emerald-950"
          >
            {loading ? "Guardando..." : "Registrar actividad"}
          </button>
        </div>
      </form>

      {/* ÚLTIMA ACTIVIDAD REGISTRADA (respuesta del backend) */}
      {ultimaActividad && (
        <section className="max-w-3xl mt-6 bg-[#0f3f2d] border border-emerald-700 rounded-2xl p-4 text-sm text-emerald-100/90">
          <p className="font-semibold mb-1">
            Última actividad registrada (respuesta del backend):
          </p>
          <pre className="text-xs overflow-x-auto">
            {JSON.stringify(ultimaActividad, null, 2)}
          </pre>
        </section>
      )}
    </div>
  );
}
