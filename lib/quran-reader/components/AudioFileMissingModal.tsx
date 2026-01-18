import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ARABIC_FONT } from '../constants';

interface AudioFileMissingModalProps {
  visible: boolean;
  pageNumber: number;
  onClose: () => void;
}

export const AudioFileMissingModal: React.FC<AudioFileMissingModalProps> = ({
  visible,
  pageNumber,
  onClose,
}) => {
  const formattedPage = pageNumber.toString().padStart(3, '0');

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#3F5FE8', '#5B7FFF', '#3F5FE8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Ionicons name="information-circle-outline" size={48} color="#FFA500" />
              <Text style={styles.modalTitle}>معلومة</Text>
              <Text style={styles.modalMessage}>
                لا يوجد ملف صوتي متاح لهذه الصفحة
              </Text>
              <Text style={styles.modalPageNumber}>
                صفحة {pageNumber} ({formattedPage}.mp3)
              </Text>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>حسناً</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalContent: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16,
    fontFamily: ARABIC_FONT,
    fontWeight: '600',
  },
  modalMessage: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: ARABIC_FONT,
    lineHeight: 24,
  },
  modalPageNumber: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontFamily: ARABIC_FONT,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFA500',
    backgroundColor: 'rgba(255, 165, 0, 0.2)',
  },
  buttonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: ARABIC_FONT,
    fontWeight: '500',
  },
});

