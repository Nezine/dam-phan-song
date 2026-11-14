// Chi tiết một mục trong lộ trình: bài tập / bài test / buổi thực hành.
// Bài test: 3 câu trắc nghiệm làm ngay trong màn hình, chấm theo thang cố định /10.
// Bài tập: đọc bài học tâm lý rồi đánh dấu đã làm.
// Thực hành: đọc tình huống roleplay, bấm bắt đầu (cha sẽ nối vào vòng đàm phán voice),
// hoặc đánh dấu đã luyện xong. Chấm điểm thực hành thật sẽ do vòng AI trả về (Slice 2).
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  MAX_SCORE,
  RUBRIC,
  type RoadmapItem,
  type RoadmapLevel,
} from '../lib/roadmap';

type Props = {
  item: RoadmapItem;
  level: RoadmapLevel;
  reduceMotion: boolean;
  onBack: () => void;
  onComplete: (itemId: string, score: number | null) => void;
  onStartPractice: (item: RoadmapItem, level: RoadmapLevel) => void;
};

const KIND_TEXT = { exercise: 'Bài tập', test: 'Bài test', practice: 'Thực hành' } as const;

export default function RoadmapItemDetail({ item, level, reduceMotion, onBack, onComplete, onStartPractice }: Props) {
  // Trạng thái quiz (chỉ dùng cho bài test)
  const [picked, setPicked] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const feedbackReveal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    feedbackReveal.stopAnimation();
    if (!submitted) {
      feedbackReveal.setValue(0);
      return;
    }
    if (reduceMotion) {
      feedbackReveal.setValue(1);
      return;
    }

    feedbackReveal.setValue(0);
    const animation = Animated.timing(feedbackReveal, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [feedbackReveal, reduceMotion, submitted]);

  const quiz = item.quiz ?? [];
  const answeredAll = quiz.length > 0 && quiz.every((_, i) => picked[i] !== undefined);
  const correctCount = quiz.reduce((s, q, i) => s + (picked[i] === q.correct ? 1 : 0), 0);
  const quizScore = quiz.length > 0 ? Math.round((correctCount / quiz.length) * MAX_SCORE) : null;

  const submitQuiz = () => {
    if (!answeredAll) return;
    setSubmitted(true);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={onBack}>
          <Text style={styles.back}>← Lộ trình</Text>
        </Pressable>
        <Text style={styles.kind}>{KIND_TEXT[item.kind]}</Text>
      </View>
      <ScrollView style={styles.body} contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>
        <Text style={styles.levelTag}>
          Cấp {level.n} · {level.title}
        </Text>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.desc}>{item.desc}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{item.minutes} phút</Text>
          <Text style={styles.meta}>{item.xp} XP</Text>
        </View>

        <View style={styles.lessonCard}>
          <Text style={styles.lessonTitle}>Bài học tâm lý</Text>
          <Text style={styles.lessonText}>{item.lesson}</Text>
        </View>

        {(item.kind === 'test' || item.kind === 'practice') && (
          <View style={styles.rubricCard}>
            <Text style={styles.rubricTitle}>Thang chấm cố định (/{MAX_SCORE} điểm)</Text>
            {RUBRIC.map((r) => (
              <View key={r.label} style={styles.rubricRow}>
                <Text style={styles.rubricLabel}>• {r.label} (0–2)</Text>
                <Text style={styles.rubricHint}>{r.hint}</Text>
              </View>
            ))}
          </View>
        )}

        {item.kind === 'test' &&
          quiz.map((q, qi) => {
            const isAnswered = picked[qi] !== undefined;
            const isCorrect = picked[qi] === q.correct;
            return (
              <View key={qi} style={styles.qCard}>
                <Text style={styles.qText}>
                  Câu {qi + 1}. {q.q}
                </Text>
                {q.options.map((opt, oi) => {
                  const selected = picked[qi] === oi;
                  const showRight = submitted && oi === q.correct;
                  const showWrong = submitted && selected && oi !== q.correct;
                  return (
                    <QuizOption
                      key={oi}
                      disabled={submitted}
                      label={opt}
                      selected={selected}
                      submitted={submitted}
                      showRight={showRight}
                      showWrong={showWrong}
                      reduceMotion={reduceMotion}
                      feedbackReveal={feedbackReveal}
                      onPress={() => setPicked((p) => ({ ...p, [qi]: oi }))}
                    />
                  );
                })}
                <View
                  style={styles.pickedSlot}
                  accessibilityElementsHidden={!isAnswered || submitted}
                  importantForAccessibility={isAnswered && !submitted ? 'auto' : 'no-hide-descendants'}
                >
                  <Text style={[styles.pickedNote, (!isAnswered || submitted) && styles.hiddenFeedback]}>
                    Đã chọn — bấm “Nộp bài” ở cuối để xem đáp án.
                  </Text>
                </View>
                <Animated.View
                  style={{ opacity: feedbackReveal }}
                  pointerEvents={submitted ? 'auto' : 'none'}
                  accessibilityElementsHidden={!submitted}
                  importantForAccessibility={submitted ? 'auto' : 'no-hide-descendants'}
                >
                  <Text style={[styles.explain, isCorrect ? styles.explainOk : styles.explainBad]}>
                    {isCorrect ? 'Đúng. ' : 'Chưa đúng. '}
                    {q.explain}
                  </Text>
                </Animated.View>
              </View>
            );
          })}

        {item.kind === 'practice' && item.practicePrompt && (
          <View style={styles.practiceCard}>
            <Text style={styles.practiceTitle}>Tình huống thực hành</Text>
            <Text style={styles.practiceText}>{item.practicePrompt}</Text>
          </View>
        )}

        {item.kind === 'test' && !submitted && (
          <Pressable
            style={[styles.bigBtn, !answeredAll && styles.bigBtnDisabled]}
            onPress={submitQuiz}
            disabled={!answeredAll}
          >
            <Text style={styles.bigBtnText}>
              {answeredAll ? 'Nộp bài →' : `Trả lời hết ${quiz.length} câu để nộp bài`}
            </Text>
          </Pressable>
        )}

        {item.kind === 'test' && submitted && quizScore != null && (
          <Animated.View style={[styles.scoreCard, { opacity: feedbackReveal }]}>
            <Text style={styles.scoreTitle}>Kết quả: {correctCount}/{quiz.length} câu đúng</Text>
            <Text style={styles.scoreBig}>
              {quizScore}/{MAX_SCORE} điểm
            </Text>
            <Text style={styles.scoreSub}>
              {quizScore >= 8 ? 'Rất tốt — bạn đã nắm chắc cấp này.' : quizScore >= 5 ? 'Khá — xem lại phần giải thích rồi làm lại để lên điểm.' : 'Cần luyện thêm — đọc lại bài học tâm lý ở trên rồi thử lại.'}
            </Text>
            <Pressable style={styles.bigBtn} onPress={() => onComplete(item.id, quizScore)}>
              <Text style={styles.bigBtnText}>Lưu kết quả +{item.xp} XP →</Text>
            </Pressable>
            <Pressable
              style={styles.ghostBtn}
              onPress={() => {
                feedbackReveal.setValue(0);
                setPicked({});
                setSubmitted(false);
              }}
            >
              <Text style={styles.ghostText}>Làm lại để cải thiện điểm</Text>
            </Pressable>
          </Animated.View>
        )}

        {item.kind === 'exercise' && (
          <Pressable style={styles.bigBtn} onPress={() => onComplete(item.id, null)}>
            <Text style={styles.bigBtnText}>Đánh dấu đã làm +{item.xp} XP →</Text>
          </Pressable>
        )}

        {item.kind === 'practice' && (
          <>
            <Pressable style={styles.bigBtn} onPress={() => onStartPractice(item, level)}>
              <Text style={styles.bigBtnText}>Bắt đầu thực hành</Text>
            </Pressable>
            <Pressable style={styles.ghostBtn} onPress={() => onComplete(item.id, null)}>
              <Text style={styles.ghostText}>Đã luyện xong — đánh dấu hoàn thành</Text>
            </Pressable>
            <Text style={styles.note}>
              Chấm điểm thực hành bằng AI (thang cố định /{MAX_SCORE}) sẽ được nối vào sau khi vòng đàm phán voice hoàn thiện.
            </Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}

type QuizOptionProps = {
  disabled: boolean;
  label: string;
  selected: boolean;
  submitted: boolean;
  showRight: boolean;
  showWrong: boolean;
  reduceMotion: boolean;
  feedbackReveal: Animated.Value;
  onPress: () => void;
};

function QuizOption({
  disabled,
  label,
  selected,
  submitted,
  showRight,
  showWrong,
  reduceMotion,
  feedbackReveal,
  onPress,
}: QuizOptionProps) {
  const selectedOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    selectedOpacity.stopAnimation();
    if (reduceMotion || submitted) {
      selectedOpacity.setValue(selected && !submitted ? 1 : 0);
      return;
    }

    const animation = Animated.timing(selectedOpacity, {
      toValue: selected ? 1 : 0,
      duration: 120,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [reduceMotion, selected, selectedOpacity, submitted]);

  return (
    <Pressable disabled={disabled} onPress={onPress} style={styles.opt}>
      {(showRight || showWrong) && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.resultOverlay,
            showRight ? styles.optRight : styles.optWrong,
            { opacity: feedbackReveal },
          ]}
        />
      )}
      {!submitted && (
        <Animated.View
          pointerEvents="none"
          style={[styles.selectedOverlay, { opacity: selectedOpacity }]}
        />
      )}
      <Text style={styles.optText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#101418' },
  header: {
    paddingTop: 48,
    paddingBottom: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: '#232c35',
    borderBottomWidth: 1,
  },
  back: { color: '#2f81f7', fontWeight: '700', fontSize: 15 },
  kind: { color: '#9fb0bf', fontSize: 13, fontWeight: '700' },
  body: { flex: 1 },
  levelTag: { color: '#9fb0bf', fontSize: 12, fontWeight: '700' },
  title: { color: '#fff', fontSize: 24, fontWeight: '800' },
  desc: { color: '#c9d4de', fontSize: 15, lineHeight: 21 },
  metaRow: { flexDirection: 'row', gap: 16 },
  meta: { color: '#9fb0bf', fontWeight: '700', fontSize: 13 },
  lessonCard: { backgroundColor: '#1b232b', borderRadius: 12, padding: 14, gap: 6 },
  lessonTitle: { color: '#fff', fontWeight: '800', fontSize: 15 },
  lessonText: { color: '#c9d4de', fontSize: 14, lineHeight: 20 },
  rubricCard: { backgroundColor: '#243040', borderRadius: 12, padding: 14, gap: 8 },
  rubricTitle: { color: '#fff', fontWeight: '800', fontSize: 15 },
  rubricRow: { gap: 2 },
  rubricLabel: { color: '#8ce99a', fontWeight: '700', fontSize: 13 },
  rubricHint: { color: '#9fb0bf', fontSize: 12 },
  qCard: { backgroundColor: '#1b232b', borderRadius: 12, padding: 14, gap: 8 },
  qText: { color: '#fff', fontWeight: '700', fontSize: 15, lineHeight: 21 },
  opt: {
    position: 'relative',
    backgroundColor: '#243040',
    borderColor: '#243040',
    borderWidth: 2,
    borderRadius: 10,
    padding: 10,
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderColor: '#2f81f7',
    borderWidth: 2,
    borderRadius: 10,
  },
  resultOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderWidth: 2,
    borderRadius: 10,
  },
  optRight: { backgroundColor: '#0b2518', borderColor: '#2f9e44' },
  optWrong: { backgroundColor: '#2b0f0f', borderColor: '#e03131' },
  optText: { color: '#fff', fontSize: 14, lineHeight: 19, position: 'relative', zIndex: 1 },
  explain: { fontSize: 13, lineHeight: 18 },
  explainOk: { color: '#8ce99a' },
  explainBad: { color: '#ffa8a8' },
  pickedSlot: { height: 36, justifyContent: 'center' },
  pickedNote: { color: '#9fb0bf', fontSize: 12 },
  hiddenFeedback: { opacity: 0 },
  practiceCard: { backgroundColor: '#1b232b', borderRadius: 12, padding: 14, gap: 6 },
  practiceTitle: { color: '#fff', fontWeight: '800', fontSize: 15 },
  practiceText: { color: '#c9d4de', fontSize: 14, lineHeight: 21 },
  bigBtn: { backgroundColor: '#2f81f7', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  bigBtnDisabled: { backgroundColor: '#243040' },
  bigBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  ghostBtn: { borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderColor: '#2f81f7', borderWidth: 1 },
  ghostText: { color: '#2f81f7', fontWeight: '700' },
  scoreCard: { backgroundColor: '#0b2518', borderColor: '#2f9e44', borderWidth: 2, borderRadius: 16, padding: 16, alignItems: 'center', gap: 6 },
  scoreTitle: { color: '#8ce99a', fontWeight: '800', fontSize: 15 },
  scoreBig: { color: '#fff', fontWeight: '900', fontSize: 28 },
  scoreSub: { color: '#c3fae8', fontSize: 13, textAlign: 'center' },
  note: { color: '#9fb0bf', fontSize: 12, textAlign: 'center' },
});
