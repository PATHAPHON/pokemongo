import React from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useColorScheme } from '@/shared/hooks/use-color-scheme';

interface Props {
  nearbyCount: number;
  permissionGranted: boolean;
  distanceAlert: string | null;
  onRecenter?: () => void;
  notificationsEnabled?: boolean;
  onToggleNotifications?: () => void;
  className?: string;
}

export function MapControls({
  nearbyCount,
  permissionGranted,
  distanceAlert,
  onRecenter,
  notificationsEnabled = false,
  onToggleNotifications,
  className = '',
}: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const chipBg = isDark ? 'rgba(24, 24, 27, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  const textColor = isDark ? '#ECEDEE' : '#1A1A1A';

  return (
    <SafeAreaView
      style={StyleSheet.absoluteFillObject}
      className={`absolute inset-0 justify-between px-4 pt-2 ${
        Platform.OS === 'ios' ? 'pb-6' : 'pb-4'
      } ${className}`.trim()}
      pointerEvents="box-none"
    >
      {/* Top Header Bar */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingTop: 8,
        }}
        className="flex-row justify-between items-center"
        pointerEvents="box-none"
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: chipBg,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
            gap: 6,
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.15,
            shadowRadius: 2,
          }}
          className="flex-row items-center bg-white/95 dark:bg-gray-900/95 px-3 py-1.5 rounded-full gap-1.5 shadow-sm"
        >
          <Ionicons
            name={permissionGranted ? 'location' : 'location-outline'}
            size={16}
            color={permissionGranted ? '#34C759' : '#FF9500'}
          />
          <Text
            style={{ color: textColor, fontSize: 12, fontWeight: '700' }}
            className="text-[#1A1A1A] dark:text-[#ECEDEE] text-xs font-bold"
          >
            {permissionGranted ? 'GPS Active' : 'Fallback GPS'}
          </Text>
        </View>

        <View
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
          className="flex-row items-center gap-2"
        >
          {onToggleNotifications && (
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: notificationsEnabled
                  ? isDark
                    ? 'rgba(120, 53, 15, 0.4)'
                    : '#FFFBEB'
                  : chipBg,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                gap: 6,
                borderWidth: notificationsEnabled ? 1 : 0,
                borderColor: notificationsEnabled ? '#F59E0B' : 'transparent',
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.15,
                shadowRadius: 2,
              }}
              className={`flex-row items-center px-3 py-1.5 rounded-full gap-1.5 shadow-sm ${
                notificationsEnabled
                  ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-500'
                  : 'bg-white/95 dark:bg-gray-900/95'
              }`}
              onPress={onToggleNotifications}
              activeOpacity={0.7}
            >
              <Ionicons
                name={notificationsEnabled ? 'notifications' : 'notifications-off-outline'}
                size={16}
                color={notificationsEnabled ? '#FF9500' : '#8E8E93'}
              />
              <Text
                style={{
                  color: notificationsEnabled ? (isDark ? '#FBBF24' : '#D97706') : textColor,
                  fontSize: 12,
                  fontWeight: '700',
                }}
                className={`text-xs font-bold ${
                  notificationsEnabled
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-[#1A1A1A] dark:text-[#ECEDEE]'
                }`}
              >
                {notificationsEnabled ? 'Alerts ON' : 'Alerts OFF'}
              </Text>
            </TouchableOpacity>
          )}

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: chipBg,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              gap: 6,
              elevation: 2,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.15,
              shadowRadius: 2,
            }}
            className="flex-row items-center bg-white/95 dark:bg-gray-900/95 px-3 py-1.5 rounded-full gap-1.5 shadow-sm"
          >
            <Ionicons name="scan-outline" size={16} color="#007AFF" />
            <Text
              style={{ color: textColor, fontSize: 12, fontWeight: '700' }}
              className="text-[#1A1A1A] dark:text-[#ECEDEE] text-xs font-bold"
            >
              Nearby: {nearbyCount}
            </Text>
          </View>
        </View>
      </View>

      {/* Distance Alert Banner (shown when tapping pokemon outside 50m) */}
      {distanceAlert && (
        <View className="self-center flex-row items-center bg-red-50 dark:bg-red-950/50 border border-red-500 px-3.5 py-2 rounded-full gap-2 mt-2.5 shadow-md">
          <Ionicons name="alert-circle" size={18} color="#FF3B30" />
          <Text className="text-red-600 dark:text-red-400 text-[13px] font-semibold">
            {distanceAlert}
          </Text>
        </View>
      )}

      {/* Optional Bottom Right Floating Controls */}
      {onRecenter && (
        <View className="flex-row justify-end items-end mb-2" pointerEvents="box-none">
          <TouchableOpacity
            className="w-[52px] h-[52px] rounded-full bg-white dark:bg-gray-800 items-center justify-center shadow-lg border border-black/10 dark:border-white/10"
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
