import { Router } from 'express'
import { intercambiar } from './intercambios.controller.js'
const r = Router()
r.post('/', intercambiar)
export default r
