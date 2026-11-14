// Mock customer replies for UI and speech demos when no API key is configured.
import type { Scenario, CustomerReply, Turn } from './types';

const firstNumber = (s: string): number | null => {
  const m = s.replace(/\./g, '').match(/(\d{4,})\s*(k|nghìn|tr|triệu)?/i);
  if (!m) return null;
  let value = Number(m[1]);
  if (/tr|triệu/i.test(m[2] ?? '')) value *= 1_000_000;
  else if (/k|nghìn/i.test(m[2] ?? '')) value *= 1_000;
  return value >= 1000 ? value : null;
};

export function mockCustomerTurn(s: Scenario, _history: Turn[], sellerText: string): CustomerReply {
  const offer = firstNumber(sellerText);
  if (offer != null) {
    if (offer > s.maxBudget) {
      return {
        message: 'Mức này hơi vượt khả năng chi trả của anh. Em có thể giải thích thêm giá trị sản phẩm hoặc đề xuất mức phù hợp hơn không?',
        currentPrice: null,
        agreed: false,
        agreedPrice: null,
        emotion: 'neutral',
      };
    }
    if (offer < s.targetPrice) {
      return {
        message: 'Anh thấy mức đó hợp lý, nhưng em có thể kiểm tra lại giúp anh phần giá và quyền lợi đi kèm không?',
        currentPrice: offer,
        agreed: false,
        agreedPrice: null,
        emotion: 'neutral',
      };
    }
    return {
      message: `Được, anh đồng ý mua ${s.productName} ở mức ${offer.toLocaleString('vi-VN')}đ. Mình chốt nhé!`,
      currentPrice: offer,
      agreed: true,
      agreedPrice: offer,
      emotion: 'friendly',
    };
  }

  const objection = s.twist === 'need'
    ? 'Anh chưa rõ sản phẩm này giải quyết nhu cầu nào của mình. Em có thể cho một ví dụ cụ thể không?'
    : s.twist === 'trust'
      ? 'Anh muốn biết thêm về chất lượng và chính sách bảo hành trước khi quyết định.'
      : s.twist === 'timing'
        ? 'Anh thấy sản phẩm phù hợp, nhưng chưa chắc đây là lúc cần mua. Em giúp anh cân nhắc nhé.'
        : 'Sản phẩm khá phù hợp, nhưng anh còn băn khoăn về mức giá. Em có thể giải thích giá trị nhận được không?';

  return {
    message: objection,
    currentPrice: null,
    agreed: false,
    agreedPrice: null,
    emotion: 'neutral',
  };
}
