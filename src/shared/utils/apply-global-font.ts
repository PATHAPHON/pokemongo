import { Text, TextInput, Platform, StyleSheet } from 'react-native';
import { getFontFamily } from '@/shared/constants/theme';

let isGlobalFontApplied = false;

/**
 * Applies Google Fonts (Prompt) globally to Text and TextInput components
 * while strictly preserving icon fonts (such as Ionicons, MaterialIcons, etc.).
 */
export function applyGlobalFont() {
  if (isGlobalFontApplied) return;
  isGlobalFontApplied = true;

  // 1. Web: apply Prompt font to body and inputs without '!important' or '*' wildcard
  // so that icon font sets (Ionicons, FontAwesome, etc.) preserve their own font families.
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const styleId = 'google-font-prompt-global-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        body, input, textarea, select, button {
          font-family: 'Prompt', 'Prompt_400Regular', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      `;
      document.head.appendChild(style);
    }
  }

  // 2. React Native Text component: apply Prompt variant ONLY when no custom fontFamily is provided.
  const TextComponent = Text as any;
  if (TextComponent && typeof TextComponent.render === 'function') {
    const originalTextRender = TextComponent.render;
    TextComponent.render = function (props: any, ref: any) {
      const flattened = StyleSheet.flatten(props?.style);

      // If fontFamily is already specified (e.g. Ionicons, MaterialCommunityIcons, etc.), preserve it completely!
      if (flattened?.fontFamily) {
        return originalTextRender.call(this, props, ref);
      }

      const chosenFont = getFontFamily(flattened?.fontWeight);
      const mergedStyle = [{ fontFamily: chosenFont }, props?.style];
      return originalTextRender.call(
        this,
        { ...props, style: mergedStyle },
        ref
      );
    };
  }

  // 3. React Native TextInput component: apply Prompt variant ONLY when no custom fontFamily is provided.
  const TextInputComponent = TextInput as any;
  if (TextInputComponent && typeof TextInputComponent.render === 'function') {
    const originalInputRender = TextInputComponent.render;
    TextInputComponent.render = function (props: any, ref: any) {
      const flattened = StyleSheet.flatten(props?.style);

      if (flattened?.fontFamily) {
        return originalInputRender.call(this, props, ref);
      }

      const chosenFont = getFontFamily(flattened?.fontWeight);
      const mergedStyle = [{ fontFamily: chosenFont }, props?.style];
      return originalInputRender.call(
        this,
        { ...props, style: mergedStyle },
        ref
      );
    };
  }
}
