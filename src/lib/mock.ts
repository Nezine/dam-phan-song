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

// --- Đánh giá công bằng: lời nói của người thuê có thuyết phục không? ---
// Một lời nói thuyết phục cần có ÍT NHẤT MỘT căn cứ/điều kiện thật:
// (a) lý do — giá thị trường, phòng có vấn đề, ở lâu, trả trước...;
// (b) điều kiện đổi lại — cọc, đóng trước, ở dài hạn, giới thiệu bạn.
// Chỉ năn nỉ lặp lại cùng một giá mà không có lý do mới = KHÔNG thuyết phục:
// chủ trọ GIỮ NGUYÊN GIÁ, không giảm dù chỉ 1 đồng.
const PERSUASIVE_RE =
  /thị trường|phòng bên|chỗ khác|giá chung|ở lâu|ở 1 năm|ở một năm|ở 6 tháng|ở dài|trả trước|đóng trước|trả 3 tháng|trả 6 tháng|giới thiệu|cọc 1 tháng|đóng theo tháng|ở trên 6 tháng|đặt cọc/;
const isPersuasive = (text: string): boolean => PERSUASIVE_RE.test(text);

export function mockLandlordTurn(
  s: Scenario,
  history: { speaker: 'tenant' | 'landlord'; text: string }[],
  tenantText: string,
): LandlordReply {
  const offer = firstNumber(tenantText);
  const cur = lastLandlordPrice(history, s.listedPrice);
  const f = (n: number) => n.toLocaleString('vi-VN');

  // 1) Người thuê gợi chuyện khuyết điểm (ẩm/mốc/nhà cũ) — đây là một lý do
  // thật nên được nhượng bộ, nhưng chỉ MỘT BƯỚC (không chốt ngay theo giá
  // người thuê đưa ra), trừ khi giá đó đã sát giá đang giữ.
  // Lưu ý: "cũ" phải đứng riêng (cũ(?!ng)) để không nhận nhầm chữ "cũng".
  if (/ẩm|mốc|nấm|rỉ|chột|cũ(?!ng)/.test(tenantText)) {
    if (offer && offer >= s.floorPrice && offer < cur) {
      const gap = cur - offer;
      if (gap <= 100_000) {
        return {
          message: `Thôi được, ${f(offer)}đ đi, em sơn lại cho chứ anh đâu sửa gì nhiều được.`,
          currentPrice: offer,
          agreed: true,
          agreedPrice: offer,
          emotion: 'friendly',
        };
      }
      const next = Math.max(offer + 100_000, s.floorPrice);
      return {
        message: `Phòng ẩm thật nên anh giảm còn ${f(next)}đ, thấp hơn nữa thì anh lỗ em ơi.`,
        currentPrice: next,
        agreed: false,
        agreedPrice: null,
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
      // Giảm giá CHỈ khi lời nói thật sự thuyết phục (có lý do/điều kiện mới).
      // Chỉ năn nỉ lặp lại mà không có lý do mới -> GIỮ NGUYÊN GIÁ.
      if (isPersuasive(tenantText)) {
        const next = Math.max(offer + 100_000, s.floorPrice);
        return {
          message: `Lý do hợp lý nên anh giảm còn ${f(next)}đ, không thấp hơn nữa đâu em.`,
          currentPrice: next,
          agreed: false,
          agreedPrice: null,
          emotion: 'neutral',
        };
      }
      return {
        message: `Chưa đủ thuyết phục nên anh giữ ${f(cur)}đ, em cho anh thêm căn cứ nhé.`,
        currentPrice: cur,
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

  // 4) Không nói giá — không giảm giá khi chưa có lý do thuyết phục.
  // Có lý do thật thì ghi nhận và mời người thuê ra giá; chỉ năn nỉ
  // thì nói rõ cần thêm căn cứ. Cả hai trường hợp đều GIỮ NGUYÊN GIÁ.
  if (isPersuasive(tenantText)) {
    return {
      message: `Lý do đó anh ghi nhận, em nói giá em muốn đi, anh cân nhắc nhé.`,
      currentPrice: cur,
      agreed: false,
      agreedPrice: null,
      emotion: 'neutral',
    };
  }
  return {
    message: `Em cứ nói giảm mà không đưa lý do thì anh khó giảm được, em cho anh thêm căn cứ nhé.`,
    currentPrice: cur,
    agreed: false,
    agreedPrice: null,
    emotion: 'neutral',
  };
}
