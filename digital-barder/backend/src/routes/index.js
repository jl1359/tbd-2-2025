// src/routes/index.js
import { Router } from 'express'
import authRoutes from '../modules/auth/auth.routes.js'
import usuariosRoutes from '../modules/usuarios/usuarios.routes.js'
import publicacionesRoutes from '../modules/publicaciones/publicaciones.routes.js'
import walletRoutes from '../modules/wallet/wallet.routes.js'
import creditosRoutes from '../modules/creditos/creditos.routes.js'
import intercambiosRoutes from '../modules/intercambios/intercambios.routes.js'
import reportesRoutes from '../modules/reportes/reportes.routes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/usuarios', usuariosRoutes)
router.use('/publicaciones', publicacionesRoutes)
router.use('/wallet', walletRoutes)
router.use('/creditos', creditosRoutes)
router.use('/intercambios', intercambiosRoutes)
router.use('/reportes', reportesRoutes)

export default router
