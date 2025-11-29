// digital-barder/frontend/src/pages/Logros.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMisLogros } from "../services/api";
import { ArrowLeft, Medal, Award, Crown } from "lucide-react";
import hoja from "../assets/hoja.png";

export default function Logros() {
  const navigate = useNavigate();
  const [logros, setLogros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  // Estadísticas simples
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
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-900/70 px-3 py-2 text-sm">
            <Medal size={18} className="text-emerald-300" />
            <span className="font-semibold">Mis logros</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-emerald-100/80">
            Total de insignias:{" "}
            <span className="font-semibold text-emerald-300">
              {stats.total}
            </span>
          </span>
          <img src={hoja} alt="logo" className="w-9 h-9 drop-shadow-md" />
        </div>
      </header>

      {/* DESCRIPCIÓN */}
      <section className="max-w-3xl mb-6">
        <h1 className="text-2xl font-semibold mb-2">Tus insignias verdes</h1>
        <p className="text-sm text-emerald-100/80">
          Aquí puedes ver todos los logros que has obtenido en Digital Barter:
          actividades sostenibles, intercambios, uso de la plataforma y otros
          hitos que te otorgan créditos de recompensa.
        </p>
      </section>

      {/* ERROR */}
      {error && (
        <div className="mb-4 rounded-md border border-red-400 bg-red-900/40 px-4 py-2 text-sm text-red-100">
          {error}
        </div>
      )}

      {/* CONTENIDO */}
      {loading ? (
        <div className="text-center text-emerald-100/80">
          Cargando tus logros...
        </div>
      ) : logros.length === 0 ? (
        <div className="text-center text-emerald-100/80 mt-10">
          Aún no has desbloqueado ningún logro.  
          Participa en actividades, realiza intercambios y usa la plataforma
          para comenzar a ganar insignias.
        </div>
      ) : (
        <>
          {/* ÚLTIMO LOGRO DESTACADO */}
          {stats.ult && (
            <section className="max-w-3xl mb-6 bg-[#0f3f2d] border border-emerald-700 rounded-2xl p-4 flex items-start gap-4">
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
            </section>
          )}

          {/* GRID DE LOGROS */}
          <section className="grid gap-4 md:grid-cols-3">
            {logros.map((logro, idx) => {
              const progreso =
                logro.progreso_actual ??
                logro.progreso ??
                null;
              const meta = logro.meta_requerida ?? null;
              const porcentaje =
                progreso && meta ? Math.min(100, (progreso / meta) * 100) : null;

              return (
                <article
                  key={logro.id_logro || idx}
                  className="bg-[#0f3f2d] border border-emerald-700 rounded-2xl p-4 shadow-md flex flex-col"
                >
                  {/* Icono / encabezado */}
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

                  {/* Descripción */}
                  <p className="text-xs text-emerald-100/80 flex-1">
                    {logro.descripcion || "Sin descripción."}
                  </p>

                  {/* Progreso */}
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

                  {/* Créditos recompensa + fecha */}
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
                </article>
              );
            })}
          </section>
        </>
      )}
    </div>
  );
}
