import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Surah } from '../types';

interface NavbarProps {
  visible: boolean;
  currentPage: number;
  currentSurah: Surah | null;
  lastReadPage: number | null;
  hifdhPage: number | null;
  isLandscape: boolean;
  insets: { top: number; bottom: number; left: number; right: number };
  onToggleMenu: () => void;
  pageSide: 'left' | 'right';
}

export const Navbar: React.FC<NavbarProps> = ({
  visible,
  currentPage,
  currentSurah,
  lastReadPage,
  hifdhPage,
  isLandscape,
  insets,
  onToggleMenu,
  pageSide,
}) => {
  const TOTAL_PAGES = 521;
  const readingProgress = Math.round((currentPage / TOTAL_PAGES) * 100);

  if (!visible) return null;

  // Debug: vérifier que pageSide est bien passé
  React.useEffect(() => {
    console.log('Navbar - currentPage:', currentPage, 'pageSide:', pageSide);
  }, [currentPage, pageSide]);

  return (
    <View
      style={[styles.navbar, { 
        backgroundColor: '#a15541',
        paddingTop: isLandscape ? Math.max(insets.top, 8) + 4 : insets.top + 4,
        paddingBottom: isLandscape ? Math.max(insets.bottom, 8) + 2 : 4,
        minHeight: isLandscape ? 40 : 44,
        paddingRight: isLandscape ? Math.max(insets.right, 8) : 12,
        paddingLeft: isLandscape ? Math.max(insets.left, 8) : 12
      }]}
    >
      <View style={styles.navbarLeft}>
        <Text style={styles.navbarPageNumber} allowFontScaling={false}>
          صفحة {currentPage} / {TOTAL_PAGES} ({readingProgress}٪)
        </Text>
      </View>
      <View style={styles.navbarCenter}>
        {/* Effet de livre ouvert - design réaliste */}
        <View style={styles.bookContainer}>
          {/* Page gauche */}
          <View style={[
            styles.bookPage,
            styles.bookPageLeft,
            pageSide === 'left' && styles.bookPageActive
          ]}>
            {/* Lignes de texte simulées */}
            <View style={styles.bookLines}>
              <View style={[styles.bookLine, pageSide === 'left' && styles.bookLineActive]} />
              <View style={[styles.bookLine, pageSide === 'left' && styles.bookLineActive]} />
              <View style={[styles.bookLine, pageSide === 'left' && styles.bookLineActive]} />
            </View>
          </View>
          
          {/* Reliure du livre avec ombre */}
          <View style={styles.bookSpineContainer}>
            <View style={styles.bookSpineShadow} />
            <View style={styles.bookSpine} />
          </View>
          
          {/* Page droite */}
          <View style={[
            styles.bookPage,
            styles.bookPageRight,
            pageSide === 'right' && styles.bookPageActive
          ]}>
            {/* Lignes de texte simulées */}
            <View style={styles.bookLines}>
              <View style={[styles.bookLine, pageSide === 'right' && styles.bookLineActive]} />
              <View style={[styles.bookLine, pageSide === 'right' && styles.bookLineActive]} />
              <View style={[styles.bookLine, pageSide === 'right' && styles.bookLineActive]} />
            </View>
          </View>
          
          {/* Badges alignés en bas du livre */}
          {(currentPage === lastReadPage || currentPage === hifdhPage) && (
            <View style={styles.badgesContainer}>
              {currentPage === lastReadPage && (
                <Ionicons name="bookmark" size={14} color="#FFFFFF" />
              )}
              {currentPage === hifdhPage && (
                <Ionicons name="school" size={14} color="#FFFFFF" />
              )}
            </View>
          )}
        </View>
      </View>
      <View style={styles.navbarRight}>
        {currentSurah && (
          <Text style={styles.navbarTitle} allowFontScaling={false} numberOfLines={1}>{currentSurah.name_ar}</Text>
        )}
      </View>
      <TouchableOpacity onPress={onToggleMenu} style={styles.menuButton} activeOpacity={0.7}>
        <Ionicons name="menu" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
    minHeight: 44,
    zIndex: 3000, // Au-dessus de la sidebar (zIndex: 2000) et de la barre de progression audio (zIndex: 1000)
    elevation: 30, // Au-dessus de la sidebar (elevation: 25) et de la barre de progression audio (elevation: 20)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    direction: 'ltr',
    borderBottomWidth: 2,
    borderBottomColor: '#f9f9df',
  },
  menuButton: {
    padding: 8,
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(249, 249, 223, 0.2)',
    borderWidth: 1,
    borderColor: '#f9f9df',
  },
  navbarLeft: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: 4,
  },
  navbarPageNumber: {
    fontSize: 15,
    color: '#FFFFFF',
    letterSpacing: 0.5,
    fontFamily: 'NotoKufiArabic_400Regular',
  },
  navbarCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 8,
    height: 40,
    paddingTop: 2,
  },
  navbarRight: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 8,
  },
  navbarTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'right',
    letterSpacing: 0.3,
    fontFamily: 'NotoKufiArabic_400Regular',
  },
  bookContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 16,
    marginTop: 2,
  },
  badgesContainer: {
    position: 'absolute',
    bottom: -16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    zIndex: 10,
  },
  bookPage: {
    width: 18,
    height: 14,
    backgroundColor: '#fffef5', // Couleur très claire pour les pages non actives
    borderWidth: 1,
    borderColor: 'rgba(200, 180, 150, 0.4)',
    borderRadius: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  bookPageLeft: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderRightWidth: 0,
    // Ombre pour effet 3D
    shadowColor: '#000',
    shadowOffset: { width: -1, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  bookPageRight: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderLeftWidth: 0,
    // Ombre pour effet 3D
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  bookPageActive: {
    backgroundColor: '#f9f9df',
    borderColor: 'rgba(249, 249, 223, 0.9)',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 6,
    transform: [{ scale: 1.05 }],
  },
  bookLines: {
    flex: 1,
    justifyContent: 'space-around',
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  bookLine: {
    height: 1,
    backgroundColor: 'rgba(200, 180, 150, 0.15)',
    marginHorizontal: 1,
  },
  bookLineActive: {
    backgroundColor: 'rgba(100, 80, 60, 0.5)',
    height: 1.5,
  },
  bookSpineContainer: {
    width: 2,
    height: 14,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookSpineShadow: {
    position: 'absolute',
    width: 3,
    height: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 1,
  },
  bookSpine: {
    width: 2,
    height: 14,
    backgroundColor: '#a15541', // Couleur marron pour la reliure
    borderRadius: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 4,
    zIndex: 1,
  },
});

