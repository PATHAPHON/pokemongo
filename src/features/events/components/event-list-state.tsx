import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type EventListStateType = 'loading' | 'empty' | 'error';

export interface EventListStateProps {
  type?: EventListStateType;
  state?: EventListStateType;
  message?: string;
  title?: string;
  subtitle?: string;
  loadingMessage?: string;
  emptyMessage?: string;
  errorMessage?: string;
  clearButtonText?: string;
  retryButtonText?: string;
  onClearFilters?: () => void;
  onRetry?: () => void;
  onAction?: () => void;
  isDark?: boolean;
}

export function EventListState({
  type,
  state,
  message,
  title,
  subtitle,
  loadingMessage = 'กำลังโหลดมีตอัปโปเกมอน...',
  emptyMessage = 'ไม่พบกิจกรรมที่ตรงกับเงื่อนไข',
  errorMessage = 'เกิดข้อผิดพลาดในการโหลดข้อมูล',
  clearButtonText = 'ล้างตัวกรองทั้งหมด',
  retryButtonText = 'ลองใหม่อีกครั้ง',
  onClearFilters,
  onRetry,
  onAction,
  isDark = false,
}: EventListStateProps) {
  const currentState: EventListStateType = type ?? state ?? 'empty';
  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const subTextColor = isDark ? '#9BA1A6' : '#687076';

  if (currentState === 'loading') {
    const text = message ?? loadingMessage;
    return (
      <View style={styles.container} testID="event-list-loading">
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={[styles.loadingText, { color: subTextColor }]}>{text}</Text>
      </View>
    );
  }

  if (currentState === 'error') {
    const displayMsg = message ?? errorMessage;
    const handleRetry = onRetry ?? onAction;
    return (
      <View style={styles.container} testID="event-list-error">
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: isDark ? '#3B1818' : '#FEE2E2' },
          ]}
        >
          <Ionicons name="warning-outline" size={40} color="#EF4444" />
        </View>
        <Text style={[styles.title, { color: textColor }]}>
          {title ?? 'เกิดข้อผิดพลาด'}
        </Text>
        <Text style={[styles.subtitle, { color: subTextColor }]}>
          {displayMsg}
        </Text>
        {(handleRetry || retryButtonText) && (
          <TouchableOpacity
            style={[styles.button, styles.retryButton]}
            onPress={handleRetry}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={retryButtonText}
            testID="event-list-retry-button"
          >
            <Ionicons name="refresh" size={16} color="#FFFFFF" />
            <Text style={styles.buttonText}>{retryButtonText}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // currentState === 'empty'
  const displayMsg = subtitle ?? message ?? emptyMessage;
  const handleClear = onClearFilters ?? onAction;
  return (
    <View style={styles.container} testID="event-list-empty">
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: isDark ? '#2C2C2E' : '#F3F4F6' },
        ]}
      >
        <Ionicons name="calendar-outline" size={40} color={subTextColor} />
      </View>
      <Text style={[styles.title, { color: textColor }]}>
        {title ?? 'ไม่พบกิจกรรม'}
      </Text>
      <Text style={[styles.subtitle, { color: subTextColor }]}>
        {displayMsg}
      </Text>
      {(handleClear || clearButtonText) && (
        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={handleClear}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={clearButtonText}
          testID="event-list-clear-filters-button"
        >
          <Ionicons name="filter-outline" size={16} color="#FFFFFF" />
          <Text style={styles.buttonText}>{clearButtonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
    paddingHorizontal: 28,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 12,
    textAlign: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  button: {
    minHeight: 44,
    minWidth: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 12,
    gap: 8,
  },
  clearButton: {
    backgroundColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  retryButton: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
