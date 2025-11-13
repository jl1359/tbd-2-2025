import { Router } from 'express'
import { getSaldo } from './wallet.controller.js'

const r = Router()
r.get('/me/:id_usuario', getSaldo)

export default r
