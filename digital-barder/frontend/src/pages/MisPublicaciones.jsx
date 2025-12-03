import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import hoja from "../assets/hoja.png";

export default function MisPublicaciones() {
  const [publicaciones, setPublicaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Categorías consistentes con PublicacionNueva.jsx
  const categorias = [
    { id: 1, nombre: "Bicicletas" },
    { id: 2, nombre: "Ropa" },
    { id: 3, nombre: "Electrónica" },
    { id: 4, nombre: "Hogar" },
    { id: 5, nombre: "Servicios" },
    { id: 6, nombre: "Otros" }
  ];

  useEffect(() => {
    cargarMisPublicaciones();
  }, []);

  async function cargarMisPublicaciones() {
    setCargando(true);
    setError("");
    try {
      const data = await api("/publicaciones/mias/listado");
      setPublicaciones(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando publicaciones:", err);
      setError(err.message || "No se pudieron cargar tus publicaciones. Verifica tu conexión.");
    } finally {
      setCargando(false);
    }
  }

  // Función para obtener el nombre de la categoría por ID
  function obtenerNombreCategoria(idCategoria) {
    if (!idCategoria) return "Sin categoría";
    const categoria = categorias.find(c => c.id === Number(idCategoria));
    return categoria ? categoria.nombre : `ID: ${idCategoria}`;
  }

  // Formatear fecha
  function formatearFecha(fechaString) {
    if (!fechaString) return "-";
    try {
      const fecha = new Date(fechaString);
      return fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return fechaString;
    }
  }

  return (
    <div className="min-h-screen bg-[#082b1f] text-white p-6 md:p-10">
      {/* HEADER */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={hoja} alt="logo" className="w-10 h-10 drop-shadow-lg" />
            <div>
              <h1 className="text-3xl font-bold text-emerald-400">
                Mis Publicaciones
              </h1>
              <p className="text-sm text-emerald-100/80">
                Administra y revisa todas tus publicaciones activas en el marketplace.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/publicaciones"
              className="flex items-center gap-2 bg-[#038547] hover:bg-[#026636] px-4 py-2 rounded-lg font-semibold text-sm shadow-md transition-all"
            >
              <span>🏬</span>
              <span>Ir al Publicaciones</span>
            </Link>
            <Link
              to="/publicaciones/nueva"
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg font-semibold text-sm shadow-md transition-all"
            >
              <span>＋</span>
              <span>Nueva Publicación</span>
            </Link>
          </div>
        </div>
      </div>

      {/* MENSAJES DE ESTADO */}
      {error && (
        <div className="mb-4 rounded-md border border-red-400 bg-red-900/40 px-4 py-2 text-sm text-red-100">
          {error}
        </div>
      )}

      {/* ESTADO DE CARGA */}
      {cargando ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-emerald-100/80">Cargando tus publicaciones...</p>
        </div>
      ) : publicaciones.length === 0 ? (
        <div className="bg-[#0f3f2d] border border-emerald-700 rounded-xl p-8 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-emerald-300 mb-2">No tienes publicaciones</h3>
          <p className="text-emerald-100/70 mb-6">Crea tu primera publicación para comenzar a intercambiar.</p>
          <Link
            to="/publicaciones/nueva"
            className="inline-flex items-center gap-2 bg-[#038547] hover:bg-[#026636] px-4 py-2 rounded-lg font-semibold shadow-md transition-all"
          >
            <span>＋</span>
            <span>Crear Primera Publicación</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* RESUMEN */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#0f3f2d] border border-emerald-700 rounded-xl p-4">
              <p className="text-sm text-emerald-300">Total Publicaciones</p>
              <p className="text-2xl font-bold text-emerald-400">{publicaciones.length}</p>
            </div>
            <div className="bg-[#0f3f2d] border border-emerald-700 rounded-xl p-4">
              <p className="text-sm text-emerald-300">Activas</p>
              <p className="text-2xl font-bold text-emerald-400">
                {publicaciones.filter(p => p.estado === "ACTIVA" || p.estado === "PUBLICADA").length}
              </p>
            </div>
            <div className="bg-[#0f3f2d] border border-emerald-700 rounded-xl p-4">
              <p className="text-sm text-emerald-300">Total Créditos</p>
              <p className="text-2xl font-bold text-emerald-400">
                {publicaciones.reduce((sum, p) => sum + (p.valor_creditos || 0), 0)}
              </p>
            </div>
            <div className="bg-[#0f3f2d] border border-emerald-700 rounded-xl p-4">
              <p className="text-sm text-emerald-300">Promedio por Pub.</p>
              <p className="text-2xl font-bold text-emerald-400">
                {publicaciones.length > 0 
                  ? Math.round(publicaciones.reduce((sum, p) => sum + (p.valor_creditos || 0), 0) / publicaciones.length)
                  : 0}
              </p>
            </div>
          </div>

          {/* TABLA DE PUBLICACIONES */}
          <div className="bg-[#0f3f2d] border border-emerald-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-[#082b1f] border-b border-emerald-600">
                  <tr>
                    <th className="text-left py-4 px-6 text-emerald-300 font-semibold">Título</th>
                    <th className="text-left py-4 px-6 text-emerald-300 font-semibold">Categoría</th>
                    <th className="text-left py-4 px-6 text-emerald-300 font-semibold">Créditos</th>
                    <th className="text-left py-4 px-6 text-emerald-300 font-semibold">Estado</th>
                    <th className="text-left py-4 px-6 text-emerald-300 font-semibold">Fecha</th>
                    <th className="text-left py-4 px-6 text-emerald-300 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {publicaciones.map((p) => (
                    <tr
                      key={p.id_publicacion}
                      className="border-b border-emerald-800/50 last:border-0 hover:bg-emerald-900/20 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-start gap-3">
                          {p.imagen_url && (
                            <img
                              src={p.imagen_url}
                              alt={p.titulo}
                              className="w-12 h-12 object-cover rounded-lg border border-emerald-700"
                            />
                          )}
                          <div>
                            <p className="font-medium text-emerald-100">{p.titulo}</p>
                            <p className="text-xs text-emerald-300/70 line-clamp-2 max-w-xs">
                              {p.descripcion || "Sin descripción"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex px-3 py-1 rounded-full bg-emerald-900/50 text-emerald-300 text-xs font-medium border border-emerald-700">
                          {obtenerNombreCategoria(p.id_categoria)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-bold text-emerald-400">{p.valor_creditos} cr.</p>
                          <p className="text-xs text-emerald-300/70">Green Credits</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${
                            p.estado === "ACTIVA" || p.estado === "PUBLICADA"
                              ? "border-emerald-500 bg-emerald-900/30 text-emerald-300"
                              : p.estado === "PENDIENTE"
                              ? "border-yellow-500 bg-yellow-900/30 text-yellow-300"
                              : "border-red-500 bg-red-900/30 text-red-300"
                          }`}
                        >
                          {p.estado || "—"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-emerald-100/80">
                        {formatearFecha(p.creado_en || p.created_at)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <button
                            className="px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-xs font-medium transition-colors"
                            onClick={() => {
                              // Aquí puedes agregar la función para editar
                              alert(`Editar publicación: ${p.titulo}`);
                            }}
                          >
                            Editar
                          </button>
                          <button
                            className="px-3 py-1 rounded-lg bg-red-900/40 hover:bg-red-800 text-red-300 text-xs font-medium border border-red-700 transition-colors"
                            onClick={() => {
                              if (window.confirm(`¿Estás seguro de eliminar "${p.titulo}"?`)) {
                                // Aquí puedes agregar la función para eliminar
                                alert(`Eliminar publicación: ${p.titulo}`);
                              }
                            }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* PIE DE TABLA */}
          <div className="flex flex-col md:flex-row md:items-center justify-between text-sm text-emerald-300/70">
            <p>Mostrando {publicaciones.length} publicación(es)</p>
            <div className="flex gap-2 mt-2 md:mt-0">
              <button
                className="px-3 py-1 rounded-lg border border-emerald-700 hover:bg-emerald-900/30 transition-colors"
                onClick={cargarMisPublicaciones}
              >
                ↻ Actualizar
              </button>
              <button
                className="px-3 py-1 rounded-lg border border-emerald-700 hover:bg-emerald-900/30 transition-colors"
                onClick={() => window.print()}
              >
                🖨️ Imprimir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}