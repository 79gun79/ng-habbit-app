import { Redirect } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { ActivityIndicator, Dimensions, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import DrawerContent from "@/components/DrawerContent";
import { useAuth } from "@/context/auth";
import { HabitsProvider } from "@/context/habits";

const SIDEBAR_WIDTH = Dimensions.get("window").width * 0.78;

export default function DrawerLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#08111F" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <HabitsProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Drawer
          drawerContent={(props) => <DrawerContent {...props} />}
          screenOptions={{
            headerShown: false,
            drawerPosition: "right",
            drawerType: "front",
            drawerStyle: {
              width: SIDEBAR_WIDTH,
              backgroundColor: "#FFFFFF",
              shadowColor: "#000",
              shadowOffset: { width: -4, height: 0 },
              shadowOpacity: 0.12,
              shadowRadius: 16,
              elevation: 16,
            },
            swipeEnabled: true,
            swipeEdgeWidth: 60,
            overlayColor: "rgba(0,0,0,0.45)",
          }}
        >
          <Drawer.Screen name="(tabs)" options={{ headerShown: false }} />
        </Drawer>
      </GestureHandlerRootView>
    </HabitsProvider>
  );
}
