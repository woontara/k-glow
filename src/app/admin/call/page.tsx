'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CallLog {
  id: string;
  to: string;
  type: 'call' | 'sms';
  message: string;
  timestamp: Date;
  status: 'success' | 'failed';
}

export default function CallAdminPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'call' | 'sms'>('call');
  const [loading, setLoading] = useState(false);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);

  useEffect(() => {
    checkConfiguration();
  }, []);

  const checkConfiguration = async () => {
    try {
      const res = await fetch('/api/call');
      const data = await res.json();
      setConfigured(data.configured);
    } catch {
      setConfigured(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || !message) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: phoneNumber, message, type }),
      });

      const data = await res.json();

      if (res.ok) {
        setResult({ success: true, message: `${type === 'call' ? '전화' : 'SMS'} 발신 성공!` });
        setCallLogs(prev => [{
          id: data.sid,
          to: phoneNumber,
          type,
          message,
          timestamp: new Date(),
          status: 'success'
        }, ...prev]);
        setPhoneNumber('');
        setMessage('');
      } else {
        setResult({ success: false, message: data.error || '발신 실패' });
      }
    } catch (error) {
      setResult({ success: false, message: '네트워크 오류가 발생했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const presetMessages = [
    { label: '진행상황 안내', text: '안녕하세요, K-Glow입니다. 요청하신 건에 대해 진행상황을 안내드립니다.' },
    { label: '상담 요청', text: '안녕하세요, K-Glow입니다. 상담 관련하여 연락드렸습니다. 편하신 시간에 회신 부탁드립니다.' },
    { label: '입점 완료', text: '안녕하세요, K-Glow입니다. 축하드립니다! 마켓플레이스 입점이 완료되었습니다.' },
    { label: '서류 요청', text: '안녕하세요, K-Glow입니다. 진행을 위해 추가 서류가 필요합니다. 확인 부탁드립니다.' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <Link href="/admin" className="text-gray-500 hover:text-gray-700 mb-2 inline-block">
          ← 관리자 대시보드
        </Link>
        <h1 className="text-3xl font-bold mb-2">전화/SMS 발신</h1>
        <p className="text-gray-600">고객사에게 전화 또는 SMS를 발신합니다</p>
      </div>

      {/* 설정 상태 */}
      {configured === false && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-medium text-yellow-800">Twilio 설정이 필요합니다</p>
              <p className="text-sm text-yellow-700">
                환경변수를 설정해주세요: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* 발신 폼 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-6">새 발신</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 발신 유형 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">발신 유형</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setType('call')}
                  className={`flex-1 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    type === 'call'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>📞</span> 전화
                </button>
                <button
                  type="button"
                  onClick={() => setType('sms')}
                  className={`flex-1 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    type === 'sms'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>💬</span> SMS
                </button>
              </div>
            </div>

            {/* 전화번호 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+821012345678"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">국제 형식으로 입력 (예: +821012345678)</p>
            </div>

            {/* 메시지 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {type === 'call' ? '음성 메시지' : 'SMS 내용'}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={type === 'call' ? '전화로 전달할 메시지를 입력하세요' : 'SMS 내용을 입력하세요'}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
            </div>

            {/* 빠른 메시지 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">빠른 메시지</label>
              <div className="flex flex-wrap gap-2">
                {presetMessages.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setMessage(preset.text)}
                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 결과 메시지 */}
            {result && (
              <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {result.message}
              </div>
            )}

            {/* 발신 버튼 */}
            <button
              type="submit"
              disabled={loading || !phoneNumber || !message || configured === false}
              className={`w-full py-4 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                type === 'call'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
              } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  발신 중...
                </>
              ) : (
                <>
                  {type === 'call' ? '📞 전화 걸기' : '💬 SMS 보내기'}
                </>
              )}
            </button>
          </form>
        </div>

        {/* 발신 기록 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-6">최근 발신 기록</h2>

          {callLogs.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <div className="text-4xl mb-3">📋</div>
              <p>발신 기록이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-3">
              {callLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        log.type === 'call' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {log.type === 'call' ? '📞 전화' : '💬 SMS'}
                      </span>
                      <span className="font-medium">{log.to}</span>
                    </div>
                    <span className={`text-xs ${log.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                      {log.status === 'success' ? '성공' : '실패'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{log.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {log.timestamp.toLocaleString('ko-KR')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
