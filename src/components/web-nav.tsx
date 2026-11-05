import { Link, router, usePathname } from "expo-router";
import { Platform, Pressable, View } from "react-native";
import { useWindowDimensions } from "react-native";

import { CrsScoreBadge } from "@/components/crs-score-badge";
import { useAuth } from "@/features/auth/auth-provider";
import { useCrs } from "@/features/crs/crs-provider";
import { colors } from "@/theme/theme";

import { BrandLockup } from "./brand";
import { Text } from "./ui/text";

const WIDE = 900;

export function useIsWideWeb() {
  const { width } = useWindowDimensions();
  return Platform.OS === "web" && width >= WIDE;
}

export function WebNav() {
  const pathname = usePathname();
  const { latest, loading } = useCrs();
  const { previewMode, signOut, exitPreview } = useAuth();
  const isHome = pathname === "/" || pathname === "/index";

  function handleSignOut() {
    if (previewMode) {
      exitPreview();
    } else {
      void signOut().catch(() => {});
    }
    router.replace("/login");
  }

  return (
    <View className="w-full border-b border-line bg-canvas">
      <View className="mx-auto w-full max-w-[1240px] flex-row items-center justify-between px-5 py-3">
        <View className="flex-row items-center gap-4">
          <Link href="/" aria-label="MapleRoute home">
            <BrandLockup />
          </Link>
          {loading ? null : latest ? (
            <Link href="/crs" aria-label={`CRS score ${latest.score} out of 1270`}>
              <CrsScoreBadge score={latest.score} band={latest.band} />
            </Link>
          ) : (
            <Link href="/crs" aria-label="CRS not checked">
              <View className="rounded-full border border-line px-3 py-1.5">
                <Text variant="label" tone="muted">
                  CRS not checked
                </Text>
              </View>
            </Link>
          )}
        </View>
        <View className="flex-row items-center gap-1">
          <NavLink href="/" label="Home" active={isHome} />
          <NavLink href="/settings" label="Settings" active={pathname === "/settings"} />
          <Pressable
            accessibilityRole="button"
            aria-label="Log out"
            onPress={handleSignOut}
          >
            <View className="rounded-control px-4 py-2">
              <Text style={{ fontFamily: "Inter_500Medium", color: colors.muted }}>
                {previewMode ? "Exit preview" : "Log out"}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function NavLink({
  href,
  label,
  active,
}: {
  href: "/" | "/settings";
  label: string;
  active: boolean;
}) {
  return (
    <Link href={href} aria-label={label}>
      <View
        className={`rounded-control px-4 py-2 ${
          active ? "bg-[#F1F1F3]" : "bg-transparent"
        }`}
      >
        <Text
          style={{
            fontFamily: active ? "Inter_600SemiBold" : "Inter_500Medium",
            color: active ? colors.ink : colors.muted,
          }}
        >
          {label}
        </Text>
      </View>
    </Link>
  );
}
