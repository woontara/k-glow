import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, company, email, phone, service, message } = body;

    // 필수 필드 검증
    if (!name || !company || !email || !service || !message) {
      return NextResponse.json(
        { success: false, error: '필수 항목을 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: '올바른 이메일 주소를 입력해주세요.' },
        { status: 400 }
      );
    }

    // DB에 문의 저장
    const inquiry = await prisma.contactInquiry.create({
      data: {
        name,
        company,
        email,
        phone: phone || null,
        service,
        message,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      message: '문의가 성공적으로 접수되었습니다.',
      inquiryId: inquiry.id,
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { success: false, error: '문의 접수 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const inquiries = await prisma.contactInquiry.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, inquiries });
  } catch (error) {
    console.error('Get inquiries error:', error);
    return NextResponse.json(
      { success: false, error: '문의 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
