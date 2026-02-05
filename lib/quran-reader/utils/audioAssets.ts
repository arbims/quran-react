// Mapping statique des fichiers audio locaux
// NOTE: Ce fichier est utilisé pour la compatibilité avec les assets locaux
// Par défaut, les fichiers audio sont téléchargés depuis Dropbox (configuré dans constants.ts)
// Si vous voulez utiliser des assets locaux, ajoutez-les ici:
// const audioAssets: Record<string, any> = {
//   '001': require('../../../assets/mp3/001.mp3'),
//   '002': require('../../../assets/mp3/002.mp3'),
//   // etc.
// };

const audioAssets: Record<string, any> = {
  // Mapping vide - les fichiers audio sont téléchargés depuis Dropbox
};

/** Numéro de sourate 1-114 → 001.mp3 ... 114.mp3 */
export const getAudioAsset = (surahNumber: number): any | null => {
  const formatted = surahNumber.toString().padStart(3, '0');
  return audioAssets[formatted] || null;
};

export const hasAudioAsset = (surahNumber: number): boolean => {
  const formatted = surahNumber.toString().padStart(3, '0');
  return formatted in audioAssets && audioAssets[formatted] !== undefined;
};
