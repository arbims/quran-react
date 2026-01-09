import { NotoKufiArabic_400Regular } from '@expo-google-fonts/noto-kufi-arabic';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

// Empêcher l'écran de démarrage de se fermer automatiquement
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    NotoKufiArabic_400Regular: NotoKufiArabic_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Cacher l'écran de démarrage une fois les polices chargées
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Afficher un indicateur de chargement pendant le chargement des polices
  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
