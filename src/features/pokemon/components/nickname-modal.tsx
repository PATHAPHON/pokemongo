import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { capitalizePokemonName } from '@/shared/constants/kanto-pokemon';

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
  const [prevVisible, setPrevVisible] = useState(visible);
  const [text, setText] = useState<string>(() => currentNickname || capitalizePokemonName(pokemonName));

  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (visible) {
      setText(currentNickname || capitalizePokemonName(pokemonName));
    }
  }

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
        className="flex-1 bg-black/60 items-center justify-center p-6"
      >
        <View className="w-full max-w-[340px] bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 shadow-2xl">
          <Text className="text-xl font-extrabold text-[#11181C] dark:text-[#ECEDEE] text-center">
            Set Nickname
          </Text>
          <Text className="text-[13px] text-[#8E8E93] text-center mt-1.5 mb-5">
            Enter a nickname for your {capitalizePokemonName(pokemonName)}
          </Text>

          <View className="flex-row items-center border-[1.5px] border-[#0A7EA4] rounded-xl px-3 mb-5 h-12 bg-[#0A7EA4]/5">
            <TextInput
              className="flex-1 h-full text-base font-semibold text-[#11181C] dark:text-[#ECEDEE]"
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
            <Text className="text-xs text-[#8E8E93] font-bold ml-2">
              {text.length}/{MAX_NICKNAME_LENGTH}
            </Text>
          </View>

          <View className="flex-row justify-between gap-3">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onCancel}
              className="flex-1 h-11 rounded-xl items-center justify-center bg-neutral-400/20 dark:bg-neutral-800"
              accessibilityRole="button"
              accessibilityLabel="Cancel nickname change"
            >
              <Text className="text-[15px] font-bold text-[#687076] dark:text-[#9BA1A6]">
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSave}
              className="flex-1 h-11 rounded-xl items-center justify-center bg-[#0A7EA4]"
              accessibilityRole="button"
              accessibilityLabel="Save nickname"
            >
              <Text className="text-[15px] font-bold text-white">
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
