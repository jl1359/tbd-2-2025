// frontend/src/pages/Publicaciones.jsx
// digital-barder/frontend/src/pages/Publicaciones.jsx
import { useEffect, useState } from "react";
import { api, crearIntercambio, buildUploadUrl } from "../services/api";
import hoja from "../assets/hoja.png";
import PublicidadSlot from "../components/PublicidadSlot.jsx";

// Base de la API (ej: http://localhost:4000/api)
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";
// Base de archivos (sin /api, ej: http://localhost:4000)
const FILE_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

export default function Publicaciones() {
  const [publicaciones, setPublicaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("TODAS");

  useEffect(() => {
    cargarPublicaciones();
  }, []);

  async function cargarPublicaciones() {
    try {
      setError("");
      setCargando(true);
      const data = await api("/publicaciones");
      setPublicaciones(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las publicaciones.");
    } finally {
      setCargando(false);
    }
  }

  // Lista de categorías únicas + "TODAS"
  const categorias = [
    "TODAS",
    ...Array.from(
      new Set(
        publicaciones
          .map((p) => p.categoria)
          .filter(Boolean)
      )
    ),
  ];

  // Filtros (solo PUBLICADAS en el marketplace)
  const filtradas = publicaciones.filter((p) => {
    const estado = (p.estado || "").toUpperCase();

    // Solo mostrar publicaciones PUBLICADA
    if (estado !== "PUBLICADA") return false;

    const texto = filtroTexto.trim().toLowerCase();
    const coincideTexto =
      !texto ||
      (p.titulo || "").toLowerCase().includes(texto) ||
      (p.descripcion || "").toLowerCase().includes(texto);

    const categoriaPub = p.categoria || "OTROS";
    const coincideCategoria =
      filtroCategoria === "TODAS" || filtroCategoria === categoriaPub;

    return coincideTexto && coincideCategoria;
  });

  // 👉 Intercambiar publicación
  async function handleIntercambiar(pub) {
    const creditos = Number(pub.valor_creditos || 0);

    if (!pub.id_publicacion || !creditos) {
      alert("No se pudo determinar la publicación o sus créditos.");
      return;
    }

    const ok = window.confirm(
      `¿Quieres intercambiar ${creditos} créditos por "${pub.titulo}"?`
    );
    if (!ok) return;

    try {
      await crearIntercambio({
        id_publicacion: pub.id_publicacion,
        creditos,
      });

      alert("Intercambio realizado correctamente ✅");
      // Recargar: la publicación pasa a AGOTADA en BD y ya no pasa el filtro
      await cargarPublicaciones();
    } catch (err) {
      console.error(err);
      alert(
        err.message ||
          "Ocurrió un error al realizar el intercambio. Revisa tu saldo."
      );
    }
  }

  return (
    <div className="min-h-screen bg-[#082b1f] text-white p-6 md:p-10">
      {/* HEADER + FILTROS SUPERIORES */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={hoja} alt="logo" className="w-10 h-10 drop-shadow-lg" />
            <h1 className="text-3xl font-bold text-emerald-400">Marketplace</h1>
          </div>

          <div className="w-full md:flex-1">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              {/* Buscador */}
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    value={filtroTexto}
                    onChange={(e) => setFiltroTexto(e.target.value)}
                    placeholder="Buscar por título o descripción..."
                    className="w-full md:max-w-md bg-[#0e4330] border border-emerald-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              </div>

              {/* Categoría */}
              <div className="w-full md:w-64">
                <div className="relative">
                  <select
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                    className="appearance-none w-full bg-[#038547] border border-emerald-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    {categorias.map((c) => (
                      <option key={c} value={c}>
                        {c === "TODAS" ? "Todas las categorías" : c}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PUBLICIDAD SUPERIOR PARA LA SECCIÓN PUBLICACIONES */}
      <section className="mb-6">
        {/* Usa el nombre de ubicación que hayas definido en UBICACION_PUBLICIDAD.nombre */}
        <PublicidadSlot ubicacion="PUBLICACIONES_TOP" />
      </section>

      {/* BOTONES SUPERIORES */}
      <div className="rounded-xl p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <a
            href="/publicaciones/nueva"
            className="flex items-center gap-2 bg-[#038547] hover:bg-[#02a355] px-4 py-2 rounded-lg font-semibold text-sm shadow-md transition-all"
          >
            <span className="text-lg">＋</span>
            <span>Crear Publicación</span>
          </a>
          <a
            href="/publicaciones/mias"
            className="flex items-center gap-2 bg-[#038547] hover:bg-[#02a355] px-4 py-2 rounded-lg font-semibold text-sm shadow-md transition-all"
          >
            <span className="text-lg">📁</span>
            <span>Mis Publicaciones</span>
          </a>
        </div>
      </div>

      {/* ERRORES */}
      {error && (
        <div className="mb-4 rounded-md border border-red-400 bg-red-900/40 px-4 py-2 text-sm text-red-100">
          {error}
        </div>
      )}

      {/* LISTA DE PUBLICACIONES */}
      {cargando ? (
        <div className="text-center text-emerald-100/80">Cargando...</div>
      ) : filtradas.length === 0 ? (
        <div className="text-center text-emerald-100/80">
          No se encontraron publicaciones disponibles con los filtros actuales.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {filtradas.map((p) => {
            const estado = (p.estado || "").toUpperCase();
            const esActiva = estado === "PUBLICADA";

            // Construir URL completa del archivo usando helper
            let archivoUrl = null;

            if (p.imagen_url) {
              archivoUrl = buildUploadUrl(p.imagen_url);
            } else if (p.archivo_url) {
              archivoUrl = buildUploadUrl(p.archivo_url);
            }

            const esImagenVisible =
              archivoUrl &&
              /\.(png|jpe?g|gif|webp|bmp)$/i.test(archivoUrl || "");
            const esVideoVisible =
              archivoUrl &&
              /\.(mp4|webm|ogg|mov|avi|m4v)$/i.test(archivoUrl || "");

            return (
              <article
                key={p.id_publicacion}
                className="bg-[#E9FFD9] text-[#013726] rounded-3xl shadow-lg overflow-hidden flex flex-col min-h-[360px]"
              >
                {/* MEDIA (imagen o video) */}
                <div className="w-full h-40 bg-[#E9FFD9] border border-[#c5f0b8] overflow-hidden flex items-center justify-center">
                  {esImagenVisible && (
                    <img
                      src={archivoUrl}
                      alt={p.titulo}
                      className="w-full h-full object-cover hover:scale-105 transition-all"
                    />
                  )}
                  {!esImagenVisible && esVideoVisible && (
                    <video
                      src={archivoUrl || undefined}
                      className="w-full h-full object-cover"
                      controls
                      muted
                    />
                  )}
                  {!esImagenVisible && !esVideoVisible && archivoUrl && (
                    <a
                      href={archivoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#0056D6] underline font-semibold"
                    >
                      Ver archivo adjunto
                    </a>
                  )}
                </div>

                {/* CONTENIDO */}
                <div className="px-4 pt-3 pb-4 flex flex-col flex-1">
                  <div className="flex items-center justify-between text-[0.7rem] mb-1">
                    <span className="inline-flex px-2 py-1 rounded-full bg-[#B6E4A3] font-semibold">
                      {p.categoria || "Categoría"}
                    </span>
                    <span className="text-xs">{estado || "PUBLICADA"}</span>
                  </div>

                  <h2 className="mt-1 text-sm md:text-base font-semibold">
                    {p.titulo}
                  </h2>

                  <div className="mt-2 space-y-1 text-[0.7rem] md:text-xs">
                    {p.usuario && (
                      <p className="flex items-center gap-1">
                        <span>👤</span>
                        {p.usuario}
                      </p>
                    )}
                    {p.ubicacion && (
                      <p className="flex items-center gap-1">
                        <span>📍</span>
                        {p.ubicacion}
                      </p>
                    )}
                    <p className="flex items-center gap-1 text-gray-700">
                      <span>📦</span> {p.descripcion || "Sin descripción"}
                    </p>
                  </div>

                  <div className="mt-auto pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-lg">
                          {p.valor_creditos}
                        </p>
                        <p className="text-[0.65rem] uppercase tracking-wide">
                          Green Credits
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => esActiva && handleIntercambiar(p)}
                      disabled={!esActiva}
                      className={`w-full py-3 rounded-lg text-white font-semibold text-sm transition-all ${
                        esActiva
                          ? "bg-[#0cb652] hover:bg-[#0aa144]"
                          : "bg-[#0cb652] opacity-60 cursor-not-allowed"
                      }`}
                    >
                      Intercambiar
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* PUBLICIDAD INFERIOR OPCIONAL PARA PUBLICACIONES */}
      <section className="mt-6">
        <PublicidadSlot ubicacion="PUBLICACIONES_BOTTOM" variant="card" />
      </section>
    </div>
  );
}
