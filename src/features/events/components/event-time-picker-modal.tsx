import { useState, useMemo, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export interface EventTimePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (startHour: number, endHour: number) => void;
  startHour: number;
  endHour: number;
  isDark?: boolean;
}

const START_HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6 to 23
const END_HOURS = Array.from({ length: 18 }, (_, i) => i + 7); // 7 to 24 (24 = 00:00 next day)

function formatHourLabel(hour: number): string {
  if (hour === 24 || hour === 0) return '00:00';
  return `${String(hour).padStart(2, '0')}:00`;
}

export function EventTimePickerModal({
  visible,
  onClose,
  onConfirm,
  startHour,
  endHour,
  isDark = false,
}: EventTimePickerModalProps) {
  const [tempStart, setTempStart] = useState(startHour);
  const [tempEnd, setTempEnd] = useState(endHour);

  useEffect(() => {
    if (visible) {
      setTempStart(startHour);
      setTempEnd(endHour);
    }
  }, [visible, startHour, endHour]);

  const handleSelectStart = async (h: number) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setTempStart(h);
    // If start is >= end, auto-advance end to start + 2 (clamped to 24)
    if (h >= tempEnd) {
      const nextEnd = Math.min(h + 2, 24);
      setTempEnd(nextEnd);
    }
  };

  const handleSelectEnd = async (h: number) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setTempEnd(h);
    if (h <= tempStart) {
      const nextStart = Math.max(h - 2, 6);
      setTempStart(nextStart);
    }
  };

  const handleApplyDuration = async (durationHours: number) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const calculatedEnd = Math.min(tempStart + durationHours, 24);
    setTempEnd(calculatedEnd);
  };

  const durationHours = useMemo(() => {
    const diff = tempEnd - tempStart;
    return diff > 0 ? diff : 24 - tempStart + tempEnd;
  }, [tempStart, tempEnd]);

  const handleConfirm = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    onConfirm(tempStart, tempEnd);
    onClose();
  };

  const sheetBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const subTextColor = isDark ? '#9BA1A6' : '#687076';
  const borderColor = isDark ? '#2C2C2E' : '#E5E7EB';
  const unselectedBg = isDark ? '#2A2A2A' : '#F3F4F6';

  const previewTime = `${formatHourLabel(tempStart)} - ${formatHourLabel(tempEnd)} น.`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={[styles.sheetContainer, { backgroundColor: sheetBg }]}>
              {/* Header */}
              <View style={[styles.header, { borderBottomColor: borderColor }]}>
                <View>
                  <Text style={[styles.title, { color: textColor }]}>
                    เลือกเวลาจัดมีตอัป
                  </Text>
                  <Text style={[styles.subtitle, { color: subTextColor }]}>
                    กำหนดเวลาเริ่มและสิ้นสุด (06:00 - 00:00 น.)
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  accessibilityLabel="ปิดหน้าต่างเลือกเวลา"
                >
                  <Ionicons name="close" size={24} color={textColor} />
                </TouchableOpacity>
              </View>

              {/* Time Preview Pill */}
              <View style={[styles.summaryPill, { backgroundColor: unselectedBg, borderColor }]}>
                <Ionicons name="time" size={18} color="#EF4444" />
                <Text style={[styles.summaryText, { color: textColor }]}>
                  เวลา: <Text style={styles.summaryHighlight}>{previewTime}</Text>{' '}
                  <Text style={{ color: subTextColor }}>({durationHours} ชม.)</Text>
                </Text>
              </View>

              {/* Quick Duration Preset Chips */}
              <View style={styles.quickDurationRow}>
                <Text style={[styles.durationLabel, { color: subTextColor }]}>
                  ระยะเวลากิจกรรม:
                </Text>
                {[1, 2, 3, 4].map((hrs) => {
                  const isActive = durationHours === hrs;
                  return (
                    <TouchableOpacity
                      key={hrs}
                      style={[
                        styles.quickChip,
                        isActive
                          ? styles.quickChipActive
                          : { backgroundColor: unselectedBg, borderColor },
                      ]}
                      onPress={() => handleApplyDuration(hrs)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.quickChipText,
                          isActive ? { color: '#FFFFFF' } : { color: textColor },
                        ]}
                      >
                        {hrs} ชม.
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Dual Column Picker */}
              <View style={styles.columnsContainer}>
                {/* Left Column: Start Hour */}
                <View style={[styles.columnWrapper, { borderRightColor: borderColor, borderRightWidth: 1 }]}>
                  <Text style={[styles.columnHeading, { color: subTextColor }]}>
                    เวลาเริ่ม
                  </Text>
                  <ScrollView
                    style={styles.hourScroll}
                    showsVerticalScrollIndicator={false}
                  >
                    {START_HOURS.map((h) => {
                      const isSelected = tempStart === h;
                      return (
                        <TouchableOpacity
                          key={h}
                          style={[
                            styles.hourItem,
                            isSelected
                              ? styles.itemSelected
                              : { backgroundColor: unselectedBg },
                          ]}
                          onPress={() => handleSelectStart(h)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.hourItemText,
                              isSelected ? styles.textSelected : { color: textColor },
                            ]}
                          >
                            {formatHourLabel(h)} น.
                          </Text>
                          {isSelected && (
                            <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* Right Column: End Hour */}
                <View style={styles.columnWrapper}>
                  <Text style={[styles.columnHeading, { color: subTextColor }]}>
                    เวลาสิ้นสุด
                  </Text>
                  <ScrollView
                    style={styles.hourScroll}
                    showsVerticalScrollIndicator={false}
                  >
                    {END_HOURS.map((h) => {
                      const isSelected = tempEnd === h;
                      return (
                        <TouchableOpacity
                          key={h}
                          style={[
                            styles.hourItem,
                            isSelected
                              ? styles.itemSelected
                              : { backgroundColor: unselectedBg },
                          ]}
                          onPress={() => handleSelectEnd(h)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.hourItemText,
                              isSelected ? styles.textSelected : { color: textColor },
                            ]}
                          >
                            {formatHourLabel(h)} น.
                          </Text>
                          {isSelected && (
                            <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              </View>

              {/* Confirm Button */}
              <View style={[styles.footer, { borderTopColor: borderColor }]}>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleConfirm}
                  activeOpacity={0.85}
                >
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                  <Text style={styles.confirmButtonText}>
                    ยืนยันเวลา {previewTime}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryHighlight: {
    fontWeight: '700',
    color: '#EF4444',
  },
  quickDurationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  durationLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  quickChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  quickChipActive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  columnsContainer: {
    flexDirection: 'row',
    height: 300,
    marginHorizontal: 16,
    marginTop: 4,
  },
  columnWrapper: {
    flex: 1,
    paddingHorizontal: 6,
  },
  columnHeading: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  hourScroll: {
    flex: 1,
  },
  hourItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 6,
  },
  hourItemText: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemSelected: {
    backgroundColor: '#EF4444',
  },
  textSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 14,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
