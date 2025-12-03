import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import hoja from "../assets/hoja.png";

export default function ComprarCreditos() {
  const [paquetes, setPaquetes] = useState([]);
  const [idPaquete, setIdPaquete] = useState("");
  const [idTransaccionPago, setIdTransaccionPago] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    cargarPaquetes();
  }, []);

  async function cargarPaquetes() {
    try {
      setError("");
      const data = await api("/catalogos/paquetes-creditos");
      setPaquetes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Error cargando paquetes de créditos.");
      setPaquetes([]);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setOk("");

    const id_paquete = Number(idPaquete);
    if (!id_paquete || !idTransaccionPago.trim()) {
      setError(
        "Debes seleccionar un paquete e ingresar un código de transacción/pago."
      );
      return;
    }

    try {
      setLoading(true);
      const res = await api("/wallet/compra-creditos", {
        method: "POST",
        body: JSON.stringify({
          idPaquete: id_paquete,
          idTransaccionPago,
        }),
      });

      setOk("Compra registrada correctamente.");
      console.log("Respuesta compra créditos:", res);
      setIdTransaccionPago("");
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al registrar la compra de créditos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#082b1f] text-white p-6 md:p-10">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            className="bg-black/30 hover:bg-black/40 px-3 py-1 rounded-full text-xs"
            onClick={() => navigate(-1)}
          >
            Volver
          </button>
          <h1 className="text-2xl font-semibold text-emerald-300">
            Comprar créditos
          </h1>
        </div>
        <img src={hoja} alt="logo" className="w-9 h-9 drop-shadow-md" />
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-400 bg-red-900/40 px-4 py-2 text-sm text-red-100">
          {error}
        </div>
      )}
      {ok && (
        <div className="mb-4 rounded-md border border-emerald-500 bg-emerald-900/40 px-4 py-2 text-sm text-emerald-100">
          {ok}
        </div>
      )}

      <div className="bg-[#0f3f2d] border border-emerald-700 rounded-2xl p-4 md:p-6 shadow-lg max-w-xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Paquete */}
          <div>
            <label className="block text-xs mb-1">Paquete de créditos</label>
            <select
              value={idPaquete}
              onChange={(e) => setIdPaquete(e.target.value)}
              className="w-full rounded-lg border border-emerald-700 bg-emerald-950/80 px-3 py-2 text-sm outline-none focus:ring focus:ring-emerald-500/60"
            >
              <option value="">Selecciona un paquete</option>
              {paquetes.map((p) => (
                <option key={p.id_paquete} value={p.id_paquete}>
                  {p.nombre} - {p.cantidad_creditos} cr. - Bs {p.precio_bs}
                </option>
              ))}
            </select>
          </div>

          {/* Código transacción */}
          <div>
            <label className="block text-xs mb-1">
              Código / ID transacción de pago
            </label>
            <input
              type="text"
              value={idTransaccionPago}
              onChange={(e) => setIdTransaccionPago(e.target.value)}
              className="w-full rounded-lg border border-emerald-700 bg-emerald-950/80 px-3 py-2 text-sm outline-none focus:ring focus:ring-emerald-500/60"
              placeholder="Ej. Nro de comprobante"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-sm font-semibold text-emerald-950 disabled:opacity-60"
            >
              {loading ? "Procesando..." : "Confirmar compra"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
