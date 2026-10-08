import {
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTrainer } from '@/shared/context/trainer-context';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { TrainerHeaderCard } from './TrainerHeaderCard';
import { ProfileMenuView } from './ProfileMenuView';
import { ProfileEditModal } from './ProfileEditModal';
import { useState } from 'react';

export function ProfileView() {
  const router = useRouter();
  const { trainer, logout, updateTrainer } = useTrainer();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [editVisible, setEditVisible] = useState(false);

  const performLogout = async () => {
    try {
      await logout();
      router.replace('/login' as any);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('คุณต้องการออกจากระบบเทรนเนอร์ใช่หรือไม่?');
      if (confirmed) {
        performLogout();
      }
      return;
    }

    Alert.alert('ออกจากระบบ', 'คุณต้องการออกจากระบบเทรนเนอร์ใช่หรือไม่?', [
      { text: 'ยกเลิก', style: 'cancel' },
      {
        text: 'ออกจากระบบ',
        style: 'destructive',
        onPress: performLogout,
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <TrainerHeaderCard trainer={trainer} isDark={isDark} />
      <ProfileMenuView
        isDark={isDark}
        onEdit={() => setEditVisible(true)}
        onLogout={handleLogout}
      />

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
});
