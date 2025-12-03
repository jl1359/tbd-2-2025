import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import hoja from "../assets/hoja.png";

export default function PublicacionNueva() {
  const [tipo, setTipo] = useState("PRODUCTO"); // PRODUCTO | SERVICIO
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [idCategoria, setIdCategoria] = useState("");
  const [costoCreditos, setCostoCreditos] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [horario, setHorario] = useState("A convenir");

  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const [mensajeOk, setMensajeOk] = useState("");

  // CATEGORÍAS
  const [categorias, setCategorias] = useState([]);
  const [cargandoCategorias, setCargandoCategorias] = useState(false);

  const navigate = useNavigate();

  // ⬇️ CARGAR CATEGORÍAS ORDENADAS
  useEffect(() => {
    async function cargarCategorias() {
      try {
        setCargandoCategorias(true);
        const res = await api("/catalogos/categorias");

        const lista = Array.isArray(res)
          ? res
          : Array.isArray(res.data)
          ? res.data
          : [];

        const ordenadas = [...lista].sort(
          (a, b) => Number(a.id_categoria) - Number(b.id_categoria)
        );

        setCategorias(ordenadas);
      } catch (err) {
        console.error("Error cargando categorías", err);
        setCategorias([]);
      } finally {
        setCargandoCategorias(false);
      }
    }

    cargarCategorias();
  }, []);

  // ENVIAR FORM
  async function manejarSubmit(e) {
    e.preventDefault();
    setMensajeError("");
    setMensajeOk("");

    if (!titulo.trim() || !descripcion.trim() || !idCategoria || !costoCreditos) {
      setMensajeError("Título, descripción, categoría y créditos son obligatorios.");
      return;
    }

    try {
      setLoading(true);

      // 1) Subir archivo si existe (PRODUCTO + SERVICIO)
      let imagenURL = null;
      if (imagenFile) {
        const formData = new FormData();
        formData.append("archivo", imagenFile);

        const resUpload = await api("/uploads", {
          method: "POST",
          body: formData,
        });

        // ⬇️⬇️ CAMBIO IMPORTANTE: leer la URL real del backend
        imagenURL =
          resUpload?.data?.url ||
          resUpload?.data?.imagen_url ||
          resUpload?.url ||
          resUpload?.imagen_url ||
          null;
      }

      // 2) Body base para ambos tipos
      const base = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        id_categoria: Number(idCategoria),
        valor_creditos: Number(costoCreditos),
        imagen_url: imagenURL,
      };

      let endpoint = "";
      let body = {};

      if (tipo === "PRODUCTO") {
        endpoint = "/publicaciones/producto";

        body = {
          ...base,
          producto: {
            nombre: titulo.trim(),
            descripcion: descripcion.trim(),
            precio: null,
            peso: null,
          },
          cantidad: Number(cantidad || 1),
          id_um: 1,
        };
      } else {
        endpoint = "/publicaciones/servicio";

        body = {
          ...base,
          servicio: {
            nombre: titulo.trim(),
            descripcion: descripcion.trim(),
            precio: null,
            duracion_min: null,
          },
          horario: horario || "A convenir",
        };
      }

      await api(endpoint, {
        method: "POST",
        body,
      });

      setMensajeOk("Publicación creada correctamente");

      // limpiar
      setTitulo("");
      setDescripcion("");
      setIdCategoria("");
      setCostoCreditos("");
      setCantidad("");
      setHorario("A convenir");
      setImagenFile(null);
      setImagenPreview(null);

      setTimeout(() => {
        navigate("/publicaciones/mias");
      }, 1200);
    } catch (err) {
      console.error(err);
      setMensajeError(
        err.message || "Ocurrió un error al crear la publicación."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#082b1f] text-white p-6 md:p-10">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 mb-8">
        <div className="flex items-center gap-3">
          <img src={hoja} alt="logo" className="w-10 h-10 drop-shadow-lg" />
          <div>
            <h1 className="text-3xl font-bold text-emerald-400">
              Nueva publicación
            </h1>
            <p className="text-sm text-emerald-100/80">
              Publica un producto o servicio para intercambiar con créditos verdes.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-lg border border-emerald-500 text-sm hover:bg-emerald-500/10"
        >
          Volver
        </button>
      </div>

      {/* MENSAJES */}
      {mensajeError && (
        <div className="mb-4 rounded-md border border-red-400 bg-red-900/40 px-4 py-2 text-sm text-red-100">
          {mensajeError}
        </div>
      )}

      {mensajeOk && (
        <div className="mb-4 rounded-md border border-emerald-400 bg-emerald-900/40 px-4 py-2 text-sm text-emerald-100">
          {mensajeOk}
        </div>
      )}

      {/* FORM */}
      <form
        onSubmit={manejarSubmit}
        className="bg-[#0f3f2d] border border-emerald-700 rounded-xl p-6 md:p-8 max-w-3xl mx-auto space-y-6"
      >
        {/* Tipo */}
        <div>
          <span className="block text-sm font-semibold text-emerald-200 mb-2">
            Tipo de publicación
          </span>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setTipo("PRODUCTO")}
              className={`flex-1 py-2 rounded-lg border text-sm font-semibold
                ${
                  tipo === "PRODUCTO"
                    ? "bg-emerald-500 text-black border-emerald-400"
                    : "bg-[#0e4330] border-emerald-700 hover:border-emerald-500"
                }`}
            >
              Producto
            </button>
            <button
              type="button"
              onClick={() => setTipo("SERVICIO")}
              className={`flex-1 py-2 rounded-lg border text-sm font-semibold
                ${
                  tipo === "SERVICIO"
                    ? "bg-emerald-500 text-black border-emerald-400"
                    : "bg-[#0e4330] border-emerald-700 hover:border-emerald-500"
                }`}
            >
              Servicio
            </button>
          </div>
        </div>

        {/* Título */}
        <div>
          <label className="block text-sm text-emerald-200 mb-1">
            Título *
          </label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full bg-[#0e4330] border border-emerald-600 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="Ej. Sudadera, Clases de inglés..."
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm text-emerald-200 mb-1">
            Descripción *
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={4}
            className="w-full bg-[#0e4330] border border-emerald-600 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400 resize-y"
            placeholder="Describe brevemente el producto o servicio..."
          />
        </div>

        {/* Categoría + Créditos */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Categoría */}
          <div>
            <label className="block text-sm text-emerald-200 mb-1">
              Categoría *
            </label>
            <select
              value={idCategoria}
              onChange={(e) => setIdCategoria(e.target.value)}
              className="w-full bg-[#0e4330] border border-emerald-600 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <option value="">
                {cargandoCategorias
                  ? "Cargando categorías..."
                  : "Selecciona una categoría"}
              </option>

              {categorias.map((cat) => (
                <option key={cat.id_categoria} value={cat.id_categoria}>
                  {cat.id_categoria} - {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Créditos */}
          <div>
            <label className="block text-sm text-emerald-200 mb-1">
              Costo en créditos *
            </label>
            <input
              type="number"
              min="1"
              value={costoCreditos}
              onChange={(e) => setCostoCreditos(e.target.value)}
              className="w-full bg-[#0e4330] border border-emerald-600 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="Ej. 100"
            />
          </div>
        </div>

        {/* Producto o Servicio */}
        {tipo === "PRODUCTO" ? (
          <div>
            <label className="block text-sm text-emerald-200 mb-1">
              Cantidad disponible
            </label>
            <input
              type="number"
              min="1"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              className="w-full bg-[#0e4330] border border-emerald-600 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="Por defecto 1"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm text-emerald-200 mb-1">
              Horario (para el servicio)
            </label>
            <input
              type="text"
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
              className="w-full bg-[#0e4330] border border-emerald-600 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="Ej. Fines de semana por la tarde"
            />
          </div>
        )}

        {/* ARCHIVO (PRODUCTO + SERVICIO) */}
        <div>
          <label className="block text-sm text-emerald-200 mb-1">
            Archivo (imagen, PDF, etc. — opcional)
          </label>
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              setImagenFile(file || null);

              if (file && file.type.startsWith("image/")) {
                setImagenPreview(URL.createObjectURL(file));
              } else {
                setImagenPreview(null);
              }
            }}
            className="block w-full text-sm text-emerald-100 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-500 file:px-3 file:py-1 file:text-sm file:font-semibold hover:file:bg-emerald-600"
          />

          {imagenPreview && (
            <img
              src={imagenPreview}
              alt="Previsualización"
              className="mt-3 w-40 h-32 object-cover rounded-lg border border-emerald-600"
            />
          )}
        </div>

        {/* BOTONES */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate("/publicaciones/mias")}
            className="px-4 py-2 rounded-lg border border-emerald-500 text-sm hover:bg-emerald-500/10"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-5 py-2 rounded-lg text-sm font-semibold
              ${
                loading
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-600"
              }`}
          >
            {loading ? "Guardando..." : "Publicar"}
          </button>
        </div>
      </form>
    </div>
  );
}
