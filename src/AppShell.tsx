// AppShell — vỏ điều hướng mới, KHÔNG sửa file Slice 1 nào.
// Luồng: Home → Bản đồ phòng tập → vòng đàm phán (App Slice 1, Phòng 1: thuê trọ).
// Chỉ Phòng 1 đã có luồng đàm phán thật; các phòng khác đang khóa/sắp có nên
// bấm vào sẽ hiện thông báo ở màn Map (xem RoomMapScreen), không nuốt tap.
// Để dùng: đổi 1 dòng trong index.ts — `import App from './App'` thành
// `import App from './src/AppShell'` (xem INTEGRATION.md). Không sửa App.tsx.
// Tiến bộ hiển thị là số THẬT từ kho lưu trữ (roomProgress.loadRoomProgress),
// tải lại mỗi lần đổi màn hình để về Home sau 1 vòng là thấy số mới.
import { useEffect, useState } from 'react';
import App from '../App';
import HomeScreen from './screens/HomeScreen';
import RoomMapScreen from './screens/RoomMapScreen';
import {
  EMPTY_PROGRESS,
  loadRoomProgress,
  type RoomProgress,
} from './lib/roomProgress';

type Screen = 'home' | 'map' | 'negotiate';

export default function AppShell() {
  const [screen, setScreen] = useState<Screen>('home');
  const [progress, setProgress] = useState<RoomProgress>({
    ...EMPTY_PROGRESS,
    roomsCompleted: [],
  });

  useEffect(() => {
    let live = true;
    loadRoomProgress()
      .then((p) => {
        if (live) setProgress(p);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [screen]);

  if (screen === 'negotiate') {
    // Vòng đàm phán Slice 1 (Phòng 1). App.tsx nhận onExit để hiện nút
    // "‹ Trang chủ" — bấm là về Home (vòng đang dở sẽ bị hủy).
    return <App onExit={() => setScreen('home')} />;
  }

  if (screen === 'map') {
    return (
      <RoomMapScreen
        progress={progress}
        onBack={() => setScreen('home')}
        onEnterRoom={(roomId) => {
          if (roomId === 'rent') setScreen('negotiate');
          // Phòng khác chưa có luồng đàm phán — RoomMapScreen đã chặn ở
          // tầng giao diện (hiện thông báo), không gọi vào đây.
        }}
      />
    );
  }

  return (
    <HomeScreen
      progress={progress}
      onOpenMap={() => setScreen('map')}
      onStartRoom={(roomId) => {
        if (roomId === 'rent') setScreen('negotiate');
      }}
    />
  );
}
