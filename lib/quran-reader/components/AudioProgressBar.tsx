import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ARABIC_FONT } from '../constants';

/**
 * Floating movable AudioProgressBar
 * - Floats above content (position absolute, rounded corners, shadow)
 * - Draggable: drag the top area (reciter + controls) to move the bar anywhere on screen
 * - Seek: drag horizontally on the progress strip to seek
 * - Default position: bottom of screen; position persists while moved
 */

const BAR_APPROX_HEIGHT = 160;
const MARGIN = 16;

interface AudioProgressBarProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isLoading: boolean;
  onSeek: (time: number) => void;
  onPlayPause: () => void;
  onStop: () => void;
  isLooping: boolean;
  onToggleLoop: () => void;
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
  isLooping,
  onToggleLoop,
}) => {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  const progressBarRef = useRef<View>(null);
  const barWidth = Math.max(screenWidth - 2 * MARGIN, 200);

  const [hasUserMovedBar, setHasUserMovedBar] = useState(false);
  const getBottomY = () =>
    Math.max(0, screenHeight - BAR_APPROX_HEIGHT - MARGIN - Math.max(insets.bottom, 0));
  const [position, setPosition] = useState(() => ({ x: MARGIN, y: 0 }));
  const positionRef = useRef(position);
  positionRef.current = position;
  const dragStartPosition = useRef({ x: MARGIN, y: 0 });

  React.useEffect(() => {
    if (!hasUserMovedBar) {
      const y = getBottomY();
      setPosition((prev) => ({ x: MARGIN, y }));
      dragStartPosition.current = { x: MARGIN, y };
    }
  }, [screenHeight, insets.bottom, hasUserMovedBar]);

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

  const isDraggingBarRef = useRef(false);

  const moveBarPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        dragStartPosition.current = positionRef.current;
      },
      onPanResponderMove: (_, gestureState) => {
        isDraggingBarRef.current = true;
        setHasUserMovedBar(true);
        const { dx, dy } = gestureState;
        const start = dragStartPosition.current;
        const newX = Math.max(0, Math.min(screenWidth - barWidth, start.x + dx));
        const newY = Math.max(0, Math.min(screenHeight - BAR_APPROX_HEIGHT, start.y + dy));
        setPosition({ x: newX, y: newY });
      },
      onPanResponderRelease: () => {
        dragStartPosition.current = positionRef.current;
        setTimeout(() => {
          isDraggingBarRef.current = false;
        }, 150);
      },
    })
  ).current;

  const containerStyle = hasUserMovedBar
    ? { left: position.x, top: position.y, width: barWidth, paddingBottom: 16 }
    : {
        bottom: MARGIN + Math.max(insets.bottom, 0),
        left: MARGIN,
        right: MARGIN,
        width: undefined,
        paddingBottom: 16,
      };

  return (
    <LinearGradient
      colors={['rgba(68, 87, 44, 0.98)', 'rgba(90, 107, 63, 0.98)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[styles.container, containerStyle]}
      onStartShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false}
      onTouchStart={(e) => {
        e.stopPropagation();
      }}
      onTouchEnd={(e) => {
        e.stopPropagation();
      }}
    >
      <View style={styles.content}>
        {/* Zone déplaçable : toute la barre sauf la barre de progression (pour pouvoir déplacer en touchant n'importe où) */}
        <View style={styles.draggableArea} {...moveBarPanResponder.panHandlers}>
          <View style={styles.reciterContainer}>
            <Ionicons name="reorder-three" size={20} color="rgba(255,255,255,0.7)" style={styles.dragHandleIcon} />
            <Text style={styles.reciterText} allowFontScaling={false}>الشيخ عادل ريان</Text>
          </View>
        
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
          
          <TouchableOpacity
            onPress={onToggleLoop}
            disabled={isLoading}
            style={[styles.controlButton, isLooping && styles.controlButtonActive]}
            activeOpacity={0.7}
          >
            <Ionicons
              name="repeat"
              size={24}
              color={isLooping ? "#FFD700" : "#FFFFFF"}
            />
          </TouchableOpacity>
          
          <View style={styles.timeContainer}>
            <Text style={styles.timeText} allowFontScaling={false}>{formatTime(isDragging ? (dragProgress / 100) * duration : currentTime)}</Text>
            <Text style={styles.separatorText} allowFontScaling={false}>/</Text>
            <Text style={styles.timeText} allowFontScaling={false}>{duration > 0 ? formatTime(duration) : '--:--'}</Text>
          </View>
        </View>
        </View>
        
        {/* Barre de progression (glisser horizontalement pour seek) */}
        <View
          ref={progressBarRef}
          style={styles.progressBarContainer}
          {...panResponder.panHandlers}
        >
          <View style={styles.progressBarBackground}>
            <LinearGradient
              colors={['#5A6B3F', '#44572C', '#3A4A25']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
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
    paddingTop: 16,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    zIndex: 1000,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  content: {
    width: '100%',
  },
  draggableArea: {
    width: '100%',
    paddingVertical: 4,
  },
  reciterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  dragHandleIcon: {
    marginRight: 8,
  },
  reciterText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    fontFamily: ARABIC_FONT,
    fontWeight: '500',
    textAlign: 'center',
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
  controlButtonActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    borderColor: 'rgba(255, 215, 0, 0.5)',
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
    borderColor: '#3A4A25',
    marginLeft: -11, // Pour centrer le thumb sur la position
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
});

