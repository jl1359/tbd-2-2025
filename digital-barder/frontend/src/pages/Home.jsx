import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { getSaldo } from "../services/wallet";
import { getFeed, search } from "../services/publicaciones";

export default function Home() {
  const [saldo, setSaldo] = useState(null);
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const idUsuarioDemo = 1; // TODO: tomar del JWT

  useEffect(() => {
    getSaldo(idUsuarioDemo).then(r => setSaldo(r.saldo_creditos)).catch(()=>setSaldo(null));
    getFeed().then(setItems).catch(()=>setItems([]));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!q) return;
      search(q).then(setItems).catch(()=>{});
    }, 350);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-4">
        <input
          className="border rounded px-3 py-2 w-full max-w-xl"
          placeholder="¿Qué quieres comprar?"
          value={q}
          onChange={(e)=>setQ(e.target.value)}
        />
        <div className="ml-4 rounded border px-3 py-2 bg-white">
          <span className="text-xs text-gray-500">GRC</span>{" "}
          <b>{saldo ?? "—"}</b>
        </div>
      </div>

      {!items?.length ? (
        <div className="text-sm text-gray-600">Sin resultados.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((card) => (
            <article key={card.id_publicacion} className="bg-white rounded-2xl border p-3 shadow-sm hover:shadow-md transition">
              {card.imagen_url && (
                <img src={card.imagen_url} alt={card.titulo} className="rounded mb-2 w-full object-cover max-h-52"/>
              )}
              <div className="text-xs text-gray-500">{card.categoria || "—"} · {card.ciudad || "—"}</div>
              <h3 className="font-semibold">{card.titulo}</h3>
              <div className="mt-1 text-sm">{card.valor_creditos} Green Credits</div>
              <a className="mt-2 inline-block text-sm" href={`/detalle/${card.id_publicacion}`}>Ver Detalle</a>
            </article>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
