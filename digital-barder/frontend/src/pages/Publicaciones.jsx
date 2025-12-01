// digital-barder/frontend/src/pages/Publicaciones.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { crearIntercambio } from "../services/api";
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

  return (
    <div className="min-h-screen bg-[#082b1f] text-white p-6 md:p-10">
      {/* HEADER: título + buscar + categoría */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Título */}
          <div className="flex items-center gap-3">
            <img src={hoja} alt="logo" className="w-10 h-10 drop-shadow-lg" />
            <h1 className="text-3xl font-bold text-emerald-400">
              Publicaciones
            </h1>
          </div>

          {/* Buscar + Categoría al lado */}
          <div className="w-full md:flex-1">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              {/* Buscador */}
              <div className="flex-1">
                
                <div className="relative">
                  {/* Espacio para ícono a la izquierda */}
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    {/* Aquí luego puedes poner tu <img src={...} alt="icon" className="w-4 h-4" /> */}
                  </div>
                  <input
                    type="text"
                    value={filtroTexto}
                    onChange={(e) => setFiltroTexto(e.target.value)}
                    placeholder="Buscar..."
                    className="w-full md:max-w-md bg-[#0e4330] border border-emerald-600 rounded-lg px-3 py-2 pl-10 outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              </div>

              {/* Categoría al lado del buscador */}
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

            {/* Flechita original estilo .zip */}
            <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-white drop-shadow-[0_0_2px_rgba(0,0,0,0.4)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

                        </div>
                      </div>
                    </div>
                  </div>
                </div>

      {/* BOTONES (debajo, en el cuadro verde) */}
      <div className=" rounded-xl p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <a
            href="/publicaciones/nueva"
            className="flex items-center gap-2 bg-[#038547] hover:bg-[#026636] px-4 py-2 rounded-lg font-semibold text-sm shadow-md transition-all"
          >
            <span className="text-lg">＋</span>
            <span>Crear Publicación</span>
          </a>

          <a
            href="/tiendas"
            className="flex items-center gap-2 bg-[#038547] hover:bg-[#026636] px-4 py-2 rounded-lg font-semibold text-sm shadow-md transition-all"
          >
            <span className="text-lg">🏬</span>
            <span>Tiendas</span>
          </a>

          <a
            href="/campanas"
            className="flex items-center gap-2 bg-[#038547] hover:bg-[#026636] px-4 py-2 rounded-lg font-semibold text-sm shadow-md transition-all"
          >
            <span className="text-lg">📣</span>
            <span>Campañas</span>
          </a>
        </div>
      </div>

      {/* ERRORES */}
      {error && (
        <div className="mb-4 rounded-md border border-red-400 bg-red-900/40 px-4 py-2 text-sm text-red-100">
          {error}
        </div>
      )}

      {/* LISTA DE PUBLICACIONES (siempre debajo del bloque de botones) */}
      {cargando ? (
        <div className="text-center text-emerald-100/80">Cargando...</div>
      ) : filtradas.length === 0 ? (
        <div className="text-center text-emerald-100/80">
          No se encontraron publicaciones activas con los filtros actuales.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {filtradas.map((p) => (
            <article
              key={p.id_publicacion}
              className="bg-[#E9FFD9] text-[#013726] rounded-3xl shadow-lg overflow-hidden flex flex-col min-h-[360px] transform transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-xl"
            >
              {/* BLOQUE SUPERIOR FIJO */}
              <div className="w-full h-40 bg-[#E9FFD9] border-b border-[#c5f0b8] overflow-hidden">
                {p.imagen_url && (
                  <button
                    type="button"
                    onClick={handleIrPerfil}
                    className="block w-full h-full"
                  >
                    <img
                      src={p.imagen_url}
                      alt={p.titulo}
                      className="w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-105"
                    />
                  </button>
                )}
              </div>

              {/* CONTENIDO TARJETA */}
              <div className="px-4 pt-3 pb-4 flex flex-col flex-1">
                <div className="flex items-center justify-between text-[0.7rem] mb-1">
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-[#B6E4A3] font-semibold">
                    {p.categoria || "Categoría"}
                  </span>
                  <span className="text-xs">
                    {p.estado ? `Estado: ${p.estado}` : "Estado activo"}
                  </span>
                </div>

                <h2 className="mt-1 text-sm md:text-base font-semibold">
                  {p.titulo}
                </h2>

                <div className="mt-2 space-y-1 text-[0.7rem] md:text-xs">
                  {p.usuario && (
                    <p className="flex items-center gap-1">
                      <span>👤</span>
                      <span>{p.usuario}</span>
                    </p>
                  )}
                  {p.ubicacion && (
                    <p className="flex items-center gap-1">
                      <span>📍</span>
                      <span>{p.ubicacion}</span>
                    </p>
                  )}
                  <p className="flex items-center gap-1 text-gray-700">
                    <span>📦</span>
                    <span>{p.descripcion || "Sin descripción"}</span>
                  </p>
                </div>

                <div className="mt-3 flex items-end justify-between">
                  <div className="text-[0.7rem] md:text-xs text-gray-700">
                    <p className="font-semibold text-lg leading-tight">
                      {p.valor_creditos}{" "}
                    </p>
                    <p className="uppercase tracking-wide text-[0.65rem]">
                      Green Credits
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        alert(
                          "Aquí más adelante podemos abrir el detalle o flujo de intercambio."
                        )
                      }
                      className="text-[0.75rem] font-semibold text-[#0056D6] transition-colors duration-300 hover:text-[#003B8E]"
                    >
                      Ver Detalle
                    </button>
                    <button
                      type="button"
                      onClick={() => handleIntercambiar(p)}
                      className="mt-1 px-3 py-1 rounded-lg bg-[#0b7a35] hover:bg-[#0cb652] text-[0.7rem] font-semibold text-white transition-all duration-300 transform hover:scale-105"
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
