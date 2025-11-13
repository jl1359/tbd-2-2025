const CATS = ["Vehículos","Electrónica","Artículos deportivos","Artículos para el hogar",
  "Instrumentos","Ropa","Suministros para mascotas","Decants",
  "Herramientas","Alquiler de departamentos","Servicios","Textil"];

export default function Sidebar({ selectedCats, onToggleCat, min, max, onPrice, onReset }) {
  return (
    <aside className="bg-white rounded-2xl border border-gray-200 p-4 h-max sticky top-20">
      <div className="space-y-5">
        <div>
          <p className="text-sm font-semibold">Ubicación</p>
          <div className="mt-2 overflow-hidden rounded-xl border">
            <img src="https://tile.openstreetmap.org/5/18/12.png" alt="map" className="w-full h-28 object-cover" />
          </div>
          <p className="text-xs text-gray-500 mt-1">Cochabamba · En un radio de 5km</p>
        </div>

        <div>
          <p className="text-sm font-semibold mb-2">Categorías</p>
          <ul className="space-y-1 text-sm">
            {CATS.map(c => {
              const on = selectedCats.includes(c);
              return (
                <li key={c} className="flex items-center gap-2">
                  <input type="checkbox" checked={on} onChange={()=>onToggleCat(c)} className="accent-emerald-600" />
                  <span className={on ? "text-emerald-700 font-medium" : "text-gray-700"}>{c}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold mb-2">Precio (Green Credits)</p>
          <div className="flex items-center gap-2">
            <input type="number" className="w-24 rounded-lg border px-2 py-1" placeholder="Mín" value={min ?? ""} onChange={e=>onPrice({min: e.target.value ? Number(e.target.value) : null, max})}/>
            <span>—</span>
            <input type="number" className="w-24 rounded-lg border px-2 py-1" placeholder="Máx" value={max ?? ""} onChange={e=>onPrice({min, max: e.target.value ? Number(e.target.value) : null})}/>
          </div>
        </div>

        <button onClick={onReset} className="w-full text-sm font-semibold text-emerald-700 border border-emerald-600 rounded-xl py-2 hover:bg-emerald-50">
          Limpiar filtros
        </button>
      </div>
    </aside>
  );
}
