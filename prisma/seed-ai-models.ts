import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const aiModels = [
  {
    name: '배경 제거',
    nameEn: 'Background Removal',
    modelId: 'fal-ai/birefnet',
    category: 'BACKGROUND_REMOVAL' as const,
    description: '상품 이미지에서 배경을 깔끔하게 제거합니다. 화이트 배경이나 투명 배경 상품 사진 제작에 최적화되어 있습니다.',
    defaultParams: {
      model: 'General Use (Light)',
      operating_resolution: '1024x1024',
      output_format: 'png',
      refine_foreground: true,
    },
    isActive: true,
    order: 1,
  },
  {
    name: '이미지 업스케일',
    nameEn: 'Image Upscaler',
    modelId: 'fal-ai/clarity-upscaler',
    category: 'UPSCALING' as const,
    description: '저해상도 이미지를 최대 4배까지 고화질로 확대합니다. 상품 상세 이미지 품질 향상에 유용합니다.',
    defaultParams: {
      upscale_factor: 2,
      creativity: 0.35,
      resemblance: 0.6,
    },
    isActive: true,
    order: 2,
  },
  {
    name: 'AI 비디오 생성',
    nameEn: 'Aurora Video',
    modelId: 'fal-ai/creatify/aurora',
    category: 'VIDEO_GENERATION' as const,
    description: '이미지와 오디오를 결합하여 AI 비디오를 생성합니다. 상품 홍보 영상 제작에 활용할 수 있습니다.',
    defaultParams: {
      resolution: '720p',
      guidance_scale: 1,
    },
    isActive: true,
    order: 3,
  },
  {
    name: '텍스트 음성 변환',
    nameEn: 'Text to Speech',
    modelId: 'fal-ai/minimax-tts/text-to-speech',
    category: 'TEXT_TO_SPEECH' as const,
    description: '텍스트를 자연스러운 음성으로 변환합니다. 한국어를 포함한 30개 이상의 언어를 지원하며, 다양한 목소리와 감정 표현이 가능합니다.',
    defaultParams: {
      voice_id: 'Wise_Woman',
      emotion: 'neutral',
      speed: 1.0,
      format: 'mp3',
      sample_rate: 32000,
    },
    isActive: true,
    order: 4,
  },
];

async function main() {
  console.log('AI 모델 시드 데이터 추가 시작...');

  for (const model of aiModels) {
    const existing = await prisma.aiModel.findUnique({
      where: { modelId: model.modelId },
    });

    if (existing) {
      console.log(`- ${model.name}: 이미 존재함 (스킵)`);
      continue;
    }

    await prisma.aiModel.create({
      data: model,
    });
    console.log(`- ${model.name}: 추가됨`);
  }

  console.log('AI 모델 시드 데이터 추가 완료!');
  console.log('');
  console.log('⚠️  주의: API 키가 설정되지 않았습니다.');
  console.log('   Admin 페이지(/admin/ai-models)에서 각 모델의 API 키를 설정해주세요.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
