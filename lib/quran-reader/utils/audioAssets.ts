// Mapping statique des fichiers audio locaux
// NOTE: Ce fichier est utilisé pour la compatibilité avec les assets locaux
// Par défaut, les fichiers audio sont téléchargés depuis Dropbox (configuré dans constants.ts)
// Si vous voulez utiliser des assets locaux, ajoutez-les ici:
// const audioAssets: Record<string, any> = {
//   '002': require('../../../assets/mp3/002.mp3'),
//   // etc.
// };

const audioAssets: Record<string, any> = {
  // Mapping vide - les fichiers audio sont téléchargés depuis Dropbox
};

export const getAudioAsset = (pageNumber: number): any | null => {
  const formattedPage = pageNumber.toString().padStart(3, '0');
  return audioAssets[formattedPage] || null;
};

export const hasAudioAsset = (pageNumber: number): boolean => {
  const formattedPage = pageNumber.toString().padStart(3, '0');
  return formattedPage in audioAssets && audioAssets[formattedPage] !== undefined;
};
