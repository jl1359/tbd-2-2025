import { procesarArchivoService } from "./uploads.service.js";

export const subirArchivoController = async (req, res, next) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "No enviaste ningún archivo" });
    }

    const data = await procesarArchivoService(req.file);

    res.json({
      message: "Archivo subido correctamente",
      data,
    });
  } catch (err) {
    next(err);
  }
};
