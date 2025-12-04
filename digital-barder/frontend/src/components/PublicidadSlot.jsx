// frontend/src/components/PublicidadSlot.jsx
import { useEffect, useState } from "react";
import { getPublicidadActiva, buildUploadUrl } from "../services/api";
import { ExternalLink, Image as ImageIcon, Paperclip } from "lucide-react";

/**
 * Muestra un anuncio según la ubicación (nombre_ubicacion) que viene de la BD.
 *
 * Ejemplos de ubicaciones (según tu UBICACION_PUBLICIDAD):
 * - HOME_MIDDLE
 * - HOME_BOTTOM
 * - PUBLICACIONES_TOP
 * - PUBLICACIONES_MIDDLE
 * - SIDEBAR_TOP
 */
export default function PublicidadSlot({
  ubicacion,
  className = "",
  variant = "banner", // "banner" | "card"
}) {
  const [anuncio, setAnuncio] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function cargar() {
      try {
        const data = await getPublicidadActiva();
        const lista = Array.isArray(data) ? data : data?.data || [];
        // buscar primera publicidad para esa ubicación
        const ad = lista.find((a) => a.nombre_ubicacion === ubicacion);
        if (isMounted) setAnuncio(ad || null);
      } catch (err) {
        console.error("Error cargando publicidad para", ubicacion, err);
      }
    }

    cargar();
    // opcional: recargar cada cierto tiempo
    // const timer = setInterval(cargar, 60000);
    return () => {
      isMounted = false;
      // clearInterval(timer);
    };
  }, [ubicacion]);

  if (!anuncio) return null;

  const hasMedia = anuncio.banner_url || anuncio.archivo_url;

  if (variant === "card") {
    return (
      <div
        className={`rounded-2xl border border-emerald-700/70 bg-emerald-950/80 p-3 text-sm text-emerald-50 ${className}`}
      >
        <p className="text-[11px] text-emerald-300/80 mb-1">Publicidad</p>
        <h3 className="text-sm font-semibold leading-snug mb-1">
          {anuncio.titulo}
        </h3>
        {anuncio.descripcion && (
          <p className="text-[12px] text-emerald-100/80 line-clamp-3 mb-2">
            {anuncio.descripcion}
          </p>
        )}

        {anuncio.banner_url && (
          <img
            src={buildUploadUrl(anuncio.banner_url)}
            alt={anuncio.titulo}
            className="w-full max-h-40 object-contain rounded-lg border border-emerald-800/70 bg-black/30 mb-2"
          />
        )}

        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          {anuncio.url_destino && (
            <a
              href={anuncio.url_destino}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-emerald-300 hover:text-emerald-100"
            >
              <ExternalLink className="w-3 h-3" />
              Ver más
            </a>
          )}
          {anuncio.archivo_url && (
            <a
              href={buildUploadUrl(anuncio.archivo_url)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-emerald-200/90 hover:text-emerald-50"
            >
              <Paperclip className="w-3 h-3" />
              Archivo
            </a>
          )}
        </div>
      </div>
    );
  }

  // variant === "banner"
  return (
    <div
      className={`w-full rounded-2xl border border-emerald-700/70 bg-emerald-950/80 px-4 py-3 flex flex-col md:flex-row items-center gap-3 ${className}`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-emerald-300/80 mb-1">Publicidad</p>
        <h3 className="text-sm font-semibold leading-snug">
          {anuncio.titulo}
        </h3>
        {anuncio.descripcion && (
          <p className="text-[12px] text-emerald-100/80 line-clamp-2">
            {anuncio.descripcion}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3 text-[11px] mt-1">
          {anuncio.url_destino && (
            <a
              href={anuncio.url_destino}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-emerald-300 hover:text-emerald-100"
            >
              <ExternalLink className="w-3 h-3" />
              Ver más
            </a>
          )}
          {anuncio.archivo_url && (
            <a
              href={buildUploadUrl(anuncio.archivo_url)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-emerald-200/90 hover:text-emerald-50"
            >
              <Paperclip className="w-3 h-3" />
              Archivo
            </a>
          )}
        </div>
      </div>

      {hasMedia && anuncio.banner_url && (
        <div className="w-32 h-20 md:w-40 md:h-24 flex-shrink-0">
          <img
            src={buildUploadUrl(anuncio.banner_url)}
            alt={anuncio.titulo}
            className="w-full h-full object-contain rounded-xl border border-emerald-800/70 bg-black/40"
          />
        </div>
      )}

      {hasMedia && !anuncio.banner_url && (
        <div className="w-20 h-20 flex items-center justify-center rounded-xl border border-emerald-800/70 bg-black/40">
          <ImageIcon className="w-7 h-7 text-emerald-300/80" />
        </div>
      )}
    </div>
  );
}
