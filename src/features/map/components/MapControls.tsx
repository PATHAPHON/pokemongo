import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useColorScheme } from '@/shared/hooks/use-color-scheme';

interface Props {
  locationName: string;
  isRealGps: boolean;
  nearbyCount: number;
  onOpenLocationPicker: () => void;
  onRecenter?: () => void;
  notificationsEnabled?: boolean;
  onToggleNotifications?: () => void;
}

export function MapControls({
  locationName,
  isRealGps,
  nearbyCount,
  onOpenLocationPicker,
  onRecenter,
  notificationsEnabled = false,
  onToggleNotifications,
}: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const chipBg = isDark
    ? 'rgba(24, 24, 27, 0.92)'
    : 'rgba(255, 255, 255, 0.95)';
  const textColor = isDark ? '#ECEDEE' : '#1A1A1A';

  return (
    <SafeAreaView
      style={[
        StyleSheet.absoluteFill,
        styles.safeArea,
        { paddingBottom: Platform.OS === 'ios' ? 24 : 16 },
      ]}
      pointerEvents="box-none"
    >
      {/* Top Header Bar */}
      <View style={styles.headerBar} pointerEvents="box-none">
        {/* Location Selector Button */}
        <TouchableOpacity
          style={[styles.chip, styles.locationChip, { backgroundColor: chipBg }]}
          onPress={onOpenLocationPicker}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isRealGps ? 'navigate' : 'location'}
            size={16}
            color={isRealGps ? '#34C759' : '#007AFF'}
          />
          <Text
            style={[styles.chipText, { color: textColor }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {locationName}
          </Text>
          <Ionicons name="chevron-down" size={14} color="#8E8E93" />
        </TouchableOpacity>

        {/* Right Controls */}
        <View style={styles.topRightControls}>
          {onToggleNotifications && (
            <TouchableOpacity
              style={[
                styles.chip,
                {
                  backgroundColor: notificationsEnabled
                    ? isDark
                      ? 'rgba(120, 53, 15, 0.4)'
                      : '#FFFBEB'
                    : chipBg,
                  borderWidth: notificationsEnabled ? 1 : 0,
                  borderColor: notificationsEnabled ? '#F59E0B' : 'transparent',
                },
              ]}
              onPress={onToggleNotifications}
              activeOpacity={0.7}
            >
              <Ionicons
                name={
                  notificationsEnabled
                    ? 'notifications'
                    : 'notifications-off-outline'
                }
                size={16}
                color={notificationsEnabled ? '#FF9500' : '#8E8E93'}
              />
              <Text
                style={[
                  styles.chipText,
                  {
                    color: notificationsEnabled
                      ? isDark
                        ? '#FBBF24'
                        : '#D97706'
                      : textColor,
                  },
                ]}
              >
                {notificationsEnabled ? 'Alerts ON' : 'Alerts OFF'}
              </Text>
            </TouchableOpacity>
          )}

          <View style={[styles.chip, { backgroundColor: chipBg }]}>
            <Ionicons name="scan-outline" size={16} color="#007AFF" />
            <Text style={[styles.chipText, { color: textColor }]}>
              Nearby: {nearbyCount}
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom Right Floating Controls */}
      {onRecenter && (
        <View style={styles.bottomControls} pointerEvents="box-none">
          <TouchableOpacity
            style={[
              styles.recenterButton,
              { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' },
            ]}
            onPress={onRecenter}
            activeOpacity={0.8}
          >
            <Ionicons name="locate" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingTop: 8,
    gap: 8,
  },
  locationChip: {
    maxWidth: '52%',
  },
  topRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  bottomControls: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  recenterButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
