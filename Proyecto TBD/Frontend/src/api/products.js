const BASE = [
    { id:1, title:"Guantes Invernales - The North Face", place:"Cochabamba, Cercado", price:32,  category:"Textil",      chips:["Fibras naturales","Textil"], img:"https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?w=800" },
    { id:2, title:"Cámara - Sony",                      place:"Cochabamba, Cercado", price:150, category:"Electrónica", chips:["Electrónico"],             img:"https://images.unsplash.com/photo-1519183071298-a2962be96f83?w=800" },
    { id:3, title:"Conjunto casual unisex",             place:"Cochabamba, Cercado", price:280, category:"Textil",      chips:["Textil","Fibras naturales","Calzado","Cuero"], img:"https://images.unsplash.com/photo-1544441893-675973e31985?w=800" },
    { id:4, title:"Guitarra acústica",                  place:"Cercado",             price:220, category:"Instrumentos", chips:["Madera","Cuerda"], img:"https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800"},
    { id:5, title:"Taladro percutor",                   place:"Sacaba",              price:95,  category:"Herramientas", chips:["Construcción"], img:"https://images.unsplash.com/photo-1581091870634-3e09d3a7fd1b?w=800"},
    { id:6, title:"Bicicleta urbana",                   place:"Quillacollo",         price:480, category:"Vehículos",    chips:["Movilidad sostenible"], img:"https://images.unsplash.com/photo-1509395176047-4a66953fd231?w=800"},
];

const sleep = (ms)=>new Promise(r=>setTimeout(r,ms));

export async function getProducts(params) {
    const {
        q="", categories=[], min=null, max=null,
        sort="recientes", page=1, pageSize=6
    } = params ?? {};

    await sleep(300);

    let data = [...BASE];

    if (q.trim()) {
        const t = q.trim().toLowerCase();
        data = data.filter(p =>
        p.title.toLowerCase().includes(t) ||
        p.place.toLowerCase().includes(t) ||
        p.category.toLowerCase().includes(t) ||
        p.chips.join(" ").toLowerCase().includes(t)
        );
    }

    if (categories.length) data = data.filter(p => categories.includes(p.category));
    if (min != null) data = data.filter(p => p.price >= min);
    if (max != null) data = data.filter(p => p.price <= max);

    if (sort === "precio-asc")  data.sort((a,b)=>a.price-b.price);
    if (sort === "precio-desc") data.sort((a,b)=>b.price-a.price);

    const total = data.length;
    const start = (page-1)*pageSize;
    const end = start + pageSize;
    const items = data.slice(start, end);

    return { items, total, hasMore: end < total };
}
