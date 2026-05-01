import { Redirect } from "expo-router";

import { useAuth } from "@/context/auth";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#08111F" />
      </View>
    );
  }

  return user ? (
    <Redirect href="/(drawer)/(tabs)" />
  ) : (
    <Redirect href="/(auth)/login" />
  );
}
