// frontend/src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/api";
import hojaLogo from "../assets/hoja.png";

const SLIDES = [
  {
    id: 1,
    title: "Crea una cuenta en Digital Barter",
    text: "Obtén 5 monedas Green Credits por tu primera sesión.",
    image:
      "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1600",
  },
  {
    id: 2,
    title: "Intercambia productos y servicios",
    text: "Ahorra dinero mientras ayudas al planeta.",
    image:
      "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1600",
  },
  {
    id: 3,
    title: "Gana Green Credits",
    text: "Recibe créditos verdes por cada intercambio sostenible.",
    image:
      "https://images.pexels.com/photos/8867432/pexels-photo-8867432.jpeg?auto=compress&cs=tinysrgb&w=1600",
  },
];

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [slideIndex, setSlideIndex] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const id = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!correo || !password) {
      setError("Debes ingresar correo y contraseña.");
      return;
    }

    try {
      setLoading(true);
      const data = await login({ correo, password });

      if (!data?.token) {
        setError("No se recibió el token de autenticación.");
        return;
      }

      // Después del login te llevo a tu flujo de reportes
      navigate("/home");
    } catch (err) {
      console.error(err);
      setError(err.message || "Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  }

  const currentSlide = SLIDES[slideIndex];

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
          to="/register"
          className="px-5 py-2 rounded-full bg-white text-green-900 font-semibold text-sm hover:bg-gray-100 transition"
        >
          Crear Cuenta
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

              {/* Puntos del carrusel */}
              <div className="flex gap-2">
                {SLIDES.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => setSlideIndex(idx)}
                    className={`w-2.5 h-2.5 rounded-full ${
                      idx === slideIndex ? "bg-white" : "bg-white/40"
                    }`}
                    aria-label={`Ir al slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PANEL DERECHO: FORM LOGIN */}
        <section className="w-full max-w-md bg-white/5 backdrop-blur-md rounded-3xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold mb-2 text-center">
            Iniciar sesión
          </h2>
          <p className="text-sm text-gray-200 mb-6 text-center">
            Ingresa para gestionar tus Green Credits.
          </p>

          {error && (
            <div className="mb-4 bg-red-500/20 border border-red-400 text-sm px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm mb-1">
                Correo electrónico o número de teléfono
              </label>
              <input
                type="text"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="tucorreo@email.com"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="••••••••"
              />
            </div>

            <div className="flex justify-end text-xs text-gray-300 mb-1">
              <button
                type="button"
                className="hover:underline"
                onClick={() => alert("En el futuro aquí irá el flujo de recuperar contraseña.")}
              >
                ¿Has olvidado tu contraseña?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-[#0a8f44] hover:bg-[#0cb652] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-full text-sm transition"
            >
              {loading ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>

          <p className="mt-6 text-xs text-center text-gray-200">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="font-semibold underline">
              Crear una cuenta
            </Link>
          </p>
        </section>
      </main>

      <footer className="text-xs text-gray-300 text-center pb-4">
        ¡Un poco más sobre nosotros!
      </footer>
    </div>
  );
}
