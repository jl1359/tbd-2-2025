import { procesarArchivoService } from "./uploads.service.js";

export const subirArchivoController = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No enviaste ningún archivo" });
    }

    const url = await procesarArchivoService(req.file);

    res.json({
      message: "Archivo subido correctamente",
      url,
    });
  } catch (err) {
    next(err);
  }
};
