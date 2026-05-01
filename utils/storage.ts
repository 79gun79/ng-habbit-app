import AsyncStorage from "@react-native-async-storage/async-storage";

const HABITS_KEY = "@habit_tracker:habits";

export interface Habit {
  id: string;
  name: string;
  createdAt: string;
  lastDoneDate?: string | null;
}

/**
 * 저장된 모든 습관 목록을 불러옵니다.
 */
export const loadHabits = async (): Promise<Habit[]> => {
  try {
    const json = await AsyncStorage.getItem(HABITS_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error("[storage] loadHabits 오류:", error);
    return [];
  }
};

/**
 * 습관 목록 전체를 저장합니다.
 */
export const saveHabits = async (habits: Habit[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  } catch (error) {
    console.error("[storage] saveHabits 오류:", error);
  }
};

/**
 * 새 습관을 추가하고 저장합니다.
 */
export const addHabit = async (
  habits: Habit[],
  name: string,
): Promise<Habit[]> => {
  const newHabit: Habit = {
    id: Date.now().toString(),
    name: name.trim(),
    createdAt: new Date().toISOString(),
  };
  const updated = [...habits, newHabit];
  await saveHabits(updated);
  return updated;
};

/**
 * 특정 ID의 습관을 삭제하고 저장합니다.
 */
export const deleteHabit = async (
  habits: Habit[],
  id: string,
): Promise<Habit[]> => {
  const updated = habits.filter((h) => h.id !== id);
  await saveHabits(updated);
  return updated;
};

/**
 * 오늘 날짜 기준으로 습관 완료 상태를 토글합니다.
 */
export const toggleHabitDone = async (
  habits: Habit[],
  id: string,
): Promise<Habit[]> => {
  const today = new Date().toDateString();
  const updated = habits.map((h) => {
    if (h.id !== id) return h;
    const isDoneToday = h.lastDoneDate === today;
    return { ...h, lastDoneDate: isDoneToday ? null : today };
  });
  await saveHabits(updated);
  return updated;
};

/**
 * 오늘 날짜 기준으로 습관 완료 여부를 반환합니다.
 */
export const isHabitDoneToday = (habit: Habit): boolean => {
  return habit.lastDoneDate === new Date().toDateString();
};
