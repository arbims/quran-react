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
}) => {
  if (!visible) return null;

  return (
    <LinearGradient
      colors={['#1a1a1a', '#2d2d2d', '#1a1a1a']} // Dégradé noir
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
        <View style={styles.badgesContainer}>
          {currentPage === lastReadPage && (
            <Ionicons name="bookmark" size={20} color="#FFFFFF" />
          )}
          {currentPage === hifdhPage && (
            <Ionicons name="school" size={20} color="#FFFFFF" />
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
    zIndex: 30,
    elevation: 8,
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
    marginTop: 2 
  },
});

