import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

/* =======================
   DONNÉES (EXEMPLE)
======================= */
const allQuranImages = [
  { number: 1, source: require('@/assets/quran/01_01.png') },
  { number: 2, source: require('@/assets/quran/02_01.png') },
  { number: 3, source: require('@/assets/quran/02_02.png') },
];

/* =======================
   CLÉS STORAGE
======================= */
const HIFDH_KEY = 'HIFDH_PAGE';
const LAST_READ_KEY = 'LAST_READ_PAGE';

export default function QuranReaderScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const menuOpacity = useRef(new Animated.Value(0)).current;

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hifdhPage, setHifdhPage] = useState<number | null>(null);
  const [lastReadPage, setLastReadPage] = useState<number | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const width = Dimensions.get('window').width;
  const height = Dimensions.get('window').height;

  /* =======================
     DÉTECTION PAGE (FIABLE)
  ======================= */
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  });

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentPage(viewableItems[0].item.number);
    }
  });

  /* =======================
     LOAD STORAGE
  ======================= */
  useEffect(() => {
    (async () => {
      const hifdh = await AsyncStorage.getItem(HIFDH_KEY);
      const lastRead = await AsyncStorage.getItem(LAST_READ_KEY);

      if (hifdh) setHifdhPage(Number(hifdh));
      if (lastRead) setLastReadPage(Number(lastRead));
    })();
  }, []);

  /* =======================
     MENU
  ======================= */
  const toggleMenu = () => {
    Animated.timing(menuOpacity, {
      toValue: menuVisible ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setMenuVisible(!menuVisible));
  };

  /* =======================
     ACTIONS
  ======================= */
  const saveHifdh = async () => {
    await AsyncStorage.setItem(HIFDH_KEY, currentPage.toString());
    setHifdhPage(currentPage);
    Alert.alert('Hifdh', `Page ${currentPage} sauvegardée`);
    toggleMenu();
  };

  const saveReading = async () => {
    await AsyncStorage.setItem(LAST_READ_KEY, currentPage.toString());
    setLastReadPage(currentPage);
    Alert.alert('Lecture', `Page ${currentPage} sauvegardée`);
    toggleMenu();
  };

  const goToHifdh = () => {
    if (!hifdhPage) return Alert.alert('Hifdh', 'Aucune page Hifdh');

    const index = allQuranImages.findIndex(p => p.number === hifdhPage);
    flatListRef.current?.scrollToIndex({ index, animated: true });
    toggleMenu();
  };

  const goToLastRead = () => {
    if (!lastReadPage) return Alert.alert('Lecture', 'Aucune lecture sauvegardée');

    const index = allQuranImages.findIndex(p => p.number === lastReadPage);
    flatListRef.current?.scrollToIndex({ index, animated: true });
    toggleMenu();
  };

  const goToSurahList = () => {
    toggleMenu();
    router.replace('/'); // retour liste sourates
  };

  /* =======================
     RENDER
  ======================= */
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={allQuranImages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={{ width, height }}>
            <Image source={item.source} style={styles.image} />
            {item.number === hifdhPage && (
              <View style={styles.hifdhBadge}>
                <Text style={styles.hifdhText}>حفظ</Text>
              </View>
            )}
          </View>
        )}
        keyExtractor={i => i.number.toString()}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={viewabilityConfig.current}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      {/* BOUTON MENU */}
      <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
        <Text style={styles.menuText}>⋮</Text>
      </TouchableOpacity>

      {/* MENU */}
      {menuVisible && (
        <Animated.View style={[styles.menu, { opacity: menuOpacity }]}>
          <TouchableOpacity style={styles.menuItem} onPress={saveHifdh}>
            <Text>🧠 Marquer Hifdh</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={saveReading}>
            <Text>💾 Sauvegarder lecture</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={goToLastRead}>
            <Text>📖 Aller à la lecture</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={goToHifdh}>
            <Text>➡️ Aller à Hifdh</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} onPress={goToSurahList}>
            <Text>📜 Liste des sourates</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

/* =======================
   STYLES
======================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  image: { width: '100%', height: '100%', resizeMode: 'contain' },

  menuButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: { color: '#fff', fontSize: 22 },

  menu: {
    position: 'absolute',
    top: 120,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    width: 240,
    elevation: 10,
  },
  menuItem: { padding: 12 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 8 },

  hifdhBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  hifdhText: { color: '#fff', fontWeight: 'bold' },
});
