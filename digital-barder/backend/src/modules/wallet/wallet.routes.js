// src/modules/wallet/wallet.routes.js
import { Router } from 'express'
import {
    obtenerBilleteraUsuario,
    movimientosUsuario,
} from './wallet.controller.js'

const router = Router()

// GET /api/wallet/:idUsuario
router.get('/:idUsuario', obtenerBilleteraUsuario)

// GET /api/wallet/:idUsuario/movimientos
router.get('/:idUsuario/movimientos', movimientosUsuario)

export default router
