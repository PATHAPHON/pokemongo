import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEventContext } from '@/shared/context/event-context';
import { useTrainer } from '@/shared/context/trainer-context';
import { EventImagePicker } from '@/features/events';
import { getPokemonMetaById } from '@/shared/services/pokemon-registry';
import {
  formatPokemonId,
  capitalizePokemonName,
} from '@/shared/constants/kanto-pokemon';
import {
  EMAIL_REGEX,
  validateRegistrationForm,
  type RegistrationFieldErrors,
} from '@/shared/utils/event-helpers';

export { EMAIL_REGEX };

export default function EventRegisterScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const screenBg = '#F8FAFC';
  const cardBg = '#FFFFFF';
  const textColor = '#11181C';
  const subTextColor = '#687076';
  const inputBg = '#F1F3F5';
  const borderColor = '#E5E7EB';

  const { events, registerEvent } = useEventContext();
  const { trainer } = useTrainer();

  const event = events.find((e) => e.id === id);

  const [fullName, setFullName] = useState(trainer?.name || '');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState(trainer?.studentId || '');
  const [notes, setNotes] = useState('');
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [agreed, setAgreed] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<RegistrationFieldErrors>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (trainer?.name && !fullName) {
      setFullName(trainer.name);
    }
    if (trainer?.studentId && !studentId) {
      setStudentId(trainer.studentId);
    }
  }, [trainer]);

  if (!event) {
    return (
      <SafeAreaView style={[styles.centerScreen, { backgroundColor: screenBg }]}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={[styles.errorTitle, { color: textColor }]}>
          ไม่พบข้อมูลกิจกรรม
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>ย้อนกลับ</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleSubmit = async () => {
    setErrorMessage(null);

    const validation = validateRegistrationForm({ fullName, email });
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }
    setFieldErrors({});

    if (!agreed) {
      setErrorMessage('กรุณายอมรับเงื่อนไขการเข้าร่วมกิจกรรม');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await registerEvent(event.id, notes.trim() || undefined, photoUri);

      if (res.success) {
        try {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          );
        } catch {
          // Ignore haptic errors on web/simulators
        }

        router.replace('/(tabs)/pokemon' as any);
      } else {
        setErrorMessage(res.error || 'เกิดข้อผิดพลาดในการลงทะเบียน');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'ไม่สามารถลงทะเบียนได้ กรุณาลองใหม่');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screenBg }]}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => router.back()}
          disabled={isSubmitting}
          accessibilityLabel="ปิดหน้าลงทะเบียน"
        >
          <Ionicons name="close" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          แบบฟอร์มลงทะเบียน
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Event Summary Card */}
          <View style={[styles.eventSummaryCard, { backgroundColor: cardBg, borderColor }]}>
            <View style={styles.badgeRow}>
              <View style={styles.eventDot} />
              <Text style={styles.eventCatText}>
                POKÉMON MEETUP • #{formatPokemonId(event.featuredPokemonId)} {capitalizePokemonName(getPokemonMetaById(event.featuredPokemonId)?.name || 'Pokemon')}
              </Text>
            </View>
            <Text style={[styles.eventTitle, { color: textColor }]}>
              {event.title}
            </Text>
            <View style={styles.summaryMetaRow}>
              <Ionicons name="location-outline" size={14} color="#EF4444" />
              <Text style={[styles.summaryMetaText, { color: subTextColor }]}>
                {event.location.name}
              </Text>
            </View>
          </View>

          {/* User Info / Form Inputs */}
          <View style={[styles.formCard, { backgroundColor: cardBg, borderColor }]}>
            <Text style={[styles.sectionHeading, { color: textColor }]}>
              ข้อมูลผู้สมัคร
            </Text>

            {/* Full Name */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: subTextColor }]}>
                ชื่อ-นามสกุล <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: inputBg, color: textColor, borderColor },
                  fieldErrors.fullName ? styles.inputError : null,
                ]}
                placeholder="ระบุชื่อ-นามสกุล (อย่างน้อย 2 ตัวอักษร)"
                placeholderTextColor={subTextColor}
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  if (fieldErrors.fullName) {
                    setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
                  }
                }}
                editable={!isSubmitting}
                autoCorrect={false}
              />
              {fieldErrors.fullName ? (
                <Text style={styles.fieldErrorText}>{fieldErrors.fullName}</Text>
              ) : null}
            </View>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: subTextColor }]}>
                อีเมล <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: inputBg, color: textColor, borderColor },
                  fieldErrors.email ? styles.inputError : null,
                ]}
                placeholder="example@university.ac.th"
                placeholderTextColor={subTextColor}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isSubmitting}
              />
              {fieldErrors.email ? (
                <Text style={styles.fieldErrorText}>{fieldErrors.email}</Text>
              ) : null}
            </View>

            {/* Student ID */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: subTextColor }]}>
                รหัสนักศึกษา (ไม่บังคับ)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: inputBg, color: textColor, borderColor },
                ]}
                placeholder="เช่น 65010001"
                placeholderTextColor={subTextColor}
                value={studentId}
                onChangeText={setStudentId}
                keyboardType="numeric"
                editable={!isSubmitting}
              />
            </View>

            {trainer?.faculty && (
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: subTextColor }]}>
                  คณะ / ภาควิชา
                </Text>
                <Text style={[styles.fieldValue, { color: textColor }]}>
                  {trainer.faculty}
                </Text>
              </View>
            )}
          </View>

          {/* Optional Notes / Questions */}
          <View style={[styles.formCard, { backgroundColor: cardBg, borderColor }]}>
            <Text style={[styles.sectionHeading, { color: textColor }]}>
              ข้อความเพิ่มเติม หรือความต้องการพิเศษ
            </Text>
            <TextInput
              style={[
                styles.textArea,
                { backgroundColor: inputBg, color: textColor, borderColor },
              ]}
              placeholder="ระบุคำถามล่วงหน้า, การแพ้อาหาร, หรือข้อความถึงผู้จัดงาน (ไม่บังคับ)"
              placeholderTextColor={subTextColor}
              multiline
              numberOfLines={3}
              value={notes}
              onChangeText={setNotes}
              editable={!isSubmitting}
            />
          </View>

          {/* Photo / ID Upload Section */}
          <View style={[styles.formCard, { backgroundColor: cardBg, borderColor }]}>
            <EventImagePicker
              photoUri={photoUri}
              onPhotoSelected={setPhotoUri}
              isDark={false}
            />
          </View>

          {/* Agreement Checkbox */}
          <TouchableOpacity
            style={styles.agreementRow}
            onPress={() => !isSubmitting && setAgreed(!agreed)}
            activeOpacity={0.8}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: agreed }}
            disabled={isSubmitting}
          >
            <Ionicons
              name={agreed ? 'checkbox' : 'square-outline'}
              size={22}
              color={agreed ? '#8B5CF6' : subTextColor}
            />
            <Text style={[styles.agreementText, { color: textColor }]}>
              ฉันยืนยันจะเข้าร่วมกิจกรรมตรงเวลา และปฏิบัติตามกฎของสถานที่
            </Text>
          </TouchableOpacity>

          {/* Error Message */}
          {errorMessage && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color="#EF4444" />
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                ยืนยันการลงทะเบียน
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
    borderBottomWidth: 1,
  },
  closeBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
    paddingBottom: 40,
  },
  centerScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  backButton: {
    backgroundColor: '#EE1515',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  eventSummaryCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EE1515',
  },
  eventCatText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EE1515',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  summaryMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  summaryMetaText: {
    fontSize: 13,
    fontWeight: '500',
  },
  formCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
  },
  fieldGroup: {
    gap: 2,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  fieldValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  fieldErrorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  requiredAsterisk: {
    color: '#EF4444',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 4,
  },
  agreementText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    lineHeight: 18,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  errorBannerText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#EE1515',
    height: 52,
    borderRadius: 16,
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
});
