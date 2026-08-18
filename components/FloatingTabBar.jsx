import { Dimensions, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";

const SCREEN_WIDTH = Dimensions.get("window").width;
const FLOATING_MARGIN = Platform.OS === "web" ? 32 : 16;

/**
 * Custom bottom tab bar, used for both the "classic" and "floating" nav
 * styles.
 *
 * Why not just use React Navigation's built-in `tabBarStyle: { position:
 * "absolute", ... }`, like before? That approach renders correctly on web,
 * but combining `position: absolute` with `borderRadius` + `elevation` +
 * shadow on native (especially Android) is a known source of inconsistent,
 * sometimes badly corrupted rendering — the tab bar's own container can end
 * up compositing incorrectly against sibling screen content, which is
 * exactly the "looks totally different on the phone" symptom being fixed
 * here. Rendering our own View/Pressable tree via the `tabBar` render prop
 * removes that dependency entirely: the exact same component tree runs on
 * every platform, so there's nothing left for web and native to disagree on.
 */
export default function FloatingTabBar({ state, descriptors, navigation }) {
  const { theme, navStyle } = useTheme();
  const insets = useSafeAreaInsets();
  const floating = navStyle === "floating";
  const floatingWidth = Math.min(SCREEN_WIDTH - FLOATING_MARGIN * 2, 480);

  const tabs = state.routes.map((route, index) => {
    const { options } = descriptors[route.key];
    const isFocused = state.index === index;
    const label = options.tabBarLabel ?? options.title ?? route.name;
    const color = isFocused ? theme.primary : theme.onSurfaceVariant;

    const onPress = () => {
      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    return (
      <Pressable
        key={route.key}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={options.tabBarAccessibilityLabel ?? String(label)}
        style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}
      >
        {options.tabBarIcon?.({ focused: isFocused, color, size: 24 })}
        <Text
          numberOfLines={1}
          style={[styles.label, { color, fontFamily: "LuxFirsNeue" }]}
        >
          {label}
        </Text>
      </Pressable>
    );
  });

  if (!floating) {
    return (
      <View style={styles.classicWrapper}>
        <View
          style={[
            styles.bar,
            {
              backgroundColor: theme.surface,
              borderColor: theme.surfaceVariant,
              width: "100%",
              height: 72 + insets.bottom,
              paddingBottom: insets.bottom,
              borderTopWidth: 1,
            },
          ]}
        >
          {tabs}
        </View>
      </View>
    );
  }

  return (
    <View pointerEvents="box-none" style={styles.floatingWrapper}>
      {/*
        THE FIX: on Android, putting `elevation` (the shadow) and
        `overflow: "hidden"` + `borderRadius` on the SAME View that also
        contains the tab children is a known native rendering bug — the
        elevated surface can end up compositing itself above its own
        children, so the pill renders but everything inside it (icons +
        labels) is invisible. This is exactly the "navbar aparece mas os
        itens não aparecem" symptom.
        The fix is to split it into two layers: an OUTER view that only
        owns the shadow/elevation (no clipping), and an INNER view that
        owns the rounded clipping + background + the actual tab content.
      */}
      <View
        style={[
          styles.shadowLayer,
          {
            width: floatingWidth,
            borderRadius: 34,
            backgroundColor: theme.surface,
            marginBottom:
              Platform.OS === "web" ? 16 : Math.max(insets.bottom + 8, 20),
          },
          Platform.select({
            web: {
              boxShadow: "0 6px 22px rgba(0,0,0,0.12)",
            },
            default: {
              elevation: 8,
              shadowColor: "#000",
              shadowOpacity: 0.12,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
            },
          }),
        ]}
      >
        <View
          style={[
            styles.bar,
            {
              backgroundColor: theme.surface,
              borderColor: theme.surfaceVariant,
              height: 68,
              borderRadius: 34,
              borderWidth: 1,
            },
          ]}
        >
          {tabs}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    zIndex: 10,
  },
  classicWrapper: {
    width: "100%",
  },
  shadowLayer: {
    // No overflow/clipping here on purpose — see the comment above where
    // this style is used. This layer only exists to carry the shadow.
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  tabPressed: {
    opacity: 0.7,
  },
  label: {
    fontSize: 10,
  },
});
