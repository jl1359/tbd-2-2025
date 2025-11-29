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
      // opcional: navigate("/intercambios");
    } catch (err) {
      console.error(err);
      alert(
        err.message ||
          "Ocurrió un error al realizar el intercambio. Revisa tu saldo."
      );
    }
  }

  // Click en la foto o en el avatar → ir al perfil
  function handleIrPerfil() {
    navigate("/perfil");
  }

  return (
    <div className="min-h-screen w-full flex flex-col px-4 md:px-8 py-4 text-white">
      {/* HEADER: logo DB + buscador expandido + campanita + billetera + perfil */}
      <header className="w-full max-w-6xl mx-auto flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          {/* IZQUIERDA: logo DB + buscador expandido */}
          <div className="flex items-center gap-3 flex-1">
            {/* Logo DB */}
            <div className="w-11 h-11 rounded-full bg-[#0b7a35] flex items-center justify-center shadow-lg">
              <span
                className="text-white text-xl font-bold"
                style={{
                  fontFamily: '"Berlin Sans FB Demi", system-ui, sans-serif',
                }}
              >
                DB
              </span>
            </div>

            {/* BUSCADOR EXPANDIDO */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar publicaciones..."
                  value={filtroTexto}
                  onChange={(e) => setFiltroTexto(e.target.value)}
                  className="w-full h-10 rounded-full bg-[#E9FFD9] text-gray-700 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#0b7a35] shadow"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                  🔍
                </div>
              </div>
            </div>
          </div>

          {/* DERECHA: campanita + billetera + perfil */}
          <div className="flex items-center gap-3">
            {/* campanita */}
            <button
              type="button"
              className="w-9 h-9 rounded-full bg-black/20 flex items-center justify-center border border-white/20 text-lg"
            >
              🔔
            </button>

            {/* Billetera GC */}
            <button
              type="button"
              className="flex items-center gap-2 rounded-full bg-[#F7B733] text-black px-3 h-[36px] text-xs font-semibold shadow"
            >
              <span>GC 0.00</span>
              <span className="text-lg leading-none">＋</span>
            </button>

            {/* Perfil → /perfil */}
            <button
              type="button"
              onClick={handleIrPerfil}
              className="flex items-center gap-2 bg-black/20 rounded-full pl-1 pr-3 h-[40px] border border-white/20"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
                <img
                  src={hoja}
                  alt="avatar"
                  className="w-7 h-7 object-contain"
                />
              </div>
              <span className="text-xs font-medium whitespace-nowrap">
                Mi Perfil
              </span>
            </button>
          </div>
        </div>

        {/* BOTONES: Crear Publicación, Tiendas, Campañas */}
        <div className="flex flex-wrap items-center gap-3 border-b border-white/15 pb-3">
          <a
            href="/publicaciones/nueva"
            className="px-4 py-2 rounded-md bg-[#0b7a35] text-xs md:text-sm font-semibold text-white"
          >
            + Crear Publicación
          </a>
          <button
            type="button"
            className="px-4 py-2 rounded-md bg-[#0b7a35] text-xs md:text-sm font-semibold text-white/90"
          >
            Tiendas
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-md bg-[#0b7a35] text-xs md:text-sm font-semibold text-white/90"
          >
            Campañas
          </button>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="w-full max-w-6xl mx-auto mt-5">
        {/* ERRORES */}
        {error && (
          <div className="mb-4 bg-red-900/50 border border-red-400 text-sm px-4 py-3 rounded-2xl text-red-50">
            {error}
          </div>
        )}

        {/* LISTA DE PUBLICACIONES / ESTADOS */}
        {cargando ? (
          <div className="text-center text-emerald-50/90 py-10 text-sm">
            Cargando publicaciones...
          </div>
        ) : filtradas.length === 0 ? (
          <div className="text-center text-emerald-50/90 py-10 text-sm">
            No se encontraron publicaciones activas con los filtros actuales.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {filtradas.map((p) => (
              <article
                key={p.id_publicacion}
                className="bg-[#E9FFD9] text-[#013726] rounded-3xl shadow-lg overflow-hidden flex flex-col transform transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-xl"
              >
                {/* IMAGEN (click → perfil) */}
                {p.imagen_url && (
                  <button
                    type="button"
                    onClick={handleIrPerfil}
                    className="block w-full overflow-hidden"
                  >
                    <img
                      src={p.imagen_url}
                      alt={p.titulo}
                      className="w-full h-40 object-cover transition-transform duration-300 ease-in-out hover:scale-105"
                    />
                  </button>
                )}

                {/* CONTENIDO TARJETA */}
                <div className="px-4 pt-3 pb-4 flex flex-col flex-1">
                  {/* fila superior: categoría + estado */}
                  <div className="flex items-center justify-between text-[0.7rem] mb-1">
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-[#B6E4A3] font-semibold">
                      {p.categoria || "Categoría"}
                    </span>
                    <span className="text-xs">
                      {p.estado ? `Estado: ${p.estado}` : "Estado activo"}
                    </span>
                  </div>

                  {/* Título y algunos datos */}
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

                  {/* Créditos y pie */}
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
      </main>
    </div>
  );
}