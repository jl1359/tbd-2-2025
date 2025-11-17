// src/modules/usuarios/usuarios.routes.js
import { Router } from 'express'
import {
    listarUsuarios,
    crearUsuario,
    obtenerUsuario,
} from './usuarios.controller.js'

const router = Router()

router.get('/', listarUsuarios)
router.get('/:id', obtenerUsuario)
router.post('/', crearUsuario)

export default router
