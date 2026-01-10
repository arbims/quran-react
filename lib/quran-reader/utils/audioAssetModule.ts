import { NativeModules, Platform } from 'react-native';

// Essayer différentes façons d'accéder au module
let AudioAssetModule: any = null;

if (Platform.OS === 'android') {
  // Méthode 1: Accès direct
  AudioAssetModule = NativeModules.AudioAssetModule;
  
  // Méthode 2: Si la méthode 1 ne fonctionne pas, essayer avec le nom complet
  if (!AudioAssetModule) {
    const allModules = Object.keys(NativeModules);
    console.log('🔍 Tous les modules natifs disponibles:', allModules);
    console.log('🔍 Nombre de modules:', allModules.length);
    
    // Chercher un module qui contient "Audio" dans son nom
    const audioModule = allModules.find(name => name.includes('Audio') || name.includes('Asset'));
    if (audioModule) {
      console.log('✅ Module audio trouvé:', audioModule);
      AudioAssetModule = NativeModules[audioModule];
    } else {
      console.warn('⚠️ Module AudioAssetModule non trouvé dans les modules natifs');
      console.warn('⚠️ Cela signifie que le module natif n\'est pas compilé ou enregistré correctement');
      console.warn('⚠️ Assurez-vous d\'utiliser "npm run android" et non "npm start"');
    }
  } else {
    console.log('✅ AudioAssetModule trouvé directement');
  }
  
  console.log('📦 AudioAssetModule final:', AudioAssetModule ? 'DISPONIBLE' : 'NON DISPONIBLE');
}

interface AudioAssetModuleInterface {
  copyAssetToFiles(assetFileName: string): Promise<string>;
  getFilesDirectory(): Promise<string>;
}

export const audioAssetModule: AudioAssetModuleInterface | null = 
  Platform.OS === 'android' && AudioAssetModule ? AudioAssetModule : null;

