// digital-barder/frontend/src/pages/Intercambios.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { ArrowLeft, ArrowLeftRight, ShoppingBag, Store } from "lucide-react";
import hoja from "../assets/hoja.png";

export default function Intercambios() {
  const navigate = useNavigate();

  // formulario crear intercambio
  const [idPublicacion, setIdPublicacion] = useState("");
  const [creditos, setCreditos] = useState("");
  const [creando, setCreando] = useState(false);
  const [txCreada, setTxCreada] = useState(null);
  const [errorForm, setErrorForm] = useState("");

  // listas
  const [tab, setTab] = useState("compras"); // "compras" | "ventas"
  const [compras, setCompras] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [loadingListas, setLoadingListas] = useState(false);
  const [errorListas, setErrorListas] = useState("");

  // cargar compras y ventas al entrar
  useEffect(() => {
    async function cargarListas() {
      try {
        setLoadingListas(true);
        setErrorListas("");

        const [respCompras, respVentas] = await Promise.all([
          api("/intercambios/mis-compras"),
          api("/intercambios/mis-ventas"),
        ]);

        setCompras(Array.isArray(respCompras) ? respCompras : []);
        setVentas(Array.isArray(respVentas) ? respVentas : []);
      } catch (err) {
        console.error(err);
        setErrorListas(
          err?.message || "No se pudieron cargar tus intercambios."
        );
      } finally {
        setLoadingListas(false);
      }
    }

    cargarListas();
  }, []);

  async function onCrearIntercambio(e) {
    e.preventDefault();
    setErrorForm("");
    setTxCreada(null);

    if (!idPublicacion || !creditos) {
      setErrorForm("id_publicacion y créditos son obligatorios.");
      return;
    }

    const id_pub = Number(idPublicacion);
    const cred = Number(creditos);

    if (Number.isNaN(id_pub) || Number.isNaN(cred) || cred <= 0) {
      setErrorForm("Verifica que el ID y los créditos sean válidos.");
      return;
    }

    const ok = window.confirm(
      `¿Confirmas el intercambio de ${cred} créditos por la publicación #${id_pub}?`
    );
    if (!ok) return;

    try {
      setCreando(true);

      const res = await api("/intercambios", {
        method: "POST",
        body: {
          id_publicacion: id_pub,
          creditos: cred,
        },
      });

      setTxCreada(res?.transaccion || res || null);

      // refrescar listas
      try {
        const [respCompras, respVentas] = await Promise.all([
          api("/intercambios/mis-compras"),
          api("/intercambios/mis-ventas"),
        ]);
        setCompras(Array.isArray(respCompras) ? respCompras : []);
        setVentas(Array.isArray(respVentas) ? respVentas : []);
      } catch (errInner) {
        console.warn("No se pudieron refrescar las listas:", errInner);
      }
    } catch (err) {
      console.error(err);
      setErrorForm(
        err?.message ||
          "Ocurrió un error al intentar realizar el intercambio. Revisa tu saldo o la publicación."
      );
    } finally {
      setCreando(false);
    }
  }

  function renderFila(tx) {
    const id = tx.id_transaccion || tx.id_intercambio || tx.id || null;

    const creditosTx =
      tx.creditos ??
      tx.monto_creditos ??
      tx.cantidad_creditos ??
      tx.valor_creditos ??
      "-";

    const titulo =
      tx.titulo_publicacion ??
      tx.titulo ??
      tx.publicacion ??
      `Transacción #${id || "?"}`;

    const fechaStr = tx.creado_en
      ? new Date(tx.creado_en).toLocaleString()
      : tx.fecha ||
        (tx.fecha_intercambio &&
          new Date(tx.fecha_intercambio).toLocaleString()) ||
        "";

    const contraparte =
      tx.contraparte ||
      tx.usuario_contraparte ||
      tx.comprador ||
      tx.vendedor ||
      null;

    return (
      <div
        key={id || `${titulo}-${fechaStr}`}
        className="rounded-xl border border-emerald-800/60 bg-emerald-950/60 px-4 py-3 mb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
      >
        <div>
          <p className="font-semibold text-emerald-100">{titulo}</p>
          <p className="text-xs text-emerald-100/70">
            {fechaStr || "Sin fecha registrada"}
          </p>
          {tx.estado && (
            <p className="mt-1 inline-flex items-center text-[11px] rounded-full px-2 py-0.5 border border-emerald-400/60 text-emerald-200">
              Estado: {tx.estado}
            </p>
          )}
        </div>

        <div className="text-right">
          <p className="text-sm text-emerald-100/80">
            Créditos:{" "}
            <span className="font-semibold text-emerald-300">
              {creditosTx}
            </span>
          </p>
          {contraparte && (
            <p className="text-xs text-emerald-100/70 mt-1">
              Con: {contraparte}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-emerald-50 px-4 py-6">
      {/* HEADER */}
      <header className="mb-8 flex items-center justify-between">
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
            <ArrowLeftRight size={18} className="text-emerald-300" />
            <span className="font-semibold">Intercambios</span>
          </div>
        </div>

        <img src={hoja} alt="logo" className="w-9 h-9 drop-shadow-md" />
      </header>

      {/* FORMULARIO CREAR INTERCAMBIO */}
      <section className="mb-10">
        <h1 className="text-2xl font-semibold mb-1">
          Realizar intercambio manual
        </h1>
        <p className="text-sm text-emerald-100/80 mb-4">
          Para pruebas: indica el ID de una publicación y la cantidad de
          créditos. El backend ejecutará el procedimiento de intercambio y
          actualizará tu billetera.
        </p>

        <form
          onSubmit={onCrearIntercambio}
          className="grid gap-4 md:grid-cols-[1fr_1fr_auto] items-end bg-emerald-950/60 border border-emerald-800/70 rounded-2xl px-4 py-4"
        >
          <div>
            <label className="block text-xs mb-1">
              ID publicación (id_publicacion) *
            </label>
            <input
              type="number"
              value={idPublicacion}
              onChange={(e) => setIdPublicacion(e.target.value)}
              className="w-full rounded-lg border border-emerald-700 bg-emerald-950/80 px-3 py-2 text-sm outline-none focus:ring focus:ring-emerald-500/60"
            />
          </div>

          <div>
            <label className="block text-xs mb-1">Créditos a pagar *</label>
            <input
              type="number"
              value={creditos}
              onChange={(e) => setCreditos(e.target.value)}
              className="w-full rounded-lg border border-emerald-700 bg-emerald-950/80 px-3 py-2 text-sm outline-none focus:ring focus:ring-emerald-500/60"
            />
          </div>

          <button
            type="submit"
            disabled={creando}
            className="mt-2 md:mt-0 inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-6 py-2 text-sm font-semibold text-emerald-950 shadow hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {creando ? "Procesando…" : "Realizar intercambio"}
          </button>
        </form>

        {errorForm && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorForm}
          </div>
        )}

        {txCreada && (
          <div className="mt-4 rounded-xl border border-emerald-500/70 bg-emerald-900/70 px-4 py-3 text-sm">
            <p className="font-semibold mb-1">
              Intercambio registrado correctamente ✅
            </p>
            <pre className="text-xs text-emerald-100/80 overflow-x-auto">
              {JSON.stringify(txCreada, null, 2)}
            </pre>
          </div>
        )}
      </section>

      {/* LISTAS DE COMPRAS / VENTAS */}
      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex gap-2 rounded-full bg-emerald-950/60 p-1 border border-emerald-800/80">
            <button
              type="button"
              onClick={() => setTab("compras")}
              className={`flex items-center gap-1 rounded-full px-4 py-1.5 text-xs font-medium ${
                tab === "compras"
                  ? "bg-emerald-500 text-emerald-950"
                  : "text-emerald-100 hover:bg-emerald-800/60"
              }`}
            >
              <ShoppingBag size={14} />
              Mis compras
            </button>
            <button
              type="button"
              onClick={() => setTab("ventas")}
              className={`flex items-center gap-1 rounded-full px-4 py-1.5 text-xs font-medium ${
                tab === "ventas"
                  ? "bg-emerald-500 text-emerald-950"
                  : "text-emerald-100 hover:bg-emerald-800/60"
              }`}
            >
              <Store size={14} />
              Mis ventas
            </button>
          </div>

          {loadingListas && (
            <p className="text-xs text-emerald-100/80">Cargando listas…</p>
          )}
        </div>

        {errorListas && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorListas}
          </div>
        )}

        {tab === "compras" && !errorListas && (
          <div>
            {compras.map(renderFila)}
            {compras.length === 0 && !loadingListas && (
              <p className="text-sm text-emerald-100/80">
                Aún no tienes compras registradas.
              </p>
            )}
          </div>
        )}

        {tab === "ventas" && !errorListas && (
          <div>
            {ventas.map(renderFila)}
            {ventas.length === 0 && !loadingListas && (
              <p className="text-sm text-emerald-100/80">
                Aún no tienes ventas registradas.
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
