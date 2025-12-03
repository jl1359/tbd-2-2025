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
    <div className="bg-[#f4faf7] min-h-screen p-4 sm:p-6">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/wallet")}
          className="flex items-center gap-1 text-emerald-700 hover:text-emerald-900 transition"
        >
          <ArrowLeft size={20} />
          Volver
        </button>

        <h1 className="text-2xl font-bold text-emerald-900">
          Historial de movimientos de créditos
        </h1>
      </div>

      {errorMsg && (
        <div className="mb-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg px-3 py-2">
          {errorMsg}
        </div>
      )}

      <div className="rounded-xl bg-white shadow-md border border-emerald-100 overflow-hidden">
        {/* ENCABEZADO TABLA */}
        <div className="bg-emerald-50 text-emerald-900 font-semibold grid grid-cols-4 py-3 px-4 border-b border-emerald-100 text-sm">
          <span>Fecha</span>
          <span>Descripción</span>
          <span className="text-right">Créditos</span>
          <span className="text-right">Tipo</span>
        </div>

        {/* CUERPO TABLA */}
        <div>
          {movimientos.length === 0 ? (
            <p className="text-sm text-gray-600 p-4">
              Aún no tienes movimientos registrados en tu billetera.
            </p>
          ) : (
            movimientos.map((m, idx) => {
              const fecha = m.creado_en || m.fecha || m.fecha_movimiento;
              const tipo = m.tipo_movimiento || "Movimiento";
              const ref = m.tipo_referencia || "Sin detalle";
              const cantidad = Number(m.cantidad) || 0;
              const esIngreso = cantidad >= 0;
              const saldo = m.saldo_posterior ?? null;

              return (
                <div
                  key={idx}
                  className="grid grid-cols-4 items-center px-4 py-3 border-b border-emerald-100 hover:bg-emerald-50/40 transition"
                >
                  {/* FECHA */}
                  <span className="text-gray-700 text-sm">
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
                      <span className="font-semibold">{tipo}</span>
                      <span className="text-gray-500 text-xs">{ref}</span>
                    </div>
                  </span>

                  {/* CRÉDITOS */}
                  <span
                    className={`text-right font-bold ${
                      esIngreso ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {esIngreso ? "+" : "-"}
                    {Math.abs(cantidad).toLocaleString("es-BO")}
                  </span>

                  {/* TIPO / SALDO */}
                  <span className="text-right text-sm text-gray-700 flex flex-col items-end">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        esIngreso
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {esIngreso ? "Ingreso" : "Egreso"}
                    </span>

                    {saldo !== null && (
                      <span className="text-[11px] text-gray-500 mt-1">
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
