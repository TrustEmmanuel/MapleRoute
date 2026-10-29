import { Text as RNText, type TextProps } from "react-native";

type Variant =
  | "display"
  | "title"
  | "heading"
  | "brand"
  | "body"
  | "small"
  | "label"
  | "button"
  | "code";

type Tone = "ink" | "muted" | "accent" | "white";

const variantClasses: Record<Variant, string> = {
  display:
    "text-[34px] leading-[40px] font-inter-semibold tracking-[-0.9px]",
  title: "text-[27px] leading-[33px] font-inter-semibold tracking-[-0.6px]",
  heading: "text-[18px] leading-[25px] font-inter-semibold tracking-[-0.2px]",
  brand: "text-[18px] leading-[24px] font-inter-semibold tracking-[-0.4px]",
  body: "text-[15px] leading-[23px] font-inter",
  small: "text-[13px] leading-[20px] font-inter",
  label:
    "text-[11px] leading-[16px] font-inter-semibold uppercase tracking-[1.4px]",
  button: "text-[15px] leading-[20px] font-inter-semibold",
  code: "text-[12px] leading-[18px] font-inter-medium",
};

const toneClasses: Record<Tone, string> = {
  ink: "text-ink",
  muted: "text-muted",
  accent: "text-accent",
  white: "text-white",
};

type AppTextProps = TextProps & {
  variant?: Variant;
  tone?: Tone;
};

export function Text({
  variant = "body",
  tone = "ink",
  className = "",
  ...props
}: AppTextProps) {
  return (
    <RNText
      className={`${variantClasses[variant]} ${toneClasses[tone]} ${className}`}
      {...props}
    />
  );
}
