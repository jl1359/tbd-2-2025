// src/modules/reportes/reportes.routes.js
import { Router } from 'express'
import {
    getUsuariosActivos,
    getUsuariosAbandonados,
    getIngresosCreditos,
    getCreditosGeneradosVsConsumidos,
    getIntercambiosPorCategoria,
    getPublicacionesVsIntercambios,
    getImpactoAcumulado,
} from './reportes.controller.js'

const router = Router()

router.get('/usuarios-activos', getUsuariosActivos)
router.get('/usuarios-abandonados', getUsuariosAbandonados)
router.get('/ingresos-creditos', getIngresosCreditos)
router.get('/creditos-generados-consumidos', getCreditosGeneradosVsConsumidos)
router.get('/intercambios-categoria', getIntercambiosPorCategoria)
router.get('/publicaciones-vs-intercambios', getPublicacionesVsIntercambios)
router.get('/impacto-acumulado', getImpactoAcumulado)

export default router
