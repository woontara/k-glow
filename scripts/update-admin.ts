import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.update({
    where: { email: 'didwk89@gmail.com' },
    data: { role: 'ADMIN' }
  })
  console.log('Updated user:', user.email, '-> Role:', user.role)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
