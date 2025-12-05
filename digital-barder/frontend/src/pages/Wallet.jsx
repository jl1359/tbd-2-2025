// src/pages/Wallet.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import hoja from "../assets/hoja.png";

export default function Wallet() {
  const [saldo, setSaldo] = useState(0);
  const [bloqueado, setBloqueado] = useState(0);
  const [movimientos, setMovimientos] = useState([]);
  const [pendientesComprador, setPendientesComprador] = useState([]);
  const [pendientesVendedor, setPendientesVendedor] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [operando, setOperando] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      setCargando(true);
      setError("");

      const [resCreditos, resMovs, resCompras, resVentas] = await Promise.all([
        api("/wallet/mis-creditos"),
        api("/wallet/mis-movimientos"),
        api("/intercambios/mis-compras"),
        api("/intercambios/mis-ventas"),
      ]);

      const saldoDisponible =
        resCreditos?.saldo_creditos ??
        resCreditos?.saldo ??
        resCreditos?.creditos ??
        0;

      const saldoBloqueado =
        resCreditos?.saldo_bloqueado ??
        resCreditos?.bloqueado ??
        0;

      setSaldo(saldoDisponible);
      setBloqueado(saldoBloqueado);

      setMovimientos(Array.isArray(resMovs) ? resMovs.slice(0, 10) : []);

      const compras = Array.isArray(resCompras) ? resCompras : [];
      const ventas = Array.isArray(resVentas) ? resVentas : [];

      setPendientesComprador(
        compras.filter((t) => t.estado === "SOLICITADA")
      );
      setPendientesVendedor(
        ventas.filter((t) => t.estado === "SOLICITADA")
      );
    } catch (err) {
      console.error("Error cargando billetera:", err);
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Error al cargar la información de la billetera."
      );
    } finally {
      setCargando(false);
    }
  }

  async function confirmarIntercambio(idTransaccion) {
    try {
      setOperando(true);
      setError("");
      await api(`/intercambios/${idTransaccion}/confirmar`, {
        method: "POST",
      });
      await cargarDatos();
    } catch (err) {
      console.error("Error confirmando intercambio:", err);
      setError(
        err?.response?.data?.message ||
          err.message ||
          "No se pudo confirmar el intercambio."
      );
    } finally {
      setOperando(false);
    }
  }

  async function cancelarIntercambio(idTransaccion) {
    try {
      setOperando(true);
      setError("");
      await api(`/intercambios/${idTransaccion}/cancelar`, {
        method: "POST",
      });
      await cargarDatos();
    } catch (err) {
      console.error("Error cancelando intercambio:", err);
      setError(
        err?.response?.data?.message ||
          err.message ||
          "No se pudo cancelar el intercambio."
      );
    } finally {
      setOperando(false);
    }
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#082b1f] text-white flex items-center justify-center">
        Cargando billetera...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#082b1f] text-white p-6 md:p-10">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-8">
        <img src={hoja} alt="logo" className="w-10 h-10 drop-shadow-lg" />
        <h1 className="text-3xl font-bold text-emerald-400">Mi Billetera</h1>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-4 rounded-md border border-red-400 bg-red-900/40 px-4 py-2 text-sm text-red-100">
          {error}
        </div>
      )}

      {/* TARJETAS RESUMEN */}
      <div className="grid gap-6 md:grid-cols-3 mb-10">
        {/* Créditos disponibles */}
        <div className="rounded-2xl border border-emerald-700 bg-[#0f3f2d] p-6 shadow-lg">
          <p className="text-emerald-200 text-sm mb-2">Créditos disponibles</p>
          <p className="text-4xl font-bold text-emerald-300">{saldo}</p>
          <p className="text-xs text-emerald-100/70 mt-2">
            Créditos que puedes usar ahora mismo para compras, intercambios o
            publicidad.
          </p>
        </div>

        {/* Créditos retenidos + info */}
        <div className="rounded-2xl border border-emerald-700 bg-[#0f3f2d] p-6 shadow-lg flex flex-col justify-between">
          <div>
            <p className="text-emerald-200 text-sm mb-2">Créditos retenidos</p>
            <p className="text-4xl font-bold text-amber-300">{bloqueado}</p>
            <p className="text-xs text-emerald-100/70 mt-2">
              Créditos reservados por intercambios o campañas de publicidad en
              curso. Se liberan al confirmar o cancelar las operaciones.
            </p>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="rounded-2xl border border-emerald-700 bg-[#0f3f2d] p-6 shadow-lg flex flex-col justify-between">
          <div>
            <p className="text-emerald-200 text-sm mb-2">Acciones rápidas</p>
            <p className="text-xs text-emerald-100/80 mb-3">
              Compra créditos, revisa movimientos o historial de compras.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              className="bg-emerald-500 hover:bg-emerald-600 text-emerald-950 px-3 py-1.5 rounded-lg font-semibold"
              onClick={() => navigate("/wallet/compra-creditos")}
            >
              Comprar créditos
            </button>
            <button
              className="bg-emerald-500 hover:bg-emerald-600 text-emerald-950 px-3 py-1.5 rounded-lg font-semibold"
              onClick={() => navigate("/wallet/movimientos")}
            >
              Ver movimientos
            </button>
            <button
              className="bg-emerald-500 hover:bg-emerald-600 text-emerald-950 px-3 py-1.5 rounded-lg font-semibold"
              onClick={() => navigate("/wallet/historial-compras")}
            >
              Historial de compras
            </button>
          </div>
        </div>
      </div>

      {/* PANEL DE INTERCAMBIOS PENDIENTES (RETENCIÓN) */}
      {(pendientesComprador.length > 0 || pendientesVendedor.length > 0) && (
        <section className="bg-[#0f3f2d] rounded-2xl border border-amber-600 p-6 shadow-lg mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-amber-300">
              Intercambios con créditos retenidos
            </h2>
            {operando && (
              <span className="text-[11px] text-amber-200">
                Procesando acción...
              </span>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2 text-sm">
            {/* Como COMPRADOR: puedo cancelar para recuperar créditos */}
            <div>
              <h3 className="font-semibold text-emerald-200 mb-2">
                Como comprador (puedes cancelar)
              </h3>
              {pendientesComprador.length === 0 ? (
                <p className="text-xs text-emerald-100/70">
                  No tienes intercambios pendientes como comprador.
                </p>
              ) : (
                <div className="space-y-2">
                  {pendientesComprador.map((t) => (
                    <div
                      key={t.id_transaccion}
                      className="flex items-center justify-between border border-emerald-800/70 rounded-xl px-3 py-2"
                    >
                      <div className="mr-2">
                        <p className="font-semibold text-emerald-100">
                          {t.titulo || "Intercambio"}
                        </p>
                        <p className="text-[11px] text-emerald-100/70">
                          #{t.id_transaccion} · {t.cantidad_creditos} cr. ·{" "}
                          {new Date(t.creado_en).toLocaleString()}
                        </p>
                      </div>
                      <button
                        disabled={operando}
                        onClick={() => cancelarIntercambio(t.id_transaccion)}
                        className="text-xs bg-red-500 hover:bg-red-600 disabled:bg-red-900/60 text-white px-3 py-1.5 rounded-lg font-semibold"
                      >
                        Cancelar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Como VENDEDOR: puedo aceptar para recibir créditos */}
            <div>
              <h3 className="font-semibold text-emerald-200 mb-2">
                Como vendedor (puedes aceptar)
              </h3>
              {pendientesVendedor.length === 0 ? (
                <p className="text-xs text-emerald-100/70">
                  No tienes intercambios pendientes como vendedor.
                </p>
              ) : (
                <div className="space-y-2">
                  {pendientesVendedor.map((t) => (
                    <div
                      key={t.id_transaccion}
                      className="flex items-center justify-between border border-emerald-800/70 rounded-xl px-3 py-2"
                    >
                      <div className="mr-2">
                        <p className="font-semibold text-emerald-100">
                          {t.titulo || "Intercambio"}
                        </p>
                        <p className="text-[11px] text-emerald-100/70">
                          #{t.id_transaccion} · {t.cantidad_creditos} cr. ·{" "}
                          {new Date(t.creado_en).toLocaleString()}
                        </p>
                      </div>
                      <button
                        disabled={operando}
                        onClick={() => confirmarIntercambio(t.id_transaccion)}
                        className="text-xs bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-900/60 text-emerald-950 px-3 py-1.5 rounded-lg font-semibold"
                      >
                        Aceptar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* LISTA MOVIMIENTOS RECIENTES */}
      <section className="bg-[#0f3f2d] rounded-2xl border border-emerald-700 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-emerald-300">
            Movimientos recientes
          </h2>
          <button
            className="text-xs text-emerald-200 underline"
            onClick={() => navigate("/wallet/movimientos")}
          >
            Ver todos
          </button>
        </div>

        {movimientos.length === 0 ? (
          <p className="text-sm text-emerald-100/70 mt-2">
            Aún no tienes movimientos registrados.
          </p>
        ) : (
          <div className="mt-3 space-y-3 text-sm">
            {movimientos.map((m) => {
              const fecha =
                m.creado_en || m.fecha || m.fecha_movimiento || null;

              const esNegativo =
                m.signo_mov === "NEGATIVO" ||
                m.tipo_movimiento?.includes("OUT") ||
                m.tipo_movimiento?.includes("NEGATIVO");

              const cantidad = m.cantidad ?? m.creditos ?? 0;

              return (
                <div
                  key={m.id_movimiento}
                  className="flex items-center justify-between border-b border-emerald-800/70 pb-2 last:border-0"
                >
                  <div>
                    <p className="font-semibold text-emerald-100">
                      {m.tipo_movimiento || "Movimiento"}
                      {m.tipo_referencia ? ` (${m.tipo_referencia})` : ""}
                    </p>
                    <p className="text-[11px] text-emerald-100/70">
                      {fecha ? new Date(fecha).toLocaleString() : ""}
                    </p>
                  </div>

                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        esNegativo ? "text-red-300" : "text-emerald-300"
                      }`}
                    >
                      {esNegativo ? "-" : "+"} {cantidad} cr.
                    </p>
                    <p className="text-[11px] text-emerald-100/60 mt-1">
                      Saldo: {m.saldo_posterior ?? m.saldo ?? "-"} cr.
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
