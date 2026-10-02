import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TrainerProfile } from '@/shared/types';
import { useTrainer } from '@/shared/context/trainer-context';

interface TrainerHeaderCardProps {
  trainer: TrainerProfile | null;
  isDark: boolean;
  caughtCount?: number;
}

const TEAM_META: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  valor: { label: 'Team Valor', color: '#EF4444', bg: 'rgba(239,68,68,0.15)', icon: '🔥' },
  mystic: { label: 'Team Mystic', color: '#3B82F6', bg: 'rgba(59,130,246,0.15)', icon: '❄️' },
  instinct: { label: 'Team Instinct', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', icon: '⚡' },
  none: { label: 'No Team', color: '#6B7280', bg: 'rgba(107,114,128,0.15)', icon: '◌' },
};

export function TrainerHeaderCard({ trainer, isDark, caughtCount }: TrainerHeaderCardProps) {
  const { caughtPokemon } = useTrainer();
  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const borderColor = isDark ? '#2C2C2E' : '#E5E7EB';
  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const subTextColor = isDark ? '#9BA1A6' : '#687076';

  const team = TEAM_META[trainer?.team || 'none'] || TEAM_META.none;
  const level = trainer?.level ?? 1;
  const exp = trainer?.experience ?? 0;
  const nextExp = trainer?.nextLevelExperience ?? 1000;
  const progress = nextExp > 0 ? Math.min(1, exp / nextExp) : 0;
  const caught = caughtCount ?? caughtPokemon.length;
  const stardust = trainer?.stardust ?? 0;
  const coins = trainer?.pokeCoins ?? 0;

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

      <View style={styles.xpRow}>
        <Text style={[styles.xpLabel, { color: subTextColor }]}>
          XP {exp} / {nextExp}
        </Text>
        <Text style={[styles.xpLabel, { color: subTextColor }]}>
          {Math.round(progress * 100)}%
        </Text>
      </View>
      <View style={styles.xpTrack}>
        <View style={[styles.xpFill, { width: `${Math.round(progress * 100)}%` }]} />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statEmoji}>🎒</Text>
          <Text style={[styles.statValue, { color: textColor }]}>{caught}</Text>
          <Text style={[styles.statLabel, { color: subTextColor }]}>จับได้</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statEmoji}>✨</Text>
          <Text style={[styles.statValue, { color: textColor }]}>{stardust}</Text>
          <Text style={[styles.statLabel, { color: subTextColor }]}>Stardust</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statEmoji}>🪙</Text>
          <Text style={[styles.statValue, { color: textColor }]}>{coins}</Text>
          <Text style={[styles.statLabel, { color: subTextColor }]}>PokéCoins</Text>
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
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  xpLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  xpTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: '#0A7EA4',
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(128,128,128,0.12)',
    gap: 2,
  },
  statEmoji: {
    fontSize: 16,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
