// digital-barder/frontend/src/pages/Publicidad.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPublicidadActiva,
  crearPublicidad,
  getMisCreditos,
} from "../services/api";
import {
  ArrowLeft,
  Megaphone,
  Monitor,
  CalendarRange,
  ExternalLink,
  Coins,
  ChevronDown,
  ImageIcon,
  Film,
  Upload,
} from "lucide-react";
import hoja from "../assets/hoja.png";

// ⚠️ AJUSTA estos IDs a los que tengas en tu tabla UBICACION_PUBLICIDAD
export const UBICACION_LOGIN_REGISTRO_ID = 1;
export const UBICACION_PUBLICACIONES_ID = 2;

const OPCIONES_UBICACION = [
  { id: UBICACION_LOGIN_REGISTRO_ID, value: "LOGIN_REGISTRO", label: "LOGIN / REGISTRO" },
  { id: UBICACION_PUBLICACIONES_ID, value: "PUBLICACIONES", label: "PUBLICACIONES" },
];

export default function Publicidad() {
  const navigate = useNavigate();

  // listado de publicidad activa
  const [anunciosActivos, setAnunciosActivos] = useState([]);
  const [cargandoActivos, setCargandoActivos] = useState(true);

  // UI
  const [error, setError] = useState("");
  const [mensajeOk, setMensajeOk] = useState("");

  // formulario nueva publicidad
  const [idUbicacion, setIdUbicacion] = useState("");
  const [ubicacionValue, setUbicacionValue] = useState(""); // LOGIN_REGISTRO / PUBLICACIONES
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [urlDestino, setUrlDestino] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [diasDuracion, setDiasDuracion] = useState(0);
  const [costoCreditos, setCostoCreditos] = useState(0);

  // media (imagen o video)
  const [mediaType, setMediaType] = useState("video"); // "video" | "imagen"
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState("");

  useEffect(() => {
    cargarPublicidad();
  }, []);

  async function cargarPublicidad() {
    try {
      setCargandoActivos(true);
      setError("");
      const data = await getPublicidadActiva();
      setAnunciosActivos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las publicidades activas.");
    } finally {
      setCargandoActivos(false);
    }
  }

  function calcularDiasYCostos(nuevaFechaInicio, nuevaFechaFin) {
    if (!nuevaFechaInicio || !nuevaFechaFin) {
      setDiasDuracion(0);
      setCostoCreditos(0);
      return;
    }

    const ini = new Date(nuevaFechaInicio);
    const fin = new Date(nuevaFechaFin);

    if (isNaN(ini.getTime()) || isNaN(fin.getTime()) || fin <= ini) {
      setDiasDuracion(0);
      setCostoCreditos(0);
      return;
    }

    const diffMs = fin.getTime() - ini.getTime();
    const dias = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    setDiasDuracion(dias);
    setCostoCreditos(dias * 10); // 10 créditos por día
  }

  function handleFechaInicioChange(e) {
    const value = e.target.value;
    setFechaInicio(value);
    calcularDiasYCostos(value, fechaFin);
  }

  function handleFechaFinChange(e) {
    const value = e.target.value;
    setFechaFin(value);
    calcularDiasYCostos(fechaInicio, value);
  }

  function handleUbicacionChange(e) {
    const value = e.target.value;
    setUbicacionValue(value);

    const opt = OPCIONES_UBICACION.find((o) => o.value === value);
    setIdUbicacion(opt ? String(opt.id) : "");
  }

  function handleMediaTypeChange(tipo) {
    setMediaType(tipo);
  }

  function handleMediaFileChange(e) {
    const file = e.target.files?.[0] || null;
    setMediaFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setMediaPreviewUrl(url);
    } else {
      setMediaPreviewUrl("");
    }
  }

  async function handleCrearPublicidad(e) {
    e.preventDefault();
    setError("");
    setMensajeOk("");

    const id_ubicacion = Number(idUbicacion || 0);
    const costo_creditos = Number(costoCreditos || 0);
    const esLoginRegistro = ubicacionValue === "LOGIN_REGISTRO";

    if (!id_ubicacion) {
      setError("Debes seleccionar una ubicación para la publicidad.");
      return;
    }

    if (!fechaInicio || !fechaFin) {
      setError("Debes seleccionar fecha de inicio y fecha de fin.");
      return;
    }

    // Normalizamos título:
    // - PUBLICACIONES → debe haber alguno
    // - LOGIN/REGISTRO → si está vacío, se rellena con un título por defecto
    let tituloNormalizado = titulo.trim();
    if (!tituloNormalizado && esLoginRegistro) {
      tituloNormalizado = "Publicidad Login/Registro";
    }
    if (ubicacionValue === "PUBLICACIONES" && !tituloNormalizado) {
      setError("Debes ingresar un título para la publicidad en Publicaciones.");
      return;
    }

    if (!costo_creditos || costo_creditos <= 0) {
      setError("El costo calculado no es válido. Revisa las fechas.");
      return;
    }

    if (!mediaFile) {
      setError("Debes seleccionar una imagen o un video para la publicidad.");
      return;
    }

    try {
      // 1) Verificar saldo de créditos
      const billetera = await getMisCreditos();
      const saldo = Number(billetera?.saldo_creditos ?? 0);

      if (saldo < costo_creditos) {
        setError(
          `No tienes suficientes créditos. Saldo actual: ${saldo}, costo requerido: ${costo_creditos}.`
        );
        return;
      }

      // 2) Armar FormData para enviar al backend (soporta archivo)
      const formData = new FormData();
      formData.append("id_ubicacion", String(id_ubicacion));
      formData.append("fecha_inicio", fechaInicio);
      formData.append("fecha_fin", fechaFin);
      formData.append("costo_creditos", String(costo_creditos));

      // 🔹 Siempre enviamos título normalizado, para que el backend no marque "faltan datos"
      if (tituloNormalizado) {
        formData.append("titulo", tituloNormalizado);
      }

      // Descripción y URL → siempre opcionales
      if (descripcion.trim()) formData.append("descripcion", descripcion.trim());
      if (urlDestino.trim()) formData.append("url_destino", urlDestino.trim());

      // archivo (nombre de campo AJÚSTALO si tu backend usa otro)
      formData.append("archivo", mediaFile); // backend: req.file("archivo") o similar
      formData.append("tipo_media", mediaType); // "video" | "imagen"

      await crearPublicidad(formData);

      setMensajeOk("Publicidad creada correctamente ✅");
      await cargarPublicidad();

      // reset formulario
      setUbicacionValue("");
      setIdUbicacion("");
      setTitulo("");
      setDescripcion("");
      setUrlDestino("");
      setFechaInicio("");
      setFechaFin("");
      setDiasDuracion(0);
      setCostoCreditos(0);
      setMediaFile(null);
      setMediaPreviewUrl("");
      setMediaType("video");
    } catch (err) {
      console.error(err);
      setError(
        err?.message ||
          "Ocurrió un error al crear la publicidad. Intenta nuevamente."
      );
    }
  }

  function handleVolver() {
    navigate(-1);
  }

  return (
    <div className="min-h-screen bg-[#082b1f] text-white p-6 md:p-10">
      {/* HEADER */}
      <header className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleVolver}
            className="flex items-center gap-2 text-emerald-200 hover:text-emerald-100"
          >
            <ArrowLeft size={20} />
            <span className="text-sm">Volver</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <img src={hoja} alt="logo" className="w-10 h-10 drop-shadow-lg" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-emerald-400">
              Gestión de Publicidad
            </h1>
            <p className="text-xs text-emerald-100/80">
              Configura si tu campaña aparece en Login/Registro o en Publicaciones.
            </p>
          </div>
        </div>
      </header>

      {/* MENSAJES */}
      {error && (
        <div className="mb-4 rounded-md border border-red-400 bg-red-900/40 px-4 py-2 text-sm text-red-100">
          {error}
        </div>
      )}
      {mensajeOk && (
        <div className="mb-4 rounded-md border border-emerald-400 bg-emerald-900/40 px-4 py-2 text-sm text-emerald-100">
          {mensajeOk}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LISTADO PREVIEW PUBLICIDAD ACTIVA */}
        <section className="lg:col-span-2 bg-[#0f3f2d] border border-emerald-700 rounded-2xl p-4 md:p-5 shadow-md">
          <h2 className="text-lg font-semibold text-emerald-200 flex items-center gap-2 mb-3">
            <Monitor size={18} className="text-emerald-300" />
            Publicidad activa (preview)
          </h2>

          {cargandoActivos ? (
            <p className="text-sm text-emerald-100/80">Cargando publicidades...</p>
          ) : anunciosActivos.length === 0 ? (
            <p className="text-sm text-emerald-100/70">
              No hay publicidad activa en este momento.
            </p>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {anunciosActivos.map((ad) => {
                const esLoginRegistro =
                  ad.id_ubicacion === UBICACION_LOGIN_REGISTRO_ID;
                const tituloMostrar = esLoginRegistro
                  ? "Banner LOGIN / REGISTRO"
                  : ad.titulo || "Sin título";

                return (
                  <article
                    key={ad.id_publicidad}
                    className="rounded-xl border border-emerald-700/70 bg-[#08291e] px-3 py-3 flex flex-col gap-2 text-xs"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#038547] text-white text-[0.65rem] font-semibold">
                          PUBLICIDAD
                        </span>
                        <span className="text-emerald-200/90 font-medium">
                          {tituloMostrar}
                        </span>
                      </div>
                      <span className="text-[0.65rem] text-emerald-200/80">
                        {ad.fecha_inicio?.slice(0, 10)} →{" "}
                        {ad.fecha_fin?.slice(0, 10)}
                      </span>
                    </div>
                    <div className="flex flex-wrap justify-between gap-2 text-emerald-100/80">
                      <p>
                        <span className="font-semibold">Ubicación:</span>{" "}
                        {esLoginRegistro
                          ? "LOGIN / REGISTRO"
                          : ad.id_ubicacion === UBICACION_PUBLICACIONES_ID
                          ? "PUBLICACIONES"
                          : ad.id_ubicacion}
                      </p>
                      <p>
                        <span className="font-semibold">Costo:</span>{" "}
                        {ad.costo_creditos} créditos
                      </p>
                      <p>
                        <span className="font-semibold">Estado:</span>{" "}
                        {ad.estado}
                      </p>
                      {ad.usuario && (
                        <p>
                          <span className="font-semibold">Anunciante:</span>{" "}
                          {ad.usuario}
                        </p>
                      )}
                    </div>

                    {/* Solo mostramos descripción en el preview si NO es login/registro */}
                    {!esLoginRegistro && ad.descripcion && (
                      <p className="text-[0.7rem] text-emerald-100/80 line-clamp-2">
                        {ad.descripcion}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          <p className="mt-3 text-[0.7rem] text-emerald-100/70 flex items-center gap-1">
            <CalendarRange size={14} />
            Solo se muestran aquí las campañas activas dentro del rango de fechas.
          </p>
        </section>

        {/* FORMULARIO NUEVA PUBLICIDAD */}
        <section className="bg-[#0f3f2d] border border-emerald-700 rounded-2xl p-4 md:p-5 shadow-md">
          <h2 className="text-lg font-semibold text-emerald-200 flex items-center gap-2 mb-3">
            <Megaphone size={18} className="text-emerald-300" />
            Crear nueva publicidad
          </h2>

          <p className="text-xs text-emerald-100/80 mb-3">
            Elige la ubicación, define las fechas, sube una imagen o video y se
            calculará el costo en créditos (10 por día). En LOGIN / REGISTRO,
            visualmente solo se mostrará el banner, aunque el título y la
            descripción se guarden.
          </p>

          <form onSubmit={handleCrearPublicidad} className="space-y-4 text-sm">
            {/* Ubicación */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-emerald-100">Ubicación</label>
              <div className="relative">
                <select
                  value={ubicacionValue}
                  onChange={handleUbicacionChange}
                  className="w-full bg-[#0e4330] border border-emerald-600 rounded-lg px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <option value="">Selecciona una ubicación</option>
                  {OPCIONES_UBICACION.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <ChevronDown className="w-4 h-4 text-emerald-200" />
                </span>
              </div>
            </div>

            {/* Título */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-emerald-100">Título</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Título de la campaña"
                className="w-full bg-[#0e4330] border border-emerald-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {/* Descripción */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-emerald-100">Descripción</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Texto descriptivo de la campaña"
                rows={3}
                className="w-full bg-[#0e4330] border border-emerald-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {/* MEDIA TYPE + FILE (CUADRITOS INTERACTIVOS + INPUT ARCHIVO) */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-emerald-100 flex items-center gap-1">
                <Upload size={14} />
                Archivo de la publicidad
              </label>

              {/* cuadritos interactivos */}
              <div className="grid grid-cols-2 gap-3 mb-2">
                <button
                  type="button"
                  onClick={() => handleMediaTypeChange("video")}
                  className={[
                    "flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium",
                    "transition-all duration-200",
                    mediaType === "video"
                      ? "border-emerald-400 bg-emerald-700/30 shadow-md"
                      : "border-emerald-800 bg-[#08291e] hover:border-emerald-500/70",
                  ].join(" ")}
                >
                  <Film size={14} />
                  <span>Video</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleMediaTypeChange("imagen")}
                  className={[
                    "flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium",
                    "transition-all duration-200",
                    mediaType === "imagen"
                      ? "border-emerald-400 bg-emerald-700/30 shadow-md"
                      : "border-emerald-800 bg-[#08291e] hover:border-emerald-500/70",
                  ].join(" ")}
                >
                  <ImageIcon size={14} />
                  <span>Imagen</span>
                </button>
              </div>

              {/* input archivo */}
              <input
                type="file"
                accept={
                  mediaType === "video"
                    ? "video/mp4,video/webm,video/ogg"
                    : "image/png,image/jpeg,image/jpg,image/webp"
                }
                onChange={handleMediaFileChange}
                className="w-full text-xs text-emerald-100 file:mr-3 file:rounded-md file:border-0 file:bg-emerald-600 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white hover:file:bg-emerald-500"
              />

              {/* preview debajo */}
              {mediaPreviewUrl && (
                <div className="mt-3 rounded-xl border border-emerald-700 bg-[#08291e] p-2">
                  {mediaType === "imagen" ? (
                    <img
                      src={mediaPreviewUrl}
                      alt="preview"
                      className="w-full max-h-48 object-contain rounded-lg"
                    />
                  ) : (
                    <video
                      src={mediaPreviewUrl}
                      className="w-full max-h-48 rounded-lg"
                      controls
                      muted
                    />
                  )}
                </div>
              )}
            </div>

            {/* URL destino (siempre opcional) */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-emerald-100 flex items-center gap-1">
                <ExternalLink size={14} />
                URL de destino (opcional)
              </label>
              <input
                type="url"
                value={urlDestino}
                onChange={(e) => setUrlDestino(e.target.value)}
                placeholder="https://tusitio.com"
                className="w-full bg-[#0e4330] border border-emerald-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {/* Fechas + costo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-emerald-100 flex items-center gap-1">
                  <CalendarRange size={14} />
                  Fecha inicio
                </label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={handleFechaInicioChange}
                  className="w-full bg-[#0e4330] border border-emerald-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="text-sm text-emerald-100 flex items-center gap-1">
                  <CalendarRange size={14} />
                  Fecha fin
                </label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={handleFechaFinChange}
                  className="w-full bg-[#0e4330] border border-emerald-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div className="flex flex-col justify-center bg-[#0e4330] border border-emerald-600 rounded-lg px-3 py-2 text-xs text-emerald-100/80">
                <p>
                  Duración:{" "}
                  <span className="font-semibold text-emerald-300">
                    {diasDuracion > 0 ? `${diasDuracion} día(s)` : "—"}
                  </span>
                </p>
                <p className="mt-1">
                  Costo (10 créditos / día):{" "}
                  <span className="font-semibold text-emerald-300">
                    {costoCreditos > 0 ? `${costoCreditos} créditos` : "—"}
                  </span>
                </p>
              </div>
            </div>

            {/* Botón enviar */}
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-[#038547] hover:bg-[#026636] px-4 py-2 rounded-lg font-semibold text-sm shadow-md transition-all"
              >
                <Coins size={16} />
                Publicar publicidad
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
