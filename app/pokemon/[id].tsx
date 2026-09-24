import { StyleSheet } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function PokemonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ThemedView style={styles.container}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});
