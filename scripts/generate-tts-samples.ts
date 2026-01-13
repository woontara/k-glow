import { PrismaClient } from '@prisma/client';
import { fal } from '@fal-ai/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const voices = [
  // 여성 음성
  { id: 'Wise_Woman', name: '현명한 여성' },
  { id: 'Calm_Woman', name: '차분한 여성' },
  { id: 'Inspirational_girl', name: '영감적인 소녀' },
  { id: 'Cute_Girl', name: '귀여운 소녀' },
  { id: 'Lively_Girl', name: '활발한 소녀' },
  { id: 'Patient_Woman', name: '차분한 상담사' },
  { id: 'Young_Woman', name: '젊은 여성' },
  // 남성 음성
  { id: 'Deep_Voice_Man', name: '깊은 남성' },
  { id: 'Confident_Man', name: '자신감 있는 남성' },
  { id: 'Newsman', name: '뉴스 앵커' },
  { id: 'Cartoon_Man', name: '만화 남성' },
  { id: 'Gentle_Man', name: '부드러운 남성' },
  { id: 'Serious_Man', name: '진지한 남성' },
  // 중성/특수
  { id: 'Friendly_Person', name: '친근한 목소리' },
  { id: 'Narrator', name: '나레이터' },
  { id: 'Podcast_Host', name: '팟캐스트 호스트' },
];

const sampleText = '안녕하세요. 저는 AI 음성 도우미입니다. 이 음성이 마음에 드시나요?';

async function generateSamples() {
  console.log('=== TTS 샘플 생성 시작 ===\n');

  // TTS 모델에서 API 키 가져오기
  const ttsModel = await prisma.aiModel.findUnique({
    where: { modelId: 'fal-ai/minimax-tts/text-to-speech' }
  });

  if (!ttsModel?.apiKey) {
    console.error('TTS 모델의 API 키가 없습니다.');
    return;
  }

  fal.config({ credentials: ttsModel.apiKey });

  const outputDir = path.join(process.cwd(), 'public', 'audio', 'samples');

  for (const voice of voices) {
    const outputPath = path.join(outputDir, `${voice.id}.mp3`);

    // 이미 존재하면 스킵
    if (fs.existsSync(outputPath)) {
      console.log(`✓ ${voice.name} (${voice.id}): 이미 존재함`);
      continue;
    }

    console.log(`생성 중: ${voice.name} (${voice.id})...`);

    try {
      const result = await fal.subscribe(ttsModel.modelId, {
        input: {
          text: sampleText,
          voice_id: voice.id,
          emotion: 'neutral',
          speed: 1.0,
        },
        logs: false,
      });

      const audioUrl = (result.data as any)?.audio?.url;

      if (audioUrl) {
        // 오디오 파일 다운로드
        const response = await fetch(audioUrl);
        const buffer = await response.arrayBuffer();
        fs.writeFileSync(outputPath, Buffer.from(buffer));
        console.log(`✓ ${voice.name}: 저장 완료`);
      } else {
        console.error(`✗ ${voice.name}: 오디오 URL 없음`);
      }
    } catch (error) {
      console.error(`✗ ${voice.name}: 생성 실패 -`, error);
    }

    // API 제한 방지를 위한 딜레이
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n=== 샘플 생성 완료 ===');
}

generateSamples()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
