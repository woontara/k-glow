import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123!@#', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@k-glow.com' },
    update: {},
    create: {
      email: 'admin@k-glow.com',
      password: hashedPassword,
      name: '관리자',
      role: 'ADMIN',
      companyName: 'K-Glow',
    },
  })

  console.log('Admin user created or updated:')
  console.log('Email:', admin.email)
  console.log('Password: admin123!@#')
  console.log('Role:', admin.role)
}

main()
  .catch((error) => {
    console.error('Error seeding admin:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
