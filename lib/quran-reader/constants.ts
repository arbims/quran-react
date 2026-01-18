// Constantes pour le lecteur de Quran
export const HIFDH_KEY = 'HIFDH_PAGE';
export const LAST_READ_KEY = 'LAST_READ_PAGE';
export const SIDEBAR_WIDTH = 260;

export const ARABIC_FONT = 'NotoKufiArabic_400Regular';
export const AUDIO_DOWNLOAD_PREFERENCE_KEY = 'AUDIO_DOWNLOAD_PREFERENCE';
export const AUDIO_ZIP_FILENAME = 'audio.zip';

// URL de téléchargement direct du fichier ZIP
// ⚠️ OBLIGATOIRE : Cette URL doit être configurée pour que le téléchargement fonctionne
// 
// Options recommandées :
// 1. Dropbox (RECOMMANDÉ) : 
//    - Téléchargez audio.zip sur Dropbox
//    - Clic droit → Partager → Créer un lien
//    - Remplacez ?dl=0 par ?dl=1 dans le lien
//    - Exemple : 'https://www.dropbox.com/s/xxxxxxxxxxxxx/audio.zip?dl=1'
//
// 2. OneDrive : https://onedrive.live.com/download?cid=...&resid=...&authkey=...
//
// 3. Serveur web : https://votre-serveur.com/audio.zip
export const AUDIO_ZIP_DOWNLOAD_URL: string | null = 'https://www.dropbox.com/scl/fi/uy6twcxe2d0nj1e9xmqez/audio.zip?rlkey=4u59jf2j7gsvno2p9r6qawjt5&st=8v62lbac&dl=1'