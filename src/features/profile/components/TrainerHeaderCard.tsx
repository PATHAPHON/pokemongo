import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TrainerProfile } from '@/shared/types';

interface TrainerHeaderCardProps {
  trainer: TrainerProfile | null;
  isDark: boolean;
}

const TEAM_META: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  valor: { label: 'Team Valor', color: '#EF4444', bg: 'rgba(239,68,68,0.15)', icon: '🔥' },
  mystic: { label: 'Team Mystic', color: '#3B82F6', bg: 'rgba(59,130,246,0.15)', icon: '❄️' },
  instinct: { label: 'Team Instinct', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', icon: '⚡' },
  none: { label: 'No Team', color: '#6B7280', bg: 'rgba(107,114,128,0.15)', icon: '◌' },
};

export function TrainerHeaderCard({ trainer, isDark }: TrainerHeaderCardProps) {
  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const borderColor = isDark ? '#2C2C2E' : '#E5E7EB';
  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const subTextColor = isDark ? '#9BA1A6' : '#687076';

  const team = TEAM_META[trainer?.team || 'none'] || TEAM_META.none;
  const level = trainer?.level ?? 1;

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
      <View style={styles.topRow}>
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
        <View style={styles.nameCol}>
          <Text style={[styles.trainerName, { color: textColor }]}>
            {trainer?.name || 'Trainer'}
          </Text>
          <Text style={[styles.levelText, { color: subTextColor }]}>
            Level {level}
          </Text>
          <View
            style={[
              styles.teamBadge,
              { backgroundColor: team.bg, borderColor: team.color },
            ]}
          >
            <Text style={[styles.teamText, { color: team.color }]}>
              {team.icon} {team.label}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarContainer: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#0A7EA4',
  },
  nameCol: {
    flex: 1,
    gap: 4,
  },
  trainerName: {
    fontSize: 22,
    fontWeight: '800',
  },
  levelText: {
    fontSize: 13,
    fontWeight: '600',
  },
  teamBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 2,
  },
  teamText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
