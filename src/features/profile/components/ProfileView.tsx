import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTrainer } from '@/shared/context/trainer-context';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';

export function ProfileView() {
  const { trainer } = useTrainer();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const subTextColor = isDark ? '#9BA1A6' : '#687076';

  return (
    <View
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}
      className="flex-1 items-center justify-center p-6"
    >
      <View
        style={{
          width: 96,
          height: 96,
          borderRadius: 48,
          backgroundColor: isDark ? 'rgba(10, 126, 164, 0.2)' : 'rgba(10, 126, 164, 0.1)',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
        className="w-24 h-24 rounded-full bg-[#0A7EA4]/10 items-center justify-center mb-4"
      >
        <Ionicons name="person" size={48} color="#0A7EA4" />
      </View>
      <Text
        style={{ fontSize: 24, fontWeight: '900', color: textColor }}
        className="text-2xl font-black text-[#11181C] dark:text-[#ECEDEE]"
      >
        {trainer?.name || 'Trainer Profile'}
      </Text>
      <Text
        style={{ fontSize: 14, fontWeight: '500', color: subTextColor, marginTop: 4 }}
        className="text-sm text-[#687076] dark:text-[#9BA1A6] font-medium mt-1"
      >
        Level {trainer?.level || 1} Trainer
      </Text>
    </View>
  );
}
