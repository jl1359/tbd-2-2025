// src/modules/auth/auth.routes.js
import { Router } from 'express'
import { loginDemo } from './auth.controller.js'

const router = Router()

router.post('/login', loginDemo)

export default router
