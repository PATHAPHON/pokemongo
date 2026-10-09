import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Image,
  Alert,
  Linking,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { TrainerProfile } from '@/shared/types';

interface ProfileEditModalProps {
  visible: boolean;
  trainer: TrainerProfile | null;
  isDark?: boolean;
  onClose: () => void;
  onSave: (partial: Partial<TrainerProfile>) => Promise<void>;
}

const DEFAULT_AVATAR = require('../../../../assets/images/avatar.png');

export function ProfileEditModal({ visible, trainer, onClose, onSave }: ProfileEditModalProps) {
  const [name, setName] = useState(trainer?.name || '');
  const [studentId, setStudentId] = useState(trainer?.studentId || '');
  const [program, setProgram] = useState(trainer?.program || trainer?.faculty || '');
  const [interestsText, setInterestsText] = useState((trainer?.interests || ['Campus events', 'Mobile UX']).join(', '));
  const [avatarUri, setAvatarUri] = useState<string | undefined>(trainer?.avatarUrl);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(trainer?.name || '');
      setStudentId(trainer?.studentId || '');
      setProgram(trainer?.program || trainer?.faculty || '');
      setInterestsText((trainer?.interests || ['Campus events', 'Mobile UX']).join(', '));
      setAvatarUri(trainer?.avatarUrl);
    }
  }, [visible, trainer]);

  const cardBg = '#FFFFFF';
  const textColor = '#0F172A';
  const subTextColor = '#64748B';
  const inputBg = '#F8FAFC';

  const pickImageFromGallery = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        if (!permissionResult.canAskAgain) {
          Alert.alert(
            'ต้องการสิทธิ์เข้าถึงรูปภาพ',
            'กรุณาเปิดการอนุญาตเข้าถึงรูปภาพในการตั้งค่าเพื่อเลือกรูปโปรไฟล์',
            [
              { text: 'ยกเลิก', style: 'cancel' },
              { text: 'เปิดการตั้งค่า', onPress: () => Linking.openSettings() },
            ]
          );
        } else {
          Alert.alert(
            'ต้องการสิทธิ์เข้าถึงรูปภาพ',
            'กรุณาอนุญาตการเข้าถึงรูปภาพเพื่อเลือกรูปโปรไฟล์'
          );
        }
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (err: any) {
      console.warn('[ProfileEditModal] Error picking image from gallery:', err);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถเลือกรูปภาพได้');
    }
  };

  const takePhotoWithCamera = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        if (!permissionResult.canAskAgain) {
          Alert.alert(
            'ต้องการสิทธิ์เข้าถึงกล้อง',
            'กรุณาเปิดการอนุญาตเข้าถึงกล้องในการตั้งค่าเพื่อถ่ายรูปโปรไฟล์',
            [
              { text: 'ยกเลิก', style: 'cancel' },
              { text: 'เปิดการตั้งค่า', onPress: () => Linking.openSettings() },
            ]
          );
        } else {
          Alert.alert(
            'ต้องการสิทธิ์เข้าถึงกล้อง',
            'กรุณาอนุญาตการเข้าถึงกล้องเพื่อถ่ายรูปโปรไฟล์'
          );
        }
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (err: any) {
      console.warn('[ProfileEditModal] Error taking photo with camera:', err);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถถ่ายรูปได้');
    }
  };

  const handleAvatarOptions = () => {
    const options: any[] = [
      { text: 'ถ่ายรูปใหม่ด้วยกล้อง', onPress: takePhotoWithCamera },
      { text: 'เลือกจากคลังรูปภาพ', onPress: pickImageFromGallery },
    ];

    if (avatarUri) {
      options.push({
        text: 'ลบรูปโปรไฟล์ (ใช้ค่าเริ่มต้น)',
        style: 'destructive',
        onPress: () => setAvatarUri(undefined),
      });
    }

    options.push({ text: 'ยกเลิก', style: 'cancel' });

    Alert.alert('รูปโปรไฟล์', 'เลือกวิธีการเปลี่ยนรูปโปรไฟล์เทรนเนอร์', options);
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      const parsedInterests = interestsText
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      await onSave({
        name: trimmed,
        studentId: studentId.trim() || undefined,
        faculty: program.trim() || undefined,
        program: program.trim() || undefined,
        interests: parsedInterests.length > 0 ? parsedInterests : ['Campus events', 'Mobile UX'],
        avatarUrl: avatarUri,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: textColor }]}>แก้ไขข้อมูลโปรไฟล์</Text>
            <TouchableOpacity onPress={onClose} accessibilityLabel="ปิด">
              <Ionicons name="close" size={22} color={textColor} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Avatar section */}
            <View style={styles.avatarSection}>
              <TouchableOpacity
                style={styles.avatarWrapper}
                onPress={handleAvatarOptions}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="เปลี่ยนรูปโปรไฟล์"
              >
                <Image
                  source={avatarUri ? { uri: avatarUri } : DEFAULT_AVATAR}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
                <View style={[styles.cameraBadge, { borderColor: cardBg }]}>
                  <Ionicons name="camera" size={14} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAvatarOptions}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="แตะเพื่อเปลี่ยนรูปโปรไฟล์"
              >
                <Text style={styles.changePhotoText}>แตะเพื่อเปลี่ยนรูปโปรไฟล์</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { color: subTextColor }]}>ชื่อเทรนเนอร์ / นักศึกษา</Text>
            <TextInput
              style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
              value={name}
              onChangeText={setName}
              placeholder="ชื่อเล่นเทรนเนอร์"
              placeholderTextColor={subTextColor}
              maxLength={30}
            />

            <Text style={[styles.label, { color: subTextColor }]}>รหัสนักศึกษา</Text>
            <TextInput
              style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
              value={studentId}
              onChangeText={setStudentId}
              placeholder="เช่น 65010001"
              placeholderTextColor={subTextColor}
              maxLength={20}
            />

            <Text style={[styles.label, { color: subTextColor }]}>คณะ / สาขาวิชา (Program)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
              value={program}
              onChangeText={setProgram}
              placeholder="เช่น Computer and Information Science"
              placeholderTextColor={subTextColor}
              maxLength={50}
            />

            <Text style={[styles.label, { color: subTextColor }]}>ความสนใจ (คั่นด้วยจุลภาค ,)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
              value={interestsText}
              onChangeText={setInterestsText}
              placeholder="เช่น Mobile UX, AR Catch, React Native"
              placeholderTextColor={subTextColor}
              maxLength={100}
            />

            <TouchableOpacity
              style={[styles.saveButton, !name.trim() && styles.saveDisabled]}
              onPress={handleSave}
              disabled={saving || !name.trim()}
              activeOpacity={0.85}
            >
              <Text style={styles.saveText}>{saving ? 'กำลังบันทึก...' : 'บันทึก'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    borderRadius: 18,
    padding: 18,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
  scrollContent: {
    gap: 8,
    paddingBottom: 4,
  },
  avatarSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
    gap: 6,
  },
  avatarWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    position: 'relative',
    borderWidth: 2.5,
    borderColor: '#EE1515',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 37.5,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#EE1515',
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  changePhotoText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EE1515',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#EE1515',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  saveDisabled: {
    opacity: 0.5,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
