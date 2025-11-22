// src/modules/reportes/reportes.routes.js
import { Router } from "express";
import {
  getUsuariosActivos,
  getUsuariosAbandonados,
  getIngresosCreditos,
  getCreditosGeneradosVsConsumidos,
  getIntercambiosPorCategoria,
  getPublicacionesVsIntercambios,
  getImpactoAcumulado,
  getRankingUsuarios,
  getUsuariosPremium,
  getUsuariosNuevos,
  getSaldosCreditos,
  getActividadesSostenibles,
  getImpactoPorCategoria,
} from "./reportes.controller.js";

const router = Router();

/*  REPORTES PRINCIPALES */

// ✔ Usuarios activos
router.get("/usuarios-activos", getUsuariosActivos);

// ✔ Usuarios abandonados
router.get("/usuarios-abandonados", getUsuariosAbandonados);

// ✔ Ingresos por venta de créditos
router.get("/ingresos-creditos", getIngresosCreditos);

// ✔ Créditos generados vs consumidos
router.get("/creditos-generados-consumidos", getCreditosGeneradosVsConsumidos);

// ✔ Intercambios por categoría
router.get("/intercambios-categoria", getIntercambiosPorCategoria);

// ✔ Publicaciones vs intercambios
router.get("/publicaciones-vs-intercambios", getPublicacionesVsIntercambios);

// ✔ Impacto ecológico acumulado
router.get("/impacto-acumulado", getImpactoAcumulado);


/* REPORTES AVANZADOS */

// ✔ Ranking de usuarios (top N)
router.get("/ranking-usuarios", getRankingUsuarios);

// ✔ Reporte de usuarios premium
router.get("/usuarios-premium", getUsuariosPremium);

// ✔ Usuarios nuevos (primer login)
router.get("/usuarios-nuevos", getUsuariosNuevos);

// ✔ Saldos de créditos (top N)
router.get("/saldos-usuarios", getSaldosCreditos);

// ✔ Actividades sostenibles
router.get("/actividades-sostenibles", getActividadesSostenibles);

// ✔ Impacto ambiental por categoría (por período)
router.get("/impacto-categoria", getImpactoPorCategoria);

export default router;
