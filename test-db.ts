// 데이터베이스 연결 테스트 스크립트
// 실행: npx tsx test-db.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 데이터베이스 연결 테스트 시작...\n');

  // 1. 테스트 사용자 생성
  console.log('1️⃣ 테스트 사용자 생성...');
  const user = await prisma.user.create({
    data: {
      email: 'test@k-glow.com',
      name: '테스트 사용자',
      role: 'BRAND',
      companyName: 'K-Glow 테스트',
    },
  });
  console.log('✅ 사용자 생성 완료:', user.name);

  // 2. 테스트 파트너사 생성
  console.log('\n2️⃣ 테스트 파트너사 생성...');
  const partner = await prisma.partner.create({
    data: {
      name: '뷰티브랜드',
      nameRu: 'Бьюти Бренд',
      websiteUrl: 'https://example.com',
      description: '한국의 우수한 화장품 브랜드',
      descriptionRu: 'Отличный корейский косметический бренд',
      marketScore: 85,
    },
  });
  console.log('✅ 파트너사 생성 완료:', partner.name);

  // 3. 테스트 제품 생성
  console.log('\n3️⃣ 테스트 제품 생성...');
  const product = await prisma.product.create({
    data: {
      partnerId: partner.id,
      name: '수분 세럼',
      nameRu: 'Увлажняющая сыворотка',
      category: '스킨케어',
      price: 35000,
      priceRub: 3500,
      ingredients: ['히알루론산', '나이아신아마이드'], // JSON으로 자동 변환
      ingredientsRu: ['Гиалуроновая кислота', 'Ниацинамид'],
      description: '피부에 수분을 공급하는 세럼',
      descriptionRu: 'Сыворотка, увлажняющая кожу',
      imageUrls: ['https://example.com/image1.jpg'],
    },
  });
  console.log('✅ 제품 생성 완료:', product.name);

  // 4. 데이터 조회
  console.log('\n4️⃣ 전체 데이터 조회...');
  const allUsers = await prisma.user.findMany();
  const allPartners = await prisma.partner.findMany({
    include: { products: true },
  });

  console.log(`\n📊 통계:`);
  console.log(`- 사용자: ${allUsers.length}명`);
  console.log(`- 파트너사: ${allPartners.length}개`);
  console.log(`- 제품: ${allPartners.reduce((sum, p) => sum + p.products.length, 0)}개`);

  console.log('\n✅ 데이터베이스 연결 테스트 성공!\n');
}

main()
  .catch((e) => {
    console.error('❌ 에러 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
