# Lộ trình học — tích hợp vào App.tsx

Branch này (`muse/roadmap-screens`) chỉ thêm file mới, không sửa file Slice 1 nào.
Nội dung: lộ trình 5 cấp độ đàm phán (độ khó tăng dần), mỗi cấp 2 bài tập + 1 bài test
+ 1 buổi thực hành; thang chấm cố định 6 luật (6 điểm, ra % điểm — cùng thang src/lib/score.ts); tiến độ lưu local.

## File mới

- `src/lib/roadmap.ts` — dữ liệu 5 cấp / 20 mục, thang chấm `RUBRIC` (6 luật), trạng thái
  khóa/mở/hoàn thành, tính XP theo hệ chung `src/lib/gamification.ts` + %, lưu tiến độ bằng `expo-file-system`
  (đã có sẵn trong dự án, cùng API `App.tsx` đang dùng).
- `src/components/RoadmapScreen.tsx` — màn hình bản đồ lộ trình: thanh tiến độ tổng,
  thẻ từng cấp, danh sách mục theo trạng thái 🔒/▶️/✅.
- `src/components/RoadmapItemDetail.tsx` — chi tiết một mục: bài học tâm lý, thang
  chấm, bài test trắc nghiệm 3 câu làm ngay trong app (chấm /6, ra % điểm), nút bắt đầu thực hành.

## Nối vào App.tsx (3 chỗ, làm khi merge)

App hiện dùng state `started` để chuyển màn hình. Thêm một state màn hình:

```tsx
// đầu App():
import RoadmapScreen from './src/components/RoadmapScreen';
import type { RoadmapItem, RoadmapLevel } from './src/lib/roadmap';

const [screen, setScreen] = useState<'setup' | 'roadmap' | 'negotiation'>('setup');
```

1. Màn setup (`!started`): thêm nút mở lộ trình, ví dụ dưới nút “Bắt đầu đàm phán”:

```tsx
<Pressable style={styles.bigBtn} onPress={() => setScreen('roadmap')}>
  <Text style={styles.bigBtnText}>🗺️ Xem lộ trình học</Text>
</Pressable>
```

2. Trước `return` của màn đàm phán, render lộ trình khi `screen === 'roadmap'`:

```tsx
if (screen === 'roadmap') {
  return (
    <RoadmapScreen
      onBack={() => setScreen('setup')}
      onStartPractice={(item: RoadmapItem, _level: RoadmapLevel) => {
        // Nối buổi thực hành vào vòng đàm phán voice hiện có:
        // setScreen('negotiation'); startNegotiation(/* preset phù hợp với item */);
        setScreen('setup');
      }}
    />
  );
}
```

3. Khi bấm “Bắt đầu đàm phán”, set `setScreen('negotiation')` cùng lúc với
   `startNegotiation()` (hoặc giữ `started` như hiện tại và chỉ dùng `screen`
   để phân biệt setup/roadmap).

## Đã xong / chưa xong

- ✅ Lộ trình + bài test trắc nghiệm (chấm /6, lưu điểm cao nhất) chạy độc lập,
  không cần API key.
- ✅ Tiến độ (mục xong, điểm, XP) lưu local, mở app lại vẫn còn.
- ⏳ Nút “Bắt đầu thực hành” hiện gọi `onStartPractice` để cha nối vào vòng voice —
  chưa nối sẵn vì không được sửa `App.tsx` trong branch này.
- ⏳ Điểm thực hành bằng AI (chấm theo thang cố định sau vòng voice) là Slice 2:
  khi vòng voice trả điểm, gọi `markItemDone(progress, itemId, score)` trong
  `src/lib/roadmap.ts` rồi `saveProgress`.
- ⚠️ Chưa chạy được `tsc --noEmit` trên máy này (chưa `npm install`); code viết theo
  đúng pattern `App.tsx` đang dùng, nhưng cần chạy `npx tsc --noEmit` sau khi
  `npm install` trước khi merge.
