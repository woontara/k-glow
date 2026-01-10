'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Brand {
  id: string;
  name: string;
  nameKo: string;
  skuPrefix: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: 'BRAND' | 'BUYER' | 'ADMIN';
  companyName: string | null;
  brandId: string | null;
  brand: Brand | null;
  createdAt: string;
}

interface UserFormData {
  email: string;
  name: string;
  password: string;
  role: 'BRAND' | 'BUYER' | 'ADMIN';
  companyName: string;
  brandId: string;
}

const initialFormData: UserFormData = {
  email: '',
  name: '',
  password: '',
  role: 'BRAND',
  companyName: '',
  brandId: '',
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: '관리자',
  BRAND: '브랜드',
  BUYER: '바이어',
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700',
  BRAND: 'bg-blue-100 text-blue-700',
  BUYER: 'bg-green-100 text-green-700',
};

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<string>('');
  const [filterBrand, setFilterBrand] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, [filterRole, filterBrand]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // 사용자 목록 조회
      const params = new URLSearchParams();
      if (filterRole) params.append('role', filterRole);
      if (filterBrand) params.append('brandId', filterBrand);

      const [usersRes, brandsRes] = await Promise.all([
        fetch(`/api/admin/users?${params.toString()}`),
        fetch('/api/admin/brands'),
      ]);

      if (!usersRes.ok || !brandsRes.ok) {
        throw new Error('데이터 로드 실패');
      }

      const usersData = await usersRes.json();
      const brandsData = await brandsRes.json();

      setUsers(usersData.users);
      setBrands(brandsData.brands);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData(initialFormData);
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      name: user.name,
      password: '',
      role: user.role,
      companyName: user.companyName || '',
      brandId: user.brandId || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.name) {
      alert('이메일과 이름은 필수입니다.');
      return;
    }

    if (!editingUser && !formData.password) {
      alert('새 사용자는 비밀번호가 필수입니다.');
      return;
    }

    try {
      setSaving(true);
      const url = editingUser
        ? `/api/admin/users/${editingUser.id}`
        : '/api/admin/users';

      const bodyData: Record<string, unknown> = {
        name: formData.name,
        role: formData.role,
        companyName: formData.companyName || null,
        brandId: formData.brandId || null,
      };

      if (!editingUser) {
        bodyData.email = formData.email;
        bodyData.password = formData.password;
      } else if (formData.password) {
        bodyData.password = formData.password;
      }

      const response = await fetch(url, {
        method: editingUser ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '저장 실패');
      }

      await fetchData();
      closeModal();
    } catch (err) {
      alert(err instanceof Error ? err.message : '저장에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '삭제 실패');
      }

      await fetchData();
      setDeleteConfirm(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제에 실패했습니다');
    }
  };

  const handleBrandChange = async (userId: string, brandId: string | null) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '브랜드 연결 실패');
      }

      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : '브랜드 연결에 실패했습니다');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading && users.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">사용자 관리</h1>
          <p className="text-gray-600 mt-1">사용자 계정을 관리하고 브랜드를 연결합니다.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-[#8BA4B4] text-white rounded-lg hover:bg-[#6B8A9A] transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          사용자 추가
        </button>
      </div>

      {/* 필터 */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">역할</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BA4B4] focus:border-transparent"
            >
              <option value="">전체</option>
              <option value="BRAND">브랜드</option>
              <option value="BUYER">바이어</option>
              <option value="ADMIN">관리자</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">브랜드</label>
            <select
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BA4B4] focus:border-transparent"
            >
              <option value="">전체</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.nameKo} ({brand.skuPrefix})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-600">
          {error}
        </div>
      )}

      {/* 사용자 목록 */}
      {users.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">사용자가 없습니다</h3>
          <p className="text-gray-500 mb-4">새 사용자를 추가하세요.</p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-[#8BA4B4] text-white rounded-lg hover:bg-[#6B8A9A] transition-colors"
          >
            첫 사용자 추가하기
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">사용자</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">역할</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">연결된 브랜드</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">회사명</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">가입일</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[user.role]}`}>
                      {ROLE_LABELS[user.role]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.role === 'BRAND' ? (
                      <select
                        value={user.brandId || ''}
                        onChange={(e) => handleBrandChange(user.id, e.target.value || null)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#8BA4B4] focus:border-transparent"
                      >
                        <option value="">브랜드 선택...</option>
                        {brands.map((brand) => (
                          <option key={brand.id} value={brand.id}>
                            {brand.nameKo} ({brand.skuPrefix})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.companyName || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-2 text-gray-500 hover:text-[#8BA4B4] hover:bg-gray-100 rounded-lg transition-colors"
                        title="수정"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      {deleteConfirm === user.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(user.id)}
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
                          onClick={() => setDeleteConfirm(user.id)}
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
                {editingUser ? '사용자 수정' : '새 사용자 추가'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이메일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BA4B4] focus:border-transparent disabled:bg-gray-100"
                  placeholder="user@example.com"
                  required
                  disabled={!!editingUser}
                />
                {editingUser && (
                  <p className="mt-1 text-xs text-gray-500">이메일은 변경할 수 없습니다</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BA4B4] focus:border-transparent"
                  placeholder="홍길동"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  비밀번호 {!editingUser && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BA4B4] focus:border-transparent"
                  placeholder={editingUser ? '변경 시에만 입력' : '비밀번호'}
                  required={!editingUser}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    역할
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'BRAND' | 'BUYER' | 'ADMIN' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BA4B4] focus:border-transparent"
                  >
                    <option value="BRAND">브랜드</option>
                    <option value="BUYER">바이어</option>
                    <option value="ADMIN">관리자</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    회사명
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BA4B4] focus:border-transparent"
                    placeholder="회사명"
                  />
                </div>
              </div>

              {formData.role === 'BRAND' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    연결 브랜드
                  </label>
                  <select
                    value={formData.brandId}
                    onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BA4B4] focus:border-transparent"
                  >
                    <option value="">브랜드 선택...</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.nameKo} ({brand.skuPrefix})
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    브랜드를 연결하면 해당 SKU 접두사의 데이터만 조회 가능합니다
                  </p>
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
                  {saving ? '저장 중...' : (editingUser ? '수정' : '추가')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
