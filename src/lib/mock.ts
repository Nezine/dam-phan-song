// Mock landlord — trả lời cứng theo luật đơn giản, để test UI + TTS khi chưa có API key.
// BẮT BUỘC hiện banner "MOCK MODE" (App.tsx tự bật khi không có key) — không được đem demo như AI thật.
import type { Scenario, LandlordReply, Turn } from './types';

const firstNumber = (s: string): number | null => {
  const m = s.replace(/\./g, '').match(/(\d{4,})\s*(k|nghìn|tr|triệu)?/i);
  if (!m) return null;
  let v = Number(m[1]);
  if (/tr|triệu/i.test(m[2] ?? '')) v *= 1_000_000;
  else if (/k|nghìn/i.test(m[2] ?? '')) v *= 1_000;
  // Số parse được mà < 1000đ không phải giá thuê thật — bỏ qua.
  if (v < 1000) return null;
  return v;
};

// Giá chủ trọ đang đưa ra: lấy từ trường price có cấu trúc của lượt chủ trọ
// gần nhất — KHÔNG parse số từ lời nói (câu mở đầu hardline "dưới 3 triệu 2"
// hay deposit "cọc 2 tháng" đều bị parse nhầm thành cur=3 / cur=2).
const lastLandlordPrice = (history: Turn[], fallback: number) => {
  for (let i = history.length - 1; i >= 0; i--) {
    const t = history[i];
    if (t.speaker === 'landlord' && typeof t.price === 'number' && t.price >= 1000) {
      return t.price;
    }
  }
  return fallback;
};

export function mockLandlordTurn(
  s: Scenario,
  history: Turn[],
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

  // 2) Kẹt tiền mặt / cọc — nhượng bộ về điều khoản. Chỉ chạy khi tenant
  // không đưa giá (có giá thì để nhánh 3 quyết theo giá). Tenant đề xuất
  // điều khoản cụ thể (cọc 1 tháng / đóng theo tháng...) = nhượng bộ thật
  // → chốt ở giá hiện tại; chỉ nhắc tới cọc mà chưa đề xuất gì thì giữ.
  if (!offer && /cọc|đóng|thanh toán|tiền mặt|kẹt/.test(tenantText)) {
    if (/cọc 1 tháng|đóng (theo tháng|1 tháng|trước)|trả trước|ở lâu/.test(tenantText)) {
      return {
        message: `Được rồi, vậy cọc 1 tháng, đóng theo tháng, giá ${f(cur)}đ giữ nguyên nhé em. Chốt nhé!`,
        currentPrice: cur,
        agreed: true,
        agreedPrice: cur,
        emotion: 'friendly',
      };
    }
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
