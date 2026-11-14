// Groq fallback (free): gpt-oss-20b JSON mode, dùng khi Gemini lỗi/quota.
import type { Scenario, CustomerReply } from './types';
import { fetchAiJson, parseReply } from './aiResponse';

export const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY ?? '';
export const GROQ_MODEL = process.env.EXPO_PUBLIC_GROQ_MODEL ?? 'openai/gpt-oss-20b';
const BASE = 'https://api.groq.com/openai/v1/chat/completions';

function systemPrompt(s: Scenario): string {
  return `Bạn là một KHÁCH HÀNG đang cân nhắc mua hàng tại ${s.city}. Trò chuyện bằng tiếng Việt tự nhiên, ngắn gọn (1–3 câu), không nói như trợ lý AI.
Sản phẩm: ${s.productName}, giá niêm yết ${s.listedPrice}đ. Người bán: ${s.sellerName}.
Bạn có ngân sách tối đa bí mật ${s.maxBudget}đ. Không tiết lộ con số hoặc giới hạn này. Nếu giá đề xuất vượt ngân sách, hãy nêu băn khoăn chung về giá mà không cho biết mức tối đa.
Bạn cân nhắc giá, nhu cầu, niềm tin và thời điểm. Chỉ đồng ý mua khi mức giá người bán vừa nêu không vượt ngân sách bí mật. Khi đồng ý, đặt agreed=true, agreedPrice bằng đúng giá đó và xác nhận sẽ mua. Nếu chưa có giá hoặc còn băn khoăn, hãy phản hồi thật, không giả vờ chốt.
currentPrice chỉ là giá bạn thật sự nêu ra trong câu trả lời; nếu không nêu giá, dùng null. Không dùng ngân sách bí mật làm currentPrice.
Tình huống: ${s.twist === 'price' ? 'cân nhắc giá trị so với giá tiền' : s.twist === 'need' ? 'chưa thấy rõ nhu cầu hoặc lợi ích' : s.twist === 'trust' ? 'cần thêm thông tin về chất lượng và bảo hành' : s.twist === 'timing' ? 'chưa sẵn sàng mua ngay' : 'đánh giá sản phẩm có phù hợp không'}.
Trả về JSON duy nhất: {"message": string, "currentPrice": number|null, "agreed": boolean, "agreedPrice": number|null, "emotion": "friendly"|"neutral"|"annoyed"}`;
}

export async function groqCustomerTurn(
  scenario: Scenario,
  history: { speaker: 'seller' | 'customer'; text: string }[],
  sellerText: string,
): Promise<CustomerReply> {
  const messages = [
    { role: 'system', content: systemPrompt(scenario) },
    ...history.map((t) => ({
      role: t.speaker === 'seller' ? 'user' as const : 'assistant' as const,
      content: t.text,
    })),
    { role: 'user', content: `${scenario.sellerName} vừa nói: "${sellerText}"` },
  ];
  const json = await fetchAiJson(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: 0.9,
      response_format: { type: 'json_object' },
    }),
  });
  const raw = json?.choices?.[0]?.message?.content;
  if (!raw) throw new Error('Groq: no reply');
  return parseReply(raw);
}
