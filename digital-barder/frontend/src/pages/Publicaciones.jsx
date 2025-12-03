// digital-barder/frontend/src/pages/Publicaciones.jsx
import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, getPublicidadActiva, crearIntercambio } from "../services/api";
import hoja from "../assets/hoja.png";

export default function Publicaciones() {
  const [publicaciones, setPublicaciones] = useState([]);
  const [anuncios, setAnuncios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("TODAS");

  const navigate = useNavigate();

  useEffect(() => {
    cargarTodo();
  }, []);

  async function cargarTodo() {
    try {
      setError("");
      setCargando(true);

      const [dataPublicaciones, dataPublicidad] = await Promise.all([
        api("/publicaciones"),
        getPublicidadActiva(),
      ]);

      setPublicaciones(Array.isArray(dataPublicaciones) ? dataPublicaciones : []);
      setAnuncios(Array.isArray(dataPublicidad) ? dataPublicidad : []);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las publicaciones o la publicidad.");
    } finally {
      setCargando(false);
    }
  }

  const categorias = [
    "TODAS",
    ...Array.from(
      new Set(publicaciones.map((p) => p.categoria).filter(Boolean))
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

  // 3 publicaciones + 1 fila de publicidad
  const itemsCombinados = [];
  let indiceAnuncio = 0;

  for (let i = 0; i < filtradas.length; i++) {
    itemsCombinados.push({ tipo: "PUBLICACION", data: filtradas[i] });

    const esMultiploDeTres = (i + 1) % 3 === 0;

    if (esMultiploDeTres && anuncios.length > 0) {
      const grupo = [];
      for (let j = 0; j < 5 && j < anuncios.length; j++) {
        const idx = (indiceAnuncio + j) % anuncios.length;
        grupo.push(anuncios[idx]);
      }
      indiceAnuncio = (indiceAnuncio + 5) % anuncios.length;

      itemsCombinados.push({
        tipo: "PUBLICIDAD",
        data: grupo,
        idFila: `fila-ads-${i}`,
      });
    }
  }

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
    navigate("/mis-publicaciones");
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
            to="/tiendas"
            className="flex items-center gap-2 bg-[#038547] hover:bg-[#026636] px-4 py-2 rounded-lg font-semibold text-sm shadow-md transition-all"
          >
            <span className="text-lg">🏬</span>
            <span>Tiendas</span>
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

      {/* LISTA COMBINADA */}
      {cargando ? (
        <div className="text-center text-emerald-100/80">Cargando...</div>
      ) : itemsCombinados.length === 0 ? (
        <div className="text-center text-emerald-100/80">
          No se encontraron publicaciones con los filtros actuales.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {itemsCombinados.map((item, index) =>
            item.tipo === "PUBLICACION" ? (
              <article
                key={`pub-${item.data.id_publicacion}-${index}`}
                className="bg-[#E9FFD9] text-[#013726] rounded-3xl shadow-lg overflow-hidden flex flex-col min-h-[360px]"
              >
                <div className="w-full h-40 bg-[#E9FFD9] border-b border-[#c5f0b8] overflow-hidden">
                  {item.data.imagen_url && (
                    <button
                      type="button"
                      onClick={handleIrPerfil}
                      className="block w-full h-full"
                    >
                      <img
                        src={item.data.imagen_url}
                        className="w-full h-full object-cover hover:scale-105 transition-all"
                        alt=""
                      />
                    </button>
                  )}
                </div>

                <div className="px-4 pt-3 pb-4 flex flex-col flex-1">
                  <div className="flex items-center justify-between text-[0.7rem] mb-1">
                    <span className="inline-flex px-2 py-1 rounded-full bg-[#B6E4A3] font-semibold">
                      {item.data.categoria || "Categoría"}
                    </span>
                    <span className="text-xs">
                      {item.data.estado || "Activo"}
                    </span>
                  </div>

                  <h2 className="mt-1 text-sm md:text-base font-semibold">
                    {item.data.titulo}
                  </h2>

                  <div className="mt-2 space-y-1 text-[0.7rem] md:text-xs">
                    {item.data.usuario && (
                      <p className="flex items-center gap-1">
                        <span>👤</span> {item.data.usuario}
                      </p>
                    )}
                    {item.data.ubicacion && (
                      <p className="flex items-center gap-1">
                        <span>📍</span> {item.data.ubicacion}
                      </p>
                    )}
                    <p className="flex items-center gap-1 text-gray-700">
                      <span>📦</span> {item.data.descripcion}
                    </p>
                  </div>

                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <p className="font-semibold text-lg">
                        {item.data.valor_creditos}
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
                        onClick={() => handleIntercambiar(item.data)}
                        className="mt-1 px-3 py-1 rounded-lg bg-[#0b7a35] hover:bg-[#0cb652] text-[0.7rem] text-white"
                      >
                        Intercambiar
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ) : (
              <FilaPublicidad
                key={item.idFila || `ads-${index}`}
                anuncios={item.data}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}

// FILA PUBLICIDAD – una publicidad por fila, slide a la izquierda + estilo verde Digital Barter
function FilaPublicidad({ anuncios }) {
  const videoRefs = useRef({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [videoActivoId, setVideoActivoId] = useState(null);

  // Cambio automático cada 3.5s
  useEffect(() => {
    if (!anuncios || anuncios.length === 0 || !autoPlay) return;

    const intervalo = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % anuncios.length);
    }, 3500);

    return () => clearInterval(intervalo);
  }, [anuncios, autoPlay]);

  // Cuando cambia de publicidad, mutea todo y resetea indicador
  useEffect(() => {
    Object.values(videoRefs.current).forEach((vid) => {
      if (!vid) return;
      vid.muted = true;
    });
    setVideoActivoId(null);
  }, [activeIndex]);

  // Click en video: pausa autoplay y activa audio solo en esa publicidad
  function handleClickVideo(idPublicidad) {
    setAutoPlay(false);
    setVideoActivoId(idPublicidad);

    Object.entries(videoRefs.current).forEach(([key, vid]) => {
      if (!vid) return;
      const esActual = String(key) === String(idPublicidad);

      if (esActual) {
        vid.muted = false;
        vid.play().catch(() => {});
      } else {
        vid.muted = true;
      }
    });
  }

  if (!anuncios || anuncios.length === 0) return null;

  return (
    <div className="md:col-span-3 col-span-1 mt-10 mb-14">
      {/* CONTENEDOR PRINCIPAL VERDE */}
      <div className="relative rounded-[32px] p-[2px]
        bg-gradient-to-r from-emerald-600/80 via-green-600/70 to-lime-500/70 
        shadow-[0_0_60px_rgba(0,0,0,0.7)]">

        {/* Halos verdes */}
        <div className="pointer-events-none absolute -left-20 top-0 h-48 w-48 rounded-full bg-emerald-500/30 blur-3xl" />
        <div className="pointer-events-none absolute right-10 -bottom-6 h-44 w-44 rounded-full bg-green-400/25 blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 -top-10 h-32 w-32 -translate-x-1/2 rounded-full bg-lime-300/20 blur-3xl" />

        {/* Panel interno forest */}
        <div className="relative rounded-[30px] bg-[#051c15]/95 overflow-hidden">
          {/* SLIDER: todas las publicidades en fila, se desplaza a la izquierda */}
          <div className="relative w-full overflow-hidden">
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{
                transform: `translateX(-${activeIndex * 100}%)`,
              }}
            >
              {anuncios.map((ad) => {
                const videoSrc = ad.video_url || ad.video || ad.url_video;
                const activo = videoActivoId === ad.id_publicidad;

                return (
                  <article
                    key={ad.id_publicidad}
                    className="w-full flex-shrink-0 min-h-[260px] md:min-h-[360px]
                      flex flex-col md:flex-row bg-[#051c15] text-white"
                  >
                    {/* VIDEO GRANDE */}
                    <div className="relative w-full md:w-2/3 h-[220px] md:h-[360px] overflow-hidden">
                      {videoSrc && (
                        <video
                          ref={(el) => {
                            if (el) {
                              videoRefs.current[ad.id_publicidad] = el;
                            }
                          }}
                          src={videoSrc}
                          className="w-full h-full object-cover"
                          autoPlay
                          muted
                          loop
                          playsInline
                          onClick={() => handleClickVideo(ad.id_publicidad)}
                          style={{ cursor: "pointer" }}
                        />
                      )}

                      {/* overlay profundidad */}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t 
                        from-black/80 via-black/20 to-transparent" />

                      {/* borde interno suave */}
                      <div className="pointer-events-none absolute inset-2 rounded-2xl border border-emerald-300/15" />

                      {/* ETIQUETA PUBLICIDAD con el mismo estilo de Publicidad.jsx */}
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-emerald-400 via-lime-300 to-emerald-500 text-xs font-extrabold text-emerald-900 shadow-[0_0_12px_rgba(34,197,94,0.6)] animate-pulse">
              PUBLICIDAD
            </div>
                        {activo && (
                          <span className="flex items-center gap-1 text-[0.7rem] text-emerald-300">
                            <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                            Sonando
                          </span>
                        )}
                      </div>

                      {/* estado */}
                      <div className="absolute top-3 right-3 text-[0.65rem] text-emerald-200/80">
                        {ad.estado}
                      </div>

                      {/* halo verde bajo el video */}
                      <div className="pointer-events-none absolute -bottom-12 left-1/2 -translate-x-1/2 
                        w-40 h-14 bg-emerald-400/35 blur-3xl" />
                    </div>

                    {/* PANEL DE TEXTO */}
                    <div className="w-full md:w-1/3 px-4 py-4 flex flex-col">
                      <h3 className="text-lg font-semibold mb-2 line-clamp-2 text-emerald-300">
                        {ad.titulo}
                      </h3>

                      {ad.descripcion && (
                        <p className="text-sm text-emerald-100/70 line-clamp-5">
                          {ad.descripcion}
                        </p>
                      )}

                      <div className="mt-auto pt-4 flex flex-col gap-2 text-xs text-emerald-100/70">
                        <div className="space-y-1">
                          {ad.usuario && (
                            <p className="flex items-center gap-1">
                              <span className="text-[0.8rem]">👤</span>{" "}
                              {ad.usuario}
                            </p>
                          )}
                          {ad.costo_creditos != null && (
                            <p className="flex items-center gap-1">
                              <span className="text-[0.8rem]">💰</span>{" "}
                              {ad.costo_creditos} créditos
                            </p>
                          )}
                        </div>

                        {ad.url_destino && (
                          <div className="mt-2">
                            <a
                              href={ad.url_destino}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[0.8rem] font-semibold text-emerald-300 hover:text-emerald-200 hover:underline"
                            >
                              Visitar
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {/* indicadores (puntos verdes) */}
          {anuncios.length > 1 && (
            <div className="mt-3 mb-2 flex justify-center gap-1">
              {anuncios.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setActiveIndex(i);
                    setAutoPlay(false);
                  }}
                  className={[
                    "h-1.5 rounded-full transition-all duration-300",
                    i === activeIndex
                      ? "w-4 bg-emerald-400"
                      : "w-2 bg-emerald-700",
                  ].join(" ")}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
