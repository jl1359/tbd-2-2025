// digital-barder/frontend/src/pages/Publicaciones.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, crearIntercambio } from "../services/api";
import hoja from "../assets/hoja.png";

export default function Publicaciones() {
  const [publicaciones, setPublicaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("TODAS");

  const navigate = useNavigate();

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

  const filtradas = publicaciones.filter((p) => {
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

  async function handleIntercambiar(pub) {
    const creditos = pub.valor_creditos;

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
    } catch (err) {
      console.error(err);
      alert(
        err.message ||
          "Ocurrió un error al realizar el intercambio. Revisa tu saldo."
      );
    }
  }

  function handleIrPerfil() {
    navigate("/perfil");
  }

  function handleIrMisPublicaciones() {
    navigate("/publicaciones/mias");
  }

  return (
    <div className="min-h-screen bg-[#082b1f] text-white p-6 md:p-10">
      {/* HEADER */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={hoja} alt="logo" className="w-10 h-10 drop-shadow-lg" />
            <h1 className="text-3xl font-bold text-emerald-400">
              Publicaciones
            </h1>
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
                    placeholder="Buscar..."
                    className="w-full md:max-w-md bg-[#0e4330] border border-emerald-600 rounded-lg px-3 py-2 pl-10 outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-300">
                    🔍
                  </div>
                </div>
              </div>

              {/* Categoría */}
              <div className="w-full md:w-64">
                <div className="relative">
                  <select
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                    className="appearance-none w-full bg-[#038547] border border-[#026636] rounded-lg px-3 py-2 pr-12 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    {categorias.map((c) => (
                      <option key={c} value={c}>
                        {c === "TODAS" ? "Todas las categorías" : c}
                      </option>
                    ))}
                  </select>

                  <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
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

      {/* BOTONES */}
      <div className="rounded-xl p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <Link
            to="/publicaciones/nueva"
            className="flex items-center gap-2 bg-[#038547] hover:bg-[#026636] px-4 py-2 rounded-lg font-semibold text-sm shadow-md transition-all"
          >
            <span className="text-lg">＋</span>
            <span>Crear Publicación</span>
          </Link>

          

          <Link
            to="/campanas"
            className="flex items-center gap-2 bg-[#038547] hover:bg-[#026636] px-4 py-2 rounded-lg font-semibold text-sm shadow-md transition-all"
          >
            <span className="text-lg">📣</span>
            <span>Campañas</span>
          </Link>

          <button
            type="button"
            onClick={handleIrMisPublicaciones}
            className="flex items-center gap-2 bg-[#038547] hover:bg-[#026636] px-4 py-2 rounded-lg font-semibold text-sm shadow-md transition-all"
          >
            <span className="text-lg">📁</span>
            <span>Mis Publicaciones</span>
          </button>
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
          No se encontraron publicaciones activas con los filtros actuales.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {filtradas.map((pub) => (
            <article
              key={pub.id_publicacion}
              className="bg-[#E9FFD9] text-[#013726] rounded-3xl shadow-lg overflow-hidden flex flex-col min-h-[360px]"
            >
              <div className="w-full h-40 bg-[#E9FFD9] border-b border-[#c5f0b8] overflow-hidden">
                {pub.imagen_url && (
                  <button
                    type="button"
                    onClick={handleIrPerfil}
                    className="block w-full h-full"
                  >
                    <img
                      src={pub.imagen_url}
                      className="w-full h-full object-cover hover:scale-105 transition-all"
                      alt={pub.titulo}
                    />
                  </button>
                )}
              </div>

              <div className="px-4 pt-3 pb-4 flex flex-col flex-1">
                <div className="flex items-center justify-between text-[0.7rem] mb-1">
                  <span className="inline-flex px-2 py-1 rounded-full bg-[#B6E4A3] font-semibold">
                    {pub.categoria || "Sin categoría"}
                  </span>
                  <span className={`text-xs ${pub.estado === "ACTIVA" ? "text-green-600" : "text-yellow-600"}`}>
                    {pub.estado || "Activo"}
                  </span>
                </div>

                <h2 className="mt-1 text-sm md:text-base font-semibold">
                  {pub.titulo}
                </h2>

                <div className="mt-2 space-y-1 text-[0.7rem] md:text-xs">
                  {pub.usuario && (
                    <p className="flex items-center gap-1">
                      <span>👤</span> {pub.usuario}
                    </p>
                  )}
                  {pub.ubicacion && (
                    <p className="flex items-center gap-1">
                      <span>📍</span> {pub.ubicacion}
                    </p>
                  )}
                  <p className="flex items-center gap-1 text-gray-700 line-clamp-2">
                    <span>📦</span> {pub.descripcion || "Sin descripción"}
                  </p>
                </div>

                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <p className="font-semibold text-lg">
                      {pub.valor_creditos}
                    </p>
                    <p className="text-[0.65rem] uppercase tracking-wide">
                      Green Credits
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <button className="text-[0.75rem] text-[#0056D6] hover:text-[#003B8E]">
                      Ver Detalle
                    </button>

                    <button
                      onClick={() => handleIntercambiar(pub)}
                      className="mt-1 px-3 py-1 rounded-lg bg-[#0b7a35] hover:bg-[#0cb652] text-[0.7rem] text-white"
                    >
                      Intercambiar
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}