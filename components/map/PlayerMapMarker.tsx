import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { Coordinates } from '@/services/spawn-engine';

interface Props {
  coordinate: Coordinates;
  heading?: number | null;
}

export const PlayerMapMarker = React.memo(function PlayerMapMarker({
  coordinate,
  heading,
}: Props) {
  return (
    <Marker
      coordinate={coordinate}
      anchor={{ x: 0.5, y: 0.5 }}
      flat={true}
      tracksViewChanges={false}
      rotation={heading !== null && heading !== undefined ? heading : 0}
    >
      <View style={styles.container}>
        {/* Direction cone/indicator when heading is available */}
        {heading !== null && heading !== undefined && (
          <View style={styles.headingBeam} />
        )}

        {/* Outer Halo */}
        <View style={styles.outerHalo} />

        {/* Inner Player Dot */}
        <View style={styles.innerDot}>
          <Ionicons name="person" size={14} color="#FFFFFF" />
        </View>

        {/* GPS Active Center Dot */}
        <View style={styles.pulsePoint} />
      </View>
    </Marker>
  );
});

const styles = StyleSheet.create({
  container: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingBeam: {
    position: 'absolute',
    top: -4,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(0, 122, 255, 0.45)',
  },
  outerHalo: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 122, 255, 0.5)',
  },
  innerDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.3)',
    elevation: 4,
  },
  pulsePoint: {
    position: 'absolute',
    bottom: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34C759',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
});
