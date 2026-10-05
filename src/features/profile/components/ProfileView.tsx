import {
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useTrainer } from '@/shared/context/trainer-context';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { TrainerHeaderCard } from './TrainerHeaderCard';
import { ProfileMenuView } from './ProfileMenuView';
import { ProfileEditModal } from './ProfileEditModal';
import { useState } from 'react';

export function ProfileView() {
  const { trainer, logout, updateTrainer } = useTrainer();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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
