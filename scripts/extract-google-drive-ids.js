/**
 * Script pour extraire les IDs Google Drive depuis un dossier public
 * 
 * UTILISATION SIMPLE (Méthode manuelle - Recommandée):
 * 1. Ouvrez votre dossier: https://drive.google.com/drive/folders/11LMFDL2aaecrRTFtAPGpmGiCUKBHQV8u
 * 2. Pour chaque fichier, cliquez dessus et copiez l'ID depuis l'URL
 * 3. Suivez les instructions ci-dessous
 * 
 * UTILISATION AVEC API (Optionnel - Nécessite une clé API Google):
 * 1. Allez sur https://console.cloud.google.com/
 * 2. Créez un projet (ou utilisez un existant)
 * 3. Activez l'API Google Drive
 * 4. Créez une clé API (Pas besoin d'OAuth pour les dossiers publics)
 * 5. Remplacez YOUR_API_KEY ci-dessous par votre clé API
 * 6. Exécutez: node scripts/extract-google-drive-ids.js
 */

const GOOGLE_DRIVE_FOLDER_ID = '11LMFDL2aaecrRTFtAPGpmGiCUKBHQV8u';
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || 'YOUR_API_KEY'; // Remplacer par votre clé API ou utiliser une variable d'environnement

// Méthode 1: Utiliser l'API Google Drive (nécessite googleapis)
async function extractWithAPI() {
  try {
    const { google } = require('googleapis');
    const drive = google.drive({ version: 'v3', auth: null }); // Pas d'authentification pour les dossiers publics
    
    // Pour un dossier public, nous devons utiliser une approche différente
    // car l'API nécessite une authentification. Utilisons plutôt fetch avec l'API publique
    
    console.log('⚠️ L\'API Google Drive nécessite une authentification.');
    console.log('⚠️ Utilisez plutôt la méthode manuelle ou configurez l\'API.');
    console.log('');
    console.log('MÉTHODE MANUELLE (Recommandée):');
    console.log('1. Ouvrez votre dossier Google Drive:');
    console.log(`   https://drive.google.com/drive/folders/${GOOGLE_DRIVE_FOLDER_ID}`);
    console.log('2. Pour chaque fichier audio:');
    console.log('   - Clic droit sur le fichier → "Obtenir le lien de partage"');
    console.log('   - Assurez-vous que le fichier est accessible publiquement');
    console.log('   - Copiez le lien qui ressemble à:');
    console.log('     https://drive.google.com/file/d/1a2b3c4d5e6f7g8h9i0j/view?usp=sharing');
    console.log('   - L\'ID est la partie entre /d/ et /view');
    console.log('   - Exemple: 1a2b3c4d5e6f7g8h9i0j');
    console.log('3. Ajoutez les IDs dans lib/quran-reader/utils/googleDriveMapping.ts');
    console.log('');
    console.log('MÉTHODE AUTOMATIQUE (Alternative avec API):');
    console.log('Vous pouvez utiliser une requête directe vers l\'API Google Drive avec une clé API:');
    console.log(`https://www.googleapis.com/drive/v3/files?q="'${GOOGLE_DRIVE_FOLDER_ID}'+in+parents"&key=YOUR_API_KEY`);
    console.log('');
    console.log('FORMAT ATTENDU dans googleDriveMapping.ts:');
    console.log('');
    console.log('export const GOOGLE_DRIVE_FILE_ID_MAP: Record<number, string> = {');
    console.log('  2: "ID_DE_002_MP3",    // Pour 002.mp3');
    console.log('  458: "ID_DE_458_MP3",  // Pour 458.mp3');
    console.log('  459: "ID_DE_459_MP3",  // Pour 459.mp3');
    console.log('  // etc.');
    console.log('};');
    
    return null;
  } catch (error) {
    console.error('Erreur:', error.message);
    console.log('\nUtilisez la méthode manuelle décrite ci-dessus.');
    return null;
  }
}

// Méthode 2: Utiliser fetch pour les dossiers publics avec API Key
async function extractWithFetch() {
  if (GOOGLE_API_KEY === 'YOUR_API_KEY') {
    console.log('⚠️ Clé API non configurée. Utilisez la méthode manuelle ci-dessous.');
    return null;
  }
  
  try {
    console.log('🔄 Tentative d\'extraction avec l\'API Google Drive...\n');
    
    const url = `https://www.googleapis.com/drive/v3/files?q="${GOOGLE_DRIVE_FOLDER_ID}"+in+parents+and+trashed=false&fields=files(id,name)&key=${GOOGLE_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('403 Forbidden: Vérifiez votre clé API ou activez l\'API Google Drive dans Google Cloud Console');
      } else if (response.status === 400) {
        throw new Error('400 Bad Request: Vérifiez l\'ID du dossier');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.files && data.files.length > 0) {
      console.log(`✅ ${data.files.length} fichier(s) trouvé(s) dans le dossier Google Drive:\n`);
      const mapping = {};
      
      data.files.forEach(file => {
        // Extraire le numéro de page du nom de fichier (ex: "Audio**002.mp3**" ou "002.mp3")
        const pageMatch = file.name.match(/(\d{3})\.mp3/i);
        if (pageMatch) {
          const pageNumber = parseInt(pageMatch[1], 10);
          mapping[pageNumber] = file.id;
          console.log(`  ${pageNumber}: '${file.id}', // ${file.name}`);
        } else {
          console.log(`  ⚠️  Fichier ignoré (format non reconnu): ${file.name}`);
        }
      });
      
      if (Object.keys(mapping).length > 0) {
        console.log('\n📋 Copiez ceci dans lib/quran-reader/utils/googleDriveMapping.ts:\n');
        console.log('export const GOOGLE_DRIVE_FILE_ID_MAP: Record<number, string> = {');
        Object.keys(mapping).sort((a, b) => parseInt(a) - parseInt(b)).forEach(page => {
          console.log(`  ${page}: '${mapping[page]}',`);
        });
        console.log('};');
      } else {
        console.log('\n⚠️  Aucun fichier audio reconnu dans le format attendu (XXX.mp3)');
      }
      
      return mapping;
    } else {
      console.log('⚠️  Aucun fichier trouvé dans le dossier.');
      return null;
    }
  } catch (error) {
    console.error(`\n❌ Erreur lors de l'extraction avec l'API: ${error.message}`);
    console.log('\n⚠️  Utilisez la méthode manuelle décrite ci-dessous.');
    return null;
  }
}

// Exécuter le script
(async () => {
  console.log('📥 Extraction des IDs Google Drive depuis le dossier public...\n');
  console.log(`📁 Dossier ID: ${GOOGLE_DRIVE_FOLDER_ID}\n`);
  
  // Essayer d'abord avec fetch (pour les dossiers publics)
  const result = await extractWithFetch();
  
  if (!result) {
    // Si ça échoue, afficher les instructions manuelles
    await extractWithAPI();
  }
})();

