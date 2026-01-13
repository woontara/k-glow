import twilio from 'twilio';

// Twilio 클라이언트 초기화
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let twilioClient: twilio.Twilio | null = null;

export function getTwilioClient() {
  if (!accountSid || !authToken) {
    console.warn('Twilio credentials not configured');
    return null;
  }

  if (!twilioClient) {
    twilioClient = twilio(accountSid, authToken);
  }

  return twilioClient;
}

export function getTwilioPhoneNumber() {
  return twilioPhoneNumber;
}

// 전화 걸기
export async function makeCall(to: string, message: string) {
  const client = getTwilioClient();
  if (!client || !twilioPhoneNumber) {
    throw new Error('Twilio가 설정되지 않았습니다.');
  }

  const call = await client.calls.create({
    to,
    from: twilioPhoneNumber,
    twiml: `<Response><Say language="ko-KR">${message}</Say></Response>`,
  });

  return call;
}

// SMS 보내기
export async function sendSms(to: string, body: string) {
  const client = getTwilioClient();
  if (!client || !twilioPhoneNumber) {
    throw new Error('Twilio가 설정되지 않았습니다.');
  }

  const message = await client.messages.create({
    to,
    from: twilioPhoneNumber,
    body,
  });

  return message;
}

// Twilio 설정 확인
export function isTwilioConfigured(): boolean {
  return !!(accountSid && authToken && twilioPhoneNumber);
}
