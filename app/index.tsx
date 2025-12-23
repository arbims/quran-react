import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { surahs } from '@/data/surahs';
import * as NavigationBar from 'expo-navigation-bar';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync("hidden");
    }
  }, []);

  return (
    <View style={styles.screen}>
      <StatusBar hidden={true} translucent={true} />

      <ThemedView style={styles.mainContainer}>
        <FlatList
          data={surahs}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={
            <ThemedView style={[styles.titleContainer, { paddingTop: insets.top + 20 }]}>
              <ThemedText type="title" style={styles.headerTitle}>
                سور القرآن
              </ThemedText>
            </ThemedView>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              // On envoie l'ID (1, 2, 3...)
              onPress={() => router.push(`/quran-reader?id=${item.id}`)}
              style={styles.surahItem}
              activeOpacity={0.7}
            >
              <View style={styles.surahInfo}>
                <ThemedText type="subtitle" style={styles.arabicName}>
                  {item.id}. {item.name_ar}
                </ThemedText>
                <ThemedText style={styles.englishName}>
                  {item.name_en} — {item.pages} pages
                </ThemedText>
              </View>
              <View style={styles.indicator} />
            </TouchableOpacity>
          )}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 20 
          }}
        />
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#4CAF50' },
  mainContainer: { flex: 1, backgroundColor: '#f8f9fa' },
  titleContainer: {
    paddingBottom: 30,
    paddingHorizontal: 24,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: { color: '#FFFFFF', fontSize: 32, fontWeight: 'bold' },
  surahItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    elevation: 4,
  },
  surahInfo: { flex: 1, alignItems: 'flex-end' },
  arabicName: { fontSize: 22, color: '#1b5e20', fontWeight: 'bold' },
  englishName: { fontSize: 14, color: '#616161' },
  indicator: { width: 6, height: '100%', backgroundColor: '#4CAF50', borderRadius: 3, marginLeft: 15 },
});