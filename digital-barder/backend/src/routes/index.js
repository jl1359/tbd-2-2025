import { Router } from 'express'
import authRoutes from '../modules/auth/auth.routes.js'
import usersRoutes from '../modules/users/users.routes.js'
import pubRoutes from '../modules/publicaciones/publicaciones.routes.js'
import walletRoutes from '../modules/wallet/wallet.routes.js'
import creditosRoutes from '../modules/creditos/creditos.routes.js'
import intercambiosRoutes from '../modules/intercambios/intercambios.routes.js'

const router = Router()
router.use('/auth', authRoutes)
router.use('/users', usersRoutes) // ya lo tienes
router.use('/publicaciones', pubRoutes)
router.use('/wallet', walletRoutes)
router.use('/creditos', creditosRoutes)
router.use('/intercambios', intercambiosRoutes)
export default router
