import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AddHabitModal from "@/components/AddHabitModal";
import HabitItem from "@/components/HabitItem";
import ProfileSidebar from "@/components/ProfileSidebar";
import { useGoogleAuth } from "@/hooks/use-google-auth";
import {
  addHabit,
  deleteHabit,
  Habit,
  loadHabits,
  toggleHabitDone,
} from "@/utils/storage";

export default function HomeScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const {
    user,
    loading: authLoading,
    request,
    signIn,
    signOut,
  } = useGoogleAuth();

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    const stored = await loadHabits();
    setHabits(stored);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHabits();
    setRefreshing(false);
  }, []);

  const handleAddHabit = async (name: string) => {
    const updated = await addHabit(habits, name);
    setHabits(updated);
    setModalVisible(false);
  };

  const handleDeleteHabit = async (id: string) => {
    const updated = await deleteHabit(habits, id);
    setHabits(updated);
  };

  const handleToggleHabit = async (id: string) => {
    const updated = await toggleHabitDone(habits, id);
    setHabits(updated);
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="clipboard-outline" size={64} color="#E0E0E0" />
      <Text style={styles.emptyTitle}>등록된 습관이 없어요</Text>
      <Text style={styles.emptySubtitle}>
        아래 버튼을 눌러 첫 번째 습관을 추가해보세요!
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5FA" />

      {/* 헤더 */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>습관 트래커</Text>
          <Text style={styles.headerSub}>총 {habits.length}개의 습관</Text>
        </View>

        {/* 프로필 뱃지 */}
        {authLoading ? (
          <View style={styles.headerBadge}>
            <ActivityIndicator size="small" color="#08111F" />
          </View>
        ) : user ? (
          <TouchableOpacity
            onPress={() => setSidebarVisible(true)}
            activeOpacity={0.8}
          >
            {user.picture ? (
              <Image source={{ uri: user.picture }} style={styles.avatar} />
            ) : (
              <View style={styles.headerBadge}>
                <Ionicons name="person" size={20} color="#08111F" />
              </View>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.headerBadge}
            onPress={signIn}
            disabled={!request}
            activeOpacity={0.8}
          >
            <Ionicons name="person-outline" size={20} color="#08111F" />
          </TouchableOpacity>
        )}
      </View>

      {/* 습관 목록 */}
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <HabitItem
            habit={item}
            onDelete={handleDeleteHabit}
            onToggle={handleToggleHabit}
          />
        )}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.list,
          habits.length === 0 && styles.listEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#08111F"
          />
        }
      />

      {/* FAB 버튼 */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* 추가 모달 */}
      <AddHabitModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={handleAddHabit}
      />

      {/* 프로필 사이드바 */}
      {user && (
        <ProfileSidebar
          visible={sidebarVisible}
          user={user}
          habitCount={habits.length}
          onClose={() => setSidebarVisible(false)}
          onSignOut={signOut}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1A1A2E",
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    color: "#9E9E9E",
    marginTop: 2,
  },
  headerBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E8EAEC",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  list: {
    paddingBottom: 100,
  },
  listEmpty: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#BDBDBD",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#BDBDBD",
    textAlign: "center",
    lineHeight: 20,
  },
  fab: {
    position: "absolute",
    bottom: 32,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#08111F",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#08111F",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
});
