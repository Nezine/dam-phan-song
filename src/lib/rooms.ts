// Danh mục phòng luyện kỹ năng thuyết phục và đàm phán.

export type RoomId = 'sales' | 'income' | 'teaching' | 'speaking' | 'wealth';

export type Room = {
  id: RoomId;
  order: number;
  icon: string;
  title: string;
  tagline: string;
  desc: string;
  scenarios: string[];
  difficulty: 1 | 2 | 3;
  unlockText: string;
  requiresRoomCompleted?: RoomId;
  requiresLevel?: number;
};

export const ROOMS: Room[] = [
  {
    id: 'sales',
    order: 1,
    icon: '🛍️',
    title: 'Thuyết phục khách mua hàng',
    tagline: 'Phòng 1 trong 5 — thực hành tư vấn và chốt đơn',
    desc: 'Luyện lắng nghe nhu cầu, xử lý băn khoăn về giá và tạo niềm tin để khách hàng tự tin quyết định mua.',
    scenarios: ['Giá vượt ngân sách', 'Chưa thấy cần thiết', 'Cần thêm niềm tin', 'Chưa đúng thời điểm'],
    difficulty: 1,
    unlockText: 'Đã mở',
  },
  {
    id: 'income',
    order: 2,
    icon: '💼',
    title: 'Đàm phán thu nhập',
    tagline: 'Đưa giá trị công việc vào cuộc trò chuyện',
    desc: 'Luyện đề xuất mức thu nhập và thỏa thuận điều kiện công việc dựa trên kết quả cụ thể.',
    scenarios: ['Đề xuất mức thu nhập', 'Trao đổi đãi ngộ', 'Thỏa thuận lịch làm'],
    difficulty: 2,
    unlockText: 'Hoàn thành Phòng 1 để mở',
    requiresRoomCompleted: 'sales',
  },
  {
    id: 'teaching',
    order: 3,
    icon: '📚',
    title: 'Giảng dạy thuyết phục',
    tagline: 'Giải thích rõ để người học muốn tiến bộ',
    desc: 'Luyện trình bày ý tưởng, phản hồi câu hỏi khó và giúp người học cam kết với bước tiếp theo.',
    scenarios: ['Giải thích khái niệm khó', 'Gỡ vướng khi học', 'Tạo động lực thực hành'],
    difficulty: 2,
    unlockText: 'Hoàn thành Phòng 2 để mở',
    requiresRoomCompleted: 'income',
  },
  {
    id: 'speaking',
    order: 4,
    icon: '🎤',
    title: 'Diễn giả tự tin',
    tagline: 'Giữ sự chú ý và trả lời câu hỏi khó',
    desc: 'Luyện mở đầu cuốn hút, trình bày thông điệp ngắn gọn và ứng biến trước khán giả.',
    scenarios: ['Mở đầu bài nói', 'Trả lời phản biện', 'Kêu gọi hành động'],
    difficulty: 3,
    unlockText: 'Đạt cấp 5 để mở',
    requiresLevel: 5,
  },
  {
    id: 'wealth',
    order: 5,
    icon: '📈',
    title: 'Làm giàu và phát triển bản thân',
    tagline: 'Biến mục tiêu lớn thành quyết định rõ ràng',
    desc: 'Luyện trình bày cơ hội, kiểm tra giả định và tạo cam kết cho kế hoạch phát triển dài hạn.',
    scenarios: ['Trình bày cơ hội kinh doanh', 'Phản hồi câu hỏi khó', 'Lập kế hoạch phát triển'],
    difficulty: 3,
    unlockText: 'Đạt cấp 8 để mở',
    requiresLevel: 8,
  },
];

export const difficultyLabel = (d: 1 | 2 | 3): string =>
  d === 1 ? 'Dễ' : d === 2 ? 'Vừa' : 'Khó';
