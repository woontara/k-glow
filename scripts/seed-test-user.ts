import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('Test123456!', 10)

  const testUser = await prisma.user.upsert({
    where: { email: 'test@kglow.com' },
    update: {},
    create: {
      email: 'test@kglow.com',
      password: hashedPassword,
      name: 'Test User',
      role: 'BRAND',
      companyName: 'Test Company',
    },
  })

  console.log('Test user created or updated:')
  console.log('Email:', testUser.email)
  console.log('Password: Test123456!')
  console.log('Role:', testUser.role)
  console.log('\nThis user is required for calculator tests in Group 1 and Group 3.')
}

main()
  .catch((error) => {
    console.error('Error seeding test user:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
