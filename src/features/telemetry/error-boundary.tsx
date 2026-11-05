import { Component, type ErrorInfo, type ReactNode } from "react";
import { Platform, Pressable, Text, View } from "react-native";

import { colors } from "@/theme/theme";

import { captureError } from "./errors";

type Props = { children: ReactNode };
type State = { failed: boolean };

export class TelemetryErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    captureError(error, info.componentStack ?? undefined);
  }

  private reset = () => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.location.reload();
      return;
    }
    this.setState({ failed: false });
  };

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          backgroundColor: colors.canvas,
        }}
      >
        <Text
          accessibilityRole="header"
          style={{
            fontSize: 24,
            lineHeight: 30,
            color: colors.ink,
            textAlign: "center",
          }}
        >
          Something went wrong
        </Text>
        <Text
          style={{
            marginTop: 8,
            maxWidth: 420,
            fontSize: 15,
            lineHeight: 22,
            color: colors.muted,
            textAlign: "center",
          }}
        >
          Your saved progress is still on this device. Reload to pick up where
          you left off.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reload the app"
          onPress={this.reset}
          style={{
            marginTop: 20,
            minHeight: 44,
            justifyContent: "center",
            borderRadius: 10,
            backgroundColor: colors.accent,
            paddingHorizontal: 20,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 15 }}>Reload</Text>
        </Pressable>
      </View>
    );
  }
}
