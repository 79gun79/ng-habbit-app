import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    Image,
    Modal,
    PanResponder,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";

import { GoogleUser } from "@/hooks/use-google-auth";

interface ProfileSidebarProps {
  visible: boolean;
  user: GoogleUser;
  habitCount: number;
  onClose: () => void;
  onSignOut: () => void;
}

const SCREEN_WIDTH = Dimensions.get("window").width;
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.78;

export default function ProfileSidebar({
  visible,
  user,
  habitCount,
  onClose,
  onSignOut,
}: ProfileSidebarProps) {
  const translateX = useRef(new Animated.Value(SIDEBAR_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dx, dy }) =>
        dx > 8 && Math.abs(dy) < Math.abs(dx),
      onPanResponderMove: (_, { dx }) => {
        if (dx > 0) translateX.setValue(dx);
      },
      onPanResponderRelease: (_, { dx, vx }) => {
        if (dx > SIDEBAR_WIDTH * 0.35 || vx > 0.8) {
          Animated.timing(translateX, {
            toValue: SIDEBAR_WIDTH,
            duration: 200,
            useNativeDriver: true,
          }).start(onClose);
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 0,
            speed: 20,
          }).start();
        }
      },
    }),
  ).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 0,
          speed: 20,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: SIDEBAR_WIDTH,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, overlayOpacity, translateX]);

  const handleSignOut = () => {
    onClose();
    setTimeout(onSignOut, 240);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* 딤 오버레이 */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} />
      </TouchableWithoutFeedback>

      {/* 사이드바 패널 */}
      <Animated.View
        style={[styles.sidebar, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        {/* 닫기 버튼 */}
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
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
              <Text style={styles.statValue}>{habitCount}개</Text>
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
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sidebar: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: "#FFFFFF",
    paddingTop: 60,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 16,
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
