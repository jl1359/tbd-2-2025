import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { ArrowLeft, Wallet, CheckCircle } from "lucide-react";

export default function ComprarCreditos() {
  const [paquetes, setPaquetes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Cargar paquetes activos
  useEffect(() => {
    async function cargarPaquetes() {
      try {
        setError("");
        setSuccess(false);
        const data = await api("/catalogos/paquetes-creditos");
        // Asumimos que el backend devuelve un array simple de paquetes
        setPaquetes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los paquetes de créditos.");
      }
    }
    cargarPaquetes();
  }, []);

  async function comprar() {
    if (!selected) {
      setError("Debes seleccionar un paquete antes de comprar.");
      return;
    }

    const ok = window.confirm(
      `¿Confirmas la compra del paquete "${selected.nombre}" por ${selected.precio_bs} Bs?`
    );
    if (!ok) return;

    try {
      setLoading(true);
      setError("");
      setSuccess(false);

      // 👇 RUTA REAL DEL BACKEND: POST /api/wallet/compra-creditos
      //    y el controlador espera { idPaquete: ... }
      await api("/wallet/compra-creditos", {
        method: "POST",
        body: {
          idPaquete: selected.id_paquete, // 👈 CAMBIO IMPORTANTE
        },
      });

      setSuccess(true);
      setSelected(null);
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "Ocurrió un error al procesar la compra de créditos."
      );
    } finally {
      setLoading(false);
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
          <ArrowLeft size={16} />
          Volver
        </button>

        <div className="flex items-center gap-2 rounded-2xl bg-emerald-900/70 px-3 py-2 text-sm">
          <Wallet size={18} className="text-emerald-300" />
          <span className="font-semibold">Compra de créditos</span>
        </div>
      </header>

      {/* TÍTULO Y DESCRIPCIÓN */}
      <section className="mb-6 text-center">
        <h1 className="text-3xl font-semibold tracking-wide">
          Paquetes de Créditos
        </h1>
        <p className="mt-2 text-sm text-emerald-100/80">
          Selecciona el paquete de créditos que quieres comprar. El pago se
          registrará en tu billetera y se reflejará en tu saldo.
        </p>
      </section>

      {/* ERRORES */}
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* PAQUETES */}
      <section className="grid gap-4 md:grid-cols-3">
        {paquetes.map((p) => (
          <article
            key={p.id_paquete}
            onClick={() => setSelected(p)}
            className={`cursor-pointer rounded-2xl border p-4 shadow-sm transition
              ${
                selected?.id_paquete === p.id_paquete
                  ? "border-emerald-400 bg-emerald-900/80"
                  : "border-emerald-800/60 bg-emerald-950/60 hover:border-emerald-500/80"
              }`}
          >
            <p className="text-xs uppercase tracking-wide text-emerald-200/80">
              {p.nombre}
            </p>

            <p className="mt-3 text-2xl font-bold">
              {p.cantidad_creditos} créditos
            </p>

            <p className="mt-4 text-lg">
              <span className="font-semibold">
                {Number(p.precio_bs).toFixed(2)}
              </span>{" "}
              Bs
            </p>

            <button
              type="button"
              className={`mt-5 w-full rounded-2xl py-2 text-sm font-semibold
                ${
                  selected?.id_paquete === p.id_paquete
                    ? "bg-emerald-400 text-emerald-950"
                    : "bg-emerald-700/80 hover:bg-emerald-600"
                }`}
            >
              {selected?.id_paquete === p.id_paquete
                ? "Seleccionado"
                : "Seleccionar"}
            </button>
          </article>
        ))}

        {paquetes.length === 0 && !error && (
          <p className="col-span-full text-center text-sm text-emerald-100/80">
            No hay paquetes de créditos activos configurados.
          </p>
        )}
      </section>

      {/* BOTÓN COMPRAR */}
      <div className="mt-10 flex justify-center">
        <button
          disabled={!selected || loading}
          onClick={comprar}
          className={`px-10 py-3 rounded-2xl text-lg font-semibold shadow-md
            ${
              !selected || loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-emerald-500 hover:bg-emerald-600"
            }`}
        >
          {loading ? "Procesando..." : "Comprar paquete seleccionado"}
        </button>
      </div>

      {/* MENSAJE DE ÉXITO */}
      {success && (
        <div className="mt-10 flex flex-col items-center text-center">
          <CheckCircle size={60} className="text-emerald-300" />
          <p className="mt-3 text-xl font-semibold">
            ¡Créditos añadidos correctamente a tu cuenta!
          </p>
        </div>
      )}
    </div>
  );
}
