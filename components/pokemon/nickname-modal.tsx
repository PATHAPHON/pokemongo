import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { capitalizePokemonName } from '@/constants/kanto-pokemon';

export interface NicknameModalProps {
  visible: boolean;
  currentNickname?: string;
  pokemonName: string;
  onSave: (nickname: string) => void;
  onCancel: () => void;
}

const MAX_NICKNAME_LENGTH = 12;

export function NicknameModal({
  visible,
  currentNickname = '',
  pokemonName,
  onSave,
  onCancel,
}: NicknameModalProps) {
  const [text, setText] = useState<string>('');

  useEffect(() => {
    if (visible) {
      setText(currentNickname || capitalizePokemonName(pokemonName));
    }
  }, [visible, currentNickname, pokemonName]);

  const handleSave = () => {
    const trimmed = text.trim();
    if (!trimmed) {
      // Default to original species name if blank
      onSave(capitalizePokemonName(pokemonName));
    } else {
      onSave(trimmed.slice(0, MAX_NICKNAME_LENGTH));
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.dialog}>
          <Text style={styles.title}>Set Nickname</Text>
          <Text style={styles.subtitle}>
            Enter a nickname for your {capitalizePokemonName(pokemonName)}
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={(val) => setText(val.slice(0, MAX_NICKNAME_LENGTH))}
              placeholder={capitalizePokemonName(pokemonName)}
              placeholderTextColor="#8E8E93"
              maxLength={MAX_NICKNAME_LENGTH}
              autoFocus
              selectTextOnFocus
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
            <Text style={styles.counter}>
              {text.length}/{MAX_NICKNAME_LENGTH}
            </Text>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onCancel}
              style={[styles.button, styles.cancelButton]}
              accessibilityRole="button"
              accessibilityLabel="Cancel nickname change"
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSave}
              style={[styles.button, styles.saveButton]}
              accessibilityRole="button"
              accessibilityLabel="Save nickname"
            >
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#11181C',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#0A7EA4',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 20,
    height: 48,
    backgroundColor: 'rgba(10, 126, 164, 0.04)',
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
  },
  counter: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '700',
    marginLeft: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(142, 142, 147, 0.15)',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#687076',
  },
  saveButton: {
    backgroundColor: '#0A7EA4',
  },
  saveText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
