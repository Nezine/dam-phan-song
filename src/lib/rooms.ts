// Danh mục phòng tập — Đàm Phán Sống là app luyện kỹ năng đàm phán nói chung.
// Thuê trọ chỉ là Phòng 1 (phòng tập đầu tiên), KHÔNG phải toàn bộ app.
// Copy giữ khung rộng: "luyện nói chuyện khó", không đóng khung vào trọ.

export type RoomId = 'rent' | 'deposit' | 'salary-parttime' | 'interview' | 'investor';

export type Room = {
  id: RoomId;
  order: number; // thứ tự trên bản đồ
  icon: string;
  title: string;
  tagline: string; // 1 dòng: phòng này luyện gì
  desc: string;
  scenarios: string[]; // bộ tình huống trong phòng
  difficulty: 1 | 2 | 3; // 1 = dễ, 2 = vừa, 3 = khó
  unlockText: string; // điều kiện mở khóa (hiển thị khi đang khóa)
  requiresRoomCompleted?: RoomId; // phải hoàn thành phòng này trước
  requiresLevel?: number; // hoặc đạt cấp này
};

export const ROOMS: Room[] = [
  {
    id: 'rent',
    order: 1,
    icon: '🏠',
    title: 'Đàm phán thuê trọ',
    tagline: 'Phòng 1 trong 5 — tình huống quen thuộc nhất để bắt đầu',
    desc: 'Luyện kỹ năng mặc cả qua tình huống thuê trọ: giá thuê, tiền cọc, điều khoản đóng — với chủ trọ AI khó tính nhưng nhất quán.',
    scenarios: ['Giá sàn cứng', 'Phòng ẩm mốc', 'Cọc 2 tháng'],
    difficulty: 1,
    unlockText: 'Đã mở',
  },
  {
    id: 'deposit',
    order: 2,
    icon: '🔑',
    title: 'Đòi lại tiền cọc',
    tagline: 'Đòi cọc có lý, có chứng cứ',
    desc: 'Luyện đòi lại cọc khi chuyển đi: phản bác khoản trừ tiền sửa chữa vô lý, xử lý cọc bị giữ quá hạn.',
    scenarios: ['Đòi lại cọc khi chuyển đi', 'Trừ tiền sửa chữa vô lý', 'Cọc giữ quá hạn'],
    difficulty: 2,
    unlockText: 'Hoàn thành Phòng 1 để mở',
    requiresRoomCompleted: 'rent',
  },
  {
    id: 'salary-parttime',
    order: 3,
    icon: '💼',
    title: 'Lương làm thêm',
    tagline: 'Xin tăng lương mà không run',
    desc: 'Luyện xin tăng lương theo giờ bằng kết quả đã làm được, đòi lương trả chậm, thương lượng ca làm với quản lý.',
    scenarios: ['Xin tăng lương theo giờ', 'Đòi lương trả chậm', 'Thương lượng ca làm'],
    difficulty: 2,
    unlockText: 'Hoàn thành Phòng 2 để mở',
    requiresRoomCompleted: 'deposit',
  },
  {
    id: 'interview',
    order: 4,
    icon: '🎤',
    title: 'Phỏng vấn xin việc',
    tagline: 'Trả lời cứng trước nhà tuyển dụng',
    desc: 'Luyện trả lời câu hỏi khó, thương lượng lương khởi điểm, giữ bình tĩnh khi phỏng vấn nhóm dưới áp lực.',
    scenarios: ['"Điểm yếu của bạn là gì?"', 'Thương lượng lương khởi điểm', 'Phỏng vấn nhóm'],
    difficulty: 3,
    unlockText: 'Đạt cấp 5 để mở',
    requiresLevel: 5,
  },
  {
    id: 'investor',
    order: 5,
    icon: '📈',
    title: 'Trả lời nhà đầu tư',
    tagline: 'Đàm phán ở bàn lớn',
    desc: 'Luyện gọi vốn vòng đầu, trả lời câu hỏi xoáy về doanh thu, từ chối mà vẫn giữ quan hệ.',
    scenarios: ['Gọi vốn vòng đầu', 'Bị hỏi xoáy về doanh thu', 'Từ chối mà vẫn giữ quan hệ'],
    difficulty: 3,
    unlockText: 'Đạt cấp 8 để mở',
    requiresLevel: 8,
  },
];

export const difficultyLabel = (d: 1 | 2 | 3): string =>
  d === 1 ? 'Dễ' : d === 2 ? 'Vừa' : 'Khó';
