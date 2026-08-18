import { Tabs } from "expo-router";
import { MaterialIcons } from "@react-native-vector-icons/material-icons/static";
import { useLanguage } from "../context/LanguageContext";
import FloatingTabBar from "./FloatingTabBar";

export default function BottomTabs() {
  const { t } = useLanguage();

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.home,
          tabBarLabel: t.home,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="projects"
        options={{
          title: t.projects,
          tabBarLabel: t.projects,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="code" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="games"
        options={{
          title: t.games,
          tabBarLabel: t.games,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="sports-esports" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="blog"
        options={{
          title: t.blog,
          tabBarLabel: t.blog,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="article" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: t.settings,
          tabBarLabel: t.settings,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
