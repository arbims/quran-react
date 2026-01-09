import React from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ARABIC_FONT } from '../constants';

interface PageInputModalProps {
  visible: boolean;
  pageInputValue: string;
  onPageInputChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export const PageInputModal: React.FC<PageInputModalProps> = ({
  visible,
  pageInputValue,
  onPageInputChange,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          <LinearGradient
            colors={['#1a1a1a', '#2d2d2d', '#1a1a1a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalGradient}
          >
            <View style={styles.modalHeader}>
              <Ionicons name="navigate" size={28} color="#FFFFFF" />
              <Text style={styles.modalTitle}>الانتقال إلى صفحة</Text>
            </View>
            <Text style={styles.modalSubtitle}>أدخل رقم الصفحة (2 - 604)</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="document-text-outline" size={20} color="#FFFFFF" style={styles.inputIcon} />
              <TextInput
                style={styles.pageInput}
                value={pageInputValue}
                onChangeText={onPageInputChange}
              placeholder="رقم الصفحة"
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
                keyboardType="numeric"
                autoFocus={true}
                textAlign="right"
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={onConfirm}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark" size={18} color="#000000" style={{ marginLeft: 6 }} />
                <Text style={[styles.modalButtonText, { color: '#000000' }]}>انتقل</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 24,
    width: '85%',
    maxWidth: 400,
    elevation: 16,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
  },
  modalGradient: {
    padding: 28,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'right',
    marginRight: 10,
    letterSpacing: 0.3,
    fontFamily: ARABIC_FONT,
  },
  modalSubtitle: {
    fontSize: 15,
    color: '#FFFFFF',
    textAlign: 'right',
    marginBottom: 20,
    fontWeight: '500',
    opacity: 0.9,
    fontFamily: ARABIC_FONT,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginLeft: 12,
  },
  pageInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 18,
    textAlign: 'right',
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: ARABIC_FONT,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  modalButtonCancel: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  modalButtonConfirm: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: ARABIC_FONT,
  },
});

