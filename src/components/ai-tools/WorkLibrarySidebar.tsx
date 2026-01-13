'use client';

import { useState, useEffect, useRef } from 'react';
import { WorkItemType } from '@prisma/client';

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
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

        {/* Filter Tabs */}
        {!filterType && (
          <div className="flex border-b dark:border-gray-700">
            {(['ALL', 'AUDIO', 'IMAGE', 'VIDEO'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  activeFilter === filter
                    ? 'text-[#8BA4B4] border-b-2 border-[#8BA4B4]'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {filter === 'ALL' ? '전체' : filter === 'AUDIO' ? '음성' : filter === 'IMAGE' ? '이미지' : '비디오'}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: 'calc(100vh - 120px)' }}>
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
              <p className="text-xs mt-1 text-gray-400">AI 도구에서 결과물을 저장해보세요</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelect?.(item)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer group ${
                    selectedItemId === item.id
                      ? 'border-[#8BA4B4] bg-[#8BA4B4]/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-[#8BA4B4]/50 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Thumbnail / Icon */}
                    <div className="flex-shrink-0 w-12 h-12 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                      {item.type === 'IMAGE' && item.url ? (
                        <img src={item.url} alt="" className="w-full h-full object-cover" />
                      ) : item.type === 'VIDEO' && item.thumbnail ? (
                        <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-400">{getTypeIcon(item.type)}</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span className={`px-1.5 py-0.5 rounded ${
                          item.type === 'AUDIO' ? 'bg-purple-100 text-purple-600' :
                          item.type === 'IMAGE' ? 'bg-blue-100 text-blue-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          {item.type === 'AUDIO' ? '음성' : item.type === 'IMAGE' ? '이미지' : '비디오'}
                        </span>
                        {item.metadata?.duration && (
                          <span>{formatDuration(item.metadata.duration)}</span>
                        )}
                        {item.metadata?.fileSize && (
                          <span>{formatFileSize(item.metadata.fileSize)}</span>
                        )}
                      </div>
                    </div>

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
