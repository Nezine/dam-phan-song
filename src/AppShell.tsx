// AppShell — vỏ điều hướng mới, KHÔNG sửa file Slice 1 nào.
// Luồng: Home → Bản đồ phòng tập → vòng đàm phán (App Slice 1, Phòng 1: thuê trọ).
// Chỉ Phòng 1 đã có luồng đàm phán thật; các phòng khác đang khóa/sắp có nên
// bấm vào sẽ ở lại màn Map (nút bị vô hiệu khi khóa).
// Để dùng: đổi 1 dòng trong index.ts — `import App from './App'` thành
// `import App from './src/AppShell'` (xem INTEGRATION.md). Không sửa App.tsx.
import { useState } from 'react';
import App from '../App';
import HomeScreen from './screens/HomeScreen';
import RoomMapScreen from './screens/RoomMapScreen';
import { getProgress } from './lib/roomProgress';

type Screen = 'home' | 'map' | 'negotiate';

export default function AppShell() {
  const [screen, setScreen] = useState<Screen>('home');
  const progress = getProgress();

  if (screen === 'negotiate') {
    // Vòng đàm phán Slice 1 (thuê trọ). App.tsx chưa có nút "quay lại Home" —
    // người dùng thoát vòng bằng cách đóng/mở lại app (xem INTEGRATION.md).
    return <App />;
  }

  if (screen === 'map') {
    return (
      <RoomMapScreen
        progress={progress}
        onBack={() => setScreen('home')}
        onEnterRoom={(roomId) => {
          if (roomId === 'rent') setScreen('negotiate');
          // Phòng khác chưa có luồng đàm phán — nút đã bị vô hiệu khi khóa,
          // phòng mở nhưng chưa build thì ở lại Map (team build sau).
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
