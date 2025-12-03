import path from "path";

export async function procesarArchivoService(file) {
  // Ruta interna donde se guardó físicamente
  const diskPath = path.join("uploads_storage", file.filename);
  // URL pública (el frontend usará esto)
  const url = `/uploads/${file.filename}`;

  // Aquí podrías:
  // - Guardar info en BD
  // - Subir a S3 / Cloudinary
  // - Registrar logs, etc.

  return {
    url,
    path: diskPath,
    originalName: file.originalname,
    size: file.size,
    mimetype: file.mimetype,
  };
}
