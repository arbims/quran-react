import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { surahs } from '@/data/surahs';

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#6200EE', dark: '#BB86FC' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          سور القرآن
        </ThemedText>
      </ThemedView>
      <FlatList
        data={surahs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.surahItem}>
            <ThemedText type="subtitle">{item.id}. {item.name_ar}</ThemedText>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContainer}
      />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  listContainer: {
    padding: 16,
  },
  surahItem: {
    padding: 16,
    marginVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
});
