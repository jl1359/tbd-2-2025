import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import hoja from "../assets/hoja.png";

const PLACEHOLDER_FOTO =
  "https://via.placeholder.com/120?text=Foto";

export default function PerfilEditar() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [foto, setFoto] = useState("");      // url_perfil actual
  const [preview, setPreview] = useState(""); // para mostrar mientras editas

  const [error, setError] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    cargarPerfil();
  }, []);

  async function cargarPerfil() {
    try {
      setError("");
      const u = await api("/auth/me");
      setNombre(u.nombre || "");
      setApellido(u.apellido || "");
      setTelefono(u.telefono || "");
      setFoto(u.url_perfil || "");
      setPreview(u.url_perfil || "");
    } catch (err) {
      console.error("Error cargando perfil:", err);
      setError("No se pudo cargar el perfil.");
    }
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      // aquí podrías subir a Cloudinary; por ahora usamos la dataURL solo como vista previa
      setPreview(reader.result.toString());
      // Si tu flujo real es URL remota, aquí deberías llamar a un upload
      // y luego setFoto(urlFinalSubida).
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      setOkMsg("");

      const payload = {
        nombre,
        apellido,
        telefono,
        // si ya tienes una URL real de la foto, guárdala aquí
        url_perfil: foto || "", 
      };

      // 👇 IMPORTANTE: body es un OBJETO, no JSON.stringify
      await api("/auth/me", {
        method: "PUT",
        body: payload,
      });

      setOkMsg("Perfil actualizado correctamente.");
      // recargar datos del perfil principal después de guardar
      setTimeout(() => navigate("/perfil"), 800);
    } catch (err) {
      console.error("Error actualizando perfil:", err);
      setError(err.message || "No se pudo actualizar el perfil.");
    } finally {
      setLoading(false);
    }
  }

  const fotoMostrar = preview || foto || PLACEHOLDER_FOTO;

  return (
    <div className="min-h-screen bg-[#082b1f] text-white p-6 md:p-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <img src={hoja} className="w-10 h-10 drop-shadow-lg" alt="logo" />
        <h1 className="text-3xl font-bold text-emerald-400">
          Editar Perfil
        </h1>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="mb-4 rounded-md border border-red-400 bg-red-900/40 px-4 py-2 text-sm text-red-100">
          {error}
        </div>
      )}
      {okMsg && (
        <div className="mb-4 rounded-md border border-emerald-400 bg-emerald-900/40 px-4 py-2 text-sm text-emerald-100">
          {okMsg}
        </div>
      )}

      <div className="bg-[#0e4330] border border-emerald-500 rounded-xl p-6 md:p-8 shadow-xl">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row gap-8"
        >
          {/* Columna foto */}
          <div className="flex flex-col items-center gap-4">
            <img
              src={fotoMostrar}
              alt="Foto de perfil"
              className="w-32 h-32 rounded-full object-cover border-4 border-emerald-500 shadow-lg"
            />
            <label className="cursor-pointer bg-emerald-500 hover:bg-emerald-600 text-emerald-950 px-4 py-2 rounded-lg text-sm font-semibold">
              Cambiar foto
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* Columna campos */}
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-sm mb-1 text-emerald-200">
                Nombre
              </label>
              <input
                className="w-full rounded-lg bg-[#062117] border border-emerald-600 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-emerald-200">
                Apellido
              </label>
              <input
                className="w-full rounded-lg bg-[#062117] border border-emerald-600 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-emerald-200">
                Teléfono
              </label>
              <input
                className="w-full rounded-lg bg-[#062117] border border-emerald-600 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </div>

            {/* Si quieres editar directamente la URL de la foto */}
            <div>
              <label className="block text-sm mb-1 text-emerald-200">
                URL de foto de perfil (opcional)
              </label>
              <input
                className="w-full rounded-lg bg-[#062117] border border-emerald-600 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
                value={foto}
                onChange={(e) => {
                  setFoto(e.target.value);
                  setPreview(e.target.value);
                }}
                placeholder="https://tuservidor.com/imagen.jpg"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate("/perfil")}
                className="px-4 py-2 rounded-lg border border-emerald-500 text-sm hover:bg-[#063024]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-emerald-950 font-semibold text-sm disabled:opacity-50"
              >
                {loading ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
