import { Alert } from 'react-native';
import { useEventContext } from '@/shared/context/event-context';

export function useEventActions() {
  const {
    cancelUserRegistration,
    toggleFavorite,
  } = useEventContext();

  const handleCancelRegistration = (
    registrationId: string,
    eventTitle?: string
  ) => {
    Alert.alert(
      'ยืนยันการยกเลิก',
      `คุณต้องการยกเลิกการลงทะเบียน${eventTitle ? ` "${eventTitle}"` : ''} ใช่หรือไม่?`,
      [
        { text: 'ไม่ยกเลิก', style: 'cancel' },
        {
          text: 'ยืนยันยกเลิก',
          style: 'destructive',
          onPress: async () => {
            const res = await cancelUserRegistration(registrationId);
            if (!res.success) {
              Alert.alert('เกิดข้อผิดพลาด', res.error || 'ไม่สามารถยกเลิกได้');
            } else {
              Alert.alert('สำเร็จ', 'ยกเลิกการลงทะเบียนเรียบร้อยแล้ว');
            }
          },
        },
      ]
    );
  };

  return {
    handleCancelRegistration,
    toggleFavorite,
  };
}
