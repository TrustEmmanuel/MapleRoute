import { View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { colors } from "@/theme/theme";

import { Text } from "./ui/text";

// Maple leaf outline traced from the public-domain Canadian flag geometry.
const LEAF_PATH =
  "m4890 4430-45-863a95 95 0 0 1 111-98l859 151-116-320a65 65 0 0 1 20-73l941-762-212-99a65 65 0 0 1-34-79l186-572-542 115a65 65 0 0 1-73-38l-105-247-423 454a65 65 0 0 1-111-57l204-1052-327 189a65 65 0 0 1-91-27l-332-652-332 652a65 65 0 0 1-91 27l-327-189 204 1052a65 65 0 0 1-111 57l-423-454-105 247a65 65 0 0 1-73 38l-542-115 186 572a65 65 0 0 1-34 79l-212 99 941 762a65 65 0 0 1 20 73l-116 320 859-151a95 95 0 0 1 111 98l-45 863z";

export function MapleLeaf({
  size = 24,
  color = colors.accent,
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="2680 275 4240 4240">
      <Path d={LEAF_PATH} fill={color} />
    </Svg>
  );
}

export function BrandLockup() {
  return (
    <View className="flex-row items-center gap-2">
      <MapleLeaf size={24} />
      <Text variant="brand">MapleRoute</Text>
    </View>
  );
}
