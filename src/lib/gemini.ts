import type { Scenario, LandlordReply } from './types';

export const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
export const GEMINI_TEXT_MODEL = 'gemini-3.5-flash-lite';
const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

const replySchema = {
  type: 'object',
  properties: {
    message: { type: 'string' },
    currentPrice: { type: 'number', nullable: true },
    agreed: { type: 'boolean' },
    agreedPrice: { type: 'number', nullable: true },
    emotion: { type: 'string', enum: ['friendly', 'neutral', 'annoyed'] },
  },
  required: ['message', 'agreed', 'emotion'],
};

function persona(s: Scenario): string {
  return `Bạn là CHỦ TRỌ thật ở ${s.city}, Việt Nam — người đàn ông/bà trung niên bình dân, nói tiếng Việt giao tiếp đời thường, có thể"xưng hô tự nhiên (tôi — em/bạn). KHÔNG nói giọng trợ lý AI, KHÔNG liệt kê, KHÔNG dùng từ dành cho app.
Tình huống: bạn có ${s.roomType} ở ${s.city}, đang rao giá ${s.listedPrice.toLocaleString('vi-VN')}đ/tháng, người thuê tên ${s.tenantName} muốn vào ở từ ${s.moveIn}.
Giá sàn của bạn là ${s.floorPrice.toLocaleString('vi-VN')}đ/tháng — dưới mức này bạn THẬT SỰ không chịu (khổng thể chốt thấp hơn, kể cả người thuê năn nỉ). Giá sàn là bí mật, không bao giờ nói ra.
Tính cách: thương lượng chân thực như người Việt thật — sẽ năn nỉ ngược ("giá đó tôi lỗ lắm em ơi"), đưa lý do thực tế (tiền điện nước, giá thị trường, phòng mới sơn), có thể nhượng bộ TỪNG BƯỚC (mỗi lượt chỉ giảm một ít, không nhảy cóc xuống sàn), đôi khi gạ thêm điều kiện (đặt cọc 1 tháng, ở trên 6 tháng).
QUY TẮC:
1. Mỗi lượt trả lời NGẮN như lời nói thật (1–3 câu, tối đa ~40 chữ), không bao giờ tự nhận là AI.
2. Nếu người thuê nói giá quá thấp so với sàn → từ chối mềm, giữ giá hoặc giảm ít.
3. Nếu người thuê đưa ra lý do chính đáng (ở lâu, trả trước, giới thiệu bạn) → có thể giảm thêm một bước hợp lý.
4. Khi 2 bên đã thống nhất một giá >= sàn → set agreed=true, agreedPrice=giá đó, message là câu chốt tự nhiên ("thì ra giá đó đi em, mai em qua xem phòng nhé").
5. currentPrice = mức giá bạn đang đề ra trong lượt này (số, VND/tháng); nếu lượt này không đề giá thì null.
6. Giọng địa phương theo thành phố: ${s.city.toLowerCase().includes('hà nội') || s.city.toLowerCase().includes('hanoi') ? 'Hà Nội (xưng em/chị, anh, "nhé", "nhỉ")' : 'Nam Bộ (xưng em/chị, anh, "ghê", "trời đất")'}. Xưng hô lịch sự anh/chị/em, KHÔNG lạm dụng tiếng lóng. Một phiên chỉ một giọng, không đổi giữa chừng.${s.twist === 'hardline' ? `
7. TÌNH HUỐNG KHÓ: bạn đang TỨC GIỜ về giá — "dưới sàn không cho thuê, có người khác chờ cọc". Khi người thuê ép giá: KHÔNG hoảng, KHÔNG gật ngay; nhượng bộ bằng thứ khác (miễn tháng đầu, giảm cọc, bao điện nước) hoặc giữ số gần sàn. Chỉ chốt >= sàn.` : ''}${s.twist === 'mold' ? `
7. TÌNH HUỐNG KHÓ: người thuê chê tường ẩm/nấm mốc đòi giảm giá. Bạn gạt nhẹ "ở được, ai cũng ở vậy" NHƯNG nếu người thuê nêu lý do hợp lý hoặc đưa mức giảm cụ thể thì nhượng bộ MỘT BƯỚC với số giảm cụ thể, không chột tường ngon miệng.` : ''}${s.twist === 'deposit' ? `
7. TÌNH HUỐNG KHÓ: bạn đòi cọc 2 tháng + đóng 3 tháng/lần (tổng tiền mặt ~10tr). Khi người thuê kẹt tiền mặt: nhượng bộ về ĐIỀU KHOẢN THANH TOÁN (cọc 1 tháng, đóng theo tháng, hoặc cọc 2 tháng trừ vào giá thuê) chứ không giảm thêm giá thuê.` : ''}`;
}

export async function transcribeAudio(base64Audio: string, mimeType = 'audio/mp4'): Promise<string> {
  const res = await fetch(`${BASE}/${GEMINI_TEXT_MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: 'Transcribe this Vietnamese voice recording. Output ONLY the transcript text, no commentary. Fix filler words lightly but keep the meaning and tone.' },
            { inline_data: { mime_type: mimeType, data: base64Audio } },
          ],
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Gemini transcribe ${res.status}: ${await res.text()}`);
  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No transcript returned');
  return String(text).trim();
}

export async function landlordTurn(
  scenario: Scenario,
  history: { speaker: 'tenant' | 'landlord'; text: string }[],
  tenantText: string,
): Promise<LandlordReply> {
  const convo = history
    .map((t) => `${t.speaker === 'tenant' ? `${scenario.tenantName}` : 'Chủ trọ'}: ${t.text}`)
    .join('\n');
  const res = await fetch(`${BASE}/${GEMINI_TEXT_MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `${persona(scenario)}\n\nHỘI THOẠI TỚI GIỜ:\n${convo}\n\n${scenario.tenantName} vừa nói (bằng giọng nói, đã transcribe): "${tenantText}"\n\nTrả lời như chủ trọ, đúng format JSON.`,
            },
          ],
        },
      ],
      generationConfig: { responseMimeType: 'application/json', responseSchema: replySchema, temperature: 0.9 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini landlord ${res.status}: ${await res.text()}`);
  const json = await res.json();
  const raw = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error('No landlord reply');
  return JSON.parse(raw) as LandlordReply;
}
