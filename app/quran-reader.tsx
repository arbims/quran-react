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
  Pressable,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Imports des modules refactorisés
import { AudioDownloadModal } from '@/lib/quran-reader/components/AudioDownloadModal';
import { AudioFileMissingModal } from '@/lib/quran-reader/components/AudioFileMissingModal';
import { AudioProgressBar } from '@/lib/quran-reader/components/AudioProgressBar';
import { AudioRangeModal } from '@/lib/quran-reader/components/AudioRangeModal';
import { Navbar } from '@/lib/quran-reader/components/Navbar';
import { PageInputModal } from '@/lib/quran-reader/components/PageInputModal';
import { PageItem } from '@/lib/quran-reader/components/PageItem';
import { Sidebar } from '@/lib/quran-reader/components/Sidebar';
import { HIFDH_KEY, LAST_READ_KEY, SIDEBAR_WIDTH, SIDEBAR_WIDTH_LANDSCAPE } from '@/lib/quran-reader/constants';
import { useAudioPlayer } from '@/lib/quran-reader/hooks/useAudioPlayer';
import { useOrientation } from '@/lib/quran-reader/hooks/useOrientation';
import { allQuranPages, findPageIndexForSurah, getCurrentSurah, getPageSide, reversedQuranPages } from '@/lib/quran-reader/utils';
import { areAudioFilesExtracted, clearDownloadCacheForRetry, downloadAndExtractAudioZip, getAudioDownloadPreference, setAudioDownloadPreference } from '@/lib/quran-reader/utils/audioDownload';

// Import des données depuis les modules refactorisés
// Les modules ont été déplacés vers @/lib/quran-reader/ pour éviter qu'Expo Router les traite comme des routes

export default function QuranReaderScreen() {
  const { id, page } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  
  
  const flatListRef = useRef<FlatList>(null);
  const isProgrammaticScrollRef = useRef(false); // Flag pour empêcher onViewableItemsChanged pendant les scrolls programmés
  // Toggle manuel pour activer/désactiver le mode paysage
  const [landscapeEnabled, setLandscapeEnabled] = useState(false);
  // Détecter si on est en mode paysage (et que le mode paysage est autorisé)
  const isLandscape = landscapeEnabled && width > height;
  // Largeur de la sidebar : plus large en paysage pour éviter que le texte soit coupé
  const sidebarWidth = isLandscape ? SIDEBAR_WIDTH_LANDSCAPE : SIDEBAR_WIDTH;
  const initialSlideValue = I18nManager.isRTL ? -sidebarWidth : sidebarWidth;
  const slideAnim = useRef(new Animated.Value(initialSlideValue)).current;
  const [surahListVisible, setSurahListVisible] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState<number | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  // Mettre à jour la position de la sidebar quand on change d'orientation (menu fermé)
  useEffect(() => {
    if (!menuVisible) {
      const targetValue = I18nManager.isRTL ? 0 : sidebarWidth;
      slideAnim.setValue(targetValue);
    }
  }, [isLandscape, sidebarWidth, menuVisible]);

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

  const [currentPage, setCurrentPage] = useState<number>(reversedQuranPages[finalStartIndex]?.number || 1);
  const [hifdhPage, setHifdhPage] = useState<number | null>(null);
  const [lastReadPage, setLastReadPage] = useState<number | null>(null);
  const [pageInputVisible, setPageInputVisible] = useState(false);
  const [pageInputValue, setPageInputValue] = useState('');
  const [audioRangeModalVisible, setAudioRangeModalVisible] = useState(false);
  const [navbarVisible, setNavbarVisible] = useState(true);
  const [audioProgressBarVisible, setAudioProgressBarVisible] = useState(false); // Cachée par défaut
  const isStoppingRef = useRef(false); // Flag pour éviter les animations lors du stop
  const lastTouchTimeRef = useRef<number>(0); // Pour détecter les clics simples
  const touchStartTimeRef = useRef<number>(0); // Temps de début du touch
  const touchStartXRef = useRef<number>(0); // Position X pour distinguer tap vs swipe
  const touchStartYRef = useRef<number>(0); // Position Y du début du touch
  const isScrollingRef = useRef<boolean>(false); // True pendant un swipe horizontal
  const [audioDownloadModalVisible, setAudioDownloadModalVisible] = useState(false);
  const [pendingAudioPage, setPendingAudioPage] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [audioFileMissingModalVisible, setAudioFileMissingModalVisible] = useState(false);
  const [missingAudioPage, setMissingAudioPage] = useState<number | null>(null);
  const downloadRequestPromiseRef = useRef<{
    resolve: (value: boolean) => void;
    reject: (error: any) => void;
  } | null>(null);
  const [audioRange, setAudioRange] = useState<{
    start: number;
    end: number;
  } | null>(null);

  // Hook pour la lecture audio
  const { isPlaying: isAudioPlaying, isLoading: isAudioLoading, error: audioError, play: playAudio, pause: pauseAudio, stop: stopAudio, seek: seekAudio, currentPage: audioCurrentPage, currentTime: audioCurrentTime, duration: audioDuration, isLooping: isAudioLooping, toggleLoop: toggleAudioLoop, setOnFinished: setAudioOnFinished } = useAudioPlayer();

  // Fonction pour gérer la demande de téléchargement : afficher la modale quand l'utilisateur clique sur play et les fichiers sont absents
  const handleDownloadRequest = async (pageNumber: number): Promise<boolean> => {
    const filesExtracted = await areAudioFilesExtracted();
    if (filesExtracted) {
      return true;
    }

    const preference = await getAudioDownloadPreference();
    if (preference === 'never') {
      return false;
    }

    // Toujours afficher la modale quand l'utilisateur clique sur play et les MP3 ne sont pas là (ask ou always)
    return new Promise<boolean>((resolve) => {
      setPendingAudioPage(pageNumber);
      downloadRequestPromiseRef.current = { resolve, reject: () => resolve(false) };
      setAudioDownloadModalVisible(true);
    });
  };

  // Exécuter le téléchargement (utilisé par confirm et retry)
  const runDownload = async () => {
    if (!downloadRequestPromiseRef.current) return;
    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadError(null);
    try {
      await downloadAndExtractAudioZip((progress) => {
        setDownloadProgress(progress);
      });
      setDownloadProgress(1);
      setIsDownloading(false);
      downloadRequestPromiseRef.current.resolve(true);
      setTimeout(() => {
        downloadRequestPromiseRef.current = null;
        setPendingAudioPage(null);
        setAudioDownloadModalVisible(false);
        setDownloadProgress(0);
      }, 500);
    } catch (error: any) {
      console.error('❌ Erreur lors du téléchargement:', error);
      setIsDownloading(false);
      setDownloadProgress(0);
      setDownloadError(error?.message || 'فشل التحميل أو الملف تالف');
    }
  };

  // Gérer la confirmation de téléchargement depuis la modal
  const handleDownloadConfirm = async (downloadNow: boolean) => {
    if (downloadRequestPromiseRef.current && pendingAudioPage !== null) {
      if (downloadNow) {
        await setAudioDownloadPreference('always');
        await runDownload();
      } else {
        await setAudioDownloadPreference('never');
        downloadRequestPromiseRef.current.resolve(false);
        downloadRequestPromiseRef.current = null;
        setPendingAudioPage(null);
        setAudioDownloadModalVisible(false);
      }
    }
  };

  // Réessayer le téléchargement après échec ou fichier corrompu
  const handleDownloadRetry = async () => {
    await clearDownloadCacheForRetry();
    await runDownload();
  };

  // Gérer l'annulation de téléchargement
  const handleDownloadCancel = () => {
    if (downloadRequestPromiseRef.current) {
      downloadRequestPromiseRef.current.resolve(false);
      downloadRequestPromiseRef.current = null;
    }
    setPendingAudioPage(null);
    setAudioDownloadModalVisible(false);
    setIsDownloading(false);
    setDownloadProgress(0);
    setDownloadError(null);
  };

  // Wrapper pour playAudio qui gère la demande de téléchargement
  const handlePlayAudio = async (pageNumber: number) => {
    try {
      await playAudio(pageNumber, handleDownloadRequest);
    } catch (error: any) {
      const errorMessage = error.message || 'فشل تشغيل الملف الصوتي';
      // Si c'est un message indiquant qu'il n'y a pas de fichier audio, afficher le modal
      if (errorMessage.includes('لا يوجد ملف صوتي')) {
        setMissingAudioPage(pageNumber);
        setAudioFileMissingModalVisible(true);
      } else {
        console.error('❌ Erreur lors de la lecture audio:', error);
        Alert.alert('خطأ', errorMessage);
      }
    }
  };

  // Démarrer la lecture audio d'une plage de pages (ex : 1 à 5)
  const handlePlayAudioRange = async (startPage: number, endPage: number) => {
    if (
      !Number.isFinite(startPage) ||
      !Number.isFinite(endPage) ||
      startPage < 1 ||
      endPage < 1 ||
      startPage > 604 ||
      endPage > 604 ||
      startPage > endPage
    ) {
      Alert.alert('خطأ', 'يرجى إدخال نطاق صفحات صحيح بين 1 و 604 (من صفحة أصغر إلى صفحة أكبر)');
      return;
    }

    // Sauvegarder le range actif
    setAudioRange({ start: startPage, end: endPage });

    // Aller à la première page du range et lancer la lecture
    jumpToPageWithoutToggle(startPage);
    await handlePlayAudio(startPage);
  };

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

  // En portrait : navbar toujours visible. En paysage : tap pour hide/show
  useEffect(() => {
    if (!isLandscape && !navbarVisible) {
      setNavbarVisible(true);
    }
  }, [isLandscape, navbarVisible]);

  const currentSurah = getCurrentSurah(currentPage);
  const pageSide = getPageSide(currentPage); // 'left' ou 'right'
  
  // Afficher la position de la page dans la console (pour debug)
  useEffect(() => {
    console.log(`Page ${currentPage} est à ${pageSide === 'left' ? 'gauche' : 'droite'}`);
  }, [currentPage, pageSide]);

  // Quand l'utilisateur change de page (swipe ou saut) pendant que l'audio joue, basculer sur l'audio de la nouvelle page
  useEffect(() => {
    if (
      isAudioPlaying &&
      audioCurrentPage != null &&
      currentPage !== audioCurrentPage
    ) {
      handlePlayAudio(currentPage);
    }
  }, [currentPage]);

  // Enchaîner automatiquement la page suivante quand une page audio se termine,
  // si un range est actif (lecture de plusieurs pages à la suite)
  useEffect(() => {
    setAudioOnFinished((finishedPage) => {
      if (!audioRange || finishedPage == null) {
        return;
      }

      const { start, end } = audioRange;

      // Si la page terminée est hors du range, ne rien faire
      if (finishedPage < start || finishedPage > end) {
        return;
      }

      // Dernière page du range : arrêter le mode range
      if (finishedPage >= end) {
        setAudioRange(null);
        return;
      }

      const nextPage = finishedPage + 1;
      setAudioRange({ start, end });
      jumpToPageWithoutToggle(nextPage);
      handlePlayAudio(nextPage);
    });
  }, [audioRange, setAudioOnFinished]);

  useEffect(() => {
    loadStorage();
    
    // Forcer le layout LTR pour éviter les problèmes RTL
    if (I18nManager.isRTL) {
      I18nManager.forceRTL(false);
      I18nManager.allowRTL(false);
    }
    
    // Afficher la barre de navigation et harmoniser sa couleur (évite le gap noir sur Redmi/MIUI)
    NavigationBar.setVisibilityAsync('visible');
    NavigationBar.setBackgroundColorAsync('#f5f0e6'); // Crème, même que le fond
    
    // Empêcher l'écran de se mettre en veille
    activateKeepAwakeAsync();
    
    // Nettoyer à la sortie
    return () => {
      NavigationBar.setVisibilityAsync('visible');
      NavigationBar.setBackgroundColorAsync('#f5f0e6');
      deactivateKeepAwake();
    };
  }, []);

  // Utiliser le hook pour gérer l'orientation
  useOrientation(landscapeEnabled);

  // Restaurer la page actuelle lors de la rotation
  useEffect(() => {
    if (currentPageIndex !== null && flatListRef.current) {
      // Activer le flag pour empêcher onViewableItemsChanged de mettre à jour pendant le scroll
      isProgrammaticScrollRef.current = true;
      // Petit délai pour s'assurer que le layout est mis à jour
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ 
          index: currentPageIndex, 
          animated: false 
        });
        // Désactiver le flag après le scroll
        setTimeout(() => {
          isProgrammaticScrollRef.current = false;
        }, 300);
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
      const targetValue = I18nManager.isRTL ? -sidebarWidth : 0;
      Animated.timing(slideAnim, { toValue: targetValue, duration: 300, useNativeDriver: true }).start();
    } else {
      const targetValue = I18nManager.isRTL ? 0 : sidebarWidth;
      Animated.timing(slideAnim, { toValue: targetValue, duration: 250, useNativeDriver: true }).start(() => setMenuVisible(false));
    }
  };

  const closeMenuImmediate = () => {
    if (menuVisible) {
      setMenuVisible(false);
      const targetValue = I18nManager.isRTL ? 0 : sidebarWidth;
      slideAnim.setValue(targetValue);
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
      // Activer le flag pour empêcher onViewableItemsChanged de mettre à jour pendant le scroll
      isProgrammaticScrollRef.current = true;
      // Fermer le menu d'abord
      toggleMenu();
      // Attendre un peu pour que le menu se ferme et la FlatList soit prête
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: reversedIndex, animated: true });
        // Désactiver le flag après le scroll (avec un délai pour laisser le scroll se terminer)
        setTimeout(() => {
          isProgrammaticScrollRef.current = false;
        }, 500);
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
      // Activer le flag pour empêcher onViewableItemsChanged de mettre à jour pendant le scroll
      isProgrammaticScrollRef.current = true;
      // Attendre un peu pour que la FlatList soit prête
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: reversedIndex, animated: true });
        // Désactiver le flag après le scroll (avec un délai pour laisser le scroll se terminer)
        setTimeout(() => {
          isProgrammaticScrollRef.current = false;
        }, 500);
      }, 100);
    }
  };

  const handleGoToPage = () => {
    const pageNum = parseInt(pageInputValue);
    if (isNaN(pageNum) || pageNum < 1 || pageNum > 604) {
      Alert.alert('خطأ', 'يرجى إدخال رقم صفحة صحيح بين 1 و 604');
      return;
    }
    setPageInputVisible(false);
    setPageInputValue('');
    // Utiliser jumpToPageWithoutToggle car le menu est déjà fermé
    jumpToPageWithoutToggle(pageNum);
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    // Ignorer les changements pendant un scroll programmé
    if (isProgrammaticScrollRef.current) {
      return;
    }
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
        pageSide={pageSide}
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
            flex: 1,
            marginTop: navbarVisible ? (isLandscape ? Math.max(insets.top, 8) + 40 + 4 : insets.top + 48) : (isLandscape ? Math.max(insets.top, 8) : insets.top),
            backgroundColor: PAGE_BACKGROUND_COLOR,
            direction: 'ltr' 
          }}
          key={`flatlist-${width}-${height}`}
          extraData={{ isLandscape, navbarVisible }}
          renderItem={({ item }) => (
            <View style={{ width, flex: 1 }}>
              <PageItem 
                item={item} 
                width={width} 
                height={height} 
                isLandscape={isLandscape} 
                insets={insets}
                navbarVisible={navbarVisible}
              />
            </View>
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
            isScrollingRef.current = true;
            // Ne plus masquer la barre audio au scroll : l'utilisateur peut la déplacer ; masquer uniquement avec Stop
          }}
          onScrollEndDrag={() => {
            setTimeout(() => { isScrollingRef.current = false; }, 100);
          }}
          onMomentumScrollEnd={() => {
            isScrollingRef.current = false;
          }}
          onTouchStart={(e) => {
            touchStartTimeRef.current = Date.now();
            touchStartXRef.current = e.nativeEvent.pageX;
            touchStartYRef.current = e.nativeEvent.pageY;
          }}
          onTouchEnd={(e) => {
            const touchDuration = Date.now() - touchStartTimeRef.current;
            const dx = Math.abs(e.nativeEvent.pageX - touchStartXRef.current);
            const dy = Math.abs(e.nativeEvent.pageY - touchStartYRef.current);
            const isTap = touchDuration < 300 && dx < 15 && dy < 15 && !isScrollingRef.current;

            // Mode paysage : tap pour toggle navbar (plein écran)
            if (isLandscape && isTap) {
              setNavbarVisible(prev => !prev);
              return;
            }

            // Ne plus masquer la barre audio au tap : l'utilisateur peut la déplacer ; masquer avec Stop ou en scrollant
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
        onGoToPageInput={() => { closeMenuImmediate(); setPageInputVisible(true); }}
        onSetSurahListVisible={setSurahListVisible}
        onSetLandscapeEnabled={setLandscapeEnabled}
        onSetCurrentPage={setCurrentPage}
        onSetCurrentPageIndex={setCurrentPageIndex}
        onToggleMenu={toggleMenu}
        onPlayAudio={handlePlayAudio}
        onPlayAudioRange={handlePlayAudioRange}
        onOpenAudioRangeModal={() => setAudioRangeModalVisible(true)}
        onPauseAudio={pauseAudio}
        onStopAudio={stopAudio}
        isAudioPlaying={isAudioPlaying}
        isAudioLoading={isAudioLoading}
        audioError={audioError}
      />
      
      {/* Barre de progression audio flottante et déplaçable */}
      {audioProgressBarVisible && (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
          <AudioProgressBar
            currentTime={audioCurrentTime}
            duration={audioDuration}
            isPlaying={isAudioPlaying}
            isLoading={isAudioLoading}
            onSeek={seekAudio}
            onPlayPause={isAudioPlaying ? pauseAudio : () => {
              isStoppingRef.current = false; // Réinitialiser le flag si on relance
              setAudioProgressBarVisible(true);
              handlePlayAudio(audioCurrentPage || currentPage);
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
            isLooping={isAudioLooping}
            onToggleLoop={toggleAudioLoop}
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

      {/* Modal pour demander le téléchargement des fichiers audio */}
      <AudioDownloadModal
        visible={audioDownloadModalVisible}
        isDownloading={isDownloading}
        downloadProgress={downloadProgress}
        downloadError={downloadError}
        onClose={() => {
          setAudioDownloadModalVisible(false);
          handleDownloadCancel();
        }}
        onConfirm={handleDownloadConfirm}
        onRetry={handleDownloadRetry}
        onCancel={handleDownloadCancel}
      />

      {/* Modal pour afficher qu'il n'y a pas de fichier audio pour cette page */}
      <AudioFileMissingModal
        visible={audioFileMissingModalVisible}
        pageNumber={missingAudioPage || 0}
        onClose={() => {
          setAudioFileMissingModalVisible(false);
          setMissingAudioPage(null);
        }}
      />

      {/* Modal pour sélectionner la plage de pages audio */}
      <AudioRangeModal
        visible={audioRangeModalVisible}
        currentPage={currentPage}
        onClose={() => setAudioRangeModalVisible(false)}
        onConfirm={(startPage, endPage) => {
          handlePlayAudioRange(startPage, endPage);
        }}
        onPlayCurrentPage={(page: number) => {
          handlePlayAudio(page);
        }}
      />
    </View>
  );
}

// Couleur crème pour correspondre aux pages du Coran - évite la barre noire visible
// sur certains appareils Android (zone sous le contenu / barre de navigation)
const PAGE_BACKGROUND_COLOR = '#f5f0e6';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PAGE_BACKGROUND_COLOR, direction: 'ltr' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10 },
});