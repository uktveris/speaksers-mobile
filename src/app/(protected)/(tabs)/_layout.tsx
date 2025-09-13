import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { Appearance, Platform } from "react-native";

import { HapticTab } from "@/src/components/HapticTab";
import { IconSymbol } from "@/src/components/ui/IconSymbol";
import TabBarBackground from "@/src/components/ui/TabBarBackground";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "@/theme";
import { StyleSheet, useColorScheme } from "nativewind";
import { BlurView } from "expo-blur";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.secondary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "transparent",
          overflow: "hidden",
          elevation: 0,
          borderTopWidth: 0,
        },
        tabBarBackground: () => {
          return (
            <BlurView
              tint={colorScheme.colorScheme === "light" ? "light" : "dark"}
              intensity={90}
              style={{
                flex: 1,
                borderTopLeftRadius: 15,
                borderTopRightRadius: 15,
                overflow: "hidden",
                backgroundColor: "transparent",
              }}
            />
          );
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Learn",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="globalChat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color }) => (
            <Ionicons name="chatbubble" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
