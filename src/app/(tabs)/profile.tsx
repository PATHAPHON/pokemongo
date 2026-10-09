import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileView } from '@/features/profile';

export default function ProfileScreen() {
  const topBg = '#FEF2F2';
  const screenBg = '#F8FAFC';

  return (
    <View style={{ flex: 1, backgroundColor: screenBg }}>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: topBg }}
        edges={['top']}
      >
        <View style={{ flex: 1, backgroundColor: screenBg }}>
          {/* Main Profile View */}
          <ProfileView />
        </View>
      </SafeAreaView>
    </View>
  );
}
