import { useState } from "react";
import { login as apiLogin } from "../services/auth";
import AdminLayout from "../components/AdminLayout";

export default function Login() {
  const [correo, setCorreo] = useState("demo@demo.com");
  const [password, setPassword] = useState("demo123");
  const [msg, setMsg] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("...");
    try {
      await apiLogin({ correo, password });
      setMsg("✅ Login OK, redirigiendo…");
      setTimeout(()=> window.location.href = "/home", 400);
    } catch (err) {
      setMsg("❌ " + (err.message || "Credenciales inválidas"));
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-md mx-auto bg-white rounded-2xl border shadow p-5">
        <h2 className="text-xl font-bold text-center mb-4">Iniciar sesión</h2>
        <form className="space-y-3" onSubmit={onSubmit}>
          <input className="border rounded p-2 w-full" placeholder="Correo" name="correo" value={correo} onChange={(e)=>setCorreo(e.target.value)} />
          <input className="border rounded p-2 w-full" placeholder="Contraseña" type="password" name="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
          <button className="w-full py-2 bg-gray-900 hover:bg-black text-white rounded-lg font-semibold">Entrar</button>
        </form>
        {msg && <p className="mt-3 text-center text-sm">{msg}</p>}
      </div>
    </AdminLayout>
  );
}
