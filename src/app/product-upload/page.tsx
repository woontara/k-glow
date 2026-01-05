'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';

interface ProductRow {
  상품코드: string;
  '자체 상품코드': string;
  진열상태: string;
  판매상태: string;
  상품명: string;
  '영문 상품명': string;
  판매가: string;
  공급가: string;
  소비자가: string;
  제조사: string;
  브랜드: string;
  원산지: string;
  [key: string]: string;
}

// Liquid Blob Component
function LiquidBlob({ size, color, x, y, delay, duration }: {
  size: number;
  color: string;
  x: string;
  y: string;
  delay: number;
  duration: number;
}) {
  return (
    <div
      className="absolute rounded-full opacity-40 blur-3xl animate-liquid pointer-events-none"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        left: x,
        top: y,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    />
  );
}

// Premium Card Component
function PremiumCard({
  children,
  className = '',
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current || !hover) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, [hover]);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-3xl bg-white/60 backdrop-blur-2xl border border-white/40 shadow-xl transition-all duration-500 ${hover ? 'hover:shadow-2xl hover:border-[#8BA4B4]/30' : ''} ${className}`}
      style={{
        transform: hover && isHovered ? 'translateY(-4px)' : 'translateY(0)',
      }}
    >
      {hover && isHovered && (
        <div
          className="absolute inset-0 opacity-30 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 200px at ${mousePosition.x}% ${mousePosition.y}%, rgba(139, 164, 180, 0.4), transparent)`,
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />
      <div className="relative z-10 p-6">
        {children}
      </div>
    </div>
  );
}

// Feature Card Component
function FeatureCard({
  icon,
  title,
  description,
  gradient,
  index,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  index: number;
}) {
  return (
    <div
      className="group text-center animate-reveal"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="font-bold text-[#2D3436] mb-1">{title}</h3>
      <p className="text-sm text-[#9EA7AA]">{description}</p>
    </div>
  );
}

export default function ProductUploadPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string): ProductRow[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^\uFEFF/, ''));
    const rows: ProductRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values: string[] = [];
      let current = '';
      let inQuotes = false;

      for (const char of lines[i]) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const row: ProductRow = {} as ProductRow;
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      if (row['상품명'] || row['자체 상품코드']) {
        rows.push(row);
      }
    }

    return rows;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploadSuccess(false);
    setFileName(file.name);

    try {
      const text = await file.text();
      const parsed = parseCSV(text);

      if (parsed.length === 0) {
        setError('유효한 상품 데이터가 없습니다. CSV 형식을 확인해주세요.');
        return;
      }

      setProducts(parsed);
    } catch (err) {
      setError('파일을 읽는 중 오류가 발생했습니다.');
      console.error(err);
    }
  };

  const handleUpload = async () => {
    if (products.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/products/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '업로드 실패');
      }

      setUploadSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '업로드 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setProducts([]);
    setFileName('');
    setError(null);
    setUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const features = [
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      ),
      title: 'CSV 업로드',
      description: 'cafe24 양식 지원',
      gradient: 'from-[#8BA4B4] to-[#A8C5D4]',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      title: '데이터 검증',
      description: '자동 유효성 검사',
      gradient: 'from-[#A4B4A8] to-[#C4D4C8]',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      title: '미리보기',
      description: '업로드 전 확인',
      gradient: 'from-[#D4C4A8] to-[#E8DCC8]',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
      title: '일괄 등록',
      description: '한번에 상품 등록',
      gradient: 'from-[#E8B4B8] to-[#F0D0D4]',
    },
  ];

  const displayColumns = ['상품코드', '자체 상품코드', '상품명', '판매가', '브랜드', '진열상태', '판매상태'];

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FAFBFC] via-[#F5F7F9] to-[#FAF8F5] relative overflow-hidden">
      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none">
        <LiquidBlob size={600} color="#A8C5D4" x="-10%" y="15%" delay={0} duration={25} />
        <LiquidBlob size={500} color="#A4B4A8" x="75%" y="55%" delay={2} duration={30} />
        <LiquidBlob size={400} color="#D4C4A8" x="45%" y="80%" delay={4} duration={20} />
      </div>

      {/* Grain Texture Overlay */}
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      {/* Header */}
      <section className="relative pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#8BA4B4] hover:text-[#5A7A8A] transition-colors mb-8 group"
          >
            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">홈으로</span>
          </Link>

          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#8BA4B4]/10 to-[#A8C5D4]/10 rounded-full border border-[#8BA4B4]/20 mb-6">
              <svg className="w-4 h-4 text-[#8BA4B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span className="text-[#8BA4B4] font-medium text-sm tracking-wider uppercase">Product Upload</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-[#2D3436] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              상품{' '}
              <span className="bg-gradient-to-r from-[#8BA4B4] via-[#A8C5D4] to-[#8BA4B4] bg-clip-text text-transparent">
                일괄 업로드
              </span>
            </h1>
            <p className="text-lg text-[#636E72] max-w-2xl mx-auto" style={{ fontFamily: 'Pretendard, sans-serif' }}>
              cafe24 양식의 CSV 파일로 상품을 일괄 등록할 수 있습니다
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative pb-32 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Feature Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} index={index} />
            ))}
          </div>

          {/* Upload Card */}
          <div className="max-w-4xl mx-auto">
            <PremiumCard hover={false} className="animate-reveal">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#8BA4B4] to-[#A8C5D4] rounded-2xl flex items-center justify-center shadow-lg shadow-[#8BA4B4]/30">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#2D3436]" style={{ fontFamily: 'Playfair Display, serif' }}>상품 CSV 업로드</h2>
                    <p className="text-sm text-[#9EA7AA]">Product CSV Upload</p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <Link
                    href="/product-upload/list"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#8BA4B4]/20 to-[#A8C5D4]/20 text-[#5A7A8A] font-medium rounded-xl border border-[#8BA4B4]/30 hover:border-[#8BA4B4]/50 transition-all hover:-translate-y-0.5"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    상품 목록
                  </Link>
                  <a
                    href="/templates/cafe24-product-upload-template.csv"
                    download
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#A4B4A8]/20 to-[#C4D4C8]/20 text-[#5A7A8A] font-medium rounded-xl border border-[#A4B4A8]/30 hover:border-[#A4B4A8]/50 transition-all hover:-translate-y-0.5"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    양식 다운로드
                  </a>
                </div>
              </div>

              {/* File Upload Area */}
              {products.length === 0 ? (
                <div
                  className="border-2 border-dashed border-[#8BA4B4]/30 rounded-2xl p-12 text-center cursor-pointer hover:border-[#8BA4B4]/50 hover:bg-[#8BA4B4]/5 transition-all"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-20 h-20 bg-gradient-to-br from-[#8BA4B4]/20 to-[#A8C5D4]/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-[#8BA4B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-lg font-semibold text-[#2D3436] mb-2">CSV 파일을 드래그하거나 클릭하여 업로드</p>
                  <p className="text-sm text-[#9EA7AA]">cafe24 상품 업로드 양식을 사용해주세요</p>
                </div>
              ) : (
                <>
                  {/* File Info */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#A4B4A8]/20 to-[#C4D4C8]/10 rounded-xl mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#A4B4A8] rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-[#2D3436]">{fileName}</p>
                        <p className="text-sm text-[#9EA7AA]">{products.length}개 상품</p>
                      </div>
                    </div>
                    <button
                      onClick={handleReset}
                      className="p-2 text-[#E8B4B8] hover:bg-[#E8B4B8]/10 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Preview Table */}
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#E8E2D9]">
                          {displayColumns.map(col => (
                            <th key={col} className="px-4 py-3 text-left font-semibold text-[#5A7A8A] whitespace-nowrap">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {products.slice(0, 10).map((product, index) => (
                          <tr key={index} className="border-b border-[#E8E2D9]/50 hover:bg-[#8BA4B4]/5">
                            {displayColumns.map(col => (
                              <td key={col} className="px-4 py-3 text-[#2D3436] whitespace-nowrap max-w-[200px] truncate">
                                {col === '판매가' ? (
                                  product[col] ? `${Number(product[col]).toLocaleString()}원` : '-'
                                ) : col === '진열상태' || col === '판매상태' ? (
                                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                    product[col] === 'Y'
                                      ? 'bg-[#A4B4A8]/20 text-[#5A8A6A]'
                                      : 'bg-[#E8B4B8]/20 text-[#8A5A5A]'
                                  }`}>
                                    {product[col] === 'Y' ? '사용' : '미사용'}
                                  </span>
                                ) : (
                                  product[col] || '-'
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {products.length > 10 && (
                      <p className="text-center text-sm text-[#9EA7AA] mt-4">
                        ... 외 {products.length - 10}개 상품
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Error */}
              {error && (
                <div className="mb-6 p-5 bg-gradient-to-br from-[#E8B4B8]/20 to-[#D4A4A8]/10 rounded-2xl border border-[#E8B4B8]/30">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#E8B4B8] rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-[#2D3436]">오류 발생</p>
                      <p className="text-sm text-[#636E72]">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Success */}
              {uploadSuccess && (
                <div className="mb-6 p-5 bg-gradient-to-br from-[#A4B4A8]/20 to-[#C4D4C8]/10 rounded-2xl border border-[#A4B4A8]/30">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#A4B4A8] rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-[#2D3436]">업로드 완료</p>
                      <p className="text-sm text-[#636E72]">{products.length}개 상품이 성공적으로 등록되었습니다.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {products.length > 0 && !uploadSuccess && (
                <div className="flex gap-4">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-4 border-2 border-[#E8E2D9] text-[#636E72] font-semibold rounded-2xl hover:border-[#8BA4B4]/30 hover:text-[#5A7A8A] transition-all"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={isLoading}
                    className="flex-1 py-4 bg-gradient-to-r from-[#8BA4B4] via-[#9BB4C4] to-[#A8C5D4] text-white font-bold rounded-2xl shadow-xl shadow-[#8BA4B4]/30 hover:shadow-2xl hover:shadow-[#8BA4B4]/40 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-3 relative z-10">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        업로드 중...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2 relative z-10">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        {products.length}개 상품 업로드
                      </span>
                    )}
                  </button>
                </div>
              )}

              {uploadSuccess && (
                <button
                  onClick={handleReset}
                  className="w-full py-4 bg-gradient-to-r from-[#8BA4B4] via-[#9BB4C4] to-[#A8C5D4] text-white font-bold rounded-2xl shadow-xl shadow-[#8BA4B4]/30 hover:shadow-2xl hover:shadow-[#8BA4B4]/40 transition-all hover:-translate-y-1"
                >
                  새 파일 업로드
                </button>
              )}
            </PremiumCard>

            {/* Info Box */}
            <div className="mt-8 p-5 bg-gradient-to-br from-[#D4C4A8]/20 to-[#C4B498]/10 rounded-2xl border border-[#D4C4A8]/30 animate-reveal" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#D4C4A8] rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-[#5A7A8A] mb-2">안내 사항</p>
                  <ul className="space-y-1.5 text-sm text-[#636E72]">
                    <li className="flex items-start gap-2">
                      <span className="text-[#D4C4A8] mt-0.5">•</span>
                      cafe24 상품 업로드 양식(CSV)만 지원합니다
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#D4C4A8] mt-0.5">•</span>
                      필수 항목: 상품명, 판매가, 진열상태, 판매상태
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#D4C4A8] mt-0.5">•</span>
                      파일 인코딩은 UTF-8 또는 EUC-KR을 지원합니다
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#D4C4A8] mt-0.5">•</span>
                      최대 1,000개 상품까지 한번에 업로드 가능합니다
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');

        @keyframes liquid {
          0%, 100% {
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
            transform: rotate(0deg) scale(1);
          }
          25% {
            border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
          }
          50% {
            border-radius: 50% 60% 30% 60% / 30% 60% 70% 40%;
            transform: rotate(180deg) scale(1.1);
          }
          75% {
            border-radius: 60% 40% 60% 30% / 70% 30% 50% 60%;
          }
        }

        @keyframes reveal {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-liquid {
          animation: liquid 20s ease-in-out infinite;
        }

        .animate-reveal {
          animation: reveal 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </main>
  );
}
