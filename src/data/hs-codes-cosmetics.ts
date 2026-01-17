// 화장품 관련 HS 코드 데이터
// 러시아/유라시아 수출용 화장품 HS 코드

export interface HSCode {
  code: string;
  nameKo: string;
  nameEn: string;
  category: string;
  keywords: string[]; // 검색용 키워드
}

export const cosmeticsHSCodes: HSCode[] = [
  // 3304 - 미용 또는 메이크업 제품
  {
    code: '3304.10',
    nameKo: '입술 화장용 제품류',
    nameEn: 'Lip make-up preparations',
    category: '메이크업',
    keywords: ['립스틱', '립글로스', '립밤', '립틴트', '립라이너', '립케어'],
  },
  {
    code: '3304.20',
    nameKo: '눈 화장용 제품류',
    nameEn: 'Eye make-up preparations',
    category: '메이크업',
    keywords: ['아이섀도', '아이라이너', '마스카라', '아이브로우', '눈썹', '속눈썹'],
  },
  {
    code: '3304.30',
    nameKo: '매니큐어용 또는 페디큐어용 제품류',
    nameEn: 'Manicure or pedicure preparations',
    category: '네일',
    keywords: ['매니큐어', '네일', '페디큐어', '손톱', '발톱', '네일폴리시', '젤네일'],
  },
  {
    code: '3304.91',
    nameKo: '파우더류 (압축한 것인지에 상관없다)',
    nameEn: 'Powders, whether or not compressed',
    category: '메이크업',
    keywords: ['파우더', '팩트', '파운데이션', '쿠션', '컴팩트', '피니싱파우더', '세팅파우더'],
  },
  {
    code: '3304.99',
    nameKo: '기타 미용이나 메이크업 제품류와 기초화장용 제품류',
    nameEn: 'Other beauty or make-up preparations',
    category: '스킨케어',
    keywords: [
      '크림', '로션', '에센스', '세럼', '토너', '스킨', '에멀전',
      '수분크림', '영양크림', '아이크림', '선크림', '자외선차단',
      'BB크림', 'CC크림', '프라이머', '메이크업베이스',
      '클렌징', '클렌저', '폼클렌징', '오일클렌징', '미셀라워터',
      '마스크', '마스크팩', '시트마스크', '슬리핑마스크', '워시오프',
      '앰플', '부스터', '미스트', '페이셜오일',
    ],
  },

  // 3305 - 두발용 제품류
  {
    code: '3305.10',
    nameKo: '샴푸',
    nameEn: 'Shampoos',
    category: '헤어케어',
    keywords: ['샴푸', '두피', '탈모샴푸', '비듬샴푸'],
  },
  {
    code: '3305.20',
    nameKo: '퍼머넌트 웨이빙용 또는 스트레이트닝용 제품류',
    nameEn: 'Preparations for permanent waving or straightening',
    category: '헤어케어',
    keywords: ['퍼머', '펌', '웨이브', '스트레이트', '매직'],
  },
  {
    code: '3305.30',
    nameKo: '헤어 래커',
    nameEn: 'Hair lacquers',
    category: '헤어케어',
    keywords: ['헤어스프레이', '래커', '헤어픽서', '무스'],
  },
  {
    code: '3305.90',
    nameKo: '기타 두발용 제품류',
    nameEn: 'Other hair preparations',
    category: '헤어케어',
    keywords: [
      '린스', '컨디셔너', '트리트먼트', '헤어팩', '헤어에센스',
      '헤어오일', '염색', '헤어컬러', '탈색', '헤어토닉',
      '두피케어', '헤어세럼', '헤어마스크',
    ],
  },

  // 3307 - 면도 전후 제품, 데오도란트, 목욕 제품 등
  {
    code: '3307.10',
    nameKo: '면도 전 제품류, 면도용 제품류, 면도 후 제품류',
    nameEn: 'Pre-shave, shaving or after-shave preparations',
    category: '면도/쉐이빙',
    keywords: ['쉐이빙', '면도', '애프터쉐이브', '쉐이빙폼', '쉐이빙젤'],
  },
  {
    code: '3307.20',
    nameKo: '체취 방지제와 땀 억제제',
    nameEn: 'Personal deodorants and antiperspirants',
    category: '바디케어',
    keywords: ['데오도란트', '체취', '땀억제', '바디미스트'],
  },
  {
    code: '3307.30',
    nameKo: '향료를 첨가한 목욕용 소금과 그 밖의 목욕용 제품류',
    nameEn: 'Perfumed bath salts and other bath preparations',
    category: '바디케어',
    keywords: ['입욕제', '배스', '목욕', '버블바스', '바스밤', '바스솔트'],
  },
  {
    code: '3307.41',
    nameKo: '아가바티(Agarbatti)와 그 밖의 냄새를 피워서 내는 향료 제품류',
    nameEn: 'Agarbatti and other odoriferous preparations which operate by burning',
    category: '향료',
    keywords: ['인센스', '향', '아로마'],
  },
  {
    code: '3307.49',
    nameKo: '기타 실내 방향용 조제품',
    nameEn: 'Other room perfuming preparations',
    category: '향료',
    keywords: ['방향제', '디퓨저', '룸스프레이', '캔들'],
  },
  {
    code: '3307.90',
    nameKo: '기타 (제모용 제품류 등)',
    nameEn: 'Other (depilatory preparations, etc.)',
    category: '바디케어',
    keywords: [
      '제모', '왁싱', '바디로션', '바디크림', '바디오일',
      '핸드크림', '풋크림', '바디워시', '바디클렌저',
      '각질제거', '스크럽', '필링',
    ],
  },

  // 3303 - 향수류
  {
    code: '3303.00',
    nameKo: '향수류와 화장수',
    nameEn: 'Perfumes and toilet waters',
    category: '향수',
    keywords: ['향수', '퍼퓸', '오드뚜왈렛', '오드퍼퓸', '코롱', '화장수'],
  },

  // 3401 - 비누류
  {
    code: '3401.11',
    nameKo: '화장용, 목욕용 비누 (약용 포함)',
    nameEn: 'Soap for toilet use (including medicated)',
    category: '클렌징',
    keywords: ['비누', '솝', '클렌징바', '세안비누', '바디솝'],
  },
  {
    code: '3401.20',
    nameKo: '기타 형상의 비누',
    nameEn: 'Soap in other forms',
    category: '클렌징',
    keywords: ['액체비누', '핸드워시', '핸드솝'],
  },
  {
    code: '3401.30',
    nameKo: '피부 세정용 유기계면활성제품과 조제품',
    nameEn: 'Organic surface-active products for skin washing',
    category: '클렌징',
    keywords: ['클렌징폼', '페이셜워시', '클렌징젤', '클렌징밀크'],
  },
];

// 카테고리 목록
export const hsCodeCategories = [
  '전체',
  '스킨케어',
  '메이크업',
  '헤어케어',
  '바디케어',
  '클렌징',
  '네일',
  '향수',
  '면도/쉐이빙',
  '향료',
];

// HS 코드 검색 함수
export function searchHSCodes(query: string, category?: string): HSCode[] {
  const normalizedQuery = query.toLowerCase().trim();

  let results = cosmeticsHSCodes;

  // 카테고리 필터
  if (category && category !== '전체') {
    results = results.filter(hs => hs.category === category);
  }

  // 검색어가 없으면 전체 반환
  if (!normalizedQuery) {
    return results;
  }

  // 검색어로 필터링
  return results.filter(hs => {
    // HS 코드로 검색
    if (hs.code.includes(normalizedQuery)) return true;

    // 한글 이름으로 검색
    if (hs.nameKo.toLowerCase().includes(normalizedQuery)) return true;

    // 영문 이름으로 검색
    if (hs.nameEn.toLowerCase().includes(normalizedQuery)) return true;

    // 키워드로 검색
    if (hs.keywords.some(kw => kw.includes(normalizedQuery))) return true;

    return false;
  });
}
