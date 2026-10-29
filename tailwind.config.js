const tokens = require("./src/theme/tokens.json");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        canvas: tokens.colors.canvas,
        surface: tokens.colors.surface,
        line: tokens.colors.line,
        ink: tokens.colors.ink,
        muted: tokens.colors.muted,
        accent: {
          DEFAULT: tokens.colors.accent,
          pressed: tokens.colors.accentPressed,
        },
        success: tokens.colors.success,
        "success-surface": tokens.colors.successSurface,
        warning: tokens.colors.warning,
        "warning-surface": tokens.colors.warningSurface,
        "danger-surface": tokens.colors.dangerSurface,
      },
      borderRadius: {
        control: `${tokens.radius.control}px`,
        card: `${tokens.radius.card}px`,
        panel: `${tokens.radius.panel}px`,
      },
      fontFamily: {
        inter: ["Inter_400Regular"],
        "inter-medium": ["Inter_500Medium"],
        "inter-semibold": ["Inter_600SemiBold"],
        "inter-bold": ["Inter_700Bold"],
      },
    },
  },
  plugins: [],
};
