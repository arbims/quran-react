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
                  {item.name_en} — {item.pages} صفحة
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
  screen: { flex: 1, backgroundColor: '#0D47A1' },
  mainContainer: { flex: 1, backgroundColor: '#F5F9FC' },
  titleContainer: {
    paddingBottom: 40,
    paddingHorizontal: 24,
    backgroundColor: '#1565C0',
    alignItems: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 16,
    borderBottomWidth: 3,
    borderBottomColor: '#FFB300',
  },
  headerTitle: { 
    color: '#FFFFFF', 
    fontSize: 42, 
    fontWeight: '800',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(255, 179, 0, 0.6)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  surahItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 24,
    marginHorizontal: 16,
    marginVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#1565C0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderLeftWidth: 6,
    borderLeftColor: '#FFB300',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(225, 245, 254, 0.3)',
    borderRightWidth: 0.5,
    borderRightColor: 'rgba(225, 245, 254, 0.3)',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(225, 245, 254, 0.3)',
  },
  surahInfo: { flex: 1, alignItems: 'flex-end' },
  arabicName: { 
    fontSize: 28, 
    color: '#1565C0', 
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  englishName: { 
    fontSize: 17, 
    color: '#64B5F6',
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  indicator: { 
    width: 7, 
    height: '88%', 
    backgroundColor: '#FFB300', 
    borderRadius: 8, 
    marginLeft: 20,
    shadowColor: '#FFB300',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});