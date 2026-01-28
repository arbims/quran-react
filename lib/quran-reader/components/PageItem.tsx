import { Image } from 'expo-image';
import React, { useRef } from 'react';
import { GestureResponderEvent, ScrollView, StyleSheet, View } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
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
  
  // Zoom simple (pinch-to-zoom) partagé portrait/paysage
  const scale = useSharedValue(1);
  const scaleStart = useSharedValue(1);

  const pinchGesture = Gesture.Pinch()
    .onBegin(() => {
      // Sauvegarder le zoom actuel au début du pinch
      scaleStart.value = scale.value;
    })
    .onUpdate((event) => {
      // Appliquer un zoom multiplicatif par rapport au zoom de départ
      const next = scaleStart.value * event.scale;
      // Limiter le zoom entre x1 et x3
      const clamped = Math.max(1, Math.min(3, next));
      scale.value = clamped;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
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
          showsVerticalScrollIndicator={true}
          bounces={true}
          scrollEnabled={true}
          nestedScrollEnabled={true}
          scrollEventThrottle={16}
          onScrollBeginDrag={() => {
            isScrollingRef.current = true;
            isMovingRef.current = true;
            if (tapTimeoutRef.current) {
              clearTimeout(tapTimeoutRef.current);
              tapTimeoutRef.current = null;
            }
            lastTapTime.current = 0;
          }}
          onScrollEndDrag={() => {
            setTimeout(() => {
              isScrollingRef.current = false;
              isMovingRef.current = false;
            }, 200);
          }}
          onMomentumScrollBegin={() => {
            isScrollingRef.current = true;
            isMovingRef.current = true;
          }}
          onMomentumScrollEnd={() => {
            isScrollingRef.current = false;
            isMovingRef.current = false;
          }}
          onScroll={() => {
            if (tapTimeoutRef.current) {
              clearTimeout(tapTimeoutRef.current);
              tapTimeoutRef.current = null;
            }
            lastTapTime.current = 0;
          }}
        >
          <GestureDetector gesture={pinchGesture}>
            <Animated.View
              style={[
                { width: imageWidth, height: imageHeight },
                animatedStyle,
              ]}
              onStartShouldSetResponder={() => {
                return !isScrollingRef.current;
              }}
              onMoveShouldSetResponder={() => false}
              onResponderGrant={(e: GestureResponderEvent) => {
                touchStartXRef.current = e.nativeEvent.pageX;
                touchStartYRef.current = e.nativeEvent.pageY;
                isMovingRef.current = false;
              }}
              onResponderMove={(e: GestureResponderEvent) => {
                const dx = Math.abs(e.nativeEvent.pageX - touchStartXRef.current);
                const dy = Math.abs(e.nativeEvent.pageY - touchStartYRef.current);
                if (dx > 8 || dy > 8) {
                  isMovingRef.current = true;
                }
              }}
              onResponderRelease={(e: GestureResponderEvent) => {
                const now = Date.now();
                const dx = Math.abs(e.nativeEvent.pageX - touchStartXRef.current);
                const dy = Math.abs(e.nativeEvent.pageY - touchStartYRef.current);
                const moved = isMovingRef.current || dx > 8 || dy > 8;

                if (moved || isScrollingRef.current) {
                  isMovingRef.current = false;
                  return;
                }

                if (now - lastTapTime.current < 400) {
                  onToggleNavbar();
                  lastTapTime.current = 0;
                  if (tapTimeoutRef.current) {
                    clearTimeout(tapTimeoutRef.current);
                    tapTimeoutRef.current = null;
                  }
                } else {
                  lastTapTime.current = now;
                  if (tapTimeoutRef.current) {
                    clearTimeout(tapTimeoutRef.current);
                  }
                  tapTimeoutRef.current = setTimeout(() => {
                    if (!isScrollingRef.current && !isMovingRef.current) {
                      onToggleNavbar();
                    }
                    lastTapTime.current = 0;
                  }, 400);
                }
                isMovingRef.current = false;
              }}
              onResponderTerminationRequest={() => {
                isMovingRef.current = false;
                return true;
              }}
            >
              <Image 
                source={item.source} 
                style={{ 
                  width: imageWidth,
                  height: imageHeight
                }}
                contentFit="contain"
                cachePolicy="memory-disk"
              />
            </Animated.View>
          </GestureDetector>
        </ScrollView>
      </View>
    );
  } else {
    // Mode portrait : image zoomable
    const portraitBottomInset = Math.max(insets.bottom, 8);
    const portraitContainerHeight = height - navbarHeight - portraitBottomInset;
    return (
      <View style={[styles.pageContainer, { width: width, height: portraitContainerHeight, marginBottom: portraitBottomInset }]}>
        <GestureDetector gesture={pinchGesture}>
          <Animated.View style={[styles.image, animatedStyle]}>
            <Image source={item.source} style={styles.image} contentFit="fill" />
          </Animated.View>
        </GestureDetector>
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

