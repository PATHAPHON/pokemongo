import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PermissionDetail } from '../hooks/use-app-permissions';

interface PermissionCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  title: string;
  subtitle: string;
  permission: PermissionDetail;
  onPress: () => void;
  isDark?: boolean;
}

export function PermissionCard({
  icon,
  iconBg,
  title,
  subtitle,
  permission,
  onPress,
}: PermissionCardProps) {
  const isGranted = permission.granted;
  const cardBg = '#FFFFFF';
  const borderColor = '#FEE2E2';
  const textColor = '#0F172A';
  const subTextColor = '#64748B';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: cardBg,
          borderColor,
          shadowOpacity: 0.04,
        },
      ]}
    >
      <View style={styles.contentRow}>
        <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={24} color="#FFFFFF" />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: textColor }]}>{title}</Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: isGranted
                    ? 'rgba(52, 199, 89, 0.15)'
                    : 'rgba(238, 21, 21, 0.12)',
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: isGranted ? '#16A34A' : '#EE1515' },
                ]}
              >
                {isGranted ? 'อนุญาตแล้ว' : 'ยังไม่อนุญาต'}
              </Text>
            </View>
          </View>

          <Text
            style={[styles.subtitle, { color: subTextColor }]}
            numberOfLines={2}
          >
            {subtitle}
          </Text>
        </View>

        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.7}
          style={[
            styles.actionButton,
            {
              backgroundColor: isGranted ? '#F1F5F9' : '#EE1515',
            },
          ]}
        >
          <Text
            style={[
              styles.actionButtonText,
              {
                color: isGranted ? '#64748B' : '#FFFFFF',
              },
            ]}
          >
            {isGranted ? 'เปลี่ยน' : 'ขอสิทธิ์'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 3,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
