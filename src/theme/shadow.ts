import { Platform, type ViewStyle } from "react-native";

export const cardShadow: ViewStyle =
  Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#111111",
      shadowOpacity: 0.05,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 8 },
    },
    android: {
      elevation: 1,
    },
    web: {
      boxShadow:
        "0 12px 32px rgba(17, 17, 17, 0.06), 0 1px 2px rgba(17, 17, 17, 0.04)",
    },
    default: {},
  }) ?? {};
