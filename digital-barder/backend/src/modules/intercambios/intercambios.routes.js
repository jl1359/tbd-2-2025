// src/modules/intercambios/intercambios.routes.js
import { Router } from 'express'
import { realizarIntercambio } from './intercambios.controller.js'

const router = Router()

router.post('/', realizarIntercambio)

export default router
