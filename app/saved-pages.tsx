import { getLastReadPage } from '@/utils/storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Button, StyleSheet, View } from 'react-native';

export default function SavedPagesScreen() {
  const [lastPageIndex, setLastPageIndex] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Charger la dernière page sauvegardée
    async function fetchLastPage() {
      const savedPage = await getLastReadPage();
      setLastPageIndex(savedPage);
    }
    fetchLastPage();
  }, []);

  const goToLastSavedPage = () => {
    if (lastPageIndex !== null) {
      router.push(`/quran-reader?id=${lastPageIndex + 1}`);
    } else {
      Alert.alert('Aucune page enregistrée.', 'Veuillez sauvegarder une page avant.');
    }
  };

  return (
    <View style={styles.container}>
      <Button
        title={lastPageIndex !== null ? `Aller à la page ${lastPageIndex + 1}` : 'Aucune page sauvegardée'}
        onPress={goToLastSavedPage}
        color="#2196F3"
        disabled={lastPageIndex === null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
});