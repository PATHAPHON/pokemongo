import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  nearbyCount: number;
  permissionGranted: boolean;
  distanceAlert: string | null;
  onRecenter?: () => void;
}

export function MapControls({
  nearbyCount,
  permissionGranted,
  distanceAlert,
  onRecenter,
}: Props) {
  return (
    <SafeAreaView style={styles.overlayContainer} pointerEvents="box-none">
      {/* Top Header Bar */}
      <View style={styles.topBar} pointerEvents="box-none">
        <View style={styles.statusPill}>
          <Ionicons
            name={permissionGranted ? 'location' : 'location-outline'}
            size={16}
            color={permissionGranted ? '#34C759' : '#FF9500'}
          />
          <Text style={styles.statusPillText}>
            {permissionGranted ? 'GPS Active' : 'Fallback GPS'}
          </Text>
        </View>

        <View style={styles.statusPill}>
          <Ionicons name="scan-outline" size={16} color="#007AFF" />
          <Text style={styles.statusPillText}>Nearby: {nearbyCount}</Text>
        </View>
      </View>

      {/* Distance Alert Banner (shown when tapping pokemon outside 50m) */}
      {distanceAlert && (
        <View style={styles.alertBanner}>
          <Ionicons name="alert-circle" size={18} color="#FF3B30" />
          <Text style={styles.alertText}>{distanceAlert}</Text>
        </View>
      )}

      {/* Optional Bottom Right Floating Controls */}
      {onRecenter && (
        <View style={styles.bottomControls} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.recenterButton}
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
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.12)',
    elevation: 3,
  },
  statusPillText: {
    color: '#1A1A1A',
    fontSize: 12,
    fontWeight: '700',
  },
  alertBanner: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEA',
    borderColor: '#FF3B30',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    marginTop: 10,
    boxShadow: '0px 3px 10px rgba(255, 59, 48, 0.2)',
    elevation: 4,
  },
  alertText: {
    color: '#D32F2F',
    fontSize: 13,
    fontWeight: '600',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  recenterButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.18)',
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
});
