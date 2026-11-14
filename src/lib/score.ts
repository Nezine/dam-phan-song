// Rule-based scoring for the Room 1 negotiation (thuê trọ).
// RULE-BASED, NOT AI: every rule is a transparent keyword/number check on the
// real transcript. The result screen labels it as such. Milo's rubric should
// replace/augment these rules when ready.
import type { Scenario, Turn } from './types';

export type RuleId = 'target' | 'reason' | 'terms' | 'persist' | 'polite' | 'close';

export type RuleResult = {
  id: RuleId;
  label: string;
  passed: boolean;
  evidence: string | null; // exact tenant sentence that proves the rule
  tip: string; // what to do better when the rule fails
};

export type WeakSentence = { text: string; why: string };

export type ScoreResult = {
  points: number;
  max: number;
  percent: number;
  grade: string;
  rules: RuleResult[];
  weakSentences: WeakSentence[];
  lessons: string[]; // one lesson per failed rule
};

const fmt = (n: number) => n.toLocaleString('vi-VN');

const norm = (s: string) => s.toLowerCase();

// Extract VND amounts from Vietnamese text: "3tr2" -> 3.2M, "3,2 triệu" -> 3.2M,
// "3200000" -> 3.2M, bare "3" in this context -> 3M.
function extractVnd(text: string): number[] {
  const out: number[] = [];
  const t = norm(text);
  const re = /(\d+)\s*tr\s*(\d)|(\d+(?:[.,]\d+)?)\s*(tr|triệu|tỷ|k|nghìn|ngàn)?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(t)) !== null) {
    if (m[1] !== undefined) {
      out.push(Number(m[1]) * 1_000_000 + Number(m[2]) * 100_000);
      continue;
    }
    const raw = Number(m[3].replace(',', '.'));
    const unit = m[4];
    if (unit === 'tỷ') out.push(raw * 1_000_000_000);
    else if (unit === 'tr' || unit === 'triệu') out.push(raw * 1_000_000);
    else if (unit === 'k' || unit === 'nghìn' || unit === 'ngàn') out.push(raw * 1_000);
    else if (raw >= 1000) out.push(raw);
    else if (raw >= 1 && raw <= 100) out.push(raw * 1_000_000);
  }
  return out;
}

const REASON_WORDS = [
  'mốc', 'ẩm', 'hỏng', 'cũ', 'nứt', 'dột', 'xa', 'chật', 'ồn', 'nóng',
  'sinh viên', 'lương', 'thu nhập', 'ngân sách', 'thị trường', 'chỗ khác',
  'phòng khác', 'hợp đồng', 'điện nước', 'gác', 'không có thang', 'mất điện',
];

const TERM_WORDS = [
  'cọc', 'đóng theo tháng', 'đóng 1 tháng', 'đóng tháng', 'thanh toán',
  'trả trước', 'miễn tháng', 'giảm cọc', 'bao điện', 'đóng 2 tháng',
];

const POLITE_WORDS = ['ạ', 'anh ơi', 'chị ơi', 'em cảm ơn', 'cảm ơn anh', 'mong anh', 'nhờ anh', 'dạ'];

const hasAny = (text: string, words: string[]) => {
  const t = norm(text);
  return words.some((w) => t.includes(w));
};

function gradeFor(percent: number): string {
  if (percent >= 83) return 'Xuất sắc';
  if (percent >= 66) return 'Tốt';
  if (percent >= 50) return 'Khá';
  if (percent >= 33) return 'Cần luyện thêm';
  return 'Mới bắt đầu';
}

export function scoreNegotiation(
  turns: Turn[],
  scenario: Scenario,
  agreedPrice: number | null,
): ScoreResult {
  const tenantTurns = turns.filter((t) => t.speaker === 'tenant');
  const tenantTexts = tenantTurns.map((t) => t.text);
  const allText = tenantTexts.join(' ');

  // R1 — concrete target price below listed
  let targetEvidence: string | null = null;
  for (const text of tenantTexts) {
    const nums = extractVnd(text);
    if (nums.some((n) => n > 0 && n < scenario.listedPrice)) {
      targetEvidence = text;
      break;
    }
  }

  // R2 — a concrete reason
  const reasonEvidence = tenantTexts.find((t) => hasAny(t, REASON_WORDS)) ?? null;

  // R3 — payment terms
  const termsEvidence = tenantTexts.find((t) => hasAny(t, TERM_WORDS)) ?? null;

  // R4 — persistence: 3+ tenant turns, or 2+ distinct counter-offers
  const offers = new Set<number>();
  for (const text of tenantTexts) {
    for (const n of extractVnd(text)) {
      if (n > 0 && n < scenario.listedPrice) offers.add(n);
    }
  }
  const persistPassed = tenantTurns.length >= 3 || offers.size >= 2;

  // R5 — polite tone
  const politeEvidence = tenantTexts.find((t) => hasAny(t, POLITE_WORDS)) ?? null;

  // R6 — closed below listed price
  const closePassed = agreedPrice != null && agreedPrice < scenario.listedPrice;
  const closeEvidence =
    agreedPrice != null ? `Chốt ${fmt(agreedPrice)}đ/tháng (giá rao ${fmt(scenario.listedPrice)}đ)` : null;

  const rules: RuleResult[] = [
    {
      id: 'target',
      label: 'Đưa ra giá mục tiêu cụ thể',
      passed: targetEvidence != null,
      evidence: targetEvidence,
      tip: 'Luôn mở đầu bằng một con số cụ thể thấp hơn giá rao — đối phương chỉ nhượng bộ khi có số để trả giá.',
    },
    {
      id: 'reason',
      label: 'Nêu lý do cụ thể để giảm giá',
      passed: reasonEvidence != null,
      evidence: reasonEvidence,
      tip: 'Mỗi lần mặc cả cần một lý do cụ thể (chất lượng, vị trí, ngân sách) — lý do càng cụ thể càng khó bị gạt.',
    },
    {
      id: 'terms',
      label: 'Mặc cả bằng điều khoản thanh toán',
      passed: termsEvidence != null,
      evidence: termsEvidence,
      tip: 'Khi đối phương cứng giá, đổi hướng sang điều khoản (tiền cọc, đóng theo tháng) thay vì ép giá.',
    },
    {
      id: 'persist',
      label: 'Kiên trì ít nhất 2–3 lượt',
      passed: persistPassed,
      evidence: persistPassed ? `${tenantTurns.length} lượt nói, ${offers.size} mức giá đã đưa` : null,
      tip: 'Đừng gật ngay ở lượt đầu — mặc cả tốt cần ít nhất 2–3 lượt đưa ra và giữ lập trường.',
    },
    {
      id: 'polite',
      label: 'Giữ giọng lịch sự',
      passed: politeEvidence != null,
      evidence: politeEvidence,
      tip: "Giữ giọng lịch sự ('ạ', 'anh ơi') giúp đối phương khó nổi nóng và dễ nhượng bộ hơn.",
    },
    {
      id: 'close',
      label: 'Chốt thấp hơn giá rao',
      passed: closePassed,
      evidence: closeEvidence,
      tip: 'Chỉ chốt khi giá đã thấp hơn giá rao — chốt ở giá rao nghĩa là chưa mặc cả được gì.',
    },
  ];

  // Weak sentences (fair-persuasion rule): a turn is weak ONLY if it adds no
  // NEW persuasive content vs previous tenant turns — no new price, reason
  // word, or term word. Repeating the same ask is not itself penalised; an
  // ask that brings a new reason/term still counts as persuasion, not nagging.
  const weakSentences: WeakSentence[] = [];
  const seenPrices = new Set<number>();
  const seenReasons = new Set<string>();
  const seenTerms = new Set<string>();
  for (const text of tenantTexts) {
    const prices = extractVnd(text).filter((n) => n > 0 && n < scenario.listedPrice);
    const reasons = REASON_WORDS.filter((w) => norm(text).includes(w));
    const terms = TERM_WORDS.filter((w) => norm(text).includes(w));
    const newInfo =
      prices.some((n) => !seenPrices.has(n)) ||
      reasons.some((w) => !seenReasons.has(w)) ||
      terms.some((w) => !seenTerms.has(w));
    prices.forEach((n) => seenPrices.add(n));
    reasons.forEach((w) => seenReasons.add(w));
    terms.forEach((w) => seenTerms.add(w));
    if (!newInfo && text.trim().length > 0) {
      weakSentences.push({
        text,
        why: 'Câu này lặp lại mà không đưa thêm lý do, con số hay điều khoản mới.',
      });
    }
    if (weakSentences.length >= 3) break;
  }

  const points = rules.filter((r) => r.passed).length;
  const max = rules.length;
  const percent = Math.round((points / max) * 100);
  const lessons = rules.filter((r) => !r.passed).map((r) => r.tip);

  return { points, max, percent, grade: gradeFor(percent), rules, weakSentences, lessons };
}
