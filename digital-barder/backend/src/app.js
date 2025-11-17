// src/app.js
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import apiRouter from './routes/index.js'
import { errorHandler } from './middlewares/errorHandler.js'

const app = express()

app.use(helmet())
app.use(cors({ origin: true }))
app.use(express.json())
app.use(morgan('dev'))

app.get('/api/health', (_req, res) => {
    res.json({ ok: true })
})

app.use('/api', apiRouter)

// middleware de errores al final
app.use(errorHandler)

export default app
