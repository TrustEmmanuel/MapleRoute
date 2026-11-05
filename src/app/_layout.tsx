import "../global.css";

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";
import { Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider } from "@/features/auth/auth-provider";
import { CrsProvider } from "@/features/crs/crs-provider";
import { GuideProvider } from "@/features/guide/guide-provider";
import { colors } from "@/theme/theme";

void SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (Platform.OS === "web") return;
    void SystemUI.setBackgroundColorAsync(colors.canvas).catch(() => {});
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CrsProvider>
          <GuideProvider>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.canvas },
              }}
            >
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="login" options={{ animation: "fade" }} />
              <Stack.Screen
                name="crs"
                options={{ animation: "slide_from_right" }}
              />
              <Stack.Screen
                name="privacy"
                options={{ animation: "slide_from_right" }}
              />
              <Stack.Screen
                name="terms"
                options={{ animation: "slide_from_right" }}
              />
              <Stack.Screen
                name="accessibility"
                options={{ animation: "slide_from_right" }}
              />
            </Stack>
          </GuideProvider>
        </CrsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
