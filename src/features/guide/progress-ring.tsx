import Svg, { Circle } from "react-native-svg";

import { colors } from "@/theme/theme";

export function ProgressRing({
  done,
  total,
  size = 26,
  strokeWidth = 3,
  color = colors.accent,
}: {
  done: number;
  total: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = total > 0 ? Math.min(done / total, 1) : 0;

  return (
    <Svg
      width={size}
      height={size}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={colors.line}
        strokeWidth={strokeWidth}
        fill="none"
      />
      {ratio > 0 ? (
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - ratio)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      ) : null}
    </Svg>
  );
}
