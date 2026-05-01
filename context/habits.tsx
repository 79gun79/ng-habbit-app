import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

import { useAuth } from "@/context/auth";
import { supabase } from "@/utils/supabase";

export interface Habit {
  id: string;
  name: string;
  createdAt: string;
  lastDoneDate?: string | null;
}

interface SupabaseHabitRow {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  last_done_date: string | null;
}

function toHabit(row: SupabaseHabitRow): Habit {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    lastDoneDate: row.last_done_date,
  };
}

interface HabitsContextValue {
  habits: Habit[];
  loading: boolean;
  error: string | null;
  fetchHabits: () => Promise<void>;
  addHabit: (name: string) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitDone: (id: string) => Promise<void>;
}

export function isHabitDoneToday(habit: Habit): boolean {
  return habit.lastDoneDate === new Date().toDateString();
}

const HabitsContext = createContext<HabitsContextValue | null>(null);

export function HabitsProvider({ children }: { children: React.ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchHabits = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("habits")
        .select("*")
        .order("created_at", { ascending: true });
      if (err) throw err;
      setHabits((data as SupabaseHabitRow[]).map(toHabit));
    } catch {
      setError("습관 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 유저 로그인 시 fetch
  useEffect(() => {
    if (user) {
      fetchHabits();
    } else {
      setHabits([]);
    }
  }, [user, fetchHabits]);

  // Supabase 세션 확립 시 재fetch (signInWithIdToken 완료 후 타이밍 보정)
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session && user) {
        fetchHabits();
      }
    });
    return () => subscription.unsubscribe();
  }, [user, fetchHabits]);

  const addHabit = async (name: string) => {
    if (!user) return;
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    if (!userId) throw new Error("로그인이 필요합니다.");
    const { error: err } = await supabase
      .from("habits")
      .insert({ name: name.trim(), user_id: userId });
    if (err) throw new Error("습관 추가에 실패했습니다.");
    await fetchHabits();
  };

  const deleteHabit = async (id: string) => {
    const { error: err } = await supabase.from("habits").delete().eq("id", id);
    if (err) throw new Error("습관 삭제에 실패했습니다.");
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  const toggleHabitDone = async (id: string) => {
    const today = new Date().toDateString();
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;
    const newDate = habit.lastDoneDate === today ? null : today;
    const { error: err } = await supabase
      .from("habits")
      .update({ last_done_date: newDate })
      .eq("id", id);
    if (err) throw new Error("습관 업데이트에 실패했습니다.");
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, lastDoneDate: newDate } : h)),
    );
  };

  return (
    <HabitsContext.Provider
      value={{
        habits,
        loading,
        error,
        fetchHabits,
        addHabit,
        deleteHabit,
        toggleHabitDone,
      }}
    >
      {children}
    </HabitsContext.Provider>
  );
}

export function useHabits(): HabitsContextValue {
  const ctx = useContext(HabitsContext);
  if (!ctx) throw new Error("useHabits must be used within HabitsProvider");
  return ctx;
}
