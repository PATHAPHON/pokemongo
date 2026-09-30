import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/shared/components/haptic-tab';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor:
          Colors[colorScheme === 'dark' ? 'dark' : 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => (
            <Ionicons size={24} name="map" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pokedex"
        options={{
          title: 'Pokédex',
          tabBarIcon: ({ color }) => (
            <Ionicons size={24} name="book" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pokemon"
        options={{
          title: 'Bag',
          tabBarIcon: ({ color }) => (
            <Ionicons size={24} name="briefcase" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <Ionicons size={24} name="person" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
