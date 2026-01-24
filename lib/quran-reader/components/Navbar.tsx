import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
  if (!visible) return null;

  // Debug: vérifier que pageSide est bien passé
  React.useEffect(() => {
    console.log('Navbar - currentPage:', currentPage, 'pageSide:', pageSide);
  }, [currentPage, pageSide]);

  return (
    <LinearGradient
      colors={['#3F5FE8', '#5B7FFF', '#3F5FE8']} // Dégradé bleu clair
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.navbar, { 
        paddingTop: isLandscape ? Math.max(insets.top, 8) + 4 : insets.top + 4,
        paddingBottom: isLandscape ? Math.max(insets.bottom, 8) + 4 : 6,
        minHeight: isLandscape ? 40 : 44,
        paddingRight: isLandscape ? Math.max(insets.right, 8) : 12,
        paddingLeft: isLandscape ? Math.max(insets.left, 8) : 12
      }]}
    >
      <View style={styles.navbarLeft}>
        <Text style={styles.navbarPageNumber}>صفحة {currentPage}</Text>
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
        </View>
        
        {/* Badges avec hauteur fixe pour éviter le mouvement */}
        <View style={styles.badgesContainer}>
          {currentPage === lastReadPage ? (
            <Ionicons name="bookmark" size={20} color="#FFFFFF" />
          ) : (
            <View style={styles.badgePlaceholder} />
          )}
          {currentPage === hifdhPage ? (
            <Ionicons name="school" size={20} color="#FFFFFF" />
          ) : (
            <View style={styles.badgePlaceholder} />
          )}
        </View>
      </View>
      <View style={styles.navbarRight}>
        {currentSurah && (
          <Text style={styles.navbarTitle} numberOfLines={1}>{currentSurah.name_ar}</Text>
        )}
      </View>
      <TouchableOpacity onPress={onToggleMenu} style={styles.menuButton} activeOpacity={0.7}>
        <Ionicons name="menu" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </LinearGradient>
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
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    direction: 'ltr',
    borderBottomWidth: 2,
    borderBottomColor: '#FFFFFF',
  },
  menuButton: {
    padding: 8,
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: '#FFFFFF',
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
    justifyContent: 'center',
    paddingHorizontal: 8,
    height: 40,
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
  badgesContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8, 
    marginTop: 2,
    height: 20,
  },
  badgePlaceholder: {
    width: 20,
    height: 20,
  },
  bookContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    height: 20,
  },
  bookPage: {
    width: 24,
    height: 18,
    backgroundColor: '#F5F5DC', // Couleur crème pour les pages
    borderWidth: 1,
    borderColor: 'rgba(200, 180, 150, 0.8)',
    borderRadius: 3,
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
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1.5,
    shadowColor: '#FFFFFF',
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
    backgroundColor: 'rgba(200, 180, 150, 0.3)',
    marginHorizontal: 1,
  },
  bookLineActive: {
    backgroundColor: 'rgba(100, 80, 60, 0.5)',
    height: 1.5,
  },
  bookSpineContainer: {
    width: 3,
    height: 18,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookSpineShadow: {
    position: 'absolute',
    width: 4,
    height: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 1,
  },
  bookSpine: {
    width: 3,
    height: 18,
    backgroundColor: '#8B4513', // Couleur marron pour la reliure
    borderRadius: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 4,
    zIndex: 1,
  },
});

