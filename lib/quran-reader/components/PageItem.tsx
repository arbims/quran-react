import { Image } from 'expo-image';
import { ColorMatrix, invert } from 'react-native-color-matrix-image-filters';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { QuranPage } from '../types';

export interface PageItemProps {
  item: QuranPage;
  width: number;
  height: number;
  isLandscape: boolean;
  insets: { top: number; bottom: number; left?: number; right?: number };
  navbarVisible: boolean;
  isDarkMode?: boolean;
}

export const PageItem = React.memo<PageItemProps>(({ item, width, height, isLandscape, insets, navbarVisible, isDarkMode = false }) => {
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    setImageSize(null);
  }, [item.number]);

  // En paysage : hauteur navbar dépend de navbarVisible (tap hide/show). En portrait : toujours visible
  const navbarHeight = isLandscape
    ? (navbarVisible ? Math.max(insets.top, 8) + 40 + 4 : Math.max(insets.top, 8))
    : insets.top + 48;
  const containerHeight = height - navbarHeight;

  // --- Zoom (pinch-to-zoom) simple, sans pan ---
  // Objectif: ne pas casser le swipe horizontal de la FlatList.
  const scale = useSharedValue(1);
  const scaleStart = useSharedValue(1);

  const pinchGesture = Gesture.Pinch()
    .onBegin(() => {
      scaleStart.value = scale.value;
    })
    .onUpdate((event) => {
      const next = scaleStart.value * event.scale;
      scale.value = Math.max(1, Math.min(3, next)); // clamp x1..x3
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (isLandscape) {
    // Mode paysage : marge des deux côtés pour la barre de navigation Android
    const landscapeNavMargin = Math.max(insets.left ?? 0, insets.right ?? 0, 48);
    const landscapeContainerHeight = height - navbarHeight;
    const imageWidth = width - landscapeNavMargin * 2;
    const imageHeight = imageSize
      ? (imageWidth / imageSize.width) * imageSize.height
      : imageWidth * 1.4;

    return (
      <View
        style={[
          styles.pageContainer,
          {
            width: width,
            height: landscapeContainerHeight,
            backgroundColor: isDarkMode ? '#000000' : '#ffffff',
          },
        ]}
      >
        <ScrollView
          style={styles.portraitScrollView}
          contentContainerStyle={[styles.portraitScrollContent, { paddingHorizontal: landscapeNavMargin }]}
          showsVerticalScrollIndicator={true}
          bounces={true}
        >
          <GestureDetector gesture={pinchGesture}>
            <Animated.View style={[styles.portraitImageWrapper, { width: imageWidth, height: imageHeight }, animatedStyle]}>
              {isDarkMode ? (
                <ColorMatrix matrix={invert()}>
                  <Image
                    source={item.source}
                    style={{ width: imageWidth, height: imageHeight }}
                    contentFit="contain"
                    onLoad={(e) => setImageSize({ width: e.source.width, height: e.source.height })}
                    cachePolicy="memory-disk"
                  />
                </ColorMatrix>
              ) : (
                <Image
                  source={item.source}
                  style={{ width: imageWidth, height: imageHeight }}
                  contentFit="contain"
                  onLoad={(e) => setImageSize({ width: e.source.width, height: e.source.height })}
                  cachePolicy="memory-disk"
                />
              )}
            </Animated.View>
          </GestureDetector>
        </ScrollView>
      </View>
    );
  } else {
    // Mode portrait : image 100% x 100% (remplit tout l'espace) - flex: 1 pour tous les écrans
    const portraitBottomInset = Math.max(insets.bottom, 24);
    // Ajouter 3px pour laisser la place à la barre de progression
    const progressBarHeight = 3;

    return (
      <View
        style={[
          styles.pageContainer,
          styles.portraitContainer,
          {
            width,
            marginBottom: portraitBottomInset + progressBarHeight,
            backgroundColor: isDarkMode ? '#000000' : '#ffffff',
          },
        ]}
      >
        <GestureDetector gesture={pinchGesture}>
          <Animated.View style={[styles.imageWrapper, animatedStyle]}>
            {isDarkMode ? (
              <ColorMatrix matrix={invert()}>
                <Image source={item.source} style={[styles.image, { marginTop: 3 }]} contentFit="fill" />
              </ColorMatrix>
            ) : (
              <Image source={item.source} style={[styles.image, { marginTop: 3 }]} contentFit="fill" />
            )}
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
  pageContainer: { justifyContent: 'flex-start', alignItems: 'stretch' },
  portraitContainer: { flex: 1 },
  imageWrapper: { width: '100%', height: '100%', flex: 1, position: 'relative' },
  image: { width: '100%', height: '100%' },
  portraitScrollView: { flex: 1 },
  portraitScrollContent: { flexGrow: 1, alignItems: 'center' },
  portraitImageWrapper: { alignItems: 'center', justifyContent: 'center', position: 'relative' },
});

