import { NotoKufiArabic_400Regular } from '@expo-google-fonts/noto-kufi-arabic';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { ActivityIndicator, Text, TextInput, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Empêcher la mise à l'échelle des polices selon les paramètres système
// maxFontSizeMultiplier={1} = taille fixe (équivalent allowFontScaling=false, plus fiable sur Android)
if (Text.defaultProps == null) Text.defaultProps = {};
Text.defaultProps.allowFontScaling = false;
Text.defaultProps.maxFontSizeMultiplier = 1;
if (TextInput.defaultProps == null) TextInput.defaultProps = {};
TextInput.defaultProps.allowFontScaling = false;
TextInput.defaultProps.maxFontSizeMultiplier = 1;

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />
    </GestureHandlerRootView>
  );
}
