// Câu vàng + thử thách ngoài đời thật — ĐƯỢC SINH TỪ src/data/quotes.json và
// src/data/challenges.json (commit 76c685a, đã xác minh nguồn). Khi data đổi,
// sinh lại file này từ 2 file JSON đó. Không bịa câu nào.
export type Quote = { id: string; author: string; text: string };
export type Challenge = { id: string; minutes: number; text: string };

export const QUOTES: Quote[] = [
  { id: 'q01', author: 'John F. Kennedy', text: 'Đừng bao giờ đàm phán vì sợ hãi. Nhưng cũng đừng bao giờ sợ phải đàm phán.' },
  { id: 'q02', author: 'Dale Carnegie', text: 'Bạn có thể kết thêm bạn trong hai tháng bằng cách thực sự quan tâm đến người khác hơn là trong hai năm cố khiến người khác quan tâm đến bạn.' },
  { id: 'q03', author: 'Warren Buffett', text: 'Giá là thứ bạn trả. Giá trị là thứ bạn nhận được.' },
  { id: 'q04', author: 'Stephen R. Covey', text: 'Hãy tìm hiểu người khác trước, rồi mới mong được người khác hiểu.' },
  { id: 'q05', author: 'Sun Tzu', text: 'Khuất phục đối phương mà không cần giao chiến mới là đỉnh cao của nghệ thuật.' },
  { id: 'q06', author: 'Zig Ziglar', text: 'Bạn có thể đạt được mọi thứ mình muốn trong đời nếu chịu giúp đủ nhiều người khác đạt được điều họ muốn.' },
  { id: 'q07', author: 'Winston Churchill', text: 'Ngồi lại nói chuyện bao giờ cũng tốt hơn là đánh nhau.' },
  { id: 'q08', author: 'Seneca', text: 'Chúng ta đau khổ trong tưởng tượng thường xuyên hơn trong thực tế.' },
  { id: 'q09', author: 'Benjamin Franklin', text: 'Người từng giúp bạn một lần sẽ sẵn lòng giúp bạn lần nữa hơn là người mà chính bạn đã giúp.' },
  { id: 'q10', author: 'Benjamin Franklin', text: 'Hoặc viết những điều đáng đọc, hoặc làm những điều đáng để người ta viết lại.' },
];

export const CHALLENGES: Challenge[] = [
  { id: 'c01', minutes: 5, text: 'Ra chợ mua một món dưới 100 nghìn: trả giá thấp hơn 10 nghìn bằng giọng vui vẻ. Dù được hay không, cảm ơn người bán rồi đi.' },
  { id: 'c02', minutes: 2, text: 'Khen chân thành một người bạn hoặc đồng nghiệp về một việc cụ thể họ làm tốt hôm nay — nói rõ bạn thích điều gì ở việc đó.' },
  { id: 'c03', minutes: 5, text: 'Hỏi một người bạn đã đi làm: \'Lần gần nhất bạn đề nghị tăng lương, bạn đã mở đầu câu đó thế nào?\' — chỉ nghe, không phán xét, không chen ngang.' },
  { id: 'c04', minutes: 5, text: 'Giải thích cho một người bạn một khái niệm bạn vừa học, trong 2 phút, không dùng thuật ngữ chuyên môn. Nếu họ hiểu, bạn đã dạy được.' },
  { id: 'c05', minutes: 2, text: 'Trong buổi học hoặc buổi họp nhóm tới, giơ tay nói một ý ngắn dưới 30 giây — dù tim đập nhanh. Nói xong thì thôi, không xin lỗi vì đã nói.' },
  { id: 'c06', minutes: 5, text: 'Hỏi một người lớn tuổi trong nhà: \'Hồi bằng tuổi con, cô/chú đã tiết kiệm đồng tiền đầu tiên như thế nào?\' — ghi lại một câu trả lời hay nhất.' },
];

/** 1 câu vàng ngẫu nhiên cho thẻ thắng (chọn 1 lần mỗi lần chốt giá). */
export function randomQuote(seed: number): Quote {
  return QUOTES[Math.abs(seed) % QUOTES.length];
}

/** 1 thử thách hôm nay — xoay theo ngày trong năm, 6 thử thách lặp lại. */
export function todayChallenge(d = new Date()): Challenge {
  const start = new Date(d.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((d.getTime() - start.getTime()) / 86400000);
  return CHALLENGES[dayOfYear % CHALLENGES.length];
}
