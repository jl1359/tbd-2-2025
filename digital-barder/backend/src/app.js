// src/app.js

// 🔧 Parche global para que JSON.stringify soporte BigInt en todas las respuestas
if (typeof BigInt !== "undefined" && !BigInt.prototype.toJSON) {
  // eslint-disable-next-line no-extend-native
  BigInt.prototype.toJSON = function () {
    return Number(this);
  };
}

import express from "express";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";

import path from "path";
import { fileURLToPath } from "url";

const app = express();

// Necesario para rutas absolutas (uploads y archivos estáticos)
// 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares globales

app.use(cors());                // permitir peticiones de tu frontend
app.use(morgan("dev"));         // logs en consola
app.use(express.json());        // permite JSON en body
app.use(express.urlencoded({ extended: true })); // formularios


// Servir archivos estáticos (subidas de imágenes)
// Ruta final: http://localhost:4000/uploads/<nombre-archivo>

app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "uploads_storage"))
);

// Registrar todas las rutas del backend

app.use("/api", routes);

// Middleware para rutas no encontradas

app.use((req, res, next) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

// Middleware global de manejo de errores
// (Siempre debe ir al final)
app.use(errorHandler);

export default app;
