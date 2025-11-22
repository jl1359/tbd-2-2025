import React, { useEffect, useState } from "react";
import { getReporteSaldosUsuarios } from "../services/api";

export default function ReportesSaldosUsuarios() {
  const [limit, setLimit] = useState(20);
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function cargar() {
    try {
      setLoading(true);
      setError("");
      const res = await getReporteSaldosUsuarios({ limit });
      setDatos(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error(e);
      setError("Error cargando saldos de usuarios");
      setDatos([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  return (
    <div className="p-4 space-y-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Saldos de créditos por usuario</h1>
          <p className="text-sm text-gray-500">
            Top de usuarios con mayor saldo en su billetera.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 items-end text-sm">
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Top N</label>
            <input
              type="number"
              min="1"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="border rounded px-2 py-1 text-sm w-20"
            />
          </div>
          <button
            type="button"
            onClick={cargar}
            className="bg-emerald-600 text-white px-3 py-1.5 rounded text-sm"
          >
            {loading ? "Cargando…" : "Actualizar"}
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border-red-200 border text-red-700 text-sm px-3 py-2 rounded">
          {error}
        </div>
      )}

      <section>
        <div className="overflow-x-auto border rounded bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 py-1 text-left">Usuario</th>
                <th className="px-2 py-1 text-left">Correo</th>
                <th className="px-2 py-1 text-right">Saldo créditos</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((u, i) => (
                <tr key={i} className="border-t">
                  <td className="px-2 py-1">{u.nombre}</td>
                  <td className="px-2 py-1">{u.correo}</td>
                  <td className="px-2 py-1 text-right">
                    {u.saldo_creditos}
                  </td>
                </tr>
              ))}
              {datos.length === 0 && (
                <tr>
                  <td
                    className="px-2 py-2 text-center text-gray-400"
                    colSpan={3}
                  >
                    Sin datos de saldos para mostrar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
