import AsyncStorage from '@react-native-async-storage/async-storage';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import * as NavigationBar from 'expo-navigation-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  I18nManager,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Imports des modules refactorisés
import { AudioProgressBar } from '@/lib/quran-reader/components/AudioProgressBar';
import { Navbar } from '@/lib/quran-reader/components/Navbar';
import { PageInputModal } from '@/lib/quran-reader/components/PageInputModal';
import { PageItem } from '@/lib/quran-reader/components/PageItem';
import { Sidebar } from '@/lib/quran-reader/components/Sidebar';
import { HIFDH_KEY, LAST_READ_KEY, SIDEBAR_WIDTH } from '@/lib/quran-reader/constants';
import { useOrientation } from '@/lib/quran-reader/hooks/useOrientation';
import { useAudioPlayer } from '@/lib/quran-reader/hooks/useAudioPlayer';
import { allQuranPages, findPageIndexForSurah, getCurrentSurah, reversedQuranPages } from '@/lib/quran-reader/utils';

// Import des données depuis les modules refactorisés
// Les modules ont été déplacés vers @/lib/quran-reader/ pour éviter qu'Expo Router les traite comme des routes

export default function QuranReaderScreen() {
  const { id, page } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  
  
  const flatListRef = useRef<FlatList>(null);
  // Initialiser l'animation en fonction de RTL
  const initialSlideValue = I18nManager.isRTL ? -SIDEBAR_WIDTH : SIDEBAR_WIDTH;
  const slideAnim = useRef(new Animated.Value(initialSlideValue)).current;
  const [surahListVisible, setSurahListVisible] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState<number | null>(null);

  // Toggle manuel pour activer/désactiver le mode paysage
  const [landscapeEnabled, setLandscapeEnabled] = useState(false);
  // Détecter si on est en mode paysage (et que le mode paysage est autorisé)
  const isLandscape = landscapeEnabled && width > height;

  // Calcul de l'index de départ
  const getStartIndex = () => {
    // Si un numéro de page est spécifié, utiliser cette page
    if (page) {
      const pageNum = Number(page);
      const originalIndex = allQuranPages.findIndex(p => p.number === pageNum);
      if (originalIndex !== -1) {
        return reversedQuranPages.length - 1 - originalIndex;
      }
    }
    // Sinon, utiliser l'ID de la sourate
    return findPageIndexForSurah(Number(id));
  };

  const startIndex = getStartIndex();
  const finalStartIndex = startIndex !== -1 ? startIndex : 0;

  const [currentPage, setCurrentPage] = useState<number>(reversedQuranPages[finalStartIndex]?.number || 2);
  const [hifdhPage, setHifdhPage] = useState<number | null>(null);
  const [lastReadPage, setLastReadPage] = useState<number | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [pageInputVisible, setPageInputVisible] = useState(false);
  const [pageInputValue, setPageInputValue] = useState('');
  const [navbarVisible, setNavbarVisible] = useState(true);
  const [audioProgressBarVisible, setAudioProgressBarVisible] = useState(false); // Cachée par défaut
  const isStoppingRef = useRef(false); // Flag pour éviter les animations lors du stop
  const lastTouchTimeRef = useRef<number>(0); // Pour détecter les clics simples
  const touchStartTimeRef = useRef<number>(0); // Temps de début du touch
  const touchStartYRef = useRef<number>(0); // Position Y du début du touch

  // Hook pour la lecture audio
  const { isPlaying: isAudioPlaying, isLoading: isAudioLoading, error: audioError, play: playAudio, pause: pauseAudio, stop: stopAudio, seek: seekAudio, currentPage: audioCurrentPage, currentTime: audioCurrentTime, duration: audioDuration } = useAudioPlayer();

  // Gérer la visibilité de la barre de progression (un seul useEffect pour éviter les animations)
  useEffect(() => {
    // VÉRIFIER LE FLAG EN PREMIER pour éviter toute modification pendant le stop
    // Si le flag est actif, ignorer complètement ce useEffect
    if (isStoppingRef.current) {
      return;
    }
    
    // Afficher la barre quand l'audio commence à jouer
    if (isAudioPlaying) {
      setAudioProgressBarVisible(true);
      return;
    }
    
    // Si l'audio est en pause et qu'on a une durée ou une page active, garder la barre visible
    // (seulement si elle était déjà visible, pas au démarrage)
    if (!isAudioPlaying && (audioDuration > 0 || audioCurrentPage)) {
      // La barre reste visible si elle était déjà affichée (gérée par l'état précédent)
      // On ne force pas l'affichage ici pour respecter l'état par défaut (caché)
      return;
    }
  }, [isAudioPlaying, audioDuration, audioCurrentPage]);

  // Si on revient en mode portrait, forcer la navbar à réapparaître
  useEffect(() => {
    if (!isLandscape && !navbarVisible) {
      setNavbarVisible(true);
    }
  }, [isLandscape, navbarVisible]);

  const currentSurah = getCurrentSurah(currentPage);

  useEffect(() => {
    loadStorage();
    
    // Forcer le layout LTR pour éviter les problèmes RTL
    if (I18nManager.isRTL) {
      I18nManager.forceRTL(false);
      I18nManager.allowRTL(false);
      if (Platform.OS === 'android') {
        // Nécessite un redémarrage de l'app sur Android
        // Mais on peut quand même forcer le layout
      }
    }
    
    // Afficher la barre de navigation Android
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('visible');
    }
    
    // Empêcher l'écran de se mettre en veille
    activateKeepAwakeAsync();
    
    // Nettoyer à la sortie
    return () => {
      if (Platform.OS === 'android') {
        NavigationBar.setVisibilityAsync('visible');
      }
      deactivateKeepAwake();
    };
  }, []);

  // Utiliser le hook pour gérer l'orientation
  useOrientation(landscapeEnabled);

  // Restaurer la page actuelle lors de la rotation
  useEffect(() => {
    if (currentPageIndex !== null && flatListRef.current) {
      // Petit délai pour s'assurer que le layout est mis à jour
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ 
          index: currentPageIndex, 
          animated: false 
        });
      }, 100);
    }
  }, [width, height, currentPageIndex]);

  const loadStorage = async () => {
    const [hifdh, lastRead] = await Promise.all([
      AsyncStorage.getItem(HIFDH_KEY),
      AsyncStorage.getItem(LAST_READ_KEY),
    ]);
    if (hifdh) setHifdhPage(Number(hifdh));
    if (lastRead) setLastReadPage(Number(lastRead));
  };

  const toggleMenu = () => {
    if (!menuVisible) {
      setMenuVisible(true);
      // En RTL, on doit inverser la direction de l'animation
      const targetValue = I18nManager.isRTL ? -SIDEBAR_WIDTH : 0;
      Animated.timing(slideAnim, { toValue: targetValue, duration: 300, useNativeDriver: true }).start();
    } else {
      // En RTL, on doit inverser la direction de l'animation
      const targetValue = I18nManager.isRTL ? 0 : SIDEBAR_WIDTH;
      Animated.timing(slideAnim, { toValue: targetValue, duration: 250, useNativeDriver: true }).start(() => setMenuVisible(false));
    }
  };

  const saveHifdh = async () => {
    await AsyncStorage.setItem(HIFDH_KEY, currentPage.toString());
    setHifdhPage(currentPage);
    Alert.alert('الحفظ', `تم حفظ الصفحة ${currentPage} للحفظ.`);
    toggleMenu();
  };

  const saveReading = async () => {
    await AsyncStorage.setItem(LAST_READ_KEY, currentPage.toString());
    setLastReadPage(currentPage);
    Alert.alert('القراءة', `تم وضع العلامة في الصفحة ${currentPage}.`);
    toggleMenu();
  };

  const jumpToPage = (pageNum: number | null) => {
    if (!pageNum) return Alert.alert('معلومة', 'لا توجد صفحة مسجلة');
    const originalIndex = allQuranPages.findIndex(p => p.number === pageNum);
    if (originalIndex !== -1) {
      // Convertir l'index original en index inversé
      const reversedIndex = reversedQuranPages.length - 1 - originalIndex;
      // Mettre à jour currentPage et currentPageIndex immédiatement pour éviter les bugs
      setCurrentPage(pageNum);
      setCurrentPageIndex(reversedIndex);
      // Fermer le menu d'abord
      toggleMenu();
      // Attendre un peu pour que le menu se ferme et la FlatList soit prête
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: reversedIndex, animated: true });
      }, 300);
    } else {
      Alert.alert('خطأ', `الصفحة ${pageNum} غير موجودة`);
    }
  };

  const jumpToPageWithoutToggle = (pageNum: number | null) => {
    if (!pageNum) return;
    const originalIndex = allQuranPages.findIndex(p => p.number === pageNum);
    if (originalIndex !== -1) {
      // Convertir l'index original en index inversé
      const reversedIndex = reversedQuranPages.length - 1 - originalIndex;
      // Mettre à jour currentPage et currentPageIndex immédiatement pour éviter les bugs
      setCurrentPage(pageNum);
      setCurrentPageIndex(reversedIndex);
      // Attendre un peu pour que la FlatList soit prête
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: reversedIndex, animated: true });
      }, 100);
    }
  };

  const handleGoToPage = () => {
    const pageNum = parseInt(pageInputValue);
    if (isNaN(pageNum) || pageNum < 2 || pageNum > 604) {
      Alert.alert('خطأ', 'يرجى إدخال رقم صفحة صحيح بين 2 و 604');
      return;
    }
    setPageInputVisible(false);
    setPageInputValue('');
    // Utiliser jumpToPageWithoutToggle car le menu est déjà fermé
    jumpToPageWithoutToggle(pageNum);
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const pageNumber = viewableItems[0].item.number;
      setCurrentPage(pageNumber);
      // Sauvegarder l'index actuel pour la rotation
      const index = reversedQuranPages.findIndex(p => p.number === pageNumber);
      if (index !== -1) {
        setCurrentPageIndex(index);
      }
    }
  }).current;

  return (
    <View style={styles.container}>
      <StatusBar hidden={false} barStyle="light-content" translucent={true} />

      {/* Navbar en haut */}
      <Navbar
        visible={navbarVisible}
        currentPage={currentPage}
        currentSurah={currentSurah}
        lastReadPage={lastReadPage}
        hifdhPage={hifdhPage}
        isLandscape={isLandscape}
        insets={insets}
        onToggleMenu={toggleMenu}
      />
      
      <FlatList
          ref={flatListRef}
          data={reversedQuranPages}
          horizontal
          pagingEnabled
          initialScrollIndex={currentPageIndex !== null ? currentPageIndex : finalStartIndex}
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
          style={{ 
            marginTop: navbarVisible ? (isLandscape ? Math.max(insets.top, 8) + 40 + 4 : insets.top + 48) : (isLandscape ? Math.max(insets.top, 8) : insets.top),
            marginBottom: audioProgressBarVisible && (isAudioPlaying || audioDuration > 0) ? 100 : 0,
            direction: 'ltr' 
          }}
          key={`flatlist-${width}-${height}`}
          extraData={isLandscape}
          renderItem={({ item }) => (
            <PageItem 
              item={item} 
              width={width} 
              height={height} 
              isLandscape={isLandscape} 
              insets={insets}
              navbarVisible={navbarVisible}
              onToggleNavbar={() => {
                if (isLandscape) {
                  setNavbarVisible(!navbarVisible);
                }
              }}
            />
          )}
          keyExtractor={(item) => `page-${item.number}`}
          onScrollToIndexFailed={info => {
            flatListRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: false });
          }}
          removeClippedSubviews={true}
          maxToRenderPerBatch={3}
          windowSize={5}
          initialNumToRender={1}
          updateCellsBatchingPeriod={50}
          onScrollBeginDrag={() => {
            // Masquer la barre quand on commence à faire défiler (seulement si l'audio n'est pas en cours de lecture)
            if (audioProgressBarVisible && !isAudioPlaying && audioDuration > 0) {
              setAudioProgressBarVisible(false);
            }
          }}
          onTouchStart={(e) => {
            // Enregistrer le temps et la position du début du touch pour détecter les clics simples
            touchStartTimeRef.current = Date.now();
            touchStartYRef.current = e.nativeEvent.pageY;
          }}
          onTouchEnd={(e) => {
            // Masquer la barre seulement si c'est un clic simple (pas un défilement)
            if (audioProgressBarVisible && !isAudioPlaying && audioDuration > 0) {
              const touchDuration = Date.now() - touchStartTimeRef.current;
              const touchDistance = Math.abs(e.nativeEvent.pageY - touchStartYRef.current);
              
              // Si le touch était court (< 300ms) et peu de mouvement (< 10px), c'est un clic simple
              if (touchDuration < 300 && touchDistance < 10) {
                // Vérifier que le clic n'est pas dans la zone de la barre (bas de l'écran)
                const screenHeight = height;
                const progressBarHeight = 120; // Hauteur de la barre + safe area
                if (e.nativeEvent.pageY < screenHeight - progressBarHeight) {
                  setAudioProgressBarVisible(false);
                }
              }
            }
          }}
        />

      {menuVisible && <Pressable style={styles.overlay} onPress={toggleMenu} />}

      <Sidebar
        slideAnim={slideAnim}
        currentPage={currentPage}
        surahListVisible={surahListVisible}
        landscapeEnabled={landscapeEnabled}
        lastReadPage={lastReadPage}
        hifdhPage={hifdhPage}
        insets={insets}
        flatListRef={flatListRef}
        onSaveReading={saveReading}
        onSaveHifdh={saveHifdh}
        onJumpToPage={jumpToPage}
        onGoToPageInput={() => { setPageInputVisible(true); toggleMenu(); }}
        onSetSurahListVisible={setSurahListVisible}
        onSetLandscapeEnabled={setLandscapeEnabled}
        onSetCurrentPage={setCurrentPage}
        onSetCurrentPageIndex={setCurrentPageIndex}
        onToggleMenu={toggleMenu}
        onPlayAudio={playAudio}
        onPauseAudio={pauseAudio}
        onStopAudio={stopAudio}
        isAudioPlaying={isAudioPlaying}
        isAudioLoading={isAudioLoading}
        audioError={audioError}
      />
      
      {/* Barre de progression audio en bas de l'écran */}
      {/* Afficher la barre seulement si audioProgressBarVisible est true (géré par le useEffect) */}
      {/* Ne pas vérifier audioDuration/audioCurrentPage ici pour éviter les animations lors du stop */}
      {audioProgressBarVisible && (
        <View pointerEvents="box-none">
          <AudioProgressBar
            currentTime={audioCurrentTime}
            duration={audioDuration}
            isPlaying={isAudioPlaying}
            isLoading={isAudioLoading}
            onSeek={seekAudio}
            onPlayPause={isAudioPlaying ? pauseAudio : () => {
              isStoppingRef.current = false; // Réinitialiser le flag si on relance
              setAudioProgressBarVisible(true);
              playAudio(audioCurrentPage || currentPage);
            }}
            onStop={() => {
              // Activer le flag AVANT toute mise à jour pour empêcher le useEffect de réagir
              isStoppingRef.current = true;
              // Masquer immédiatement la barre lors du stop pour éviter toute animation
              setAudioProgressBarVisible(false);
              // Utiliser requestAnimationFrame pour s'assurer que la visibilité est mise à jour avant stopAudio
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  // Double requestAnimationFrame pour s'assurer que React a traité la mise à jour de visibilité
                  stopAudio();
                  // Réinitialiser le flag après que tous les états soient mis à jour
                  setTimeout(() => {
                    isStoppingRef.current = false;
                  }, 100);
                });
              });
            }}
          />
        </View>
      )}

      {/* Modal pour saisir le numéro de page */}
      <PageInputModal
        visible={pageInputVisible}
        pageInputValue={pageInputValue}
        onPageInputChange={setPageInputValue}
        onClose={() => {
          setPageInputVisible(false);
          setPageInputValue('');
        }}
        onConfirm={handleGoToPage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', direction: 'ltr' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10 },
});