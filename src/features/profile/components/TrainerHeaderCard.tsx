import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TrainerProfile } from '@/shared/types';

interface TrainerHeaderCardProps {
  trainer: TrainerProfile | null;
  isDark?: boolean;
  onEdit?: () => void;
}

const DEFAULT_AVATAR = require('../../../../assets/images/avatar.png');

/**
 * Diagonal hatch pattern component for progress bar unfilled state
 */
function DiagonalStripesPattern({ isDark: _isDark }: { isDark?: boolean }) {
  const stripeColor = 'rgba(238, 21, 21, 0.15)';
  const bgColor = '#FEF2F2';

  return (
    <View style={[styles.stripesContainer, { backgroundColor: bgColor }]}>
      {Array.from({ length: 28 }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.stripeLine,
            {
              backgroundColor: stripeColor,
              left: index * 7 - 10,
            },
          ]}
        />
      ))}
    </View>
  );
}

export function TrainerHeaderCard({ trainer, onEdit }: TrainerHeaderCardProps) {
  const cardBg = '#FFFFFF';
  const borderColor = '#FEE2E2';
  const textColor = '#0F172A';
  const subTextColor = '#64748B';

  const name = trainer?.name || 'Alex Morgan';
  const program = trainer?.program || trainer?.faculty || 'Product Designer';
  const email = `${name.toLowerCase().replace(/\s+/g, '.')}@email.com`;
  const location = 'San Francisco, CA';

  // Calculate or default progress percentage matching mockup's 85%
  const progressPercent = 85;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: cardBg,
          borderColor,
          shadowOpacity: 0.05,
        },
      ]}
    >
      {/* Top Profile Section */}
      <View style={styles.topRow}>
        {/* Squircle Avatar */}
        <TouchableOpacity
          style={[styles.avatarWrapper, { backgroundColor: '#FEF2F2' }]}
          onPress={onEdit}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="แก้ไขรูปโปรไฟล์"
        >
          <Image
            source={trainer?.avatarUrl ? { uri: trainer.avatarUrl } : DEFAULT_AVATAR}
            style={styles.avatarImage}
            resizeMode="cover"
            accessible={true}
            accessibilityRole="image"
            accessibilityLabel={`ภาพโปรไฟล์ของ ${name}`}
          />
        </TouchableOpacity>

        {/* Profile Info */}
        <View style={styles.infoCol}>
          <View style={styles.nameHeaderRow}>
            <Text style={[styles.nameText, { color: textColor }]} numberOfLines={1}>
              {name}
            </Text>
            {onEdit && (
              <TouchableOpacity
                onPress={onEdit}
                style={styles.editIconButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="แก้ไขโปรไฟล์"
              >
                <Ionicons name="pencil-outline" size={16} color={subTextColor} />
              </TouchableOpacity>
            )}
          </View>

          <Text style={[styles.programText, { color: subTextColor }]} numberOfLines={1}>
            {program}
          </Text>

          {/* Email & Location Meta */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="mail-outline" size={13} color={subTextColor} />
              <Text style={[styles.metaText, { color: subTextColor }]} numberOfLines={1}>
                {email}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={13} color={subTextColor} />
              <Text style={[styles.metaText, { color: subTextColor }]} numberOfLines={1}>
                {location}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Progress Section */}
      <View style={styles.progressSection}>
        <View style={styles.progressLabelRow}>
          <Text style={[styles.progressTitle, { color: textColor }]}>
            Resume Completion
          </Text>
          <Text style={[styles.progressPercent, { color: '#EE1515' }]}>
            {progressPercent}%
          </Text>
        </View>

        {/* Striped Progress Bar */}
        <View style={[styles.progressBarTrack, { backgroundColor: '#FEF2F2' }]}>
          {/* Filled portion */}
          <View
            style={[
              styles.progressBarFill,
              { width: `${progressPercent}%`, backgroundColor: '#EE1515' },
            ]}
          />
          {/* Unfilled striped portion */}
          <View style={styles.progressBarUnfilled}>
            <DiagonalStripesPattern isDark={false} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
    gap: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarWrapper: {
    width: 78,
    height: 78,
    borderRadius: 20,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  infoCol: {
    flex: 1,
    gap: 3,
  },
  nameHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameText: {
    fontSize: 20,
    fontWeight: '800',
    flex: 1,
  },
  editIconButton: {
    padding: 4,
  },
  programText: {
    fontSize: 13,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '500',
  },
  progressSection: {
    gap: 8,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 18,
    borderRadius: 9999,
    overflow: 'hidden',
    flexDirection: 'row',
    position: 'relative',
  },
  progressBarFill: {
    height: '100%',
    borderTopLeftRadius: 9999,
    borderBottomLeftRadius: 9999,
  },
  progressBarUnfilled: {
    flex: 1,
    height: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  stripesContainer: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  stripeLine: {
    position: 'absolute',
    top: -10,
    width: 2,
    height: 40,
    transform: [{ rotate: '45deg' }],
  },
});
