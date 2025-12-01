// frontend/src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/api";
import hojaLogo from "../assets/hoja.png";

// Carrusel interno (sin componente externo)
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

const Login = () => {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const [slideIndex, setSlideIndex] = useState(0);
  const navigate = useNavigate();

  // Carrusel automático (igual que en tu login anterior)
  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentSlide = SLIDES[slideIndex];

  // 👉 Aquí va la funcionalidad REAL de login (no setTimeout)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!correo || !password) {
      setError("Debes ingresar correo y contraseña.");
      return;
    }

    try {
      setCargando(true);

      const data = await login({ correo, password });

      if (!data?.token) {
        setError("No se recibió el token de autenticación.");
        return;
      }

      // Login correcto → navega a /home
      navigate("/home");
    } catch (err) {
      console.error(err);
      setError(err.message || "Credenciales inválidas");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
  className="min-h-screen w-full flex flex-col items-center py-2 px-6 overflow-x-hidden"
  style={{
    background: "radial-gradient(circle at center, #024023 0%, #005B30 100%)",
  }}
>

      {/* HEADER: título + botón Crear Cuenta (igual al del .zip) */}
      <header className="w-full max-w-6xl flex items-center justify-between mb-2">
        <div className="text-center flex-1 lg:translate-x-12 lg:translate-y-[-0px]">
          {/* Digital Barter */}
          <h1
            className="text-[#06B060] leading-tight mb-2"
            style={{
              fontFamily: '"Berlin Sans FB Demi", system-ui, sans-serif',
              fontSize: "3.7rem",
              fontWeight: 700,
              marginTop: "0.2rem",
            }}
          >
            Digital Barter
          </h1>

          {/* green credits + imagen hoja */}
          <div className="flex items-center justify-center gap-2 -mt-1">
            <h2
              className="text-[#06B060]"
              style={{
                fontFamily: '"Jaro", system-ui, sans-serif',
                fontSize: "2.0rem",
                fontWeight: 400,
              }}
            >
              green credits
            </h2>
            {/* Usamos tu hoja importada, no /images/hoja.png */}
            <img
              src={hojaLogo}
              alt="leaf icon"
              className="w-8 h-8 object-contain"
            />
          </div>
        </div>

        {/* Botón Crear Cuenta arriba a la derecha */}
        <Link to="/register" className="absolute top-4 right-4">
          <button
            type="button"
            className="bg-[#005B30] text-white text-lg rounded-lg hover:bg-[#047645] flex items-center justify-center"
            style={{
              fontFamily: '"Berlin Sans FB Demi", system-ui, sans-serif',
              fontWeight: 700,
              height: "45px",
              width: "200px",
            }}
          >
            Crear Cuenta
          </button>
        </Link>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="w-full max-w-6xl flex flex-col lg:flex-row items-start lg:items-start gap-4 mt-0">
        {/* Columna izquierda: carrusel (sustituye <Carousel /> del .zip, pero con tu lógica) */}
        <div className="flex justify-start w-full lg:w-2/5 lg:-translate-x-12 lg:-translate-y-25">
          <div
            className="w-full max-w-[500px] transform scale-90 lg:scale-100 overflow-hidden rounded-2xl shadow-2xl"
            style={{
              height: "450px", // misma altura que en el diseño
              clipPath:
                "polygon(0 0, 100% 0, 100% 100%, 0 100%)", // recorte inferior como en el .zip
            }}
          >
            <div className="relative w-full h-full">
              <img
                src={currentSlide.image}
                alt={currentSlide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <h2 className="text-xl font-bold mb-2">
                  {currentSlide.title}
                </h2>
                <p className="text-sm text-gray-200 mb-4">
                  {currentSlide.text}
                </p>

                {/* Puntos del carrusel */}
                <div className="flex gap-2">
                  {SLIDES.map((s, idx) => (
                    <button
                      key={s.id}
                      onClick={() => setSlideIndex(idx)}
                      className={`w-3 h-3 rounded-full ${
                        idx === slideIndex
                          ? "bg-[#034828]"
                          : "bg-white/70"
                      }`}
                      aria-label={`Ir al slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha: formulario (mismo layout del .zip, con tu lógica de login) */}
        <div className="flex-1 flex flex-col items-center lg:items-start mt-32 lg:ml-20 lg:translate-x-20">
          <form
            onSubmit={handleSubmit}
            className="w-full space-y-4 flex flex-col items-center"
          >
            {/* Campo correo/teléfono */}
            <div className="space-y-3">
              <input
                type="text"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="Correo electrónico o número de teléfono"
                className="w-[445px] rounded-xl px-4 py-3 bg-[#E9FFD9]/50 border border-[#B6E4A3] text-[#013726] placeholder:text-[#6C8A6E]"
                style={{
                  fontSize: "20px",
                  fontWeight: 500,
                }}
              />
            </div>

            {/* Campo contraseña */}
            <div className="space-y-3">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="w-[445px] rounded-xl px-4 py-3 bg-[#E9FFD9]/50 border border-[#B6E4A3] text-[#013726] placeholder:text-[#6C8A6E]"
                style={{
                  fontSize: "20px",
                  fontWeight: 500,
                }}
              />
            </div>

            {/* ¿Has olvidado tu contraseña? centrado (como en el .zip, usando <a>) */}
            <div className="text-center w-full">
              <a
                href="#"
                className="text-sm hover:text-[#06B060] font-medium"
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                onClick={(e) => {
                  e.preventDefault();
                  alert(
                    "En el futuro aquí irá el flujo de recuperar contraseña."
                  );
                }}
              >
                ¿Has olvidado tu contraseña?
              </a>
            </div>

            {/* Mensaje de error (igual lógica, estilo simple) */}
            {error && (
              <p className="text-red-400 text-center text-sm font-medium">
                {error}
              </p>
            )}

            {/* Botón Iniciar Sesión */}
            <button
              type="submit"
              disabled={cargando}
              className="w-[445px] py-4 text-lg bg-[#005B30] text-white hover:bg-[#047645] flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                fontFamily:
                  '"Berlin Sans FB Demi", "Arial Black", sans-serif',
                fontWeight: 700,
                fontSize: "22px",
                height: "50px",
                letterSpacing: "0.5px",
              }}
            >
              {cargando ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>
        </div>
      </main>

      {/* Enlace en la esquina inferior derecha (como en el .zip) */}
      <div className="absolute bottom-4 right-4 w-full text-right">
        <a
          href="#"
          className="text-base hover:text-[#06B060] font-medium"
          style={{ fontFamily: "Inter, system-ui, sans-serif" }}
          onClick={(e) => e.preventDefault()}
        >
          ¡Un poco más sobre nosotros!
        </a>
      </div>
    </div>
  );
};

export default Login;
