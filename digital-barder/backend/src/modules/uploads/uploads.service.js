import path from "path";

export async function procesarArchivoService(file) {
  // URL pública final (ajústala según tu hosting)
  const url = `/uploads/${file.filename}`;

  // Puedes almacenar archivo en S3, Cloudinary o FS local.
  // Aquí usamos local para desarrollo.
  
  return url;
}
