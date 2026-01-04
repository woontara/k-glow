import Link from 'next/link';

interface PartnerCardProps {
  id: string;
  name: string;
  nameRu: string;
  description: string;
  descriptionRu: string;
  logoUrl?: string;
  marketScore: number;
  productCount: number;
  websiteUrl: string;
}

export default function PartnerCard({
  id,
  name,
  nameRu,
  description,
  logoUrl,
  marketScore,
  productCount,
  websiteUrl,
}: PartnerCardProps) {
  // 시장 점수에 따른 색상
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[#A4B4A8] bg-[#A4B4A8]/10 border-[#A4B4A8]/30';
    if (score >= 60) return 'text-[#8BA4B4] bg-[#8BA4B4]/10 border-[#8BA4B4]/30';
    if (score >= 40) return 'text-[#D4C4A8] bg-[#D4C4A8]/10 border-[#D4C4A8]/30';
    return 'text-[#636E72] bg-[#636E72]/10 border-[#636E72]/30';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return '우수';
    if (score >= 60) return '양호';
    if (score >= 40) return '보통';
    return '낮음';
  };

  return (
    <Link href={`/partners/${id}`}>
      <div className="group bg-white/80 backdrop-blur-sm border border-[#E8E2D9] rounded-2xl p-6 hover:shadow-[0_8px_32px_rgba(139,164,180,0.15)] hover:border-[#8BA4B4]/30 transition-all cursor-pointer">
        {/* 로고 & 제목 */}
        <div className="flex items-start gap-4 mb-4">
          {logoUrl ? (
            <div className="w-14 h-14 flex-shrink-0 bg-[#FAF8F5] rounded-xl p-2 border border-[#E8E2D9]">
              <img
                src={logoUrl}
                alt={name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className="w-14 h-14 flex-shrink-0 bg-gradient-to-br from-[#8BA4B4] to-[#A8C5D4] rounded-xl flex items-center justify-center">
              <span className="text-white text-xl font-bold">{name.charAt(0)}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-[#2D3436] mb-0.5 truncate group-hover:text-[#5A7A8A] transition-colors">{name}</h3>
            <p className="text-sm text-[#8BA4B4] truncate">{nameRu}</p>
          </div>
        </div>

        {/* 설명 */}
        <p className="text-sm text-[#636E72] mb-4 line-clamp-2 leading-relaxed">{description}</p>

        {/* 정보 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm">
              <svg className="w-4 h-4 text-[#8BA4B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span className="font-semibold text-[#2D3436]">{productCount}</span>
              <span className="text-[#636E72]">제품</span>
            </div>
            <div className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getScoreColor(marketScore)}`}>
              {getScoreLabel(marketScore)} {marketScore}점
            </div>
          </div>

          {/* 웹사이트 링크 */}
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-[#8BA4B4] hover:text-[#5A7A8A] transition-colors flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            웹사이트
          </a>
        </div>

        {/* 시장 적합도 바 */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[#636E72]">시장 적합도</span>
            <span className="font-medium text-[#2D3436]">{marketScore}%</span>
          </div>
          <div className="w-full bg-[#E8E2D9] rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-[#8BA4B4] to-[#A8C5D4] h-1.5 rounded-full transition-all"
              style={{ width: `${marketScore}%` }}
            />
          </div>
        </div>

        {/* 자세히 보기 */}
        <div className="pt-4 border-t border-[#E8E2D9]">
          <span className="text-sm text-[#8BA4B4] font-medium group-hover:text-[#5A7A8A] transition-colors flex items-center gap-1">
            상세 정보 보기
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
