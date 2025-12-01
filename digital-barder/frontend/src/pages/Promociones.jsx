// digital-barder/frontend/src/pages/Promociones.jsx
import { useEffect, useState } from "react";
import {
  getPromociones,
  crearPromocion,
  cambiarEstadoPromocion,
  vincularPublicacionPromocion,
} from "../services/api";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Tag,
  Percent,
  Gift,
  Link2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import hoja from "../assets/hoja.png";

export default function Promociones() {
  const navigate = useNavigate();

  const [promociones, setPromociones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mensajeOk, setMensajeOk] = useState("");

  // formulario nueva promo
  const [idTipoPromo, setIdTipoPromo] = useState("");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [creditos, setCreditos] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  // vincular publicación
  const [promoSeleccionada, setPromoSeleccionada] = useState(null);
  const [idPublicacionVincular, setIdPublicacionVincular] = useState("");

  useEffect(() => {
    cargarPromociones();
  }, []);

  async function cargarPromociones() {
    try {
      setLoading(true);
      setError("");
      const data = await getPromociones();
      setPromociones(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudieron cargar las promociones.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCrearPromocion(e) {
    e.preventDefault();
    setError("");
    setMensajeOk("");

    const id_tipo_promocion = Number(idTipoPromo || 0);
    const creditos_otorgados = Number(creditos || 0);

    if (!id_tipo_promocion || !nombre.trim() || !fechaInicio || !fechaFin) {
      setError(
        "id_tipo_promocion, nombre, fecha de inicio y fecha fin son obligatorios."
      );
      return;
    }

    try {
      await crearPromocion({
        id_tipo_promocion,
        nombre,
        descripcion,
        creditos_otorgados,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
      });

      setMensajeOk("Promoción creada correctamente.");
      // limpiar
      setIdTipoPromo("");
      setNombre("");
      setDescripcion("");
      setCreditos("");
      setFechaInicio("");
      setFechaFin("");

      await cargarPromociones();
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Ocurrió un error al crear la promoción."
      );
    }
  }

  async function handleToggleEstado(promo) {
    const nuevoEstado = promo.estado === "ACTIVA" ? "INACTIVA" : "ACTIVA";

    const ok = window.confirm(
      `¿Deseas cambiar el estado de la promoción "${promo.nombre}" a ${nuevoEstado}?`
    );
    if (!ok) return;

    try {
      setError("");
      setMensajeOk("");
      await cambiarEstadoPromocion(promo.id_promocion, nuevoEstado);
      setMensajeOk("Estado actualizado correctamente.");
      await cargarPromociones();
    } catch (err) {
      console.error(err);
      setError(
        err.message || "No se pudo actualizar el estado de la promoción."
      );
    }
  }

  async function handleVincularPublicacion(e) {
    e.preventDefault();
    if (!promoSeleccionada || !idPublicacionVincular.trim()) return;

    try {
      setError("");
      setMensajeOk("");
      await vincularPublicacionPromocion(
        promoSeleccionada.id_promocion,
        Number(idPublicacionVincular)
      );
      setMensajeOk("Publicación vinculada a la promoción.");
      setIdPublicacionVincular("");
    } catch (err) {
      console.error(err);
      setError(
        err.message || "No se pudo vincular la publicación a la promoción."
      );
    }
  }

  return (
    <div className="min-h-screen bg-[#082b1f] text-white p-6 md:p-10">
      {/* HEADER */}
      <header className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full bg-black/30 px-3 py-1 text-sm hover:bg-black/40"
          >
            <ArrowLeft size={16} />
            Volver
          </button>

          <div className="flex items-center gap-2 rounded-2xl bg-emerald-900/70 px-3 py-2 text-sm">
            <Tag size={18} className="text-emerald-300" />
            <span className="font-semibold">Gestión de promociones</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-emerald-100/80">
            Total:{" "}
            <span className="font-semibold text-emerald-300">
              {promociones.length}
            </span>
          </span>
          <img src={hoja} alt="logo" className="w-9 h-9 drop-shadow-md" />
        </div>
      </header>

      {/* MENSAJES */}
      {error && (
        <div className="mb-4 rounded-md border border-red-400 bg-red-900/40 px-4 py-2 text-sm text-red-100">
          {error}
        </div>
      )}

      {mensajeOk && (
        <div className="mb-4 rounded-md border border-emerald-400 bg-emerald-900/40 px-4 py-2 text-sm text-emerald-100">
          {mensajeOk}
        </div>
      )}

      {/* CONTENIDO: LISTADO + FORMULARIO */}
      <div className="grid gap-6 lg:grid-cols-[2fr,1.5fr]">

        {/* LISTADO DE PROMOCIONES */}
        <section className="bg-[#0f3f2d] border border-emerald-700 rounded-2xl p-4 md:p-5 shadow-md">
          <h2 className="text-lg font-semibold text-emerald-200 flex items-center gap-2 mb-3">
            <Percent size={18} className="text-emerald-300" />
            Promociones configuradas
          </h2>

          {loading ? (
            <p className="text-emerald-100/80 text-sm">Cargando promociones...</p>
          ) : promociones.length === 0 ? (
            <p className="text-emerald-100/80 text-sm">
              No hay promociones registradas.
            </p>
          ) : (
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {promociones.map((promo) => (
                <article
                  key={promo.id_promocion}
                  className={`rounded-xl border p-3 text-sm flex flex-col gap-2 cursor-pointer ${
                    promoSeleccionada?.id_promocion === promo.id_promocion
                      ? "border-emerald-400 bg-emerald-900/50"
                      : "border-emerald-700/70 bg-emerald-900/30 hover:border-emerald-500/80"
                  }`}
                  onClick={() => setPromoSeleccionada(promo)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-emerald-300/80">
                        ID #{promo.id_promocion}
                      </p>
                      <h3 className="font-semibold text-emerald-100">
                        {promo.nombre}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleEstado(promo);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-emerald-500/70 text-xs"
                    >
                      {promo.estado === "ACTIVA" ? (
                        <>
                          <ToggleRight size={16} className="text-emerald-300" />
                          <span>Activa</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft size={16} className="text-emerald-300" />
                          <span>Inactiva</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-emerald-100/80 text-xs">
                    {promo.descripcion || "Sin descripción."}
                  </p>

                  <div className="flex flex-wrap gap-3 text-[11px] text-emerald-200/90">
                    {typeof promo.creditos_otorgados === "number" && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-800/60 border border-emerald-600/80">
                        +{promo.creditos_otorgados} cr.
                      </span>
                    )}

                    {promo.fecha_inicio && (
                      <span>
                        Inicio:{" "}
                        {new Date(promo.fecha_inicio).toLocaleDateString()}
                      </span>
                    )}
                    {promo.fecha_fin && (
                      <span>
                        Fin:{" "}
                        {new Date(promo.fecha_fin).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* FORMULARIO NUEVA PROMO + VINCULAR PUBLICACIÓN */}
        <section className="space-y-4">
          {/* NUEVA PROMO */}
          <div className="bg-[#0f3f2d] border border-emerald-700 rounded-2xl p-4 md:p-5 shadow-md">
            <h2 className="text-lg font-semibold text-emerald-200 flex items-center gap-2 mb-3">
              <Gift size={18} className="text-emerald-300" />
              Crear nueva promoción
            </h2>

            <form onSubmit={handleCrearPromocion} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs mb-1">
                  ID tipo de promoción (id_tipo_promocion) *
                </label>
                <input
                  type="number"
                  value={idTipoPromo}
                  onChange={(e) => setIdTipoPromo(e.target.value)}
                  className="w-full rounded-lg border border-emerald-700 bg-emerald-950/80 px-3 py-2 text-sm outline-none focus:ring focus:ring-emerald-500/60"
                  placeholder="Ej. 1 (descuento), 2 (bonus créditos)..."
                />
              </div>

              <div>
                <label className="block text-xs mb-1">Nombre *</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full rounded-lg border border-emerald-700 bg-emerald-950/80 px-3 py-2 text-sm outline-none focus:ring focus:ring-emerald-500/60"
                  placeholder="Ej. Promo bienvenida, 2x1 en créditos..."
                />
              </div>

              <div>
                <label className="block text-xs mb-1">Descripción</label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-emerald-700 bg-emerald-950/80 px-3 py-2 text-sm outline-none focus:ring focus:ring-emerald-500/60"
                  placeholder="Explica las condiciones de la promoción..."
                />
              </div>

              <div>
                <label className="block text-xs mb-1">
                  Créditos otorgados (opcional)
                </label>
                <input
                  type="number"
                  value={creditos}
                  onChange={(e) => setCreditos(e.target.value)}
                  className="w-full rounded-lg border border-emerald-700 bg-emerald-950/80 px-3 py-2 text-sm outline-none focus:ring focus:ring-emerald-500/60"
                  placeholder="Ej. 10"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1">Fecha inicio *</label>
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="w-full rounded-lg border border-emerald-700 bg-emerald-950/80 px-3 py-2 text-sm outline-none focus:ring focus:ring-emerald-500/60"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1">Fecha fin *</label>
                  <input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="w-full rounded-lg border border-emerald-700 bg-emerald-950/80 px-3 py-2 text-sm outline-none focus:ring focus:ring-emerald-500/60"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-sm font-semibold text-emerald-950"
                >
                  Guardar promoción
                </button>
              </div>
            </form>
          </div>

          {/* VINCULAR PUBLICACIÓN */}
          <div className="bg-[#0f3f2d] border border-emerald-700 rounded-2xl p-4 md:p-5 shadow-md">
            <h2 className="text-sm font-semibold text-emerald-200 flex items-center gap-2 mb-3">
              <Link2 size={16} className="text-emerald-300" />
              Vincular publicación a promoción
            </h2>

            {promoSeleccionada ? (
              <>
                <p className="text-xs text-emerald-100/90 mb-2">
                  Promoción seleccionada:{" "}
                  <span className="font-semibold">{promoSeleccionada.nombre}</span>{" "}
                  (ID #{promoSeleccionada.id_promocion})
                </p>

                <form
                  onSubmit={handleVincularPublicacion}
                  className="flex flex-col sm:flex-row gap-2 text-sm"
                >
                  <input
                    type="number"
                    value={idPublicacionVincular}
                    onChange={(e) => setIdPublicacionVincular(e.target.value)}
                    className="flex-1 rounded-lg border border-emerald-700 bg-emerald-950/80 px-3 py-2 text-sm outline-none focus:ring focus:ring-emerald-500/60"
                    placeholder="ID de publicación"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-sm font-semibold text-emerald-950"
                  >
                    Vincular
                  </button>
                </form>
              </>
            ) : (
              <p className="text-xs text-emerald-100/80">
                Primero selecciona una promoción del listado para poder
                vincularle publicaciones.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
