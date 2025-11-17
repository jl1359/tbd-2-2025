// src/modules/publicaciones/publicaciones.routes.js
import { Router } from 'express'
import {
    listarPublicaciones,
    crearPublicacion,
    obtenerPublicacion,
    cambiarEstadoPublicacion,
} from './publicaciones.controller.js'

const router = Router()

router.get('/', listarPublicaciones)
router.get('/:id', obtenerPublicacion)
router.post('/', crearPublicacion)
router.patch('/:id/estado', cambiarEstadoPublicacion)

export default router
