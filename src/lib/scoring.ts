// scoring.ts — Thang chấm CỐ ĐỊNH cho Đàm Phán Sống (lane của Milo).
// Thuần TypeScript, không gọi API: chấm ngay trên máy từ transcript (Turn[]),
// khớp types.ts hiện có. Mọi con số đều suy ra được từ dữ liệu phiên —
// không có điểm nào do AI "tự phong" mà không truy được về luật ở dưới.
//
// Thang 100 điểm, 5 tiêu chí:
//   1. outcome    Kết quả giá        30đ
//   2. reasons    Lý do đưa ra       20đ
//   3. discipline Không tự hạ giá    20đ
//   4. anchor     Mở giá có neo      15đ
//   5. terms      Điều khoản đi kèm  15đ
import type { Scenario, Turn } from './types';

export type CriterionKey = 'outcome' | 'reasons' | 'discipline' | 'anchor' | 'terms';

export type CriterionScore = {
  key: CriterionKey;
  label: string;
  score: number;
  max: number;
  note: string; // 1 câu giải thích vì sao được số điểm này, kèm bằng chứng trong phiên
};

export type WeakestLine = {
  quote: string; // nguyên văn câu yếu nhất của người thuê
  why: string; // vì sao câu này yếu (chỉ đúng luật đã vi phạm)
  rewrite: string; // câu thay thế cụ thể, dùng số của chính phiên này
};

export type ScoreReport = {
  total: number; // 0–100
  grade: 'Xuất sắc' | 'Tốt' | 'Khá' | 'Cần luyện thêm';
  criteria: CriterionScore[];
  weakest: WeakestLine | null; // null = không tìm thấy câu yếu rõ ràng
  agreedPrice: number | null;
  savedPerMonth: number; // listed - agreed (0 nếu chưa chốt)
  savedPerYear: number;
  tenantTurns: number;
};

const fmt = (n: number) => n.toLocaleString('vi-VN');

// --- trích số tiền từ 1 câu nói ---
// Xử lý cả kiểu nói tiếng Việt: "3 triệu 3" = 3.300.000, "3 triệu rưỡi" = 3.500.000,
// "3tr2" = 3.200.000 — kiểu trích số đơn giản của mock.ts đọc sai các dạng này.
export function extractPrices(text: string): number[] {
  const out: number[] = [];
  let rest = ' ' + text.replace(/\s+/g, ' ') + ' ';
  const composite = /(\d+)\s*(?:tr|triệu)\s*(rưỡi|(\d)(?!\d))/gi;
  rest = rest.replace(composite, (_m, a: string, tail: string, digit?: string) => {
    const v = Number(a) * 1_000_000 + (tail === 'rưỡi' ? 500_000 : Number(digit) * 100_000);
    if (v >= 300_000 && v <= 50_000_000) out.push(v);
    return ' ';
  });
  const re = /(\d[\d.,]*)\s*(k|nghìn|tr|triệu)?/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(rest)) !== null) {
    let v = Number(m[1].replace(/[.,]/g, ''));
    if (!Number.isFinite(v)) continue;
    const unit = (m[2] ?? '').toLowerCase();
    if (unit === 'tr' || unit === 'triệu') v *= 1_000_000;
    else if (unit === 'k' || unit === 'nghìn') v *= 1_000;
    if (v >= 300_000 && v <= 50_000_000) out.push(v); // chỉ lấy số cỡ tiền thuê
  }
  return out;
}

// --- Rubric theo phòng: ENGINE chấm là CHUNG cho mọi loại đàm phán ---
// Mỗi phòng tập chỉ thay bộ từ khóa lý do/điều khoản + tên gọi đối tác.
// Phòng 1 (thuê trọ) là cấu hình đầu tiên; thêm phòng = thêm 1 rubric, không sửa engine.
export type Rubric = {
  id: string;
  counterpart: string; // tên gọi đối tác trong câu nhận xét, vd "chủ trọ", "nhà tuyển dụng"
  reasons: { key: string; label: string; re: RegExp }[];
  terms: { key: string; label: string; re: RegExp }[];
};

export const RENT_RUBRIC: Rubric = {
  id: 'thue-tro',
  counterpart: 'chủ trọ',
  reasons: [
    { key: 'stay', label: 'ở lâu dài', re: /ở lâu|ở dài|lâu dài|6 tháng|1 năm|một năm|sáu tháng/ },
    { key: 'prepay', label: 'trả trước / tiền mặt ngay', re: /trả trước|đóng trước|trả luôn|chuyển khoản ngay|tiền mặt/ },
    { key: 'referral', label: 'giới thiệu thêm người thuê', re: /giới thiệu bạn|rủ bạn|bạn em|thêm người|giới thiệu/ },
    { key: 'defect', label: 'chỉ ra khuyết điểm phòng', re: /ẩm|mốc|nấm|hỏng|rỉ|chột|ồn|phòng cũ|nhà cũ|xa trung tâm|thiếu/ },
    { key: 'market', label: 'so giá khu vực', re: /chỗ khác|bên cạnh|khu này|phòng khác|nhà bên|giá khu|dãy bên/ },
    { key: 'group', label: 'ở ghép / thêm người ở', re: /ở ghép|ở chung|hai người|2 người|bạn cùng phòng/ },
  ],
  terms: [
    { key: 'coc', label: 'cọc', re: /cọc/ },
    { key: 'dongthang', label: 'đóng theo tháng', re: /đóng theo tháng|đóng tháng|hàng tháng|mỗi tháng/ },
    { key: 'diennuoc', label: 'điện nước', re: /điện|nước/ },
    { key: 'hopdong', label: 'hợp đồng', re: /hợp đồng/ },
    { key: 'sua', label: 'sửa chữa / sơn lại', re: /sơn|sửa|khắc phục/ },
    { key: 'mienphi', label: 'miễn / bao phí', re: /miễn|bao wifi|bao gửi xe|miễn phí/ },
  ],
};

// Rubric đàm phán CHUNG — dùng cho các phòng sau (deal lương, phỏng vấn, gọi vốn)
// khi tình huống có giá/mức hai bên cùng hướng tới.
export const NEGOTIATION_RUBRIC: Rubric = {
  id: 'dam-phan-chung',
  counterpart: 'đối tác',
  reasons: [
    { key: 'commit', label: 'cam kết lâu dài', re: /lâu dài|dài hạn|ổn định|gắn bó|ít nhất/ },
    { key: 'value', label: 'trao giá trị trước', re: /trả trước|làm trước|thử việc|dùng thử|đem lại|mang lại/ },
    { key: 'proof', label: 'bằng chứng năng lực / số liệu', re: /kinh nghiệm|dự án|thành tích|kết quả|số liệu|doanh thu|tăng|giảm được/ },
    { key: 'market', label: 'so mặt bằng chung', re: /mặt bằng|thị trường|chỗ khác|nơi khác|bên khác|mức chung/ },
    { key: 'weak', label: 'chỉ ra điểm chưa khớp', re: /chưa|thiếu|kém|hạn chế|không phù hợp/ },
    { key: 'referral', label: 'giới thiệu / mở rộng thêm', re: /giới thiệu|kết nối|rủ thêm|thêm người/ },
  ],
  terms: [
    { key: 'thoihan', label: 'thời hạn / mốc thời gian', re: /thời hạn|từ tháng|bắt đầu|deadline|kỳ/ },
    { key: 'thanhtoan', label: 'cách thanh toán / nhận tiền', re: /thanh toán|trả theo|đóng theo|chuyển khoản|lương tháng/ },
    { key: 'hopdong', label: 'hợp đồng / văn bản', re: /hợp đồng|văn bản|ký/ },
    { key: 'phucloi', label: 'phúc lợi / điều kiện đi kèm', re: /phúc lợi|bảo hiểm|ngày phép|đào tạo|thưởng/ },
    { key: 'xemlai', label: 'xem lại sau một mốc', re: /xem lại|đánh giá lại|sau 3 tháng|sau 6 tháng|hết thử việc/ },
  ],
};

const PLEAD = /xin anh|xin chị|năn nỉ|làm ơn|giúp em với|thương em/i;

export function scoreSession(
  s: Scenario,
  turns: Turn[],
  agreedPrice: number | null,
  rubric: Rubric = RENT_RUBRIC,
): ScoreReport {
  const REASONS = rubric.reasons;
  const TERMS = rubric.terms;
  const cp = rubric.counterpart;
  const tenant = turns.filter((t) => t.speaker === 'tenant');
  const landlord = turns.filter((t) => t.speaker === 'landlord');
  const span = Math.max(s.listedPrice - s.floorPrice, 1);

  // ---- 1. Kết quả giá (30) ----
  let outcome = 0;
  let outcomeNote = '';
  if (agreedPrice != null) {
    const ratio = Math.min(Math.max((s.listedPrice - agreedPrice) / span, 0), 1);
    outcome = Math.round(10 + 20 * ratio);
    outcomeNote =
      ratio >= 0.99
        ? `Chốt đúng giá sàn ${fmt(agreedPrice)}đ — mức tốt nhất có thể trong phiên này.`
        : `Chốt ${fmt(agreedPrice)}đ, đi được ${Math.round(ratio * 100)}% quãng từ giá rao xuống giá sàn.`;
  } else {
    const last = [...landlord].reverse().find((t) => t.price != null)?.price ?? s.listedPrice;
    const progress = Math.min(Math.max((s.listedPrice - last) / span, 0), 1);
    outcome = Math.round(12 * progress);
    outcomeNote = `Chưa chốt được giá; ${cp} mới nhích tới ${fmt(last)}đ.`;
  }

  // ---- 2. Lý do đưa ra (20): đếm nhóm lý do KHÁC nhau ----
  const reasonHits = REASONS.filter((r) => tenant.some((t) => r.re.test(t.text)));
  const reasons = [0, 8, 14, 18, 20, 20, 20][Math.min(reasonHits.length, 6)];
  const reasonsNote =
    reasonHits.length === 0
      ? `Chưa đưa lý do nào — chỉ đề giá suông nên ${cp} không có cớ để giảm.`
      : `Đã dùng ${reasonHits.length} loại lý do: ${reasonHits.map((r) => r.label).join(', ')}.`;

  // ---- 3. Không tự hạ giá (20) ----
  // Tự hạ giá = mình nâng mức mình chịu trả trong khi chủ trọ chưa giảm thêm.
  let discipline = 20;
  const selfConcessions: number[] = []; // index trong tenant[]
  let prevOffer: number | null = null;
  let landlordPriceAtPrev: number | null = null;
  tenant.forEach((t, i) => {
    const prices = extractPrices(t.text);
    if (prices.length === 0) return;
    const offer = Math.min(...prices);
    // giá chủ trọ gần nhất TRƯỚC lượt này
    const upto = turns.indexOf(t);
    const lp = [...turns.slice(0, upto)].reverse().find((x) => x.speaker === 'landlord' && x.price != null)?.price ?? null;
    if (prevOffer != null && offer > prevOffer && landlordPriceAtPrev != null && lp != null && lp >= landlordPriceAtPrev) {
      selfConcessions.push(i);
    }
    prevOffer = offer;
    landlordPriceAtPrev = lp;
  });
  discipline -= selfConcessions.length * 6;
  const pleadCount = tenant.filter((t) => PLEAD.test(t.text)).length;
  if (pleadCount >= 3) discipline -= 4;
  if (tenant.length < 2) discipline = Math.min(discipline, 10);
  discipline = Math.max(0, discipline);
  const disciplineNote =
    selfConcessions.length > 0
      ? `Tự nâng giá ${selfConcessions.length} lần khi ${cp} chưa giảm thêm — mất thế đàm phán.`
      : pleadCount >= 3
        ? 'Nài nỉ nhiều (xin/làm ơn) thay vì đưa lý do — đối tác càng giữ giá.'
        : 'Giữ giá mình đưa ra, chỉ nhích khi đối tác đã nhích trước.';

  // ---- 4. Mở giá có neo (15) ----
  let anchor = 0;
  let anchorNote = '';
  const firstPriced = tenant.findIndex((t) => extractPrices(t.text).length > 0);
  if (firstPriced === -1) {
    anchorNote = 'Không tự đề giá lần nào — để đối tác dẫn toàn bộ cuộc đàm phán.';
  } else {
    const offer = Math.min(...extractPrices(tenant[firstPriced].text));
    if (firstPriced <= 1 && offer <= s.listedPrice * 0.95) {
      anchor = 15;
      anchorNote = `Mở giá sớm ở ${fmt(offer)}đ, dưới giá rao — neo được cuộc đàm phán.`;
    } else if (offer <= s.listedPrice * 0.95) {
      anchor = 10;
      anchorNote = `Có đề giá ${fmt(offer)}đ nhưng hơi muộn (lượt ${firstPriced + 1}).`;
    } else {
      anchor = 6;
      anchorNote = `Đề giá ${fmt(offer)}đ gần như bằng giá rao — neo quá cao, ít đất giảm.`;
    }
  }

  // ---- 5. Điều khoản đi kèm (15) ----
  const termHits = TERMS.filter((r) => tenant.some((t) => r.re.test(t.text)));
  let terms = Math.min(3 + termHits.length * 4, 15);
  if (agreedPrice == null && termHits.length === 0) terms = 0;
  const termsNote =
    termHits.length === 0
      ? 'Chỉ nói chuyện giá, chưa chạm điều khoản nào (cọc, đóng tháng, điện nước...).'
      : `Đã đàm phán cả điều khoản: ${termHits.map((r) => r.label).join(', ')}.`;

  // ---- Câu yếu nhất ----
  let weakest: WeakestLine | null = null;
  const lastLandlordPrice =
    [...landlord].reverse().find((t) => t.price != null)?.price ?? s.listedPrice;
  const suggested = Math.max(s.floorPrice, Math.round((lastLandlordPrice - 200_000) / 50_000) * 50_000);
  const mkRewrite = () =>
    `Anh/chị xem ${fmt(suggested)}đ được không, em ở lâu dài, đóng tiền đúng ngày, phòng có gì em tự sơn sửa lại — giá này hai bên đều dễ chịu.`;
  if (selfConcessions.length > 0) {
    const q = tenant[selfConcessions[0]].text;
    weakest = {
      quote: q,
      why: `Câu này tự nâng giá mình chịu trả trong khi ${cp} chưa giảm thêm đồng nào — tự tay bỏ mất thế mạnh nhất của mình.`,
      rewrite: mkRewrite(),
    };
  } else {
    // câu yếu dự phòng: lượt không giá, không lý do, chỉ nài nỉ / đồng ý suông
    const weakIdx = tenant.findIndex(
      (t) => extractPrices(t.text).length === 0 && !REASONS.some((r) => r.re.test(t.text)) && t.text.trim().length > 0,
    );
    if (weakIdx >= 0 && (reasons === 0 || anchor <= 6 || PLEAD.test(tenant[weakIdx].text))) {
      weakest = {
        quote: tenant[weakIdx].text,
        why: `Câu này không có giá đề xuất, không có lý do — ${cp} không có gì để cân nhắc nên sẽ giữ nguyên giá.`,
        rewrite: mkRewrite(),
      };
    }
  }

  const criteria: CriterionScore[] = [
    { key: 'outcome', label: 'Kết quả giá', score: outcome, max: 30, note: outcomeNote },
    { key: 'reasons', label: 'Lý do đưa ra', score: reasons, max: 20, note: reasonsNote },
    { key: 'discipline', label: 'Không tự hạ giá', score: discipline, max: 20, note: disciplineNote },
    { key: 'anchor', label: 'Mở giá có neo', score: anchor, max: 15, note: anchorNote },
    { key: 'terms', label: 'Điều khoản đi kèm', score: terms, max: 15, note: termsNote },
  ];
  const total = criteria.reduce((a, c) => a + c.score, 0);
  const savedPerMonth = agreedPrice != null ? Math.max(s.listedPrice - agreedPrice, 0) : 0;

  return {
    total,
    grade: total >= 85 ? 'Xuất sắc' : total >= 70 ? 'Tốt' : total >= 50 ? 'Khá' : 'Cần luyện thêm',
    criteria,
    weakest,
    agreedPrice,
    savedPerMonth,
    savedPerYear: savedPerMonth * 12,
    tenantTurns: tenant.length,
  };
}

// Prompt tuỳ chọn: nhờ Gemini viết lại phần "vì sao + câu thay thế" cho mượt hơn,
// NHƯNG điểm số luôn lấy từ scoreSession ở trên — LLM không được sửa điểm.
// Nếu gọi API lỗi thì dùng luôn weakest có sẵn (fallback an toàn cho demo).
export function buildJudgePrompt(s: Scenario, turns: Turn[], report: ScoreReport): string {
  const convo = turns.map((t) => `${t.speaker === 'tenant' ? s.tenantName : 'Chủ trọ'}: ${t.text}`).join('\n');
  return `Bạn là huấn luyện viên đàm phán. Dưới đây là 1 phiên luyện đàm phán (mức đối tác đang ra ${fmt(s.listedPrice)}đ/tháng).
${convo}

Điểm theo thang cố định (KHÔNG được thay đổi): tổng ${report.total}/100.
Câu yếu nhất hệ thống đã xác định: "${report.weakest?.quote ?? '(không có)'}"
Viết lại NGẮN GỌN bằng tiếng Việt đời thường, trả JSON đúng format:
{"why": "vì sao câu đó yếu, tối đa 25 chữ", "rewrite": "1 câu thay thế tự nhiên, có số tiền cụ thể, tối đa 40 chữ"}`;
}
