import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function PokedexScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Pokédex</ThemedText>
      <ThemedText type="subtitle" style={styles.subtitle}>
        Kanto 151 Catalog
      </ThemedText>
      <ThemedText style={styles.description}>
        Pokémon encyclopedia will render here.
      </ThemedText>
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
  subtitle: {
    marginTop: 8,
  },
  description: {
    marginTop: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
});
