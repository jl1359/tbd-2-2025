import { Link } from "react-router-dom";
import Brand from "@/components/Brand.jsx";
import Button from "@/components/Button.jsx";
import { useState } from "react";

export default function Register() {
  const [form, setForm] = useState({
    nombre: "",
    apellidos: "",
    dia: "11",
    mes: "sept.",
    anio: "2025",
    genero: "",
    contacto: "",
    pwd: "",
  });

  function onChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.nombre.trim() || !form.apellidos.trim() || !form.genero || !form.contacto.trim() || !form.pwd.trim()) {
      alert("Completa todos los campos");
      return;
    }
    alert("Registro enviado (simulación) ✅");
  }

  return (
    <div className="min-h-screen bg-gray-100 grid place-items-center p-6">
      <div className="w-full max-w-md">
        <Brand />

        <section className="text-left bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold">Crea una cuenta</h2>
          <p className="text-sm text-gray-500 mb-3">Es rápido y fácil.</p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Nombre</label>
                <input name="nombre" type="text" placeholder="Nombre"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-4 focus:ring-blue-200/50 outline-none"
                  value={form.nombre} onChange={onChange} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Apellidos</label>
                <input name="apellidos" type="text" placeholder="Apellidos"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-4 focus:ring-blue-200/50 outline-none"
                  value={form.apellidos} onChange={onChange} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Fecha de nacimiento</label>
              <div className="grid grid-cols-3 gap-3">
                <select name="dia" className="rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-4 focus:ring-blue-200/50 outline-none" value={form.dia} onChange={onChange}>
                  {Array.from({ length: 31 }, (_, i) => String(i + 1)).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select name="mes" className="rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-4 focus:ring-blue-200/50 outline-none" value={form.mes} onChange={onChange}>
                  {["ene.","feb.","mar.","abr.","may.","jun.","jul.","ago.","sept.","oct.","nov.","dic."].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select name="anio" className="rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-4 focus:ring-blue-200/50 outline-none" value={form.anio} onChange={onChange}>
                  {Array.from({ length: 70 }, (_, i) => 2025 - i).map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Género</label>
              <div className="flex flex-wrap gap-2">
                {["Mujer", "Hombre", "Personalizado"].map(g => (
                  <label key={g} className="inline-flex items-center gap-2 border border-gray-200 rounded-full px-3 py-2 cursor-pointer bg-white">
                    <input type="radio" name="genero" value={g.toLowerCase()} className="accent-emerald-600"
                      checked={form.genero === g.toLowerCase()} onChange={onChange} />
                    <span className="text-gray-700">{g}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Número de móvil o correo electrónico</label>
              <input name="contacto" type="text" placeholder="correo@ejemplo.com"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-4 focus:ring-blue-200/50 outline-none"
                value={form.contacto} onChange={onChange} />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Contraseña nueva</label>
              <input name="pwd" type="password" placeholder="********"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-4 focus:ring-blue-200/50 outline-none"
                value={form.pwd} onChange={onChange} />
            </div>

            <Button type="submit">Registrarte</Button>

            <div className="text-center mt-2">
              <span className="text-sm text-gray-600">¿Ya tienes una cuenta? </span>
              <Link to="/login" className="text-emerald-700 font-semibold underline">Inicia sesión</Link>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
