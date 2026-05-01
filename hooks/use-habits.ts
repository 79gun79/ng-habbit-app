import { useCallback, useEffect, useState } from "react";

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

export function isHabitDoneToday(habit: Habit): boolean {
  return habit.lastDoneDate === new Date().toDateString();
}

async function getSupabaseUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

export function useHabits() {
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

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const addHabit = async (name: string) => {
    if (!user) return;
    const userId = await getSupabaseUserId();
    if (!userId) throw new Error("로그인이 필요합니다.");
    const { data, error: err } = await supabase
      .from("habits")
      .insert({ name: name.trim(), user_id: userId })
      .select()
      .single();
    if (err) {
      throw new Error("습관 추가에 실패했습니다.");
    }
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

  return {
    habits,
    loading,
    error,
    fetchHabits,
    addHabit,
    deleteHabit,
    toggleHabitDone,
  };
}
