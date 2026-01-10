import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export interface UserBrandInfo {
  userId: string;
  role: string;
  isAdmin: boolean;
  brandId: string | null;
  skuPrefix: string | null;
  brandName: string | null;
}

/**
 * 현재 세션 사용자의 브랜드 정보 조회
 * - ADMIN: skuPrefix가 null (모든 데이터 접근 가능)
 * - BRAND: 연결된 브랜드의 skuPrefix 반환 (해당 브랜드 데이터만 접근)
 */
export async function getUserBrandInfo(): Promise<UserBrandInfo | null> {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      brand: {
        select: {
          id: true,
          name: true,
          nameKo: true,
          skuPrefix: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  const isAdmin = user.role === 'ADMIN';

  return {
    userId: user.id,
    role: user.role,
    isAdmin,
    brandId: user.brand?.id || null,
    skuPrefix: isAdmin ? null : (user.brand?.skuPrefix || null),
    brandName: user.brand?.nameKo || user.brand?.name || null,
  };
}

/**
 * 브랜드 사용자 권한 확인
 * - 브랜드가 연결되어 있거나 관리자인 경우 true
 */
export async function canAccessBrandDashboard(): Promise<{
  authorized: boolean;
  userBrand: UserBrandInfo | null;
  error?: string;
}> {
  const userBrand = await getUserBrandInfo();

  if (!userBrand) {
    return {
      authorized: false,
      userBrand: null,
      error: '로그인이 필요합니다',
    };
  }

  // 관리자는 항상 접근 가능
  if (userBrand.isAdmin) {
    return { authorized: true, userBrand };
  }

  // BRAND 역할이지만 브랜드가 연결되지 않은 경우
  if (!userBrand.brandId) {
    return {
      authorized: false,
      userBrand,
      error: '브랜드가 연결되지 않았습니다. 관리자에게 문의하세요.',
    };
  }

  return { authorized: true, userBrand };
}
