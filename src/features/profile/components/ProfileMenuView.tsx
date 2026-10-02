import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTrainer } from '@/shared/context/trainer-context';

interface ProfileMenuViewProps {
  isDark: boolean;
  onEdit: () => void;
  onAdmin: () => void;
  onLogout: () => void;
}

export function ProfileMenuView({
  isDark,
  onEdit,
  onAdmin,
  onLogout,
}: ProfileMenuViewProps) {
  const router = useRouter();
  const { caughtPokemon } = useTrainer();
  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const borderColor = isDark ? '#2C2C2E' : '#E5E7EB';
  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const subTextColor = isDark ? '#9BA1A6' : '#687076';

  const items = [
    {
      key: 'edit',
      icon: 'pencil-outline' as const,
      title: 'แก้ไขข้อมูลโปรไฟล์',
      subtitle: 'เปลี่ยนชื่อเทรนเนอร์ / สังกัดทีม',
      onPress: onEdit,
    },
    {
      key: 'bag',
      icon: 'briefcase-outline' as const,
      title: `กระเป๋าโปเกมอน (${caughtPokemon.length})`,
      subtitle: 'ดูรายการโปเกมอนที่จับได้',
      onPress: () => router.push('/bag' as any),
    },
    {
      key: 'events',
      icon: 'ticket-outline' as const,
      title: 'กิจกรรมโปเกมอนของฉัน',
      subtitle: 'ดูรายการที่ลงทะเบียนไว้',
      onPress: () => router.push('/(tabs)/pokemon' as any),
    },
    {
      key: 'admin',
      icon: 'settings-outline' as const,
      title: 'สิทธิ์การใช้งานแอป & ผู้ดูแลระบบ (Admin Console)',
      subtitle: 'GPS / แจ้งเตือน / กล้อง / ทดสอบระบบ',
      onPress: onAdmin,
    },
  ];

  return (
    <View style={{ gap: 10 }}>
      {items.map((item) => (
        <TouchableOpacity
          key={item.key}
          style={[styles.row, { backgroundColor: cardBg, borderColor }]}
          onPress={item.onPress}
          activeOpacity={0.8}
        >
          <Ionicons name={item.icon} size={22} color="#0A7EA4" />
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: textColor }]}>
              {item.title}
            </Text>
            <Text style={[styles.subtitle, { color: subTextColor }]}>
              {item.subtitle}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={subTextColor} />
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={onLogout}
        activeOpacity={0.8}
      >
        <Ionicons
          name="log-out-outline"
          size={20}
          color="#FFFFFF"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.logoutText}>ออกจากระบบ (Logout)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3B30',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 10,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
