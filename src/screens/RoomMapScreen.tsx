// Màn Bản đồ phòng tập — 5 phòng, từ mặc cả đến gọi vốn.
// Phòng 1 là mặc cả giá; mỗi phòng có bộ tình huống, độ khó, trạng thái khóa/mở riêng.
// Phòng khóa hoặc chưa có vòng luyện KHÔNG nuốt tap: bấm vào hiện thông báo
// nói rõ lý do (chưa đủ điều kiện mở / vòng luyện sắp có) rồi tự ẩn sau vài giây.
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Room, RoomId } from '../lib/rooms';
import { ROOMS, difficultyLabel } from '../lib/rooms';
import { isRoomUnlocked } from '../lib/roomProgress';
import type { RoomProgress } from '../lib/roomProgress';
import { AppIcon, RoomIconImage } from '../components/icons';

// Chỉ Phòng 1 đã có vòng đàm phán thật. Phòng khác dù đã mở khóa vẫn chưa
// có luồng để vào — bấm vào phải nói rõ "sắp có", không được giả vờ vào được.
const PLAYABLE_ROOMS: RoomId[] = ['rent'];

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

// Ported from muse/motion-home (cd47c95): ring quay theo % XP, chỉ animation,
// không đổi logic mở khóa / thông báo của PR #5.
function LevelRing({ level, percent }: { level: number; percent: number }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: percent,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [percent, progress]);

  const rotation = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View
      style={styles.levelRing}
      accessibilityRole="progressbar"
      accessibilityLabel={`Cấp ${level}, ${percent}% XP đến cấp tiếp theo`}
      accessibilityValue={{ min: 0, max: 100, now: percent }}
    >
      <View style={styles.levelRingTrack} />
      <Animated.View style={[styles.levelRingMarkerTrack, { transform: [{ rotate: rotation }] }]}>
        <View style={styles.levelRingMarker} />
      </Animated.View>
      <Text style={styles.levelRingValue}>{level}</Text>
    </View>
  );
}

function animatePress(value: Animated.Value, pressed: boolean) {
  Animated.timing(value, {
    toValue: pressed ? 1 : 0,
    duration: pressed ? 120 : 220,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  }).start();
}

export default function RoomMapScreen({ progress, onBack, onEnterRoom }: Props) {
  const xpPct = Math.min(100, Math.round((progress.xp / progress.xpForNextLevel) * 100));
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const entranceValues = useRef(ROOMS.map(() => new Animated.Value(0))).current;
  const pressValues = useRef(ROOMS.map(() => new Animated.Value(0))).current;
  const xpProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const entrance = Animated.stagger(
      160,
      entranceValues.map((value) =>
        Animated.timing(value, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ),
    );
    entrance.start();
    return () => entrance.stop();
  }, [entranceValues]);

  useEffect(() => {
    Animated.timing(xpProgress, {
      toValue: xpPct,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [xpPct, xpProgress]);

  const xpWidth = xpProgress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  useEffect(
    () => () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    },
    [],
  );

  const showNotice = (text: string) => {
    setNotice(text);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 3500);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={12}>
          <Text style={styles.back}>‹ Trang chủ</Text>
        </Pressable>
        <Text style={styles.h1}>Bản đồ phòng tập</Text>
        <Text style={styles.sub}>
          Mỗi phòng là một loại chuyện khó. Luyện xong phòng trước để mở phòng sau —
          càng lên cao, đối phương càng cứng.
        </Text>
        <View style={styles.levelRow}>
          <View style={styles.levelMeta}>
            <Text style={styles.levelText}>Cấp</Text>
            <LevelRing level={progress.level} percent={xpPct} />
          </View>
          <View style={styles.xpTrack}>
            <Animated.View style={[styles.xpFill, { width: xpWidth }]} />
          </View>
          <Text style={styles.levelText}>
            {progress.xp}/{progress.xpForNextLevel} XP
          </Text>
        </View>
      </View>

      {notice && (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>{notice}</Text>
        </View>
      )}

      <ScrollView style={styles.list} contentContainerStyle={styles.listPad}>
        {ROOMS.map((room: Room, i: number) => {
          const unlocked = isRoomUnlocked(room, progress);
          const done = progress.roomsCompleted.includes(room.id);
          const isCurrent = progress.currentRoomId === room.id;
          const hasFlow = PLAYABLE_ROOMS.includes(room.id);
          const entrance = entranceValues[i];
          const pressProgress = pressValues[i];
          const translateY = entrance.interpolate({ inputRange: [0, 1], outputRange: [8, 0] });
          const scale = pressProgress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.985] });
          const opacity = pressProgress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.88] });
          return (
            <View key={room.id}>
              {i > 0 && <View style={styles.connector} />}
              <Animated.View style={{ opacity: entrance, transform: [{ translateY }] }}>
                <Animated.View style={{ opacity, transform: [{ scale }] }}>
              <Pressable
                style={[styles.card, !unlocked && styles.cardLocked, done && styles.cardDone]}
                onPressIn={() => animatePress(pressProgress, true)}
                onPressOut={() => animatePress(pressProgress, false)}
                onPress={() => {
                  if (!unlocked) {
                    showNotice(`${room.title} chưa mở — ${room.unlockText}`);
                    return;
                  }
                  if (!hasFlow) {
                    showNotice(`${room.title} sắp có — vòng luyện đang được làm, quay lại sau nhé.`);
                    return;
                  }
                  onEnterRoom(room.id);
                }}
              >
                <View style={styles.cardTop}>
                  <View style={[styles.roomTile, !unlocked && styles.roomTileLocked]}>
                    {unlocked ? (
                      <RoomIconImage room={room.id} size={30} />
                    ) : (
                      <AppIcon name="lock" size={22} color="#9fb0bf" />
                    )}
                  </View>
                  <View style={styles.cardHead}>
                    <Text style={styles.roomOrder}>PHÒNG {room.order}</Text>
                    <Text style={styles.roomTitle}>{room.title}</Text>
                    <Text style={styles.roomTag}>{room.tagline}</Text>
                  </View>
                  <View
                    style={[
                      styles.badgePill,
                      done && styles.badgeDone,
                      !unlocked && styles.badgeLocked,
                      isCurrent && hasFlow && !done && styles.badgeCurrent,
                    ]}
                  >
                    {done ? (
                      <AppIcon name="check" size={12} color="#8ce99a" />
                    ) : !unlocked ? (
                      <AppIcon name="lock" size={12} color="#9fb0bf" />
                    ) : null}
                    <Text
                      style={[
                        styles.badge,
                        done && styles.badgeTextDone,
                        !unlocked && styles.badgeTextLocked,
                        isCurrent && hasFlow && !done && styles.badgeTextCurrent,
                      ]}
                    >
                      {done
                        ? 'Xong'
                        : !unlocked
                          ? 'Khóa'
                          : !hasFlow
                            ? 'Sắp có'
                            : isCurrent
                              ? '▶ Đang luyện'
                              : 'Mở'}
                    </Text>
                  </View>
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
                  {unlocked && hasFlow && !done && <Text style={styles.enterText}>Vào luyện →</Text>}
                  {unlocked && !hasFlow && !done && <Text style={styles.soonText}>Sắp có</Text>}
                </View>
              </Pressable>
                </Animated.View>
              </Animated.View>
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
  levelMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  levelText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  levelRing: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  levelRingTrack: { position: 'absolute', width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: '#243040' },
  levelRingMarkerTrack: { position: 'absolute', width: 42, height: 42, alignItems: 'center' },
  levelRingMarker: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#2f81f7' },
  levelRingValue: { color: '#fff', fontSize: 12, fontWeight: '800' },
  xpTrack: { flex: 1, height: 10, backgroundColor: '#243040', borderRadius: 5, overflow: 'hidden' },
  xpFill: { height: '100%', backgroundColor: '#2f81f7', borderRadius: 5 },
  list: { flex: 1 },
  notice: {
    backgroundColor: '#243040',
    borderColor: '#2f81f7',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 4,
  },
  noticeText: { color: '#fff', fontSize: 13, lineHeight: 18 },
  soonText: { color: '#ffd43b', fontSize: 11, fontWeight: '700' },
  listPad: { paddingHorizontal: 20, paddingBottom: 32 },
  connector: { width: 2, height: 18, backgroundColor: '#243040', marginLeft: 34, marginVertical: 0 },
  card: { backgroundColor: '#1b232b', borderColor: '#232c35', borderWidth: 1, borderRadius: 18, padding: 16, gap: 10 },
  cardLocked: { opacity: 0.55 },
  cardDone: { borderColor: '#2f9e44', borderWidth: 1 },
  cardTop: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  roomTile: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#16283d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomTileLocked: { backgroundColor: '#243040' },
  cardHead: { flex: 1, gap: 2 },
  roomOrder: { color: '#9fb0bf', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  roomTitle: { color: '#fff', fontSize: 17, fontWeight: '800' },
  roomTag: { color: '#c3d0dc', fontSize: 12, lineHeight: 16 },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#243040',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  badgeDone: { backgroundColor: '#0b2518' },
  badgeLocked: { backgroundColor: '#1b232b' },
  badgeCurrent: { backgroundColor: '#16283d' },
  badge: { color: '#ffd43b', fontWeight: '800', fontSize: 12 },
  badgeTextDone: { color: '#8ce99a' },
  badgeTextLocked: { color: '#9fb0bf' },
  badgeTextCurrent: { color: '#2f81f7' },
  roomDesc: { color: '#c3d0dc', fontSize: 13, lineHeight: 18 },
  scenarioRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { backgroundColor: '#243040', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  chipText: { color: '#fff', fontSize: 11 },
  cardFoot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  diff: { color: '#ffd43b', fontSize: 12, fontWeight: '700' },
  diffOff: { color: '#3a4756' },
  unlockText: { color: '#9fb0bf', fontSize: 11 },
  enterText: { color: '#2f81f7', fontWeight: '800', fontSize: 13 },
  footNote: { color: '#9fb0bf', fontSize: 12, textAlign: 'center', marginTop: 16, lineHeight: 17 },
});
