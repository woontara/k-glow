'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { fal } from '@fal-ai/client';
import WorkLibrarySidebar from '@/components/ai-tools/WorkLibrarySidebar';
import { WorkItemType } from '@prisma/client';

interface LibraryItem {
  id: string;
  name: string;
  type: WorkItemType;
  url: string;
  thumbnail?: string | null;
  metadata?: {
    duration?: number;
    fileSize?: number;
  } | null;
  createdAt: string;
}

type AiModelCategory = 'IMAGE_GENERATION' | 'BACKGROUND_REMOVAL' | 'UPSCALING' | 'VIDEO_GENERATION' | 'TEXT_TO_SPEECH';

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
  audio?: {
    url: string;
    file_size?: number;
    content_type?: string;
  };
  duration_ms?: number;
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
  TEXT_TO_SPEECH: {
    icon: '🎙️',
    gradient: 'from-pink-500 to-rose-500',
    border: 'hover:border-pink-400'
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

  // TTS 설정
  const [ttsText, setTtsText] = useState('');
  const [ttsVoice, setTtsVoice] = useState('Wise_Woman');
  const [ttsEmotion, setTtsEmotion] = useState('neutral');
  const [ttsSpeed, setTtsSpeed] = useState(1.0);
  const [sampleLoading, setSampleLoading] = useState(false);
  const [sampleAudio, setSampleAudio] = useState<HTMLAudioElement | null>(null);

  // 라이브러리 사이드바 (페이지 진입 시 바로 열림)
  const [librarySidebarOpen, setLibrarySidebarOpen] = useState(true);
  const [libraryFilterType, setLibraryFilterType] = useState<WorkItemType | undefined>(undefined);
  const [selectedLibraryAudio, setSelectedLibraryAudio] = useState<LibraryItem | null>(null);
  const [savingToLibrary, setSavingToLibrary] = useState(false);

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

  // TTS 샘플 미리듣기 (미리 생성된 정적 파일 사용)
  const playSample = () => {
    // 기존 오디오 정지
    if (sampleAudio) {
      sampleAudio.pause();
      setSampleAudio(null);
      return; // 토글 기능: 재생 중이면 정지만 하고 끝
    }

    // 정적 샘플 파일 재생
    const sampleUrl = `/audio/samples/${ttsVoice}.mp3`;
    const audio = new Audio(sampleUrl);

    audio.onended = () => setSampleAudio(null);
    audio.onerror = () => {
      setError('샘플 파일을 재생할 수 없습니다');
      setSampleAudio(null);
    };

    audio.play();
    setSampleAudio(audio);
  };

  // 라이브러리에 저장
  const saveToLibrary = async (name: string) => {
    if (!result || !selectedModel) return;

    const url = result.image?.url || result.video?.url || result.audio?.url;
    if (!url) return;

    setSavingToLibrary(true);
    try {
      let type: WorkItemType;
      let metadata: Record<string, unknown> | undefined;

      if (result.audio?.url) {
        type = 'AUDIO';
        metadata = {
          duration: result.duration_ms,
          fileSize: result.audio.file_size,
        };
      } else if (result.video?.url) {
        type = 'VIDEO';
      } else {
        type = 'IMAGE';
      }

      const res = await fetch('/api/work-library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          type,
          url,
          metadata,
        }),
      });

      if (res.ok) {
        alert('라이브러리에 저장되었습니다.');
      } else {
        throw new Error('저장 실패');
      }
    } catch (err) {
      console.error('라이브러리 저장 실패:', err);
      alert('저장에 실패했습니다.');
    } finally {
      setSavingToLibrary(false);
    }
  };

  // 라이브러리에서 오디오 선택
  const handleLibrarySelect = (item: LibraryItem) => {
    if (item.type === 'AUDIO') {
      setSelectedLibraryAudio(item);
      setAudioFile(null); // 파일 업로드 초기화
    }
    setLibrarySidebarOpen(false);
  };

  // 라이브러리 열기 (오디오 선택용)
  const openLibraryForAudio = () => {
    setLibraryFilterType('AUDIO');
    setLibrarySidebarOpen(true);
  };

  const handleProcess = async () => {
    if (!selectedModel) return;

    // TTS는 텍스트만 필요, 다른 도구는 이미지 필요
    if (selectedModel.category !== 'TEXT_TO_SPEECH' && !imageFile) return;
    if (selectedModel.category === 'TEXT_TO_SPEECH' && !ttsText.trim()) return;

    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      let params: Record<string, unknown> = {};

      if (selectedModel.category === 'TEXT_TO_SPEECH') {
        // TTS 파라미터
        params = {
          text: ttsText,
          voice_id: ttsVoice,
          emotion: ttsEmotion,
          speed: ttsSpeed,
        };
      } else {
        // 이미지 기반 도구
        const imageUrl = await uploadToStorage(imageFile!, selectedModel.id);
        params = { image_url: imageUrl };

        if (selectedModel.category === 'UPSCALING') {
          // CCSR은 scale, Clarity는 upscale_factor 사용
          if (selectedModel.modelId.includes('ccsr')) {
            params.scale = upscaleFactor;
          } else {
            params.upscale_factor = upscaleFactor;
          }
        } else if (selectedModel.category === 'BACKGROUND_REMOVAL') {
          // Bria RMBG는 추가 옵션 없음, BiRefNet은 model/output_format 필요
          if (!selectedModel.modelId.includes('bria')) {
            params.model = bgRemovalModel;
            params.output_format = outputFormat;
          }
        } else if (selectedModel.category === 'VIDEO_GENERATION') {
          // 라이브러리에서 선택한 오디오 또는 업로드한 파일 사용
          if (selectedLibraryAudio) {
            params.audio_url = selectedLibraryAudio.url;
          } else if (audioFile) {
            const audioUrl = await uploadToStorage(audioFile, selectedModel.id);
            params.audio_url = audioUrl;
          } else {
            throw new Error('비디오 생성에는 오디오 파일이 필요합니다');
          }
        }
      }

      // AI 모델 실행
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
    const url = result?.image?.url || result?.video?.url || result?.audio?.url;
    if (!url) return;

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = result?.video ? 'ai-video.mp4' : result?.audio ? 'ai-audio.mp3' : 'ai-result.png';
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
    setTtsText('');
    setSelectedLibraryAudio(null);
    // 샘플 오디오 정지
    if (sampleAudio) {
      sampleAudio.pause();
      setSampleAudio(null);
    }
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
            AI 도구
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            한국 브랜드를 위한 AI 도구입니다. 배경 제거, 이미지 업스케일링, 음성 생성 등 다양한 기능을 사용해보세요.
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
                  {/* TTS 텍스트 입력 */}
                  {selectedModel.category === 'TEXT_TO_SPEECH' ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          텍스트 입력
                        </label>
                        <textarea
                          value={ttsText}
                          onChange={(e) => setTtsText(e.target.value)}
                          placeholder="음성으로 변환할 텍스트를 입력하세요. (최대 5,000자)"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8BA4B4] focus:border-transparent resize-none"
                          rows={6}
                          maxLength={5000}
                        />
                        <p className="text-sm text-gray-400 mt-1 text-right">
                          {ttsText.length} / 5,000자
                        </p>
                      </div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              음성
                            </label>
                            <select
                              value={ttsVoice}
                              onChange={(e) => setTtsVoice(e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BA4B4] focus:border-transparent"
                            >
                              <optgroup label="여성 음성">
                                <option value="Wise_Woman">현명한 여성</option>
                                <option value="Calm_Woman">차분한 여성</option>
                                <option value="Inspirational_girl">영감적인 소녀</option>
                                <option value="Cute_Girl">귀여운 소녀</option>
                                <option value="Lively_Girl">활발한 소녀</option>
                                <option value="Patient_Woman">차분한 상담사</option>
                                <option value="Young_Woman">젊은 여성</option>
                              </optgroup>
                              <optgroup label="남성 음성">
                                <option value="Deep_Voice_Man">깊은 남성</option>
                                <option value="Confident_Man">자신감 있는 남성</option>
                                <option value="Newsman">뉴스 앵커</option>
                                <option value="Cartoon_Man">만화 남성</option>
                                <option value="Gentle_Man">부드러운 남성</option>
                                <option value="Serious_Man">진지한 남성</option>
                              </optgroup>
                              <optgroup label="중성/특수">
                                <option value="Friendly_Person">친근한 목소리</option>
                                <option value="Narrator">나레이터</option>
                                <option value="Podcast_Host">팟캐스트 호스트</option>
                              </optgroup>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              감정
                            </label>
                            <select
                              value={ttsEmotion}
                              onChange={(e) => setTtsEmotion(e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BA4B4] focus:border-transparent"
                            >
                              <option value="neutral">중립</option>
                              <option value="happy">기쁨</option>
                              <option value="sad">슬픔</option>
                              <option value="angry">분노</option>
                              <option value="fearful">두려움</option>
                              <option value="surprised">놀람</option>
                            </select>
                          </div>
                        </div>
                        <button
                          onClick={playSample}
                          className={`w-full py-3 font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                            sampleAudio
                              ? 'bg-pink-500 text-white hover:bg-pink-600'
                              : 'bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 hover:from-pink-200 hover:to-rose-200'
                          }`}
                        >
                          {sampleAudio ? (
                            <>
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 6h12v12H6z"/>
                              </svg>
                              재생 중지
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                              샘플 듣기
                            </>
                          )}
                        </button>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          속도: {ttsSpeed.toFixed(1)}x
                        </label>
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.1"
                          value={ttsSpeed}
                          onChange={(e) => setTtsSpeed(parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#8BA4B4]"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          <span>느리게</span>
                          <span>보통</span>
                          <span>빠르게</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* 이미지 업로드 */
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
                  )}

                  {/* 비디오 생성 시 오디오 선택 */}
                  {selectedModel.category === 'VIDEO_GENERATION' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        오디오 선택
                      </label>

                      {/* 선택된 오디오 표시 */}
                      {selectedLibraryAudio ? (
                        <div className="border-2 border-[#8BA4B4] bg-[#8BA4B4]/5 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                </svg>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{selectedLibraryAudio.name}</p>
                                <p className="text-xs text-gray-500">라이브러리에서 선택됨</p>
                              </div>
                            </div>
                            <button
                              onClick={() => setSelectedLibraryAudio(null)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ) : audioFile ? (
                        <div className="border-2 border-[#8BA4B4] bg-[#8BA4B4]/5 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">🎵</span>
                              <span className="text-gray-700">{audioFile.name}</span>
                            </div>
                            <button
                              onClick={() => setAudioFile(null)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          {/* 라이브러리에서 선택 */}
                          <button
                            onClick={openLibraryForAudio}
                            className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-[#8BA4B4] hover:bg-[#8BA4B4]/5 transition-colors"
                          >
                            <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                            <p className="text-sm text-gray-600">라이브러리에서 선택</p>
                            <p className="text-xs text-gray-400 mt-1">저장된 TTS 음성 불러오기</p>
                          </button>

                          {/* 파일 업로드 */}
                          <label className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-[#8BA4B4] hover:bg-[#8BA4B4]/5 transition-colors cursor-pointer">
                            <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <p className="text-sm text-gray-600">파일 업로드</p>
                            <p className="text-xs text-gray-400 mt-1">새 오디오 파일 선택</p>
                            <input
                              type="file"
                              accept="audio/*"
                              onChange={handleAudioChange}
                              className="hidden"
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 업스케일링 설정 */}
                  {selectedModel.category === 'UPSCALING' && (
                    <div className="space-y-4">
                      {/* CCSR 모델 안내 */}
                      {selectedModel.modelId.includes('ccsr') && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                          <div className="flex items-start gap-3">
                            <span className="text-xl">🚀</span>
                            <div>
                              <p className="font-medium text-green-900">CCSR (SOTA 업스케일러)</p>
                              <p className="text-sm text-green-700 mt-1">
                                최신 기술(State of the Art) 업스케일러로 고품질 결과물을 생성합니다.
                                무료로 사용 가능합니다.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
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
                    </div>
                  )}

                  {/* 배경 제거 설정 - BiRefNet만 추가 옵션 표시 */}
                  {selectedModel.category === 'BACKGROUND_REMOVAL' && !selectedModel.modelId.includes('bria') && (
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

                  {/* Bria RMBG 안내 */}
                  {selectedModel.category === 'BACKGROUND_REMOVAL' && selectedModel.modelId.includes('bria') && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <span className="text-xl">✨</span>
                        <div>
                          <p className="font-medium text-blue-900">Bria RMBG 2.0</p>
                          <p className="text-sm text-blue-700 mt-1">
                            상업용 라이선스 데이터로 학습된 고품질 배경 제거 모델입니다.
                            이미지를 업로드하면 자동으로 배경이 제거됩니다.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 실행 버튼 */}
                  <button
                    onClick={handleProcess}
                    disabled={
                      processing ||
                      (selectedModel.category === 'TEXT_TO_SPEECH' && !ttsText.trim()) ||
                      (selectedModel.category !== 'TEXT_TO_SPEECH' && !imageFile) ||
                      (selectedModel.category === 'VIDEO_GENERATION' && !audioFile && !selectedLibraryAudio)
                    }
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
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={handleDownload}
                            className="py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            다운로드
                          </button>
                          <button
                            onClick={() => {
                              const name = prompt('저장할 이름을 입력하세요:', selectedModel?.name + ' 결과');
                              if (name) saveToLibrary(name);
                            }}
                            disabled={savingToLibrary}
                            className="py-3 bg-[#8BA4B4] text-white font-medium rounded-lg hover:bg-[#7A939C] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                            {savingToLibrary ? '저장 중...' : '라이브러리 저장'}
                          </button>
                        </div>
                      </div>
                    ) : result?.video?.url ? (
                      <div className="space-y-4 w-full">
                        <video
                          src={result.video.url}
                          controls
                          className="max-h-80 mx-auto rounded-lg shadow-lg"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={handleDownload}
                            className="py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            다운로드
                          </button>
                          <button
                            onClick={() => {
                              const name = prompt('저장할 이름을 입력하세요:', 'AI 비디오');
                              if (name) saveToLibrary(name);
                            }}
                            disabled={savingToLibrary}
                            className="py-3 bg-[#8BA4B4] text-white font-medium rounded-lg hover:bg-[#7A939C] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                            {savingToLibrary ? '저장 중...' : '라이브러리 저장'}
                          </button>
                        </div>
                      </div>
                    ) : result?.audio?.url ? (
                      <div className="space-y-4 w-full">
                        <div className="bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl p-6 text-center">
                          <div className="text-5xl mb-3">🎙️</div>
                          <p className="text-gray-700 font-medium mb-2">음성이 생성되었습니다</p>
                          {/* 메타 정보 */}
                          <div className="flex justify-center gap-4 text-sm text-gray-500 mb-4">
                            {result.duration_ms && (
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {Math.floor(result.duration_ms / 1000)}초
                              </span>
                            )}
                            {result.audio.file_size && (
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                {(result.audio.file_size / 1024).toFixed(1)} KB
                              </span>
                            )}
                          </div>
                          <audio
                            src={result.audio.url}
                            controls
                            className="w-full"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={handleDownload}
                            className="py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            MP3 다운로드
                          </button>
                          <button
                            onClick={() => {
                              const name = prompt('저장할 이름을 입력하세요:', 'TTS 음성');
                              if (name) saveToLibrary(name);
                            }}
                            disabled={savingToLibrary}
                            className="py-3 bg-[#8BA4B4] text-white font-medium rounded-lg hover:bg-[#7A939C] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                            {savingToLibrary ? '저장 중...' : '라이브러리 저장'}
                          </button>
                        </div>
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

        {/* 라이브러리 사이드바 */}
        <WorkLibrarySidebar
          isOpen={librarySidebarOpen}
          onClose={() => setLibrarySidebarOpen(false)}
          onSelect={handleLibrarySelect}
          filterType={libraryFilterType}
          selectedItemId={selectedLibraryAudio?.id}
        />
      </div>
    </div>
  );
}
