import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import routes from './routes/index.js'
import { errorHandler } from './middlewares/errorHandler.js'

const app = express()
app.use(helmet())
app.use(cors({ origin: (process.env.CORS_ORIGIN||'*').split(',').map(s=>s.trim()), credentials: false }))
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ ok: true, env: process.env.NODE_ENV || 'dev' }))
app.use('/api', routes)

app.use(errorHandler)
export default app
