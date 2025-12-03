// digital-barder/frontend/src/pages/Publicaciones.jsx
import { useEffect, useState } from "react";
import { api, crearIntercambio } from "../services/api";
import hoja from "../assets/hoja.png";

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

  // Lista de categorías únicas
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
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 mb-8">
        <div className="flex items-center gap-3">
          <img src={hoja} alt="logo" className="w-10 h-10 drop-shadow-lg" />
          <h1 className="text-3xl font-bold text-emerald-400">
            Marketplace
          </h1>
        </div>

        <div className="flex gap-2">
          <a
            href="/publicaciones/nueva"
            className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg font-semibold"
          >
            Crear publicación
          </a>
          <a
            href="/publicaciones/mias"
            className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg font-semibold"
          >
            Mis publicaciones
          </a>
        </div>
      </div>

      {/* FILTROS */}
      <div className="bg-[#0f3f2d] border border-emerald-600 rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4 md:items-center">
        <div className="flex-1">
          <label className="block text-sm text-emerald-200 mb-1">
            Buscar
          </label>
          <input
            type="text"
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            placeholder="Título o descripción..."
            className="w-full bg-[#0e4330] border border-emerald-600 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        <div className="w-full md:w-64">
          <label className="block text-sm text-emerald-200 mb-1">
            Categoría
          </label>
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="w-full bg-[#0e4330] border border-emerald-600 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
          >
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c === "TODAS" ? "Todas las categorías" : c}
              </option>
            ))}
          </select>
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
        <div className="grid gap-5 md:grid-cols-3">
          {filtradas.map((p) => {
            const estado = (p.estado || "").toUpperCase();
            const esActiva = estado === "PUBLICADA";

            // Construir URL completa del archivo
            let archivoUrl = null;
            if (p.imagen_url) {
              const path = p.imagen_url.startsWith("/")
                ? p.imagen_url
                : "/" + p.imagen_url;
              archivoUrl = p.imagen_url.startsWith("http")
                ? p.imagen_url
                : FILE_BASE_URL + path;
            }

            const esImagenVisible =
              archivoUrl &&
              /\.(png|jpe?g|gif|webp|bmp)$/i.test(archivoUrl || "");

            return (
              <article
                key={p.id_publicacion}
                className="bg-[#0f3f2d] border border-emerald-700 rounded-xl p-4 shadow-md flex flex-col"
              >
                {/* Vista de archivo / imagen */}
                {esImagenVisible && (
                  <img
                    src={archivoUrl}
                    alt={p.titulo}
                    className="w-full h-40 object-cover rounded-lg mb-3"
                  />
                )}

                {!esImagenVisible && archivoUrl && (
                  <a
                    href={archivoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mb-3 inline-flex items-center gap-2 text-xs text-emerald-200 underline"
                  >
                    Ver archivo adjunto
                  </a>
                )}

                <h2 className="text-lg font-semibold text-emerald-200">
                  {p.titulo}
                </h2>

                <p className="text-xs text-emerald-300/80 mt-1">
                  {p.categoria || "Sin categoría"} · {p.usuario}
                </p>

                <p className="mt-2 text-sm text-emerald-100/90 line-clamp-3">
                  {p.descripcion || "Sin descripción"}
                </p>

                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="font-semibold text-emerald-300">
                    {p.valor_creditos} cr.
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full border border-emerald-400 text-emerald-300">
                    {estado}
                  </span>
                </div>

                <button
                  type="button"
                  className="mt-4 w-full rounded-lg bg-emerald-500/20 border border-emerald-500 py-2 text-sm font-semibold text-emerald-200"
                  onClick={() =>
                    alert(
                      "Aquí más adelante podemos abrir el detalle o flujo de intercambio."
                    )
                  }
                >
                  Ver detalle
                </button>

                <button
                  onClick={() => esActiva && handleIntercambiar(p)}
                  disabled={!esActiva}
                  className={`mt-3 w-full bg-emerald-500 hover:bg-emerald-600 text-emerald-950 font-semibold py-2 rounded-xl ${
                    !esActiva ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  Intercambiar
                </button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
