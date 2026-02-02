import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ARABIC_FONT } from '../constants';

interface AudioDownloadModalProps {
  visible: boolean;
  isDownloading?: boolean;
  downloadProgress?: number;
  downloadError?: string | null;
  onClose: () => void;
  onConfirm: (downloadNow: boolean) => void;
  onRetry?: () => void;
  onCancel: () => void;
}

export const AudioDownloadModal: React.FC<AudioDownloadModalProps> = ({
  visible,
  isDownloading = false,
  downloadProgress = 0,
  downloadError = null,
  onClose,
  onConfirm,
  onRetry,
  onCancel,
}) => {
  const handleDownload = () => {
    onConfirm(true);
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
            colors={['#44572C', '#5A6B3F', '#44572C']}
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
              <Text style={styles.modalTitle} allowFontScaling={false}>
                {isDownloading ? 'جاري التحميل...' : 'تحميل الملفات الصوتية'}
              </Text>
              {!isDownloading && (
                <>
                  <Text style={styles.modalSubtitle} allowFontScaling={false}>
                    هل تريد تحميل الملفات الصوتية لتشغيلها بدون اتصال بالإنترنت؟
                  </Text>
                  <Text style={styles.modalDescription} allowFontScaling={false}>
                    سيتم تحميل الملفات الصوتية عند الحاجة لتقليل حجم التطبيق.
                  </Text>
                </>
              )}
              
              {isDownloading && !downloadError && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
                  </View>
                  <Text style={styles.progressText} allowFontScaling={false}>{progressPercentage}%</Text>
                  <ActivityIndicator size="small" color="#44572C" style={styles.loader} />
                </View>
              )}

              {downloadError && (
                <View style={styles.errorContainer}>
                  <Ionicons name="warning" size={32} color="#FFC107" />
                  <Text style={styles.errorText} allowFontScaling={false}>
                    فشل التحميل أو الملف تالف. جرب مرة أخرى.
                  </Text>
                  <View style={styles.errorButtons}>
                    {onRetry && (
                      <TouchableOpacity
                        style={[styles.button, styles.retryButton]}
                        onPress={onRetry}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="refresh" size={20} color="#FFFFFF" />
                        <Text style={styles.buttonText} allowFontScaling={false}>إعادة المحاولة</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[styles.button, styles.cancelButton]}
                      onPress={handleCancel}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.cancelButtonText} allowFontScaling={false}>إلغاء</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            {!isDownloading && !downloadError && (
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.downloadButton]}
                onPress={handleDownload}
                activeOpacity={0.7}
              >
                <Ionicons name="cloud-download" size={20} color="#FFFFFF" />
                <Text style={styles.buttonText} allowFontScaling={false}>تحميل</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText} allowFontScaling={false}>إلغاء</Text>
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
    borderColor: '#44572C',
  },
  retryButton: {
    backgroundColor: 'rgba(255, 152, 0, 0.4)',
    borderColor: '#FFC107',
    marginTop: 12,
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
    backgroundColor: '#44572C',
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
  errorContainer: {
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#FFC107',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: ARABIC_FONT,
    lineHeight: 20,
  },
  errorButtons: {
    marginTop: 12,
    gap: 8,
    width: '100%',
  },
});

