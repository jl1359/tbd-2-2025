// src/components/FloatingAd.jsx
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { buildUploadUrl } from "../services/api";

export default function FloatingAd({ anuncios = [], intervaloMs = 8000 }) {
  const [indice, setIndice] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!anuncios.length) return;
    setVisible(true);

    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndice((prev) => (prev + 1) % anuncios.length);
        setVisible(true);
      }, 400); // pequeña animación entre uno y otro
    }, intervaloMs);

    return () => clearInterval(interval);
  }, [anuncios, intervaloMs]);

  if (!anuncios.length || !visible) return null;

  const ad = anuncios[indice];

  return (
    <div
      className={`
        fixed bottom-4 right-4 z-50 max-w-xs
        transition-all duration-300
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}
      `}
    >
      <div className="bg-emerald-950/95 border border-emerald-500/70 rounded-2xl p-3 shadow-xl shadow-emerald-900/60 text-emerald-50">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <p className="text-[11px] text-emerald-300/80 mb-0.5">
              Publicidad
            </p>
            <h3 className="text-sm font-semibold leading-snug">
              {ad.titulo}
            </h3>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="text-emerald-200/70 hover:text-emerald-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {ad.banner_url && (
          <img
            src={buildUploadUrl(ad.banner_url)}
            alt={ad.titulo}
            className="mt-2 rounded-lg max-h-28 w-full object-contain bg-black/30"
          />
        )}

        {ad.descripcion && (
          <p className="mt-2 text-[11px] text-emerald-100/80 line-clamp-3">
            {ad.descripcion}
          </p>
        )}

        {ad.url_destino && (
          <a
            href={ad.url_destino}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center justify-center w-full text-[11px] font-medium px-2 py-1.5 rounded-full bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
          >
            Ver más
          </a>
        )}
      </div>
    </div>
  );
}
