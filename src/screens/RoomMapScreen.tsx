// Màn Bản đồ phòng tập — 5 phòng, từ thuê trọ đến gọi vốn.
// Thuê trọ chỉ là Phòng 1; mỗi phòng có bộ tình huống, độ khó, trạng thái khóa/mở riêng.
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Room, RoomId } from '../lib/rooms';
import { ROOMS, difficultyLabel } from '../lib/rooms';
import { isRoomUnlocked } from '../lib/roomProgress';
import type { RoomProgress } from '../lib/roomProgress';

type Props = {
  progress: RoomProgress;
  onBack: () => void;
  onEnterRoom: (roomId: RoomId) => void;
};

function DifficultyDots({ d }: { d: 1 | 2 | 3 }) {
  return (
    <Text style={styles.diff}>
      {'●'.repeat(d)}
      <Text style={styles.diffOff}>{'●'.repeat(3 - d)}</Text> {difficultyLabel(d)}
    </Text>
  );
}

export default function RoomMapScreen({ progress, onBack, onEnterRoom }: Props) {
  const xpPct = Math.min(100, Math.round((progress.xp / progress.xpForNextLevel) * 100));

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={12}>
          <Text style={styles.back}>‹ Trang chủ</Text>
        </Pressable>
        <Text style={styles.h1}>🗺️ Bản đồ phòng tập</Text>
        <Text style={styles.sub}>
          Mỗi phòng là một loại chuyện khó. Luyện xong phòng trước để mở phòng sau —
          càng lên cao, đối phương càng cứng.
        </Text>
        <View style={styles.levelRow}>
          <Text style={styles.levelText}>Cấp {progress.level}</Text>
          <View style={styles.xpTrack}>
            <View style={[styles.xpFill, { width: `${xpPct}%` }]} />
          </View>
          <Text style={styles.levelText}>
            {progress.xp}/{progress.xpForNextLevel} XP
          </Text>
        </View>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listPad}>
        {ROOMS.map((room: Room, i: number) => {
          const unlocked = isRoomUnlocked(room, progress);
          const done = progress.roomsCompleted.includes(room.id);
          const isCurrent = progress.currentRoomId === room.id;
          return (
            <View key={room.id}>
              {i > 0 && <View style={styles.connector} />}
              <Pressable
                style={[styles.card, !unlocked && styles.cardLocked, done && styles.cardDone]}
                onPress={() => unlocked && onEnterRoom(room.id)}
                disabled={!unlocked}
              >
                <View style={styles.cardTop}>
                  <Text style={styles.roomIcon}>{room.icon}</Text>
                  <View style={styles.cardHead}>
                    <Text style={styles.roomOrder}>PHÒNG {room.order}</Text>
                    <Text style={styles.roomTitle}>{room.title}</Text>
                    <Text style={styles.roomTag}>{room.tagline}</Text>
                  </View>
                  <Text style={styles.badge}>
                    {done ? '✅ Xong' : unlocked ? (isCurrent ? '▶ Đang luyện' : 'Mở') : '🔒 Khóa'}
                  </Text>
                </View>
                <Text style={styles.roomDesc}>{room.desc}</Text>
                <View style={styles.scenarioRow}>
                  {room.scenarios.map((s) => (
                    <View key={s} style={styles.chip}>
                      <Text style={styles.chipText}>{s}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.cardFoot}>
                  <DifficultyDots d={room.difficulty} />
                  {!unlocked && <Text style={styles.unlockText}>{room.unlockText}</Text>}
                  {unlocked && !done && (
                    <Text style={styles.enterText}>{room.id === 'rent' ? 'Vào luyện →' : 'Vào luyện →'}</Text>
                  )}
                </View>
              </Pressable>
            </View>
          );
        })}
        <Text style={styles.footNote}>
          Phòng mới mở dần theo cấp độ — luyện đều mỗi ngày để mở khóa phòng phỏng vấn và gọi vốn.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#101418' },
  header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 12, gap: 6 },
  back: { color: '#2f81f7', fontWeight: '700', fontSize: 14 },
  h1: { color: '#fff', fontSize: 28, fontWeight: '800' },
  sub: { color: '#9fb0bf', fontSize: 13, lineHeight: 18 },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  levelText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  xpTrack: { flex: 1, height: 8, backgroundColor: '#243040', borderRadius: 4, overflow: 'hidden' },
  xpFill: { height: '100%', backgroundColor: '#2f81f7', borderRadius: 4 },
  list: { flex: 1 },
  listPad: { paddingHorizontal: 20, paddingBottom: 32 },
  connector: { width: 2, height: 18, backgroundColor: '#243040', marginLeft: 34, marginVertical: 0 },
  card: { backgroundColor: '#1b232b', borderRadius: 16, padding: 16, gap: 8 },
  cardLocked: { opacity: 0.55 },
  cardDone: { borderColor: '#2f9e44', borderWidth: 1 },
  cardTop: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  roomIcon: { fontSize: 28 },
  cardHead: { flex: 1, gap: 2 },
  roomOrder: { color: '#9fb0bf', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  roomTitle: { color: '#fff', fontSize: 17, fontWeight: '800' },
  roomTag: { color: '#9fb0bf', fontSize: 12 },
  badge: { color: '#ffd43b', fontWeight: '800', fontSize: 12 },
  roomDesc: { color: '#9fb0bf', fontSize: 13, lineHeight: 18 },
  scenarioRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { backgroundColor: '#243040', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  chipText: { color: '#fff', fontSize: 11 },
  cardFoot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  diff: { color: '#ffd43b', fontSize: 12, fontWeight: '700' },
  diffOff: { color: '#243040' },
  unlockText: { color: '#9fb0bf', fontSize: 11 },
  enterText: { color: '#2f81f7', fontWeight: '800', fontSize: 13 },
  footNote: { color: '#9fb0bf', fontSize: 12, textAlign: 'center', marginTop: 16, lineHeight: 17 },
});
