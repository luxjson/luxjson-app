import { Dimensions, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";

const SCREEN_WIDTH = Dimensions.get("window").width;
const FLOATING_MARGIN = Platform.OS === "web" ? 32 : 16;

export default function FloatingTabBar({ state, descriptors, navigation }) {
  const { theme, navStyle } = useTheme();
  const insets = useSafeAreaInsets();
  const floating = navStyle === "floating";
  const floatingWidth = Math.min(
    SCREEN_WIDTH - FLOATING_MARGIN * 2,
    320
  );

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
        accessibilityLabel={
          options.tabBarAccessibilityLabel ?? String(label)
        }
        style={({ pressed }) => [
          styles.tab,
          pressed && styles.tabPressed,
        ]}
      >
        {options.tabBarIcon?.({
          focused: isFocused,
          color,
          size: floating ? 28 : 24,
        })}

        {!floating && (
          <Text
            numberOfLines={1}
            style={[
              styles.label,
              {
                color,
                fontFamily: "LuxFirsNeue",
              },
            ]}
          >
            {label}
          </Text>
        )}
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
      <View
        style={[
          styles.shadowLayer,
          {
            width: floatingWidth,
            borderRadius: 1000,
            borderWidth: 1,
            borderColor: theme.surfaceVariant,
            backgroundColor: theme.surface,
            marginBottom:
              Platform.OS === "web"
                ? 16
                : Math.max(insets.bottom + 8, 20),
          },
          Platform.select({
            web: {
            },
            default: {
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
    bottom: 10,
    alignItems: "center",
    zIndex: 10,
  },

  classicWrapper: {
    width: "100%",
  },

  shadowLayer: {
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