import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { ProfileView } from '@/features/profile';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenBg = isDark ? '#121212' : '#F4F6F8';
  const headerBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const headerBorder = isDark ? '#262626' : '#E1E4E8';
  const textColor = isDark ? '#ECEDEE' : '#11181C';

  return (
    <SafeAreaView
      className="flex-1 bg-[#F4F6F8] dark:bg-[#121212]"
      style={{ flex: 1, backgroundColor: screenBg }}
      edges={['top']}
    >
      {/* Top Header */}
      <View
        style={{
          backgroundColor: headerBg,
          borderBottomWidth: 1,
          borderBottomColor: headerBorder,
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 12,
        }}
        className="px-4 pt-2 pb-3 bg-white dark:bg-[#1E1E1E] border-b border-[#E1E4E8] dark:border-neutral-800"
      >
        <Text
          style={{ fontSize: 24, fontWeight: '800', color: textColor }}
          className="text-2xl font-extrabold text-[#11181C] dark:text-[#ECEDEE]"
        >
          Profile
        </Text>
      </View>

      {/* Main Profile View */}
      <ProfileView />
    </SafeAreaView>
  );
}
