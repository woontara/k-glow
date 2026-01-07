import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 기존 포트폴리오, 고객후기 삭제
  await prisma.portfolio.deleteMany();
  await prisma.testimonial.deleteMany();
  console.log('포트폴리오 및 고객후기 데이터 삭제 완료');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
