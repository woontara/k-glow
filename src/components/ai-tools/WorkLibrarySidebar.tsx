'use client';

import { useState, useEffect, useRef } from 'react';
import { WorkItemType } from '@prisma/client';
import { fal } from '@fal-ai/client';

interface WorkLibraryItem {
  id: string;
  name: string;
  type: WorkItemType;
  url: string;
  thumbnail?: string | null;
  metadata?: {
    duration?: number;
    fileSize?: number;
    width?: number;
    height?: number;
    mimeType?: string;
    originalFilename?: string;
  } | null;
  createdAt: string;
}

interface WorkLibrarySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (item: WorkLibraryItem) => void;
  filterType?: WorkItemType;
  selectedItemId?: string | null;
}

export default function WorkLibrarySidebar({
  isOpen,
  onClose,
  onSelect,
  filterType,
  selectedItemId,
}: WorkLibrarySidebarProps) {
  const [items, setItems] = useState<WorkLibraryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<WorkItemType | 'ALL'>('ALL');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchItems();
    }
  }, [isOpen, filterType]);

  useEffect(() => {
    if (filterType) {
      setActiveFilter(filterType);
    }
  }, [filterType]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const typeParam = filterType ? `?type=${filterType}` : '';
      const res = await fetch(`/api/work-library${typeParam}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (error) {
      console.error('작업물 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('이 작업물을 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/work-library/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setItems(items.filter((item) => item.id !== id));
      }
    } catch (error) {
      console.error('삭제 실패:', error);
    }
  };

  const handlePlayAudio = (item: WorkLibraryItem, e: React.MouseEvent) => {
    e.stopPropagation();

    if (playingAudioId === item.id) {
      audioRef.current?.pause();
      setPlayingAudioId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(item.url);
    audioRef.current = audio;
    audio.play();
    setPlayingAudioId(item.id);

    audio.onended = () => {
      setPlayingAudioId(null);
    };
  };

  // 파일 업로드 처리 (공통 함수)
  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setUploading(true);

    try {
      // fal.ai API 키 가져오기
      console.log('[Library] API 키 요청 중...');
      const keyRes = await fetch('/api/ai-tools/key?modelId=any');

      if (!keyRes.ok) {
        const errorData = await keyRes.json();
        console.error('[Library] API 키 가져오기 실패:', errorData);
        alert(`API 키 오류: ${errorData.error || '알 수 없는 오류'}`);
        return;
      }

      const keyData = await keyRes.json();
      if (!keyData.apiKey) {
        console.error('[Library] API 키가 없습니다');
        alert('API 키가 설정되지 않았습니다.');
        return;
      }

      console.log('[Library] API 키 설정 완료');
      fal.config({ credentials: keyData.apiKey });

      for (const file of files) {
        console.log(`[Library] 파일 업로드 시작: ${file.name}`);

        // fal.ai 스토리지에 업로드
        const url = await fal.storage.upload(file);
        console.log(`[Library] fal.ai 업로드 완료: ${url}`);

        // 라이브러리에 저장
        const res = await fetch('/api/work-library/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: file.name.replace(/\.[^/.]+$/, ''), // 확장자 제거
            url,
            mimeType: file.type,
            fileSize: file.size,
            filename: file.name,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          console.log('[Library] 라이브러리 저장 완료:', data.item);
          setItems((prev) => [data.item, ...prev]);
        } else {
          const errorData = await res.json();
          console.error('[Library] 라이브러리 저장 실패:', errorData);
          alert(`저장 실패: ${errorData.error || '알 수 없는 오류'}`);
        }
      }
    } catch (error) {
      console.error('[Library] 파일 업로드 실패:', error);
      alert(`파일 업로드 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // input 파일 선택 핸들러
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await uploadFiles(Array.from(files));
  };

  // 드래그앤드롭 핸들러
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await uploadFiles(files);
    }
  };

  const filteredItems = activeFilter === 'ALL'
    ? items
    : items.filter((item) => item.type === activeFilter);

  const getTypeIcon = (type: WorkItemType) => {
    switch (type) {
      case 'AUDIO':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        );
      case 'IMAGE':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'VIDEO':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'TEXT':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'FILE':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getTypeLabel = (type: WorkItemType) => {
    switch (type) {
      case 'AUDIO': return '음성';
      case 'IMAGE': return '이미지';
      case 'VIDEO': return '비디오';
      case 'TEXT': return '텍스트';
      case 'FILE': return '파일';
      default: return type;
    }
  };

  const getTypeColor = (type: WorkItemType) => {
    switch (type) {
      case 'AUDIO': return 'bg-purple-100 text-purple-600';
      case 'IMAGE': return 'bg-blue-100 text-blue-600';
      case 'VIDEO': return 'bg-green-100 text-green-600';
      case 'TEXT': return 'bg-yellow-100 text-yellow-600';
      case 'FILE': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar - 왼쪽 배치 */}
      <div className={`fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-900 shadow-xl z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            작업물 라이브러리
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 업로드 영역 (드래그앤드롭 지원) */}
        <div
          className={`p-4 border-b dark:border-gray-700 transition-colors ${
            isDragging ? 'bg-[#8BA4B4]/20' : ''
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,audio/*,video/*,.txt,.md,.json,.csv,.pdf,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`w-full py-4 border-2 border-dashed rounded-lg cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
              isDragging
                ? 'border-[#8BA4B4] bg-[#8BA4B4]/10'
                : 'border-gray-300 hover:border-[#8BA4B4] hover:bg-gray-50'
            } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#8BA4B4] border-t-transparent" />
                <span className="text-sm text-gray-600">업로드 중...</span>
              </>
            ) : isDragging ? (
              <>
                <svg className="w-8 h-8 text-[#8BA4B4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                <span className="text-sm text-[#8BA4B4] font-medium">여기에 놓으세요</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span className="text-sm text-gray-600">클릭 또는 드래그앤드롭</span>
                <span className="text-xs text-gray-400">이미지, 오디오, 비디오, 텍스트</span>
              </>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        {!filterType && (
          <div className="flex border-b dark:border-gray-700 overflow-x-auto">
            {(['ALL', 'IMAGE', 'AUDIO', 'VIDEO', 'TEXT', 'FILE'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`flex-1 py-2 text-xs font-medium transition-colors whitespace-nowrap px-2 ${
                  activeFilter === filter
                    ? 'text-[#8BA4B4] border-b-2 border-[#8BA4B4]'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {filter === 'ALL' ? '전체' : getTypeLabel(filter)}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: 'calc(100vh - 220px)' }}>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8BA4B4]" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <p className="text-sm">저장된 작업물이 없습니다</p>
              <p className="text-xs mt-1 text-gray-400">파일을 업로드하거나 AI 결과물을 저장해보세요</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelect?.(item)}
                  className={`px-2 py-1.5 rounded transition-all cursor-pointer group ${
                    selectedItemId === item.id
                      ? 'bg-[#8BA4B4]/20'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {/* Thumbnail / Icon - 윈도우 자세히 보기 스타일 */}
                    <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center overflow-hidden">
                      {item.type === 'IMAGE' && item.url ? (
                        <img src={item.url} alt="" className="w-5 h-5 object-cover rounded-sm" />
                      ) : item.type === 'VIDEO' && item.thumbnail ? (
                        <img src={item.thumbnail} alt="" className="w-5 h-5 object-cover rounded-sm" />
                      ) : (
                        <span className="text-gray-500">{getTypeIcon(item.type)}</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white truncate">
                        {item.name}
                      </p>
                    </div>

                    {/* 파일 크기 */}
                    {item.metadata?.fileSize && (
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {formatFileSize(item.metadata.fileSize)}
                      </span>
                    )}

                    {/* Actions */}
                    <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.type === 'AUDIO' && (
                        <button
                          onClick={(e) => handlePlayAudio(item, e)}
                          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                          title={playingAudioId === item.id ? '정지' : '재생'}
                        >
                          {playingAudioId === item.id ? (
                            <svg className="w-4 h-4 text-[#8BA4B4]" fill="currentColor" viewBox="0 0 24 24">
                              <rect x="6" y="4" width="4" height="16" />
                              <rect x="14" y="4" width="4" height="16" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          )}
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-gray-400 hover:text-red-500"
                        title="삭제"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
