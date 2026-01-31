import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import { AUDIO_DOWNLOAD_PREFERENCE_KEY, AUDIO_ZIP_FILENAME, AUDIO_ZIP_DOWNLOAD_URL } from '../constants';

/**
 * Import dynamique de react-native-zip-archive pour éviter l'erreur NativeEventEmitter
 * sur le web (react-native-web n'implémente pas cette API native).
 */
const getUnzip = async () => {
  if (Platform.OS === 'web') {
    throw new Error('L\'extraction du fichier ZIP n\'est pas supportée sur le web. Utilisez l\'application sur iOS ou Android.');
  }
  const { unzip } = await import('react-native-zip-archive');
  return unzip;
};

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
 * Récupère l'URL du fichier ZIP
 * Utilise uniquement AUDIO_ZIP_DOWNLOAD_URL (Dropbox recommandé)
 */
export const getZipDownloadUrl = (): string => {
  // L'URL de téléchargement doit être configurée dans constants.ts
  if (!AUDIO_ZIP_DOWNLOAD_URL) {
    throw new Error('AUDIO_ZIP_DOWNLOAD_URL n\'est pas configuré dans constants.ts. Veuillez configurer une URL de téléchargement (Dropbox recommandé).');
  }
  
  console.log('📥 Utilisation de l\'URL de téléchargement configurée (Dropbox)');
  return AUDIO_ZIP_DOWNLOAD_URL;
};

/**
 * Vérifie si le fichier ZIP est déjà téléchargé et valide
 */
export const isZipCached = async (): Promise<boolean> => {
  try {
    const zipUri = getCachedZipUri();
    const fileInfo = await FileSystem.getInfoAsync(zipUri);
    
    // Vérifier que le fichier existe et n'est pas vide
    if (!fileInfo.exists || fileInfo.isDirectory) {
      return false;
    }
    
    // Vérifier que le fichier a une taille valide (au moins 1 KB)
    if (!fileInfo.size || fileInfo.size < 1024) {
      console.warn('⚠️ Le fichier ZIP en cache est invalide (trop petit), suppression...');
      await FileSystem.deleteAsync(zipUri, { idempotent: true });
      return false;
    }
    
    return true;
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
    
    console.log('📥 Téléchargement du fichier ZIP depuis:', remoteUrl);
    
    // Supprimer le fichier existant s'il est invalide
    const existingFile = await FileSystem.getInfoAsync(zipUri);
    if (existingFile.exists && (!existingFile.size || existingFile.size < 1024)) {
      console.log('🗑️ Suppression du fichier ZIP invalide existant...');
      await FileSystem.deleteAsync(zipUri, { idempotent: true });
    }
    
    // Utiliser l'URL directement (Dropbox ou autre service)
    // Plus besoin de gérer Google Drive car on utilise uniquement l'URL configurée
    const finalDownloadUrl = remoteUrl;
    console.log('📥 URL de téléchargement direct configurée, démarrage immédiat');
    
    // Télécharger avec FileSystem.createDownloadResumable
    console.log('📥 Démarrage du téléchargement depuis:', finalDownloadUrl);
    let lastLoggedProgress = -1;
    
    const downloadResumable = FileSystem.createDownloadResumable(
      finalDownloadUrl,
      zipUri,
      {},
      (downloadProgress) => {
        const writtenMB = downloadProgress.totalBytesWritten / 1024 / 1024;
        const expectedMB = downloadProgress.totalBytesExpectedToWrite / 1024 / 1024;
        
        if (downloadProgress.totalBytesExpectedToWrite > 0) {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          if (onProgress) {
            onProgress(progress);
          }
          
          // Log tous les 5% ou tous les 10 MB
          const progressPercent = Math.floor(progress * 100 / 5) * 5;
          if (progressPercent !== lastLoggedProgress || writtenMB % 10 < 0.1) {
            console.log(`📥 Progression: ${(progress * 100).toFixed(1)}% (${writtenMB.toFixed(2)} MB / ${expectedMB.toFixed(2)} MB)`);
            lastLoggedProgress = progressPercent;
          }
        } else {
          // Si on ne connaît pas la taille totale, afficher ce qui a été téléchargé
          if (onProgress) {
            onProgress(0.5); // Estimer à 50% si on ne connaît pas la taille
          }
          // Log tous les 10 MB téléchargés
          if (Math.floor(writtenMB / 10) !== lastLoggedProgress) {
            console.log(`📥 Téléchargement en cours: ${writtenMB.toFixed(2)} MB (taille totale inconnue)`);
            lastLoggedProgress = Math.floor(writtenMB / 10);
          }
        }
      }
    );
    
    const result = await downloadResumable.downloadAsync();
    
    if (!result || !result.uri) {
      throw new Error('Échec du téléchargement: URI non disponible');
    }
    
    // Vérifier que le fichier a été écrit correctement
    const fileInfo = await FileSystem.getInfoAsync(result.uri);
    if (!fileInfo.exists || !fileInfo.size || fileInfo.size === 0) {
      throw new Error('Le fichier téléchargé est vide ou n\'a pas été écrit correctement');
    }
    
    // Vérifier que le fichier a une taille raisonnable (au moins 1 MB pour un ZIP)
    if (fileInfo.size < 1024 * 1024) {
      console.error(`❌ Le fichier téléchargé est trop petit: ${(fileInfo.size / 1024).toFixed(2)} KB`);
      
      // Vérifier si c'est une page HTML (confirmation Google Drive)
      try {
        const content = await FileSystem.readAsStringAsync(result.uri, {
          encoding: FileSystem.EncodingType.UTF8,
          length: 500, // Lire les 500 premiers caractères
        });
        
        if (content.includes('<html') || content.includes('<!DOCTYPE') || content.includes('Google Drive')) {
          console.error('❌ Google Drive a retourné une page HTML au lieu du fichier ZIP');
          await FileSystem.deleteAsync(result.uri, { idempotent: true });
          throw new Error('Google Drive bloque le téléchargement direct de ce fichier (663 MB). Pour les gros fichiers, Google Drive nécessite une confirmation manuelle. Veuillez télécharger le fichier manuellement depuis Google Drive et le placer dans le cache de l\'application, ou utilisez un service de stockage alternatif (Dropbox, OneDrive, etc.) qui permet le téléchargement direct.');
        }
      } catch (readError) {
        // Ignorer les erreurs de lecture
      }
      
      await FileSystem.deleteAsync(result.uri, { idempotent: true });
      throw new Error('Le fichier téléchargé est trop petit pour être un ZIP valide. Google Drive bloque probablement le téléchargement direct. Veuillez vérifier que le fichier est bien partagé publiquement ou utilisez un service de stockage alternatif.');
    }
    
    console.log(`✅ Fichier ZIP téléchargé avec succès: ${(fileInfo.size / 1024 / 1024).toFixed(2)} MB`);
    
    // Vérifier les premiers bytes pour s'assurer que c'est un ZIP
    try {
      const firstBytes = await FileSystem.readAsStringAsync(result.uri, {
        encoding: FileSystem.EncodingType.Base64,
        length: 4,
        position: 0,
      });
      // La signature ZIP commence par "PK" = "UEs" en base64
      if (!firstBytes.startsWith('UEs')) {
        console.warn('⚠️ Le fichier ne commence pas par la signature ZIP standard');
        // On continue quand même
      }
    } catch (verifyError) {
      console.warn('⚠️ Impossible de vérifier la signature ZIP:', verifyError);
    }
    
    if (onProgress) {
      onProgress(1.0);
    }
    
    return result.uri;
  } catch (error: any) {
    console.error('❌ Erreur lors du téléchargement du fichier ZIP:', error);
    // Supprimer le fichier partiel en cas d'erreur
    try {
      const zipUri = getCachedZipUri();
      await FileSystem.deleteAsync(zipUri, { idempotent: true });
    } catch (deleteError) {
      // Ignorer les erreurs de suppression
    }
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
    
    // Vérifier si le ZIP existe et est valide
    const zipInfo = await FileSystem.getInfoAsync(zipUri);
    if (!zipInfo.exists) {
      throw new Error('Le fichier ZIP n\'existe pas. Veuillez d\'abord télécharger le ZIP.');
    }
    
    // Vérifier que le fichier n'est pas vide ou trop petit
    if (!zipInfo.size || zipInfo.size < 1024) {
      console.error('❌ Le fichier ZIP est invalide (trop petit ou vide), suppression...');
      await FileSystem.deleteAsync(zipUri, { idempotent: true });
      throw new Error('Le fichier ZIP téléchargé est invalide. Veuillez réessayer le téléchargement.');
    }
    
    try {
      console.log('📦 Lecture du fichier ZIP...');
      
      // Vérifier d'abord la taille du fichier
      const zipInfo = await FileSystem.getInfoAsync(zipUri);
      if (zipInfo.exists && zipInfo.size) {
        console.log(`📦 Taille du fichier ZIP: ${(zipInfo.size / 1024 / 1024).toFixed(2)} MB`);
        
        // Si le fichier est très petit (< 1 KB), c'est probablement une page HTML d'erreur
        if (zipInfo.size < 1024) {
          throw new Error('Le fichier téléchargé est trop petit pour être un ZIP valide. Vérifiez que le fichier Google Drive est bien partagé publiquement et que l\'ID est correct.');
        }
      }
      
      // Utiliser react-native-zip-archive pour décompresser sans charger tout en mémoire
      // Cette bibliothèque utilise du code natif et peut gérer les gros fichiers efficacement
      console.log('📦 Décompression du fichier ZIP avec react-native-zip-archive...');
      console.log(`📦 Extraction vers: ${audioDir}`);
      
      try {
        // react-native-zip-archive décompresse directement depuis le fichier
        // sans charger tout en mémoire (import dynamique pour éviter NativeEventEmitter sur web)
        const unzip = await getUnzip();
        await unzip(zipUri, audioDir);
        
        // Vérifier combien de fichiers .mp3 ont été extraits
        const files = await FileSystem.readDirectoryAsync(audioDir);
        const mp3Files = files.filter(file => file.endsWith('.mp3'));
        
        console.log(`✅ ${mp3Files.length} fichiers audio extraits avec succès`);
        
        if (mp3Files.length === 0) {
          throw new Error('Aucun fichier .mp3 trouvé dans le ZIP après extraction');
        }
      } catch (unzipError: any) {
        console.error('❌ Erreur lors de la décompression avec react-native-zip-archive:', unzipError);
        throw new Error(`Erreur lors de la décompression: ${unzipError.message || 'Erreur inconnue'}`);
      }
    } catch (extractError: any) {
      console.error('❌ Erreur lors de la décompression du ZIP:', extractError);
      throw new Error(`Erreur lors de la décompression: ${extractError.message || 'Erreur inconnue'}`);
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

