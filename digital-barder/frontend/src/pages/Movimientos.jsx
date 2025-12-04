// frontend/src/pages/Movimientos.jsx
import { useEffect, useState } from "react";
import { getMisMovimientos } from "../services/api";
import hoja from "../assets/hoja.png";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Movimientos() {
  const [movimientos, setMovimientos] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function cargar() {
      try {
        setErrorMsg("");
        const res = await getMisMovimientos();

        const lista =
          res?.data && Array.isArray(res.data)
            ? res.data
            : Array.isArray(res)
            ? res
            : [];

        setMovimientos(lista);
      } catch (err) {
        console.error(err);
        setErrorMsg("No se pudieron cargar los movimientos de la billetera.");
      }
    }
    cargar();
  }, []);

  // Formatear fecha sin tocar zona horaria (coincide con lo que sale en MySQL)
  const formatFecha = (raw) => {
    if (!raw) return "—";

    // Si viene como string tipo "2025-12-02T19:17:00.000Z" o "2025-12-02 19:17:00"
    if (typeof raw === "string") {
      const clean = raw.replace("T", " ").replace("Z", "").trim();
      const [datePart, timePart] = clean.split(" ");

      if (!datePart) return raw;

      const [year, month, day] = datePart.split("-");

      if (!timePart) {
        return `${day}/${month}/${year}`;
      }

      const [hh, mm] = timePart.split(":");

      // No convertimos nada, solo reordenamos el texto
      return `${day}/${month}/${year}, ${hh}:${mm} h`;
    }

    // Fallback por si llega un Date
    const d = raw instanceof Date ? raw : new Date(raw);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("es-BO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-[#082b1f] min-h-screen p-4 sm:p-6">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/wallet")}
          className="flex items-center gap-1 text-emerald-300 hover:text-emerald-100 transition"
        >
          <ArrowLeft size={20} />
          Volver
        </button>

        <h1 className="text-2xl font-bold text-emerald-300">
          Historial de movimientos de créditos
        </h1>
      </div>

      {errorMsg && (
        <div className="mb-3 text-sm text-red-200 bg-red-900/40 border border-red-700 rounded-lg px-3 py-2">
          {errorMsg}
        </div>
      )}

      <div className="rounded-xl bg-[#E9FFD9] shadow-md border border-[#c5f0b8] overflow-hidden">
        {/* ENCABEZADO TABLA */}
        <div className="bg-[#038547] text-white font-semibold grid grid-cols-4 py-3 px-4 border-b border-[#026636] text-sm">
          <span>Fecha</span>
          <span>Descripción</span>
          <span className="text-right">Créditos</span>
          <span className="text-right">Tipo</span>
        </div>

        {/* CUERPO TABLA */}
        <div>
          {movimientos.length === 0 ? (
            <p className="text-sm text-gray-700 p-4">
              Aún no tienes movimientos registrados en tu billetera.
            </p>
          ) : (
            movimientos.map((m, idx) => {
              const fecha = m.creado_en || m.fecha || m.fecha_movimiento;
              const tipoRaw = m.tipo_movimiento || "Movimiento";
              const tipoMayus = String(tipoRaw).toUpperCase();
              const ref = m.tipo_referencia || "Sin detalle";

              // Normalizamos la cantidad
              let cantidadNum = Number(m.cantidad);
              if (Number.isNaN(cantidadNum)) cantidadNum = 0;

              // Detectamos si lógicamente es un retiro/egreso
              const esRetiroLogico =
                tipoMayus.includes("RETIRO") ||
                tipoMayus.includes("EGRESO") ||
                tipoMayus.includes("COMPRA") ||
                tipoMayus.includes("INTERCAMBIO");

              // Si el backend manda retiros como positivo, aquí lo forzamos a egreso
              let esIngreso = cantidadNum > 0;
              if (esRetiroLogico) {
                esIngreso = false;
              }

              const montoMostrar = Math.abs(cantidadNum);
              const signo = esIngreso ? "+" : "-";

              const saldo = m.saldo_posterior ?? null;

              return (
                <div
                  key={idx}
                  className="grid grid-cols-4 items-center px-4 py-3 border-b border-[#c5f0b8] hover:bg-[#d9ffc9] transition"
                >
                  {/* FECHA */}
                  <span className="text-gray-800 text-sm">
                    {formatFecha(fecha)}
                  </span>

                  {/* DESCRIPCIÓN */}
                  <span className="flex items-start gap-2 text-sm text-gray-800">
                    <img
                      src={hoja}
                      alt="icono"
                      className="w-4 h-4 mt-[3px]"
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold">{tipoRaw}</span>
                      <span className="text-gray-600 text-xs">{ref}</span>
                    </div>
                  </span>

                  {/* CRÉDITOS */}
                  <span
                    className={`text-right font-bold ${
                      esIngreso ? "text-emerald-700" : "text-red-600"
                    }`}
                  >
                    {signo}
                    {montoMostrar.toLocaleString("es-BO")}
                  </span>

                  {/* TIPO / SALDO */}
                  <span className="text-right text-sm text-gray-800 flex flex-col items-end">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        esIngreso
                          ? "bg-[#B6E4A3] text-[#013726]"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {esIngreso ? "Ingreso" : "Egreso"}
                    </span>

                    {saldo !== null && (
                      <span className="text-[11px] text-gray-600 mt-1">
                        Saldo: {Number(saldo).toLocaleString("es-BO")}
                      </span>
                    )}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
