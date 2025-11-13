import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Brand from "@/components/Brand.jsx";
import Button from "@/components/Button.jsx";

export default function Login() {
  const [user, setUser] = useState("");
  const [pwd, setPwd] = useState("");
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  // Si ya hay sesión, manda directo al home
  useEffect(() => {
    if (localStorage.getItem("db_token")) navigate("/home");
  }, [navigate]);

  function isEmailOrPhone(v = "") {
    const t = v.trim();
    const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phone = /^[0-9+\-\s]{7,}$/;
    return email.test(t) || phone.test(t);
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!isEmailOrPhone(user)) {
      alert("Escribe un correo válido o número de teléfono.");
      return;
    }
    if (pwd.trim().length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    // ✅ Simulación de login correcto
    localStorage.setItem("db_token", "demo-token"); // quítalo cuando conectes tu backend
    navigate("/home", { replace: true });
  }

  return (
    <div className="min-h-screen bg-gray-100 grid place-items-center p-6">
      <div className="w-full max-w-md">
        <Brand />

        <section className="text-left bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="user" className="block text-xs font-medium text-gray-500 mb-1">
                Correo electrónico o número de teléfono
              </label>
              <input
                id="user"
                name="user"
                type="text"
                placeholder="correo@ejemplo.com"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-[15px] outline-none
                          focus:border-blue-500 focus:ring-4 focus:ring-blue-200/50 transition"
                autoComplete="username"
                value={user}
                onChange={(e) => setUser(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="pwd" className="block text-xs font-medium text-gray-500 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="pwd"
                  name="pwd"
                  type={show ? "text" : "password"}
                  placeholder="Contraseña"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-[15px] outline-none
                            focus:border-blue-500 focus:ring-4 focus:ring-blue-200/50 transition pr-12"
                  autoComplete="current-password"
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShow(s => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600 hover:text-gray-900 px-2 py-1 rounded"
                  aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {show ? "Ocultar" : "Ver"}
                </button>
              </div>
            </div>

            <Button type="submit">Iniciar sesión</Button>

            <div className="text-center">
              <a
                href="#"
                className="text-blue-600 underline font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
              >
                ¿Has olvidado tu contraseña?
              </a>
            </div>

            <hr className="border-0 h-px bg-gradient-to-r from-transparent via-emerald-600 to-transparent my-1" />

            <Link to="/register">
              <Button type="button" variant="outline">Crear una cuenta</Button>
            </Link>
          </form>
        </section>
      </div>
    </div>
  );
}
