import { prisma } from '../../config/prisma.js'
import bcrypt from 'bcryptjs'

export async function listUsers(_req, res, next) {
  try {
    const users = await prisma.user.findMany({ orderBy: { id: 'asc' }, select: { id: true, email: true, name: true, createdAt: true } })
    res.json(users)
  } catch (e) { next(e) }
}

export async function createUser(req, res, next) {
  try {
    const { email, name, password } = req.body || {}
    if (!email || !name || !password) return res.status(400).json({ ok: false, message: 'email, name y password son requeridos' })
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ data: { email, name, passwordHash } })
    res.status(201).json({ id: user.id, email: user.email, name: user.name })
  } catch (e) { next(e) }
}
