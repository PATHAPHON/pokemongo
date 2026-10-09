import { ScrollView, StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AdminConsoleView } from '@/features/profile';

export default function AdminScreen() {
  const router = useRouter();
  const screenBg = '#F8FAFC';
  const textColor = '#0F172A';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screenBg }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="ย้อนกลับไปหน้าโปรไฟล์">
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Admin Console</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AdminConsoleView isDark={false} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
});
