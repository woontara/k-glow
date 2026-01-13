import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { makeCall, sendSms, isTwilioConfigured } from '@/lib/twilio';

// 전화 걸기
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    // ADMIN만 전화 기능 사용 가능
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '관리자만 사용 가능합니다.' }, { status: 403 });
    }

    if (!isTwilioConfigured()) {
      return NextResponse.json({ error: 'Twilio가 설정되지 않았습니다.' }, { status: 500 });
    }

    const body = await request.json();
    const { to, message, type = 'call' } = body;

    if (!to || !message) {
      return NextResponse.json({ error: '전화번호와 메시지가 필요합니다.' }, { status: 400 });
    }

    if (type === 'sms') {
      const result = await sendSms(to, message);
      return NextResponse.json({ success: true, sid: result.sid, type: 'sms' });
    } else {
      const result = await makeCall(to, message);
      return NextResponse.json({ success: true, sid: result.sid, type: 'call' });
    }
  } catch (error) {
    console.error('전화/SMS 실패:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '전화/SMS 발신에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// Twilio 설정 상태 확인
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    return NextResponse.json({ configured: isTwilioConfigured() });
  } catch (error) {
    console.error('Twilio 상태 확인 실패:', error);
    return NextResponse.json({ configured: false }, { status: 500 });
  }
}
