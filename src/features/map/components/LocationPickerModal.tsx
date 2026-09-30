import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  LocationPreset,
  PRESET_LOCATIONS,
} from '@/features/map/services/spawn-engine';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';

interface Props {
  visible: boolean;
  onClose: () => void;
  selectedPreset: LocationPreset | null;
  isRealGps: boolean;
  isLoading: boolean;
  errorMsg: string | null;
  onSelectPreset: (preset: LocationPreset) => void;
  onUseRealGps: () => Promise<boolean>;
}

export function LocationPickerModal({
  visible,
  onClose,
  selectedPreset,
  isRealGps,
  isLoading,
  errorMsg,
  onSelectPreset,
  onUseRealGps,
}: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const cardBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';
  const itemBg = isDark ? '#2C2C2E' : '#F3F4F6';
  const activeBorder = '#007AFF';

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.card, { backgroundColor: cardBg }]}>
              {/* Header */}
              <View style={styles.header}>
                <View>
                  <Text style={[styles.title, { color: textColor }]}>
                    เลือกสถานที่ล่าโปเกมอน
                  </Text>
                  <Text style={[styles.subtitle, { color: subTextColor }]}>
                    กำหนดพิกัด GPS จำลอง หรือใช้พิกัดจริง
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={22} color={subTextColor} />
                </TouchableOpacity>
              </View>

              {/* Error Message */}
              {errorMsg && (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle" size={16} color="#EF4444" />
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              )}

              {/* Presets List */}
              <View style={styles.list}>
                {PRESET_LOCATIONS.map((preset) => {
                  const isSelected =
                    !isRealGps && selectedPreset?.id === preset.id;
                  return (
                    <TouchableOpacity
                      key={preset.id}
                      style={[
                        styles.item,
                        { backgroundColor: itemBg },
                        isSelected && {
                          borderColor: activeBorder,
                          borderWidth: 2,
                        },
                      ]}
                      onPress={() => {
                        onSelectPreset(preset);
                        onClose();
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.itemContent}>
                        <Text style={styles.countryFlag}>
                          {preset.country.split(' ')[0]}
                        </Text>
                        <View style={styles.itemTextContainer}>
                          <Text
                            style={[
                              styles.itemName,
                              { color: textColor },
                              isSelected && { fontWeight: '700' },
                            ]}
                          >
                            {preset.name}
                          </Text>
                          <Text
                            style={[styles.itemSub, { color: subTextColor }]}
                          >
                            {preset.country.split(' ').slice(1).join(' ')} (
                            {preset.coords.latitude.toFixed(2)},{' '}
                            {preset.coords.longitude.toFixed(2)})
                          </Text>
                        </View>
                      </View>
                      {isSelected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={22}
                          color="#007AFF"
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Real Device GPS Option */}
              <TouchableOpacity
                style={[
                  styles.realGpsBtn,
                  isRealGps && styles.realGpsBtnActive,
                ]}
                onPress={async () => {
                  const ok = await onUseRealGps();
                  if (ok) onClose();
                }}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons
                      name="navigate"
                      size={18}
                      color="#FFFFFF"
                      style={styles.realGpsIcon}
                    />
                    <Text style={styles.realGpsText}>
                      {isRealGps
                        ? 'กำลังใช้งานพิกัดจริงของฉัน'
                        : 'ใช้พิกัดจริงของฉัน (Real GPS)'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#F87171',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 12,
    gap: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    flex: 1,
  },
  list: {
    gap: 10,
    marginBottom: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  countryFlag: {
    fontSize: 24,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemSub: {
    fontSize: 11,
    marginTop: 2,
  },
  realGpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    paddingVertical: 14,
    borderRadius: 14,
    elevation: 2,
  },
  realGpsBtnActive: {
    backgroundColor: '#248A3D',
  },
  realGpsIcon: {
    marginRight: 8,
  },
  realGpsText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
