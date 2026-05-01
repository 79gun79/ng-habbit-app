import { Habit, isHabitDoneToday } from "@/utils/storage";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import {
  Alert,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface HabitItemProps {
  habit: Habit;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

export default function HabitItem({
  habit,
  onDelete,
  onToggle,
}: HabitItemProps) {
  const done = isHabitDoneToday(habit);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleToggle = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.88,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
    onToggle(habit.id);
  };

  const handleDelete = () => {
    Alert.alert("습관 삭제", `"${habit.name}" 을(를) 삭제할까요?`, [
      { text: "취소", style: "cancel" },
      { text: "삭제", style: "destructive", onPress: () => onDelete(habit.id) },
    ]);
  };

  const formattedDate = new Date(habit.createdAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return (
    <View style={[styles.card, done && styles.cardDone]}>
      <View style={[styles.colorBar, done && styles.colorBarDone]} />
      <TouchableOpacity
        onPress={handleToggle}
        style={styles.checkArea}
        hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
      >
        <Animated.View
          style={[
            styles.checkCircle,
            done && styles.checkCircleDone,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          {done && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
        </Animated.View>
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={[styles.name, done && styles.nameDone]}>{habit.name}</Text>
        <Text style={styles.date}>{formattedDate} 시작</Text>
      </View>
      <TouchableOpacity
        onPress={handleDelete}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={styles.deleteBtn}
      >
        <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    overflow: "hidden",
  },
  cardDone: {
    backgroundColor: "#F2F3F4",
  },
  colorBar: {
    width: 5,
    alignSelf: "stretch",
    backgroundColor: "#08111F",
  },
  colorBarDone: {
    backgroundColor: "#4CAF50",
  },
  checkArea: {
    paddingLeft: 12,
    paddingRight: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#BDBDBD",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  checkCircleDone: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  content: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A2E",
    marginBottom: 4,
  },
  nameDone: {
    color: "#9E9E9E",
    textDecorationLine: "line-through",
  },
  date: {
    fontSize: 12,
    color: "#9E9E9E",
  },
  deleteBtn: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
});
