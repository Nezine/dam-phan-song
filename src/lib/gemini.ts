import type { Scenario, CustomerReply } from './types';
import { fetchAiJson, parseReply } from './aiResponse';

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
  return `Bạn là một KHÁCH HÀNG đang cân nhắc mua hàng tại ${s.city}, Việt Nam. Nói tiếng Việt tự nhiên, ngắn gọn và đời thường; không nói như trợ lý AI.
Sản phẩm: ${s.productName}, giá niêm yết ${s.listedPrice.toLocaleString('vi-VN')}đ. Người bán là ${s.sellerName}.
Bạn có ngân sách tối đa bí mật ${s.maxBudget.toLocaleString('vi-VN')}đ. Đây là thông tin nội bộ: TUYỆT ĐỐI không tiết lộ con số hoặc nói rõ giới hạn ngân sách. Nếu giá được đề xuất vượt mức này, hãy nêu băn khoăn chung về giá và hỏi thêm về giá trị hoặc lựa chọn phù hợp.
Mục tiêu của bạn là quyết định có mua hay không dựa trên giá, nhu cầu, niềm tin và thời điểm. Đặt câu hỏi thật, nêu phản đối hợp lý, lắng nghe phần tư vấn và chỉ đồng ý khi lời đề nghị cuối cùng không vượt quá ngân sách bí mật.
QUY TẮC:
1. Mỗi lượt trả lời 1–3 câu, tối đa khoảng 40 từ; giữ cách xưng hô lịch sự, tự nhiên.
2. Khi người bán nêu một mức giá không vượt ngân sách, bạn có thể đồng ý mua ở đúng mức giá đó. Khi đồng ý, đặt agreed=true, agreedPrice bằng giá người bán vừa nêu và nói rõ bạn sẽ mua.
3. Nếu mức giá vượt ngân sách hoặc chưa có lý do thuyết phục, hãy từ chối nhẹ nhàng; không giả vờ đã chốt.
4. currentPrice chỉ là một mức giá bạn thật sự nói ra trong câu trả lời; nếu không nêu giá, đặt null. Không dùng con số ngân sách bí mật làm currentPrice.
5. Trả lời đúng ngữ cảnh tình huống: ${s.twist === 'price' ? 'cân nhắc giá trị so với giá tiền' : s.twist === 'need' ? 'chưa thấy rõ nhu cầu hoặc lợi ích' : s.twist === 'trust' ? 'cần thêm thông tin để tin vào chất lượng và bảo hành' : s.twist === 'timing' ? 'chưa sẵn sàng mua ngay' : 'cân nhắc xem sản phẩm có phù hợp không'}.
6. Giữ một giọng xuyên suốt phiên và không tự nhận là AI.`;
}

/**
 * Derive the Gemini inline_data mime type from a recording file URI's
 * extension. expo-audio records .m4a on Android/iOS (HIGH_QUALITY preset);
 * other presets/containers are mapped too. Falls back to 'audio/mp4'.
 */
export function mimeTypeForAudioUri(uri: string): string {
  const ext = uri.split('?')[0].split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'wav':
      return 'audio/wav';
    case 'm4a':
    case 'mp4':
      return 'audio/mp4';
    case '3gp':
      return 'audio/3gpp';
    case 'mp3':
      return 'audio/mpeg';
    default:
      return 'audio/mp4';
  }
}

export async function transcribeAudio(base64Audio: string, mimeType = 'audio/mp4'): Promise<string> {
  const json = await fetchAiJson(`${BASE}/${GEMINI_TEXT_MODEL}:generateContent`, {
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
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No transcript returned');
  return String(text).trim();
}

export async function customerTurn(
  scenario: Scenario,
  history: { speaker: 'seller' | 'customer'; text: string }[],
  sellerText: string,
): Promise<CustomerReply> {
  const convo = history
    .map((t) => `${t.speaker === 'seller' ? `${scenario.sellerName}` : 'Khách hàng'}: ${t.text}`)
    .join('\n');
  const json = await fetchAiJson(`${BASE}/${GEMINI_TEXT_MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `${persona(scenario)}\n\nHỘI THOẠI TỚI GIỜ:\n${convo}\n\n${scenario.sellerName} vừa nói (bằng giọng nói, đã chuyển thành chữ): "${sellerText}"\n\nTrả lời như khách hàng, đúng format JSON.`,
            },
          ],
        },
      ],
      generationConfig: { responseMimeType: 'application/json', responseSchema: replySchema, temperature: 0.9 },
    }),
  });
  const raw = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error('No customer reply');
  return parseReply(raw);
}
