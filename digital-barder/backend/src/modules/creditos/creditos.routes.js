// src/modules/creditos/creditos.routes.js
import { Router } from 'express'
import {
    listarPaquetesCreditos,
    comprarPaqueteCreditos,
} from './creditos.controller.js'

const router = Router()

router.get('/paquetes', listarPaquetesCreditos)
router.post('/comprar', comprarPaqueteCreditos)

export default router
