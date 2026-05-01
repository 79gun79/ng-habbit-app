import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useEffect } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/context/auth";

export default function LoginScreen() {
  const { user, loading, request, signIn } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace("/(drawer)/(tabs)");
    }
  }, [user]);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.inner}>
        {/* 로고 / 타이틀 */}
        <View style={styles.heroSection}>
          <View style={styles.iconWrap}>
            <Ionicons name="checkmark-done-circle" size={72} color="#08111F" />
          </View>
          <Text style={styles.title}>습관 트래커</Text>
          <Text style={styles.subtitle}>
            매일의 작은 습관이{"\n"}큰 변화를 만들어요
          </Text>
        </View>

        {/* 로그인 버튼 */}
        <View style={styles.actions}>
          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="small" color="#08111F" />
              <Text style={styles.loadingText}>로그인 중...</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.googleBtn, !request && styles.disabledBtn]}
              onPress={signIn}
              disabled={!request}
              activeOpacity={0.85}
            >
              <Ionicons name="logo-google" size={20} color="#FFFFFF" />
              <Text style={styles.googleBtnText}>Google로 시작하기</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5FA",
  },
  inner: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  heroSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: 36,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1A1A2E",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#9E9E9E",
    textAlign: "center",
    lineHeight: 24,
  },
  actions: {
    gap: 12,
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#08111F",
    borderRadius: 16,
    paddingVertical: 18,
    gap: 10,
    shadowColor: "#08111F",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  googleBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  loadingWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
  },
  loadingText: {
    fontSize: 15,
    color: "#9E9E9E",
  },
});
