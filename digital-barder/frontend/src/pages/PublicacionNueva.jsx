// digital-barder/frontend/src/pages/CrearPublicacion.jsx
import { useState } from "react";
import { api } from "../services/api";

const API_BASE_URL = "http://localhost:4000"; // o 5000, el que use tu backend

export default function CrearPublicacion() {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [valorCreditos, setValorCreditos] = useState("");
  const [preview, setPreview] = useState("");
  const [imagenUrl, setImagenUrl] = useState(""); // lo que irá a la BD
  const [subiendo, setSubiendo] = useState(false);

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    // PREVIEW local (esto ya lo tienes)
    setPreview(URL.createObjectURL(file));

    // SUBIR AL BACKEND
    const formData = new FormData();
    formData.append("archivo", file); // "archivo" debe coincidir con multer

    try {
      setSubiendo(true);

      const res = await fetch(`${API_BASE_URL}/api/upload-publicacion`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      // supongamos que devuelve { url: "...", filename: "..." }
      setImagenUrl(data.url); // o data.filename, según cómo lo manejes
    } catch (err) {
      console.error("Error subiendo imagen", err);
      alert("No se pudo subir la imagen");
    } finally {
      setSubiendo(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await api("/publicaciones", {
        method: "POST",
        body: JSON.stringify({
          titulo,
          descripcion,
          categoria,
          valor_creditos: Number(valorCreditos),
          imagen_url: imagenUrl, // ← CLAVE: esto ya viene del backend
        }),
      });

      alert("Publicación creada correctamente ✅");
    } catch (err) {
      console.error(err);
      alert("Error al crear la publicación");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <input
        type="text"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        placeholder="Título"
      />

      <textarea
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        placeholder="Descripción"
      />

      <input
        type="number"
        value={valorCreditos}
        onChange={(e) => setValorCreditos(e.target.value)}
        placeholder="Créditos"
      />

      <input type="file" accept="image/*" onChange={handleFileChange} />

      {preview && (
        <img
          src={preview}
          alt="preview"
          className="w-40 h-40 object-cover mt-2 rounded-lg"
        />
      )}

      {subiendo && <p>Subiendo imagen...</p>}

      <button type="submit">Crear publicación</button>
    </form>
  );
}
