import ProfileSidebar from "../components/ProfileSidebar.jsx";

export default function ProfileUser() {
  // 🔁 Reemplaza por datos reales desde tu backend
    const perfil = {
        nombre: "Gustavo",
        apellidos: "Arancibia Cardozo",
        contacto: "gustavo@email.com, 65575586",
        nacimiento: "27 de marzo de 1986",
        rol: "Usuario",
        direccion: "Cochabamba - Bolivia",
        avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=256&h=256&fit=crop&crop=faces",
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-[260px_1fr] gap-4 sm:gap-6">
            {/* Sidebar */}
            <ProfileSidebar rol="usuario" nombre={perfil.nombre} />

            {/* Contenido */}
            <section className="bg-white rounded-2xl shadow-xl border border-gray-200">
            {/* Encabezado */}
            <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
                <h1 className="text-2xl sm:text-3xl font-extrabold">Perfil de usuario</h1>
                <p className="text-sm text-gray-600 mt-1">
                Digital Barter usa esta información para verificar tu identidad.
                </p>

                <div className="flex flex-col items-center mt-5">
                <img
                    src={perfil.avatar}
                    alt="Avatar"
                    className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-md"
                />
                <button className="text-sm text-emerald-700 font-semibold mt-2">
                    Cambiar foto de perfil
                </button>
                </div>
            </div>

            {/* Ficha de datos */}
            <div className="p-6 sm:p-8">
                <div className="rounded-2xl border border-gray-200 overflow-hidden">
                <Row label="Nombre" value={perfil.nombre} />
                <Row label="Apellidos" value={perfil.apellidos} />
                <Row label="Información de contacto" value={perfil.contacto} muted />
                <Row label="Fecha de nacimiento" value={perfil.nacimiento} />
                <Row label="Rol" value={perfil.rol} />
                <Row label="Dirección" value={perfil.direccion} />
                </div>
            </div>
            </section>
        </div>
        </div>
    );
}

// Componente para cada fila de la ficha
function Row({ label, value, muted }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-2 sm:gap-6 px-5 sm:px-6 py-4 border-b last:border-0 border-gray-200">
        <div className="text-gray-600 font-semibold">{label}</div>
        <div className={muted ? "text-gray-400" : "text-gray-800"}>{value}</div>
        </div>
    );
}
