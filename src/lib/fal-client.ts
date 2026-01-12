import { fal } from '@fal-ai/client';

// 타입 정의
export interface FalImageOutput {
  url: string;
  content_type: string;
  file_name: string;
  file_size: number;
  width: number;
  height: number;
}

export interface FalVideoOutput extends FalImageOutput {
  fps: number;
  duration: number;
  num_frames: number;
}

// 배경 제거 (BiRefNet) 입력
export interface BiRefNetInput {
  image_url: string;
  model?: 'General Use (Light)' | 'General Use (Heavy)' | 'Portrait' | 'Matting';
  operating_resolution?: '1024x1024' | '2048x2048';
  output_format?: 'png' | 'webp';
  refine_foreground?: boolean;
}

export interface BiRefNetOutput {
  image: FalImageOutput;
}

// 업스케일링 (Clarity Upscaler) 입력
export interface ClarityUpscalerInput {
  image_url: string;
  upscale_factor?: number; // 1-4
  prompt?: string;
  creativity?: number; // 0-1
  resemblance?: number; // 0-1
  guidance_scale?: number;
  num_inference_steps?: number;
}

export interface ClarityUpscalerOutput {
  image: FalImageOutput;
}

// Aurora (비디오 생성) 입력
export interface AuroraInput {
  image_url: string;
  audio_url: string;
  prompt?: string;
  guidance_scale?: number;
  resolution?: '480p' | '720p';
}

export interface AuroraOutput {
  video: FalVideoOutput;
}

// 모델별 기본 파라미터
export const defaultModelParams = {
  'fal-ai/birefnet': {
    model: 'General Use (Light)',
    operating_resolution: '1024x1024',
    output_format: 'png',
    refine_foreground: true,
  },
  'fal-ai/clarity-upscaler': {
    upscale_factor: 2,
    creativity: 0.35,
    resemblance: 0.6,
  },
  'fal-ai/creatify/aurora': {
    resolution: '720p',
    guidance_scale: 1,
  },
};

/**
 * 특정 API 키로 fal.ai 클라이언트를 생성합니다.
 * 모델별로 다른 API 키를 사용할 수 있습니다.
 */
export function createFalClient(apiKey: string) {
  // 새 설정으로 fal 클라이언트 구성
  fal.config({
    credentials: apiKey,
  });
  return fal;
}

/**
 * AI 모델 실행 함수 (API 키 지정 가능)
 */
export async function runAiModel<T = unknown>(
  falModelId: string,
  input: Record<string, unknown>,
  apiKey?: string
): Promise<T> {
  // API 키가 제공되면 해당 키로 설정
  if (apiKey) {
    fal.config({
      credentials: apiKey,
    });
  } else {
    // 기본 환경변수 키 사용
    fal.config({
      credentials: process.env.FAL_KEY,
    });
  }

  const result = await fal.subscribe(falModelId, {
    input,
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        console.log(`[fal.ai] ${falModelId} - Processing...`);
      }
    },
  });

  return result.data as T;
}

export { fal };
