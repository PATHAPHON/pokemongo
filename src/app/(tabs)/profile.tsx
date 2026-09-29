import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileView } from '@/features/profile';

export default function ProfileScreen() {
  return (
    <SafeAreaView
      className="flex-1 bg-[#F4F6F8] dark:bg-[#121212]"
      style={{ flex: 1 }}
      edges={['top']}
    >
      {/* Top Header */}
      <View className="px-4 pt-2 pb-3 bg-white dark:bg-[#1E1E1E] border-b border-[#E1E4E8] dark:border-neutral-800">
        <Text className="text-2xl font-extrabold text-[#11181C] dark:text-[#ECEDEE]">
          Profile
        </Text>
      </View>

      {/* Main Profile View */}
      <ProfileView />
    </SafeAreaView>
  );
}
