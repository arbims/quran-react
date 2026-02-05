import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ARABIC_FONT } from '../constants';

interface AudioRangeModalProps {
  visible: boolean;
  currentPage: number;
  onClose: () => void;
  onConfirm: (startPage: number, endPage: number) => void;
  onPlayCurrentPage?: (page: number) => void;
}

export const AudioRangeModal: React.FC<AudioRangeModalProps> = ({
  visible,
  currentPage,
  onClose,
  onConfirm,
  onPlayCurrentPage,
}) => {
  const [playOnlyCurrentPage, setPlayOnlyCurrentPage] = useState(true);
  const [useCurrentPage, setUseCurrentPage] = useState(true);
  const [startPageValue, setStartPageValue] = useState('');
  const [endPageValue, setEndPageValue] = useState('');

  // Réinitialiser les valeurs quand le modal s'ouvre
  useEffect(() => {
    if (visible) {
      setPlayOnlyCurrentPage(true);
      setUseCurrentPage(true);
      setStartPageValue('');
      setEndPageValue('');
    }
  }, [visible, currentPage]);

  const handleConfirm = () => {
    // Si on joue seulement la page courante
    if (playOnlyCurrentPage && onPlayCurrentPage) {
      onPlayCurrentPage(currentPage);
      onClose();
      return;
    }

    // Sinon, on joue une plage de pages
    const startPage = useCurrentPage ? currentPage : parseInt(startPageValue);
    const endPage = parseInt(endPageValue);

    // Validation
    if (isNaN(startPage) || startPage < 1 || startPage > 604) {
      return;
    }
    if (isNaN(endPage) || endPage < 1 || endPage > 604) {
      return;
    }
    if (startPage > endPage) {
      return;
    }

    onConfirm(startPage, endPage);
    onClose();
  };

  const isValid = () => {
    // Si on joue seulement la page courante, c'est toujours valide
    if (playOnlyCurrentPage) {
      return true;
    }

    // Sinon, valider la plage
    const startPage = useCurrentPage ? currentPage : parseInt(startPageValue);
    const endPage = parseInt(endPageValue);
    return (
      !isNaN(startPage) &&
      startPage >= 1 &&
      startPage <= 604 &&
      !isNaN(endPage) &&
      endPage >= 1 &&
      endPage <= 604 &&
      startPage <= endPage
    );
  };

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
            colors={['#44572C', '#5A6B3F', '#44572C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalGradient}
          >
            <View style={styles.modalHeader}>
              <Ionicons name="play-circle" size={28} color="#FFFFFF" />
              <Text style={styles.modalTitle} allowFontScaling={false}>تشغيل الصوت</Text>
            </View>
            <Text style={styles.modalSubtitle} allowFontScaling={false}>
              اختر طريقة التشغيل الصوتي
            </Text>

            {/* Option pour jouer seulement la page courante */}
            <View style={styles.section}>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel} allowFontScaling={false}>
                  {playOnlyCurrentPage ? `تشغيل الصفحة الحالية فقط (${currentPage})` : 'تشغيل نطاق من الصفحات'}
                </Text>
                <Switch
                  value={playOnlyCurrentPage}
                  onValueChange={setPlayOnlyCurrentPage}
                  thumbColor="#FFFFFF"
                  trackColor={{ false: 'rgba(255,255,255,0.3)', true: '#FFFFFF' }}
                />
              </View>
            </View>

            {!playOnlyCurrentPage && (
              <>
                {/* Section pour la page de début */}
                <View style={styles.section}>
                  <Text style={styles.sectionLabel} allowFontScaling={false}>من صفحة</Text>
                  <View style={styles.switchRow}>
                    <Text style={styles.switchLabel} allowFontScaling={false}>
                      {useCurrentPage ? `الصفحة الحالية (${currentPage})` : 'صفحة محددة'}
                    </Text>
                    <Switch
                      value={useCurrentPage}
                      onValueChange={setUseCurrentPage}
                      thumbColor="#FFFFFF"
                      trackColor={{ false: 'rgba(255,255,255,0.3)', true: '#FFFFFF' }}
                    />
                  </View>
                  {!useCurrentPage && (
                    <View style={styles.inputContainer}>
                      <Ionicons name="document-text-outline" size={20} color="#FFFFFF" style={styles.inputIcon} />
                      <TextInput
                        style={styles.pageInput}
                        value={startPageValue}
                        onChangeText={setStartPageValue}
                        placeholder="من صفحة"
                        placeholderTextColor="rgba(255, 255, 255, 0.6)"
                        keyboardType="numeric"
                        textAlign="right"
                        allowFontScaling={false}
                      />
                    </View>
                  )}
                </View>

                {/* Section pour la page de fin */}
                <View style={styles.section}>
                  <Text style={styles.sectionLabel} allowFontScaling={false}>إلى صفحة</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="document-text-outline" size={20} color="#FFFFFF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.pageInput}
                      value={endPageValue}
                      onChangeText={setEndPageValue}
                      placeholder="إلى صفحة"
                      placeholderTextColor="rgba(255, 255, 255, 0.6)"
                      keyboardType="numeric"
                      autoFocus={useCurrentPage}
                      textAlign="right"
                      allowFontScaling={false}
                    />
                  </View>
                </View>
              </>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalButtonConfirm,
                  !isValid() && styles.modalButtonDisabled,
                ]}
                onPress={handleConfirm}
                activeOpacity={0.8}
                disabled={!isValid()}
              >
                <Ionicons name="play" size={18} color={isValid() ? '#000000' : '#666666'} style={{ marginLeft: 6 }} />
                <Text
                  style={[
                    styles.modalButtonText,
                    { color: isValid() ? '#000000' : '#666666' },
                  ]}
                  allowFontScaling={false}
                >
                  تشغيل
                </Text>
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
    marginBottom: 24,
    fontWeight: '500',
    opacity: 0.9,
    fontFamily: ARABIC_FONT,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'right',
    marginBottom: 12,
    fontWeight: '600',
    fontFamily: ARABIC_FONT,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
  },
  switchLabel: {
    fontSize: 15,
    color: '#FFFFFF',
    textAlign: 'right',
    flex: 1,
    fontFamily: ARABIC_FONT,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
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
    marginTop: 8,
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
  modalButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    opacity: 0.5,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: ARABIC_FONT,
  },
});
