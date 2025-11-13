const people = [
  "https://i.pravatar.cc/80?img=11","https://i.pravatar.cc/80?img=12",
  "https://i.pravatar.cc/80?img=13","https://i.pravatar.cc/80?img=14",
  "https://i.pravatar.cc/80?img=15","https://i.pravatar.cc/80?img=16",
  "https://i.pravatar.cc/80?img=17","https://i.pravatar.cc/80?img=18",
];

export default function Stories() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-3">
      <div className="flex gap-4 overflow-x-auto no-scrollbar">
        {people.map((src,i)=>(
          <button key={i} className="shrink-0 flex flex-col items-center">
            <span className="p-[2px] rounded-full bg-gradient-to-tr from-emerald-500 to-lime-500">
              <img src={src} className="w-14 h-14 rounded-full border-2 border-white object-cover" />
            </span>
            <span className="text-xs text-gray-700 mt-1">Usuario {i+1}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
