// Rule-based scoring for a finished rent negotiation — NO LLM call, pure functions.
// The app calls scoreNegotiation() once a round ends (agreed price or gave up).
// All user-facing strings are Vietnamese.
import type { Turn } from './types';

export type ScoreFieldId = 'opening' | 'leverage' | 'pacing' | 'closing';

export type WeakLine = {
  quote: string; // exact tenant line (truncated to 80 chars), '' when the issue is absence
  reason: string; // one-line Vietnamese reason
};

export type ScoreField = {
  id: ScoreFieldId;
  label: string;
  score: number;
  max: number;
  weakLines: WeakLine[];
};

export type ScoreResult = {
  total: number;
  max: number;
  fields: ScoreField[];
  verdict: string;
};

const FIELD_MAX = 25;
const TOTAL_MAX = 100;

/** Parse a VND/month price out of a Vietnamese tenant line.
 *  Understands: "3tr2", "3.2tr", "3 triệu 200", "3,200,000", "3.200.000",
 *  "3200000", "3200" (= 3.200.000, the spoken "k" convention). Returns null
 *  when the line has no price. */
export function parsePrice(text: string): number | null {
  const t = text.toLowerCase().replace(/\u00a0/g, ' ');

  // 1. "3tr2" / "3.2tr" / "3 triệu 200" — millions with a fractional part.
  // NOTE: "triệu" must come before "tr" in the alternation, otherwise the
  // regex matches just "tr" out of "triệu" and drops the fractional part.
  const tr = t.match(/(\d+(?:[.,]\d+)?)\s*(?:triệu|tr)\s*(\d{1,3})?/);
  if (tr) {
    const whole = Number(tr[1].replace(',', '.'));
    let value = whole * 1_000_000;
    if (tr[2]) {
      const frac = tr[2];
      value += (Number(frac) / Math.pow(10, frac.length)) * 1_000_000;
    }
    if (value >= 100_000 && value <= 100_000_000) return Math.round(value);
  }

  // 2. Grouped thousands: "3,200,000" / "3.200.000".
  const grouped = t.match(/(\d{1,3}(?:[.,]\d{3})+)/);
  if (grouped) {
    const value = Number(grouped[1].replace(/[.,]/g, ''));
    if (value >= 100_000 && value <= 100_000_000) return value;
  }

  // 3. Bare number: 6+ digits = VND directly; 4 digits = "k" convention (3200 -> 3.200.000).
  const bare = t.match(/(?<![\d.,])(\d{6,8})(?![\d.,])/);
  if (bare) {
    const value = Number(bare[1]);
    if (value >= 100_000 && value <= 100_000_000) return value;
  }
  const short = t.match(/(?<![\d.,])(\d{4})(?![\d.,])/);
  if (short) {
    const value = Number(short[1]) * 1000;
    if (value >= 1_000_000 && value <= 100_000_000) return value;
  }
  return null;
}

/** Strip diacritics + lowercase so keyword matching survives transcript quirks. */
function norm(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd');
}

function trunc80(text: string): string {
  return text.length > 80 ? `${text.slice(0, 77)}...` : text;
}

function fmtVnd(n: number): string {
  return `${Math.round(n / 1000)}k`;
}

const LEVERAGE_KINDS: { id: string; keywords: string[] }[] = [
  { id: 'lease', keywords: ['o lau', 'dai han', '6 thang', '1 nam', 'o tren 6 thang', 'thue dai han'] },
  { id: 'prepay', keywords: ['tra truoc', 'dong truoc', 'coc truoc', 'tra 3 thang', 'tra 6 thang', 'dong 3 thang', 'ung truoc'] },
  { id: 'defects', keywords: ['tuong am', 'am moc', 'am uot', 'moc', 'nam moc', 'sua chua', 'hong', 'dot', 'tham nuoc', 'nut tuong'] },
  { id: 'referral', keywords: ['gioi thieu', 'ban be', 'ban em', 'o cung', 'them ban'] },
  { id: 'budget', keywords: ['sinh vien', 'thu nhap', 'luong', 'tien luong', 'ngan sach', 'het tien', 'kinh te'] },
];

function scoreOpening(
  tenantTurns: Turn[],
  listedPrice: number,
): ScoreField {
  const field: ScoreField = { id: 'opening', label: 'Mở đầu — neo giá', score: 0, max: FIELD_MAX, weakLines: [] };
  const firstTwo = tenantTurns.slice(0, 2);
  let firstOffer: number | null = null;
  let firstOfferLine = '';
  for (const turn of firstTwo) {
    const price = parsePrice(turn.text);
    if (price !== null) {
      firstOffer = price;
      firstOfferLine = turn.text;
      break;
    }
  }
  if (firstOffer === null) {
    field.score = 5;
    field.weakLines.push({ quote: '', reason: 'Chưa đưa ra giá mở đầu trong 2 lượt đầu' });
    return field;
  }
  const ratio = firstOffer / listedPrice;
  if (ratio <= 0.85) {
    field.score = 25;
  } else if (ratio < 0.95) {
    field.score = 15;
    field.weakLines.push({
      quote: trunc80(firstOfferLine),
      reason: `Mở đầu ${fmtVnd(firstOffer)} — chỉ thấp hơn giá rao một chút, neo chưa đủ sâu`,
    });
  } else {
    field.score = 5;
    field.weakLines.push({
      quote: trunc80(firstOfferLine),
      reason: `Mở đầu ${fmtVnd(firstOffer)} — gần bằng giá rao, chưa neo giá xuống`,
    });
  }
  return field;
}

function scoreLeverage(tenantTurns: Turn[]): ScoreField {
  const field: ScoreField = { id: 'leverage', label: 'Đòn bẩy — lý do thuyết phục', score: 0, max: FIELD_MAX, weakLines: [] };
  // Word-boundary matching: pad with spaces and strip punctuation first.
  // Bare substring matching is wrong — e.g. "hong" (hỏng) is inside "khong" (không).
  const joined = ` ${norm(tenantTurns.map((t) => t.text).join(' ')).replace(/[^\p{L}\p{N} ]/gu, ' ')} `;
  let kindsUsed = 0;
  for (const kind of LEVERAGE_KINDS) {
    if (kind.keywords.some((kw) => joined.includes(` ${kw} `))) kindsUsed += 1;
  }
  field.score = Math.min(FIELD_MAX, kindsUsed * 6);
  if (kindsUsed === 0) {
    field.weakLines.push({
      quote: '',
      reason: 'Chưa dùng đòn bẩy nào — hãy đưa lý do cụ thể (ở lâu, trả trước, phòng có lỗi)',
    });
  }
  return field;
}

function scorePacing(tenantTurns: Turn[], agreedPrice: number | null): ScoreField {
  const field: ScoreField = { id: 'pacing', label: 'Nhịp nhượng bộ', score: 0, max: FIELD_MAX, weakLines: [] };
  if (tenantTurns.length === 0) {
    field.score = 0;
    field.weakLines.push({ quote: '', reason: 'Chưa có lượt nào để chấm nhịp nhượng bộ' });
    return field;
  }
  // Tenant offers in order (one per turn at most).
  const offers: { price: number; line: string }[] = [];
  for (const turn of tenantTurns) {
    const price = parsePrice(turn.text);
    if (price !== null) offers.push({ price, line: turn.text });
  }
  // The final offer is the closing acceptance (it equals the agreed price),
  // not a concession — exclude it from pacing, the closing field scores it.
  if (agreedPrice !== null && offers.length > 0 && offers[offers.length - 1].price === agreedPrice) {
    offers.pop();
  }
  let fastJumps = 0;
  let consecutiveRaises = 0;
  let doubleConcedeLine = '';
  for (let i = 1; i < offers.length; i += 1) {
    const jump = offers[i].price - offers[i - 1].price;
    if (jump > 0) {
      consecutiveRaises += 1;
      if (jump > 200_000) {
        fastJumps += 1;
        field.weakLines.push({
          quote: trunc80(offers[i].line),
          reason: `Nhượng ${fmtVnd(jump)} trong 1 lượt — quá nhanh, chủ trọ sẽ ép tiếp`,
        });
      }
      if (consecutiveRaises >= 2 && !doubleConcedeLine) {
        doubleConcedeLine = offers[i].line;
      }
    } else {
      consecutiveRaises = 0;
    }
  }
  if (doubleConcedeLine) {
    field.weakLines.push({
      quote: trunc80(doubleConcedeLine),
      reason: 'Nhượng 2 lượt liên tiếp — mất nhịp',
    });
  }
  if (doubleConcedeLine || fastJumps >= 2) field.score = 5;
  else if (fastJumps === 1) field.score = 12;
  else field.score = 25;
  return field;
}

function scoreClosing(
  agreedPrice: number | null,
  floorPrice: number,
  listedPrice: number,
): ScoreField {
  const field: ScoreField = { id: 'closing', label: 'Chốt giá', score: 0, max: FIELD_MAX, weakLines: [] };
  if (agreedPrice === null) {
    field.score = 0;
    field.weakLines.push({ quote: '', reason: 'Chưa chốt được giá' });
    return field;
  }
  const midpoint = (floorPrice + listedPrice) / 2;
  if (agreedPrice <= floorPrice + 100_000) {
    field.score = 25;
  } else if (agreedPrice <= midpoint) {
    field.score = 18;
  } else if (agreedPrice < listedPrice) {
    field.score = 10;
  } else {
    field.score = 5;
    field.weakLines.push({ quote: '', reason: 'Chốt bằng/giá cao hơn giá rao' });
  }
  return field;
}

function verdictFor(total: number): string {
  if (total >= 80) return 'Xuất sắc — bạn đàm phán như người có kinh nghiệm';
  if (total >= 60) return 'Khá — vài điểm cần siết lại';
  if (total >= 40) return 'Cần luyện thêm — xem bài học bên dưới';
  return 'Mới bắt đầu — hãy luyện vòng nữa';
}

export function scoreNegotiation(input: {
  history: Turn[];
  agreedPrice: number | null;
  floorPrice: number;
  listedPrice: number;
}): ScoreResult {
  const { history, agreedPrice, floorPrice, listedPrice } = input;
  const tenantTurns = history.filter((t) => t.speaker === 'tenant');

  // No valid scenario to score against — return honest zeroes, never divide by zero.
  if (listedPrice <= 0 || floorPrice <= 0) {
    const fields: ScoreField[] = [
      { id: 'opening', label: 'Mở đầu — neo giá', score: 0, max: FIELD_MAX, weakLines: [{ quote: '', reason: 'Chưa có dữ liệu để chấm' }] },
      { id: 'leverage', label: 'Đòn bẩy — lý do thuyết phục', score: 0, max: FIELD_MAX, weakLines: [{ quote: '', reason: 'Chưa có dữ liệu để chấm' }] },
      { id: 'pacing', label: 'Nhịp nhượng bộ', score: 0, max: FIELD_MAX, weakLines: [{ quote: '', reason: 'Chưa có dữ liệu để chấm' }] },
      { id: 'closing', label: 'Chốt giá', score: 0, max: FIELD_MAX, weakLines: [{ quote: '', reason: 'Chưa có dữ liệu để chấm' }] },
    ];
    return { total: 0, max: TOTAL_MAX, fields, verdict: 'Chưa có dữ liệu để chấm — hãy hoàn thành một vòng đàm phán.' };
  }

  const fields: ScoreField[] = [
    scoreOpening(tenantTurns, listedPrice),
    scoreLeverage(tenantTurns),
    scorePacing(tenantTurns, agreedPrice),
    scoreClosing(agreedPrice, floorPrice, listedPrice),
  ];
  const total = fields.reduce((sum, f) => sum + f.score, 0);
  return { total, max: TOTAL_MAX, fields, verdict: verdictFor(total) };
}
