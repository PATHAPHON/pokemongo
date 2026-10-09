import {
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  View,
  Text,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTrainer } from '@/shared/context/trainer-context';
import { useFavorites } from '@/shared/context/event-context';
import { TrainerHeaderCard } from './TrainerHeaderCard';
import { ProfileMenuView } from './ProfileMenuView';
import { ProfileEditModal } from './ProfileEditModal';
import { useState } from 'react';

export function ProfileView() {
  const router = useRouter();
  const { trainer, caughtPokemon, logout, updateTrainer } = useTrainer();
  const { favorites } = useFavorites();

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

  const bannerBg = '#FEF2F2';
  const watermarkColor = 'rgba(238, 21, 21, 0.08)';

  return (
    <View style={styles.screen}>
      {/* Ambient Top Decorative Banner matching mockup */}
      <View style={[styles.topBanner, { backgroundColor: bannerBg }]}>
        <Text
          style={[styles.bannerWatermark, { color: watermarkColor }]}
          accessible={false}
        >
          Pokémon
        </Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Card 1: Trainer Profile Card with Squircle Avatar & Striped Progress */}
        <TrainerHeaderCard
          trainer={trainer}
          isDark={false}
          onEdit={() => setEditVisible(true)}
        />

        {/* Card 2: Action & Menu List (3 Rows) */}
        <ProfileMenuView
          isDark={false}
          onEdit={() => setEditVisible(true)}
          onLogout={handleLogout}
          caughtCount={caughtPokemon?.length || 24}
          favoritesCount={favorites?.length ?? 12}
        />

        {/* Edit Profile Modal */}
        <ProfileEditModal
          visible={editVisible}
          trainer={trainer}
          isDark={false}
          onClose={() => setEditVisible(false)}
          onSave={updateTrainer}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    position: 'relative',
  },
  topBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerWatermark: {
    fontSize: 52,
    fontWeight: '900',
    letterSpacing: 2,
    transform: [{ translateY: -15 }],
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
  },
});
