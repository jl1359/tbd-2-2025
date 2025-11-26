// src/routes/index.js
import { Router } from 'express';

import authRoutes from '../modules/auth/auth.routes.js';
import usuariosRoutes from '../modules/usuarios/usuarios.routes.js';
import catalogosRoutes from '../modules/catalogos/catalogos.routes.js';
import walletRoutes from '../modules/wallet/wallet.routes.js';
import publicacionesRoutes from '../modules/publicaciones/publicaciones.routes.js';
import intercambiosRoutes from '../modules/intercambios/intercambios.routes.js';
import actividadesRoutes from '../modules/actividades/actividades.routes.js';
import promocionesRoutes from '../modules/promociones/promociones.routes.js';
import publicidadRoutes from '../modules/publicidad/publicidad.routes.js';
import logrosRoutes from '../modules/logros/logros.routes.js';
import premiumRoutes from '../modules/premium/premium.routes.js';
import reportesRoutes from '../modules/reportes/reportes.routes.js';
import uploadsRoutes from '../modules/uploads/uploads.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/catalogos', catalogosRoutes);
router.use('/wallet', walletRoutes);
router.use('/publicaciones', publicacionesRoutes);
router.use('/intercambios', intercambiosRoutes);
router.use('/actividades-sostenibles', actividadesRoutes);
router.use('/promociones', promocionesRoutes);
router.use('/publicidad', publicidadRoutes);
router.use('/logros', logrosRoutes);
router.use('/premium', premiumRoutes);
router.use('/reportes', reportesRoutes);
router.use('/uploads', uploadsRoutes);

export default router;
