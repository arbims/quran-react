// Mapping statique des fichiers audio
// Les fichiers doivent être dans assets/mp3/ dans le projet source
// et accessibles via require()

const audioAssets: Record<string, any> = {
  '002': require('../../../assets/mp3/002.mp3'),
  '458': require('../../../assets/mp3/458.mp3'),
  '459': require('../../../assets/mp3/459.mp3'),
  '460': require('../../../assets/mp3/460.mp3'),
  '461': require('../../../assets/mp3/461.mp3'),
  '462': require('../../../assets/mp3/462.mp3'),
  '463': require('../../../assets/mp3/463.mp3'),
  '464': require('../../../assets/mp3/464.mp3'),
  '465': require('../../../assets/mp3/465.mp3'),
  '466': require('../../../assets/mp3/466.mp3'),
  // Ajoutez d'autres fichiers audio ici au fur et à mesure
  // '003': require('../../../assets/mp3/003.mp3'),
  // '004': require('../../../assets/mp3/004.mp3'),
  // etc.
};

export const getAudioAsset = (pageNumber: number): any | null => {
  const formattedPage = pageNumber.toString().padStart(3, '0');
  return audioAssets[formattedPage] || null;
};

export const hasAudioAsset = (pageNumber: number): boolean => {
  const formattedPage = pageNumber.toString().padStart(3, '0');
  return formattedPage in audioAssets;
};
