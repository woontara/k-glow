/**
 * AI 모델 업데이트 스크립트
 * 배경 제거: BiRefNet → Bria RMBG 2.0
 * 업스케일: Clarity → CCSR
 *
 * 실행: npx ts-node scripts/update-ai-models.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('AI 모델 업데이트 시작...\n');

  // 1. 배경 제거 모델 업데이트 (BiRefNet → Bria RMBG 2.0)
  const bgModel = await prisma.aiModel.findFirst({
    where: { category: 'BACKGROUND_REMOVAL' },
  });

  if (bgModel) {
    const updated = await prisma.aiModel.update({
      where: { id: bgModel.id },
      data: {
        name: '배경 제거',
        nameEn: 'Bria RMBG 2.0',
        modelId: 'fal-ai/bria/background/remove',
        description: '상업용 라이선스 데이터로 학습된 고품질 배경 제거',
        defaultParams: { sync_mode: false },
      },
    });
    console.log('✅ 배경 제거 모델 업데이트 완료');
    console.log(`   ${bgModel.modelId} → ${updated.modelId}\n`);
  } else {
    // 새로 생성
    await prisma.aiModel.create({
      data: {
        name: '배경 제거',
        nameEn: 'Bria RMBG 2.0',
        modelId: 'fal-ai/bria/background/remove',
        category: 'BACKGROUND_REMOVAL',
        description: '상업용 라이선스 데이터로 학습된 고품질 배경 제거',
        defaultParams: { sync_mode: false },
        isActive: true,
        order: 1,
      },
    });
    console.log('✅ 배경 제거 모델 새로 생성 완료\n');
  }

  // 2. 업스케일 모델 업데이트 (Clarity → CCSR)
  const upscaleModel = await prisma.aiModel.findFirst({
    where: { category: 'UPSCALING' },
  });

  if (upscaleModel) {
    const updated = await prisma.aiModel.update({
      where: { id: upscaleModel.id },
      data: {
        name: '이미지 업스케일',
        nameEn: 'CCSR (SOTA)',
        modelId: 'fal-ai/ccsr',
        description: 'SOTA 업스케일러 - 최대 4배 확대, 무료',
        defaultParams: { scale: 2, steps: 50, color_fix_type: 'adain' },
      },
    });
    console.log('✅ 업스케일 모델 업데이트 완료');
    console.log(`   ${upscaleModel.modelId} → ${updated.modelId}\n`);
  } else {
    // 새로 생성
    await prisma.aiModel.create({
      data: {
        name: '이미지 업스케일',
        nameEn: 'CCSR (SOTA)',
        modelId: 'fal-ai/ccsr',
        category: 'UPSCALING',
        description: 'SOTA 업스케일러 - 최대 4배 확대, 무료',
        defaultParams: { scale: 2, steps: 50, color_fix_type: 'adain' },
        isActive: true,
        order: 2,
      },
    });
    console.log('✅ 업스케일 모델 새로 생성 완료\n');
  }

  // 현재 모델 목록 출력
  const allModels = await prisma.aiModel.findMany({
    orderBy: { order: 'asc' },
    select: { name: true, modelId: true, category: true, isActive: true },
  });

  console.log('📋 현재 AI 모델 목록:');
  allModels.forEach((m, i) => {
    console.log(`   ${i + 1}. ${m.name} (${m.modelId}) - ${m.isActive ? '활성' : '비활성'}`);
  });

  console.log('\n✨ 모델 업데이트 완료!');
}

main()
  .catch((e) => {
    console.error('❌ 오류 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
