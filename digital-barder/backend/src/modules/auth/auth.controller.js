import { prisma } from '../../config/prisma.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function register(req, res, next) {
  try {
    const { nombre, apellido, correo, telefono, genero, fecha_nacimiento, password } = req.body || {}
    if (!nombre || !correo || !password) return res.status(400).json({ ok:false, message:'Nombre, correo y password son requeridos' })

    // crea usuario (rol por defecto COMPRADOR)
    const rol = await prisma.$queryRaw`SELECT id_rol FROM ROL WHERE nombre='COMPRADOR' LIMIT 1`
    const id_rol = rol?.[0]?.id_rol || 1

    const user = await prisma.$queryRaw`
      INSERT INTO USUARIO (id_rol, estado, nombre, apellido, correo, telefono, url_perfil)
      VALUES (${id_rol}, 'ACTIVO', ${nombre}, ${apellido || null}, ${correo}, ${telefono || null}, null)
    `

    const created = await prisma.$queryRaw`SELECT LAST_INSERT_ID() as id`
    const id_usuario = created?.[0]?.id

    // credenciales
    const hash = await bcrypt.hash(password, 10)
    await prisma.$executeRaw`INSERT INTO USUARIO_CRED (id_usuario, password_hash) VALUES (${id_usuario}, ${hash})`

    // billetera (si no existe, trigger la crea, pero lo aseguramos)
    await prisma.$executeRaw`
      INSERT IGNORE INTO BILLETERA (id_usuario, estado, saldo_creditos, saldo_bs, cuenta_bancaria)
      VALUES (${id_usuario}, 'ACTIVA', 0, 0.00, NULL)
    `

    return res.status(201).json({ ok:true, id_usuario })
  } catch (e) { next(e) }
}

export async function login(req, res, next) {
  try {
    const { correo, password } = req.body || {}
    if (!correo || !password) return res.status(400).json({ ok:false, message:'correo y password son requeridos' })

    const rows = await prisma.$queryRaw`SELECT u.id_usuario, u.nombre, u.apellido, u.correo FROM USUARIO u WHERE u.correo=${correo} LIMIT 1`
    const u = rows?.[0]
    if (!u) return res.status(401).json({ ok:false, message:'Credenciales inválidas' })

    const cred = await prisma.$queryRaw`SELECT password_hash FROM USUARIO_CRED WHERE id_usuario=${u.id_usuario} LIMIT 1`
    const okPass = cred?.[0]?.password_hash && await bcrypt.compare(password, cred[0].password_hash)
    if (!okPass) return res.status(401).json({ ok:false, message:'Credenciales inválidas' })

    const token = jwt.sign({ sub: u.id_usuario, email: u.correo }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' })
    res.json({ ok:true, token, user: u })
  } catch (e) { next(e) }
}
