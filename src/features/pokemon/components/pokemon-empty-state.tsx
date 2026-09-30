import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PokemonEmptyStateProps {
  onGoToRadar: () => void;
  textColor?: string;
}

export function PokemonEmptyState({
  onGoToRadar,
  textColor = '#11181C',
}: PokemonEmptyStateProps) {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="disc-outline" size={64} color="#687076" />
      <Text style={[styles.emptyTitle, { color: textColor }]}>
        No Pokémon Caught Yet
      </Text>
      <Text style={styles.emptySubtitle}>
        Go to the Map Radar to encounter and catch wild Pokémon!
      </Text>
      <TouchableOpacity
        style={styles.radarButton}
        onPress={onGoToRadar}
        accessibilityRole="button"
        accessibilityLabel="Go to Radar"
      >
        <Ionicons name="map" size={16} color="#FFFFFF" />
        <Text style={styles.radarButtonText}>Go to Radar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#687076',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  radarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0A7EA4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  radarButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
