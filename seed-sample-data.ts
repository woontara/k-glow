// 샘플 파트너사 데이터 생성 스크립트
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 샘플 파트너사 데이터 생성 시작...\n');

  // 1. 뷰티브랜드 (K-뷰티 대표 브랜드)
  console.log('1️⃣ 뷰티브랜드 생성 중...');
  const partner1 = await prisma.partner.create({
    data: {
      name: '뷰티브랜드',
      nameRu: 'Бьюти Бренд',
      websiteUrl: 'https://example-beauty.co.kr',
      logoUrl: 'https://via.placeholder.com/150?text=Beauty',
      description: '자연주의 화장품을 추구하는 한국의 대표 뷰티 브랜드입니다. 피부 본연의 아름다움을 살리는 제품을 만듭니다.',
      descriptionRu: 'Ведущий корейский косметический бренд, стремящийся к натуральной косметике. Мы создаем продукты, которые подчеркивают естественную красоту кожи.',
      marketScore: 85,
    },
  });

  await prisma.product.createMany({
    data: [
      {
        partnerId: partner1.id,
        name: '수분 크림',
        nameRu: 'Увлажняющий крем',
        category: '스킨케어',
        price: 35000,
        priceRub: 2625,
        ingredients: JSON.stringify(['히알루론산', '나이아신아마이드', '세라마이드']),
        ingredientsRu: JSON.stringify(['Гиалуроновая кислота', 'Ниацинамид', 'Церамиды']),
        description: '건조한 피부에 깊은 수분을 공급하는 크림입니다',
        descriptionRu: 'Крем, обеспечивающий глубокое увлажнение сухой кожи',
        imageUrls: JSON.stringify(['https://via.placeholder.com/400?text=Moisture+Cream']),
      },
      {
        partnerId: partner1.id,
        name: '비타민 세럼',
        nameRu: 'Витаминная сыворотка',
        category: '스킨케어',
        price: 42000,
        priceRub: 3150,
        ingredients: JSON.stringify(['비타민C', '비타민E', '페룰산']),
        ingredientsRu: JSON.stringify(['Витамин C', 'Витамин E', 'Феруловая кислота']),
        description: '피부 톤을 밝게 가꾸어주는 비타민 세럼',
        descriptionRu: 'Витаминная сыворотка, осветляющая тон кожи',
        imageUrls: JSON.stringify(['https://via.placeholder.com/400?text=Vitamin+Serum']),
      },
      {
        partnerId: partner1.id,
        name: '선크림 SPF50+',
        nameRu: 'Солнцезащитный крем SPF50+',
        category: '선케어',
        price: 28000,
        priceRub: 2100,
        ingredients: JSON.stringify(['징크옥사이드', '알로에베라', '판테놀']),
        ingredientsRu: JSON.stringify(['Оксид цинка', 'Алоэ вера', 'Пантенол']),
        description: '강력한 자외선 차단과 피부 진정 효과',
        descriptionRu: 'Мощная защита от УФ-лучей и успокаивающий эффект',
        imageUrls: JSON.stringify(['https://via.placeholder.com/400?text=Sunscreen']),
      },
    ],
  });
  console.log('✅ 뷰티브랜드 생성 완료 (제품 3개)\n');

  // 2. 클린코스메틱 (친환경 브랜드)
  console.log('2️⃣ 클린코스메틱 생성 중...');
  const partner2 = await prisma.partner.create({
    data: {
      name: '클린코스메틱',
      nameRu: 'Клин Косметик',
      websiteUrl: 'https://example-clean.co.kr',
      logoUrl: 'https://via.placeholder.com/150?text=Clean',
      description: '100% 비건 인증을 받은 친환경 화장품 브랜드입니다. 동물실험을 하지 않으며, 자연에서 온 성분만 사용합니다.',
      descriptionRu: '100% веганский сертифицированный экологичный косметический бренд. Мы не проводим испытания на животных и используем только натуральные ингредиенты.',
      marketScore: 92,
    },
  });

  await prisma.product.createMany({
    data: [
      {
        partnerId: partner2.id,
        name: '그린티 토너',
        nameRu: 'Тонер с зеленым чаем',
        category: '스킨케어',
        price: 25000,
        priceRub: 1875,
        ingredients: JSON.stringify(['녹차추출물', '병풀추출물', '티트리']),
        ingredientsRu: JSON.stringify(['Экстракт зеленого чая', 'Экстракт центеллы', 'Чайное дерево']),
        description: '녹차 성분으로 피부를 진정시키고 수분을 공급',
        descriptionRu: 'Успокаивает кожу и увлажняет с помощью зеленого чая',
        imageUrls: JSON.stringify(['https://via.placeholder.com/400?text=Green+Tea+Toner']),
      },
      {
        partnerId: partner2.id,
        name: '시카 진정 크림',
        nameRu: 'Успокаивающий крем Cica',
        category: '스킨케어',
        price: 32000,
        priceRub: 2400,
        ingredients: JSON.stringify(['병풀추출물', '마데카소사이드', '판테놀']),
        ingredientsRu: JSON.stringify(['Экстракт центеллы', 'Мадекассозид', 'Пантенол']),
        description: '민감한 피부를 위한 시카 진정 크림',
        descriptionRu: 'Успокаивающий крем с центеллой для чувствительной кожи',
        imageUrls: JSON.stringify(['https://via.placeholder.com/400?text=Cica+Cream']),
      },
      {
        partnerId: partner2.id,
        name: '클렌징 오일',
        nameRu: 'Очищающее масло',
        category: '클렌징',
        price: 22000,
        priceRub: 1650,
        ingredients: JSON.stringify(['호호바오일', '올리브오일', '비타민E']),
        ingredientsRu: JSON.stringify(['Масло жожоба', 'Оливковое масло', 'Витамин E']),
        description: '메이크업을 부드럽게 녹여내는 천연 오일',
        descriptionRu: 'Натуральное масло, мягко удаляющее макияж',
        imageUrls: JSON.stringify(['https://via.placeholder.com/400?text=Cleansing+Oil']),
      },
      {
        partnerId: partner2.id,
        name: '수분 마스크팩',
        nameRu: 'Увлажняющая маска',
        category: '마스크',
        price: 2500,
        priceRub: 188,
        ingredients: JSON.stringify(['히알루론산', '알로에베라', '콜라겐']),
        ingredientsRu: JSON.stringify(['Гиалуроновая кислота', 'Алоэ вера', 'Коллаген']),
        description: '10분 만에 촉촉한 피부를 완성하는 시트 마스크',
        descriptionRu: 'Тканевая маска для увлажненной кожи за 10 минут',
        imageUrls: JSON.stringify(['https://via.placeholder.com/400?text=Sheet+Mask']),
      },
    ],
  });
  console.log('✅ 클린코스메틱 생성 완료 (제품 4개)\n');

  // 3. 럭셔리스킨 (프리미엄 브랜드)
  console.log('3️⃣ 럭셔리스킨 생성 중...');
  const partner3 = await prisma.partner.create({
    data: {
      name: '럭셔리스킨',
      nameRu: 'Лакшери Скин',
      websiteUrl: 'https://example-luxury.co.kr',
      logoUrl: 'https://via.placeholder.com/150?text=Luxury',
      description: '프리미엄 안티에이징 화장품 전문 브랜드입니다. 최첨단 기술과 고급 성분으로 피부 노화를 방지합니다.',
      descriptionRu: 'Премиальный бренд специализирующийся на антивозрастной косметике. Предотвращаем старение кожи с помощью передовых технологий и роскошных ингредиентов.',
      marketScore: 78,
    },
  });

  await prisma.product.createMany({
    data: [
      {
        partnerId: partner3.id,
        name: '레티놀 세럼',
        nameRu: 'Сыворотка с ретинолом',
        category: '안티에이징',
        price: 68000,
        priceRub: 5100,
        ingredients: JSON.stringify(['레티놀', '펩타이드', '세라마이드']),
        ingredientsRu: JSON.stringify(['Ретинол', 'Пептиды', 'Церамиды']),
        description: '주름 개선과 탄력 증진을 위한 고농축 레티놀 세럼',
        descriptionRu: 'Высококонцентрированная сыворотка с ретинолом для улучшения морщин и повышения упругости',
        imageUrls: JSON.stringify(['https://via.placeholder.com/400?text=Retinol+Serum']),
      },
      {
        partnerId: partner3.id,
        name: '골드 아이크림',
        nameRu: 'Золотой крем для глаз',
        category: '아이케어',
        price: 85000,
        priceRub: 6375,
        ingredients: JSON.stringify(['금나노입자', '아데노신', '카페인']),
        ingredientsRu: JSON.stringify(['Золотые наночастицы', 'Аденозин', 'Кофеин']),
        description: '눈가 주름과 다크서클을 동시에 케어',
        descriptionRu: 'Одновременный уход за морщинами вокруг глаз и темными кругами',
        imageUrls: JSON.stringify(['https://via.placeholder.com/400?text=Gold+Eye+Cream']),
      },
      {
        partnerId: partner3.id,
        name: '콜라겐 앰플',
        nameRu: 'Коллагеновая ампула',
        category: '안티에이징',
        price: 55000,
        priceRub: 4125,
        ingredients: JSON.stringify(['저분자콜라겐', '히알루론산', 'EGF']),
        ingredientsRu: JSON.stringify(['Низкомолекулярный коллаген', 'Гиалуроновая кислота', 'EGF']),
        description: '즉각적인 피부 탄력 개선 앰플',
        descriptionRu: 'Ампула для немедленного улучшения упругости кожи',
        imageUrls: JSON.stringify(['https://via.placeholder.com/400?text=Collagen+Ampoule']),
      },
    ],
  });
  console.log('✅ 럭셔리스킨 생성 완료 (제품 3개)\n');

  // 통계
  const totalPartners = await prisma.partner.count();
  const totalProducts = await prisma.product.count();

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ 샘플 데이터 생성 완료!\n');
  console.log('📊 생성된 데이터:');
  console.log(`   - 파트너사: ${totalPartners}개`);
  console.log(`   - 제품: ${totalProducts}개\n`);
  console.log('🌐 파트너사 목록 확인:');
  console.log('   http://localhost:3001/partners\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ 에러 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
