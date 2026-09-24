import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ProfileScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Trainer Profile</ThemedText>
      <ThemedText type="subtitle" style={styles.subtitle}>
        Trainer Card & Stats
      </ThemedText>
      <ThemedText style={styles.description}>
        Trainer information and progress will appear here.
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
