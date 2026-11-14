// Lộ trình học đàm phán — dữ liệu + tiến độ.
// Khung chung: kỹ năng đàm phán nói chung (không gắn với một tình huống cụ thể nào).
// Mỗi cấp có 2 bài tập + 1 bài test + 1 buổi thực hành, độ khó tăng dần.
// Chấm điểm theo thang cố định RUBRIC (5 tiêu chí × 2 điểm = 10 điểm).
import { File, Paths } from 'expo-file-system';

export type RoadmapItemKind = 'exercise' | 'test' | 'practice';
export type ItemStatus = 'locked' | 'unlocked' | 'done';

export type QuizQuestion = {
  q: string;
  options: string[];
  correct: number; // index của đáp án đúng
  explain: string;
};

export type RoadmapItem = {
  id: string;
  kind: RoadmapItemKind;
  title: string;
  desc: string;
  minutes: number;
  xp: number;
  lesson: string; // bài học tâm lý ngắn gắn với mục này
  quiz?: QuizQuestion[]; // chỉ có ở bài test
  practicePrompt?: string; // chỉ có ở buổi thực hành: tình huống roleplay
};

export type RoadmapLevel = {
  id: string;
  n: number;
  title: string;
  tagline: string;
  items: RoadmapItem[];
};

export type ItemResult = { done: boolean; bestScore: number | null; attempts: number };
export type RoadmapProgress = Record<string, ItemResult>;

// Thang chấm cố định — dùng chung cho mọi bài test + buổi thực hành.
export const RUBRIC: { label: string; hint: string }[] = [
  { label: 'Mở đầu rõ mục tiêu', hint: 'Nói rõ mình muốn gì ngay từ đầu, không vòng vo.' },
  { label: 'Đưa lý do thay vì đòi hỏi', hint: 'Mỗi đề nghị đi kèm một lý do đối phương quan tâm.' },
  { label: 'Nhượng bộ có điều kiện', hint: 'Nhượng bộ phải đổi lại được một thứ khác, không cho không.' },
  { label: 'Giữ bình tĩnh khi bị ép', hint: 'Bị ép vẫn chậm lại, không phản ứng nóng.' },
  { label: 'Chốt rõ ràng, có thời hạn', hint: 'Kết thúc bằng: việc gì, ai làm, khi nào xong.' },
];
export const MAX_SCORE = RUBRIC.length * 2; // 10

export const KIND_LABEL: Record<RoadmapItemKind, string> = {
  exercise: 'Bài tập',
  test: 'Bài test',
  practice: 'Thực hành',
};

export const LEVELS: RoadmapLevel[] = [
  {
    id: 'lv1',
    n: 1,
    title: 'Nói sao cho người ta nghe',
    tagline: 'Nền tảng: câu hỏi mở, lắng nghe, nhắc lại.',
    items: [
      {
        id: 'lv1-ex1',
        kind: 'exercise',
        title: 'Đặt câu hỏi mở',
        desc: 'Thay câu khẳng định bằng câu hỏi mở để đối phương tự nói ra nhu cầu của họ.',
        minutes: 5,
        xp: 10,
        lesson: 'Tâm lý: người ta tin vào kết luận do chính mình nói ra hơn là kết luận bị người khác ép vào.',
      },
      {
        id: 'lv1-ex2',
        kind: 'exercise',
        title: 'Lắng nghe rồi nhắc lại',
        desc: 'Nghe hết câu, nhắc lại ý chính bằng lời của mình trước khi phản hồi.',
        minutes: 5,
        xp: 10,
        lesson: 'Tâm lý: được nhắc lại đúng ý khiến đối phương cảm thấy mình được hiểu — và bắt đầu tin bạn.',
      },
      {
        id: 'lv1-test',
        kind: 'test',
        title: 'Kiểm tra nền tảng',
        desc: '3 câu hỏi nhanh: câu hỏi mở, lắng nghe, phản hồi đúng lúc.',
        minutes: 3,
        xp: 20,
        lesson: 'Muốn thuyết phục ai, trước hết phải khiến họ cảm thấy mình được nghe.',
        quiz: [
          {
            q: 'Muốn biết đối phương thực sự cần gì, bạn nên nói câu nào?',
            options: [
              '“Anh cần cái này, đúng không?”',
              '“Điều gì quan trọng nhất với anh trong chuyện này?”',
              '“Em nghĩ anh nên chọn phương án A.”',
            ],
            correct: 1,
            explain: 'Câu hỏi mở để đối phương tự nói ra nhu cầu — thông tin đó quý hơn mọi lời thuyết phục.',
          },
          {
            q: 'Đối phương đang nói dở, bạn nên làm gì?',
            options: [
              'Ngắt lời để sửa ngay vì bạn biết họ sai.',
              'Nghe hết, nhắc lại ý chính rồi mới phản hồi.',
              'Gật đầu cho qua rồi nói tiếp ý của mình.',
            ],
            correct: 1,
            explain: 'Nhắc lại ý chính chứng minh bạn đã nghe — và cho bạn thời gian nghĩ trước khi đáp.',
          },
          {
            q: 'Câu nào là phản hồi tốt sau khi đối phương nêu lo ngại?',
            options: [
              '“Anh lo thừa rồi, không sao đâu.”',
              '“Em hiểu anh lo về chi phí — để em nói rõ phần đó trước nhé.”',
              '“Thôi bỏ qua chuyện đó đi.”',
            ],
            correct: 1,
            explain: 'Gọi tên đúng nỗi lo rồi mới giải quyết — phủ nhận lo ngại chỉ khiến đối phương thủ thế.',
          },
        ],
      },
      {
        id: 'lv1-pr',
        kind: 'practice',
        title: 'Thực hành: Mượn đồ và hẹn trả',
        desc: 'Đàm phán bằng giọng nói: mượn một món đồ có giá trị và thỏa thuận thời gian trả rõ ràng.',
        minutes: 10,
        xp: 30,
        lesson: 'Bài tập nhỏ, stakes thật: mượn đồ là đàm phán thu nhỏ — có đề nghị, có lo ngại, có chốt.',
        practicePrompt:
          'Bạn muốn mượn máy ảnh của một người bạn trong 3 ngày để đi chụp ngoại cảnh. Bạn của bạn hơi lưỡng lự vì sợ hỏng. Hãy thuyết phục bằng giọng nói: hỏi nhu cầu của bạn ấy, đưa ra cách bảo quản cụ thể, và chốt thời gian trả rõ ràng.',
      },
    ],
  },
  {
    id: 'lv2',
    n: 2,
    title: 'Đọc vị đối phương',
    tagline: 'Tâm lý: lựa chọn dự phòng, cảm xúc ẩn sau lời nói.',
    items: [
      {
        id: 'lv2-ex1',
        kind: 'exercise',
        title: 'Tìm lựa chọn dự phòng của đối phương',
        desc: 'Trước mỗi cuộc nói chuyện, đoán xem đối phương còn lựa chọn nào khác ngoài bạn — đó là sức mạnh thật của họ.',
        minutes: 5,
        xp: 10,
        lesson: 'Tâm lý: ai càng ít lựa chọn thay thế thì càng dễ nhượng bộ. Biết được điều đó, bạn biết mình đang ở thế nào.',
      },
      {
        id: 'lv2-ex2',
        kind: 'exercise',
        title: 'Nghe điều không nói ra',
        desc: 'Nhận diện cảm xúc và mối lo ẩn sau lời nói: giọng điệu, sự ngập ngừng, câu né tránh.',
        minutes: 5,
        xp: 10,
        lesson: 'Tâm lý: lời nói là bề mặt. Quyết định thường nằm ở cảm xúc và nỗi lo mà đối phương không nói thẳng.',
      },
      {
        id: 'lv2-test',
        kind: 'test',
        title: 'Kiểm tra đọc vị',
        desc: '3 câu hỏi nhanh: lựa chọn dự phòng, cảm xúc ẩn, điểm yếu thật sự.',
        minutes: 3,
        xp: 20,
        lesson: 'Đàm phán giỏi không phải nói hay — mà là hiểu đối phương trước khi mở miệng.',
        quiz: [
          {
            q: 'Đối phương nói “để tôi suy nghĩ thêm”, khả năng cao nhất là gì?',
            options: [
              'Họ chắc chắn sẽ từ chối.',
              'Họ còn một lựa chọn khác đang cân nhắc, hoặc chưa tin bạn.',
              'Họ muốn bạn giảm giá ngay.',
            ],
            correct: 1,
            explain: '“Suy nghĩ thêm” thường nghĩa là họ chưa đủ tin — hoặc đang so sánh với một lựa chọn khác.',
          },
          {
            q: 'Muốn biết sức mạnh thật của đối phương, bạn cần biết điều gì?',
            options: [
              'Họ có bao nhiêu tiền.',
              'Nếu không thỏa thuận với bạn, họ còn đi đâu được.',
              'Họ thích màu gì.',
            ],
            correct: 1,
            explain: 'Lựa chọn dự phòng quyết định sức mạnh. Không còn đường lui thì phải nhượng bộ — và ngược lại.',
          },
          {
            q: 'Đối phương liên tục nhấn mạnh “tôi bận lắm”, bạn nên hiểu là gì?',
            options: [
              'Họ đang khoe khoang.',
              'Thời gian là mối lo thật của họ — hãy đàm phán trên thời gian, không phải giá.',
              'Họ muốn kết thúc ngay.',
            ],
            correct: 1,
            explain: 'Điều người ta lặp lại nhiều lần thường là điều họ quan tâm nhất. Đàm phán đúng vào đó.',
          },
        ],
      },
      {
        id: 'lv2-pr',
        kind: 'practice',
        title: 'Thực hành: Xin gia hạn deadline',
        desc: 'Đàm phán bằng giọng nói: xin thêm thời gian hoàn thành công việc mà không mất uy tín.',
        minutes: 10,
        xp: 30,
        lesson: 'Xin gia hạn không phải xin xỏ — mà là thương lượng lại cam kết với lý do và phương án rõ ràng.',
        practicePrompt:
          'Bạn nhận một công việc làm thêm và sắp trễ hạn 2 ngày vì lý do bất khả kháng. Hãy nói chuyện với người giao việc: thừa nhận trách nhiệm, giải thích ngắn gọn, đề xuất thời gian mới cụ thể và một phần việc giao trước để chứng minh thiện chí.',
      },
    ],
  },
  {
    id: 'lv3',
    n: 3,
    title: 'Chiến thuật trên bàn đàm phán',
    tagline: 'Nhượng bộ có điều kiện, đưa lựa chọn thay vì một con số.',
    items: [
      {
        id: 'lv3-ex1',
        kind: 'exercise',
        title: 'Nhượng bộ có điều kiện',
        desc: 'Mỗi lần nhượng bộ phải đổi lại được một thứ khác. Không bao giờ cho không.',
        minutes: 5,
        xp: 10,
        lesson: 'Tâm lý: thứ cho không bị xem là không có giá trị. Nhượng bộ có điều kiện vừa giữ giá trị của bạn, vừa kéo đối phương nhượng lại.',
      },
      {
        id: 'lv3-ex2',
        kind: 'exercise',
        title: 'Đưa lựa chọn, không đưa một con số',
        desc: 'Luôn đưa 2–3 phương án để đối phương chọn, thay vì đưa một con số duy nhất rồi mặc cả quanh nó.',
        minutes: 5,
        xp: 10,
        lesson: 'Tâm lý: người ta thích cảm giác được chọn. Đưa lựa chọn nghĩa là bạn vẫn giữ quyền quyết định khung, nhưng đối phương cảm thấy mình làm chủ.',
      },
      {
        id: 'lv3-test',
        kind: 'test',
        title: 'Kiểm tra chiến thuật',
        desc: '3 câu hỏi nhanh: nhượng bộ, đưa lựa chọn, giữ thế chủ động.',
        minutes: 3,
        xp: 20,
        lesson: 'Chiến thuật tốt là chiến thuật khiến cả hai bên đều cảm thấy mình thắng.',
        quiz: [
          {
            q: 'Đối phương muốn bạn giảm giá ngay. Đáp án tốt nhất là gì?',
            options: [
              'Giảm luôn để giữ khách.',
              '“Em giảm được 5% nếu anh chốt hôm nay và thanh toán một lần.”',
              '“Không giảm được.”',
            ],
            correct: 1,
            explain: 'Nhượng bộ có điều kiện: giảm giá đổi lấy chốt nhanh + thanh toán một lần. Bạn cho đi, nhưng nhận lại.',
          },
          {
            q: 'Muốn đối phương dễ đồng ý, bạn nên đưa ra:',
            options: [
              'Một con số duy nhất, rõ ràng.',
              '2–3 phương án để họ chọn.',
              'Để họ tự ra giá.',
            ],
            correct: 1,
            explain: 'Đưa lựa chọn giúp đối phương cảm thấy mình làm chủ quyết định — trong khi khung vẫn do bạn đặt ra.',
          },
          {
            q: 'Bạn đã nhượng bộ 2 lần, đối phương vẫn đòi thêm. Nên làm gì?',
            options: [
              'Nhượng tiếp cho xong việc.',
              'Dừng lại, nhắc lại những gì mình đã nhượng và hỏi họ đổi lại được gì.',
              'Bỏ về luôn.',
            ],
            correct: 1,
            explain: 'Nhượng bộ một chiều dạy đối phương rằng cứ đòi là được. Nhắc lại giá trị đã cho và yêu cầu đổi lại.',
          },
        ],
      },
      {
        id: 'lv3-pr',
        kind: 'practice',
        title: 'Thực hành: Thương lượng giá dịch vụ',
        desc: 'Đàm phán bằng giọng nói: thương lượng giá một dịch vụ theo gói, có điều kiện đi kèm.',
        minutes: 10,
        xp: 30,
        lesson: 'Giá không bao giờ đứng một mình — nó luôn đi kèm điều kiện: thời gian, khối lượng, phương thức thanh toán.',
        practicePrompt:
          'Bạn muốn thuê một người thiết kế làm bộ nhận diện cho câu lạc bộ, ngân sách có hạn. Hãy đàm phán: đưa ra 2 phương án (gói đầy đủ / gói tối giản), nhượng bộ có điều kiện (giảm giá đổi lấy thanh toán sớm), và chốt bằng văn bản rõ ràng.',
      },
    ],
  },
  {
    id: 'lv4',
    n: 4,
    title: 'Khi đối phương cứng rắn',
    tagline: 'Bị ép, bị dọa bỏ, bế tắc — vẫn giữ được nhịp của mình.',
    items: [
      {
        id: 'lv4-ex1',
        kind: 'exercise',
        title: 'Giữ bình tĩnh khi bị ép',
        desc: 'Kỹ thuật dừng 3 giây: bị ép thì chậm lại, hít thở, nhắc lại câu hỏi trước khi trả lời.',
        minutes: 5,
        xp: 10,
        lesson: 'Tâm lý: áp lực khiến não chuyển sang chế độ phản ứng. 3 giây dừng là đủ để não quay lại chế độ suy nghĩ.',
      },
      {
        id: 'lv4-ex2',
        kind: 'exercise',
        title: 'Phá thế bế tắc bằng câu hỏi',
        desc: 'Khi đối phương nói “không”, đừng cãi — hỏi: “Điều gì khiến anh/chị chưa đồng ý?”',
        minutes: 5,
        xp: 10,
        lesson: 'Tâm lý: câu “không” thường không phải kết luận mà là tín hiệu thiếu thông tin. Câu hỏi đúng mở lại cánh cửa.',
      },
      {
        id: 'lv4-test',
        kind: 'test',
        title: 'Kiểm tra xử lý cứng rắn',
        desc: '3 câu hỏi nhanh: bị ép giá, bị dọa bỏ, gặp bế tắc.',
        minutes: 3,
        xp: 20,
        lesson: 'Đối phương cứng rắn không có nghĩa là bạn thua — mà là bài test xem bạn có giữ được nhịp không.',
        quiz: [
          {
            q: 'Đối phương nói “không được thì thôi, tôi đi chỗ khác”, bạn nên làm gì?',
            options: [
              'Nhượng bộ ngay để giữ họ lại.',
              'Bình tĩnh hỏi: “Trước khi anh đi, cho em hỏi điều gì khiến anh chưa đồng ý?”',
              '“Vậy thì đi đi.”',
            ],
            correct: 1,
            explain: 'Câu hỏi mở lại cuộc nói chuyện và cho bạn biết vấn đề thật là gì — dọa bỏ thường chỉ là đòn tâm lý.',
          },
          {
            q: 'Bị ép phải trả lời ngay trong 10 giây, cách tốt nhất là:',
            options: [
              'Trả lời ngay cho kịp.',
              '“Để em xác nhận lại một ý rồi trả lời anh trong 1 phút được không?”',
              'Im lặng không nói gì.',
            ],
            correct: 1,
            explain: 'Xin thêm thời gian một cách lịch sự là quyền của bạn — và là kỹ thuật giữ bình tĩnh hiệu quả nhất.',
          },
          {
            q: 'Hai bên đã mặc cả 3 vòng vẫn chưa gặp nhau. Nước đi hay nhất là:',
            options: [
              'Chia đôi khoảng cách cho xong.',
              'Đổi khung: hỏi đối phương xem ngoài giá ra còn điều gì quan trọng với họ.',
              'Bỏ cuộc.',
            ],
            correct: 1,
            explain: 'Khi giá bế tắc, đổi sang đàm phán điều kiện khác (thời gian, khối lượng, phương thức) thường mở được đường.',
          },
        ],
      },
      {
        id: 'lv4-pr',
        kind: 'practice',
        title: 'Thực hành: Đối phương dọa bỏ đi',
        desc: 'Đàm phán bằng giọng nói: đối phương cứng rắn, dọa dừng đàm phán — giữ bình tĩnh và mở lại cuộc nói chuyện.',
        minutes: 10,
        xp: 30,
        lesson: 'Đòn dọa bỏ chỉ hiệu quả khi bạn sợ mất. Chuẩn bị sẵn lựa chọn dự phòng của mình trước khi vào bàn.',
        practicePrompt:
          'Bạn đang thương lượng với một khách hàng khó tính. Họ vừa nói “giá này không được thì tôi tìm người khác”. Hãy giữ bình tĩnh: không nhượng bộ ngay, hỏi điều gì khiến họ chưa đồng ý, và đưa ra một phương án khác ngoài giá.',
      },
    ],
  },
  {
    id: 'lv5',
    n: 5,
    title: 'Đàm phán như chuyên gia',
    tagline: 'Tổng hợp: chuẩn bị, đa vòng, chốt bằng văn bản.',
    items: [
      {
        id: 'lv5-ex1',
        kind: 'exercise',
        title: 'Chuẩn bị lựa chọn dự phòng của mình',
        desc: 'Trước mỗi cuộc đàm phán quan trọng, viết ra phương án dự phòng của chính mình: nếu không chốt được thì bạn làm gì.',
        minutes: 5,
        xp: 10,
        lesson: 'Tâm lý: người có đường lui thì không sợ mất. Và người không sợ mất thì đàm phán mạnh hơn hẳn.',
      },
      {
        id: 'lv5-ex2',
        kind: 'exercise',
        title: 'Chốt bằng văn bản rõ ràng',
        desc: 'Mọi thỏa thuận đều chốt lại bằng 3 dòng: việc gì, ai làm, khi nào xong. Không chốt miệng.',
        minutes: 5,
        xp: 10,
        lesson: 'Tâm lý: trí nhớ hai bên khác nhau sau mỗi cuộc nói chuyện. Văn bản rõ ràng bảo vệ cả hai — và bảo vệ chính bạn.',
      },
      {
        id: 'lv5-test',
        kind: 'test',
        title: 'Kiểm tra tổng hợp',
        desc: '3 câu hỏi nhanh: chuẩn bị, đa vòng, chốt thỏa thuận.',
        minutes: 3,
        xp: 20,
        lesson: 'Chuyên gia không phải người nói hay nhất — mà là người chuẩn bị kỹ nhất.',
        quiz: [
          {
            q: 'Trước một cuộc đàm phán quan trọng, việc đầu tiên nên làm là gì?',
            options: [
              'Tập nói cho trôi chảy.',
              'Xác định mục tiêu, mức chấp nhận được, và lựa chọn dự phòng nếu không chốt được.',
              'Tìm hiểu đối phương thích gì.',
            ],
            correct: 1,
            explain: 'Chuẩn bị = biết mình muốn gì, chấp nhận được tới đâu, và có đường lui nào. Nói hay chỉ là phần nổi.',
          },
          {
            q: 'Thỏa thuận miệng đã xong, bạn nên làm gì tiếp theo?',
            options: [
              'Tin tưởng nhau là đủ.',
              'Nhắn lại 3 dòng: việc gì, ai làm, khi nào xong — để cả hai xác nhận.',
              'Đợi đối phương nhắc lại.',
            ],
            correct: 1,
            explain: 'Chốt bằng văn bản tránh hiểu lầm và bảo vệ cả hai bên. Không chốt miệng với việc quan trọng.',
          },
          {
            q: 'Đâu là dấu hiệu của một cuộc đàm phán tốt?',
            options: [
              'Bạn được đúng 100% những gì mình muốn.',
              'Cả hai bên đều đạt được điều quan trọng nhất của mình và rõ ràng về bước tiếp theo.',
              'Đối phương nhượng bộ hoàn toàn.',
            ],
            correct: 1,
            explain: 'Đàm phán tốt không phải thắng-thua. Cả hai đều đạt điều quan trọng nhất và rời bàn với cam kết rõ ràng.',
          },
        ],
      },
      {
        id: 'lv5-pr',
        kind: 'practice',
        title: 'Thực hành: Đàm phán lương làm thêm',
        desc: 'Đàm phán bằng giọng nói: đề nghị tăng lương làm thêm dựa trên kết quả đã làm được.',
        minutes: 10,
        xp: 30,
        lesson: 'Đàm phán lương không phải xin tăng lương — mà là trình bày giá trị bạn đã tạo ra và đề nghị mức xứng đáng.',
        practicePrompt:
          'Bạn đã làm thêm ở một quán cà phê 4 tháng, làm tốt và được khách quen nhớ tên. Hãy đàm phán tăng lương với quản lý: mở đầu bằng kết quả cụ thể bạn đã làm được, đưa ra mức đề nghị rõ ràng, và sẵn sàng nhượng bộ có điều kiện (nhận thêm ca đổi lấy mức tăng).',
      },
    ],
  },
];

// ---- Tiến độ ----

export const TOTAL_XP = LEVELS.reduce((s, l) => s + l.items.reduce((a, i) => a + i.xp, 0), 0);
export const TOTAL_ITEMS = LEVELS.reduce((s, l) => s + l.items.length, 0);

export function itemStatus(progress: RoadmapProgress, levelIdx: number, itemIdx: number): ItemStatus {
  const level = LEVELS[levelIdx];
  const item = level.items[itemIdx];
  if (progress[item.id]?.done) return 'done';
  // Cấp đầu mở; cấp sau mở khi bài test của cấp trước đã xong.
  if (levelIdx > 0) {
    const prevTest = LEVELS[levelIdx - 1].items.find((i) => i.kind === 'test');
    if (prevTest && !progress[prevTest.id]?.done) return 'locked';
  }
  // Trong cấp, mục sau mở khi mục trước đã xong.
  if (itemIdx > 0 && !progress[level.items[itemIdx - 1].id]?.done) return 'locked';
  return 'unlocked';
}

export function levelStatus(progress: RoadmapProgress, levelIdx: number): ItemStatus {
  const level = LEVELS[levelIdx];
  const done = level.items.filter((i) => progress[i.id]?.done).length;
  if (done === level.items.length) return 'done';
  if (levelIdx === 0) return 'unlocked';
  const prevTest = LEVELS[levelIdx - 1].items.find((i) => i.kind === 'test');
  if (prevTest && progress[prevTest.id]?.done) return 'unlocked';
  return 'locked';
}

export function levelDoneCount(progress: RoadmapProgress, level: RoadmapLevel): number {
  return level.items.filter((i) => progress[i.id]?.done).length;
}

export function completedCount(progress: RoadmapProgress): number {
  return LEVELS.reduce((s, l) => s + levelDoneCount(progress, l), 0);
}

export function totalXp(progress: RoadmapProgress): number {
  let xp = 0;
  for (const level of LEVELS) {
    for (const item of level.items) {
      if (progress[item.id]?.done) xp += item.xp;
    }
  }
  return xp;
}

export function overallPct(progress: RoadmapProgress): number {
  return Math.round((completedCount(progress) / TOTAL_ITEMS) * 100);
}

export function markItemDone(
  progress: RoadmapProgress,
  itemId: string,
  score: number | null,
): RoadmapProgress {
  const prev = progress[itemId];
  return {
    ...progress,
    [itemId]: {
      done: true,
      attempts: (prev?.attempts ?? 0) + 1,
      bestScore: score == null ? (prev?.bestScore ?? null) : Math.max(prev?.bestScore ?? -1, score),
    },
  };
}

// ---- Lưu tiến độ (expo-file-system API mới của SDK 58: Paths/File) ----

function progressFile(): File {
  return new File(Paths.document, 'roadmap-progress.json');
}

export async function loadProgress(): Promise<RoadmapProgress> {
  try {
    const f = progressFile();
    if (!f.exists) return {};
    const raw = await f.text();
    const parsed = JSON.parse(raw) as RoadmapProgress;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {}; // chưa có file hoặc lỗi đọc → bắt đầu từ đầu
  }
}

export async function saveProgress(progress: RoadmapProgress): Promise<void> {
  try {
    await progressFile().write(JSON.stringify(progress));
  } catch {
    // Lưu lỗi thì tiến độ vẫn giữ trong bộ nhớ của màn hình.
  }
}
