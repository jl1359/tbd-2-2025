// frontend/src/pages/Register.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/api";
import hojaLogo from "../assets/hoja.png";

const SLIDES = [
  {
    id: 1,
    title: "Crea una cuenta en Digital Barter",
    text: "Empieza a ganar Green Credits desde hoy.",
    image:
      "https://images.pexels.com/photos/3184328/pexels-photo-3184328.jpeg?auto=compress&cs=tinysrgb&w=1600",
  },
  {
    id: 2,
    title: "Comparte y reutiliza",
    text: "Publica productos y servicios que ya no usas.",
    image:
      "https://images.pexels.com/photos/3738088/pexels-photo-3738088.jpeg?auto=compress&cs=tinysrgb&w=1600",
  },
  {
    id: 3,
    title: "Impacto ambiental positivo",
    text: "Reduce CO₂, agua y energía con cada intercambio.",
    image:
      "https://images.pexels.com/photos/286763/pexels-photo-286763.jpeg?auto=compress&cs=tinysrgb&w=1600",
  },
];

export default function Register() {
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const [dia, setDia] = useState("1");
  const [mes, setMes] = useState("ene.");
  const [anio, setAnio] = useState("2000");
  const [genero, setGenero] = useState("Hombre");

  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const id = setInterval(
      () => setSlideIndex((prev) => (prev + 1) % SLIDES.length),
      5000
    );
    return () => clearInterval(id);
  }, []);

  const currentSlide = SLIDES[slideIndex];

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setOk("");

    if (!nombre || !correo || !password || !password2) {
      setError("Nombre, correo y contraseñas son obligatorios.");
      return;
    }

    if (password !== password2) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setLoading(true);
      await register({
        nombre,
        apellido: apellidos,
        correo,
        password,
        telefono: telefono || undefined,
      });

      setOk("Cuenta creada correctamente. Ahora puedes iniciar sesión.");
      // Opcional: enviarte de una vez al login
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudo registrar el usuario.");
    } finally {
      setLoading(false);
    }
  }

  const dias = Array.from({ length: 31 }, (_, i) => String(i + 1));
  const anios = Array.from({ length: 80 }, (_, i) =>
    String(2025 - i)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#012b20] via-[#013726] to-[#011711] text-white flex flex-col">
      {/* NAVBAR SUPERIOR */}
      <header className="flex items-center justify-between px-10 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10">
            <img
              src={hojaLogo}
              alt="Logo Digital Barter"
              className="w-7 h-7 object-contain"
            />
          </div>
          <div>
            <h1 className="text-2xl font-black leading-tight tracking-tight">
              Digital Barter
            </h1>
            <p className="text-sm text-green-300 font-semibold flex items-center gap-1">
              green credits
              <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
            </p>
          </div>
        </div>

        <Link
          to="/login"
          className="px-5 py-2 rounded-full bg-white text-green-900 font-semibold text-sm hover:bg-gray-100 transition"
        >
          Iniciar sesión
        </Link>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-10 px-6 lg:px-16 pb-10">
        {/* PANEL IZQUIERDO: CARRUSEL */}
        <section className="w-full max-w-md bg-black/20 rounded-3xl overflow-hidden shadow-2xl">
          <div className="relative h-80">
            <img
              src={currentSlide.image}
              alt={currentSlide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <h2 className="text-xl font-bold mb-2">{currentSlide.title}</h2>
              <p className="text-sm text-gray-200 mb-4">{currentSlide.text}</p>
              <div className="flex gap-2">
                {SLIDES.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => setSlideIndex(idx)}
                    className={`w-2.5 h-2.5 rounded-full ${
                      idx === slideIndex ? "bg-white" : "bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PANEL DERECHO: FORM REGISTRO */}
        <section className="w-full max-w-md bg-white/5 backdrop-blur-md rounded-3xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold mb-2 text-center">Crea una Cuenta</h2>

          {error && (
            <div className="mb-4 bg-red-500/20 border border-red-400 text-sm px-3 py-2 rounded-lg">
              {error}
            </div>
          )}
          {ok && (
            <div className="mb-4 bg-green-500/20 border border-green-400 text-sm px-3 py-2 rounded-lg">
              {ok}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Nombre y apellidos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">Nombre</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="Nombre"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Apellidos</label>
                <input
                  type="text"
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="Apellidos"
                />
              </div>
            </div>

            {/* Fecha de nacimiento */}
            <div>
              <p className="text-xs mb-1">Fecha de nacimiento</p>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={dia}
                  onChange={(e) => setDia(e.target.value)}
                  className="rounded-lg px-2 py-2 bg-white/10 border border-white/20 text-sm"
                >
                  {dias.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                <select
                  value={mes}
                  onChange={(e) => setMes(e.target.value)}
                  className="rounded-lg px-2 py-2 bg-white/10 border border-white/20 text-sm"
                >
                  <option>ene.</option>
                  <option>feb.</option>
                  <option>mar.</option>
                  <option>abr.</option>
                  <option>may.</option>
                  <option>jun.</option>
                  <option>jul.</option>
                  <option>ago.</option>
                  <option>sept.</option>
                  <option>oct.</option>
                  <option>nov.</option>
                  <option>dic.</option>
                </select>

                <select
                  value={anio}
                  onChange={(e) => setAnio(e.target.value)}
                  className="rounded-lg px-2 py-2 bg-white/10 border border-white/20 text-sm"
                >
                  {anios.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Género */}
            <div>
              <p className="text-xs mb-1">Género</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setGenero("Hombre")}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-full border text-sm ${
                    genero === "Hombre"
                      ? "bg-green-500 border-green-400"
                      : "bg-white/10 border-white/20"
                  }`}
                >
                  <span
                    className={`w-3 h-3 rounded-full border ${
                      genero === "Hombre"
                        ? "bg-white border-white"
                        : "bg-transparent border-white"
                    }`}
                  />
                  Hombre
                </button>
                <button
                  type="button"
                  onClick={() => setGenero("Mujer")}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-full border text-sm ${
                    genero === "Mujer"
                      ? "bg-green-500 border-green-400"
                      : "bg-white/10 border-white/20"
                  }`}
                >
                  <span
                    className={`w-3 h-3 rounded-full border ${
                      genero === "Mujer"
                        ? "bg-white border-white"
                        : "bg-transparent border-white"
                    }`}
                  />
                  Mujer
                </button>
              </div>
            </div>

            {/* Contacto */}
            <div>
              <label className="block text-sm mb-1">
                Número de móvil o correo electrónico
              </label>
              <input
                type="text"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Teléfono (opcional)</label>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="+591 70000000"
              />
            </div>

            {/* Contraseñas */}
            <div>
              <label className="block text-sm mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Confirmar contraseña</label>
              <input
                type="password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-[#0a8f44] hover:bg-[#0cb652] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-full text-sm transition"
            >
              {loading ? "Registrando..." : "Registrar"}
            </button>
          </form>
        </section>
      </main>

      <footer className="text-xs text-gray-300 text-center pb-4">
        ¡Un poco más sobre nosotros!
      </footer>
    </div>
  );
}
