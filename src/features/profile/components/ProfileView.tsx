import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTrainer } from '@/shared/context/trainer-context';

export function ProfileView() {
  const { trainer } = useTrainer();

  return (
    <View className="flex-1 items-center justify-center p-6" style={{ flex: 1 }}>
      <View className="w-24 h-24 rounded-full bg-[#0A7EA4]/10 items-center justify-center mb-4">
        <Ionicons name="person" size={48} color="#0A7EA4" />
      </View>
      <Text className="text-2xl font-black text-[#11181C] dark:text-[#ECEDEE]">
        {trainer?.name || 'Trainer Profile'}
      </Text>
      <Text className="text-sm text-[#687076] dark:text-[#9BA1A6] font-medium mt-1">
        Level {trainer?.level || 1} Trainer
      </Text>
    </View>
  );
}
