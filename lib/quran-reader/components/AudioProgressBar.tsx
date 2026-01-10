import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ARABIC_FONT } from '../constants';

interface AudioProgressBarProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isLoading: boolean;
  onSeek: (time: number) => void;
  onPlayPause: () => void;
  onStop: () => void;
}

// Fonction utilitaire pour formater le temps en mm:ss
const formatTime = (seconds: number): string => {
  if (!isFinite(seconds) || isNaN(seconds) || seconds < 0) {
    return '00:00';
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const AudioProgressBar: React.FC<AudioProgressBarProps> = ({
  currentTime,
  duration,
  isPlaying,
  isLoading,
  onSeek,
  onPlayPause,
  onStop,
}) => {
  const insets = useSafeAreaInsets();
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  const progressBarRef = useRef<View>(null);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const displayProgress = isDragging ? dragProgress : progress;

  const updateSeekPosition = (pageX: number, shouldSeek = false) => {
    if (progressBarRef.current && duration > 0) {
      progressBarRef.current.measure((fx, fy, width, height, px, py) => {
        // px est la position absolue X de la barre
        const relativePosition = Math.max(0, Math.min(1, (pageX - px) / width));
        const seekTime = relativePosition * duration;
        setDragProgress(relativePosition * 100);
        // Appeler onSeek seulement si demandé (pour éviter trop d'appels pendant le drag)
        if (shouldSeek) {
          onSeek(seekTime);
        }
      });
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Activer le responder seulement si le mouvement est horizontal (plus de 10px)
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderGrant: (evt) => {
        setIsDragging(true);
        // Mettre à jour visuellement immédiatement au début (sans seek audio encore)
        updateSeekPosition(evt.nativeEvent.pageX, false);
      },
      onPanResponderMove: (evt) => {
        // Mettre à jour visuellement pendant le drag (la position visuelle change en temps réel)
        // On ne fait pas le seek audio à chaque mouvement pour éviter trop d'appels
        updateSeekPosition(evt.nativeEvent.pageX, false);
      },
      onPanResponderRelease: (evt) => {
        // Au release, appliquer le seek audio avec la position finale
        updateSeekPosition(evt.nativeEvent.pageX, true);
        setIsDragging(false);
      },
      onPanResponderTerminate: (evt) => {
        // En cas d'annulation (par exemple, une autre interaction), appliquer quand même le seek
        updateSeekPosition(evt.nativeEvent.pageX, true);
        setIsDragging(false);
      },
    })
  ).current;

  // La visibilité est maintenant entièrement contrôlée par le composant parent
  // Ne pas retourner null ici pour éviter les animations de disparition/réapparition
  // Le parent (quran-reader.tsx) gère la visibilité via audioProgressBarVisible

  return (
    <LinearGradient
      colors={['rgba(26, 26, 26, 0.95)', 'rgba(45, 45, 45, 0.95)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}
      onStartShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false}
      onTouchStart={(e) => {
        // Empêcher la propagation pour que la barre ne se cache pas quand on clique dessus
        e.stopPropagation();
      }}
      onTouchEnd={(e) => {
        // Empêcher la propagation pour que la barre ne se cache pas quand on clique dessus
        e.stopPropagation();
      }}
    >
      <View style={styles.content}>
        {/* Boutons de contrôle */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            onPress={onPlayPause}
            disabled={isLoading}
            style={[styles.controlButton, isLoading && styles.controlButtonDisabled]}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={onStop}
            disabled={isLoading}
            style={[styles.controlButton, isLoading && styles.controlButtonDisabled]}
            activeOpacity={0.7}
          >
            <Ionicons
              name="stop"
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>
          
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(isDragging ? (dragProgress / 100) * duration : currentTime)}</Text>
            <Text style={styles.separatorText}>/</Text>
            <Text style={styles.timeText}>{duration > 0 ? formatTime(duration) : '--:--'}</Text>
          </View>
        </View>
        
        {/* Barre de progression */}
        <View
          ref={progressBarRef}
          style={styles.progressBarContainer}
          {...panResponder.panHandlers}
        >
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(Math.max(displayProgress, 0), 100)}%` }
              ]}
            />
            <View
              style={[
                styles.progressBarThumb,
                { left: `${Math.min(Math.max(displayProgress, 0), 100)}%` }
              ]}
            />
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    paddingTop: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 1000,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  content: {
    width: '100%',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  controlButtonDisabled: {
    opacity: 0.5,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: 8,
  },
  timeText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    fontFamily: ARABIC_FONT,
    fontWeight: '600',
    minWidth: 45,
    textAlign: 'center',
  },
  separatorText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.6,
    fontFamily: ARABIC_FONT,
  },
  progressBarContainer: {
    width: '100%',
    height: 40,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  progressBarBackground: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'visible',
    position: 'relative',
  },
  progressBarFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
    minWidth: 2,
  },
  progressBarThumb: {
    position: 'absolute',
    top: -8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#1a1a1a',
    marginLeft: -11, // Pour centrer le thumb sur la position
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
});

