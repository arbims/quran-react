import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { surahs } from '@/data/surahs';
import { useRouter } from 'expo-router';
import { FlatList, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">سور القرآن</ThemedText>
      </ThemedView>
      <FlatList
        data={surahs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/quran-reader?id=${item.id}`)}
            style={styles.surahItem}
          >
            <ThemedText type="subtitle">{item.id}. {item.name_ar}</ThemedText>
            <ThemedText>{item.name_en}</ThemedText>
          </TouchableOpacity>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  listContainer: {
    padding: 16,
  },
  surahItem: {
    padding: 16,
    marginVertical: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
});