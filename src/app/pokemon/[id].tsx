import React from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';

export default function PokemonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ThemedView className="flex-1 items-center justify-center p-5" style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          presentation: 'modal',
          headerShown: true,
          title: 'Pokémon Details',
        }}
      />
      <ThemedText type="title">Pokémon Detail</ThemedText>
      <ThemedText type="subtitle">ID: #{id}</ThemedText>
    </ThemedView>
  );
}
