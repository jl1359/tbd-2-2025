// digital-barder/frontend/src/pages/Publicidad.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPublicidadActiva, crearPublicidad } from "../services/api";
import {
  ArrowLeft,
  Megaphone,
  Monitor,
  CalendarRange,
  ExternalLink,
  Coins,
  ChevronDown, // 👈 añadido para el botón desplegable
} from "lucide-react";
import hoja from "../assets/hoja.png";

export default function Publicidad() {
  const navigate = useNavigate();

  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mensajeOk, setMensajeOk] = useState("");

  // formulario nueva publicidad
  const [idUbicacion, setIdUbicacion] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [urlDestino, setUrlDestino] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [costoCreditos, setCostoCreditos] = useState("");

  // media
  const [tipoMedia, setTipoMedia] = useState("imagen"); // "imagen" | "video"
  const [archivoMedia, setArchivoMedia] = useState(null);
  const [previewMediaUrl, setPreviewMediaUrl] = useState("");

  // 👇 NUEVO: controlar si se muestra u oculta el bloque de "Publicidad activa"
  const [mostrarPublicidadActiva, setMostrarPublicidadActiva] = useState(false);

  useEffect(() => {
    cargarPublicidad();
  }, []);

  useEffect(() => {
    return () => {
      if (previewMediaUrl) {
        URL.revokeObjectURL(previewMediaUrl);
      }
    };
  }, [previewMediaUrl]);

  async function cargarPublicidad() {
    try {
      setLoading(true);
      setError("");
      const data = await getPublicidadActiva();
      setAnuncios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudo cargar la publicidad activa.");
    } finally {
      setLoading(false);
    }
  }

  function handleArchivoMediaChange(e) {
    const file = e.target.files?.[0];
    setArchivoMedia(file || null);

    if (previewMediaUrl) {
      URL.revokeObjectURL(previewMediaUrl);
      setPreviewMediaUrl("");
    }

    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewMediaUrl(url);
    }
  }

  async function handleCrearPublicidad(e) {
    e.preventDefault();
    setError("");
    setMensajeOk("");

    const id_ubicacion = Number(idUbicacion || 0);
    const costo_creditos = Number(costoCreditos || 0);

    if (
      !id_ubicacion ||
      !titulo.trim() ||
      !fechaInicio ||
      !fechaFin ||
      !costo_creditos
    ) {
      setError(
        "id_ubicacion, título, fecha inicio, fecha fin y costo en créditos son obligatorios."
      );
      return;
    }

    try {
      await crearPublicidad({
        id_ubicacion,
        titulo,
        descripcion,
        url_destino: urlDestino || null,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        costo_creditos,
        // aquí en el futuro puedes mandar tipo_media o media_url si el backend lo soporta
      });

      setMensajeOk("Publicidad creada correctamente.");
      // limpiar
      setIdUbicacion("");
      setTitulo("");
      setDescripcion("");
      setUrlDestino("");
      setFechaInicio("");
      setFechaFin("");
      setCostoCreditos("");
      setArchivoMedia(null);
      if (previewMediaUrl) {
        URL.revokeObjectURL(previewMediaUrl);
        setPreviewMediaUrl("");
      }

      await cargarPublicidad();
    } catch (err) {
      console.error(err);
      setError(err.message || "Ocurrió un error al crear la publicidad.");
    }
  }

  return (
    <div className="min-h-screen bg-[#082b1f] text-white p-6 md:p-10">
      {/* HEADER */}
      <header className="flex items-center justify-between gap-4 mb-8">
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
            <Megaphone size={18} className="text-emerald-300" />
            <span className="font-semibold">Gestión de publicidad</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-emerald-100/80 flex items-center gap-1">
            <Monitor size={16} className="text-emerald-300" />
            Activos:{" "}
            <span className="font-semibold text-emerald-300">
              {anuncios.length}
            </span>
          </span>
          <img src={hoja} alt="logo" className="w-9 h-9 drop-shadow-md" />
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

      {/* CONTENIDO: LISTADO + FORMULARIO */}
      <div className="grid gap-6 lg:grid-cols-[2fr,1.5fr]">
        {/* LISTADO DE PUBLICIDAD ACTIVA */}
        <section className="bg-[#0f3f2d] border border-emerald-700 rounded-2xl p-4 md:p-5 shadow-md">
          <div className="flex items-center justify-between mb-3">
            {/* 👇 BOTÓN QUE ABRE / CIERRA EL BLOQUE */}
            <button
              type="button"
              onClick={() => setMostrarPublicidadActiva((prev) => !prev)}
              className="inline-flex items-center gap-2 text-lg font-semibold text-emerald-200 hover:text-emerald-100 hover:translate-y-[1px] transition-all"
            >
              <Monitor size={18} className="text-emerald-300" />
              <span>Publicidades activas</span>
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  mostrarPublicidadActiva ? "rotate-0" : "-rotate-90"
                }`}
              />
            </button>

            {/* CUADRO PUBLICIDAD LLAMATIVO */}
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-emerald-400 via-lime-300 to-emerald-500 text-xs font-extrabold text-emerald-900 shadow-[0_0_12px_rgba(34,197,94,0.6)] animate-pulse">
              PUBLICIDAD
            </div>
          </div>

          {/* CONTENIDO MOSTRADO/OCULTO SEGÚN EL BOTÓN */}
          {mostrarPublicidadActiva ? (
            loading ? (
              <p className="text-emerald-100/80 text-sm">
                Cargando anuncios...
              </p>
            ) : anuncios.length === 0 ? (
              <p className="text-emerald-100/80 text-sm">
                No hay publicidad activa en este momento.
              </p>
            ) : (
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {anuncios.map((ad) => (
                  <article
                    key={ad.id_publicidad}
                    className="rounded-2xl border border-emerald-700/70 bg-emerald-900/30 p-3 text-sm flex flex-col gap-2 shadow-sm"
                  >
                    {/* Badge PUBLICIDAD pequeño arriba de cada card */}
                    <div className="flex items-center justify-between mb-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/90 text-[10px] font-bold text-emerald-950 shadow-sm">
                        PUBLICIDAD
                      </span>

                      {typeof ad.costo_creditos === "number" && (
                        <div className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-emerald-800/70 border border-emerald-500/70">
                          <Coins size={14} className="text-emerald-300" />
                          <span>{ad.costo_creditos} cr.</span>
                        </div>
                      )}
                    </div>

                    {/* MEDIA con h-40 (video o imagen) */}
                    <div className="w-full h-40 rounded-xl overflow-hidden bg-black/30 mb-2 flex items-center justify-center">
                      {ad.media_url ? (
                        ad.tipo_media === "video" ? (
                          <video
                            src={ad.media_url}
                            className="w-full h-full object-cover"
                            autoPlay
                            muted
                            loop
                          />
                        ) : (
                          <img
                            src={ad.media_url}
                            alt={ad.titulo}
                            className="w-full h-full object-cover"
                          />
                        )
                      ) : (
                        <span className="text-[11px] text-emerald-200/70">
                          Sin media asociada
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs text-emerald-300/80">
                          ID #{ad.id_publicidad} · {ad.usuario || "Usuario"}
                        </p>
                        <h3 className="font-semibold text-emerald-100">
                          {ad.titulo}
                        </h3>
                      </div>
                    </div>

                    {ad.descripcion && (
                      <p className="text-emerald-100/80 text-xs">
                        {ad.descripcion}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-3 text-[11px] text-emerald-200/80 mt-1">
                      {ad.fecha_inicio && (
                        <span>
                          Inicio:{" "}
                          {new Date(ad.fecha_inicio).toLocaleDateString()}
                        </span>
                      )}
                      {ad.fecha_fin && (
                        <span>
                          Fin: {new Date(ad.fecha_fin).toLocaleDateString()}
                        </span>
                      )}
                      {ad.id_ubicacion && (
                        <span>Ubicación #{ad.id_ubicacion}</span>
                      )}
                    </div>

                    {ad.url_destino && (
                      <a
                        href={ad.url_destino}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-300 hover:text-emerald-100"
                      >
                        <ExternalLink size={14} />
                        Ver destino
                      </a>
                    )}
                  </article>
                ))}
              </div>
            )
          ) : (
            <p className="text-xs text-emerald-100/70 mt-1">
              Pulsa en <span className="font-semibold">“Publicidad activa”</span> para
              ver u ocultar los anuncios.
            </p>
          )}
        </section>

        {/* FORMULARIO NUEVA PUBLICIDAD */}
        <section className="bg-[#0f3f2d] border border-emerald-700 rounded-2xl p-4 md:p-5 shadow-md">
          <h2 className="text-lg font-semibold text-emerald-200 flex items-center gap-2 mb-3">
            <Megaphone size={18} className="text-emerald-300" />
            Crear nueva publicidad
          </h2>

          <p className="text-xs text-emerald-100/80 mb-3">
            Esta campaña descontará créditos de la billetera del usuario que la
            publica, según el costo configurado y la ubicación seleccionada.
          </p>

          <form onSubmit={handleCrearPublicidad} className="space-y-3 text-sm">
            {/* id_ubicacion */}
            <div>
              <label className="block text-xs mb-1">
                Ubicación donde se mostrará *
              </label>
              <select
                value={idUbicacion}
                onChange={(e) => setIdUbicacion(e.target.value)}
                className="w-full rounded-lg border border-emerald-700 bg-emerald-950/80 px-3 py-2 text-sm outline-none focus:ring focus:ring-emerald-500/60"
              >
                <option value="">Selecciona una ubicación</option>
                <option value="1">Banner superior (inicio)</option>
                <option value="2">Lateral derecha</option>
                <option value="3">Panel principal del dashboard</option>
              </select>
            </div>

            {/* título */}
            <div>
              <label className="block text-xs mb-1">Título *</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full rounded-lg border border-emerald-700 bg-emerald-950/80 px-3 py-2 text-sm outline-none focus:ring focus:ring-emerald-500/60"
                placeholder="Ej. Promociona tu ecoservicio aquí"
              />
            </div>

            {/* descripción */}
            <div>
              <label className="block text-xs mb-1">Descripción</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-emerald-700 bg-emerald-950/80 px-3 py-2 text-sm outline-none focus:ring focus:ring-emerald-500/60"
                placeholder="Describe brevemente el anuncio o campaña..."
              />
            </div>

            {/* url_destino */}
            <div>
              <label className="block text-xs mb-1">
                URL de destino (opcional)
              </label>
              <input
                type="url"
                value={urlDestino}
                onChange={(e) => setUrlDestino(e.target.value)}
                className="w-full rounded-lg border border-emerald-700 bg-emerald-950/80 px-3 py-2 text-sm outline-none focus:ring focus:ring-emerald-500/60"
                placeholder="https://ejemplo.com/mi-campaña"
              />
            </div>

            {/* MEDIA: tipo + archivo + preview */}
            <div>
              <label className="block text-xs mb-1">
                Media de la campaña (imagen o video)
              </label>

              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setTipoMedia("imagen")}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    tipoMedia === "imagen"
                      ? "bg-emerald-500 text-emerald-950 border-emerald-400"
                      : "bg-emerald-950/60 text-emerald-100 border-emerald-700"
                  }`}
                >
                  Imagen
                </button>
                <button
                  type="button"
                  onClick={() => setTipoMedia("video")}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    tipoMedia === "video"
                      ? "bg-emerald-500 text-emerald-950 border-emerald-400"
                      : "bg-emerald-950/60 text-emerald-100 border-emerald-700"
                  }`}
                >
                  Video
                </button>
              </div>

              <input
                type="file"
                accept={tipoMedia === "imagen" ? "image/*" : "video/*"}
                onChange={handleArchivoMediaChange}
                className="w-full text-xs text-emerald-100 file:mr-3 file:rounded-md file:border-0 file:bg-emerald-500 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-emerald-950 hover:file:bg-emerald-600"
              />

              <div className="mt-2 w-full h-40 rounded-xl overflow-hidden bg-black/30 flex items-center justify-center">
                {previewMediaUrl ? (
                  tipoMedia === "video" ? (
                    <video
                      src={previewMediaUrl}
                      className="w-full h-full object-cover"
                      controls
                    />
                  ) : (
                    <img
                      src={previewMediaUrl}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  <span className="text-[11px] text-emerald-200/70">
                    Aquí verás una vista previa del anuncio
                  </span>
                )}
              </div>
            </div>

            {/* costo_creditos */}
            <div>
              <label className="block text-xs mb-1">
                Costo en créditos (costo_creditos) *
              </label>
              <input
                type="number"
                value={costoCreditos}
                onChange={(e) => setCostoCreditos(e.target.value)}
                className="w-full rounded-lg border border-emerald-700 bg-emerald-950/80 px-3 py-2 text-sm outline-none focus:ring focus:ring-emerald-500/60"
                placeholder="Ej. 50"
              />
            </div>

            {/* fechas */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mb-1">Fecha inicio *</label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full rounded-lg border border-emerald-700 bg-emerald-950/80 px-3 py-2 text-sm outline-none focus:ring focus:ring-emerald-500/60"
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Fecha fin *</label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full rounded-lg border border-emerald-700 bg-emerald-950/80 px-3 py-2 text-sm outline-none focus:ring focus:ring-emerald-500/60"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-sm font-semibold text-emerald-950"
              >
                Publicar publicidad
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}