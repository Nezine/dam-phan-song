// Mock landlord — trả lời cứng theo luật đơn giản, để test UI + TTS khi chưa có API key.
// BẮT BUỘC hiện banner "MOCK MODE" (App.tsx tự bật khi không có key) — không được đem demo như AI thật.
import type { Scenario, LandlordReply } from './types';

const firstNumber = (s: string): number | null => {
  const m = s.replace(/\./g, '').match(/(\d{4,})\s*(k|nghìn|tr|triệu)?/i);
  if (!m) return null;
  let v = Number(m[1]);
  if (/tr|triệu/i.test(m[2] ?? '')) v *= 1_000_000;
  else if (/k|nghìn/i.test(m[2] ?? '')) v *= 1_000;
  return v;
};

const lastLandlordPrice = (history: { speaker: 'tenant' | 'landlord'; text: string }[], fallback: number) => {
  for (let i = history.length - 1; i >= 0; i--) {
    const t = history[i];
    if (t.speaker === 'landlord') {
      const m = t.text.replace(/\./g, '').match(/(\d[\d.,]*)/);
      if (m) return Number(m[1].replace(/[.,]/g, '')) || fallback;
    }
  }
  return fallback;
};

export function mockLandlordTurn(
  s: Scenario,
  history: { speaker: 'tenant' | 'landlord'; text: string }[],
  tenantText: string,
): LandlordReply {
  const offer = firstNumber(tenantText);
  const cur = lastLandlordPrice(history, s.listedPrice);
  const f = (n: number) => n.toLocaleString('vi-VN');

  // 1) Người thuê gợi chuyện khuyết điểm (ẩm/mốc/nhà cũ)
  if (/ẩm|mốc|nấm|rỉ|chột|cũ/.test(tenantText)) {
    if (offer && offer >= s.floorPrice && offer < cur) {
      return {
        message: `Thôi được, ${f(offer)}đ đi, em sơn lại cho chứ anh đâu sửa gì nhiều được.`,
        currentPrice: offer,
        agreed: true,
        agreedPrice: offer,
        emotion: 'neutral',
      };
    }
    return {
      message: 'Ở được em ơi, ai cũng ở vậy, tường ẩm chút thì sơn lại là hết mà.',
      currentPrice: null,
      agreed: false,
      agreedPrice: null,
      emotion: 'annoyed',
    };
  }

  // 2) Kẹt tiền mặt / cọc — nhượng bộ về điều khoản
  if (/cọc|đóng|thanh toán|tiền mặt|kẹt/.test(tenantText)) {
    return {
      message: 'Vậy cọc 1 tháng, đóng theo tháng đi, còn giá thì để anh giữ nguyên nhé em.',
      currentPrice: cur,
      agreed: false,
      agreedPrice: null,
      emotion: 'neutral',
    };
  }

  // 3) Có giá đề xuất
  if (offer) {
    if (offer >= cur) {
      return {
        message: `Ừ, ${f(offer)}đ thì em qua ở luôn, mai anh mở khóa cho xem phòng nhé.`,
        currentPrice: offer,
        agreed: true,
        agreedPrice: offer,
        emotion: 'friendly',
      };
    }
    if (offer >= s.floorPrice) {
      const gap = cur - offer;
      if (gap <= 100_000) {
        return {
          message: `Thì ra ${f(offer)}đ đi em, mai em qua xem phòng nhé.`,
          currentPrice: offer,
          agreed: true,
          agreedPrice: offer,
          emotion: 'friendly',
        };
      }
      const next = Math.max(offer + 100_000, s.floorPrice);
      return {
        message: `${f(offer)}đ thì anh lỗ lắm, vậy là ${f(next)}đ đi em, không thấp hơn nữa đâu.`,
        currentPrice: next,
        agreed: false,
        agreedPrice: null,
        emotion: 'neutral',
      };
    }
    return {
      message: `${f(offer)}đ là anh lỗ toang rồi em, dưới sàn anh không cho thuê đâu.`,
      currentPrice: null,
      agreed: false,
      agreedPrice: null,
      emotion: 'annoyed',
    };
  }

  // 4) Không nói giá — gài nhẹ nhàng kéo về giá
  return {
    message: `Vậy em thấy ${f(cur)}đ như anh nói được không em?`,
    currentPrice: cur,
    agreed: false,
    agreedPrice: null,
    emotion: 'neutral',
  };
}
