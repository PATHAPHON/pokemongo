import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TrainerProfile } from '@/shared/types';

interface TrainerHeaderCardProps {
  trainer: TrainerProfile | null;
  isDark: boolean;
}

export function TrainerHeaderCard({ trainer, isDark }: TrainerHeaderCardProps) {
  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const borderColor = isDark ? '#2C2C2E' : '#E5E7EB';
  const textColor = isDark ? '#ECEDEE' : '#11181C';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: cardBg,
          borderColor,
          shadowOpacity: isDark ? 0.25 : 0.06,
        },
      ]}
    >
      <View
        style={[
          styles.avatarContainer,
          {
            backgroundColor: isDark
              ? 'rgba(10, 126, 164, 0.25)'
              : 'rgba(10, 126, 164, 0.12)',
          },
        ]}
      >
        <Ionicons name="person" size={44} color="#0A7EA4" />
      </View>

      <Text style={[styles.trainerName, { color: textColor }]}>
        {trainer?.name || 'Trainer'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#0A7EA4',
  },
  trainerName: {
    fontSize: 22,
    fontWeight: '800',
  },
});
