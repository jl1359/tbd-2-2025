import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import hoja from "../assets/hoja.png";

export default function PerfilUsuario() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarUsuario();
  }, [id]);

  async function cargarUsuario() {
    try {
      setError("");
      setCargando(true);
      // Usa tu módulo de usuarios del backend: GET /usuarios/:id
      const data = await api(`/usuarios/${id}`);
      setUsuario(data);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el perfil del usuario.");
    } finally {
      setCargando(false);
    }
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#082b1f] flex items-center justify-center text-white">
        Cargando perfil...
      </div>
    );
  }

  if (error || !usuario) {
    return (
      <div className="min-h-screen bg-[#082b1f] flex flex-col items-center justify-center text-white gap-4">
        <p>{error || "Usuario no encontrado."}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-semibold"
        >
          Volver
        </button>
      </div>
    );
  }

  const telefonoUsuario =
    usuario.telefono || usuario.celular || usuario.telefono_celular || "";

  return (
    <div className="min-h-screen bg-[#082b1f] text-white p-6 md:p-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <img src={hoja} className="w-12 h-12 drop-shadow-lg" />
        <div>
          <h1 className="text-3xl font-bold text-emerald-400">
            Perfil de usuario
          </h1>
          <p className="text-sm text-emerald-100/80">
            Publicador en el marketplace
          </p>
        </div>
      </div>

      {/* Tarjeta perfil público */}
      <div className="bg-[#0e4330] border border-emerald-500 rounded-xl p-6 md:p-8 shadow-xl mb-10">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Foto */}
          <div>
            <img
              src={usuario.foto || "https://via.placeholder.com/120"}
              className="w-28 h-28 rounded-full object-cover border-4 border-emerald-500 shadow-lg"
            />
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-emerald-300">
              {usuario.nombre}
            </h2>

            {usuario.alias && (
              <p className="text-sm opacity-90 mt-1">@{usuario.alias}</p>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-2 max-w-md">
              <div className="bg-[#0b3325] rounded-lg px-4 py-3 border border-emerald-600/70">
                <p className="text-[0.7rem] uppercase tracking-wide text-emerald-200/80 font-semibold">
                  Correo electrónico
                </p>
                <p className="text-sm mt-1 break-all">
                  {usuario.correo || "No visible"}
                </p>
              </div>

              <div className="bg-[#0b3325] rounded-lg px-4 py-3 border border-emerald-600/70">
                <p className="text-[0.7rem] uppercase tracking-wide text-emerald-200/80 font-semibold">
                  Teléfono
                </p>
                <p className="text-sm mt-1">
                  {telefonoUsuario || "No visible"}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate(-1)}
              className="mt-5 bg-emerald-500 hover:bg-emerald-600 px-5 py-2 rounded-lg font-semibold transition"
            >
              Volver al marketplace
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
