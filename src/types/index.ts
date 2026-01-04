// 파트너사 (한국 브랜드)
export interface Partner {
  id: string;
  name: string;
  nameRu: string;          // 러시아어 브랜드명
  websiteUrl: string;
  logoUrl: string;
  description: string;
  descriptionRu: string;
  marketScore: number;     // 러시아 시장 적합도
  createdAt: Date;
  updatedAt: Date;
}

// 제품
export interface Product {
  id: string;
  partnerId: string;
  name: string;
  nameRu: string;
  category: string;
  price: number;
  priceRub: number;
  ingredients: string[];
  ingredientsRu: string[];
  description: string;
  descriptionRu: string;
  imageUrls: string[];
  createdAt: Date;
  updatedAt: Date;
}

// 인증 신청
export type CertificationType = 'EAC' | 'GOST' | 'OTHER';
export type CertificationStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';

export interface CertificationRequest {
  id: string;
  userId: string;
  partnerId: string;
  certType: CertificationType;
  status: CertificationStatus;
  documents: string[];
  estimatedCost: number;
  createdAt: Date;
  updatedAt: Date;
}

// 견적
export interface QuoteProduct {
  productId: string;
  quantity: number;
  priceKrw: number;
}

export interface Quote {
  id: string;
  userId: string;
  products: QuoteProduct[];
  totalKrw: number;
  totalRub: number;
  shippingCost: number;
  certificationCost: number;
  exchangeRate: number;
  createdAt: Date;
}

// 사용자
export type UserRole = 'BRAND' | 'BUYER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyName?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 브랜드 분석 입력/출력
export interface AnalyzerInput {
  websiteUrl: string;
  brandName?: string;
  maxDepth?: number;
  targetCategories?: string[];
}

export interface BrandAnalysis {
  name: string;
  nameRu: string;
  description: string;
  descriptionRu: string;
  logoUrl: string;
  marketScore: number;
  strengths: string[];
  strengthsRu: string[];
}

export interface ProductAnalysis {
  name: string;
  nameRu: string;
  category: string;
  price: number;
  ingredients: string[];
  ingredientsRu: string[];
  description: string;
  descriptionRu: string;
  imageUrls: string[];
  sellingPoints: string[];
  sellingPointsRu: string[];
}

export interface AnalyzerOutput {
  brand: BrandAnalysis;
  products: ProductAnalysis[];
  analysis: {
    totalProducts: number;
    categories: string[];
    priceRange: { min: number; max: number };
    keyIngredients: string[];
    competitiveAdvantage: string;
    recommendedProducts: string[];
  };
}
