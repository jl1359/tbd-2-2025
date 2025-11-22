import React, { useEffect, useState } from "react";
import { getReporteCreditosGeneradosVsConsumidos } from "../services/api";

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function hace30DiasISO() {
  const d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

export default function ReportesCreditosGenerados() {
  const [desde, setDesde] = useState(hace30DiasISO());
  const [hasta, setHasta] = useState(hoyISO());
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function cargar() {
    try {
      setLoading(true);
      setError("");
      const res = await getReporteCreditosGeneradosVsConsumidos({
        desde,
        hasta,
      });
      setResumen(res || null);
    } catch (e) {
      console.error(e);
      setError("Error cargando resumen de créditos");
      setResumen(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    cargar();
  }

  return (
    <div className="p-4 space-y-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            Créditos generados vs consumidos
          </h1>
          <p className="text-sm text-gray-500">
            Resumen global de créditos emitidos, gastados y saldo neto.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-wrap gap-2 items-end"
        >
          <div className="flex flex-col text-sm">
            <label className="mb-1 font-medium">Desde</label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
          <div className="flex flex-col text-sm">
            <label className="mb-1 font-medium">Hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
          <button
            type="submit"
            className="bg-emerald-600 text-white px-3 py-1.5 rounded text-sm"
          >
            {loading ? "Cargando…" : "Actualizar"}
          </button>
        </form>
      </header>

      {error && (
        <div className="bg-red-50 border-red-200 border text-red-700 text-sm px-3 py-2 rounded">
          {error}
        </div>
      )}

      <section className="border rounded p-4 bg-white text-sm">
        {resumen ? (
          <ul className="space-y-1">
            <li>
              <span className="font-semibold">Créditos generados:</span>{" "}
              {resumen.creditos_generados}
            </li>
            <li>
              <span className="font-semibold">Créditos consumidos:</span>{" "}
              {resumen.creditos_consumidos}
            </li>
            <li>
              <span className="font-semibold">Saldo neto:</span>{" "}
              {resumen.saldo_neto}
            </li>
          </ul>
        ) : (
          <p className="text-gray-500">
            Sin datos de créditos generados/consumidos para el rango.
          </p>
        )}
      </section>
    </div>
  );
}
