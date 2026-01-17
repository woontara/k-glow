'use client';

import { useState, useRef, useEffect } from 'react';
import { HSCode, searchHSCodes, hsCodeCategories } from '@/data/hs-codes-cosmetics';

interface HSCodeSearchProps {
  value: string;
  onChange: (code: string, hsCode?: HSCode) => void;
  placeholder?: string;
}

export default function HSCodeSearch({ value, onChange, placeholder }: HSCodeSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [results, setResults] = useState<HSCode[]>([]);
  const [selectedHS, setSelectedHS] = useState<HSCode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 검색 결과 업데이트
  useEffect(() => {
    const searchResults = searchHSCodes(searchQuery, selectedCategory);
    setResults(searchResults);
  }, [searchQuery, selectedCategory]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // HS코드 선택
  const handleSelect = (hsCode: HSCode) => {
    setSelectedHS(hsCode);
    onChange(hsCode.code, hsCode);
    setIsOpen(false);
    setSearchQuery('');
  };

  // 선택 해제
  const handleClear = () => {
    setSelectedHS(null);
    onChange('', undefined);
    setSearchQuery('');
  };

  return (
    <div ref={containerRef} className="relative">
      {/* 선택된 HS코드 표시 또는 검색 입력 */}
      {selectedHS ? (
        <div className="flex items-center gap-2 p-3 bg-[#8BA4B4]/10 border border-[#8BA4B4] rounded-xl">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold text-[#8BA4B4]">{selectedHS.code}</span>
              <span className="text-xs px-2 py-0.5 bg-[#8BA4B4]/20 rounded-full">{selectedHS.category}</span>
            </div>
            <div className="text-sm text-gray-700 mt-1">{selectedHS.nameKo}</div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <div
          className="relative cursor-pointer"
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 100);
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder || '제품명 또는 HS코드로 검색 (예: 크림, 3304)'}
            className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8BA4B4] focus:border-transparent transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      )}

      {/* 드롭다운 */}
      {isOpen && !selectedHS && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-[400px] overflow-hidden">
          {/* 카테고리 필터 */}
          <div className="p-3 border-b border-gray-100 bg-gray-50">
            <div className="flex flex-wrap gap-1.5">
              {hsCodeCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 text-xs rounded-full transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#8BA4B4] text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-[#8BA4B4]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 검색 결과 */}
          <div className="max-h-[300px] overflow-y-auto">
            {results.length > 0 ? (
              results.map((hs) => (
                <button
                  key={hs.code}
                  type="button"
                  onClick={() => handleSelect(hs)}
                  className="w-full text-left p-3 hover:bg-[#8BA4B4]/5 border-b border-gray-50 last:border-0 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-semibold text-[#8BA4B4]">{hs.code}</span>
                    <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                      {hs.category}
                    </span>
                  </div>
                  <div className="text-sm text-gray-800">{hs.nameKo}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{hs.nameEn}</div>
                  {/* 관련 키워드 표시 */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {hs.keywords.slice(0, 5).map((kw, idx) => (
                      <span key={idx} className="text-xs text-gray-400">
                        #{kw}
                      </span>
                    ))}
                    {hs.keywords.length > 5 && (
                      <span className="text-xs text-gray-400">+{hs.keywords.length - 5}</span>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                <svg className="w-10 h-10 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm">검색 결과가 없습니다</p>
                <p className="text-xs mt-1">다른 검색어를 입력해보세요</p>
              </div>
            )}
          </div>

          {/* 안내 문구 */}
          <div className="p-2 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              화장품 수출에 적합한 HS코드를 선택해주세요
            </p>
          </div>
        </div>
      )}

      {/* 숨겨진 input (폼 제출용) */}
      <input type="hidden" name="hsCode" value={value} />
    </div>
  );
}
