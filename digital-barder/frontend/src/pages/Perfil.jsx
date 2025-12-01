import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMisLogros } from "../services/api";
import { ArrowLeft, Medal, Award, Crown, TrendingUp, BarChart3, Trophy, Users, Star, ShoppingBag, RefreshCw, Phone, Calendar, Mail } from "lucide-react";
import hoja from "../assets/hoja.png";

export default function Logros() {
  const navigate = useNavigate();
  const [logros, setLogros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(null); // Cambiado a null para que no haya selección inicial

  useEffect(() => {
    cargarLogros();
  }, []);

  async function cargarLogros() {
    try {
      setLoading(true);
      setError("");
      const data = await getMisLogros();
      setLogros(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudieron cargar tus logros.");
    } finally {
      setLoading(false);
    }
  }

  // Estadísticas simuladas (reemplazar con datos reales cuando tengas la API)
  const userStats = {
    nombre: "Gustavo Herbas Andia",
    email: "Gustavo_Herbas67@gmail.com",
    telefono: "+591 65558947",
    fechaNacimiento: "27-11-1987",
    recomendacion: 34,
    opiniones: 54,
    ventas: 3,
    intercambios: 1,
    creditos: 1250, // Saldo en créditos
    ranking: 15,
    participacion: 87,
  };

  const stats = useMemo(() => {
    if (!logros.length) return { total: 0, ult: null };

    const ordenados = [...logros].sort((a, b) => {
      const fa = new Date(a.obtenido_en || a.creado_en || 0).getTime();
      const fb = new Date(b.obtenido_en || b.creado_en || 0).getTime();
      return fb - fa;
    });

    return {
      total: logros.length,
      ult: ordenados[0],
    };
  }, [logros]);

  // Renderizar contenido según la pestaña activa
  const renderTabContent = () => {
    switch (activeTab) {
      case "recompensas":
        return (
          <>
            {stats.ult && (
              <div className="mb-6 bg-[#0f3f2d] border border-emerald-700 rounded-2xl p-4 flex items-start gap-4">
                <div className="mt-1">
                  <Crown size={28} className="text-yellow-300" />
                </div>
                <div>
                  <p className="text-xs text-emerald-300/90 mb-1">
                    Último logro obtenido
                  </p>
                  <h2 className="text-lg font-semibold text-emerald-200">
                    {stats.ult.nombre || "Logro reciente"}
                  </h2>
                  <p className="text-sm text-emerald-100/90 mt-1">
                    {stats.ult.descripcion || "Sin descripción."}
                  </p>
                  <p className="text-xs text-emerald-200/80 mt-2">
                    Obtenido el{" "}
                    {new Date(
                      stats.ult.obtenido_en ||
                        stats.ult.creado_en ||
                        Date.now()
                    ).toLocaleString()}
                  </p>
                  {typeof stats.ult.creditos_recompensa === "number" && (
                    <p className="text-xs text-emerald-200/90 mt-1">
                      Créditos de recompensa:{" "}
                      <span className="font-semibold text-emerald-300">
                        {stats.ult.creditos_recompensa} cr.
                      </span>
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-3">
              {logros.map((logro, idx) => {
                const progreso =
                  logro.progreso_actual ??
                  logro.progreso ??
                  null;
                const meta = logro.meta_requerida ?? null;
                const porcentaje =
                  progreso && meta ? Math.min(100, (progreso / meta) * 100) : null;

                return (
                  <div
                    key={logro.id_logro || idx}
                    className="bg-[#0f3f2d] border border-emerald-700 rounded-2xl p-4 shadow-md flex flex-col"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-700/40 flex items-center justify-center">
                        <Award size={20} className="text-emerald-200" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-emerald-100">
                          {logro.nombre || "Logro sin nombre"}
                        </h3>
                        {logro.meta_requerida && (
                          <p className="text-[11px] text-emerald-300/90">
                            Meta: {logro.meta_requerida}
                          </p>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-emerald-100/80 flex-1">
                      {logro.descripcion || "Sin descripción."}
                    </p>

                    {porcentaje !== null && (
                      <div className="mt-3">
                        <p className="text-[11px] text-emerald-200/90 mb-1">
                          Progreso: {progreso} / {meta}
                        </p>
                        <div className="w-full h-2 rounded-full bg-emerald-900/60 overflow-hidden">
                          <div
                            className="h-full bg-emerald-400"
                            style={{ width: `${porcentaje}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="mt-3 text-[11px] text-emerald-200/80">
                      {typeof logro.creditos_recompensa === "number" && (
                        <p>
                          Créditos recompensa:{" "}
                          <span className="font-semibold text-emerald-300">
                            {logro.creditos_recompensa} cr.
                          </span>
                        </p>
                      )}
                      {(logro.obtenido_en || logro.creado_en) && (
                        <p className="mt-1">
                          Obtenido el{" "}
                          {new Date(
                            logro.obtenido_en || logro.creado_en
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        );

      case "participacion":
        return (
          <div className="bg-[#0f3f2d] border border-emerald-700 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-emerald-200 mb-4">Actividades Sostenibles</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-emerald-900/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-700 rounded-lg">
                    <RefreshCw size={20} className="text-emerald-200" />
                  </div>
                  <div>
                    <h3 className="font-medium">Reciclaje de Electrónicos</h3>
                    <p className="text-sm text-emerald-300/80">15 unidades recicladas</p>
                  </div>
                </div>
                <span className="font-bold text-emerald-300">+150 cr</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-emerald-900/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-700 rounded-lg">
                    <ShoppingBag size={20} className="text-emerald-200" />
                  </div>
                  <div>
                    <h3 className="font-medium">Compras Sostenibles</h3>
                    <p className="text-sm text-emerald-300/80">8 transacciones verdes</p>
                  </div>
                </div>
                <span className="font-bold text-emerald-300">+80 cr</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-emerald-900/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-700 rounded-lg">
                    <Users size={20} className="text-emerald-200" />
                  </div>
                  <div>
                    <h3 className="font-medium">Eventos Comunitarios</h3>
                    <p className="text-sm text-emerald-300/80">3 eventos asistidos</p>
                  </div>
                </div>
                <span className="font-bold text-emerald-300">+90 cr</span>
              </div>
            </div>
          </div>
        );

      case "ranking":
        return (
          <div className="bg-[#0f3f2d] border border-emerald-700 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-emerald-200 mb-4">Ranking Global</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-emerald-900/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Trophy size={24} className="text-yellow-400" />
                  <div>
                    <h3 className="font-medium">Tu Posición</h3>
                    <p className="text-sm text-emerald-300/80">Entre 150 usuarios</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-300">#{userStats.ranking}</div>
                  <p className="text-xs text-emerald-300/80">Top 10%</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-emerald-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={18} className="text-emerald-300" />
                    <h4 className="text-sm font-medium">Progreso Mensual</h4>
                  </div>
                  <p className="text-2xl font-bold text-emerald-300">+5</p>
                  <p className="text-xs text-emerald-300/80">Puestos subidos</p>
                </div>
                
                <div className="p-4 bg-emerald-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Star size={18} className="text-emerald-300" />
                    <h4 className="text-sm font-medium">Puntuación</h4>
                  </div>
                  <p className="text-2xl font-bold text-emerald-300">8.7</p>
                  <p className="text-xs text-emerald-300/80">/10.0</p>
                </div>
              </div>
            </div>
          </div>
        );

      case "estadistica":
        return (
          <div className="bg-[#0f3f2d] border border-emerald-700 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-emerald-200 mb-4">Estadísticas</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 size={18} className="text-emerald-300" />
                  <h4 className="text-sm font-medium">Actividad</h4>
                </div>
                <p className="text-2xl font-bold text-emerald-300">{userStats.participacion}%</p>
                <p className="text-xs text-emerald-300/80">Participación</p>
              </div>
              
              <div className="p-4 bg-emerald-900/20 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Intercambios</h4>
                <p className="text-2xl font-bold text-emerald-300">{userStats.ventas + userStats.intercambios}</p>
                <p className="text-xs text-emerald-300/80">Total realizados</p>
              </div>
              
              <div className="p-4 bg-emerald-900/20 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Días Activo</h4>
                <p className="text-2xl font-bold text-emerald-300">42</p>
                <p className="text-xs text-emerald-300/80">Consecutivos</p>
              </div>
              
              <div className="p-4 bg-emerald-900/20 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Impacto Verde</h4>
                <p className="text-2xl font-bold text-emerald-300">28 kg</p>
                <p className="text-xs text-emerald-300/80">CO₂ reducido</p>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-[#0f3f2d] border border-emerald-700 rounded-2xl p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-700/30 flex items-center justify-center mx-auto mb-4">
                <Users size={32} className="text-emerald-300" />
              </div>
              <h2 className="text-xl font-semibold text-emerald-200 mb-3">Bienvenido a tu perfil</h2>
              <p className="text-sm text-emerald-100/80 mb-4">
                Selecciona una opción del historial para ver tus recompensas, participación, ranking o estadísticas.
              </p>
              <div className="grid grid-cols-2 gap-2 mt-6">
                <button
                  onClick={() => setActiveTab("recompensas")}
                  className="p-3 bg-emerald-900/30 rounded-lg hover:bg-emerald-800/30 transition-colors"
                >
                  <Medal size={20} className="mx-auto mb-2 text-emerald-300" />
                  <span className="text-sm text-emerald-100">Recompensas</span>
                </button>
                <button
                  onClick={() => setActiveTab("participacion")}
                  className="p-3 bg-emerald-900/30 rounded-lg hover:bg-emerald-800/30 transition-colors"
                >
                  <Users size={20} className="mx-auto mb-2 text-emerald-300" />
                  <span className="text-sm text-emerald-100">Participación</span>
                </button>
                <button
                  onClick={() => setActiveTab("ranking")}
                  className="p-3 bg-emerald-900/30 rounded-lg hover:bg-emerald-800/30 transition-colors"
                >
                  <Trophy size={20} className="mx-auto mb-2 text-emerald-300" />
                  <span className="text-sm text-emerald-100">Ranking</span>
                </button>
                <button
                  onClick={() => setActiveTab("estadistica")}
                  className="p-3 bg-emerald-900/30 rounded-lg hover:bg-emerald-800/30 transition-colors"
                >
                  <BarChart3 size={20} className="mx-auto mb-2 text-emerald-300" />
                  <span className="text-sm text-emerald-100">Estadística</span>
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#082b1f] text-white p-6 md:p-10">
      {/* HEADER */}
      <header className="flex items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full bg-black/30 px-3 py-1 text-sm hover:bg-black/40"
          >
            <ArrowLeft size={16} />
            Volver
          </button>
          <h1 className="text-2xl font-bold text-emerald-400">Mi Perfil</h1>
        </div>

        <div className="flex items-center gap-3">
          <img src={hoja} alt="logo" className="w-9 h-9 drop-shadow-md" />
        </div>
      </header>

      {/* ERROR */}
      {error && (
        <div className="mb-4 rounded-md border border-red-400 bg-red-900/40 px-4 py-2 text-sm text-red-100">
          {error}
        </div>
      )}

      {/* CONTENIDO PRINCIPAL - AHORA SOLO UNA COLUMNA PARA EL PERFIL */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* COLUMNA IZQUIERDA - INFO DEL USUARIO */}
          <div className="lg:col-span-1 space-y-6">
            {/* Foto de perfil circular */}
            <div className="flex justify-center">
              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 border-4 border-emerald-500 flex items-center justify-center">
                <span className="text-5xl font-bold text-white">GA</span>
              </div>
            </div>

            {/* Nombre completo */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-emerald-200 mb-1">{userStats.nombre}</h3>
              <p className="text-sm text-emerald-300">Miembro desde 2024</p>
            </div>

            {/* Cuadros para información de contacto */}
            <div className="space-y-3">
              {/* Email en cuadro */}
              <div className="flex items-center gap-3 p-3 bg-emerald-900/40 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center">
                  <Mail size={20} className="text-emerald-200" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-emerald-300/80">Email</p>
                  <p className="font-medium text-emerald-100 text-sm">{userStats.email}</p>
                </div>
              </div>

              {/* Teléfono en cuadro */}
              <div className="flex items-center gap-3 p-3 bg-emerald-900/40 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center">
                  <Phone size={20} className="text-emerald-200" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-emerald-300/80">Teléfono</p>
                  <p className="font-medium text-emerald-100">{userStats.telefono}</p>
                </div>
              </div>

              {/* Fecha de nacimiento en cuadro */}
              <div className="flex items-center gap-3 p-3 bg-emerald-900/40 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center">
                  <Calendar size={20} className="text-emerald-200" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-emerald-300/80">Fecha de Nacimiento</p>
                  <p className="font-medium text-emerald-100">{userStats.fechaNacimiento}</p>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA CENTRAL - HISTORIAL Y ESTADÍSTICAS */}
          <div className="lg:col-span-2 space-y-6">
            {/* Historial - Pestañas */}
            <div className="bg-[#0f3f2d] border border-emerald-700 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-emerald-300 mb-4">Historial</h2>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setActiveTab("recompensas")}
                  className={`py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === "recompensas"
                      ? "bg-emerald-500 text-black"
                      : "bg-emerald-900/30 text-emerald-200 hover:bg-emerald-800/30"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Medal size={16} />
                    Recompensas
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("participacion")}
                  className={`py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === "participacion"
                      ? "bg-emerald-500 text-black"
                      : "bg-emerald-900/30 text-emerald-200 hover:bg-emerald-800/30"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Users size={16} />
                    Participación
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("ranking")}
                  className={`py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === "ranking"
                      ? "bg-emerald-500 text-black"
                      : "bg-emerald-900/30 text-emerald-200 hover:bg-emerald-800/30"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Trophy size={16} />
                    Ranking
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("estadistica")}
                  className={`py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === "estadistica"
                      ? "bg-emerald-500 text-black"
                      : "bg-emerald-900/30 text-emerald-200 hover:bg-emerald-800/30"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <BarChart3 size={16} />
                    Estadística
                  </div>
                </button>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Recomendación */}
              <div className="bg-[#0f3f2d] border border-emerald-700 rounded-2xl p-4">
                <h4 className="text-sm font-medium text-emerald-300 mb-3">
                  Recomendada por el {userStats.recomendacion}% ({userStats.opiniones} opiniones)
                </h4>
                <div className="w-full h-2 bg-emerald-900 rounded-full overflow-hidden mb-2">
                  <div 
                    className="h-full bg-emerald-400" 
                    style={{ width: `${userStats.recomendacion}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-emerald-300/80">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Saldo en Créditos */}
              <div className="bg-[#0f3f2d] border border-emerald-700 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-200">Saldo</p>
                    <p className="text-2xl font-bold text-emerald-300">{userStats.creditos} cr</p>
                    <p className="text-xs text-emerald-300/80 mt-1">Créditos disponibles</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-emerald-700 flex items-center justify-center">
                    <Medal size={24} className="text-emerald-200" />
                  </div>
                </div>
              </div>

              {/* Ventas e intercambios */}
              <div className="bg-[#0f3f2d] border border-emerald-700 rounded-2xl p-4">
                <h4 className="text-sm font-medium text-emerald-300 mb-3">Actividad</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-300">{userStats.ventas}</p>
                    <p className="text-xs text-emerald-200/80">Ventas realizadas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-300">{userStats.intercambios}</p>
                    <p className="text-xs text-emerald-200/80">Intercambios realizados</p>
                  </div>
                </div>
              </div>

              {/* Ranking */}
              <div className="bg-[#0f3f2d] border border-emerald-700 rounded-2xl p-4">
                <h4 className="text-sm font-medium text-emerald-300 mb-3">Ranking</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-emerald-300">#{userStats.ranking}</p>
                    <p className="text-xs text-emerald-300/80">Top 10% global</p>
                  </div>
                  <Trophy size={24} className="text-yellow-400" />
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA - CONTENIDO DE LA PESTAÑA */}
          <div className="lg:col-span-1">
            {loading ? (
              <div className="text-center text-emerald-100/80 py-10">
                Cargando información...
              </div>
            ) : (
              renderTabContent()
            )}
          </div>
        </div>
      </div>
    </div>
  );
}