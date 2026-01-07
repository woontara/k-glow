import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const portfolios = await prisma.portfolio.findMany();
  console.log('=== 포트폴리오 목록 ===');
  console.log(JSON.stringify(portfolios, null, 2));

  const testimonials = await prisma.testimonial.findMany();
  console.log('\n=== 고객 후기 목록 ===');
  console.log(JSON.stringify(testimonials, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
