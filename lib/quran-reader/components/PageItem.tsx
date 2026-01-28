import { Image } from 'expo-image';
import React, { useRef, useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import { QuranPage } from '../types';

export interface PageItemProps {
  item: QuranPage;
  width: number;
  height: number;
  isLandscape: boolean;
  insets: { top: number; bottom: number };
  navbarVisible: boolean;
  onToggleNavbar: () => void;
}

export const PageItem = React.memo<PageItemProps>(({ item, width, height, isLandscape, insets, navbarVisible, onToggleNavbar }) => {
  const navbarHeight = isLandscape ? (navbarVisible ? Math.max(insets.top, 8) + 40 + 4 : Math.max(insets.top, 8)) : insets.top + 48;
  const bottomInset = isLandscape ? Math.max(insets.bottom, 60) : insets.bottom;
  const containerHeight = height - navbarHeight;
  const scrollViewRef = useRef<ScrollView>(null);
  const isScrollingRef = useRef<boolean>(false);
  const lastTapTime = useRef<number>(0);
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);
  const isMovingRef = useRef<boolean>(false);
  
  // États et refs pour le zoom - utiliser useSharedValue de Reanimated
  const [isZoomed, setIsZoomed] = useState(false);
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  
  // Fonction pour réinitialiser le zoom
  const resetZoom = React.useCallback(() => {
    scale.value = withSpring(1);
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    savedScale.value = 1;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    setIsZoomed(false);
  }, []);
  
  // Réinitialiser le zoom quand on change de page
  useEffect(() => {
    resetZoom();
  }, [item.number]);

  // Gesture de pincement pour zoomer
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e: { scale: number }) => {
      const newScale = Math.max(1, Math.min(4, savedScale.value * e.scale));
      scale.value = newScale;
      runOnJS(setIsZoomed)(newScale > 1);
    })
    .onEnd(() => {
      if (scale.value <= 1) {
        runOnJS(resetZoom)();
      } else {
        savedScale.value = scale.value;
      }
    });

  // Gesture de pan pour déplacer l'image zoomée
  // Utiliser failOffsetX très petit pour permettre le swipe horizontal de la FlatList
  // Le pan ne doit capturer que les mouvements verticaux/diagonaux quand zoomé
  const panGesture = Gesture.Pan()
    .minPointers(1)
    .maxPointers(1)
    .activeOffsetY([-20, 20]) // Activer seulement si mouvement vertical > 20px
    .failOffsetX([-5, 5]) // Échouer très rapidement si mouvement horizontal > 5px (permet le swipe horizontal de la FlatList)
    .onUpdate((e) => {
      // Ne capturer que si on est zoomé
      if (scale.value > 1) {
        // Calculer les limites en fonction de la taille réelle de l'image
        const scaledWidth = width * scale.value;
        const scaledHeight = containerHeight * scale.value;
        const maxTranslateX = (scaledWidth - width) / 2;
        const maxTranslateY = (scaledHeight - containerHeight) / 2;
        
        const newTranslateX = Math.max(
          -maxTranslateX,
          Math.min(maxTranslateX, savedTranslateX.value + e.translationX)
        );
        const newTranslateY = Math.max(
          -maxTranslateY,
          Math.min(maxTranslateY, savedTranslateY.value + e.translationY)
        );
        
        translateX.value = newTranslateX;
        translateY.value = newTranslateY;
      }
    })
    .onEnd(() => {
      if (scale.value > 1) {
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
      }
    });

  // Gesture de double-tap pour zoomer/dézoomer
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((e) => {
      if (scale.value > 1) {
        runOnJS(resetZoom)();
      } else {
        const targetScale = 2.5;
        // Calculer le point focal relatif au conteneur
        const focalX = e.x - width / 2;
        const focalY = e.y - containerHeight / 2;
        
        // Calculer la translation pour centrer le point de tap
        const newTranslateX = -focalX * (targetScale - 1);
        const newTranslateY = -focalY * (targetScale - 1);
        
        // Limiter la translation aux limites
        const scaledWidth = width * targetScale;
        const scaledHeight = containerHeight * targetScale;
        const maxTranslateX = (scaledWidth - width) / 2;
        const maxTranslateY = (scaledHeight - containerHeight) / 2;
        
        const clampedTranslateX = Math.max(-maxTranslateX, Math.min(maxTranslateX, newTranslateX));
        const clampedTranslateY = Math.max(-maxTranslateY, Math.min(maxTranslateY, newTranslateY));
        
        scale.value = withSpring(targetScale, {}, () => {
          runOnJS(setIsZoomed)(true);
        });
        translateX.value = withSpring(clampedTranslateX);
        translateY.value = withSpring(clampedTranslateY);
        
        savedScale.value = targetScale;
        savedTranslateX.value = clampedTranslateX;
        savedTranslateY.value = clampedTranslateY;
      }
    });

  // Combiner les gestures de manière conditionnelle
  // Si on n'est pas zoomé, ne pas inclure le pan pour permettre le swipe horizontal
  // Le pan utilise failOffsetX pour laisser passer les swipes horizontaux même quand zoomé
  const composedGesture = React.useMemo(() => {
    return Gesture.Race(
      doubleTapGesture,
      Gesture.Simultaneous(
        pinchGesture,
        panGesture
      )
    );
  }, []);

  // Composant d'image zoomable
  const ZoomableImage = ({ imageWidth, imageHeight, containerWidth, containerHeight: imgContainerHeight, contentFit = "contain" }: { imageWidth: number; imageHeight: number; containerWidth: number; containerHeight: number; contentFit?: "contain" | "fill" }) => {
    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { scale: scale.value },
          { translateX: translateX.value },
          { translateY: translateY.value },
        ],
      };
    });

    // Créer un gesture simplifié sans pan quand on n'est pas zoomé pour permettre le swipe horizontal
    const simpleGesture = React.useMemo(() => {
      return Gesture.Race(
        doubleTapGesture,
        pinchGesture
      );
    }, []);

    // Utiliser le gesture complet seulement quand zoomé, sinon utiliser le gesture simple
    const currentGesture = isZoomed ? composedGesture : simpleGesture;

    return (
      <GestureDetector gesture={currentGesture}>
        <View style={{ width: containerWidth, height: imgContainerHeight, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
          <Animated.View
            style={[
              {
                width: imageWidth,
                height: imageHeight,
              },
              animatedStyle,
            ]}
          >
            <Image 
              source={item.source} 
              style={{ 
                width: imageWidth,
                height: imageHeight
              }}
              contentFit={contentFit}
              cachePolicy="memory-disk"
            />
          </Animated.View>
        </View>
      </GestureDetector>
    );
  };

  if (isLandscape) {
    // Mode paysage : image avec padding horizontal, hauteur auto et scroll
    const horizontalPadding = 20;
    const imageWidth = width - (horizontalPadding * 2);
    const imageAspectRatio = 1.4; // Ratio typique d'une page de Quran
    const imageHeight = imageWidth * imageAspectRatio;
    
    return (
      <View 
        style={{ 
          width: width, 
          height: containerHeight,
          backgroundColor: '#fff',
          flexDirection: 'row'
        }}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ 
            paddingHorizontal: horizontalPadding,
            paddingBottom: 0,
            alignItems: 'center'
          }}
          showsVerticalScrollIndicator={!isZoomed}
          bounces={!isZoomed}
          scrollEnabled={!isZoomed}
          nestedScrollEnabled={true}
          scrollEventThrottle={16}
          onScrollBeginDrag={() => {
            if (!isZoomed) {
              isScrollingRef.current = true;
              isMovingRef.current = true;
              if (tapTimeoutRef.current) {
                clearTimeout(tapTimeoutRef.current);
                tapTimeoutRef.current = null;
              }
              lastTapTime.current = 0;
            }
          }}
          onScrollEndDrag={() => {
            setTimeout(() => {
              isScrollingRef.current = false;
              isMovingRef.current = false;
            }, 200);
          }}
          onMomentumScrollBegin={() => {
            if (!isZoomed) {
              isScrollingRef.current = true;
              isMovingRef.current = true;
            }
          }}
          onMomentumScrollEnd={() => {
            isScrollingRef.current = false;
            isMovingRef.current = false;
          }}
          onScroll={() => {
            if (!isZoomed && tapTimeoutRef.current) {
              clearTimeout(tapTimeoutRef.current);
              tapTimeoutRef.current = null;
            }
            if (!isZoomed) {
              lastTapTime.current = 0;
            }
          }}
        >
          <ZoomableImage 
            imageWidth={imageWidth} 
            imageHeight={imageHeight} 
            containerWidth={imageWidth}
            containerHeight={imageHeight}
          />
        </ScrollView>
      </View>
    );
  } else {
    // Mode portrait : image zoomable
    const portraitBottomInset = Math.max(insets.bottom, 8);
    const portraitContainerHeight = height - navbarHeight - portraitBottomInset;
    const imageWidth = width;
    const imageHeight = portraitContainerHeight;
    
    return (
      <View style={[styles.pageContainer, { width: width, height: portraitContainerHeight, marginBottom: portraitBottomInset }]}>
        <ZoomableImage 
          imageWidth={imageWidth} 
          imageHeight={imageHeight} 
          containerWidth={width}
          containerHeight={portraitContainerHeight}
          contentFit="fill"
        />
      </View>
    );
  }
}, (prevProps, nextProps) => {
  // Comparaison personnalisée pour éviter les re-renders inutiles
  return (
    prevProps.item.number === nextProps.item.number &&
    prevProps.width === nextProps.width &&
    prevProps.height === nextProps.height &&
    prevProps.isLandscape === nextProps.isLandscape &&
    prevProps.insets.top === nextProps.insets.top &&
    prevProps.insets.bottom === nextProps.insets.bottom &&
    prevProps.navbarVisible === nextProps.navbarVisible
  );
});

PageItem.displayName = 'PageItem';

const styles = StyleSheet.create({
  pageContainer: { justifyContent: 'flex-start', alignItems: 'center' },
  image: { width: '100%', height: '100%' },
});

