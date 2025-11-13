import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
const prisma = new PrismaClient()

async function main() {
  const [adminRole, userRole] = await Promise.all([
    prisma.role.upsert({ where: { name: 'ADMIN' }, update: {}, create: { name: 'ADMIN' } }),
    prisma.role.upsert({ where: { name: 'USER' }, update: {}, create: { name: 'USER' } }),
  ])

  const passwordHash = await bcrypt.hash('demo123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'demo@demo.com' },
    update: {},
    create: { email: 'demo@demo.com', name: 'Admin Demo', passwordHash, roleId: adminRole.id }
  })

  await prisma.wallet.upsert({
    where: { userId: admin.id },
    update: {},
    create: { userId: admin.id, credits: 1000 }
  })

  console.log('Seed listo:', { admin: admin.email })
}

main().catch(e=>{console.error(e); process.exit(1)}).finally(()=>prisma.$disconnect())
