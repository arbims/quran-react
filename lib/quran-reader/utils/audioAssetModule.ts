import { NativeModules } from 'react-native';

// Essayer différentes façons d'accéder au module Android
let AudioAssetModule: any = null;

// Méthode 1: Accès direct
AudioAssetModule = NativeModules.AudioAssetModule;

// Méthode 2: Si la méthode 1 ne fonctionne pas, essayer avec le nom complet
if (!AudioAssetModule) {
  const allModules = Object.keys(NativeModules);
  const audioModule = allModules.find(name => name.includes('Audio') || name.includes('Asset'));
  if (audioModule) {
    AudioAssetModule = NativeModules[audioModule];
  } else {
    console.warn('⚠️ Module AudioAssetModule non trouvé. Utilisez "npm run android".');
  }
}

interface AudioAssetModuleInterface {
  copyAssetToFiles(assetFileName: string): Promise<string>;
  getFilesDirectory(): Promise<string>;
}

export const audioAssetModule: AudioAssetModuleInterface | null = AudioAssetModule ?? null;

