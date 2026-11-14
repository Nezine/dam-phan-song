// Shared types for the negotiation loop.
export type Scenario = {
  tenantName: string;
  city: string;
  roomType: string; // e.g. "phòng trọ 20m2 có gác"
  listedPrice: number; // giá rao (VND/tháng)
  floorPrice: number; // giá sàn của chủ trọ — AI không bao giờ chốt thấp hơn
  moveIn: string; // e.g. "01/12"
  twist?: 'hardline' | 'mold' | 'deposit'; // tình huống khó của giám khảo
  opening?: string; // câu mở đầu của chủ trọ (nếu có twist)
};

export type Turn = {
  speaker: 'tenant' | 'landlord';
  text: string;
  price?: number; // giá chủ trọ đưa ra trong lượt này (nếu có)
  emotion?: 'friendly' | 'neutral' | 'annoyed'; // cảm xúc chủ trọ (UI hiển thị 😊/😐/😠)
};

export type LandlordReply = {
  message: string; // lời đáp của chủ trọ (nói thành giọng qua TTS)
  currentPrice: number | null; // giá chủ trọ đang đưa ra, null nếu chưa đề giá
  agreed: boolean; // true nếu 2 bên đã chốt giá
  agreedPrice: number | null; // giá chốt (khi agreed)
  emotion: 'friendly' | 'neutral' | 'annoyed'; // màu sắc để UI + TTS đổi nhịp
};
