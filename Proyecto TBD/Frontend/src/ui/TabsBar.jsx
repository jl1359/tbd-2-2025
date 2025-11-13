export default function TabsBar({ sort, onChange }) {
  const tabs = [
    {label:"Live",  value:"recientes",   icon:"🔴"},
    {label:"Fotos", value:"precio-asc",  icon:"🖼️"},
    {label:"Reel",  value:"precio-desc", icon:"🎞️"},
  ];
  return (
    <div className="bg-white rounded-2xl border border-gray-200 px-3 py-2">
      <div className="flex items-center gap-3">
        {tabs.map(t=>(
          <button
            key={t.value}
            onClick={()=>onChange(t.value)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl font-medium
              ${sort===t.value ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "hover:bg-gray-100 text-gray-700"}`}
          >
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
