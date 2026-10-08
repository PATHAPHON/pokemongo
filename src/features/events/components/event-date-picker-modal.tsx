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

import {
  THAI_MONTHS_NAMES,
  getDaysInMonth,
  calculateEventYear,
} from '@/shared/utils/event-helpers';

export interface EventDatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (year: number, monthIndex: number, day: number) => void;
  selectedMonth: number;
  selectedDay: number;
  selectedYear?: number;
  isDark?: boolean;
}

export function EventDatePickerModal({
  visible,
  onClose,
  onConfirm,
  selectedMonth,
  selectedDay,
  selectedYear,
  isDark = false,
}: EventDatePickerModalProps) {
  const [tempMonth, setTempMonth] = useState(selectedMonth);
  const [tempDay, setTempDay] = useState(selectedDay);

  // Sync internal state whenever modal becomes visible
  useEffect(() => {
    if (visible) {
      setTempMonth(selectedMonth);
      setTempDay(selectedDay);
    }
  }, [visible, selectedMonth, selectedDay]);

  const activeYear = useMemo(() => {
    return calculateEventYear(tempMonth, tempDay);
  }, [tempMonth, tempDay]);

  const daysInCurrentMonth = useMemo(() => {
    return getDaysInMonth(activeYear, tempMonth);
  }, [activeYear, tempMonth]);

  // Ensure day is clamped if month changes to one with fewer days
  useEffect(() => {
    if (tempDay > daysInCurrentMonth) {
      setTempDay(daysInCurrentMonth);
    }
  }, [daysInCurrentMonth, tempDay]);

  const daysList = useMemo(() => {
    return Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1);
  }, [daysInCurrentMonth]);

  const handleSelectMonth = async (monthIndex: number) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setTempMonth(monthIndex);
  };

  const handleSelectDay = async (day: number) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setTempDay(day);
  };

  const handleConfirm = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    onConfirm(activeYear, tempMonth, tempDay);
    onClose();
  };

  const sheetBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const subTextColor = isDark ? '#9BA1A6' : '#687076';
  const borderColor = isDark ? '#2C2C2E' : '#E5E7EB';
  const unselectedBg = isDark ? '#2A2A2A' : '#F3F4F6';

  const previewLabel = `${tempDay} ${THAI_MONTHS_NAMES[tempMonth]} ${activeYear + 543}`;

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
                    เลือกวันและเดือนจัดมีตอัป
                  </Text>
                  <Text style={[styles.subtitle, { color: subTextColor }]}>
                    แตะเลือกเดือนและวันที่จัดกิจกรรม
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  accessibilityLabel="ปิดหน้าต่างเลือกวันที่"
                >
                  <Ionicons name="close" size={24} color={textColor} />
                </TouchableOpacity>
              </View>

              {/* Selection Summary Pill */}
              <View style={[styles.summaryPill, { backgroundColor: unselectedBg, borderColor }]}>
                <Ionicons name="calendar" size={18} color="#EF4444" />
                <Text style={[styles.summaryText, { color: textColor }]}>
                  วันที่เลือก: <Text style={styles.summaryHighlight}>{previewLabel}</Text>
                </Text>
              </View>

              {/* Dual Column Picker */}
              <View style={styles.columnsContainer}>
                {/* Left Column: Months */}
                <View style={[styles.columnWrapper, { borderRightColor: borderColor, borderRightWidth: 1 }]}>
                  <Text style={[styles.columnHeading, { color: subTextColor }]}>
                    เดือน ({THAI_MONTHS_NAMES.length})
                  </Text>
                  <ScrollView
                    style={styles.monthScroll}
                    showsVerticalScrollIndicator={false}
                  >
                    {THAI_MONTHS_NAMES.map((name, index) => {
                      const isSelected = tempMonth === index;
                      return (
                        <TouchableOpacity
                          key={name}
                          style={[
                            styles.monthItem,
                            isSelected
                              ? styles.itemSelected
                              : { backgroundColor: unselectedBg },
                          ]}
                          onPress={() => handleSelectMonth(index)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.monthItemText,
                              isSelected ? styles.textSelected : { color: textColor },
                            ]}
                          >
                            {name}
                          </Text>
                          {isSelected && (
                            <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* Right Column: Days Grid */}
                <View style={styles.columnWrapper}>
                  <Text style={[styles.columnHeading, { color: subTextColor }]}>
                    วันที่ (1 - {daysInCurrentMonth})
                  </Text>
                  <ScrollView
                    contentContainerStyle={styles.daysGrid}
                    showsVerticalScrollIndicator={false}
                  >
                    {daysList.map((day) => {
                      const isSelected = tempDay === day;
                      return (
                        <TouchableOpacity
                          key={day}
                          style={[
                            styles.dayItem,
                            isSelected
                              ? styles.itemSelected
                              : { backgroundColor: unselectedBg },
                          ]}
                          onPress={() => handleSelectDay(day)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.dayItemText,
                              isSelected ? styles.textSelected : { color: textColor },
                            ]}
                          >
                            {day}
                          </Text>
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
                    ยืนยันวันที่ {previewLabel}
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
    marginBottom: 6,
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
  columnsContainer: {
    flexDirection: 'row',
    height: 340,
    marginHorizontal: 16,
    marginTop: 8,
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
  monthScroll: {
    flex: 1,
  },
  monthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 6,
  },
  monthItemText: {
    fontSize: 14,
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingBottom: 12,
  },
  dayItem: {
    width: '22%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  dayItemText: {
    fontSize: 14,
    fontWeight: '700',
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
