import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

interface EventImagePickerProps {
  photoUri?: string;
  onPhotoSelected: (uri?: string) => void;
  isDark?: boolean;
}

export function EventImagePicker({
  photoUri,
  onPhotoSelected,
  isDark = false,
}: EventImagePickerProps) {
  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const subTextColor = isDark ? '#9BA1A6' : '#687076';
  const cardBg = isDark ? '#2C2C2E' : '#F9FAFB';
  const borderColor = isDark ? '#3A3A3C' : '#E5E7EB';

  const pickImageFromGallery = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        if (!permissionResult.canAskAgain) {
          Alert.alert(
            'ต้องการสิทธิ์เข้าถึงรูปภาพ',
            'กรุณาเปิดการอนุญาตเข้าถึงรูปภาพในการตั้งค่าเพื่อเลือกรูปประกอบการลงทะเบียน',
            [
              { text: 'ยกเลิก', style: 'cancel' },
              { text: 'เปิดการตั้งค่า', onPress: () => Linking.openSettings() },
            ]
          );
        } else {
          Alert.alert(
            'ต้องการสิทธิ์เข้าถึงรูปภาพ',
            'กรุณาอนุญาตการเข้าถึงรูปภาพในการตั้งค่าเพื่อเลือกรูปประกอบการลงทะเบียน'
          );
        }
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onPhotoSelected(result.assets[0].uri);
      }
    } catch (err: any) {
      console.warn('[EventImagePicker] Error picking image:', err);
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
            'กรุณาเปิดการอนุญาตเข้าถึงกล้องในการตั้งค่าเพื่อถ่ายรูปหลักฐาน',
            [
              { text: 'ยกเลิก', style: 'cancel' },
              { text: 'เปิดการตั้งค่า', onPress: () => Linking.openSettings() },
            ]
          );
        } else {
          Alert.alert(
            'ต้องการสิทธิ์เข้าถึงกล้อง',
            'กรุณาอนุญาตการเข้าถึงกล้องในการตั้งค่าเพื่อถ่ายรูปหลักฐาน'
          );
        }
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onPhotoSelected(result.assets[0].uri);
      }
    } catch (err: any) {
      console.warn('[EventImagePicker] Error taking photo:', err);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถถ่ายรูปได้');
    }
  };

  const handleSelectOptions = () => {
    Alert.alert(
      'แนบรูปภาพประกอบ',
      'เลือกวิธีการแนบรูปภาพสำหรับกิจกรรม',
      [
        { text: 'ถ่ายรูปใหม่ด้วยกล้อง', onPress: takePhotoWithCamera },
        { text: 'เลือกจากคลังรูปภาพ', onPress: pickImageFromGallery },
        { text: 'ยกเลิก', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: textColor }]}>
        รูปภาพประกอบ (ไม่บังคับ)
      </Text>

      {photoUri ? (
        <View style={[styles.previewContainer, { borderColor }]}>
          <Image source={{ uri: photoUri }} style={styles.previewImage} />

          {/* Action buttons: Replace & Remove */}
          <View style={styles.previewActions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.replaceBtn]}
              onPress={handleSelectOptions}
              activeOpacity={0.8}
            >
              <Ionicons name="camera-reverse-outline" size={16} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>เปลี่ยนรูป</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.removeBtn]}
              onPress={() => onPhotoSelected(undefined)}
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>ลบรูป</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.emptyBox, { backgroundColor: cardBg, borderColor }]}
          onPress={handleSelectOptions}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="เพิ่มรูปถ่ายหรือหลักฐาน"
        >
          <View style={styles.emptyIconCircle}>
            <Ionicons name="camera-outline" size={26} color="#8B5CF6" />
          </View>
          <Text style={[styles.emptyTitle, { color: textColor }]}>
            แตะเพื่อถ่ายรูปหรือเลือกจากเครื่อง
          </Text>
          <Text style={[styles.emptySubtitle, { color: subTextColor }]}>
            รองรับ JPG, PNG • รูปภาพกิจกรรมหรือหลักฐานการสมัคร
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  previewContainer: {
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 160,
  },
  previewActions: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 8,
    right: 8,
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  replaceBtn: {
    backgroundColor: '#8B5CF6',
  },
  removeBtn: {
    backgroundColor: '#EF4444',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
