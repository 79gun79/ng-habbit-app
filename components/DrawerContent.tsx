import { Ionicons } from "@expo/vector-icons";
import {
    DrawerContentComponentProps,
    DrawerContentScrollView,
} from "@react-navigation/drawer";
import { DrawerActions } from "@react-navigation/native";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAuth } from "@/context/auth";
import { useHabits } from "@/context/habits";

export default function DrawerContent(props: DrawerContentComponentProps) {
  const { user, signOut } = useAuth();
  const { habits } = useHabits();

  const handleClose = () => {
    props.navigation.dispatch(DrawerActions.closeDrawer());
  };

  const handleSignOut = () => {
    handleClose();
    setTimeout(signOut, 240);
  };

  if (!user) return null;

  return (
    <DrawerContentScrollView
      {...props}
      scrollEnabled={false}
      contentContainerStyle={styles.container}
    >
      {/* 닫기 버튼 */}
      <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
        <Ionicons name="close" size={22} color="#9E9E9E" />
      </TouchableOpacity>

      {/* 프로필 섹션 */}
      <View style={styles.profileSection}>
        {user.picture ? (
          <Image source={{ uri: user.picture }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={36} color="#9E9E9E" />
          </View>
        )}
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      {/* 구분선 */}
      <View style={styles.divider} />

      {/* 통계 섹션 */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionLabel}>나의 습관</Text>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={28} color="#08111F" />
          <View style={styles.statInfo}>
            <Text style={styles.statValue}>{habits.length}개</Text>
            <Text style={styles.statLabel}>등록된 습관</Text>
          </View>
        </View>
      </View>

      {/* 구분선 */}
      <View style={styles.divider} />

      {/* 메뉴 섹션 */}
      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#FF5252" />
          <Text style={styles.menuItemTextDanger}>로그아웃</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 20,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 4,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A2E",
  },
  email: {
    fontSize: 13,
    color: "#9E9E9E",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 8,
  },
  statsSection: {
    paddingVertical: 16,
    gap: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#BDBDBD",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  statCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5FA",
    borderRadius: 14,
    padding: 16,
    gap: 14,
  },
  statInfo: {
    gap: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1A1A2E",
  },
  statLabel: {
    fontSize: 12,
    color: "#9E9E9E",
  },
  menuSection: {
    paddingVertical: 16,
    gap: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 12,
  },
  menuItemTextDanger: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FF5252",
  },
});
