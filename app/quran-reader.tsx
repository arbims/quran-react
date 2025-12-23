import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/* =======================
   DONNÉES DES IMAGES
======================= */
const allQuranImages = [
  { number: 1, source: require('@/assets/quran/02_01.png'), surah: 1 },
  // Sourate 2
 { number: 2, source: require('@/assets/quran/02_01.png'), surah: 2 },
  { number: 3, source: require('@/assets/quran/02_02.png'), surah: 2 },
  { number: 4, source: require('@/assets/quran/02_03.png'), surah: 2 },
  { number: 5, source: require('@/assets/quran/02_04.png'), surah: 2 },
  { number: 6, source: require('@/assets/quran/02_05.png'), surah: 2 },
  { number: 7, source: require('@/assets/quran/02_06.png'), surah: 2 },
  { number: 8, source: require('@/assets/quran/02_07.png'), surah: 2 },
  { number: 9, source: require('@/assets/quran/02_08.png'), surah: 2 },
  { number: 10, source: require('@/assets/quran/02_09.png'), surah: 2 },
  { number: 11, source: require('@/assets/quran/02_10.png'), surah: 2 },
  { number: 12, source: require('@/assets/quran/02_11.png'), surah: 2 },
  { number: 13, source: require('@/assets/quran/02_12.png'), surah: 2 },
  { number: 14, source: require('@/assets/quran/02_13.png'), surah: 2 },
  { number: 15, source: require('@/assets/quran/02_14.png'), surah: 2 },
  { number: 16, source: require('@/assets/quran/02_15.png'), surah: 2 },
  { number: 17, source: require('@/assets/quran/02_16.png'), surah: 2 },
  { number: 18, source: require('@/assets/quran/02_17.png'), surah: 2 },
  { number: 19, source: require('@/assets/quran/02_18.png'), surah: 2 },
  { number: 20, source: require('@/assets/quran/02_19.png'), surah: 2 },
  { number: 21, source: require('@/assets/quran/02_20.png'), surah: 2 },
  { number: 22, source: require('@/assets/quran/02_21.png'), surah: 2 },
  { number: 23, source: require('@/assets/quran/02_22.png'), surah: 2 },
  { number: 24, source: require('@/assets/quran/02_23.png'), surah: 2 },
  { number: 25, source: require('@/assets/quran/02_24.png'), surah: 2 },
  { number: 26, source: require('@/assets/quran/02_25.png'), surah: 2 },
  { number: 27, source: require('@/assets/quran/02_26.png'), surah: 2 },
  { number: 28, source: require('@/assets/quran/02_27.png'), surah: 2 },
  { number: 29, source: require('@/assets/quran/02_28.png'), surah: 2 },
  { number: 30, source: require('@/assets/quran/02_29.png'), surah: 2 },
  { number: 31, source: require('@/assets/quran/02_30.png'), surah: 2 },
  { number: 32, source: require('@/assets/quran/02_31.png'), surah: 2 },
  { number: 33, source: require('@/assets/quran/02_32.png'), surah: 2 },
  { number: 34, source: require('@/assets/quran/02_33.png'), surah: 2 },
  { number: 35, source: require('@/assets/quran/02_34.png'), surah: 2 },
  { number: 36, source: require('@/assets/quran/02_35.png'), surah: 2 },
  { number: 37, source: require('@/assets/quran/02_36.png'), surah: 2 },
  { number: 38, source: require('@/assets/quran/02_37.png'), surah: 2 },
  { number: 39, source: require('@/assets/quran/02_38.png'), surah: 2 },
  { number: 40, source: require('@/assets/quran/02_39.png'), surah: 2 },
  { number: 41, source: require('@/assets/quran/02_40.png'), surah: 2 },
  { number: 42, source: require('@/assets/quran/02_41.png'), surah: 2 },
  { number: 43, source: require('@/assets/quran/02_42.png'), surah: 2 },
  { number: 44, source: require('@/assets/quran/02_43.png'), surah: 2 },
  { number: 45, source: require('@/assets/quran/02_44.png'), surah: 2 },
  { number: 46, source: require('@/assets/quran/02_45.png'), surah: 2 },
  { number: 47, source: require('@/assets/quran/02_46.png'), surah: 2 },
  { number: 48, source: require('@/assets/quran/02_47.png'), surah: 2 },
  { number: 49, source: require('@/assets/quran/02_48.png'), surah: 2 },

  // --- Sourate 3 : Al-Imran ---
  { number: 50, source: require('@/assets/quran/03_01.png'), surah: 3 },
  { number: 51, source: require('@/assets/quran/03_02.png'), surah: 3 },
  { number: 52, source: require('@/assets/quran/03_03.png'), surah: 3 },
  { number: 53, source: require('@/assets/quran/03_04.png'), surah: 3 },
  { number: 54, source: require('@/assets/quran/03_05.png'), surah: 3 },
  { number: 55, source: require('@/assets/quran/03_06.png'), surah: 3 },
  { number: 56, source: require('@/assets/quran/03_07.png'), surah: 3 },
  { number: 57, source: require('@/assets/quran/03_08.png'), surah: 3 },
  { number: 58, source: require('@/assets/quran/03_09.png'), surah: 3 },
  { number: 59, source: require('@/assets/quran/03_10.png'), surah: 3 },
  { number: 60, source: require('@/assets/quran/03_11.png'), surah: 3 },
  { number: 61, source: require('@/assets/quran/03_12.png'), surah: 3 },
  { number: 62, source: require('@/assets/quran/03_13.png'), surah: 3 },
  { number: 63, source: require('@/assets/quran/03_14.png'), surah: 3 },
  { number: 64, source: require('@/assets/quran/03_15.png'), surah: 3 },
  { number: 65, source: require('@/assets/quran/03_16.png'), surah: 3 },
  { number: 66, source: require('@/assets/quran/03_17.png'), surah: 3 },
  { number: 67, source: require('@/assets/quran/03_18.png'), surah: 3 },
  { number: 68, source: require('@/assets/quran/03_19.png'), surah: 3 },
  { number: 69, source: require('@/assets/quran/03_20.png'), surah: 3 },
  { number: 70, source: require('@/assets/quran/03_21.png'), surah: 3 },
  { number: 71, source: require('@/assets/quran/03_22.png'), surah: 3 },
  { number: 72, source: require('@/assets/quran/03_23.png'), surah: 3 },
  { number: 73, source: require('@/assets/quran/03_24.png'), surah: 3 },
  { number: 74, source: require('@/assets/quran/03_25.png'), surah: 3 },
  { number: 75, source: require('@/assets/quran/03_26.png'), surah: 3 },
  { number: 76, source: require('@/assets/quran/03_27.png'), surah: 3 },
];

const HIFDH_KEY = 'HIFDH_PAGE';
const LAST_READ_KEY = 'LAST_READ_PAGE';
const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = 260;

export default function QuranReaderScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const flatListRef = useRef<FlatList>(null);
  const slideAnim = useRef(new Animated.Value(SIDEBAR_WIDTH)).current;

  // Calcul de l'index de départ basé sur l'ID de la sourate
  const startIndex = allQuranImages.findIndex(p => p.surah === Number(id));
  const finalStartIndex = startIndex !== -1 ? startIndex : 0;

  const [currentPage, setCurrentPage] = useState<number>(allQuranImages[finalStartIndex].number);
  const [hifdhPage, setHifdhPage] = useState<number | null>(null);
  const [lastReadPage, setLastReadPage] = useState<number | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    loadStorage();
  }, []);

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
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    } else {
      Animated.timing(slideAnim, { toValue: SIDEBAR_WIDTH, duration: 250, useNativeDriver: true }).start(() => setMenuVisible(false));
    }
  };

  const saveHifdh = async () => {
    await AsyncStorage.setItem(HIFDH_KEY, currentPage.toString());
    setHifdhPage(currentPage);
    Alert.alert('Hifdh', `Page ${currentPage} mémorisée.`);
    toggleMenu();
  };

  const saveReading = async () => {
    await AsyncStorage.setItem(LAST_READ_KEY, currentPage.toString());
    setLastReadPage(currentPage);
    Alert.alert('Lecture', `Signet placé à la page ${currentPage}.`);
    toggleMenu();
  };

  const jumpToPage = (pageNum: number | null) => {
    if (!pageNum) return Alert.alert('Info', 'Aucune page enregistrée');
    const index = allQuranImages.findIndex(p => p.number === pageNum);
    if (index !== -1) {
      flatListRef.current?.scrollToIndex({ index, animated: true });
      toggleMenu();
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentPage(viewableItems[0].item.number);
    }
  }).current;

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />

      <FlatList
        ref={flatListRef}
        data={allQuranImages}
        horizontal
        pagingEnabled
        initialScrollIndex={finalStartIndex}
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        renderItem={({ item }) => (
          <View style={styles.pageContainer}>
            <Pressable onPress={toggleMenu} style={{ flex: 1 }}>
              <Image source={item.source} style={styles.image} resizeMode="stretch" />
              {item.number === hifdhPage && (
                <View style={[styles.hifdhBadge, { top: insets.top + 20 }]}>
                  <Text style={styles.hifdhText}>Hifdh 🧠</Text>
                </View>
              )}
            </Pressable>
          </View>
        )}
        keyExtractor={i => i.number.toString()}
        onScrollToIndexFailed={info => {
          flatListRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: false });
        }}
      />

      {menuVisible && <Pressable style={styles.overlay} onPress={toggleMenu} />}

      <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }], paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
        <Text style={styles.sidebarTitle}>Options</Text>
        <Text style={styles.pageIndicator}>Page {currentPage}</Text>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.menuItem} onPress={saveHifdh}><Text style={styles.menuItemText}>🧠 Marquer Hifdh ici</Text></TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={saveReading}><Text style={styles.menuItemText}>💾 Sauvegarder lecture</Text></TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => jumpToPage(lastReadPage)}><Text style={styles.menuItemText}>📖 Retourner au signet</Text></TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => jumpToPage(hifdhPage)}><Text style={styles.menuItemText}>➡️ Aller vers Hifdh</Text></TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={[styles.menuItem, styles.backItem]} onPress={() => router.replace('/')}><Text style={styles.backText}>📜 Liste des sourates</Text></TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  pageContainer: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
  image: { width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10 },
  sidebar: { position: 'absolute', right: 0, top: 0, bottom: 0, width: SIDEBAR_WIDTH, backgroundColor: '#FFFFFF', zIndex: 20, paddingHorizontal: 15, borderTopLeftRadius: 20, borderBottomLeftRadius: 20, elevation: 10 },
  sidebarTitle: { fontSize: 24, fontWeight: 'bold', color: '#2E7D32', textAlign: 'center', marginTop: 10 },
  pageIndicator: { textAlign: 'center', color: '#666', fontSize: 14, marginBottom: 10 },
  menuItem: { paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  menuItemText: { fontSize: 16, color: '#333' },
  backItem: { marginTop: 20, borderBottomWidth: 0 },
  backText: { fontSize: 16, color: '#2E7D32', fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 10 },
  hifdhBadge: { position: 'absolute', right: 20, backgroundColor: '#2E7D32', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  hifdhText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
});