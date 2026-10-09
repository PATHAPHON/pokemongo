import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { HapticTab } from '@/shared/components/haptic-tab';
import { Fonts } from '@/shared/constants/theme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  const activeColor = '#EE1515';
  const inactiveColor = '#8E8E93';
  const floatingBottom = insets.bottom > 0 ? insets.bottom + 12 : 24;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          position: 'absolute',
          bottom: floatingBottom,
          start: 24,
          end: 24,
          left: 24,
          right: 24,
          height: 60,
          borderRadius: 30,
          borderCurve: 'continuous',
          backgroundColor: Platform.select({
            ios: 'rgba(255, 255, 255, 0.95)',
            web: 'rgba(255, 255, 255, 0.95)',
            default: '#FFFFFF',
          }),
          borderWidth: 1,
          borderColor: 'rgba(238, 21, 21, 0.15)',
          paddingTop: 4,
          paddingBottom: 4,
          paddingHorizontal: 8,
          shadowColor: '#EE1515',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.12,
          shadowRadius: 18,
          elevation: 8,
          ...Platform.select({
            web: {
              maxWidth: 360,
              marginHorizontal: 'auto',
              backdropFilter: 'blur(25px)',
              WebkitBackdropFilter: 'blur(25px)',
              boxShadow:
                '0 10px 30px rgba(238, 21, 21, 0.08), 0 0 1px rgba(0, 0, 0, 0.10)',
            },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 9.5,
          fontWeight: '600',
          fontFamily: Fonts.semiBold,
          marginTop: 1,
        },
        tabBarItemStyle: {
          paddingVertical: 1,
          height: '100%',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Meetups',
          tabBarIcon: ({ color }) => (
            <Ionicons size={24} name="people" color={color} />
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
          title: 'ของฉัน',
          tabBarIcon: ({ color }) => (
            <Ionicons size={24} name="bookmark" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'โปรไฟล์',
          tabBarIcon: ({ color }) => (
            <Ionicons size={24} name="person" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
