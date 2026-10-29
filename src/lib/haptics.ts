import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

function run(action: Promise<unknown>) {
  if (Platform.OS === "web") return;
  void action.catch(() => {});
}

export function hapticLight() {
  run(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

export function hapticSuccess() {
  run(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}
