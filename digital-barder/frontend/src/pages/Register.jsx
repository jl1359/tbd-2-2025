import { useState } from "react";
import { register as apiRegister } from "../services/auth";
import AdminLayout from "../components/AdminLayout";

export default function Register() {
    const [f, setF] = useState({
        nombre: "", apellido: "", correo: "", telefono: "",
        password: "", genero: "", fecha_nacimiento: ""
    });
    const [msg, setMsg] = useState("");

    const onChange = (e) => setF({ ...f, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setMsg("...");
        try {
        const payload = { ...f };
        if (!payload.telefono) delete payload.telefono;
        if (!payload.genero) delete payload.genero;
        if (!payload.fecha_nacimiento) delete payload.fecha_nacimiento;
        await apiRegister(payload);
        setMsg("✅ Cuenta creada. Ahora puedes iniciar sesión.");
        } catch (err) {
        setMsg("❌ " + (err.message || "Error de registro"));
        }
    };

    return (
        <AdminLayout>
        <div className="max-w-md mx-auto bg-white rounded-2xl border shadow p-5">
            <h1 className="text-3xl font-extrabold text-center text-green-700">Digital Barter</h1>
            <p className="text-sm text-center text-green-600 -mt-1 mb-4">green credits</p>
            <h2 className="text-xl font-bold text-center">Crea una cuenta</h2>
            <p className="text-center text-sm text-gray-500 mb-4">Es rápido y fácil.</p>

            <form className="space-y-3" onSubmit={onSubmit}>
            <div className="flex gap-2">
                <input className="border rounded p-2 w-1/2" placeholder="Nombre" name="nombre" value={f.nombre} onChange={onChange} required />
                <input className="border rounded p-2 w-1/2" placeholder="Apellidos" name="apellido" value={f.apellido} onChange={onChange} />
            </div>

            <input className="border rounded p-2 w-full" placeholder="Número de móvil (opcional)" name="telefono" value={f.telefono} onChange={onChange} />
            <input className="border rounded p-2 w-full" placeholder="Correo electrónico" type="email" name="correo" value={f.correo} onChange={onChange} required />
            <input className="border rounded p-2 w-full" placeholder="Contraseña nueva" type="password" name="password" value={f.password} onChange={onChange} required />

            <button className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold">Registrarte</button>
            </form>

            {msg && <p className="mt-3 text-center text-sm">{msg}</p>}
            <p className="text-center text-sm mt-4"><a href="/login">¿Ya tienes una cuenta?</a></p>
        </div>
        </AdminLayout>
    );
}
