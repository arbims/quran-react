import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { AUDIO_DOWNLOAD_PREFERENCE_KEY, GOOGLE_DRIVE_ZIP_FILE_ID, AUDIO_ZIP_FILENAME } from '../constants';

export type AudioDownloadPreference = 'never' | 'ask' | 'always';

/**
 * Récupère la préférence de téléchargement de l'utilisateur
 */
export const getAudioDownloadPreference = async (): Promise<AudioDownloadPreference> => {
  try {
    const preference = await AsyncStorage.getItem(AUDIO_DOWNLOAD_PREFERENCE_KEY);
    return (preference as AudioDownloadPreference) || 'ask'; // Par défaut, demander
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de la préférence:', error);
    return 'ask';
  }
};

/**
 * Définit la préférence de téléchargement de l'utilisateur
 */
export const setAudioDownloadPreference = async (preference: AudioDownloadPreference): Promise<void> => {
  try {
    await AsyncStorage.setItem(AUDIO_DOWNLOAD_PREFERENCE_KEY, preference);
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde de la préférence:', error);
  }
};

/**
 * Vérifie si un fichier audio est déjà téléchargé en cache
 */
export const isAudioFileCached = async (pageNumber: number): Promise<boolean> => {
  try {
    const formattedPage = pageNumber.toString().padStart(3, '0');
    const fileName = `${formattedPage}.mp3`;
    const fileUri = `${FileSystem.cacheDirectory}audio/${fileName}`;
    
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    return fileInfo.exists && !fileInfo.isDirectory;
  } catch (error) {
    console.error('❌ Erreur lors de la vérification du cache:', error);
    return false;
  }
};

/**
 * Récupère l'URI du fichier audio en cache
 */
export const getCachedAudioUri = (pageNumber: number): string => {
  const formattedPage = pageNumber.toString().padStart(3, '0');
  const fileName = `${formattedPage}.mp3`;
  return `${FileSystem.cacheDirectory}audio/${fileName}`;
};

const getGoogleDriveDownloadUrl = (fileId: string): string => {
  return `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
};

export const downloadAudioFile = async (
  pageNumber: number,
  onProgress?: (progress: number) => void
): Promise<string> => {
  await downloadAndExtractAudioZip(onProgress);
  return getCachedAudioUri(pageNumber);
};

/**
 * Supprime un fichier audio du cache
 */
export const deleteCachedAudioFile = async (pageNumber: number): Promise<void> => {
  try {
    const localUri = getCachedAudioUri(pageNumber);
    const fileInfo = await FileSystem.getInfoAsync(localUri);
    
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(localUri, { idempotent: true });
      console.log('🗑️ Fichier audio supprimé du cache:', localUri);
    }
  } catch (error) {
    console.error('❌ Erreur lors de la suppression du fichier audio:', error);
  }
};

/**
 * Obtient la taille du cache audio en bytes
 */
export const getAudioCacheSize = async (): Promise<number> => {
  try {
    const audioDir = `${FileSystem.cacheDirectory}audio/`;
    const dirInfo = await FileSystem.getInfoAsync(audioDir);
    
    if (!dirInfo.exists) {
      return 0;
    }
    
    // Récupérer tous les fichiers dans le répertoire
    const files = await FileSystem.readDirectoryAsync(audioDir);
    let totalSize = 0;
    
    for (const file of files) {
      const fileUri = `${audioDir}${file}`;
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists && !fileInfo.isDirectory && fileInfo.size) {
        totalSize += fileInfo.size;
      }
    }
    
    return totalSize;
  } catch (error) {
    console.error('❌ Erreur lors du calcul de la taille du cache:', error);
    return 0;
  }
};

/**
 * Supprime tous les fichiers audio du cache
 */
export const clearAudioCache = async (): Promise<void> => {
  try {
    const audioDir = `${FileSystem.cacheDirectory}audio/`;
    const dirInfo = await FileSystem.getInfoAsync(audioDir);
    
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(audioDir, { idempotent: true });
      console.log('🗑️ Cache audio supprimé');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la suppression du cache:', error);
  }
};

/**
 * Récupère l'URI du fichier ZIP en cache
 */
export const getCachedZipUri = (): string => {
  return `${FileSystem.cacheDirectory}${AUDIO_ZIP_FILENAME}`;
};

/**
 * Récupère l'URL du fichier ZIP Google Drive
 */
export const getZipDownloadUrl = (): string => {
  return getGoogleDriveDownloadUrl(GOOGLE_DRIVE_ZIP_FILE_ID);
};

/**
 * Vérifie si le fichier ZIP est déjà téléchargé
 */
export const isZipCached = async (): Promise<boolean> => {
  try {
    const zipUri = getCachedZipUri();
    const fileInfo = await FileSystem.getInfoAsync(zipUri);
    return fileInfo.exists && !fileInfo.isDirectory;
  } catch (error) {
    console.error('❌ Erreur lors de la vérification du cache ZIP:', error);
    return false;
  }
};

/**
 * Vérifie si les fichiers audio sont extraits du ZIP
 */
export const areAudioFilesExtracted = async (): Promise<boolean> => {
  try {
    const audioDir = `${FileSystem.cacheDirectory}audio/`;
    const dirInfo = await FileSystem.getInfoAsync(audioDir);
    
    if (!dirInfo.exists) {
      return false;
    }
    
    // Vérifier si au moins un fichier .mp3 existe
    const files = await FileSystem.readDirectoryAsync(audioDir);
    const mp3Files = files.filter(file => file.endsWith('.mp3'));
    
    return mp3Files.length > 0;
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des fichiers extraits:', error);
    return false;
  }
};

/**
 * Télécharge le fichier ZIP contenant tous les fichiers audio
 */
export const downloadAudioZip = async (
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    const zipUri = getCachedZipUri();
    const remoteUrl = getZipDownloadUrl();
    
    console.log('📥 Téléchargement du fichier ZIP:', remoteUrl);
    
    // Télécharger le fichier ZIP avec suivi de progression
    const downloadResumable = FileSystem.createDownloadResumable(
      remoteUrl,
      zipUri,
      {},
      (downloadProgress) => {
        const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
        if (onProgress) {
          onProgress(progress);
        }
      }
    );
    
    const result = await downloadResumable.downloadAsync();
    
    if (!result || !result.uri) {
      throw new Error('Échec du téléchargement: URI non disponible');
    }
    
    console.log('✅ Fichier ZIP téléchargé avec succès:', result.uri);
    return result.uri;
  } catch (error: any) {
    console.error('❌ Erreur lors du téléchargement du fichier ZIP:', error);
    throw new Error(`Erreur lors du téléchargement du ZIP: ${error.message || 'Erreur inconnue'}`);
  }
};

export const extractAudioZip = async (): Promise<void> => {
  try {
    const zipUri = getCachedZipUri();
    const audioDir = `${FileSystem.cacheDirectory}audio/`;
    
    // Créer le répertoire audio s'il n'existe pas
    const dirInfo = await FileSystem.getInfoAsync(audioDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(audioDir, { intermediates: true });
    }
    
    // Vérifier si le ZIP existe
    const zipInfo = await FileSystem.getInfoAsync(zipUri);
    if (!zipInfo.exists) {
      throw new Error('Le fichier ZIP n\'existe pas. Veuillez d\'abord télécharger le ZIP.');
    }
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { unzip } = require('react-native-zip-archive');
      await unzip(zipUri, audioDir);
    } catch (importError: any) {
      if (importError.code === 'MODULE_NOT_FOUND' || importError.message?.includes('Cannot find module')) {
        throw new Error('react-native-zip-archive n\'est pas installé. Installez-le avec: npm install react-native-zip-archive');
      }
      throw importError;
    }
  } catch (error: any) {
    console.error('❌ Erreur lors de la décompression du ZIP:', error);
    throw error;
  }
};

export const downloadAndExtractAudioZip = async (
  onProgress?: (progress: number) => void
): Promise<void> => {
  try {
    // Vérifier si les fichiers sont déjà extraits
    const filesExtracted = await areAudioFilesExtracted();
    if (filesExtracted) {
      console.log('✅ Les fichiers audio sont déjà extraits');
      return;
    }
    
    // Vérifier si le ZIP est déjà téléchargé
    const zipCached = await isZipCached();
    
    if (!zipCached) {
      // Télécharger le ZIP
      console.log('📥 Téléchargement du fichier ZIP...');
      await downloadAudioZip((progress) => {
        // Convertir la progression du téléchargement (0-0.8) + extraction (0.8-1.0)
        if (onProgress) {
          onProgress(progress * 0.8); // 80% pour le téléchargement
        }
      });
    } else {
      console.log('✅ Le fichier ZIP est déjà téléchargé');
      if (onProgress) {
        onProgress(0.8); // 80% pour le téléchargement (déjà fait)
      }
    }
    
    // Décompresser le ZIP
    console.log('📦 Décompression du fichier ZIP...');
    await extractAudioZip();
    
    if (onProgress) {
      onProgress(1.0); // 100% terminé
    }
    
    console.log('✅ Fichiers audio téléchargés et extraits avec succès');
  } catch (error: any) {
    console.error('❌ Erreur lors du téléchargement et de l\'extraction du ZIP:', error);
    throw error;
  }
};

