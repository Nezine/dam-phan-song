// Short psychology lessons tied to the rent-negotiation scenario.
// Each lesson stays under 60 Vietnamese words (title + body + tip).
// Shown on the results screen next to the weak lines they explain.
export type Lesson = {
  id: string;
  title: string;
  body: string;
  tip: string;
};

export const LESSONS: Lesson[] = [
  {
    id: 'anchoring',
    title: 'Neo giá — mở đầu thấp, hợp lý',
    body: 'Giá đầu tiên bạn đưa ra kéo cả cuộc nói chuyện về phía mình. Mở đầu thấp nhưng hợp lý — thấp quá chủ trọ gạt ngay, cao quá thì mất chỗ nhượng.',
    tip: 'Mở đầu thấp hơn giá rao khoảng 15%, kèm một lý do cụ thể.',
  },
  {
    id: 'pacing',
    title: 'Nhượng bộ từng bước',
    body: 'Mỗi lần nhượng chỉ một ít, và đổi lại một điều kiện — ở lâu hơn, trả trước nhiều hơn. Nhượng nhanh và nhượng liền tay khiến chủ trọ biết bạn sẽ còn nhượng nữa.',
    tip: 'Mỗi lần nhượng tối đa 100k, luôn kèm một điều kiện.',
  },
  {
    id: 'batna',
    title: 'BATNA — luôn có phòng khác để đi',
    body: 'Sức mạnh của bạn là lựa chọn dự phòng. Khi có phòng khác để đi, bạn mới dám cứng rắn và sẵn sàng đứng dậy. Không có BATNA, mọi lý lẽ đều yếu.',
    tip: 'Trước khi đàm phán, xem trước 2 phòng khác để không bị ép giá.',
  },
];
