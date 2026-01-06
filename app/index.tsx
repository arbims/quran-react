import AsyncStorage from '@react-native-async-storage/async-storage';
import { surahs } from '@/data/surahs';
import * as NavigationBar from 'expo-navigation-bar';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';

const LAST_READ_KEY = 'LAST_READ_PAGE';

export default function HomeScreen() {
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync("hidden");
    }
    
    // Rediriger automatiquement vers la dernière page sauvegardée
    const loadAndRedirect = async () => {
      const lastRead = await AsyncStorage.getItem(LAST_READ_KEY);
      if (lastRead) {
        // Trouver quelle sourate contient cette page
        const pageNum = Number(lastRead);
        const surah = surahs.find(s => {
          const startPage = s.startPage;
          return pageNum >= startPage && pageNum < startPage + s.pages;
        });
        if (surah) {
          router.replace(`/quran-reader?id=${surah.id}&page=${pageNum}`);
        } else {
          // Si on ne trouve pas, utiliser la sourate 1 par défaut
          router.replace(`/quran-reader?id=1`);
        }
      } else {
        // Si aucune page sauvegardée, utiliser la sourate 1
        router.replace(`/quran-reader?id=1`);
      }
    };
    
    loadAndRedirect();
  }, []);

  // Retourner null pendant la redirection (ne devrait pas s'afficher)
  return null;
}
