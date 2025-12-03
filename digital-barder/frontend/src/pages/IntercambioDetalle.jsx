import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getIntercambioDetalle } from "../services/api";
import { ArrowLeft, Info } from "lucide-react";

export default function IntercambioDetalle() {
  const { id } = useParams();
  const [detalle, setDetalle] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    try {
      const data = await getIntercambioDetalle(id);
      setDetalle(data);
    } catch (err) {
      setError(err.message || "No se pudo cargar el detalle.");
    }
  }

  return (
    <div className="min-h-screen bg-[#082b1f] text-white p-6">
      <button
        onClick={() => (window.location.href = "/intercambios")}
        className="inline-flex items-center gap-2 px-3 py-1 bg-black/30 rounded-full text-sm hover:bg-black/40"
      >
        <ArrowLeft size={16} /> Volver
      </button>

      <h1 className="text-xl font-semibold flex items-center gap-2 mt-4">
        <Info size={20} className="text-emerald-400" />
        Detalle del intercambio #{id}
      </h1>

      {error && <p className="text-red-400 mt-4">{error}</p>}

      {detalle && (
        <div className="bg-[#0f3f2d] border border-emerald-700 p-5 rounded-xl mt-4">
          <p><strong>Producto:</strong> {detalle.titulo}</p>
          <p><strong>Descripción:</strong> {detalle.descripcion}</p>
          <p><strong>Créditos usados:</strong> {detalle.creditos}</p>
          <p><strong>Estado:</strong> {detalle.estado}</p>
          <p><strong>Fecha:</strong> {new Date(detalle.fecha).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}
