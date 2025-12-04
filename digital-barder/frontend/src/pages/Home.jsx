// frontend/src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import hoja from "../assets/hoja.png";
import { api } from "../services/api";

// 🔹 nuevos imports de publicidad
import PublicidadSlot from "../components/PublicidadSlot.jsx";
import FloatingAd from "../components/FloatingAd.jsx";

export default function Home() {
  const [estado, setEstado] = useState(null);
  const [misCreditos, setMisCreditos] = useState(0);
  const [actividadReciente, setActividadReciente] = useState([]);
  const [anuncios, setAnuncios] = useState([]); // 👈 publicidad activa
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    cargarTodo();
  }, []);

  async function cargarTodo() {
    try {
      setLoading(true);
      setError("");

      // Estado API
      const estadoRes = await api("/health");
      setEstado(estadoRes);

      // Mis créditos
      const creditos = await api("/wallet/mis-creditos");
      const saldo =
        creditos?.saldo_creditos ??
        creditos?.saldo ??
        creditos?.creditos ??
        0;

      setMisCreditos(Number(saldo) || 0);

      // Movimientos recientes
      const act = await api("/wallet/mis-movimientos");
      setActividadReciente(Array.isArray(act) ? act.slice(0, 8) : []);

      // Publicidad ACTIVA (para mostrar en Home + flotante)
      const pubActivas = await api("/publicidad/activa");
      const listaPub = Array.isArray(pubActivas)
        ? pubActivas
        : pubActivas?.data || [];
      setAnuncios(listaPub);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar la información de inicio.");
    } finally {
      setLoading(false);
    }
  }

  // MISMA LÓGICA QUE EN Movimientos.jsx: NO CAMBIAMOS HUSO HORARIO
  const formatFechaMovimiento = (raw) => {
    if (!raw) return "";

    if (typeof raw === "string") {
      const clean = raw.replace("T", " ").replace("Z", "").trim();
      const [datePart, timePart] = clean.split(" ");
      if (!datePart) return raw;

      const [year, month, day] = datePart.split("-");
      if (!timePart) return `${day}/${month}/${year}`;

      const [hh, mm] = timePart.split(":");
      return `${day}/${month}/${year}, ${hh}:${mm} p. m.`; // solo reordenamos texto
    }

    const d = raw instanceof Date ? raw : new Date(raw);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString("es-BO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#082b1f] text-white">
        Cargando inicio...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#082b1f] text-white p-4 md:p-8">
      {/* HEADER */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-emerald-300">
            Bienvenido a Créditos Verdes
          </h1>
          <p className="text-sm text-emerald-100/80">
            Plataforma de economía circular y sostenibilidad.
          </p>
        </div>
        <img src={hoja} alt="logo" className="w-10 h-10 drop-shadow-lg" />
      </header>

      {/* ESTADO API + SALDO + ACCESOS */}
      <section className="grid gap-4 md:grid-cols-3 mb-6">
        <div className="bg-[#0f3f2d] rounded-xl p-5 border border-emerald-700 shadow-md">
          <p className="text-sm text-emerald-200 mb-1">Estado del sistema</p>
          <p className="text-lg font-semibold text-emerald-300">
            {estado?.ok ? "Online" : "Offline"}
          </p>
          {estado && (
            <p className="text-xs text-emerald-100/70 mt-1">
              {estado.message || ""}
            </p>
          )}
        </div>

        <div className="bg-[#0f3f2d] rounded-xl p-5 border border-emerald-700 shadow-md">
          <p className="text-sm text-emerald-200 mb-1">Mis créditos</p>
          <p className="text-3xl font-bold text-emerald-300">
            {misCreditos.toLocaleString("es-BO")}
          </p>
          <button
            onClick={() => navigate("/wallet")}
            className="mt-3 text-xs bg-emerald-500 hover:bg-emerald-600 text-emerald-950 px-3 py-1.5 rounded-lg font-semibold"
          >
            Ver mi billetera
          </button>
        </div>

        <div className="bg-[#0f3f2d] rounded-xl p-5 border border-emerald-700 shadow-md">
          <p className="text-sm text-emerald-200 mb-1">Accesos rápidos</p>
          <div className="flex flex-wrap gap-2 mt-2 text-xs">
            <button
              className="bg-emerald-600 hover:bg-emerald-500 px-3 py-1 rounded-lg"
              onClick={() => navigate("/publicaciones")}
            >
              Publicaciones
            </button>
            <button
              className="bg-emerald-600 hover:bg-emerald-500 px-3 py-1 rounded-lg"
              onClick={() => navigate("/actividades")}
            >
              Actividades
            </button>
            <button
              className="bg-emerald-600 hover:bg-emerald-500 px-3 py-1 rounded-lg"
              onClick={() => navigate("/reportes")}
            >
              Reportes
            </button>
          </div>
        </div>
      </section>

      {/* BANNER DE PUBLICIDAD EN HOME (ubicación lógica: HOME_MIDDLE) */}
      <section className="mb-6">
        <PublicidadSlot ubicacion="HOME_MIDDLE" />
      </section>

      {/* ACTIVIDAD RECIENTE */}
      <section className="bg-[#0f3f2d] rounded-xl p-5 border border-emerald-700 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-emerald-300">
            Movimientos recientes
          </h2>
          <button
            onClick={() => navigate("/wallet/movimientos")}
            className="text-xs text-emerald-200 underline"
          >
            Ver todos
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-300 mb-2">
            {error}
          </p>
        )}

        {actividadReciente.length === 0 ? (
          <p className="text-sm text-emerald-100/70">
            Aún no tienes movimientos en tu billetera.
          </p>
        ) : (
          <div className="space-y-2 text-sm">
            {actividadReciente.map((m) => {
              const fecha =
                m.creado_en || m.fecha || m.fecha_movimiento || null;

              const cantidad = m.cantidad ?? m.creditos ?? 0;
              const esIngreso = Number(cantidad) >= 0;
              const saldo = m.saldo_posterior ?? m.saldo ?? null;

              return (
                <div
                  key={m.id_movimiento || `${m.tipo_movimiento}-${fecha}`}
                  className="flex items-center justify-between border-b border-emerald-800/60 pb-2 last:border-0"
                >
                  <div>
                    <p className="font-semibold text-emerald-100">
                      {m.tipo_movimiento || "Movimiento"}
                      {m.tipo_referencia ? ` (${m.tipo_referencia})` : ""}
                    </p>
                    <p className="text-xs text-emerald-100/70">
                      {formatFechaMovimiento(fecha)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        esIngreso ? "text-emerald-300" : "text-red-300"
                      }`}
                    >
                      {esIngreso ? "+" : "-"}
                      {Math.abs(Number(cantidad)).toLocaleString("es-BO")} cr.
                    </p>
                    {saldo != null && (
                      <p className="text-[11px] text-emerald-100/60 mt-1">
                        Saldo:{" "}
                        {Number(saldo).toLocaleString("es-BO")} cr.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* OPCIONAL: OTRO SLOT DE PUBLICIDAD AL FINAL (HOME_BOTTOM) */}
      <section className="mt-6">
        <PublicidadSlot ubicacion="HOME_BOTTOM" variant="card" />
      </section>

      {/* BANNER FLOTANTE (usa TODA la publicidad activa que haya) */}
      <FloatingAd anuncios={anuncios} intervaloMs={8000} />
    </div>
  );
}
