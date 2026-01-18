import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ARABIC_FONT } from '../constants';
import { AudioDownloadPreference } from '../utils/audioDownload';

interface AudioDownloadModalProps {
  visible: boolean;
  isDownloading?: boolean;
  downloadProgress?: number;
  onClose: () => void;
  onConfirm: (preference: AudioDownloadPreference, downloadNow: boolean) => void;
  onCancel: () => void;
}

export const AudioDownloadModal: React.FC<AudioDownloadModalProps> = ({
  visible,
  isDownloading = false,
  downloadProgress = 0,
  onClose,
  onConfirm,
  onCancel,
}) => {
  const handleDownload = () => {
    // Télécharger maintenant seulement, mais garder la préférence 'ask' pour la prochaine fois
    onConfirm('ask', true);
  };

  const handleDownloadAlways = () => {
    // Toujours télécharger automatiquement
    onConfirm('always', true);
  };

  const handleNever = () => {
    // Ne jamais télécharger, utiliser le streaming
    onConfirm('never', false);
  };

  const handleCancel = () => {
    onCancel();
    onClose();
  };

  const progressPercentage = Math.round(downloadProgress * 100);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCancel}
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
              <Ionicons 
                name={isDownloading ? "cloud-download" : "cloud-download-outline"} 
                size={48} 
                color="#FFFFFF" 
              />
              <Text style={styles.modalTitle}>
                {isDownloading ? 'جاري التحميل...' : 'تحميل الملفات الصوتية'}
              </Text>
              {!isDownloading && (
                <>
                  <Text style={styles.modalSubtitle}>
                    هل تريد تحميل الملفات الصوتية لتشغيلها بدون اتصال بالإنترنت؟
                  </Text>
                  <Text style={styles.modalDescription}>
                    سيتم تحميل الملفات الصوتية عند الحاجة لتقليل حجم التطبيق.
                  </Text>
                </>
              )}
              
              {isDownloading && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
                  </View>
                  <Text style={styles.progressText}>{progressPercentage}%</Text>
                  <ActivityIndicator size="small" color="#2196F3" style={styles.loader} />
                </View>
              )}
            </View>

            {!isDownloading && (
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.downloadButton]}
                onPress={handleDownloadAlways}
                activeOpacity={0.7}
              >
                <Ionicons name="cloud-download" size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>تحميل دائماً</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.downloadOnceButton]}
                onPress={handleDownload}
                activeOpacity={0.7}
              >
                <Ionicons name="download-outline" size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>تحميل الآن فقط</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.neverButton]}
                onPress={handleNever}
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle-outline" size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>لا، شكراً</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>إلغاء</Text>
              </TouchableOpacity>
            </View>
            )}
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
    marginBottom: 8,
    fontFamily: ARABIC_FONT,
    fontWeight: '600',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: ARABIC_FONT,
    lineHeight: 24,
  },
  modalDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontFamily: ARABIC_FONT,
    lineHeight: 20,
  },
  modalButtons: {
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    gap: 8,
  },
  downloadButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    borderColor: '#4CAF50',
  },
  downloadOnceButton: {
    backgroundColor: 'rgba(33, 150, 243, 0.3)',
    borderColor: '#2196F3',
  },
  neverButton: {
    backgroundColor: 'rgba(158, 158, 158, 0.3)',
    borderColor: '#9E9E9E',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(255, 255, 255, 0.5)',
    marginTop: 4,
  },
  buttonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: ARABIC_FONT,
    fontWeight: '500',
  },
  cancelButtonText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: ARABIC_FONT,
  },
  progressContainer: {
    width: '100%',
    marginTop: 24,
    alignItems: 'center',
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: ARABIC_FONT,
    fontWeight: '600',
    marginBottom: 8,
  },
  loader: {
    marginTop: 8,
  },
});

