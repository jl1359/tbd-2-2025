// frontend/src/pages/Premium.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function Premium() {
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [activando, setActivando] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  // Cargar plan premium actual
  useEffect(() => {
    async function cargarPlan() {
      try {
        setError("");
        setMensaje("");
        setLoadingPlan(true);

        const data = await api("/premium/mi-plan");

        // miPlanPremiumService devuelve una FILA; por seguridad,
        // soportamos también que pueda venir como array de 1 elemento.
        let row = null;
        if (Array.isArray(data)) row = data[0] || null;
        else if (data && Object.keys(data).length > 0) row = data;

        setPlan(row);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar la información de tu plan premium.");
        setPlan(null);
      } finally {
        setLoadingPlan(false);
      }
    }

    cargarPlan();
  }, []);

  // En tu BD el valor "activo" es ACTIVA
  const esPremium = !!plan && plan.estado === "ACTIVA";
  const esVencida = !!plan && plan.estado === "VENCIDA";
  const esCancelada = !!plan && plan.estado === "CANCELADA";

  function formatearFecha(fecha) {
    if (!fecha) return "—";
    const d = new Date(fecha);
    if (Number.isNaN(d.getTime())) return fecha;
    return d.toLocaleDateString("es-BO", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  }

  async function activarPremium() {
    try {
      setError("");
      setMensaje("");
      setActivando(true);

      const nuevaSubscripcion = await api("/premium/activar", {
        method: "POST",
      });

      // Actualizamos el plan con lo que devuelva el backend
      setPlan(nuevaSubscripcion);
      setMensaje("¡Listo! Ahora eres usuario Premium 🌿");
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "Ocurrió un error al activar tu plan premium. Intenta de nuevo."
      );
    } finally {
      setActivando(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-emerald-50 px-4 py-6">
      {/* HEADER */}
      <header className="mb-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-full bg-black/30 px-3 py-1 text-sm hover:bg-black/40"
        >
          <span className="text-lg">←</span>
          Volver
        </button>

        <div className="rounded-full bg-emerald-700/80 px-4 py-1.5 text-sm font-semibold shadow">
          Plan Premium
        </div>
      </header>

      {/* TÍTULO */}
      <section className="mb-6 space-y-2">
        <h1 className="text-3xl font-semibold tracking-wide">
          Haz crecer tu impacto con{" "}
          <span className="text-emerald-300">Premium</span>
        </h1>
        <p className="max-w-3xl text-sm text-emerald-100/80">
          Con la suscripción premium obtienes más visibilidad en el marketplace,
          beneficios especiales y reportes avanzados de tu impacto ambiental.
        </p>
      </section>

      {/* MENSAJES GLOBALES */}
      {error && (
        <div className="mb-4 rounded-md border border-red-500/60 bg-red-900/40 px-4 py-2 text-sm text-red-100">
          {error}
        </div>
      )}
      {mensaje && (
        <div className="mb-4 rounded-md border border-emerald-400/60 bg-emerald-900/40 px-4 py-2 text-sm text-emerald-100">
          {mensaje}
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* PANEL IZQUIERDO: ESTADO / CONVERSIÓN A PREMIUM */}
        <section className="rounded-3xl border border-emerald-700/70 bg-emerald-950/40 p-6 shadow-lg">
          {loadingPlan && (
            <p className="text-sm text-emerald-100/80">
              Cargando estado de tu plan premium…
            </p>
          )}

          {!loadingPlan && !esPremium && !esVencida && !esCancelada && (
            <>
              <h2 className="text-xl font-semibold mb-2">
                Aún no eres usuario premium
              </h2>
              <p className="text-sm text-emerald-100/80 mb-4">
                Activa tu suscripción para desbloquear beneficios exclusivos
                dentro de Digital Barter.
              </p>

              <ul className="mb-6 ml-4 list-disc space-y-1 text-sm text-emerald-100/90">
                <li>Mayor visibilidad para tus publicaciones.</li>
                <li>Acceso a reportes avanzados y métricas de impacto.</li>
                <li>Insignia especial en tu perfil y en el marketplace.</li>
              </ul>

              <button
                type="button"
                onClick={activarPremium}
                disabled={activando}
                className="rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-emerald-950 shadow hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {activando ? "Activando..." : "Convertirme en usuario Premium"}
              </button>
            </>
          )}

          {!loadingPlan && esPremium && (
            <>
              <h2 className="text-xl font-semibold mb-2">
                ¡Ya eres usuario Premium! 🌿
              </h2>
              <p className="text-sm text-emerald-100/80 mb-4">
                Tu cuenta tiene una suscripción premium activa.
              </p>

              <div className="space-y-2 text-sm text-emerald-100/90">
                <p>
                  <span className="font-semibold">Estado:</span>{" "}
                  {plan.estado || "ACTIVA"}
                </p>
                <p>
                  <span className="font-semibold">Fecha inicio:</span>{" "}
                  {formatearFecha(plan.fecha_inicio)}
                </p>
                <p>
                  <span className="font-semibold">Fecha fin:</span>{" "}
                  {formatearFecha(plan.fecha_fin)}
                </p>
                <p>
                  <span className="font-semibold">Monto:</span>{" "}
                  {plan.monto_bs != null
                    ? Number(plan.monto_bs).toFixed(2)
                    : "—"}{" "}
                  Bs
                </p>
              </div>

              <p className="mt-5 text-xs text-emerald-200/70">
                Estos datos provienen de tu última fila en la tabla{" "}
                <span className="font-mono">SUSCRIPCION_PREMIUM</span>.
              </p>
            </>
          )}

          {!loadingPlan && (esVencida || esCancelada) && !esPremium && (
            <>
              <h2 className="text-xl font-semibold mb-2">
                Tu plan premium ya no está activo
              </h2>
              <p className="text-sm text-emerald-100/80 mb-4">
                Estado actual:{" "}
                <span className="font-semibold">{plan.estado}</span>. Puedes
                activar nuevamente tu suscripción para seguir disfrutando de los
                beneficios premium.
              </p>

              <div className="space-y-2 text-sm text-emerald-100/90 mb-4">
                <p>
                  <span className="font-semibold">Último inicio:</span>{" "}
                  {formatearFecha(plan.fecha_inicio)}
                </p>
                <p>
                  <span className="font-semibold">Último fin:</span>{" "}
                  {formatearFecha(plan.fecha_fin)}
                </p>
              </div>

              <button
                type="button"
                onClick={activarPremium}
                disabled={activando}
                className="rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-emerald-950 shadow hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {activando ? "Reactivando..." : "Volver a ser usuario Premium"}
              </button>
            </>
          )}
        </section>

        {/* PANEL DERECHO: BENEFICIOS / INFO */}
        <aside className="rounded-3xl border border-emerald-700/70 bg-emerald-950/30 p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-3">¿Qué incluye Premium?</h2>
          <ul className="ml-4 list-disc space-y-2 text-sm text-emerald-100/90">
            <li>Prioridad en el listado de publicaciones del marketplace.</li>
            <li>Mayor límite para registrar actividades sostenibles al mes.</li>
            <li>Acceso a reportes especiales y estadísticas detalladas.</li>
            <li>Soporte preferencial dentro de la plataforma.</li>
          </ul>

        </aside>
      </div>
    </div>
  );
}
