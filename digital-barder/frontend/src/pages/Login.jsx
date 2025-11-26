// pages/Login.jsx
import React, { useState } from "react";
import { Link } from 'react-router-dom'; // <-- AGREGAR ESTA LÍNEA
import Carousel from "../components/Carousel";

const Login = () => {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setCargando(true);

    setTimeout(() => {
      setCargando(false);
      if (correo === "admin@example.com" && password === "admin123") {
        window.location.href = "/home";
      } else {
        setError("Correo o contraseña incorrectos");
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center py-2 px-6 overflow-x-hidden">
      {/* HEADER: título + botón Crear Cuenta - MÁS ARRIBA Y DERECHA */}
      <header className="w-full max-w-6xl flex items-center justify-between mb-2">
        <div className="text-center flex-1 lg:translate-x-12 lg:translate-y-[-0px]">
          {/* Digital Barter MÁS PEQUEÑO */}
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

          {/* Green credits MÁS PEQUEÑO CON IMAGEN */}
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
            {/* Imagen sin bordes */}
            <img 
              src="/images/hoja.png"
              alt="leaf icon"
              className="w-8 h-8 object-contain"
            />
          </div>
        </div>

        {/* Botón Crear Cuenta CONVERTIDO EN LINK - con texto centrado */}
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
        {/* Columna izquierda: carrusel - CON PARTE INFERIOR RECORTADA */}
        <div className="flex justify-start w-full lg:w-2/5 lg:-translate-x-12 lg:-translate-y-25">
          <div className="w-full max-w-[500px] transform scale-90 lg:scale-100 overflow-hidden rounded-2xl shadow-2xl" 
               style={{ 
                 height: '450px', // Altura reducida
                 clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' // Recorta 10% inferior
               }}>
            <Carousel />
          </div>
        </div>

        {/* Columna derecha: formulario - MUCHO MÁS ABAJO */}
        <div className="flex-1 flex flex-col items-center lg:items-start mt-32 lg:ml-20 lg:translate-x-20">
          <form onSubmit={handleSubmit} className="w-full space-y-4 flex flex-col items-center">
            {/* Campos de entrada con tamaño ajustado */}
            <div className="space-y-3">
              <input
                type="text"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="Correo electrónico o número de teléfono"
                className="w-[445px]"
                style={{
                  fontSize: "20px",
                  fontWeight: "500",
                }}
              />
            </div>

            <div className="space-y-3">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="w-[445px]"
                style={{
                  fontSize: "20px",
                  fontWeight: "500",
                }}
              />
            </div>

            {/* ¿Has olvidado tu contraseña? centrado */}
            <div className="text-center w-full">
              <a
                href="#"
                className="text-sm hover:text-[#06B060] font-medium"
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              >
                ¿Has olvidado tu contraseña?
              </a>
            </div>

            {error && (
              <p className="text-red-400 text-center text-sm font-medium">{error}</p>
            )}

            {/* Botón Iniciar Sesión con texto centrado */}
            <button
              type="submit"
              disabled={cargando}
              className="w-[445px] py-4 text-lg bg-[#005B30] text-white hover:bg-[#047645] flex items-center justify-center"
              style={{
                fontFamily: '"Berlin Sans FB Demi", "Arial Black", sans-serif',
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

      {/* Enlace en la esquina inferior derecha */}
      <div className="absolute bottom-4 right-4 w-full text-right">
        <a
          href="#"
          className="text-base hover:text-[#06B060] font-medium"
          style={{ fontFamily: "Inter, system-ui, sans-serif" }}
        >
          ¡Un poco más sobre nosotros!
        </a>
      </div>
    </div>
  );
};

export default Login;