import { PrismaClient, PortfolioCategory } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 테스트 포트폴리오 데이터
  const portfolios = [
    {
      brand: '수오가닉',
      brandLogoUrl: null,
      brandWebsite: 'https://suorganic.co.kr/',
      category: 'SKINCARE' as PortfolioCategory,
      title: 'Wildberries 입점 3개월 만에 뷰티 카테고리 TOP 50 진입',
      marketplaces: ['Wildberries', 'Ozon'],
      services: ['EAC 인증', '입점 대행', '상품페이지 제작', '마케팅'],
      projectYear: '2024',
      duration: '3개월',
      monthlySales: '2억+',
      productCount: '8종',
      rating: '4.7',
      achievement: '뷰티 카테고리 신규 브랜드 TOP 50 진입',
      challenge: '유기농 스킨케어 브랜드로서 러시아 시장 진출을 원했지만, EAC 인증 절차와 현지 마켓플레이스 입점 방법을 알지 못해 어려움을 겪고 있었습니다.',
      solution: 'K-Glow가 EAC 인증 대행부터 시작하여, Wildberries와 Ozon 동시 입점을 진행했습니다. 러시아어 상품페이지 제작과 현지 인플루언서 마케팅도 함께 지원했습니다.',
      results: '입점 3개월 만에 Wildberries 뷰티 카테고리 신규 브랜드 TOP 50에 진입했으며, 월 매출 2억원을 돌파했습니다. 현재 추가 제품 라인업 확장을 준비 중입니다.',
      imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800',
      gradient: 'from-[#A4B4A8] to-[#849488]',
      isActive: true,
      isFeatured: true,
      order: 1,
    },
    {
      brand: '글로우랩',
      brandLogoUrl: null,
      brandWebsite: null,
      category: 'MAKEUP' as PortfolioCategory,
      title: 'Ozon 메이크업 부문 베스트셀러 달성',
      marketplaces: ['Ozon', 'Lamoda'],
      services: ['EAC 인증', 'GOST 인증', '입점 대행', '물류 지원'],
      projectYear: '2024',
      duration: '4개월',
      monthlySales: '5억+',
      productCount: '15종',
      rating: '4.9',
      achievement: 'Ozon 메이크업 카테고리 월간 베스트셀러 1위',
      challenge: '국내에서 인기 있는 메이크업 브랜드였지만, 러시아의 복잡한 인증 체계와 물류 시스템에 대한 이해가 부족했습니다.',
      solution: 'EAC 및 GOST 인증을 동시에 진행하고, Ozon과 Lamoda 입점을 대행했습니다. 러시아 현지 물류 창고와 연계하여 빠른 배송 시스템을 구축했습니다.',
      results: '입점 4개월 만에 Ozon 메이크업 카테고리 베스트셀러 1위를 달성했습니다. 현재 월 매출 5억원 이상을 기록하고 있습니다.',
      imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800',
      gradient: 'from-[#E8B4B8] to-[#C8949A]',
      isActive: true,
      isFeatured: true,
      order: 2,
    },
    {
      brand: '네이처힐',
      brandLogoUrl: null,
      brandWebsite: null,
      category: 'HAIRCARE' as PortfolioCategory,
      title: 'Wildberries 헤어케어 신규 브랜드 1위',
      marketplaces: ['Wildberries'],
      services: ['EAC 인증', '입점 대행', '번역 서비스', '마케팅'],
      projectYear: '2023',
      duration: '2개월',
      monthlySales: '1.5억+',
      productCount: '6종',
      rating: '4.8',
      achievement: 'Wildberries 헤어케어 신규 브랜드 부문 1위',
      challenge: '국내 헤어케어 시장에서 안정적인 매출을 올리고 있었지만, 해외 시장 진출 경험이 전무했습니다.',
      solution: 'K-Glow의 원스톱 서비스를 통해 EAC 인증, 상품 번역, Wildberries 입점까지 빠르게 진행했습니다.',
      results: '입점 2개월 만에 신규 브랜드 부문 1위를 달성하고, 안정적인 월 매출을 기록하고 있습니다.',
      imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800',
      gradient: 'from-[#D4C4A8] to-[#B4A488]',
      isActive: true,
      isFeatured: false,
      order: 3,
    },
  ];

  // 테스트 고객 후기 데이터
  const testimonials = [
    {
      name: '김대표',
      company: '수오가닉',
      content: 'K-Glow 덕분에 복잡한 러시아 인증 절차를 쉽게 해결할 수 있었습니다. 특히 현지 마케팅 지원까지 받을 수 있어서 정말 만족스러웠습니다.',
      gradient: 'from-[#A4B4A8] to-[#849488]',
      isActive: true,
      order: 1,
    },
    {
      name: '이이사',
      company: '글로우랩',
      content: '처음에는 러시아 시장이 막막했는데, K-Glow의 체계적인 지원 덕분에 예상보다 빠르게 좋은 성과를 낼 수 있었습니다. 강력 추천합니다!',
      gradient: 'from-[#E8B4B8] to-[#C8949A]',
      isActive: true,
      order: 2,
    },
    {
      name: '박팀장',
      company: '네이처힐',
      content: '인증부터 입점까지 원스톱으로 진행해주셔서 내부 리소스 부담이 크게 줄었습니다. 전문적인 지식과 빠른 대응에 감사드립니다.',
      gradient: 'from-[#D4C4A8] to-[#B4A488]',
      isActive: true,
      order: 3,
    },
  ];

  console.log('기존 데이터 삭제 중...');
  await prisma.portfolio.deleteMany();
  await prisma.testimonial.deleteMany();

  console.log('포트폴리오 데이터 추가 중...');
  for (const portfolio of portfolios) {
    await prisma.portfolio.create({ data: portfolio });
  }

  console.log('고객 후기 데이터 추가 중...');
  for (const testimonial of testimonials) {
    await prisma.testimonial.create({ data: testimonial });
  }

  console.log('시드 데이터 추가 완료!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
