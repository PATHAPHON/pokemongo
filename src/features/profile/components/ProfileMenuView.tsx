import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface ProfileMenuViewProps {
  isDark?: boolean;
  onEdit?: () => void;
  onLogout: () => void;
  caughtCount?: number;
  favoritesCount?: number;
}

export function ProfileMenuView({
  onLogout,
  caughtCount = 24,
  favoritesCount = 12,
}: ProfileMenuViewProps) {
  const router = useRouter();
  const cardBg = '#FFFFFF';
  const borderColor = '#FEE2E2';
  const textColor = '#0F172A';
  const subTextColor = '#64748B';
  const iconBoxBg = '#FEF2F2';
  const dividerColor = '#F1F5F9';

  return (
    <View style={styles.wrapper}>
      {/* Grouped Action Card matching Mockup Card 3 */}
      <View
        style={[
          styles.menuCard,
          {
            backgroundColor: cardBg,
            borderColor,
            shadowOpacity: 0.05,
          },
        ]}
      >
        {/* Row 1: My Resume / Pokémon Bag */}
        <TouchableOpacity
          style={styles.menuRow}
          onPress={() => router.push('/bag' as any)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="My Resume กระเป๋าโปเกมอน"
        >
          <View style={[styles.iconBox, { backgroundColor: iconBoxBg }]}>
            <Ionicons name="chatbubble-ellipses-outline" size={19} color="#EE1515" />
          </View>
          <Text style={[styles.menuTitle, { color: textColor }]}>
            My Resume
          </Text>
          <Text style={[styles.badgeText, { color: '#EE1515' }]}>
            85% Complete
          </Text>
          <Ionicons name="chevron-forward" size={17} color={subTextColor} />
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: dividerColor }]} />

        {/* Row 2: Saved Jobs / Saved Events */}
        <TouchableOpacity
          style={styles.menuRow}
          onPress={() => router.push('/(tabs)/pokemon' as any)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Saved Jobs กิจกรรมที่บันทึกไว้"
        >
          <View style={[styles.iconBox, { backgroundColor: '#FFFDF0' }]}>
            <Ionicons name="bookmark-outline" size={19} color="#F59E0B" />
          </View>
          <Text style={[styles.menuTitle, { color: textColor }]}>
            Saved Jobs
          </Text>
          <Text style={[styles.badgeCount, { color: '#B45309' }]}>
            {favoritesCount}
          </Text>
          <Ionicons name="chevron-forward" size={17} color={subTextColor} />
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: dividerColor }]} />

        {/* Row 3: Notifications / Admin & Permissions */}
        <TouchableOpacity
          style={styles.menuRow}
          onPress={() => router.push('/profile/admin' as any)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Notifications การแจ้งเตือนและสิทธิ์ระบบ"
        >
          <View style={[styles.iconBox, { backgroundColor: iconBoxBg }]}>
            <Ionicons name="notifications-outline" size={19} color="#EE1515" />
          </View>
          <Text style={[styles.menuTitle, { color: textColor }]}>
            Notifications
          </Text>
          <Ionicons name="chevron-forward" size={17} color={subTextColor} />
        </TouchableOpacity>
      </View>

      {/* Logout Action */}
      <TouchableOpacity
        style={[
          styles.logoutButton,
          {
            backgroundColor: '#FEF2F2',
            borderColor: '#FEE2E2',
          },
        ]}
        onPress={onLogout}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="ออกจากระบบเทรนเนอร์"
      >
        <Ionicons name="log-out-outline" size={18} color="#EE1515" />
        <Text style={styles.logoutText}>ออกจากระบบ (Logout)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 16,
  },
  menuCard: {
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  badgeCount: {
    fontSize: 14,
    fontWeight: '700',
    marginRight: 2,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 18,
    gap: 8,
    marginTop: 4,
  },
  logoutText: {
    color: '#E53E3E',
    fontSize: 15,
    fontWeight: '700',
  },
});
