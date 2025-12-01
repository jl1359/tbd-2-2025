import { useEffect, useState } from "react";
import { api } from "../services/api";
import hoja from "../assets/hoja.png";

export default function MisPublicaciones() {
  const [publicaciones, setPublicaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Mapa de categorías (ID -> Nombre) - Mismo que usaste en PublicacionNueva
  const categorias = {
    1: "Bicicletas",  // Cambia por los nombres reales de tu BD
    2: "Ropa"        // Cambia por los nombres reales de tu BD
  };

  useEffect(() => {
    cargarMisPublicaciones();
  }, []);

  async function cargarMisPublicaciones() {
    setCargando(true);
    setError("");
    try {
      // 👇 ruta EXACTA según tu router de backend
      const data = await api("/publicaciones/mias/listado");
      setPublicaciones(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudieron cargar tus publicaciones.");
    } finally {
      setCargando(false);
    }
  }

  // Función para obtener el nombre de la categoría por su ID
  function obtenerNombreCategoria(idCategoria) {
    return categorias[idCategoria] || `ID: ${idCategoria}`;
  }

  return (
    <div className="min-h-screen bg-[#082b1f] text-white p-6 md:p-10">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 mb-8">
        <div className="flex items-center gap-3">
          <img src={hoja} alt="logo" className="w-10 h-10 drop-shadow-lg" />
          <div>
            <h1 className="text-3xl font-bold text-emerald-400">
              Mis publicaciones
            </h1>
            <p className="text-sm text-emerald-100/80">
              Aquí ves todo lo que has publicado.
            </p>
          </div>
        </div>

        <a
          href="/publicaciones"
          className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg font-semibold"
        >
          Ir a publicaciones
        </a>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-4 rounded-md border border-red-400 bg-red-900/40 px-4 py-2 text-sm text-red-100">
          {error}
        </div>
      )}

      {/* CONTENIDO */}
      {cargando ? (
        <div className="text-center text-emerald-100/80">Cargando...</div>
      ) : !error && publicaciones.length === 0 ? (
        <div className="text-center text-emerald-100/80">
          Todavía no has creado ninguna publicación.
        </div>
      ) : !error ? (
        <div className="bg-[#0f3f2d] border border-emerald-700 rounded-xl overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-emerald-600 text-emerald-300">
              <tr>
                <th className="text-left py-2 px-4">Título</th>
                <th className="text-left py-2 px-4">Categoría</th>
                <th className="text-left py-2 px-4">Créditos</th>
                <th className="text-left py-2 px-4">Estado</th>
                <th className="text-left py-2 px-4">Creado</th>
              </tr>
            </thead>
            <tbody>
              {publicaciones.map((p) => (
                <tr
                  key={p.id_publicacion}
                  className="border-b border-emerald-800/50 last:border-0"
                >
                  <td className="py-2 px-4">{p.titulo}</td>
                  <td className="py-2 px-4">
                    {/* Aquí cambiamos: mostramos el nombre, no el ID */}
                    {obtenerNombreCategoria(p.id_categoria)}
                  </td>
                  <td className="py-2 px-4">{p.valor_creditos} cr.</td>
                  <td className="py-2 px-4">
                    <span
                      className={`px-2 py-1 rounded-full border text-xs ${
                        p.estado === "PUBLICADA" || p.estado === "ACTIVA"
                          ? "border-emerald-400 text-emerald-300"
                          : "border-yellow-400 text-yellow-300"
                      }`}
                    >
                      {p.estado || "—"}
                    </span>
                  </td>
                  <td className="py-2 px-4">
                    {p.creado_en || p.created_at || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}