import { Router } from 'express'
import { comprarPaquete } from './creditos.controller.js'
const r = Router()
r.post('/comprar', comprarPaquete)
export default r
