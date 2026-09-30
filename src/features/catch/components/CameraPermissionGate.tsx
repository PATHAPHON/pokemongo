import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import {
  capitalizePokemonName,
  getArtworkUrl,
} from '@/shared/constants/kanto-pokemon';

interface CameraPermissionGateProps {
  pokemonId: number;
  pokemonName: string;
  canAskAgain?: boolean;
  onRequestPermission: () => void;
  onRunPress: () => void;
}

export function CameraPermissionGate({
  pokemonId,
  pokemonName,
  canAskAgain = true,
  onRequestPermission,
  onRunPress,
}: CameraPermissionGateProps) {
  return (
    <View style={styles.permissionGateContainer}>
      <View style={styles.permissionGateCard}>
        <Ionicons
          name="camera"
          size={44}
          color="#0A7EA4"
          style={{ marginBottom: 8 }}
        />
        <Image
          source={{ uri: getArtworkUrl(pokemonId) }}
          style={{ width: 110, height: 110, marginVertical: 8 }}
          contentFit="contain"
        />
        <Text style={styles.gateTitle}>ต้องการสิทธิ์การเข้าถึงกล้อง</Text>
        <Text style={styles.gateSubtitle}>
          โหมด AR จำเป็นต้องใช้กล้องถ่ายรูปเพื่อค้นหาและจับ{' '}
          {capitalizePokemonName(pokemonName)} ในโลกจริง
        </Text>

        <TouchableOpacity
          style={styles.gatePrimaryBtn}
          activeOpacity={0.8}
          onPress={
            canAskAgain
              ? onRequestPermission
              : () => Linking.openSettings().catch(() => {})
          }
        >
          <Text style={styles.gatePrimaryBtnText}>
            {canAskAgain
              ? 'เปิดใช้งานกล้อง (AR)'
              : 'เปิดการตั้งค่าระบบ (Settings)'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gateSecondaryBtn}
          activeOpacity={0.8}
          onPress={onRunPress}
        >
          <Text style={styles.gateSecondaryBtnText}>
            วิ่งหนี (กลับสู่แผนที่)
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  permissionGateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  permissionGateCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  gateTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#11181C',
    textAlign: 'center',
    marginBottom: 6,
  },
  gateSubtitle: {
    fontSize: 13,
    color: '#687076',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  gatePrimaryBtn: {
    width: '100%',
    backgroundColor: '#0A7EA4',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  gatePrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  gateSecondaryBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  gateSecondaryBtnText: {
    color: '#687076',
    fontSize: 14,
    fontWeight: '600',
  },
});
