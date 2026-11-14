// Màn hình Lộ trình học — bản đồ các cấp độ đàm phán, độ khó tăng dần.
// Mỗi cấp: 2 bài tập + 1 bài test + 1 buổi thực hành. Mở khóa theo thứ tự:
// cấp sau mở khi bài test cấp trước xong; trong cấp, mục sau mở khi mục trước xong.
// Tiến độ lưu local (expo-file-system) qua src/lib/roadmap.ts.
// Props: onBack để quay lại; onStartPractice để cha nối buổi thực hành vào vòng đàm phán voice.
import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  LEVELS,
  TOTAL_ITEMS,
  TOTAL_XP,
  completedCount,
  itemStatus,
  levelDoneCount,
  levelStatus,
  loadProgress,
  markItemDone,
  overallPct,
  saveProgress,
  totalXp,
  type RoadmapItem,
  type RoadmapLevel,
  type RoadmapProgress,
} from '../lib/roadmap';
import RoadmapItemDetail from './RoadmapItemDetail';

type Props = {
  onBack: () => void;
  onStartPractice: (item: RoadmapItem, level: RoadmapLevel) => void;
};

const STATUS_LABEL = { locked: 'Khóa', unlocked: 'Mở', done: 'Xong' } as const;
const KIND_TEXT = { exercise: 'Bài tập', test: 'Bài test', practice: 'Thực hành' } as const;

export default function RoadmapScreen({ onBack, onStartPractice }: Props) {
  const [progress, setProgress] = useState<RoadmapProgress | null>(null);
  const [expanded, setExpanded] = useState<string | null>('lv1');
  const [selected, setSelected] = useState<{ item: RoadmapItem; level: RoadmapLevel } | null>(null);
  const [reduceMotion, setReduceMotion] = useState(true);
  const [celebratingLevel, setCelebratingLevel] = useState<string | null>(null);
  const progressFill = useRef(new Animated.Value(0)).current;
  const levelUpScale = useRef(new Animated.Value(1)).current;

  const done = progress ? completedCount(progress) : 0;
  const xp = progress ? totalXp(progress) : 0;
  const pct = progress ? overallPct(progress) : 0;

  useEffect(() => {
    loadProgress().then(setProgress);
  }, []);

  useEffect(() => {
    let active = true;
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      if (active) setReduceMotion(enabled);
    });
    void AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (active) setReduceMotion(enabled);
      })
      .catch(() => {});

    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    progressFill.stopAnimation();
    if (reduceMotion) {
      progressFill.setValue(pct);
      return;
    }

    const animation = Animated.timing(progressFill, {
      toValue: pct,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [pct, progressFill, reduceMotion]);

  useEffect(() => {
    if (!celebratingLevel || selected) return;
    if (reduceMotion) {
      setCelebratingLevel(null);
      return;
    }

    levelUpScale.setValue(0.96);
    const animation = Animated.timing(levelUpScale, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start(({ finished }) => {
      if (finished) setCelebratingLevel(null);
    });
    return () => animation.stop();
  }, [celebratingLevel, levelUpScale, reduceMotion, selected]);

  if (progress === null) {
    return (
      <View style={[styles.screen, styles.center]}>
        <ActivityIndicator />
        <Text style={styles.loading}>Đang tải lộ trình…</Text>
      </View>
    );
  }

  if (selected) {
    return (
      <RoadmapItemDetail
        item={selected.item}
        level={selected.level}
        reduceMotion={reduceMotion}
        onBack={() => setSelected(null)}
        onStartPractice={onStartPractice}
        onComplete={(itemId, score) => {
          const levelIndex = LEVELS.findIndex((level) => level.id === selected.level.id);
          const levelWasDone = levelIndex >= 0 && levelStatus(progress, levelIndex) === 'done';
          const next = markItemDone(progress, itemId, score);
          setProgress(next);
          void saveProgress(next);
          setSelected(null);
          if (levelIndex >= 0 && !levelWasDone && levelStatus(next, levelIndex) === 'done') {
            setCelebratingLevel(selected.level.id);
          }
        }}
      />
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={onBack}>
          <Text style={styles.back}>← Quay lại</Text>
        </Pressable>
        <Text style={styles.h1}>Lộ trình học</Text>
        <Text style={styles.sub}>Luyện kỹ năng đàm phán theo từng cấp — bài tập, bài test, thực hành.</Text>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressFill.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                  extrapolate: 'clamp',
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {done}/{TOTAL_ITEMS} mục hoàn thành · {pct}% · {xp}/{TOTAL_XP} XP
        </Text>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}>
        {LEVELS.map((level, li) => {
          const status = levelStatus(progress, li);
          const doneInLevel = levelDoneCount(progress, level);
          const isOpen = expanded === level.id;
          return (
            <View
              key={level.id}
              style={[styles.levelCard, status === 'locked' && styles.levelLocked, status === 'done' && styles.levelDone]}
            >
              <Pressable
                disabled={status === 'locked'}
                onPress={() => setExpanded(isOpen ? null : level.id)}
                style={styles.levelHead}
              >
                <Animated.View
                  style={[
                    styles.levelBadge,
                    celebratingLevel === level.id ? { transform: [{ scale: levelUpScale }] } : undefined,
                  ]}
                >
                  <Text style={styles.levelBadgeText}>{status === 'done' ? '✓' : level.n}</Text>
                </Animated.View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.levelTitle}>
                    Cấp {level.n} · {level.title}
                  </Text>
                  <Text style={styles.levelTag}>{level.tagline}</Text>
                  <Text style={styles.levelCount}>
                    {status === 'locked'
                      ? 'Mở khóa sau khi xong bài test cấp trước'
                      : `${doneInLevel}/${level.items.length} mục xong`}
                  </Text>
                </View>
                <Text style={styles.chevron}>{status === 'locked' ? '' : isOpen ? '▾' : '▸'}</Text>
              </Pressable>

              {isOpen &&
                status !== 'locked' &&
                level.items.map((item, ii) => {
                  const st = itemStatus(progress, li, ii);
                  const result = progress[item.id];
                  return (
                    <Pressable
                      key={item.id}
                      disabled={st === 'locked'}
                      onPress={() => {
                        setCelebratingLevel(null);
                        setSelected({ item, level });
                      }}
                      style={[styles.itemRow, st === 'locked' && styles.itemLocked]}
                    >
                      <Text style={styles.itemStatus}>{STATUS_LABEL[st]}</Text>
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text style={styles.itemTitle}>{item.title}</Text>
                        <Text style={styles.itemMeta}>
                          {KIND_TEXT[item.kind]} · {item.minutes} phút · {item.xp} XP
                          {result?.bestScore != null ? ` · Điểm cao nhất: ${result.bestScore}/10` : ''}
                        </Text>
                      </View>
                      <Text style={styles.itemArrow}>›</Text>
                    </Pressable>
                  );
                })}
            </View>
          );
        })}

        <View style={styles.footCard}>
          <Text style={styles.footTitle}>Đàm phán là kỹ năng — luyện được như mọi kỹ năng khác</Text>
          <Text style={styles.footText}>
            Mỗi cấp mở khóa khi bạn xong bài test cấp trước. Buổi thực hành chấm theo thang cố định 5 tiêu chí,
            điểm cao nhất được lưu lại để bạn thấy mình tiến bộ qua từng buổi.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#101418' },
  center: { justifyContent: 'center', alignItems: 'center', gap: 10 },
  loading: { color: '#9fb0bf' },
  header: { paddingTop: 48, paddingBottom: 12, paddingHorizontal: 16, gap: 8, borderBottomColor: '#232c35', borderBottomWidth: 1 },
  back: { color: '#2f81f7', fontWeight: '700', fontSize: 15 },
  h1: { color: '#fff', fontSize: 28, fontWeight: '800' },
  sub: { color: '#9fb0bf', fontSize: 14, lineHeight: 19 },
  progressBar: { backgroundColor: '#243040', borderRadius: 8, height: 10, overflow: 'hidden' },
  progressFill: { backgroundColor: '#2f81f7', height: 10, borderRadius: 8 },
  progressText: { color: '#9fb0bf', fontWeight: '700', fontSize: 13 },
  body: { flex: 1 },
  levelCard: { backgroundColor: '#1b232b', borderRadius: 14, padding: 12, gap: 8 },
  levelLocked: { opacity: 0.55 },
  levelDone: { borderColor: '#2f9e44', borderWidth: 1 },
  levelHead: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  levelBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2f81f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelBadgeText: { color: '#fff', fontWeight: '900', fontSize: 17 },
  levelTitle: { color: '#fff', fontWeight: '800', fontSize: 16 },
  levelTag: { color: '#9fb0bf', fontSize: 12 },
  levelCount: { color: '#8ce99a', fontWeight: '700', fontSize: 12 },
  chevron: { color: '#9fb0bf', fontSize: 18 },
  itemRow: { flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: '#243040', borderRadius: 10, padding: 12 },
  itemLocked: { opacity: 0.5 },
  itemStatus: { color: '#9fb0bf', fontSize: 11, fontWeight: '700', minWidth: 38, textAlign: 'center' },
  itemTitle: { color: '#fff', fontWeight: '700', fontSize: 14 },
  itemMeta: { color: '#9fb0bf', fontSize: 12 },
  itemArrow: { color: '#9fb0bf', fontSize: 18 },
  footCard: { backgroundColor: '#243040', borderRadius: 12, padding: 14, gap: 6 },
  footTitle: { color: '#fff', fontWeight: '800', fontSize: 14 },
  footText: { color: '#9fb0bf', fontSize: 13, lineHeight: 18 },
});
