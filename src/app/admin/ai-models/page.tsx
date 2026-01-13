'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type AiModelCategory = 'IMAGE_GENERATION' | 'BACKGROUND_REMOVAL' | 'UPSCALING' | 'VIDEO_GENERATION' | 'TEXT_TO_SPEECH';

interface AiModel {
  id: string;
  name: string;
  nameEn: string;
  modelId: string;
  category: AiModelCategory;
  description: string | null;
  iconUrl: string | null;
  apiKey: string | null;
  defaultParams: Record<string, unknown> | null;
  isActive: boolean;
  order: number;
  createdAt: string;
  _count: {
    usageLogs: number;
  };
}

interface AiModelFormData {
  name: string;
  nameEn: string;
  modelId: string;
  category: AiModelCategory;
  description: string;
  iconUrl: string;
  apiKey: string;
  defaultParams: string;
  isActive: boolean;
  order: number;
}

const initialFormData: AiModelFormData = {
  name: '',
  nameEn: '',
  modelId: '',
  category: 'BACKGROUND_REMOVAL',
  description: '',
  iconUrl: '',
  apiKey: '',
  defaultParams: '{}',
  isActive: true,
  order: 0,
};

const categoryLabels: Record<AiModelCategory, { label: string; icon: string; color: string }> = {
  IMAGE_GENERATION: { label: '이미지 생성', icon: '🎨', color: 'bg-purple-100 text-purple-700' },
  BACKGROUND_REMOVAL: { label: '배경 제거', icon: '✂️', color: 'bg-blue-100 text-blue-700' },
  UPSCALING: { label: '업스케일링', icon: '🔍', color: 'bg-green-100 text-green-700' },
  VIDEO_GENERATION: { label: '비디오 생성', icon: '🎬', color: 'bg-orange-100 text-orange-700' },
  TEXT_TO_SPEECH: { label: '음성 변환', icon: '🎙️', color: 'bg-pink-100 text-pink-700' },
};

const presetModels = [
  {
    name: '배경 제거',
    nameEn: 'Background Removal',
    modelId: 'fal-ai/birefnet',
    category: 'BACKGROUND_REMOVAL' as AiModelCategory,
    description: '상품 이미지에서 배경을 깔끔하게 제거합니다.',
    defaultParams: {
      model: 'General Use (Light)',
      operating_resolution: '1024x1024',
      output_format: 'png',
      refine_foreground: true,
    },
  },
  {
    name: '이미지 업스케일',
    nameEn: 'Image Upscaler',
    modelId: 'fal-ai/clarity-upscaler',
    category: 'UPSCALING' as AiModelCategory,
    description: '저해상도 이미지를 최대 4배까지 고화질로 확대합니다.',
    defaultParams: {
      upscale_factor: 2,
      creativity: 0.35,
      resemblance: 0.6,
    },
  },
  {
    name: 'AI 비디오 생성',
    nameEn: 'Aurora Video',
    modelId: 'fal-ai/creatify/aurora',
    category: 'VIDEO_GENERATION' as AiModelCategory,
    description: '이미지와 오디오를 결합하여 AI 비디오를 생성합니다.',
    defaultParams: {
      resolution: '720p',
      guidance_scale: 1,
    },
  },
  {
    name: '텍스트 음성 변환',
    nameEn: 'Text to Speech',
    modelId: 'fal-ai/minimax-tts/text-to-speech',
    category: 'TEXT_TO_SPEECH' as AiModelCategory,
    description: '텍스트를 자연스러운 음성으로 변환합니다. 한국어 포함 30개 이상 언어 지원.',
    defaultParams: {
      voice_id: 'Wise_Woman',
      emotion: 'neutral',
      speed: 1.0,
      format: 'mp3',
    },
  },
];

export default function AiModelsManagementPage() {
  const [models, setModels] = useState<AiModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingModel, setEditingModel] = useState<AiModel | null>(null);
  const [formData, setFormData] = useState<AiModelFormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/ai-models');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'AI 모델 목록 조회 실패');
      }
      const data = await response.json();
      setModels(data.models);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingModel(null);
    setFormData(initialFormData);
    setShowModal(true);
  };

  const openEditModal = (model: AiModel) => {
    setEditingModel(model);
    setFormData({
      name: model.name,
      nameEn: model.nameEn,
      modelId: model.modelId,
      category: model.category,
      description: model.description || '',
      iconUrl: model.iconUrl || '',
      apiKey: model.apiKey || '',
      defaultParams: JSON.stringify(model.defaultParams || {}, null, 2),
      isActive: model.isActive,
      order: model.order,
    });
    setShowModal(true);
  };

  const applyPreset = (preset: typeof presetModels[0]) => {
    setFormData({
      ...formData,
      name: preset.name,
      nameEn: preset.nameEn,
      modelId: preset.modelId,
      category: preset.category,
      description: preset.description,
      defaultParams: JSON.stringify(preset.defaultParams, null, 2),
    });
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingModel(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.nameEn || !formData.modelId || !formData.category) {
      alert('모델명(한글, 영문), 모델 ID, 카테고리는 필수입니다.');
      return;
    }

    let parsedParams = {};
    try {
      parsedParams = JSON.parse(formData.defaultParams || '{}');
    } catch {
      alert('기본 파라미터 JSON 형식이 올바르지 않습니다.');
      return;
    }

    try {
      setSaving(true);
      const url = editingModel
        ? `/api/admin/ai-models/${editingModel.id}`
        : '/api/admin/ai-models';

      const response = await fetch(url, {
        method: editingModel ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          defaultParams: parsedParams,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '저장 실패');
      }

      await fetchModels();
      closeModal();
    } catch (err) {
      alert(err instanceof Error ? err.message : '저장에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/ai-models/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '삭제 실패');
      }

      await fetchModels();
      setDeleteConfirm(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제에 실패했습니다');
    }
  };

  const toggleActive = async (model: AiModel) => {
    try {
      const response = await fetch(`/api/admin/ai-models/${model.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !model.isActive }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '상태 변경 실패');
      }

      await fetchModels();
    } catch (err) {
      alert(err instanceof Error ? err.message : '상태 변경에 실패했습니다');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#8BA4B4] border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/admin" className="text-gray-500 hover:text-gray-700">
              ← 관리자
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">AI 모델 관리</h1>
          <p className="text-gray-600 mt-1">fal.ai 연동 모델을 관리합니다. 브랜드사가 사용할 AI 도구를 설정하세요.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-[#8BA4B4] text-white rounded-lg hover:bg-[#6B8A9A] transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          모델 추가
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-600">
          {error}
        </div>
      )}

      {/* 모델 목록 */}
      {models.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
          <div className="text-gray-400 text-6xl mb-4">🤖</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 AI 모델이 없습니다</h3>
          <p className="text-gray-500 mb-4">AI 모델을 추가하여 브랜드사에게 이미지 편집 도구를 제공하세요.</p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-[#8BA4B4] text-white rounded-lg hover:bg-[#6B8A9A] transition-colors"
          >
            첫 모델 추가하기
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">모델</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">모델 ID</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">카테고리</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">사용량</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">상태</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">등록일</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {models.map((model) => (
                <tr key={model.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-600 rounded-lg flex items-center justify-center text-white text-xl">
                        {categoryLabels[model.category]?.icon || '🤖'}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{model.name}</div>
                        <div className="text-sm text-gray-500">{model.nameEn}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono text-xs">
                      {model.modelId}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${categoryLabels[model.category]?.color || 'bg-gray-100 text-gray-700'}`}>
                      {categoryLabels[model.category]?.icon} {categoryLabels[model.category]?.label || model.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-sm">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      {model._count.usageLogs}회
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleActive(model)}
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                        model.isActive
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {model.isActive ? '활성' : '비활성'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(model.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(model)}
                        className="p-2 text-gray-500 hover:text-[#8BA4B4] hover:bg-gray-100 rounded-lg transition-colors"
                        title="수정"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      {deleteConfirm === model.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(model.id)}
                            className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                          >
                            확인
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                          >
                            취소
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(model.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="삭제"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingModel ? 'AI 모델 수정' : '새 AI 모델 추가'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* 프리셋 버튼 */}
              {!editingModel && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    빠른 추가 (프리셋)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {presetModels.map((preset) => (
                      <button
                        key={preset.modelId}
                        type="button"
                        onClick={() => applyPreset(preset)}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center gap-1"
                      >
                        {categoryLabels[preset.category]?.icon} {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    모델명 (한글) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BA4B4] focus:border-transparent"
                    placeholder="배경 제거"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    모델명 (영문) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BA4B4] focus:border-transparent"
                    placeholder="Background Removal"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  fal.ai 모델 ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.modelId}
                  onChange={(e) => setFormData({ ...formData, modelId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BA4B4] focus:border-transparent font-mono text-sm"
                  placeholder="fal-ai/birefnet"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  카테고리 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as AiModelCategory })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BA4B4] focus:border-transparent"
                  required
                >
                  {Object.entries(categoryLabels).map(([key, { label, icon }]) => (
                    <option key={key} value={key}>
                      {icon} {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  모델 설명
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BA4B4] focus:border-transparent"
                  rows={2}
                  placeholder="이 모델이 무엇을 하는지 설명해주세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API 키 <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BA4B4] focus:border-transparent font-mono text-sm"
                  placeholder="fal.ai API 키를 입력하세요"
                  autoComplete="off"
                />
                <p className="mt-1 text-xs text-gray-500">
                  모델별로 다른 API 키를 사용할 수 있습니다
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  기본 파라미터 (JSON)
                </label>
                <textarea
                  value={formData.defaultParams}
                  onChange={(e) => setFormData({ ...formData, defaultParams: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BA4B4] focus:border-transparent font-mono text-sm"
                  rows={4}
                  placeholder="{}"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    아이콘 URL
                  </label>
                  <input
                    type="url"
                    value={formData.iconUrl}
                    onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BA4B4] focus:border-transparent"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    표시 순서
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BA4B4] focus:border-transparent"
                    min={0}
                  />
                </div>
              </div>

              {editingModel && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-[#8BA4B4] rounded focus:ring-[#8BA4B4]"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700">
                    활성 상태
                  </label>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={saving}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#8BA4B4] text-white rounded-lg hover:bg-[#6B8A9A] transition-colors disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? '저장 중...' : (editingModel ? '수정' : '추가')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
