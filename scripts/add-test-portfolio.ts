import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 포트폴리오 추가
  const portfolio = await prisma.portfolio.create({
    data: {
      category: 'SKINCARE',
      brand: '수오가닉',
      title: 'Wildberries 입점 및 러시아 시장 진출',
      description: '유기농 스킨케어 브랜드 수오가닉의 러시아 시장 진출 프로젝트. EAC 인증 완료 후 Wildberries 마켓플레이스 입점 성공.',
      imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=400&fit=crop',
      salesAmount: '3억+',
      productCount: '8종',
      rating: '4.7',
      gradient: 'from-[#A4B4A8] to-[#849488]',
      isActive: true,
      order: 0,
    },
  });

  console.log('포트폴리오 추가 완료:', portfolio);

  // 고객 후기 추가
  const testimonial = await prisma.testimonial.create({
    data: {
      name: '수오가닉 담당자',
      company: '수오가닉',
      content: 'K-Glow와 함께 러시아 시장 진출을 성공적으로 마쳤습니다. EAC 인증부터 마켓플레이스 입점까지 전문적인 지원에 감사드립니다.',
      gradient: 'from-[#A4B4A8] to-[#849488]',
      isActive: true,
      order: 0,
    },
  });

  console.log('고객 후기 추가 완료:', testimonial);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
