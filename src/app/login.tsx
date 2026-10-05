import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTrainer } from '@/shared/context/trainer-context';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';

export default function LoginScreen() {
  const { login, register } = useTrainer();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const screenBg = isDark ? '#121212' : '#F4F6F8';
  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const subTextColor = isDark ? '#9BA1A6' : '#687076';
  const inputBg = isDark ? '#2A2A2A' : '#F1F3F5';
  const borderColor = isDark ? '#3E3E3E' : '#E2E8F0';

  const handleSubmit = async () => {
    setErrorMessage(null);
    if (!username.trim() || !password.trim()) {
      setErrorMessage('กรุณากรอกชื่อผู้ใช้และรหัสผ่านให้ครบถ้วน');
      return;
    }

    try {
      setIsSubmitting(true);
      if (mode === 'login') {
        const res = await login(username, password);
        if (!res.success) {
          setErrorMessage(res.error || 'เข้าสู่ระบบไม่สำเร็จ');
        }
      } else {
        const res = await register(username, password, '', '');
        if (!res.success) {
          setErrorMessage(res.error || 'ลงทะเบียนไม่สำเร็จ');
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screenBg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Brand Header */}
          <View style={styles.brandContainer}>
            <View style={styles.pokeballBadge}>
              <Ionicons name="sparkles" size={36} color="#EE1515" />
            </View>
            <Text style={[styles.brandTitle, { color: textColor }]}>
              POKÉMON EVENTS
            </Text>
            <Text style={[styles.brandSubtitle, { color: subTextColor }]}>
              Campus Events & Trainer Club Authentication
            </Text>
          </View>

          {/* Auth Card */}
          <View
            style={[
              styles.card,
              { backgroundColor: cardBg, borderColor: borderColor },
            ]}
          >
            {/* Mode Switcher Tabs */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  mode === 'login' && styles.activeTabButton,
                ]}
                onPress={() => {
                  setMode('login');
                  setErrorMessage(null);
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    mode === 'login'
                      ? styles.activeTabText
                      : { color: subTextColor },
                  ]}
                >
                  เข้าสู่ระบบ
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabButton,
                  mode === 'register' && styles.activeTabButton,
                ]}
                onPress={() => {
                  setMode('register');
                  setErrorMessage(null);
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    mode === 'register'
                      ? styles.activeTabText
                      : { color: subTextColor },
                  ]}
                >
                  ลงทะเบียน
                </Text>
              </TouchableOpacity>
            </View>

            {/* Error Banner */}
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color="#FF3B30" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Input: Username */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: textColor }]}>
                ชื่อเทรนเนอร์ (Username)
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  { backgroundColor: inputBg, borderColor },
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={18}
                  color={subTextColor}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  placeholder="เช่น AshKetchum หรือ Red"
                  placeholderTextColor={subTextColor}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={username}
                  onChangeText={setUsername}
                  editable={!isSubmitting}
                />
              </View>
            </View>

            {/* Input: Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: textColor }]}>
                รหัสผ่าน (Password)
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  { backgroundColor: inputBg, borderColor },
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={subTextColor}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  placeholder="รหัสผ่านอย่างน้อย 4 ตัวอักษร"
                  placeholderTextColor={subTextColor}
                  secureTextEntry
                  autoCapitalize="none"
                  value={password}
                  onChangeText={setPassword}
                  editable={!isSubmitting}
                />
              </View>
            </View>


            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                isSubmitting && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {mode === 'login' ? 'เข้าสู่ระบบ (Login)' : 'สมัครสมาชิกนิสิต (Register)'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Help Hint */}
            <Text style={[styles.hintText, { color: subTextColor }]}>
              {mode === 'login'
                ? 'ยังไม่มีบัญชี? กดแท็บ "ลงทะเบียน" เพื่อเข้าร่วมกิจกรรมและรับ Starter Pikachu'
                : 'เมื่อลงทะเบียนสำเร็จ ระบบจะสร้างโปรไฟล์นักศึกษาและแจก Starter Pikachu ทันที'}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingVertical: 32,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  pokeballBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  brandSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTabButton: {
    backgroundColor: '#EE1515',
    shadowColor: '#EE1515',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#EE1515',
    borderRadius: 14,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#EE1515',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  hintText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 16,
    lineHeight: 18,
  },
});
