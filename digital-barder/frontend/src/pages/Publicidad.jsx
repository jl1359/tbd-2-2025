// digital-barder/frontend/src/pages/Publicidad.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPublicidadActiva,
  crearPublicidad,
  getUbicacionesPublicidad,
  buildUploadUrl,
} from "../services/api";
import {
  ArrowLeft,
  Megaphone,
  Monitor,
  ExternalLink,
  Coins,
  Image as ImageIcon,
  Paperclip,
  Loader2,
} from "lucide-react";
import hoja from "../assets/hoja.png";

// Para subir archivos reutilizamos el mismo patrón que en Publicaciones.jsx
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";
const FILE_BASE_URL = API_URL.replace(/\/api\/?$/, "");

// helper para subida a /uploads
async function subirArchivoBackend(file) {
  const formData = new FormData();
  formData.append("archivo", file); // 👈 debe llamarse igual que en el backend

  const token = localStorage.getItem("token") || "";

  const res = await fetch(`${FILE_BASE_URL}/uploads`, {
    method: "POST",
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
    body: formData,
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || "Error al subir archivo/imagen.");
  }

  let data = {};
  try {
    data = JSON.parse(text);
  } catch {
    // por si el backend devuelve texto plano
  }

  // normalmente: { url: "/uploads/archivo.png" }
  return data.url || data.path || text;
}

export default function Publicidad() {
  const navigate = useNavigate();

  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mensajeOk, setMensajeOk] = useState("");

  // catálogo de ubicaciones
  const [ubicaciones, setUbicaciones] = useState([]);

  // formulario nueva publicidad
  const [idUbicacion, setIdUbicacion] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [urlDestino, setUrlDestino] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [costoCreditos, setCostoCreditos] = useState("");

  // archivos
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerUrl, setBannerUrl] = useState("");
  const [bannerPreview, setBannerPreview] = useState(null);

  const [archivoFile, setArchivoFile] = useState(null);
  const [archivoUrl, setArchivoUrl] = useState("");

  const [subiendo, setSubiendo] = useState(false);

  useEffect(() => {
    cargarPublicidad();
    cargarUbicaciones();
  }, []);

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

  async function cargarUbicaciones() {
    try {
      const data = await getUbicacionesPublicidad();
      setUbicaciones(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando ubicaciones de publicidad", err);
      // no es crítico; simplemente no habrá opciones
    }
  }

  // ------- subida de archivos --------
  async function handleSubirArchivo(file, tipo) {
    if (!file) return;
    try {
      setSubiendo(true);
      setError("");

      const rawUrl = await subirArchivoBackend(file);
      const finalUrl = buildUploadUrl(rawUrl); // arma URL absoluta

      if (tipo === "banner") {
        setBannerUrl(finalUrl);
      } else {
        setArchivoUrl(finalUrl);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al subir archivo/imagen.");
    } finally {
      setSubiendo(false);
    }
  }

  function handleBannerChange(e) {
    const file = e.target.files?.[0] || null;
    setBannerFile(file);
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setBannerPreview(localUrl);
      handleSubirArchivo(file, "banner");
    } else {
      setBannerPreview(null);
      setBannerUrl("");
    }
  }

  function handleArchivoChange(e) {
    const file = e.target.files?.[0] || null;
    setArchivoFile(file);
    if (file) {
      handleSubirArchivo(file, "archivo");
    } else {
      setArchivoUrl("");
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
        "Ubicación, título, fecha inicio, fecha fin y costo en créditos son obligatorios."
      );
      return;
    }

    if (subiendo) {
      setError("Espera a que terminen de subir los archivos antes de guardar.");
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
        banner_url: bannerUrl || null,
        archivo_url: archivoUrl || null,
      });

      setMensajeOk(
        "Publicidad creada correctamente (queda en estado PROGRAMADA)."
      );

      // limpiar
      setIdUbicacion("");
      setTitulo("");
      setDescripcion("");
      setUrlDestino("");
      setFechaInicio("");
      setFechaFin("");
      setCostoCreditos("");
      setBannerFile(null);
      setBannerUrl("");
      setBannerPreview(null);
      setArchivoFile(null);
      setArchivoUrl("");

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
      <div className="grid gap-6 lg:grid-cols-[2fr,1.6fr]">
        {/* LISTADO DE PUBLICIDAD ACTIVA */}
        <section className="bg-[#0f3f2d] border border-emerald-700 rounded-2xl p-4 md:p-5 shadow-md">
          <h2 className="text-lg font-semibold text-emerald-200 flex items-center gap-2 mb-3">
            <Monitor size={18} className="text-emerald-300" />
            Publicidad activa
          </h2>

          {loading ? (
            <p className="text-emerald-100/80 text-sm">Cargando anuncios...</p>
          ) : anuncios.length === 0 ? (
            <p className="text-emerald-100/80 text-sm">
              No hay publicidad activa en este momento.
            </p>
          ) : (
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {anuncios.map((ad) => (
                <article
                  key={ad.id_publicidad}
                  className="rounded-xl border border-emerald-700/70 bg-emerald-900/30 p-3 text-sm flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-emerald-300/80">
                        ID #{ad.id_publicidad} · {ad.usuario || "Usuario"}
                      </p>
                      <h3 className="font-semibold text-emerald-100">
                        {ad.titulo}
                      </h3>
                      {ad.id_ubicacion && (
                        <p className="text-[11px] text-emerald-300/80">
                          Ubicación ID: {ad.id_ubicacion}
                        </p>
                      )}
                    </div>

                    {typeof ad.costo_creditos === "number" && (
                      <div className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-emerald-800/70 border border-emerald-500/70">
                        <Coins size={14} className="text-emerald-300" />
                        <span>{ad.costo_creditos} cr.</span>
                      </div>
                    )}
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
                  </div>

                  <div className="flex flex-wrap gap-3 mt-1 text-[11px]">
                    {ad.banner_url && (
                      <a
                        href={buildUploadUrl(ad.banner_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-300 hover:text-emerald-100"
                      >
                        <ImageIcon size={13} />
                        Ver banner
                      </a>
                    )}
                    {ad.archivo_url && (
                      <a
                        href={buildUploadUrl(ad.archivo_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-300 hover:text-emerald-100"
                      >
                        <Paperclip size={13} />
                        Archivo
                      </a>
                    )}
                    {ad.url_destino && (
                      <a
                        href={ad.url_destino}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-300 hover:text-emerald-100"
                      >
                        <ExternalLink size={13} />
                        Ver destino
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* FORMULARIO NUEVA PUBLICIDAD */}
        <section className="bg-[#0f3f2d] border border-emerald-700 rounded-2xl p-4 md:p-5 shadow-md">
          <h2 className="text-lg font-semibold text-emerald-200 flex items-center gap-2 mb-3">
            <Megaphone size={18} className="text-emerald-300" />
            Crear nueva publicidad
          </h2>

          <p className="text-xs text-emerald-100/80 mb-3">
            Esta campaña se crea en estado <strong>PROGRAMADA</strong>. Solo el
            administrador puede activarla para que se muestre y consuma
            créditos.
          </p>

          <form onSubmit={handleCrearPublicidad} className="space-y-3 text-sm">
            {/* id_ubicacion como SELECT */}
            <div>
              <label className="block text-xs mb-1">
                Ubicación de la publicidad *
              </label>
              <select
                value={idUbicacion}
                onChange={(e) => setIdUbicacion(e.target.value)}
                className="w-full rounded-lg border border-emerald-700 bg-emerald-950/80 px-3 py-2 text-sm outline-none focus:ring focus:ring-emerald-500/60"
              >
                <option value="">Selecciona una ubicación...</option>
                {ubicaciones.map((u) => (
                  <option key={u.id_ubicacion} value={u.id_ubicacion}>
                    {u.nombre}
                    {u.descripcion ? ` - ${u.descripcion}` : ""}{" "}
                    {u.precio_base != null ? `(${u.precio_base} Bs base)` : ""}
                  </option>
                ))}
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

            {/* costo_creditos */}
            <div>
              <label className="block text-xs mb-1">
                Costo en créditos (costo_creditos) *
              </label>
              <input
                type="number"
                min={1}
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

            {/* Archivos */}
            <div className="grid gap-3 md:grid-cols-2">
              {/* Banner */}
              <div>
                <label className="block text-xs mb-1">
                  Imagen / banner (opcional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerChange}
                  className="block w-full text-xs text-emerald-100
                             file:mr-4 file:py-2 file:px-3
                             file:rounded-full file:border-0
                             file:text-xs file:font-semibold
                             file:bg-emerald-500 file:text-emerald-950
                             hover:file:bg-emerald-400"
                />
                {bannerPreview && (
                  <div className="mt-2">
                    <p className="text-[11px] text-emerald-100/80 mb-1">
                      Vista previa:
                    </p>
                    <img
                      src={bannerPreview}
                      alt="banner publicidad"
                      className="max-h-24 w-full object-contain rounded-lg border border-emerald-700/70 bg-black/30"
                    />
                  </div>
                )}
              </div>

              {/* Archivo adjunto */}
              <div>
                <label className="block text-xs mb-1">
                  Archivo adjunto (opcional)
                </label>
                <input
                  type="file"
                  onChange={handleArchivoChange}
                  className="block w-full text-xs text-emerald-100
                             file:mr-4 file:py-2 file:px-3
                             file:rounded-full file:border-0
                             file:text-xs file:font-semibold
                             file:bg-emerald-500 file:text-emerald-950
                             hover:file:bg-emerald-400"
                />
                {archivoUrl && (
                  <p className="mt-2 text-[11px] text-emerald-100/80 break-all">
                    Archivo subido:{" "}
                    <a
                      href={archivoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 underline text-emerald-300 hover:text-emerald-100"
                    >
                      <Paperclip size={12} />
                      Ver archivo
                    </a>
                  </p>
                )}
              </div>
            </div>

            {subiendo && (
              <p className="flex items-center gap-1 text-[11px] text-emerald-100/80">
                <Loader2 className="w-3 h-3 animate-spin" />
                Subiendo archivo/imagen...
              </p>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={subiendo}
                className="px-6 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-sm font-semibold text-emerald-950 disabled:opacity-60 inline-flex items-center gap-2"
              >
                {subiendo && <Loader2 className="w-4 h-4 animate-spin" />}
                Guardar publicidad
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
