import { getQuranPageSource, surahStartPages } from './data';
import { QuranPage, Surah } from './types';

// Generate allQuranPages array - une seule entrée par page unique
export const generateAllQuranPages = (): QuranPage[] => {
  const surahs = require('@/data/surahs').surahs;
  
  // Créer un mapping page -> liste de sourates
  const pageToSurahs: { [pageNum: number]: number[] } = {};
  
  for (const surah of surahs) {
    const startPage = surahStartPages[surah.id];
    if (!startPage) continue;
    
    // Pour chaque page de cette sourate
    for (let i = 0; i < surah.pages; i++) {
      const pageNum = startPage + i;
      if (pageNum >= 2 && pageNum <= 604) {
        if (!pageToSurahs[pageNum]) {
          pageToSurahs[pageNum] = [];
        }
        if (!pageToSurahs[pageNum].includes(surah.id)) {
          pageToSurahs[pageNum].push(surah.id);
        }
      }
    }
  }
  
  // Créer le tableau final avec une seule entrée par page
  // Inclure TOUTES les pages de 2 à 604, même si elles ne sont pas couvertes par une sourate
  const pages: QuranPage[] = [];
  for (let pageNum = 2; pageNum <= 604; pageNum++) {
    pages.push({
      number: pageNum,
      source: getQuranPageSource(pageNum),
      surahs: pageToSurahs[pageNum] ? pageToSurahs[pageNum].sort((a, b) => a - b) : []
    });
  }
  
  return pages;
};

export const allQuranPages = generateAllQuranPages();

// Inverser l'ordre des pages pour inverser le swipe (sans changer la logique de navigation)
export const reversedQuranPages = [...allQuranPages].reverse();

// Helper: Trouver l'index de la page pour une sourate donnée (dans le tableau inversé)
export const findPageIndexForSurah = (surahId: number): number => {
  const startPage = surahStartPages[surahId];
  if (!startPage) return -1;
  
  const originalIndex = allQuranPages.findIndex(p => p.number === startPage);
  // Convertir l'index original en index inversé
  if (originalIndex === -1) return -1;
  return reversedQuranPages.length - 1 - originalIndex;
};

// Helper: Trouver la sourate actuelle basée sur le numéro de page
export const getCurrentSurah = (currentPage: number): Surah | null => {
  const surahs: Surah[] = require('@/data/surahs').surahs;
  
  // D'abord, vérifier si une sourate commence exactement à cette page
  const surahStartingAtPage = surahs.find((s) => {
    return surahStartPages[s.id] === currentPage;
  });
  if (surahStartingAtPage) {
    return surahStartingAtPage;
  }
  
  // Trouver la page actuelle dans allQuranPages pour obtenir les sourates
  const currentPageData = allQuranPages.find(p => p.number === currentPage);
  if (currentPageData && currentPageData.surahs.length > 0) {
    // Si plusieurs sourates sont sur cette page, prendre la plus récente (ID le plus élevé)
    // car c'est généralement celle qui est en cours
    const sortedSurahIds = currentPageData.surahs.sort((a, b) => b - a);
    const surahId = sortedSurahIds[0];
    return surahs.find((s) => s.id === surahId) || null;
  }
  
  // Si la page n'a pas de sourate associée, trouver la dernière sourate qui commence avant ou à cette page
  let lastSurah = null;
  for (const surah of surahs) {
    const startPage = surahStartPages[surah.id];
    if (startPage && startPage <= currentPage) {
      const endPage = startPage + surah.pages - 1;
      // Si la page actuelle est dans cette sourate ou juste après
      if (currentPage <= endPage + 1) {
        lastSurah = surah;
      }
    }
  }
  
  return lastSurah;
};

