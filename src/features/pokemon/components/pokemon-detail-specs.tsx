import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface PokemonDetailSpecsProps {
  description?: string;
  height?: number;
  weight?: number;
  isLoading: boolean;
  error?: string | null;
  onRetry?: () => void;
  cardBg: string;
  textColor: string;
  subTextColor: string;
}

export function PokemonDetailSpecs({
  description,
  height,
  weight,
  isLoading,
  error,
  onRetry,
  cardBg,
  textColor,
  subTextColor,
}: PokemonDetailSpecsProps) {
  return (
    <View style={[styles.detailCard, { backgroundColor: cardBg }]}>
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color="#0A7EA4"
          style={{ marginVertical: 20 }}
        />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: '#FF3B30' }]}>{error}</Text>
          {onRetry && (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={onRetry}
              activeOpacity={0.7}
            >
              <Text style={styles.retryButtonText}>ลองใหม่อีกครั้ง (Retry)</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <>
          {description && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                About
              </Text>
              <Text style={[styles.descriptionText, { color: subTextColor }]}>
                {description}
              </Text>
            </View>
          )}

          <View style={styles.specsRow}>
            <View style={styles.specItem}>
              <Text style={[styles.specLabel, { color: subTextColor }]}>
                Height
              </Text>
              <Text style={[styles.specValue, { color: textColor }]}>
                {height ? `${height / 10} m` : '-'}
              </Text>
            </View>

            <View style={styles.specDivider} />

            <View style={styles.specItem}>
              <Text style={[styles.specLabel, { color: subTextColor }]}>
                Weight
              </Text>
              <Text style={[styles.specValue, { color: textColor }]}>
                {weight ? `${weight / 10} kg` : '-'}
              </Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  detailCard: {
    marginHorizontal: 16,
    marginBottom: 32,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.15)',
  },
  specItem: {
    alignItems: 'center',
  },
  specLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  specValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  specDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#0A7EA4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
