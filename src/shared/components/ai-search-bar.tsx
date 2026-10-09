import { useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Platform,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export interface AiSearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  searchQuery?: string;
  onSearchChange?: (text: string) => void;
  placeholder?: string;
  isDark?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function AiSearchBar({
  value,
  onChangeText,
  searchQuery,
  onSearchChange,
  placeholder = 'ค้นหา หรือถาม AI...',
  isDark = false,
  style,
  accessibilityLabel = 'ค้นหาหรือถาม AI',
}: AiSearchBarProps) {
  const query = value !== undefined ? value : (searchQuery ?? '');
  const handleChange = (text: string) => {
    onChangeText?.(text);
    onSearchChange?.(text);
  };

  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const subTextColor = isDark ? '#9BA1A6' : '#687076';
  const boxBg = isDark ? 'rgba(28, 28, 30, 0.95)' : '#FFFFFF';

  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.searchGlowWrapper, style]}>
      {/* Animated Rotating Gradient Background */}
      <View style={styles.glowContainer}>
        <Animated.View
          style={[
            styles.rotatingGradient,
            {
              transform: [{ rotate: spin }],
            },
          ]}
        >
          <LinearGradient
            colors={[
              '#EE1515',
              '#FFCB05',
              '#F59E0B',
              '#EF4444',
              '#FFCB05',
              '#EE1515',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientFill}
          />
        </Animated.View>
      </View>

      {/* Inner Search Box */}
      <View
        style={[
          styles.searchBox,
          {
            backgroundColor: boxBg,
          },
        ]}
      >
        <Ionicons name="sparkles" size={17} color="#EE1515" />
        <TextInput
          style={[styles.input, { color: textColor }]}
          placeholder={placeholder}
          placeholderTextColor={subTextColor}
          value={query}
          onChangeText={handleChange}
          returnKeyType="search"
          clearButtonMode="while-editing"
          autoCorrect={false}
          autoCapitalize="none"
          accessibilityLabel={accessibilityLabel}
        />
        {query.length > 0 && (
          <TouchableOpacity
            onPress={() => handleChange('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="ล้างคำค้นหา"
          >
            <Ionicons name="close-circle" size={18} color={subTextColor} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  searchGlowWrapper: {
    position: 'relative',
    borderRadius: 9999,
    padding: 2,
    shadowColor: '#EE1515',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    ...Platform.select({
      web: {
        filter: 'drop-shadow(0px 2px 10px rgba(238, 21, 21, 0.25))',
      },
    }),
  },
  glowContainer: {
    ...StyleSheet.absoluteFill,
    borderRadius: 9999,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rotatingGradient: {
    width: 600,
    height: 600,
  },
  gradientFill: {
    width: '100%',
    height: '100%',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 9999,
    paddingHorizontal: 14,
    height: 44,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
});
