import { Dimensions, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";

const SCREEN_WIDTH = Dimensions.get("window").width;
const FLOATING_MARGIN = Platform.OS === "web" ? 32 : 16;

export default function FloatingTabBar({ state, descriptors, navigation }) {
  const { theme, navStyle } = useTheme();
  const insets = useSafeAreaInsets();
  const floating = navStyle === "floating";

  // Floating fica mais compacto.
  // Classic continua usando 100% da largura.
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
          // Somente o Floating recebe ícones maiores.
          // Classic permanece 24.
          size: floating ? 32 : 24,
        })}

        {/* Texto continua existindo somente no Classic */}
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

  // ============================================================
  // CLASSIC — NÃO ALTERADO
  // ============================================================
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

  // ============================================================
  // FLOATING — SOMENTE ÍCONES
  // ============================================================
  return (
    <View pointerEvents="box-none" style={styles.floatingWrapper}>
      <View
        style={[
          styles.shadowLayer,
          {
            width: floatingWidth,
            borderRadius: 34,
            backgroundColor: theme.surface,
            marginBottom:
              Platform.OS === "web"
                ? 16
                : Math.max(insets.bottom + 8, 20),
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
              shadowOffset: {
                width: 0,
                height: 4,
              },
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
    // Sem overflow/clipping para evitar problemas de composição
    // no Android.
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