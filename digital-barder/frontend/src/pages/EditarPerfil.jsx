import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import hoja from "../assets/hoja.png";

export default function EditarPerfil() {
  const [usuario, setUsuario] = useState(null);

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");

  const [fotoPreview, setFotoPreview] = useState(null);
  const [fotoArchivo, setFotoArchivo] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      const data = await api("/auth/me");  // ✅ ESTA ES LA RUTA CORRECTA
      setUsuario(data);

      setNombre(data.nombre || "");
      setCorreo(data.correo || "");
      setTelefono(data.telefono || "");
      setFotoPreview(data.foto || null);

    } catch (error) {
      console.error("Error al cargar perfil:", error);
    }
  }

  async function guardarCambios(e) {
    e.preventDefault();

    try {
      let fotoURL = fotoPreview;

      // Si se eligió una nueva foto, subirla
      if (fotoArchivo) {
        const formData = new FormData();
        formData.append("archivo", fotoArchivo);

        const uploadRes = await api("/uploads", {
          method: "POST",
          body: formData,
        });

        fotoURL = uploadRes.url;
      }

      // Actualizar datos del usuario
      await api("/auth/me", {
        method: "PUT",
        body: {
          nombre,
          correo,
          telefono,
          foto: fotoURL,
          password: password || undefined, // si está vacío no lo envía
        },
      });

      alert("Perfil actualizado correctamente");
      window.location.href = "/perfil";

    } catch (error) {
      console.error("Error guardando perfil:", error);
      alert("Hubo un error al actualizar el perfil");
    }
  }

  if (!usuario) {
    return (
      <div className="min-h-screen bg-[#082b1f] text-white flex items-center justify-center">
        Cargando perfil...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#082b1f] text-white p-6 md:p-10">

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-10">
        <img src={hoja} alt="logo" className="w-12 h-12 drop-shadow-lg" />
        <h1 className="text-3xl font-bold text-emerald-400">
          Editar Perfil
        </h1>
      </div>

      {/* FORMULARIO */}
      <form
        onSubmit={guardarCambios}
        className="bg-[#0e4330] p-8 rounded-xl border border-emerald-500 shadow-xl max-w-2xl mx-auto"
      >

        {/* FOTO */}
        <div className="flex flex-col items-center mb-8">
          <img
            src={fotoPreview || "https://via.placeholder.com/120"}
            className="w-32 h-32 rounded-full object-cover border-4 border-emerald-500 shadow-lg"
          />

          <label
            className="mt-4 cursor-pointer bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg font-semibold transition"
          >
            Cambiar foto
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                setFotoArchivo(e.target.files[0]);
                setFotoPreview(URL.createObjectURL(e.target.files[0]));
              }}
            />
          </label>
        </div>

        {/* NOMBRE */}
        <div className="mb-5">
          <label className="text-emerald-300 font-semibold">Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full mt-1 bg-[#0f3f2d] text-white px-4 py-2 rounded-lg 
                       border border-emerald-500 outline-none focus:ring-2 
                       focus:ring-emerald-400"
          />
        </div>

        {/* CORREO */}
        <div className="mb-5">
          <label className="text-emerald-300 font-semibold">Correo</label>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            className="w-full mt-1 bg-[#0f3f2d] text-white px-4 py-2 rounded-lg 
                       border border-emerald-500 outline-none focus:ring-2 
                       focus:ring-emerald-400"
          />
        </div>

        {/* TELEFONO */}
        <div className="mb-5">
          <label className="text-emerald-300 font-semibold">Teléfono</label>
          <input
            type="text"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="w-full mt-1 bg-[#0f3f2d] text-white px-4 py-2 rounded-lg 
                       border border-emerald-500 outline-none focus:ring-2 
                       focus:ring-emerald-400"
          />
        </div>

        {/* PASSWORD (opcional) */}
        <div className="mb-5">
          <label className="text-emerald-300 font-semibold">
            Nueva contraseña (opcional)
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Dejar vacío si no deseas cambiarla"
            className="w-full mt-1 bg-[#0f3f2d] text-white px-4 py-2 rounded-lg 
                       border border-emerald-500 outline-none focus:ring-2 
                       focus:ring-emerald-400"
          />
        </div>

        {/* BOTONES */}
        <div className="flex justify-between mt-8">
          <a
            href="/perfil"
            className="px-5 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 
                       transition font-semibold"
          >
            Cancelar
          </a>

          <button
            type="submit"
            className="px-6 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 
                       transition font-semibold"
          >
            Guardar Cambios
          </button>
        </div>

      </form>
    </div>
  );
}
