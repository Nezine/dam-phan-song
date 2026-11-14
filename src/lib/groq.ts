// Groq fallback (free): gpt-oss-20b JSON mode, dùng khi Gemini lỗi/quota.
import type { Scenario, LandlordReply } from './types';

export const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY ?? '';
export const GROQ_MODEL = process.env.EXPO_PUBLIC_GROQ_MODEL ?? 'openai/gpt-oss-20b';
const BASE = 'https://api.groq.com/openai/v1/chat/completions';

function systemPrompt(s: Scenario): string {
  return `Bạn là CHỦ TRỌ thật ở ${s.city} — nói tiếng Việt đời thường, ngắn gọn (1–3 câu, tối đa ~40 chữ), KHÔNG giọng trợ lý AI.
Phòng: ${s.roomType}, rao ${s.listedPrice}đ/tháng, người thuê tên ${s.tenantName}, vào ở ${s.moveIn}.
Giá sàn bí mật: ${s.floorPrice}đ/tháng — CHỐT KHÔNG ĐƯỢC THẤP HƠN. Nhượng bộ từng chút một, có lý do đời thường, có thể gạ đặt cọc.
Chỉ khi 2 bên đồng ý mức giá >= sàn thì agreed=true, agreedPrice=giá chốt.
currentPrice = mức giá bạn đề trong lượt này (VND/tháng, null nếu không đề).
Giọng theo thành phố (${s.city}): xưng hô lịch sự anh/chị/em, không lạm dụng lóng, một phiên một giọng.
${s.twist === 'hardline' ? 'TÌNH HUỐNG KHÓ: bạn đang cứng giá ("dưới sàn không cho thuê, có người chờ cọc"). Bị ép thì nhượng bộ bằng điều kiện (miễn tháng đầu/giảm cọc/bao điện nước), không gật ngay, chỉ chốt >= sàn.\n' : ''}${s.twist === 'mold' ? 'TÌNH HUỐNG KHÓ: người thuê chê tường ẩm đòi giảm. Gạt nhẹ "ở được, ai cũng ở vậy"; nêu lý do hợp lý thì giảm một bước cụ thể.\n' : ''}${s.twist === 'deposit' ? 'TÌNH HUỐNG KHÓ: cọc 2 tháng + đóng 3 tháng/lần (~10tr tiền mặt). Kẹt tiền thì nhượng bộ về điều khoản thanh toán, không giảm giá thuê thêm.\n' : ''}Trả về JSON duy nhất: {"message": string, "currentPrice": number|null, "agreed": boolean, "agreedPrice": number|null, "emotion": "friendly"|"neutral"|"annoyed"}`;
}

export async function groqLandlordTurn(
  scenario: Scenario,
  history: { speaker: 'tenant' | 'landlord'; text: string }[],
  tenantText: string,
): Promise<LandlordReply> {
  const messages = [
    { role: 'system', content: systemPrompt(scenario) },
    ...history.map((t) => ({
      role: t.speaker === 'tenant' ? 'user' as const : 'assistant' as const,
      content: t.text,
    })),
    { role: 'user', content: `${scenario.tenantName} vừa nói: "${tenantText}"` },
  ];
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: 0.9,
      response_format: { type: 'json_object' },
    }),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`);
  const json = await res.json();
  const raw = json?.choices?.[0]?.message?.content;
  if (!raw) throw new Error('Groq: no reply');
  return JSON.parse(raw) as LandlordReply;
}
