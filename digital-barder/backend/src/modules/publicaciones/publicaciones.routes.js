import { Router } from 'express'
import { listFeed, getDetalle, buscar } from './publicaciones.controller.js'
const r = Router()
r.get('/', listFeed)
r.get('/buscar', buscar)
r.get('/:id_publicacion', getDetalle)
export default r
