import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef } from "react";
import { Animated, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Habit, isHabitDoneToday, useHabits } from "@/context/habits";

// ── 개별 습관 진행 바 ──────────────────────────────────────────
function HabitBar({ habit, delay }: { habit: Habit; delay: number }) {
  const done = isHabitDoneToday(habit);
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: done ? 1 : 0,
      duration: 600,
      delay,
      useNativeDriver: false,
    }).start();
  }, [done, delay, widthAnim]);

  return (
    <View style={barStyles.row}>
      <View style={barStyles.labelRow}>
        <Text style={barStyles.name} numberOfLines={1}>
          {habit.name}
        </Text>
        <Text
          style={[
            barStyles.badge,
            done ? barStyles.badgeDone : barStyles.badgeTodo,
          ]}
        >
          {done ? "완료" : "미완료"}
        </Text>
      </View>
      <View style={barStyles.track}>
        <Animated.View
          style={[
            barStyles.fill,
            done ? barStyles.fillDone : barStyles.fillTodo,
            {
              width: widthAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
}

const barStyles = StyleSheet.create({
  row: { marginBottom: 18 },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A2E",
    flex: 1,
    marginRight: 8,
  },
  badge: {
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    overflow: "hidden",
  },
  badgeDone: { backgroundColor: "#E8F5E9", color: "#4CAF50" },
  badgeTodo: { backgroundColor: "#F3F3F3", color: "#9E9E9E" },
  track: {
    height: 10,
    backgroundColor: "#F0F0F0",
    borderRadius: 6,
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: 6 },
  fillDone: { backgroundColor: "#4CAF50" },
  fillTodo: { backgroundColor: "#E0E0E0" },
});

// ── 원형 진행률 표시 ──────────────────────────────────────────
function CircleProgress({ percent }: { percent: number }) {
  const size = 140;
  const stroke = 12;
  const isComplete = percent === 100;

  const anim = useRef(new Animated.Value(0)).current;
  const completeFade = useRef(new Animated.Value(0)).current;
  const completeScale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (isComplete) {
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 100,
          duration: 600,
          useNativeDriver: false,
        }),
        Animated.parallel([
          Animated.timing(completeFade, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(completeScale, {
            toValue: 1,
            friction: 5,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      completeFade.setValue(0);
      completeScale.setValue(0.6);
      Animated.timing(anim, {
        toValue: percent,
        duration: 800,
        useNativeDriver: false,
      }).start();
    }
  }, [percent, isComplete, anim, completeFade, completeScale]);

  return (
    <View style={circleStyles.wrapper}>
      {/* 배경 원 */}
      <View
        style={[
          circleStyles.bgCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: stroke,
          },
        ]}
      />
      {/* 100% 완료: 꽉 찬 초록 원 */}
      {isComplete && (
        <Animated.View
          style={[
            circleStyles.completeFill,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              opacity: completeFade,
              transform: [{ scale: completeScale }],
            },
          ]}
        />
      )}
      {/* 진행 호 */}
      {!isComplete && (
        <Animated.View
          style={[
            circleStyles.progressArc,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: stroke,
              borderColor: percent > 0 ? "#08111F" : "transparent",
              transform: [
                {
                  rotate: anim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ["-90deg", "270deg"],
                  }),
                },
              ],
            },
          ]}
        />
      )}
      {/* 중앙 텍스트 or 체크마크 */}
      {isComplete ? (
        <Animated.View
          style={[
            circleStyles.centerText,
            { opacity: completeFade, transform: [{ scale: completeScale }] },
          ]}
        >
          <Ionicons name="checkmark" size={48} color="#FFFFFF" />
        </Animated.View>
      ) : (
        <View style={circleStyles.centerText}>
          <Text style={circleStyles.percentNum}>{Math.round(percent)}</Text>
          <Text style={circleStyles.percentSign}>%</Text>
        </View>
      )}
    </View>
  );
}

const circleStyles = StyleSheet.create({
  wrapper: {
    width: 140,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
  },
  bgCircle: { position: "absolute", borderColor: "#F0F0F0" },
  completeFill: {
    position: "absolute",
    backgroundColor: "#4CAF50",
  },
  progressArc: {
    position: "absolute",
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
  },
  centerText: { alignItems: "center" },
  percentNum: { fontSize: 34, fontWeight: "800", color: "#1A1A2E" },
  percentSign: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9E9E9E",
    marginTop: -4,
  },
});

// ── 메인 화면 ──────────────────────────────────────────────────
export default function StatsScreen() {
  const { habits, fetchHabits } = useHabits();

  useFocusEffect(
    useCallback(() => {
      fetchHabits();
    }, [fetchHabits]),
  );

  const total = habits.length;
  const doneCount = habits.filter(isHabitDoneToday).length;
  const percent = total === 0 ? 0 : (doneCount / total) * 100;

  const summaryMessage = () => {
    if (total === 0) return "등록된 습관이 없어요";
    if (percent === 100) return "오늘 모든 습관을 완료했어요! 🎉";
    if (percent >= 50) return "절반 이상 달성했어요, 조금만 더!";
    return "오늘도 꾸준히 실천해봐요!";
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>통계</Text>
          <Text style={styles.headerSub}>오늘의 습관 달성 현황</Text>
        </View>

        {/* 원형 진행률 카드 */}
        <View style={styles.card}>
          <CircleProgress percent={percent} />
          <View style={styles.summaryTextBox}>
            <Text style={styles.summaryCount}>
              {doneCount} / {total}
            </Text>
            <Text style={styles.summaryLabel}>습관 완료</Text>
            <Text style={styles.summaryMessage}>{summaryMessage()}</Text>
          </View>
        </View>

        {/* 요약 뱃지 */}
        <View style={styles.badgeRow}>
          <View style={[styles.statBox, { backgroundColor: "#E8EAEC" }]}>
            <Ionicons name="list-outline" size={20} color="#08111F" />
            <Text style={[styles.statNum, { color: "#08111F" }]}>{total}</Text>
            <Text style={styles.statLabel}>전체</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: "#E8F5E9" }]}>
            <Ionicons
              name="checkmark-circle-outline"
              size={20}
              color="#4CAF50"
            />
            <Text style={[styles.statNum, { color: "#4CAF50" }]}>
              {doneCount}
            </Text>
            <Text style={styles.statLabel}>완료</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: "#FFF3E0" }]}>
            <Ionicons name="time-outline" size={20} color="#FF9800" />
            <Text style={[styles.statNum, { color: "#FF9800" }]}>
              {total - doneCount}
            </Text>
            <Text style={styles.statLabel}>미완료</Text>
          </View>
        </View>

        {/* 개별 습관 바 */}
        {total > 0 ? (
          <View style={styles.barCard}>
            <Text style={styles.sectionTitle}>습관별 현황</Text>
            {habits.map((habit, i) => (
              <HabitBar key={habit.id} habit={habit} delay={i * 80} />
            ))}
          </View>
        ) : (
          <View style={styles.emptyBox}>
            <Ionicons name="bar-chart-outline" size={52} color="#E0E0E0" />
            <Text style={styles.emptyText}>
              습관 탭에서 습관을 추가해보세요
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5FA" },
  scroll: { paddingBottom: 40 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  headerTitle: { fontSize: 28, fontWeight: "800", color: "#1A1A2E" },
  headerSub: { fontSize: 13, color: "#9E9E9E", marginTop: 2 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    gap: 24,
  },
  summaryTextBox: { flex: 1 },
  summaryCount: { fontSize: 26, fontWeight: "800", color: "#1A1A2E" },
  summaryLabel: { fontSize: 13, color: "#9E9E9E", marginBottom: 8 },
  summaryMessage: {
    fontSize: 13,
    fontWeight: "600",
    color: "#08111F",
    lineHeight: 18,
  },
  badgeRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 14,
    gap: 10,
  },
  statBox: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    gap: 4,
  },
  statNum: { fontSize: 22, fontWeight: "800" },
  statLabel: { fontSize: 11, color: "#9E9E9E", fontWeight: "600" },
  barCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginHorizontal: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A2E",
    marginBottom: 18,
  },
  emptyBox: { alignItems: "center", marginTop: 60, gap: 12 },
  emptyText: { fontSize: 14, color: "#BDBDBD", textAlign: "center" },
});
