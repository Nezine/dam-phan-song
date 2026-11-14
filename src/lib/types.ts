// Shared types for the sales persuasion loop.
export type Scenario = {
  sellerName: string;
  city: string;
  productName: string;
  listedPrice: number; // giá niêm yết (VND)
  targetPrice: number; // mức thấp nhất người bán chấp nhận (VND)
  maxBudget: number; // ngân sách tối đa bí mật của khách hàng (VND)
  twist?: 'hardline' | 'mold' | 'deposit' | 'price' | 'need' | 'trust' | 'timing';
  opening?: string; // lời mở đầu của khách hàng (nếu có tình huống)
};

export type Turn = {
  speaker: 'seller' | 'customer';
  text: string;
  price?: number; // mức giá được nêu trong lượt này (nếu có)
  emotion?: 'friendly' | 'neutral' | 'annoyed'; // cảm xúc khách hàng (UI hiển thị 😊/😐/😠)
};

export type CustomerReply = {
  message: string; // lời đáp của khách hàng (nói thành giọng qua TTS)
  currentPrice: number | null; // mức giá được nêu trong lượt này, null nếu không có
  agreed: boolean; // true nếu khách hàng đồng ý mua
  agreedPrice: number | null; // giá chốt (khi agreed)
  emotion: 'friendly' | 'neutral' | 'annoyed'; // màu sắc để UI + TTS đổi nhịp
};
