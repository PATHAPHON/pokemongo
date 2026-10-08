import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TrainerProfile } from '@/shared/types';

interface TrainerHeaderCardProps {
  trainer: TrainerProfile | null;
  isDark: boolean;
}

const DEFAULT_AVATAR = require('../../../../assets/images/avatar.png');

export function TrainerHeaderCard({ trainer, isDark }: TrainerHeaderCardProps) {
  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const borderColor = isDark ? '#2C2C2E' : '#E5E7EB';
  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const subTextColor = isDark ? '#9BA1A6' : '#687076';

  const level = trainer?.level ?? 1;
  const program = trainer?.program || trainer?.faculty || 'Computer and Information Science';
  const studentId = trainer?.studentId || '65010001';
  const interests = trainer?.interests && trainer.interests.length > 0
    ? trainer.interests
    : ['Campus events', 'Mobile UX', 'Pokémon GO'];

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
          <Image
            source={trainer?.avatarUrl ? { uri: trainer.avatarUrl } : DEFAULT_AVATAR}
            style={styles.avatarImage}
            resizeMode="cover"
            accessible={true}
            accessibilityRole="image"
            accessibilityLabel={`ภาพโปรไฟล์ของ ${trainer?.name || 'เทรนเนอร์'}`}
          />
        </View>
        <View style={styles.nameCol}>
          <Text style={[styles.trainerName, { color: textColor }]}>
            {trainer?.name || 'Trainer'}
          </Text>
          <Text style={[styles.programText, { color: textColor }]}>
            {program}
          </Text>
          <Text style={[styles.studentIdText, { color: subTextColor }]}>
            รหัสนักศึกษา: {studentId} · Level {level}
          </Text>
        </View>
      </View>

      {/* Interests pills */}
      <View style={styles.interestsContainer}>
        <Text style={[styles.interestsLabel, { color: subTextColor }]}>
          ความสนใจ:
        </Text>
        <View style={styles.interestsRow}>
          {interests.map((interest, idx) => (
            <View
              key={idx}
              style={[
                styles.interestChip,
                { backgroundColor: isDark ? '#2C2C2E' : '#F1F3F5', borderColor },
              ]}
            >
              <Text style={[styles.interestText, { color: isDark ? '#ECEDEE' : '#1F2937' }]}>
                #{interest}
              </Text>
            </View>
          ))}
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
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 39,
  },
  programText: {
    fontSize: 14,
    fontWeight: '700',
  },
  studentIdText: {
    fontSize: 12,
    fontWeight: '600',
  },
  interestsContainer: {
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
    gap: 6,
  },
  interestsLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  interestsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  interestChip: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  interestText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
