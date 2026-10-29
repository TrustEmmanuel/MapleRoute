import Ionicons from "@expo/vector-icons/Ionicons";
import { Redirect, Tabs } from "expo-router";
import { View } from "react-native";

import { LoadingScreen } from "@/components/loading-screen";
import { useIsWideWeb, WebNav } from "@/components/web-nav";
import { useAuth } from "@/features/auth/auth-provider";
import { colors } from "@/theme/theme";

export default function TabsLayout() {
  const { signedIn, loading } = useAuth();
  const isWideWeb = useIsWideWeb();

  if (loading) return <LoadingScreen />;
  if (!signedIn) return <Redirect href="/login" />;

  return (
    <View className="flex-1 bg-canvas">
      {isWideWeb ? <WebNav /> : null}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.muted,
          tabBarStyle: isWideWeb
            ? { display: "none" }
            : {
                backgroundColor: colors.canvas,
                borderTopColor: colors.line,
                borderTopWidth: 1,
              },
          tabBarLabelStyle: {
            fontFamily: "Inter_500Medium",
            fontSize: 11,
            lineHeight: 13,
          },
          tabBarIconStyle: {
            height: 24,
          },
          sceneStyle: {
            backgroundColor: colors.canvas,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "map" : "map-outline"}
                size={22}
                color={color as string}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "settings" : "settings-outline"}
                size={22}
                color={color as string}
              />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
