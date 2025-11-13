import { useApp } from "@/store/AppContext.jsx";

export default function ProductCard({ id, img, title, place, chips = [], price }) {
  const { favorites, toggleFav } = useApp();
  const fav = favorites.has(id);

  return (
    <article className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="relative h-44 overflow-hidden">
        <img src={img} alt={title} className="w-full h-full object-cover" />
        <button
          onClick={()=>toggleFav(id)}
          className={`absolute top-2 right-2 w-9 h-9 rounded-full grid place-items-center shadow
            ${fav ? "bg-rose-600 text-white" : "bg-white/90 text-gray-700 hover:bg-white"}`}
          title="Favorito"
        >
          {fav ? "♥" : "♡"}
        </button>
      </div>

      <div className="p-4 space-y-2">
        <div className="flex flex-wrap gap-1">
          {chips.map((c,i)=>
            <span key={i} className="text-[11px] font-semibold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {c}
            </span>
          )}
        </div>

        <h3 className="font-semibold text-gray-900 leading-snug">{title}</h3>
        <p className="text-sm text-gray-500">{place}</p>

        <div className="flex items-end justify-between pt-2">
          <div className="text-right">
            <div className="text-2xl font-extrabold leading-none">{price}</div>
            <div className="text-[11px] text-gray-500 -mt-0.5">Green Credits</div>
          </div>
          <a href="#" className="text-emerald-700 font-semibold hover:underline">
            Ver Detalle
          </a>
        </div>
      </div>
    </article>
  );
}

