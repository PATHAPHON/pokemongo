import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTrainer } from '@/shared/context/trainer-context';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { TrainerHeaderCard } from './TrainerHeaderCard';
import { ProfileMenuView } from './ProfileMenuView';
import { AdminConsoleView } from './AdminConsoleView';
import { ProfileEditModal } from './ProfileEditModal';

type ProfileTab = 'profile' | 'admin';

export function ProfileView() {
  const { trainer, logout, updateTrainer } = useTrainer();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [tab, setTab] = useState<ProfileTab>('profile');
  const [editVisible, setEditVisible] = useState(false);

  const handleLogout = () => {
    Alert.alert('ออกจากระบบ', 'คุณต้องการออกจากระบบเทรนเนอร์ใช่หรือไม่?', [
      { text: 'ยกเลิก', style: 'cancel' },
      {
        text: 'ออกจากระบบ',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const goAdminRoute = () => {
    router.push('/profile/admin' as any);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          styles.tabContainer,
          { backgroundColor: isDark ? '#1E1E1E' : '#E5E7EB' },
        ]}
      >
        <TouchableOpacity
          style={[styles.tabButton, tab === 'profile' && styles.activeTab]}
          onPress={() => setTab('profile')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityState={{ selected: tab === 'profile' }}
        >
          <Text style={[styles.tabText, tab === 'profile' && styles.activeTabText]}>
            👤 ข้อมูลโปรไฟล์
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, tab === 'admin' && styles.activeTab]}
          onPress={() => setTab('admin')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityState={{ selected: tab === 'admin' }}
        >
          <Text style={[styles.tabText, tab === 'admin' && styles.activeTabText]}>
            ⚙️ แอดมิน (Admin)
          </Text>
        </TouchableOpacity>
      </View>

      {tab === 'profile' ? (
        <>
          <TrainerHeaderCard trainer={trainer} isDark={isDark} />
          <ProfileMenuView
            isDark={isDark}
            onEdit={() => setEditVisible(true)}
            onAdmin={() => setTab('admin')}
            onLogout={handleLogout}
          />
          <TouchableOpacity onPress={goAdminRoute} activeOpacity={0.7} style={styles.linkRow}>
            <Text style={styles.linkText}>เปิดหน้า Admin แบบเต็มจอ →</Text>
          </TouchableOpacity>
        </>
      ) : (
        <AdminConsoleView isDark={isDark} />
      )}

      <ProfileEditModal
        visible={editVisible}
        trainer={trainer}
        isDark={isDark}
        onClose={() => setEditVisible(false)}
        onSave={updateTrainer}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#0A7EA4',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#687076',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  linkRow: {
    alignItems: 'center',
    marginTop: 14,
  },
  linkText: {
    color: '#0A7EA4',
    fontSize: 13,
    fontWeight: '700',
  },
});
