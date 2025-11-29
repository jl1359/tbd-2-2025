// frontend/src/pages/Register.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/api";

export default function Register() {
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const [dia, setDia] = useState("22");
  const [mes, setMes] = useState("sept.");
  const [anio, setAnio] = useState("2025");
  const [genero, setGenero] = useState("Hombre");

  // Solo para el diseño (no se envía aún a la API)
  const [tipoUsuario, setTipoUsuario] = useState("Emprendedor");

  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const dias = Array.from({ length: 31 }, (_, i) => String(i + 1));
  const anios = Array.from({ length: 80 }, (_, i) => String(2025 - i));

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
        // tipoUsuario aún no lo enviamos para no cambiar la funcionalidad del backend
      });

      setOk("Cuenta creada correctamente. Ahora puedes iniciar sesión.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudo registrar el usuario.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-10">
      {/* CONTENEDOR CENTRAL DEL FORMULARIO (como en tu diseño) */}
      <div className="w-full max-w-3xl bg-black/20 rounded-3xl px-8 sm:px-10 py-10 shadow-2xl">
        {/* TÍTULO */}
        <h1
          className="text-center mb-8"
          style={{
            fontFamily: '"Berlin Sans FB Demi", system-ui, sans-serif',
            fontSize: "2.8rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: "#FFFFFF",
          }}
        >
          Crea una Cuenta
        </h1>

        {/* ALERTAS */}
        {error && (
          <div className="mb-4 bg-red-500/20 border border-red-400 text-sm px-3 py-2 rounded-lg text-white">
            {error}
          </div>
        )}
        {ok && (
          <div className="mb-4 bg-green-500/20 border border-green-400 text-sm px-3 py-2 rounded-lg text-white">
            {ok}
          </div>
        )}

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre / Apellidos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre"
              className="max-w-[330px] w-full"
            />
            <input
              type="text"
              value={apellidos}
              onChange={(e) => setApellidos(e.target.value)}
              placeholder="Apellidos"
              className="max-w-[350px] w-full"
            />
          </div>

          {/* Fecha de nacimiento */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col">
              <label className="text-xs mb-1 text-gray-200 flex items-center gap-1">
                Fecha de nacimiento
                <span className="text-[0.7rem] w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center">
                  ?
                </span>
              </label>
              <select
                value={dia}
                onChange={(e) => setDia(e.target.value)}
                className="w-full h-[60px] rounded-lg bg-[#E9FFD9] text-[#013726] px-4 text-[16px] font-medium border-none shadow"
              >
                {dias.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs mb-1 text-transparent select-none">
                .
              </label>
              <select
                value={mes}
                onChange={(e) => setMes(e.target.value)}
                className="w-full h-[60px] rounded-lg bg-[#E9FFD9] text-[#013726] px-4 text-[16px] font-medium border-none shadow"
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
            </div>

            <div className="flex flex-col">
              <label className="text-xs mb-1 text-transparent select-none">
                .
              </label>
              <select
                value={anio}
                onChange={(e) => setAnio(e.target.value)}
                className="w-full h-[60px] rounded-lg bg-[#E9FFD9] text-[#013726] px-4 text-[16px] font-medium border-none shadow"
              >
                {anios.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Género + Tipo Usuario */}
          <div className="grid grid-cols-3 gap-3">
            {/* Género */}
            <div className="flex flex-col col-span-2">
              <label className="text-xs mb-1 text-gray-200 flex items-center gap-1">
                Género
                <span className="text-[0.7rem] w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center">
                  ?
                </span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGenero("Hombre")}
                  className={`w-full h-[60px] rounded-lg flex items-center justify-between px-4 text-sm font-medium ${
                    genero === "Hombre"
                      ? "bg-[#E9FFD9] text-[#013726]"
                      : "bg-[#0b3a25] text-gray-100 border border-white/20"
                  }`}
                >
                  <span>Hombre</span>
                  <span
                    className={`w-5 h-5 rounded-full ml-3 border flex items-center justify-center ${
                      genero === "Hombre"
                        ? "border-[#013726] bg-[#0fd46e]"
                        : "border-gray-300 bg-transparent"
                    }`}
                  >
                    {genero === "Hombre" && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#013726]" />
                    )}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setGenero("Mujer")}
                  className={`w-full h-[60px] rounded-lg flex items-center justify-between px-4 text-sm font-medium ${
                    genero === "Mujer"
                      ? "bg-[#E9FFD9] text-[#013726]"
                      : "bg-[#0b3a25] text-gray-100 border border-white/20"
                  }`}
                >
                  <span>Mujer</span>
                  <span
                    className={`w-5 h-5 rounded-full ml-3 border flex items-center justify-center ${
                      genero === "Mujer"
                        ? "border-[#013726] bg-[#0fd46e]"
                        : "border-gray-300 bg-transparent"
                    }`}
                  >
                    {genero === "Mujer" && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#013726]" />
                    )}
                  </span>
                </button>
              </div>
            </div>

            {/* Tipo Usuario (solo visual, aún no enviado al backend) */}
            <div className="flex flex-col">
              <label className="text-xs mb-1 text-gray-200">
                Tipo Usuario
              </label>
              <select
                value={tipoUsuario}
                onChange={(e) => setTipoUsuario(e.target.value)}
                className="w-full h-[60px] rounded-lg bg-[#E9FFD9] text-[#013726] px-4 text-[16px] font-medium border-none shadow"
              >
                <option>Emprendedor</option>
                <option>Consumidor</option>
                <option>Ambos</option>
              </select>
            </div>
          </div>

          {/* Correo / Teléfono */}
          <input
            type="text"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="Número de móvil o correo electrónico"
            className="max-w-[690px] w-full"
          />

          {/* (Opcional) si quieres mantener teléfono explícito, déjalo; si no, puedes comentarlo */}
          {/* <input
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="Teléfono (opcional)"
          /> */}

          {/* Contraseñas */}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="max-w-[690px] w-full"
          />

          <input
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            placeholder="Confirmar contraseña"
            className="max-w-[690px] w-full"
          />

          {/* Botón Registrar */}
          <div className="flex flex-col items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-64 h-[52px] bg-[#0b7a35] hover:bg-[#0cb652] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-lg"
              style={{
                fontFamily:
                  '"Berlin Sans FB Demi", "Arial Black", sans-serif',
                fontWeight: 700,
              }}
            >
              {loading ? "Registrando..." : "Registrar"}
            </button>

            <p className="text-xs text-gray-200">
              ¿Ya tienes una cuenta?{" "}
              <Link to="/login" className="underline text-[#E9FFD9]">
                Inicia sesión
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
