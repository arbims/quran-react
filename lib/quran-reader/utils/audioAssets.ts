// Mapping statique des fichiers audio locaux
// NOTE: Ce fichier est utilisé pour la compatibilité avec les assets locaux
// Si vous utilisez Google Drive (USE_GOOGLE_DRIVE = true), ce mapping sera vide
// et les fichiers seront téléchargés depuis Google Drive au lieu d'être inclus dans l'app

// Mapping vide par défaut - les fichiers audio seront téléchargés depuis Google Drive
// Si vous voulez utiliser des assets locaux, ajoutez-les ici:
// const audioAssets: Record<string, any> = {
//   '002': require('../../../assets/mp3/002.mp3'),
//   // etc.
// };

const audioAssets: Record<string, any> = {
  // Mapping vide - utilisez Google Drive ou le serveur distant
};

export const getAudioAsset = (pageNumber: number): any | null => {
  const formattedPage = pageNumber.toString().padStart(3, '0');
  return audioAssets[formattedPage] || null;
};

export const hasAudioAsset = (pageNumber: number): boolean => {
  const formattedPage = pageNumber.toString().padStart(3, '0');
  return formattedPage in audioAssets && audioAssets[formattedPage] !== undefined;
};
