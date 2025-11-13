import { useEffect, useState } from "react";
import { getProducts } from "@/api/products.js";
import Topbar from "@/ui/Topbar.jsx";
import Sidebar from "@/ui/Sidebar.jsx";
import Stories from "@/ui/Stories.jsx";
import TabsBar from "@/ui/TabsBar.jsx";
import ProductGrid from "@/ui/ProductGrid.jsx";

export default function Home() {
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [min, setMin] = useState(null);
  const [max, setMax] = useState(null);
  const [sort, setSort] = useState("recientes");

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);

  async function load(reset = false) {
    setLoading(true);
    const res = await getProducts({
      q: query, categories, min, max, sort,
      page: reset ? 1 : page, pageSize: 6
    });
    setItems(prev => reset ? res.items : [...prev, ...res.items]);
    setHasMore(res.hasMore);
    setLoading(false);
  }

  useEffect(()=>{ setPage(1); load(true); /* eslint-disable-next-line */ }, [query, categories, min, max, sort]);
  useEffect(()=>{ if (page>1) load(false); }, [page]);

  const toggleCat = (c) =>
    setCategories(arr => arr.includes(c) ? arr.filter(x=>x!==c) : [...arr, c]);
  const onPrice = ({min:m, max:M}) => { setMin(m); setMax(M); };
  const resetFilters = () => { setCategories([]); setMin(null); setMax(null); setQuery(""); setSort("recientes"); };

  return (
    <div className="min-h-screen bg-gray-100">
      <Topbar query={query} onQuery={setQuery} />
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 grid grid-cols-1 lg:grid-cols-[290px_1fr] gap-4">
        <Sidebar
          selectedCats={categories}
          onToggleCat={toggleCat}
          min={min}
          max={max}
          onPrice={onPrice}
          onReset={resetFilters}
        />

        <section className="space-y-4">
          <Stories />
          <TabsBar sort={sort} onChange={setSort} />
          <ProductGrid
            items={items}
            loading={loading}
            hasMore={hasMore}
            onLoadMore={()=>setPage(p=>p+1)}
          />
        </section>
      </main>
    </div>
  );
}
