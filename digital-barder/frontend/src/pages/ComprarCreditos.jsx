// frontend/src/pages/ComprarCreditos.jsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPaquetesCreditos,
  crearCompraCreditos,
  getMisCreditos,
} from "../services/api";
import { ArrowLeft, Wallet, CheckCircle } from "lucide-react";
import hoja from "../assets/hoja.png";

export default function ComprarCreditos() {
  const [paquetes, setPaquetes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [saldoActual, setSaldoActual] = useState(0);
  const [medioPago, setMedioPago] = useState("tigo");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const paqueteSeleccionado = useMemo(
    () => paquetes.find((p) => p.id_paquete === selectedId) || null,
    [paquetes, selectedId]
  );

  // Cargar saldo y paquetes
  useEffect(() => {
    async function cargarDatos() {
      try {
        setErrorMsg("");
        const [saldoRes, paquetesRes] = await Promise.all([
          getMisCreditos(),
          getPaquetesCreditos(),
        ]);

        const saldo =
          saldoRes?.data?.saldo ??
          saldoRes?.saldo ??
          0;

        const lista =
          paquetesRes?.data && Array.isArray(paquetesRes.data)
            ? paquetesRes.data
            : Array.isArray(paquetesRes)
            ? paquetesRes
            : [];

        setSaldoActual(Number(saldo) || 0);

        // Solo paquetes activos (activo = 1)
        const activos = lista.filter(
          (p) => p.activo === 1 || p.activo === true || p.activo === "1"
        );
        setPaquetes(activos);
      } catch (err) {
        console.error(err);
        setErrorMsg("No se pudieron cargar los datos de la billetera.");
      }
    }

    cargarDatos();
  }, []);

  async function handleComprar() {
    try {
      setErrorMsg("");
      setSuccessMsg("");

      if (!paqueteSeleccionado) {
        setErrorMsg("Debes seleccionar un paquete de créditos.");
        return;
      }

      setLoading(true);

      await crearCompraCreditos({
        idPaquete: paqueteSeleccionado.id_paquete,
        // por ahora dejamos idTransaccionPago null, en un futuro se integra el gateway real
        idTransaccionPago: null,
      });

      setSuccessMsg(
        `Compra realizada correctamente. Se acreditarán ${paqueteSeleccionado.cantidad_creditos} créditos a tu billetera.`
      );

      // Refrescar saldo
      try {
        const saldoRes = await getMisCreditos();
        const saldo =
          saldoRes?.data?.saldo ??
          saldoRes?.saldo ??
          0;
        setSaldoActual(Number(saldo) || 0);
      } catch (e) {
        console.warn("No se pudo refrescar el saldo luego de la compra.", e);
      }
    } catch (err) {
      console.error(err);
      const msgBackend =
        err?.message ||
        err?.response?.data?.message ||
        "Ocurrió un error al intentar registrar la compra.";
      setErrorMsg(msgBackend);
    } finally {
      setLoading(false);
    }
  }

  function handleVolver() {
    navigate("/wallet");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#04210f] via-[#06351a] to-[#041810] flex items-center justify-center px-4 py-6 text-white">
      {/* Contenedor tipo "modal" */}
      <div className="relative w-full max-w-5xl rounded-3xl bg-gradient-to-br from-[#0b3b24] via-[#0f4a2f] to-[#0a2a1c] shadow-2xl border border-emerald-500/60 overflow-hidden">
        {/* Botón volver */}
        <button
          onClick={handleVolver}
          className="absolute top-4 left-4 inline-flex items-center gap-2 text-sm text-emerald-50/80 hover:text-white hover:-translate-x-0.5 transition-transform"
        >
          <ArrowLeft size={18} />
          Volver a mi billetera
        </button>

        {/* Contenido principal */}
        <div className="px-8 pt-10 pb-6 md:px-10 md:pt-12 md:pb-8">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/70 flex items-center justify-center">
                <Wallet className="text-amber-300" size={26} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-emerald-200/80 font-semibold">
                  Mi Perfil
                </p>
                <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">
                  Obtener Créditos
                </h1>
                <p className="text-sm text-emerald-100/70">
                  Recarga tu billetera y sigue generando impacto ambiental.
                </p>
              </div>
            </div>

            {/* Saldo actual */}
            <div className="hidden sm:flex flex-col items-end bg-black/15 border border-emerald-400/40 px-4 py-3 rounded-2xl">
              <span className="text-xs uppercase tracking-[0.18em] text-emerald-200/80 font-semibold">
                SALDO ACTUAL
              </span>
              <p className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black">
                  {saldoActual.toLocaleString("es-BO")}
                </span>
                <span className="text-sm text-emerald-100/80">créditos</span>
              </p>
            </div>
          </div>

          {/* Panel principal */}
          <div className="grid grid-cols-1 lg:grid-cols-[2fr,1.2fr] gap-6">
            {/* Columna izquierda: paquetes */}
            <div className="bg-black/15 rounded-3xl border border-emerald-500/40 p-5 md:p-6">
              {/* Créditos obtenidos (según selección) */}
              <div className="mb-5">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/80 font-semibold">
                  Créditos obtenidos
                </p>
                <div className="flex items-end gap-2 mt-1">
                  <span className="text-3xl md:text-4xl font-extrabold">
                    {paqueteSeleccionado
                      ? paqueteSeleccionado.cantidad_creditos.toLocaleString(
                          "es-BO"
                        )
                      : "0"}
                  </span>
                  <span className="text-sm text-emerald-100/80 mb-1">
                    créditos
                  </span>
                </div>
                <p className="text-xs text-emerald-100/70 mt-1">
                  Selecciona un paquete para ver cuántos créditos obtendrás.
                </p>
              </div>

              {/* Recarga monedas */}
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold tracking-wide uppercase text-emerald-50">
                    Recarga Monedas
                  </h2>
                  <p className="text-xs text-emerald-100/70">
                    Elige el paquete que mejor se adapte a ti.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {paquetes.map((p) => {
                  const isSelected = p.id_paquete === selectedId;

                  return (
                    <button
                      key={p.id_paquete}
                      type="button"
                      onClick={() => setSelectedId(p.id_paquete)}
                      className={`relative flex flex-col items-center justify-between rounded-2xl border px-3 py-3 transition-all ${
                        isSelected
                          ? "border-amber-300 bg-emerald-600/70 shadow-lg shadow-amber-500/25 scale-[1.02]"
                          : "border-emerald-400/50 bg-emerald-700/40 hover:border-amber-300/80 hover:bg-emerald-600/60"
                      }`}
                    >
                      {/* Icono */} 
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-9 h-9 rounded-full bg-emerald-900/50 border border-amber-300/70 flex items-center justify-center">
                          <img src={hoja} alt="Créditos verdes" className="w-5 h-5 object-contain" />
                        </div>
                        <p className="text-base font-bold mt-1">{p.cantidad_creditos}</p>
                        <p className="text-[11px] text-emerald-100/80">{p.nombre}</p>
                      </div>

                      <div className="mt-1 text-xs font-semibold text-amber-200">
                        Bs {Number(p.precio_bs).toFixed(2)}
                      </div>
                    </button>
                  );
                })}

                {paquetes.length === 0 && (
                  <p className="col-span-full text-sm text-emerald-100/70">
                    No hay paquetes de créditos configurados en el sistema.
                  </p>
                )}
              </div>
            </div>

            {/* Columna derecha: medio de pago y resumen */}
            <div className="bg-black/20 rounded-3xl border border-emerald-500/40 flex flex-col justify-between p-5 md:p-6">
              <div>
                <h2 className="text-sm font-semibold tracking-wide uppercase text-emerald-50 mb-2">
                  Seleccione forma de pago
                </h2>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setMedioPago("tigo")}
                    className={`flex items-center gap-3 w-full rounded-2xl border px-3 py-2.5 text-left text-sm transition-all ${
                      medioPago === "tigo"
                        ? "border-amber-300 bg-emerald-700/70 shadow-md"
                        : "border-emerald-400/50 bg-emerald-800/30 hover:border-amber-200/80"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-900/70 flex items-center justify-center text-xs font-bold">
                      TM
                    </div>
                    <div>
                      <p className="font-semibold">Banca / Tigo Money</p>
                      <p className="text-xs text-emerald-100/75">
                        Pago con billeteras digitales y banca en línea.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMedioPago("qr")}
                    className={`flex items-center gap-3 w-full rounded-2xl border px-3 py-2.5 text-left text-sm transition-all ${
                      medioPago === "qr"
                        ? "border-amber-300 bg-emerald-700/70 shadow-md"
                        : "border-emerald-400/50 bg-emerald-800/30 hover:border-amber-200/80"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-900/70 flex items-center justify-center text-[10px] font-bold">
                      QR
                    </div>
                    <div>
                      <p className="font-semibold">Generar QR</p>
                      <p className="text-xs text-emerald-100/75">
                        Paga escaneando con tu app bancaria (BNB, YapE, etc.).
                      </p>
                    </div>
                  </button>
                </div>

                <div className="mt-4 text-xs text-emerald-100/70 space-y-1.5">
                  <p className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-300" />
                    Tus créditos se acreditarán automáticamente una vez
                    confirmado el pago.
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-300" />
                    Podrás ver el movimiento en tu historial de billetera.
                  </p>
                </div>
              </div>

              {/* Mensajes y botón */}
              <div className="mt-4 pt-3 border-t border-emerald-500/30">
                {errorMsg && (
                  <div className="mb-2 text-xs text-red-200 bg-red-900/40 border border-red-500/40 rounded-xl px-3 py-2">
                    {errorMsg}
                  </div>
                )}
                {successMsg && (
                  <div className="mb-2 text-xs text-emerald-50 bg-emerald-800/60 border border-emerald-300/60 rounded-xl px-3 py-2 flex gap-2">
                    <CheckCircle size={14} className="mt-[2px]" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <button
                  type="button"
                  disabled={loading || !paqueteSeleccionado}
                  onClick={handleComprar}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-[#123020] font-semibold py-2.5 text-sm shadow-lg shadow-amber-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Procesando..." : "Comprar ahora"}
                </button>

                <p className="mt-2 text-[11px] text-emerald-100/70 text-center">
                  Al continuar aceptas los términos de uso de créditos de la
                  plataforma.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
