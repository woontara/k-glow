'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { fal } from '@fal-ai/client';

type AiModelCategory = 'IMAGE_GENERATION' | 'BACKGROUND_REMOVAL' | 'UPSCALING' | 'VIDEO_GENERATION';

interface AiModel {
  id: string;
  name: string;
  nameEn: string;
  modelId: string;
  category: AiModelCategory;
  description: string | null;
  iconUrl: string | null;
  defaultParams: Record<string, unknown> | null;
}

interface ProcessingResult {
  image?: { url: string };
  video?: { url: string };
}

const categoryConfig: Record<AiModelCategory, { icon: string; gradient: string; border: string }> = {
  IMAGE_GENERATION: {
    icon: '🎨',
    gradient: 'from-purple-500 to-pink-500',
    border: 'hover:border-purple-400'
  },
  BACKGROUND_REMOVAL: {
    icon: '✂️',
    gradient: 'from-blue-500 to-cyan-500',
    border: 'hover:border-blue-400'
  },
  UPSCALING: {
    icon: '🔍',
    gradient: 'from-green-500 to-emerald-500',
    border: 'hover:border-green-400'
  },
  VIDEO_GENERATION: {
    icon: '🎬',
    gradient: 'from-orange-500 to-red-500',
    border: 'hover:border-orange-400'
  },
};

export default function AiToolsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [models, setModels] = useState<AiModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<AiModel | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 업스케일 설정
  const [upscaleFactor, setUpscaleFactor] = useState(2);

  // 배경 제거 설정
  const [bgRemovalModel, setBgRemovalModel] = useState('General Use (Light)');
  const [outputFormat, setOutputFormat] = useState('png');

  const fetchModels = useCallback(async () => {
    try {
      const response = await fetch('/api/ai-tools');
      if (!response.ok) throw new Error('모델 목록 조회 실패');
      const data = await response.json();
      setModels(data.models);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    if (status === 'authenticated') {
      fetchModels();
    }
  }, [status, router, fetchModels]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setResult(null);
      setError(null);
    }
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
    }
  };

  // API 키를 가져와서 fal 클라이언트에 설정
  const configureFalClient = async (modelId: string) => {
    const response = await fetch(`/api/ai-tools/key?modelId=${modelId}`);
    if (!response.ok) {
      throw new Error('API 키를 가져올 수 없습니다');
    }
    const data = await response.json();
    fal.config({ credentials: data.apiKey });
  };

  // fal.ai 스토리지에 파일 업로드 (클라이언트 직접 업로드)
  const uploadToStorage = async (file: File, modelId: string): Promise<string> => {
    await configureFalClient(modelId);
    const url = await fal.storage.upload(file);
    return url;
  };

  const handleProcess = async () => {
    if (!selectedModel || !imageFile) return;

    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      // 1. 이미지를 fal.ai 스토리지에 업로드
      const imageUrl = await uploadToStorage(imageFile, selectedModel.id);

      // 2. 모델별 파라미터 설정
      let params: Record<string, unknown> = { image_url: imageUrl };

      if (selectedModel.category === 'UPSCALING') {
        params.upscale_factor = upscaleFactor;
      } else if (selectedModel.category === 'BACKGROUND_REMOVAL') {
        params.model = bgRemovalModel;
        params.output_format = outputFormat;
      } else if (selectedModel.category === 'VIDEO_GENERATION') {
        if (!audioFile) {
          throw new Error('비디오 생성에는 오디오 파일이 필요합니다');
        }
        const audioUrl = await uploadToStorage(audioFile, selectedModel.id);
        params.audio_url = audioUrl;
      }

      // 3. AI 모델 실행
      const response = await fetch(`/api/ai-tools/${selectedModel.id}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'AI 처리 실패');
      }

      const data = await response.json();
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '처리에 실패했습니다');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
    const url = result?.image?.url || result?.video?.url;
    if (!url) return;

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = result?.video ? 'ai-video.mp4' : 'ai-result.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('다운로드 실패:', err);
    }
  };

  const resetTool = () => {
    setImageFile(null);
    setImagePreview(null);
    setAudioFile(null);
    setResult(null);
    setError(null);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] via-white to-[#f0f4f8] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#8BA4B4] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] via-white to-[#f0f4f8] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI 이미지 도구
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            한국 브랜드를 위한 AI 이미지 편집 도구입니다. 배경 제거, 이미지 업스케일링 등 다양한 기능을 사용해보세요.
          </p>
        </div>

        {/* 모델 선택 */}
        {!selectedModel ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.length === 0 ? (
              <div className="col-span-full bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-200">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  사용 가능한 AI 도구가 없습니다
                </h3>
                <p className="text-gray-500">
                  관리자에게 문의하여 AI 모델을 활성화해주세요.
                </p>
              </div>
            ) : (
              models.map((model) => {
                const config = categoryConfig[model.category];
                return (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model)}
                    className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-left border border-gray-200 ${config.border} hover:shadow-xl transition-all duration-300 group`}
                  >
                    <div className={`w-14 h-14 bg-gradient-to-br ${config.gradient} rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                      {config.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {model.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">
                      {model.nameEn}
                    </p>
                    {model.description && (
                      <p className="text-gray-600 text-sm">
                        {model.description}
                      </p>
                    )}
                  </button>
                );
              })
            )}
          </div>
        ) : (
          /* 도구 사용 UI */
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 overflow-hidden">
            {/* 도구 헤더 */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${categoryConfig[selectedModel.category].gradient} rounded-xl flex items-center justify-center text-2xl`}>
                  {categoryConfig[selectedModel.category].icon}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedModel.name}</h2>
                  <p className="text-sm text-gray-500">{selectedModel.description}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedModel(null);
                  resetTool();
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ← 도구 선택으로
              </button>
            </div>

            <div className="p-6">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* 입력 영역 */}
                <div className="space-y-6">
                  {/* 이미지 업로드 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이미지 업로드
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                        imagePreview ? 'border-[#8BA4B4] bg-[#8BA4B4]/5' : 'border-gray-300 hover:border-[#8BA4B4]'
                      }`}
                    >
                      {imagePreview ? (
                        <div className="space-y-4">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="max-h-64 mx-auto rounded-lg shadow-md"
                          />
                          <button
                            onClick={() => {
                              setImageFile(null);
                              setImagePreview(null);
                              setResult(null);
                            }}
                            className="text-sm text-red-500 hover:text-red-600"
                          >
                            이미지 제거
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer block">
                          <div className="text-4xl mb-3">📤</div>
                          <p className="text-gray-600 mb-2">클릭하여 이미지를 업로드하거나</p>
                          <p className="text-gray-400 text-sm">드래그 앤 드롭</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* 비디오 생성 시 오디오 업로드 */}
                  {selectedModel.category === 'VIDEO_GENERATION' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        오디오 업로드
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-[#8BA4B4] transition-colors">
                        <label className="cursor-pointer block">
                          {audioFile ? (
                            <div className="flex items-center justify-center gap-2">
                              <span className="text-2xl">🎵</span>
                              <span className="text-gray-700">{audioFile.name}</span>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  setAudioFile(null);
                                }}
                                className="text-red-500 hover:text-red-600"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="text-3xl mb-2">🎵</div>
                              <p className="text-gray-600 text-sm">오디오 파일 선택</p>
                            </>
                          )}
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={handleAudioChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  )}

                  {/* 업스케일링 설정 */}
                  {selectedModel.category === 'UPSCALING' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        업스케일 배율
                      </label>
                      <div className="flex gap-2">
                        {[2, 3, 4].map((factor) => (
                          <button
                            key={factor}
                            onClick={() => setUpscaleFactor(factor)}
                            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                              upscaleFactor === factor
                                ? 'bg-[#8BA4B4] text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {factor}x
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 배경 제거 설정 */}
                  {selectedModel.category === 'BACKGROUND_REMOVAL' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          모델 타입
                        </label>
                        <select
                          value={bgRemovalModel}
                          onChange={(e) => setBgRemovalModel(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BA4B4] focus:border-transparent"
                        >
                          <option value="General Use (Light)">일반 (가벼움)</option>
                          <option value="General Use (Heavy)">일반 (정밀)</option>
                          <option value="Portrait">인물</option>
                          <option value="Matting">매팅</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          출력 형식
                        </label>
                        <div className="flex gap-2">
                          {['png', 'webp'].map((format) => (
                            <button
                              key={format}
                              onClick={() => setOutputFormat(format)}
                              className={`flex-1 py-3 rounded-lg font-medium uppercase transition-colors ${
                                outputFormat === format
                                  ? 'bg-[#8BA4B4] text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {format}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* 실행 버튼 */}
                  <button
                    onClick={handleProcess}
                    disabled={!imageFile || processing || (selectedModel.category === 'VIDEO_GENERATION' && !audioFile)}
                    className="w-full py-4 bg-gradient-to-r from-[#8BA4B4] to-[#6B8A9A] text-white font-semibold rounded-xl hover:from-[#7A939C] hover:to-[#5A7989] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                  >
                    {processing ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        처리 중...
                      </span>
                    ) : (
                      `${selectedModel.name} 실행`
                    )}
                  </button>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                      {error}
                    </div>
                  )}
                </div>

                {/* 결과 영역 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    결과
                  </label>
                  <div className="border-2 border-gray-200 rounded-xl p-8 min-h-[400px] flex items-center justify-center bg-gray-50">
                    {result?.image?.url ? (
                      <div className="space-y-4 w-full">
                        <img
                          src={result.image.url}
                          alt="Result"
                          className="max-h-80 mx-auto rounded-lg shadow-lg"
                        />
                        <button
                          onClick={handleDownload}
                          className="w-full py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          다운로드
                        </button>
                      </div>
                    ) : result?.video?.url ? (
                      <div className="space-y-4 w-full">
                        <video
                          src={result.video.url}
                          controls
                          className="max-h-80 mx-auto rounded-lg shadow-lg"
                        />
                        <button
                          onClick={handleDownload}
                          className="w-full py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          다운로드
                        </button>
                      </div>
                    ) : (
                      <div className="text-center text-gray-400">
                        <div className="text-5xl mb-3">🖼️</div>
                        <p>처리 결과가 여기에 표시됩니다</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
