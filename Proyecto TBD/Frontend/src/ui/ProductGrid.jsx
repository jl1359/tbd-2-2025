import ProductCard from "@/ui/ProductCard.jsx";

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 animate-pulse h-[320px]"></div>
  );
}

export default function ProductGrid({ items, loading, onLoadMore, hasMore }) {
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map(p => <ProductCard key={p.id} {...p} />)}
        {loading && Array.from({length:3}).map((_,i)=><SkeletonCard key={`s${i}`} />)}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={onLoadMore}
            className="rounded-full bg-gray-900 text-white text-sm font-semibold px-4 py-2 hover:bg-gray-800"
          >
            Cargar más
          </button>
        </div>
      )}
    </div>
  );
}
