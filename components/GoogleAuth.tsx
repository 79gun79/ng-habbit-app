import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { GoogleUser } from "@/hooks/use-google-auth";

interface GoogleSignInButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

interface UserProfileProps {
  user: GoogleUser;
  onSignOut: () => void;
}

export function GoogleSignInButton({
  onPress,
  disabled,
}: GoogleSignInButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
    >
      <Ionicons name="logo-google" size={20} color="#FFFFFF" />
      <Text style={styles.buttonText}>Google로 로그인</Text>
    </TouchableOpacity>
  );
}

export function UserProfile({ user, onSignOut }: UserProfileProps) {
  return (
    <View style={styles.profileContainer}>
      {user.picture ? (
        <Image source={{ uri: user.picture }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Ionicons name="person" size={24} color="#9E9E9E" />
        </View>
      )}
      <View style={styles.profileInfo}>
        <Text style={styles.profileName}>{user.name}</Text>
        <Text style={styles.profileEmail}>{user.email}</Text>
      </View>
      <TouchableOpacity onPress={onSignOut} style={styles.signOutBtn}>
        <Text style={styles.signOutText}>로그아웃</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4285F4",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 10,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A1A2E",
  },
  profileEmail: {
    fontSize: 12,
    color: "#9E9E9E",
    marginTop: 2,
  },
  signOutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#F5F5FA",
    borderRadius: 8,
  },
  signOutText: {
    fontSize: 13,
    color: "#FF5252",
    fontWeight: "600",
  },
});
