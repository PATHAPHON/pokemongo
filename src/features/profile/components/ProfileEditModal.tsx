import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TrainerProfile, TrainerTeam } from '@/shared/types';

interface ProfileEditModalProps {
  visible: boolean;
  trainer: TrainerProfile | null;
  isDark: boolean;
  onClose: () => void;
  onSave: (partial: Partial<TrainerProfile>) => Promise<void>;
}

const TEAMS: { id: TrainerTeam; label: string; color: string }[] = [
  { id: 'valor', label: '🔥 Valor', color: '#EF4444' },
  { id: 'mystic', label: '❄️ Mystic', color: '#3B82F6' },
  { id: 'instinct', label: '⚡ Instinct', color: '#F59E0B' },
  { id: 'none', label: '◌ None', color: '#6B7280' },
];

export function ProfileEditModal({ visible, trainer, isDark, onClose, onSave }: ProfileEditModalProps) {
  const [name, setName] = useState(trainer?.name || '');
  const [team, setTeam] = useState<TrainerTeam>(trainer?.team || 'none');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(trainer?.name || '');
      setTeam(trainer?.team || 'none');
    }
  }, [visible, trainer]);

  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const subTextColor = isDark ? '#9BA1A6' : '#687076';
  const inputBg = isDark ? '#2A2A2A' : '#F1F3F5';

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await onSave({ name: trimmed, team });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: textColor }]}>แก้ไขข้อมูลโปรไฟล์</Text>
            <TouchableOpacity onPress={onClose} accessibilityLabel="ปิด">
              <Ionicons name="close" size={22} color={textColor} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: subTextColor }]}>ชื่อเทรนเนอร์</Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
            value={name}
            onChangeText={setName}
            placeholder="ชื่อเล่นเทรนเนอร์"
            placeholderTextColor={subTextColor}
            maxLength={30}
          />

          <Text style={[styles.label, { color: subTextColor }]}>สังกัดทีม</Text>
          <View style={styles.teamRow}>
            {TEAMS.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.teamChip,
                  {
                    borderColor: team === t.id ? t.color : '#D1D5DB',
                    backgroundColor: team === t.id ? `${t.color}22` : 'transparent',
                  },
                ]}
                onPress={() => setTeam(t.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.teamChipText, { color: team === t.id ? t.color : subTextColor }]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.saveButton, !name.trim() && styles.saveDisabled]}
            onPress={handleSave}
            disabled={saving || !name.trim()}
            activeOpacity={0.85}
          >
            <Text style={styles.saveText}>{saving ? 'กำลังบันทึก...' : 'บันทึก'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    borderRadius: 18,
    padding: 18,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '600',
  },
  teamRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  teamChip: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  teamChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  saveButton: {
    backgroundColor: '#0A7EA4',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveDisabled: {
    opacity: 0.5,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
